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
  authors: [{ name: "Cotton" }],
  creator: "Cotton",
  publisher: APP_NAME,
  alternates: {
    canonical: "/",
  },
  // 검색엔진 사이트 소유 확인
  verification: {
    google: "m67GJALpkSVJV4CMUfMcOuPEy7jeVhNE_CxOipXNwTg",
    other: {
      "naver-site-verification": "bac29fc8606d73fa9232b12720620620e05b140e",
    },
  },
};

export const viewport = {
  themeColor: "#3182F6",
  width: "device-width",
  initialScale: 1,
};

// paint 전 dark class 적용해 flicker 방지
const themeScript = `
(function(){try{
  var s = localStorage.getItem('theme') || 'system';
  var sysDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  var dark = s === 'dark' || (s === 'system' && sysDark);
  if (dark) document.documentElement.classList.add('dark');
}catch(e){}})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="h-full bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50">
        <ToastProvider>
          <LayoutWrapper>{children}</LayoutWrapper>
          <FloatingAdd />
        </ToastProvider>
      </body>
    </html>
  );
}
