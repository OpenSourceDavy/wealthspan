"use client";

import { useFormContext } from "react-hook-form";
import type { FormData } from "@/lib/schema";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

const genderOptions = [
  { value: "male", label: "男" },
  { value: "female", label: "女" },
] as const;

const cityTiers = [
  { value: "tier1", label: "一线城市", desc: "北京、上海、广州、深圳" },
  { value: "newTier1", label: "新一线城市", desc: "杭州、成都、武汉、南京等" },
  { value: "tier2", label: "二线城市", desc: "省会及经济发达地级市" },
  { value: "tier3", label: "三线及以下", desc: "其他城市" },
] as const;

export default function BasicInfoStep() {
  const { register, setValue, watch, formState: { errors } } = useFormContext<FormData>();
  const gender = watch("gender");

  return (
    <div className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="age">当前年龄 *</Label>
          <Input id="age" type="number" placeholder="28" {...register("age", { valueAsNumber: true })} />
          {errors.age && <p className="text-xs text-destructive">{errors.age.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label>性别 *</Label>
          <RadioGroup
            value={gender}
            onValueChange={(v) => setValue("gender", v as FormData["gender"], { shouldValidate: true })}
            className="flex gap-4 pt-1"
          >
            {genderOptions.map((g) => (
              <label key={g.value} className="flex items-center gap-2 cursor-pointer">
                <RadioGroupItem value={g.value} />
                <span className="text-sm">{g.label}</span>
              </label>
            ))}
          </RadioGroup>
          {errors.gender && <p className="text-xs text-destructive">{errors.gender.message}</p>}
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>所在城市等级 *</Label>
        <Select
          value={watch("cityTier")}
          onValueChange={(v) => setValue("cityTier", v as FormData["cityTier"], { shouldValidate: true })}
        >
          <SelectTrigger><SelectValue placeholder="请选择" /></SelectTrigger>
          <SelectContent>
            {cityTiers.map((c) => (
              <SelectItem key={c.value} value={c.value}>
                {c.label} — {c.desc}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {errors.cityTier && <p className="text-xs text-destructive">{errors.cityTier.message}</p>}
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="retireAge">计划退休年龄 *</Label>
          <Input id="retireAge" type="number" placeholder="60" {...register("retireAge", { valueAsNumber: true })} />
          {errors.retireAge && <p className="text-xs text-destructive">{errors.retireAge.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="lifeExpectancy">预期寿命 *</Label>
          <Input id="lifeExpectancy" type="number" placeholder="80" {...register("lifeExpectancy", { valueAsNumber: true })} />
          {errors.lifeExpectancy && <p className="text-xs text-destructive">{errors.lifeExpectancy.message}</p>}
        </div>
      </div>
    </div>
  );
}
