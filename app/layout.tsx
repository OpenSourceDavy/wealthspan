import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "WealthSpan - 一辈子能赚多少钱",
  description: "精算你的终身收入、个税、社保养老金，评估你需要多少钱才能体面养老",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-sm">
          <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
            <Link href="/" className="flex items-center gap-2 font-semibold text-lg tracking-tight">
              <span className="inline-block size-7 rounded-lg bg-primary text-primary-foreground text-center leading-7 text-sm font-bold">
                W$
              </span>
              WealthSpan
            </Link>
            <nav className="flex items-center gap-4 text-sm text-muted-foreground">
              <Link href="/" className="hover:text-foreground transition-colors">首页</Link>
              <Link href="/assess" className="hover:text-foreground transition-colors">开始计算</Link>
            </nav>
          </div>
        </header>
        <main className="flex-1">{children}</main>
        <footer className="border-t py-6 text-center text-xs text-muted-foreground">
          <div className="mx-auto max-w-5xl px-4">
            WealthSpan &copy; {new Date().getFullYear()} &mdash;
            终身财富与养老精算工具，结果仅供参考
          </div>
        </footer>
      </body>
    </html>
  );
}
