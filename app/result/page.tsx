"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { calculate, type CalcResult, type YearlySnapshot } from "@/lib/calculator";
import { fullFormSchema, type FormData } from "@/lib/schema";
import { yuan } from "@/lib/format";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine,
  BarChart, Bar,
} from "recharts";

function StatCard({ label, value, sub, accent }: { label: string; value: string; sub?: string; accent?: "green" | "red" | "blue" }) {
  const color = accent === "green" ? "text-emerald-600" : accent === "red" ? "text-rose-600" : accent === "blue" ? "text-blue-600" : "text-foreground";
  return (
    <Card>
      <CardContent className="p-4 sm:p-5">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</p>
        <p className={`mt-1 text-2xl font-bold tracking-tight ${color}`}>{value}</p>
        {sub && <p className="mt-0.5 text-xs text-muted-foreground">{sub}</p>}
      </CardContent>
    </Card>
  );
}

function ChartTooltipContent({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) {
  if (!active || !payload) return null;
  return (
    <div className="rounded-lg border bg-card p-3 shadow-md text-xs">
      <p className="font-medium mb-1">{label}岁</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }}>{p.name}: {yuan(p.value)}元</p>
      ))}
    </div>
  );
}

export default function ResultPage() {
  const router = useRouter();
  const [result, setResult] = useState<CalcResult | null>(null);
  const [formData, setFormData] = useState<FormData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const raw = sessionStorage.getItem("wealth_form_data");
    if (!raw) { setError("未找到表单数据，请返回重新填写。"); return; }
    try {
      const parsed = fullFormSchema.parse(JSON.parse(raw));
      setFormData(parsed);
      setResult(calculate(parsed));
    } catch {
      setError("数据解析失败，请返回重新填写。");
    }
  }, []);

  const workSnapshots = useMemo(() => result?.yearlySnapshots.filter((s) => !s.isRetired) ?? [], [result]);
  const allSnapshots = useMemo(() => result?.yearlySnapshots ?? [], [result]);

  const wealthChartData = useMemo(() =>
    allSnapshots.map((s) => ({
      age: s.age,
      资产总额: s.totalWealth,
      年收入: s.grossIncome,
    })),
  [allSnapshots]);

  const incomeChartData = useMemo(() =>
    workSnapshots.map((s) => ({
      age: s.age,
      税前收入: s.grossIncome,
      税后到手: s.netIncome,
      个税: s.tax,
    })),
  [workSnapshots]);

  const handleCopy = useCallback(async () => {
    if (!result || !formData) return;
    const r = result.retirement;
    const text = [
      `一辈子赚多少钱 - 计算结果`,
      `一生税前总收入: ${yuan(result.lifetimeGrossIncome)}元`,
      `一生税后总收入: ${yuan(result.lifetimeNetIncome)}元`,
      `一生缴税: ${yuan(result.lifetimeTax)}元`,
      `一生五险一金: ${yuan(result.lifetimeSocialSecurity)}元`,
      `退休时累计资产: ${yuan(r.wealthAtRetirement)}元`,
      `退休后月养老金: ${yuan(r.monthlyPension)}元`,
      `养老缺口: ${r.canRetire ? "无缺口" : yuan(Math.abs(r.surplusOrDeficit)) + "元"}`,
    ].join("\n");
    await navigator.clipboard.writeText(text);
  }, [result, formData]);

  if (error) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20 text-center">
        <p className="text-lg font-medium text-destructive">{error}</p>
        <Button className="mt-6" onClick={() => router.push("/assess")}>返回填写</Button>
      </div>
    );
  }

  if (!result || !formData) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-20 text-center">
        <div className="mx-auto size-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <p className="mt-4 text-muted-foreground">正在计算中...</p>
      </div>
    );
  }

  const r = result.retirement;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
        <h1 className="text-2xl font-bold">
  您预计在 <span className="text-primary">{formData.retireAge}</span> 岁退休的报告如下：
</h1>
<p className="mt-1 text-sm text-muted-foreground">
  基于您的输入（当前 {formData.age} 岁），以下是精算结果
