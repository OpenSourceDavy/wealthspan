"use client";

import { useFormContext } from "react-hook-form";
import type { FormData } from "@/lib/schema";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function IncomeStep() {
  const { register, formState: { errors } } = useFormContext<FormData>();

  return (
    <div className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="monthlyGross">税前月薪（元）*</Label>
          <Input id="monthlyGross" type="number" placeholder="15000" {...register("monthlyGross", { valueAsNumber: true })} />
          {errors.monthlyGross && <p className="text-xs text-destructive">{errors.monthlyGross.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="bonusMonths">年终奖月数 *</Label>
          <Input id="bonusMonths" type="number" step="0.5" placeholder="2" {...register("bonusMonths", { valueAsNumber: true })} />
          {errors.bonusMonths && <p className="text-xs text-destructive">{errors.bonusMonths.message}</p>}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="sideIncome">其他月收入（副业/租金等，元）</Label>
        <Input id="sideIncome" type="number" placeholder="0" {...register("sideIncome", { valueAsNumber: true })} />
        {errors.sideIncome && <p className="text-xs text-destructive">{errors.sideIncome.message}</p>}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="annualRaiseRate">预计年薪增长率（%）*</Label>
          <Input id="annualRaiseRate" type="number" step="0.5" placeholder="8" {...register("annualRaiseRate", { valueAsNumber: true })} />
          <p className="text-xs text-muted-foreground">包含跳槽涨薪、升职加薪等综合增长</p>
          {errors.annualRaiseRate && <p className="text-xs text-destructive">{errors.annualRaiseRate.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="incomePeakAge">收入峰值年龄 *</Label>
          <Input id="incomePeakAge" type="number" placeholder="45" {...register("incomePeakAge", { valueAsNumber: true })} />
          <p className="text-xs text-muted-foreground">预计薪资到达顶峰的年龄</p>
          {errors.incomePeakAge && <p className="text-xs text-destructive">{errors.incomePeakAge.message}</p>}
        </div>
      </div>
    </div>
  );
}
