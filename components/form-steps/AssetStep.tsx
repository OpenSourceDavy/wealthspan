"use client";

import { useFormContext } from "react-hook-form";
import type { FormData } from "@/lib/schema";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

const housingOptions = [
  { value: "none", label: "无房产" },
  { value: "owned_no_mortgage", label: "有房无贷" },
  { value: "owned_with_mortgage", label: "有房有贷" },
  { value: "renting", label: "租房" },
] as const;

export default function AssetStep() {
  const { register, setValue, watch, formState: { errors } } = useFormContext<FormData>();
  const housingStatus = watch("housingStatus");
  const showMortgage = housingStatus === "owned_with_mortgage" || housingStatus === "renting";

  return (
    <div className="space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="totalSavings">现有存款 / 投资总额（元）*</Label>
        <Input id="totalSavings" type="number" placeholder="100000" {...register("totalSavings", { valueAsNumber: true })} />
        <p className="text-xs text-muted-foreground">包括银行存款、基金、股票等金融资产</p>
        {errors.totalSavings && <p className="text-xs text-destructive">{errors.totalSavings.message}</p>}
      </div>

      <div className="space-y-2">
        <Label>住房情况 *</Label>
        <RadioGroup
          value={housingStatus}
          onValueChange={(v) => setValue("housingStatus", v as FormData["housingStatus"], { shouldValidate: true })}
          className="grid gap-2 sm:grid-cols-2"
        >
          {housingOptions.map((h) => (
            <label
              key={h.value}
              className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors ${
                housingStatus === h.value ? "border-primary bg-primary/5" : "hover:border-primary/40"
              }`}
            >
              <RadioGroupItem value={h.value} />
              <span className="text-sm font-medium">{h.label}</span>
            </label>
          ))}
        </RadioGroup>
        {errors.housingStatus && <p className="text-xs text-destructive">{errors.housingStatus.message}</p>}
      </div>

      {showMortgage && (
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="monthlyMortgage">
              {housingStatus === "renting" ? "月租金（元）" : "月供金额（元）"}
            </Label>
            <Input id="monthlyMortgage" type="number" placeholder="5000" {...register("monthlyMortgage", { valueAsNumber: true })} />
            {errors.monthlyMortgage && <p className="text-xs text-destructive">{errors.monthlyMortgage.message}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="mortgageYearsLeft">
              {housingStatus === "renting" ? "预计还需租几年" : "剩余贷款年限"}
            </Label>
            <Input id="mortgageYearsLeft" type="number" placeholder="20" {...register("mortgageYearsLeft", { valueAsNumber: true })} />
            {errors.mortgageYearsLeft && <p className="text-xs text-destructive">{errors.mortgageYearsLeft.message}</p>}
          </div>
        </div>
      )}

      <div className="space-y-1.5">
        <Label htmlFor="otherDebt">其他负债（车贷/消费贷等，元）</Label>
        <Input id="otherDebt" type="number" placeholder="0" {...register("otherDebt", { valueAsNumber: true })} />
        {errors.otherDebt && <p className="text-xs text-destructive">{errors.otherDebt.message}</p>}
      </div>
    </div>
  );
}
