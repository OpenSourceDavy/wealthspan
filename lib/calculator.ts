import type { FormData } from "./schema";

// ──────────────── 中国个税累进税率表（年度综合所得） ────────────────
const TAX_BRACKETS = [
  { upper: 36000, rate: 0.03, deduction: 0 },
  { upper: 144000, rate: 0.1, deduction: 2520 },
  { upper: 300000, rate: 0.2, deduction: 16920 },
  { upper: 420000, rate: 0.25, deduction: 31920 },
  { upper: 660000, rate: 0.3, deduction: 52920 },
  { upper: 960000, rate: 0.35, deduction: 85920 },
  { upper: Infinity, rate: 0.45, deduction: 181920 },
];

// 五险一金个人比例（典型值）
const PERSONAL_RATES = {
  pension: 0.08,
  medical: 0.02,
  unemployment: 0.005,
  housingFund: 0.07, // will be overridden by user input
};

// ──────────────── 工具函数 ────────────────

function calcAnnualTax(annualTaxableIncome: number): number {
  if (annualTaxableIncome <= 0) return 0;
  for (const b of TAX_BRACKETS) {
    if (annualTaxableIncome <= b.upper) {
      return annualTaxableIncome * b.rate - b.deduction;
    }
  }
  return 0;
}

function calcMonthlyDeductions(monthlyGross: number, socialBase: number, hfRate: number) {
  const base = Math.min(socialBase, monthlyGross);
  const pension = base * PERSONAL_RATES.pension;
  const medical = base * PERSONAL_RATES.medical;
  const unemployment = base * PERSONAL_RATES.unemployment;
  const housingFund = base * (hfRate / 100);
  return { pension, medical, unemployment, housingFund, total: pension + medical + unemployment + housingFund };
}

// 薪资增长曲线：在峰值年龄前按 raiseRate 增长，之后增长率逐步递减至 0
function projectSalary(startSalary: number, age: number, peakAge: number, retireAge: number, raiseRate: number): number[] {
  const years = retireAge - age;
  const salaries: number[] = [];
  let current = startSalary;
  for (let y = 0; y < years; y++) {
    salaries.push(current);
    const curAge = age + y;
    if (curAge < peakAge) {
      current *= 1 + raiseRate / 100;
    } else {
      const decay = Math.max(0, 1 - (curAge - peakAge) / (retireAge - peakAge));
      current *= 1 + (raiseRate / 100) * decay * 0.3;
    }
  }
  return salaries;
}

// ──────────────── 养老金估算（简化版中国城镇职工基本养老） ────────────────

function estimateMonthlyPension(
  avgSalary: number,
  socialBase: number,
  totalYears: number,
  personalAccountBalance: number,
  retireAge: number,
): number {
  // 基础养老金 = 退休时上年度社会平均工资 × (1 + 本人平均缴费指数) / 2 × 缴费年限 × 1%
  const avgIndex = Math.min(socialBase / avgSalary, 3);
  const basePension = avgSalary * (1 + avgIndex) / 2 * totalYears * 0.01;

  // 个人账户养老金 = 个人账户累计额 / 计发月数
  const divisorMap: Record<number, number> = { 50: 195, 55: 170, 60: 139, 65: 101 };
  const divisor = divisorMap[retireAge] ?? 139;
  const accountPension = personalAccountBalance / divisor;

  return basePension + accountPension;
}

// ──────────────── 主计算 ────────────────

export interface YearlySnapshot {
  age: number;
  grossIncome: number;     // 该年税前总收入
  tax: number;             // 该年个税
  netIncome: number;       // 税后到手
  savings: number;         // 该年新增储蓄
  totalWealth: number;     // 累计资产
  isRetired: boolean;
}

export interface RetirementAnalysis {
  requiredMonthlySpend: number;       // 退休后通胀调整后月开支
  monthlyPension: number;             // 每月基本养老金
  monthlyCommercialIns: number;       // 商业保险月收入
  monthlyGap: number;                 // 每月缺口（正=不够，负=有余）
  totalRetirementNeed: number;        // 退休期间总需求（现值）
  totalRetirementIncome: number;      // 退休期间总收入（养老金+保险）
  retirementGap: number;              // 缺口总额
  wealthAtRetirement: number;         // 退休时累计资产
  canRetire: boolean;                 // 资产是否覆盖缺口
  surplusOrDeficit: number;           // 盈余/缺口
  yearsOfFunding: number;             // 退休资产可支撑年数
}

