"use client";

import { useFormContext } from "react-hook-form";
import type { FormData } from "@/lib/schema";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function SocialSecurityStep() {
  const { register, formState: { errors } } = useFormContext<FormData>();

  return (
    <div className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="socialSecurityBase">社保缴纳基数（元/月）*</Label>
          <Input id="socialSecurityBase" type="number" placeholder="12000" {...register("socialSecurityBase", { valueAsNumber: true })} />
          <p className="text-xs text-muted-foreground">通常为本人月工资，受上下限约束</p>
          {errors.socialSecurityBase && <p className="text-xs text-destructive">{errors.socialSecurityBase.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="housingFundRate">公积金缴纳比例（%）*</Label>
          <Input id="housingFundRate" type="number" placeholder="7" {...register("housingFundRate", { valueAsNumber: true })} />
          <p className="text-xs text-muted-foreground">个人比例，通常 5%-12%</p>
          {errors.housingFundRate && <p className="text-xs text-destructive">{errors.housingFundRate.message}</p>}
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="socialSecurityYears">已缴纳社保年限 *</Label>
          <Input id="socialSecurityYears" type="number" placeholder="5" {...register("socialSecurityYears", { valueAsNumber: true })} />
          {errors.socialSecurityYears && <p className="text-xs text-destructive">{errors.socialSecurityYears.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="pensionAccountBalance">个人养老账户余额（元）</Label>
          <Input id="pensionAccountBalance" type="number" placeholder="30000" {...register("pensionAccountBalance", { valueAsNumber: true })} />
          <p className="text-xs text-muted-foreground">可在社保 App 中查询</p>
          {errors.pensionAccountBalance && <p className="text-xs text-destructive">{errors.pensionAccountBalance.message}</p>}
        </div>
      </div>

      <div className="rounded-lg border bg-muted/30 p-4 text-sm text-muted-foreground">
        <p className="font-medium text-foreground mb-1">计算说明</p>
        <p>个人缴纳比例：养老 8% + 医疗 2% + 失业 0.5% + 公积金（您选择的比例）。系统将据此计算您的到手收入和退休后养老金。</p>
      </div>
    </div>
  );
}
