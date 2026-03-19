"use client";

import { useFormContext } from "react-hook-form";
import type { FormData } from "@/lib/schema";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const riskOptions = [
  { value: "conservative", label: "保守型", desc: "以存款、国债、货基为主，预期年化 2-4%" },
  { value: "balanced", label: "稳健型", desc: "债基+部分股基混合，预期年化 4-8%" },
  { value: "aggressive", label: "进取型", desc: "以股票、股基为主，预期年化 8-15%，波动大" },
] as const;

export default function InvestmentStep() {
  const { register, setValue, watch, formState: { errors } } = useFormContext<FormData>();
  const riskPref = watch("riskPreference");

  return (
    <div className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="avgReturnRate3y">近三年平均理财收益率（%）*</Label>
          <Input id="avgReturnRate3y" type="number" step="0.1" placeholder="3.5" {...register("avgReturnRate3y", { valueAsNumber: true })} />
          <p className="text-xs text-muted-foreground">所有投资的综合年化收益</p>
          {errors.avgReturnRate3y && <p className="text-xs text-destructive">{errors.avgReturnRate3y.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="monthlySavingsRate">月储蓄率（%）*</Label>
          <Input id="monthlySavingsRate" type="number" placeholder="30" {...register("monthlySavingsRate", { valueAsNumber: true })} />
          <p className="text-xs text-muted-foreground">税后到手中可存下的比例</p>
          {errors.monthlySavingsRate && <p className="text-xs text-destructive">{errors.monthlySavingsRate.message}</p>}
        </div>
      </div>

      <div className="space-y-3">
        <Label>投资风险偏好 *</Label>
        <RadioGroup
          value={riskPref}
          onValueChange={(v) => setValue("riskPreference", v as FormData["riskPreference"], { shouldValidate: true })}
          className="grid gap-2"
        >
          {riskOptions.map((r) => (
            <label
              key={r.value}
              className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors ${
                riskPref === r.value ? "border-primary bg-primary/5" : "hover:border-primary/40"
              }`}
            >
              <RadioGroupItem value={r.value} className="mt-0.5" />
              <div>
                <div className="text-sm font-medium">{r.label}</div>
                <div className="text-xs text-muted-foreground">{r.desc}</div>
              </div>
            </label>
          ))}
        </RadioGroup>
        {errors.riskPreference && <p className="text-xs text-destructive">{errors.riskPreference.message}</p>}
      </div>
    </div>
  );
}
