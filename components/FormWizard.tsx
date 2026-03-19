"use client";

import { useState, useCallback } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";

import {
  fullFormSchema,
  stepSchemas,
  stepTitles,
  stepDescriptions,
  type FormData,
} from "@/lib/schema";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";

import BasicInfoStep from "@/components/form-steps/BasicInfoStep";
import IncomeStep from "@/components/form-steps/IncomeStep";
import SocialSecurityStep from "@/components/form-steps/SocialSecurityStep";
import AssetStep from "@/components/form-steps/AssetStep";
import InvestmentStep from "@/components/form-steps/InvestmentStep";
import RetirementStep from "@/components/form-steps/RetirementStep";

const stepComponents = [
  BasicInfoStep,
  IncomeStep,
  SocialSecurityStep,
  AssetStep,
  InvestmentStep,
  RetirementStep,
];

const defaultValues: FormData = {
  age: 28,
  gender: "male",
  cityTier: "tier2",
  retireAge: 60,
  lifeExpectancy: 80,
  monthlyGross: 10000,
  bonusMonths: 1,
  sideIncome: 0,
  annualRaiseRate: 5,
  incomePeakAge: 42,
  socialSecurityBase: 8000,
  housingFundRate: 5,
  socialSecurityYears: 3,
  pensionAccountBalance: 15000,
  totalSavings: 50000,
  housingStatus: "renting",
  monthlyMortgage: 3000,
  mortgageYearsLeft: 25,
  otherDebt: 0,
  avgReturnRate3y: 2.5,
  monthlySavingsRate: 20,
  riskPreference: "conservative",
  expectedMonthlySpend: 8000,
  hasCommercialInsurance: false,
  commercialInsuranceMonthly: 0,
  childrenStatus: "none",
  expectedInflationRate: 3,
  retirementLifestyle: "moderate",
};

const slideVariants = {
  enter: (dir: number) => ({ x: dir > 0 ? 80 : -80, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({ x: dir < 0 ? 80 : -80, opacity: 0 }),
};

export default function FormWizard() {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(0);
  const router = useRouter();

  const methods = useForm<FormData>({
    resolver: zodResolver(fullFormSchema),
    defaultValues,
    mode: "onTouched",
  });

  const totalSteps = stepComponents.length;
  const progress = ((step + 1) / totalSteps) * 100;

  const validateCurrentStep = useCallback(async () => {
    const currentSchema = stepSchemas[step];
    const values = methods.getValues();
    const result = currentSchema.safeParse(values);
    if (!result.success) {
      const flattened = result.error.flatten();
      const fieldNames = Object.keys(flattened.fieldErrors) as (keyof FormData)[];
      fieldNames.forEach((name) => {
        const msgs = flattened.fieldErrors[name as keyof typeof flattened.fieldErrors];
        const msg = (msgs as string[] | undefined)?.[0] ?? "该字段有误";
        methods.setError(name, { message: msg });
      });
      return false;
    }
    return true;
  }, [step, methods]);

  const goNext = useCallback(async () => {
    const valid = await validateCurrentStep();
    if (!valid) return;
    setDirection(1);
    setStep((s) => Math.min(s + 1, totalSteps - 1));
  }, [validateCurrentStep, totalSteps]);

  const goBack = useCallback(() => {
    setDirection(-1);
    setStep((s) => Math.max(s - 1, 0));
  }, []);

  const onSubmit = useCallback(
    (data: FormData) => {
      sessionStorage.setItem("wealth_form_data", JSON.stringify(data));
      router.push("/result");
    },
    [router],
  );

  const handleSubmitClick = useCallback(async () => {
    const valid = await validateCurrentStep();
    if (!valid) return;
    methods.handleSubmit(onSubmit)();
  }, [validateCurrentStep, methods, onSubmit]);

  const StepComponent = stepComponents[step];

  return (
    <FormProvider {...methods}>
      <form onSubmit={(e) => e.preventDefault()} className="mx-auto w-full max-w-2xl">
        {/* Progress */}
        <div className="mb-8">
          <div className="mb-3 flex items-center justify-between text-sm">
            <span className="font-medium">步骤 {step + 1} / {totalSteps}</span>
            <span className="text-muted-foreground">{stepTitles[step]}</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step pills */}
        <div className="mb-6 flex gap-2">
          {stepTitles.map((title, i) => (
            <button
              key={title}
              type="button"
              onClick={() => {
                if (i < step) { setDirection(-1); setStep(i); }
              }}
              className={`flex-1 rounded-full py-1.5 text-xs font-medium transition-colors ${
                i === step
                  ? "bg-primary text-primary-foreground"
                  : i < step
                    ? "bg-primary/15 text-primary cursor-pointer hover:bg-primary/25"
                    : "bg-muted text-muted-foreground"
              }`}
            >
              <span className="hidden sm:inline">{title}</span>
              <span className="sm:hidden">{i + 1}</span>
            </button>
          ))}
        </div>

        {/* Title */}
        <div className="mb-6">
          <h2 className="text-xl font-semibold">{stepTitles[step]}</h2>
          <p className="mt-1 text-sm text-muted-foreground">{stepDescriptions[step]}</p>
        </div>

        {/* Content */}
        <div className="relative min-h-[380px]">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.25, ease: "easeInOut" }}
            >
              <StepComponent />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Nav */}
        <div className="mt-8 flex items-center justify-between border-t pt-6">
          <Button type="button" variant="ghost" onClick={goBack} disabled={step === 0}>
            上一步
          </Button>
          {step < totalSteps - 1 ? (
            <Button type="button" onClick={goNext}>下一步</Button>
          ) : (
            <Button type="button" onClick={handleSubmitClick}>开始计算</Button>
          )}
        </div>
      </form>
    </FormProvider>
  );
}
