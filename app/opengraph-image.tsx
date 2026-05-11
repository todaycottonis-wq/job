import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "커리업 · 취준 현황을 한눈에";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// 한글 글리프를 위해 Pretendard 가변 폰트 한 번만 fetch (CDN 캐시됨)
const PRETENDARD_VARIABLE =
  "https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/packages/pretendard/dist/web/variable/PretendardVariable.woff2";

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
          background:
            "linear-gradient(135deg, #ffffff 0%, #eff6ff 60%, #dbeafe 100%)",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "96px",
          fontFamily: "Pretendard",
          position: "relative",
        }}
      >
        {/* 우상단 배경 점 패턴 */}
        <div
          style={{
            position: "absolute",
            top: 80,
            right: 80,
            width: 280,
            height: 280,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(49, 130, 246, 0.18) 0%, rgba(49, 130, 246, 0) 70%)",
            display: "flex",
          }}
        />

        {/* 로고 + 워드마크 */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 18,
            marginBottom: 56,
          }}
        >
          <div
            style={{
              width: 76,
              height: 76,
              borderRadius: 20,
              background: "#3182F6",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontSize: 44,
              fontWeight: 800,
              letterSpacing: -2,
            }}
          >
            C
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <span
              style={{
                fontSize: 22,
                color: "#3182F6",
                fontWeight: 600,
                letterSpacing: 1,
              }}
            >
              CAREER UP
            </span>
            <span
              style={{
                fontSize: 38,
                fontWeight: 700,
                color: "#18181b",
                letterSpacing: -1,
                marginTop: -2,
              }}
            >
              커리업
            </span>
          </div>
        </div>

        {/* 메인 카피 */}
        <div
          style={{
            fontSize: 110,
            fontWeight: 800,
            color: "#09090b",
            lineHeight: 1.05,
            letterSpacing: -4,
            display: "flex",
            flexDirection: "column",
          }}
        >
          <span>취준 현황을</span>
          <span style={{ color: "#3182F6" }}>한눈에.</span>
        </div>

        {/* 부제 */}
        <p
          style={{
            fontSize: 32,
            color: "#52525b",
            marginTop: 36,
            fontWeight: 500,
            letterSpacing: -0.5,
          }}
        >
          지원 · 면접 · 자소서까지 한 곳에서
        </p>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Pretendard", data: fontData, weight: 400, style: "normal" },
        { name: "Pretendard", data: fontData, weight: 700, style: "normal" },
        { name: "Pretendard", data: fontData, weight: 800, style: "normal" },
      ],
    }
  );
}
