import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { LayoutWrapper } from "@/components/layout-wrapper";
import { ToastProvider } from "@/components/ui/toast";
import { FloatingAdd } from "@/components/floating-add";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const APP_NAME = "Career up";
const APP_NAME_KO = "커리업";
const APP_DESC =
  "취업 지원 현황 · 면접 일정 · 이력서·자소서까지 한 곳에서 관리하는 취준생 대시보드";
const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL ?? "https://job-kappa-coral.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(APP_URL),
  title: {
    default: `${APP_NAME_KO} (${APP_NAME}) · 취준 현황을 한눈에`,
    template: `%s · ${APP_NAME_KO}`,
  },
  description: APP_DESC,
  applicationName: APP_NAME,
  keywords: [
    "취업",
    "취준",
    "지원 현황",
    "면접",
    "이력서",
    "자기소개서",
    "Career up",
    "커리업",
  ],
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: APP_URL,
    siteName: APP_NAME,
    title: `${APP_NAME_KO} · 취준 현황을 한눈에`,
    description: APP_DESC,
  },
  twitter: {
    card: "summary",
    title: `${APP_NAME_KO} · 취준 현황을 한눈에`,
    description: APP_DESC,
  },
  robots: { index: true, follow: true },
  formatDetection: { telephone: false },
};

export const viewport = {
  themeColor: "#3182F6",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="h-full bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50">
        <ToastProvider>
          <LayoutWrapper>{children}</LayoutWrapper>
          <FloatingAdd />
        </ToastProvider>
      </body>
    </html>
  );
}
