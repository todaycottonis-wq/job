import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "커리업 · 지원현황";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const PRETENDARD_VARIABLE =
  "https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/packages/pretendard/dist/web/variable/PretendardVariable.woff2";

// 미리보기에 표시할 가짜 지원 카드 데이터
const MOCK_APPS = [
  { company: "카카오", role: "프론트엔드", status: "작성중", color: "#71717a", bg: "#f4f4f5" },
  { company: "토스", role: "프로덕트 디자이너", status: "지원완료", color: "#2563eb", bg: "#dbeafe" },
  { company: "네이버", role: "백엔드", status: "1차면접", color: "#9333ea", bg: "#f3e8ff" },
  { company: "당근마켓", role: "iOS", status: "최종합격", color: "#15803d", bg: "#dcfce7" },
];

export default async function OpenGraphImage(): Promise<ImageResponse> {
  const fontData = await fetch(PRETENDARD_VARIABLE).then((res) =>
    res.arrayBuffer()
  );

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#fafafa",
          display: "flex",
          padding: "72px 80px",
          fontFamily: "Pretendard",
          gap: 64,
        }}
      >
        {/* 좌측: 카피 */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            flex: 1,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 28,
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: "#3182F6",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontSize: 22,
                fontWeight: 800,
              }}
            >
              C
            </div>
            <span
              style={{
                fontSize: 22,
                color: "#52525b",
                fontWeight: 600,
              }}
            >
              커리업 · 지원현황
            </span>
          </div>

          <div
            style={{
              fontSize: 76,
              fontWeight: 800,
              color: "#09090b",
              lineHeight: 1.1,
              letterSpacing: -3,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <span>지원한 회사,</span>
            <span>진행 단계를</span>
            <span style={{ color: "#3182F6" }}>한눈에.</span>
          </div>

          <p
            style={{
              fontSize: 24,
              color: "#71717a",
              marginTop: 24,
              fontWeight: 500,
              letterSpacing: -0.3,
            }}
          >
            위시리스트 → 서류 → 면접 → 합격까지 자동 정리
          </p>
        </div>

        {/* 우측: 지원현황 mock */}
        <div
          style={{
            width: 480,
            background: "white",
            borderRadius: 24,
            border: "1px solid #e4e4e7",
            boxShadow: "0 24px 60px rgba(0, 0, 0, 0.06)",
            display: "flex",
            flexDirection: "column",
            padding: 28,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 20,
            }}
          >
            <span
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: "#18181b",
              }}
            >
              지원현황
            </span>
            <span
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: "white",
                background: "#3182F6",
                padding: "6px 12px",
                borderRadius: 8,
              }}
            >
              + 추가
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {MOCK_APPS.map((app) => (
              <div
                key={app.company}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  background: "#fafafa",
                  borderRadius: 12,
                  padding: "14px 16px",
                }}
              >
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span
                    style={{
                      fontSize: 17,
                      fontWeight: 700,
                      color: "#18181b",
                    }}
                  >
                    {app.company}
                  </span>
                  <span style={{ fontSize: 13, color: "#71717a", marginTop: 2 }}>
                    {app.role}
                  </span>
                </div>
                <span
                  style={{
                    fontSize: 13,
                    fontWeight: 600,
                    color: app.color,
                    background: app.bg,
                    padding: "5px 12px",
                    borderRadius: 999,
                  }}
                >
                  {app.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Pretendard", data: fontData, weight: 500, style: "normal" },
        { name: "Pretendard", data: fontData, weight: 700, style: "normal" },
        { name: "Pretendard", data: fontData, weight: 800, style: "normal" },
      ],
    }
  );
}
