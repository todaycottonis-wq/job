import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "커리업 (Career up)",
    short_name: "커리업",
    description:
      "취준 현황·면접 일정·이력서까지 한 곳에서 관리하는 취준생 대시보드",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#F9FAFB",
    theme_color: "#3182F6",
    lang: "ko",
    dir: "ltr",
    orientation: "any",
    categories: ["productivity", "business"],
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-maskable.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    shortcuts: [
      {
        name: "지원 현황",
        short_name: "지원",
        description: "지원한 회사 목록 보기",
        url: "/applications",
      },
      {
        name: "캘린더",
        short_name: "캘린더",
        description: "면접·마감 일정 확인",
        url: "/calendar",
      },
      {
        name: "문서함",
        short_name: "문서",
        description: "이력서·자소서 보관함",
        url: "/documents",
      },
    ],
  };
}
