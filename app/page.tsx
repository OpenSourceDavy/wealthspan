"use client";

import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const features = [
  {
    title: "终身收入预测",
    desc: "基于薪资增长曲线、行业特征和峰值年龄，精算你一辈子的税前/税后总收入",
    icon: "💰",
  },
  {
    title: "精密因子建模",
    desc: "涵盖社保基数、公积金、个税累进、通货膨胀、理财收益率等关键变量",
    icon: "📐",
  },
  {
    title: "养老缺口分析",
    desc: "对比退休后的支出需求与养老金收入，计算资产能否覆盖体面养老",
    icon: "📊",
  },
];

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,var(--color-accent)_0%,transparent_60%)]" />
        <div className="mx-auto max-w-3xl px-4 py-24 text-center sm:py-32">
          <p className="mb-4 text-sm font-medium tracking-widest uppercase text-muted-foreground">
            Lifetime Wealth Calculator
          </p>
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            这辈子能赚多少钱
            <br />
            <span className="bg-gradient-to-r from-emerald-600 to-blue-500 bg-clip-text text-transparent">
              够不够体面养老？
            </span>
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-muted-foreground sm:text-xl">
            输入你的收入、社保、资产和投资数据，
            <br className="hidden sm:block" />
            精算终身财富轨迹，评估养老金缺口。
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/assess"
              className={cn(buttonVariants({ size: "lg" }), "h-12 px-8 text-base")}
            >
              开始计算
            </Link>
            <a
              href="#features"
              className={cn(buttonVariants({ variant: "outline", size: "lg" }), "h-12 px-8 text-base")}
            >
              了解更多
            </a>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-t bg-muted/30 py-20">
        <div className="mx-auto max-w-5xl px-4">
          <h2 className="mb-12 text-center text-2xl font-semibold sm:text-3xl">
            精算引擎覆盖的关键因子
          </h2>
          <div className="grid gap-8 sm:grid-cols-3">
            {features.map((f) => (
              <div key={f.title} className="rounded-xl border bg-card p-6 shadow-sm transition-shadow hover:shadow-md">
                <div className="mb-4 text-3xl">{f.icon}</div>
                <h3 className="mb-2 text-lg font-semibold">{f.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20">
        <div className="mx-auto max-w-5xl px-4">
          <h2 className="mb-12 text-center text-2xl font-semibold sm:text-3xl">
            三步获取财富报告
          </h2>
          <div className="grid gap-8 sm:grid-cols-3">
            {[
              { step: "01", title: "填写数据", desc: "6步向导覆盖收入、社保、资产、投资、退休期望" },
              { step: "02", title: "精密计算", desc: "逐年模拟薪资增长、个税、投资复利和通胀" },
              { step: "03", title: "查看报告", desc: "收入曲线、资产轨迹、养老缺口一目了然" },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-bold">
                  {item.step}
                </div>
                <h3 className="mb-2 text-lg font-semibold">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t bg-muted/30 py-16">
        <div className="mx-auto max-w-2xl px-4 text-center">
          <h2 className="text-2xl font-semibold sm:text-3xl">准备好算一笔帐了吗？</h2>
          <p className="mt-4 text-muted-foreground">只需3分钟填写数据，即可获得一份完整的终身财富分析报告</p>
          <Link
            href="/assess"
            className={cn(buttonVariants({ size: "lg" }), "mt-8 inline-flex h-12 px-8 text-base")}
          >
            立即开始
          </Link>
        </div>
      </section>
    </div>
  );
}
