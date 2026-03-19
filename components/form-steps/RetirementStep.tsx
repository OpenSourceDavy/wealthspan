"use client";

import { useFormContext } from "react-hook-form";
import type { FormData } from "@/lib/schema";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";

const lifestyleOptions = [
  { value: "frugal", label: "节俭", desc: "基本生活保障，省吃俭用" },
  { value: "moderate", label: "适中", desc: "偶尔旅游，正常社交" },
  { value: "comfortable", label: "舒适", desc: "每年旅游，品质消费" },
  { value: "premium", label: "优质", desc: "自由消费，无需考虑预算" },
] as const;

const childrenOptions = [
  { value: "none", label: "无子女" },
  { value: "dependent", label: "有子女待抚养" },
  { value: "independent", label: "子女已独立" },
] as const;

export default function RetirementStep() {
  const { register, setValue, watch, formState: { errors } } = useFormContext<FormData>();
  const lifestyle = watch("retirementLifestyle");
  const hasInsurance = watch("hasCommercialInsurance");

  return (
    <div className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="expectedMonthlySpend">退休后期望月开支（元）*</Label>
          <Input id="expectedMonthlySpend" type="number" placeholder="8000" {...register("expectedMonthlySpend", { valueAsNumber: true })} />
          <p className="text-xs text-muted-foreground">以当前物价水平估算</p>
          {errors.expectedMonthlySpend && <p className="text-xs text-destructive">{errors.expectedMonthlySpend.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="expectedInflationRate">预期年通胀率（%）*</Label>
          <Input id="expectedInflationRate" type="number" step="0.1" placeholder="3" {...register("expectedInflationRate", { valueAsNumber: true })} />
          <p className="text-xs text-muted-foreground">中国近10年平均约 2-3%</p>
          {errors.expectedInflationRate && <p className="text-xs text-destructive">{errors.expectedInflationRate.message}</p>}
        </div>
      </div>

      <div className="space-y-3">
        <Label>退休生活水平 *</Label>
        <RadioGroup
          value={lifestyle}
          onValueChange={(v) => setValue("retirementLifestyle", v as FormData["retirementLifestyle"], { shouldValidate: true })}
          className="grid gap-2 sm:grid-cols-2"
        >
          {lifestyleOptions.map((l) => (
            <label
              key={l.value}
              className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors ${
                lifestyle === l.value ? "border-primary bg-primary/5" : "hover:border-primary/40"
              }`}
            >
              <RadioGroupItem value={l.value} className="mt-0.5" />
              <div>
                <div className="text-sm font-medium">{l.label}</div>
                <div className="text-xs text-muted-foreground">{l.desc}</div>
              </div>
            </label>
          ))}
        </RadioGroup>
        {errors.retirementLifestyle && <p className="text-xs text-destructive">{errors.retirementLifestyle.message}</p>}
      </div>

      <div className="space-y-1.5">
        <Label>子女状况 *</Label>
        <RadioGroup
          value={watch("childrenStatus")}
          onValueChange={(v) => setValue("childrenStatus", v as FormData["childrenStatus"], { shouldValidate: true })}
          className="flex flex-wrap gap-3"
        >
          {childrenOptions.map((c) => (
            <label key={c.value} className="flex items-center gap-2 cursor-pointer">
              <RadioGroupItem value={c.value} />
              <span className="text-sm">{c.label}</span>
            </label>
          ))}
        </RadioGroup>
        {errors.childrenStatus && <p className="text-xs text-destructive">{errors.childrenStatus.message}</p>}
      </div>

      <div className="space-y-3 rounded-lg border p-4">
        <div className="flex items-center gap-2">
          <Checkbox
            id="hasCommercialInsurance"
            checked={hasInsurance}
            onCheckedChange={(v) => setValue("hasCommercialInsurance", !!v, { shouldValidate: true })}
          />
          <Label htmlFor="hasCommercialInsurance" className="cursor-pointer">有商业养老保险</Label>
        </div>
        {hasInsurance && (
          <div className="space-y-1.5 pl-6">
            <Label htmlFor="commercialInsuranceMonthly">退休后预计每月领取（元）</Label>
            <Input id="commercialInsuranceMonthly" type="number" placeholder="2000" {...register("commercialInsuranceMonthly", { valueAsNumber: true })} />
            {errors.commercialInsuranceMonthly && <p className="text-xs text-destructive">{errors.commercialInsuranceMonthly.message}</p>}
          </div>
        )}
      </div>
    </div>
  );
}
