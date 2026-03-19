import { z } from "zod";

// Step 1: 基本信息
export const basicInfoSchema = z.object({
  age: z
    .number({ error: "请填写有效年龄" })
    .min(18, "年龄不能小于18岁")
    .max(65, "年龄不能大于65岁"),
  gender: z.enum(["male", "female"], { error: "请选择性别" }),
  cityTier: z.enum(["tier1", "newTier1", "tier2", "tier3"], {
    error: "请选择城市等级",
  }),
  retireAge: z
    .number({ error: "请填写退休年龄" })
    .min(50, "退休年龄不能小于50")
    .max(70, "退休年龄不能大于70"),
  lifeExpectancy: z
    .number({ error: "请填写预期寿命" })
    .min(60, "预期寿命不能小于60")
    .max(100, "预期寿命不能大于100"),
});

// Step 2: 收入状况
export const incomeSchema = z.object({
  monthlyGross: z
    .number({ error: "请填写税前月薪" })
    .min(1000, "月薪不能低于1000")
    .max(1000000, "月薪超出范围"),
  bonusMonths: z
    .number({ error: "请填写年终奖月数" })
    .min(0, "年终奖月数不能为负")
    .max(24, "年终奖月数不能超过24"),
  sideIncome: z
    .number({ error: "请填写其他月收入" })
    .min(0, "不能为负"),
  annualRaiseRate: z
    .number({ error: "请填写预计年薪增长率" })
    .min(0, "增长率不能为负")
    .max(30, "增长率不能超过30%"),
  incomePeakAge: z
    .number({ error: "请填写收入峰值年龄" })
    .min(30, "峰值年龄不能小于30")
    .max(65, "峰值年龄不能大于65"),
});

// Step 3: 社保与公积金
export const socialSecuritySchema = z.object({
  socialSecurityBase: z
    .number({ error: "请填写社保缴纳基数" })
    .min(0, "不能为负"),
  housingFundRate: z
    .number({ error: "请填写公积金缴纳比例" })
    .min(5, "公积金比例不能低于5%")
    .max(12, "公积金比例不能超过12%"),
  socialSecurityYears: z
    .number({ error: "请填写已缴社保年限" })
    .min(0, "不能为负")
    .max(45, "不能超过45年"),
  pensionAccountBalance: z
    .number({ error: "请填写个人养老账户余额" })
    .min(0, "不能为负"),
});

// Step 4: 资产与负债
export const assetSchema = z.object({
  totalSavings: z
    .number({ error: "请填写现有存款/投资" })
    .min(0, "不能为负"),
  housingStatus: z.enum(["none", "owned_no_mortgage", "owned_with_mortgage", "renting"], {
    error: "请选择住房情况",
  }),
  monthlyMortgage: z
    .number({ error: "请填写月供金额" })
    .min(0, "不能为负"),
  mortgageYearsLeft: z
    .number({ error: "请填写剩余贷款年限" })
    .min(0, "不能为负")
    .max(30, "不能超过30年"),
  otherDebt: z
    .number({ error: "请填写其他负债" })
    .min(0, "不能为负"),
});

// Step 5: 理财与投资
export const investmentSchema = z.object({
  avgReturnRate3y: z
    .number({ error: "请填写近三年平均收益率" })
    .min(-20, "收益率不能低于-20%")
    .max(50, "收益率不能超过50%"),
  monthlySavingsRate: z
    .number({ error: "请填写月储蓄率" })
    .min(0, "储蓄率不能为负")
    .max(100, "储蓄率不能超过100%"),
  riskPreference: z.enum(["conservative", "balanced", "aggressive"], {
    error: "请选择风险偏好",
  }),
});

// Step 6: 退休期望
export const retirementSchema = z.object({
  expectedMonthlySpend: z
    .number({ error: "请填写退休后期望月开支" })
    .min(1000, "月开支不能低于1000")
    .max(200000, "月开支超出范围"),
  hasCommercialInsurance: z.boolean(),
  commercialInsuranceMonthly: z
    .number({ error: "请填写商业保险月领金额" })
    .min(0, "不能为负"),
  childrenStatus: z.enum(["none", "dependent", "independent"], {
    error: "请选择子女状况",
  }),
  expectedInflationRate: z
    .number({ error: "请填写预期通胀率" })
    .min(0, "通胀率不能为负")
    .max(15, "通胀率不能超过15%"),
  retirementLifestyle: z.enum(["frugal", "moderate", "comfortable", "premium"], {
    error: "请选择退休生活水平",
  }),
});

export const fullFormSchema = basicInfoSchema
  .merge(incomeSchema)
  .merge(socialSecuritySchema)
  .merge(assetSchema)
  .merge(investmentSchema)
  .merge(retirementSchema);

export type FormData = z.infer<typeof fullFormSchema>;

export const stepSchemas = [
  basicInfoSchema,
  incomeSchema,
  socialSecuritySchema,
  assetSchema,
  investmentSchema,
  retirementSchema,
] as const;

export const stepTitles = [
  "基本信息",
  "收入状况",
  "社保与公积金",
  "资产与负债",
  "理财与投资",
  "退休期望",
] as const;

export const stepDescriptions = [
  "填写您的年龄、城市和退休计划",
  "填写您的收入和薪资增长预期",
  "填写您的社保和公积金信息",
  "盘点您的资产和负债",
  "描述您的投资理财情况",
  "规划您的退休生活期望",
] as const;