</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleCopy}>复制摘要</Button>
          <Button variant="ghost" size="sm" onClick={() => router.push("/assess")}>重新计算</Button>
        </div>
      </div>

      {/* Core stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <StatCard label="一生税前总收入" value={yuan(result.lifetimeGrossIncome) + "元"} sub={`工作 ${formData.retireAge - formData.age} 年`} accent="blue" />
        <StatCard label="一生缴税总额" value={yuan(result.lifetimeTax) + "元"} sub={`五险一金 ${yuan(result.lifetimeSocialSecurity)}元`} />
        <StatCard label="退休时累计资产" value={yuan(r.wealthAtRetirement) + "元"} sub={`${formData.retireAge}岁退休`} accent="blue" />
        <StatCard
          label="养老评估"
          value={r.canRetire ? "可以体面养老" : "存在养老缺口"}
          sub={r.canRetire ? `盈余 ${yuan(r.surplusOrDeficit)}元` : `缺口 ${yuan(Math.abs(r.surplusOrDeficit))}元`}
          accent={r.canRetire ? "green" : "red"}
        />
      </div>

      {/* Retirement detail cards */}
      <div className="grid gap-4 sm:grid-cols-3 mb-8">
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">退休后每月养老金</p>
            <p className="text-xl font-bold mt-1">{yuan(r.monthlyPension)}元</p>
            {r.monthlyCommercialIns > 0 && <p className="text-xs text-muted-foreground">+ 商保 {yuan(r.monthlyCommercialIns)}元</p>}
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">退休后月开支（通胀后）</p>
            <p className="text-xl font-bold mt-1">{yuan(r.requiredMonthlySpend)}元</p>
            <p className="text-xs text-muted-foreground">当前物价 {yuan(formData.expectedMonthlySpend)}元 × {formData.retireAge - formData.age}年通胀</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-xs text-muted-foreground">退休资产可支撑</p>
            <p className="text-xl font-bold mt-1">{r.yearsOfFunding}年</p>
            <Badge variant={r.yearsOfFunding >= (formData.lifeExpectancy - formData.retireAge) ? "default" : "destructive"} className="mt-1">
              {r.yearsOfFunding >= (formData.lifeExpectancy - formData.retireAge) ? "覆盖全部退休期" : `支撑活到 ${formData.retireAge + r.yearsOfFunding} 岁`}
            </Badge>
          </CardContent>
        </Card>
      </div>

      <Separator className="my-8" />

      {/* Wealth trajectory chart */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">资产变化轨迹</h2>
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={wealthChartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="age" tick={{ fontSize: 12 }} label={{ value: "年龄", position: "insideBottomRight", offset: -5, fontSize: 12 }} />
              <YAxis tickFormatter={(v: number) => yuan(v)} tick={{ fontSize: 11 }} width={70} />
              <Tooltip content={<ChartTooltipContent />} />
              <Legend />
              <ReferenceLine x={formData.retireAge} stroke="#ef4444" strokeDasharray="5 5" label={{ value: "退休", fill: "#ef4444", fontSize: 12 }} />
              <Area type="monotone" dataKey="资产总额" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.15} strokeWidth={2} />
              <Area type="monotone" dataKey="年收入" stroke="#10b981" fill="#10b981" fillOpacity={0.08} strokeWidth={1.5} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Income breakdown chart */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">工作期间收入分解</h2>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={incomeChartData} margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis dataKey="age" tick={{ fontSize: 12 }} />
              <YAxis tickFormatter={(v: number) => yuan(v)} tick={{ fontSize: 11 }} width={70} />
              <Tooltip content={<ChartTooltipContent />} />
              <Legend />
              <Bar dataKey="税前收入" fill="#3b82f6" radius={[2, 2, 0, 0]} />
              <Bar dataKey="税后到手" fill="#10b981" radius={[2, 2, 0, 0]} />
              <Bar dataKey="个税" fill="#f59e0b" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <Separator className="my-8" />

      {/* Yearly table */}
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-4">逐年财务快照</h2>
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-3 py-2 text-left font-medium">年龄</th>
                <th className="px-3 py-2 text-right font-medium">阶段</th>
                <th className="px-3 py-2 text-right font-medium">年收入</th>
                <th className="px-3 py-2 text-right font-medium">个税</th>
                <th className="px-3 py-2 text-right font-medium">年储蓄</th>
                <th className="px-3 py-2 text-right font-medium">累计资产</th>
              </tr>
            </thead>
            <tbody>
              {result.yearlySnapshots.filter((_: YearlySnapshot, i: number) => i % 5 === 0 || i === result.yearlySnapshots.length - 1).map((s: YearlySnapshot) => (
                <tr key={s.age} className="border-b last:border-0 hover:bg-muted/30">
                  <td className="px-3 py-2 font-medium">{s.age}</td>
                  <td className="px-3 py-2 text-right">
                    <Badge variant={s.isRetired ? "secondary" : "default"} className="text-xs">
                      {s.isRetired ? "退休" : "工作"}
                    </Badge>
                  </td>
                  <td className="px-3 py-2 text-right">{yuan(s.grossIncome)}</td>
                  <td className="px-3 py-2 text-right">{yuan(s.tax)}</td>
                  <td className={`px-3 py-2 text-right ${s.savings < 0 ? "text-rose-600" : ""}`}>
                    {s.savings < 0 ? "-" : ""}{yuan(Math.abs(s.savings))}
                  </td>
                  <td className={`px-3 py-2 text-right font-medium ${s.totalWealth <= 0 ? "text-rose-600" : ""}`}>
                    {yuan(s.totalWealth)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="rounded-lg border bg-muted/30 p-6 text-center text-sm text-muted-foreground">
        <p>以上计算基于您填写的数据和简化的精算模型，实际结果会受到政策变化、市场波动、个人职业发展等多因素影响。</p>
        <p className="mt-1">本工具仅供参考，不构成任何财务建议。</p>
        <div className="flex justify-center gap-3 mt-4">
          <Button variant="outline" onClick={handleCopy}>复制摘要</Button>
          <Button onClick={() => router.push("/assess")}>重新计算</Button>
        </div>
      </div>
    </div>
  );
}