export interface CalcResult {
  lifetimeGrossIncome: number;        // 一辈子税前总收入
  lifetimeTax: number;                // 一辈子总缴税
  lifetimeNetIncome: number;          // 一辈子税后总收入
  lifetimeSocialSecurity: number;     // 一辈子五险一金缴纳总额
  yearlySnapshots: YearlySnapshot[];  // 逐年快照
  retirement: RetirementAnalysis;     // 退休分析
}

export function calculate(data: FormData): CalcResult {
  const {
    age, retireAge, lifeExpectancy, gender,
    monthlyGross, bonusMonths, sideIncome, annualRaiseRate, incomePeakAge,
    socialSecurityBase, housingFundRate, socialSecurityYears, pensionAccountBalance,
    totalSavings, housingStatus, monthlyMortgage, mortgageYearsLeft, otherDebt,
    avgReturnRate3y, monthlySavingsRate, riskPreference,
    expectedMonthlySpend, hasCommercialInsurance, commercialInsuranceMonthly,
    expectedInflationRate,
  } = data;

  // 预期投资收益率（基于风险偏好和历史收益率调整）
  const riskMultiplier = riskPreference === "conservative" ? 0.6 : riskPreference === "balanced" ? 0.85 : 1.1;
  const investReturnRate = (avgReturnRate3y / 100) * riskMultiplier;

  const workingYears = retireAge - age;
  const retirementYears = lifeExpectancy - retireAge;
  const annualExemption = 60000; // 年度基本减除费用

  // 薪资曲线
  const salaryProjection = projectSalary(monthlyGross, age, incomePeakAge, retireAge, annualRaiseRate);

  // 逐年计算
  const snapshots: YearlySnapshot[] = [];
  let cumulativeWealth = totalSavings - otherDebt;
  let lifetimeGross = 0;
  let lifetimeTax = 0;
  let lifetimeNet = 0;
  let lifetimeSS = 0;
  let cumulativePensionAccount = pensionAccountBalance;
  let cumulativeSocialYears = socialSecurityYears;

  // 城市平均工资参考（用于养老金计算）
  const cityAvgSalary: Record<string, number> = {
    tier1: 13000, newTier1: 10000, tier2: 8000, tier3: 6000,
  };
  let localAvgSalary = cityAvgSalary[data.cityTier] ?? 8000;

  for (let y = 0; y < workingYears; y++) {
    const curAge = age + y;
    const monthlySalary = salaryProjection[y];
    const annualBase = monthlySalary * 12;
    const bonus = monthlySalary * bonusMonths;
    const annualSide = sideIncome * 12;
    const grossIncome = annualBase + bonus + annualSide;

    // 五险一金
    const ssBase = Math.max(socialSecurityBase, monthlySalary * 0.6);
    const deductions = calcMonthlyDeductions(monthlySalary, ssBase, housingFundRate);
    const annualDeductions = deductions.total * 12;
    lifetimeSS += annualDeductions;

    // 个人养老账户累计
    cumulativePensionAccount += deductions.pension * 12;
    cumulativeSocialYears += 1;

    // 个税
    const taxableIncome = Math.max(0, grossIncome - annualDeductions - annualExemption);
    const tax = calcAnnualTax(taxableIncome);

    const netIncome = grossIncome - annualDeductions - tax;

    // 储蓄 = 到手 × 储蓄率 - 房贷 - 其他固定支出
    const mortgageAnnual = (y < mortgageYearsLeft && (housingStatus === "owned_with_mortgage" || housingStatus === "renting"))
      ? monthlyMortgage * 12
      : 0;
    const annualSavings = netIncome * (monthlySavingsRate / 100) - mortgageAnnual;

    // 投资增值
    cumulativeWealth = cumulativeWealth * (1 + investReturnRate) + annualSavings;

    lifetimeGross += grossIncome;
    lifetimeTax += tax;
    lifetimeNet += netIncome;

    // 社平工资每年增长（估算3%）
    localAvgSalary *= 1.03;

    snapshots.push({
      age: curAge,
      grossIncome: Math.round(grossIncome),
      tax: Math.round(tax),
      netIncome: Math.round(netIncome),
      savings: Math.round(annualSavings),
      totalWealth: Math.round(cumulativeWealth),
      isRetired: false,
    });
  }

  // ──── 退休阶段 ────
  const monthlyPension = estimateMonthlyPension(
    localAvgSalary,
    socialSecurityBase,
    cumulativeSocialYears,
    cumulativePensionAccount,
    retireAge,
  );

  const monthlyCommIns = hasCommercialInsurance ? commercialInsuranceMonthly : 0;

  // 退休时通胀调整后的月开支
  const inflationFactor = Math.pow(1 + expectedInflationRate / 100, workingYears);
  const adjustedMonthlySpend = expectedMonthlySpend * inflationFactor;

  const monthlyGap = adjustedMonthlySpend - monthlyPension - monthlyCommIns;

  // 退休期间逐年快照
  const wealthAtRetirement = cumulativeWealth;
  let retirementWealth = wealthAtRetirement;

  // 退休后投资更保守
  const retirementReturnRate = investReturnRate * 0.5;

  let totalRetirementNeed = 0;
  let totalRetirementIncome = 0;

  for (let y = 0; y < retirementYears; y++) {
    const curAge = retireAge + y;
    const yearInflation = Math.pow(1 + expectedInflationRate / 100, y);
    const annualSpend = adjustedMonthlySpend * yearInflation * 12;
    const annualPension = monthlyPension * 12 * Math.pow(1.02, y); // 养老金每年涨约2%
    const annualIns = monthlyCommIns * 12;

    totalRetirementNeed += annualSpend;
    totalRetirementIncome += annualPension + annualIns;

    const annualNetCost = annualSpend - annualPension - annualIns;
    retirementWealth = retirementWealth * (1 + retirementReturnRate) - annualNetCost;

    snapshots.push({
      age: curAge,
      grossIncome: Math.round(annualPension + annualIns),
      tax: 0,
      netIncome: Math.round(annualPension + annualIns),
      savings: Math.round(-annualNetCost),
      totalWealth: Math.round(Math.max(0, retirementWealth)),
      isRetired: true,
    });
  }

  const retirementGap = totalRetirementNeed - totalRetirementIncome;
  const canRetire = wealthAtRetirement >= retirementGap;
  const surplusOrDeficit = wealthAtRetirement - retirementGap;

  // 资产能支撑几年
  let yearsOfFunding = 0;
  let tempWealth = wealthAtRetirement;
  for (let y = 0; y < retirementYears; y++) {
    const yearInflation = Math.pow(1 + expectedInflationRate / 100, y);
    const annualNet = (adjustedMonthlySpend * yearInflation * 12)
      - (monthlyPension * 12 * Math.pow(1.02, y))
      - (monthlyCommIns * 12);
    tempWealth = tempWealth * (1 + retirementReturnRate) - annualNet;
    if (tempWealth <= 0) break;
    yearsOfFunding++;
  }

  // 退休后性别法定退休年龄影响（参考）
  void gender;

  return {
    lifetimeGrossIncome: Math.round(lifetimeGross),
    lifetimeTax: Math.round(lifetimeTax),
    lifetimeNetIncome: Math.round(lifetimeNet),
    lifetimeSocialSecurity: Math.round(lifetimeSS),
    yearlySnapshots: snapshots,
    retirement: {
      requiredMonthlySpend: Math.round(adjustedMonthlySpend),
      monthlyPension: Math.round(monthlyPension),
      monthlyCommercialIns: Math.round(monthlyCommIns),
      monthlyGap: Math.round(monthlyGap),
      totalRetirementNeed: Math.round(totalRetirementNeed),
      totalRetirementIncome: Math.round(totalRetirementIncome),
      retirementGap: Math.round(retirementGap),
      wealthAtRetirement: Math.round(wealthAtRetirement),
      canRetire,
      surplusOrDeficit: Math.round(surplusOrDeficit),
      yearsOfFunding,
    },
  };
}
