import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "개인정보 처리방침",
};

const UPDATED_AT = "2026년 5월 1일";

export default function PrivacyPage() {
  return (
    <article className="max-w-3xl mx-auto p-5 sm:p-8 pl-14 md:pl-8">
      <Link
        href="/settings"
        className="inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50 mb-6"
      >
        <ArrowLeft size={12} />
        환경설정으로
      </Link>

      <h1 className="text-2xl font-bold tracking-tight mb-1">
        개인정보 처리방침
      </h1>
      <p className="text-xs text-zinc-400 mb-8">최종 업데이트: {UPDATED_AT}</p>

      <Notice>
        커리업(Career up)은 회원의 개인정보를 「개인정보 보호법」 등 관련 법령에 따라 안전하게 처리합니다. 본 처리방침은 베타 운영 기간을 기준으로 작성되었습니다.
      </Notice>

      <Sec title="1. 수집하는 개인정보 항목">
        <Li>회원가입 시: 이메일, 비밀번호(해시 저장)</Li>
        <Li>서비스 이용 시 자동 수집: 행동 로그(usage_logs), 접속 시각, 사용 기기 정보(브라우저 User-Agent — Vercel 인프라 단)</Li>
        <Li>회원이 직접 입력하는 정보: 회사·직무·지원 일정·이력서·자기소개서 등 취업 관련 콘텐츠</Li>
      </Sec>

      <Sec title="2. 수집 및 이용 목적">
        <Li>회원 식별 및 본인 인증</Li>
        <Li>서비스(지원 현황, 일정, 문서 관리) 제공</Li>
        <Li>서비스 품질 개선을 위한 통계 분석 (개인 식별 불가능한 형태)</Li>
        <Li>비정상 이용 차단 및 보안</Li>
      </Sec>

      <Sec title="3. 보유 및 이용 기간">
        <Li>원칙: 회원 탈퇴 시 즉시 영구 삭제</Li>
        <Li>회원은 언제든 환경설정 → “데이터 초기화” 또는 “계정 삭제”로 본인 데이터를 직접 삭제할 수 있습니다.</Li>
        <Li>법령에 따라 보존이 필요한 정보는 해당 법령에서 정한 기간 동안만 보관합니다.</Li>
      </Sec>

      <Sec title="4. 처리 위탁">
        운영자는 안정적인 서비스 제공을 위해 다음 업체에 개인정보 처리를 위탁합니다.
        <table className="mt-3 w-full text-xs">
          <thead>
            <tr className="border-b border-zinc-200 dark:border-zinc-700 text-zinc-500">
              <th className="text-left font-medium py-2">위탁 대상</th>
              <th className="text-left font-medium py-2">위탁 업무</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b border-zinc-100 dark:border-zinc-800">
              <td className="py-2 font-medium">Supabase Inc.</td>
              <td className="py-2 text-zinc-600 dark:text-zinc-400">
                인증, 데이터베이스, 파일 스토리지 (Seoul 리전)
              </td>
            </tr>
            <tr className="border-b border-zinc-100 dark:border-zinc-800">
              <td className="py-2 font-medium">Vercel Inc.</td>
              <td className="py-2 text-zinc-600 dark:text-zinc-400">
                웹 호스팅, 함수 실행 (Seoul 리전 고정)
              </td>
            </tr>
            <tr>
              <td className="py-2 font-medium">Anthropic, PBC</td>
              <td className="py-2 text-zinc-600 dark:text-zinc-400">
                AI 피드백 분석 (출시 예정 시점부터 적용)
              </td>
            </tr>
          </tbody>
        </table>
      </Sec>

      <Sec title="5. 정보 주체의 권리">
        <Li>본인의 개인정보를 열람·수정·삭제·처리정지할 권리가 있습니다.</Li>
        <Li>열람·수정: 환경설정 페이지에서 직접 확인 가능</Li>
        <Li>삭제: 환경설정 → 위험 영역 → “계정 삭제”</Li>
        <Li>데이터 백업: 환경설정 → “CSV로 내보내기”</Li>
        <Li>그 외 권리 행사 요청은 아래 문의처로 연락 주세요.</Li>
      </Sec>

      <Sec title="6. 안전성 확보 조치">
        <Li>모든 통신은 HTTPS로 암호화됩니다.</Li>
        <Li>비밀번호는 해시 저장되며, 운영자도 원본을 확인할 수 없습니다.</Li>
        <Li>데이터베이스는 Row Level Security(RLS)를 적용하여 본인 외에는 데이터 접근이 차단됩니다.</Li>
        <Li>서버 측 관리 키(service_role)는 환경 변수로만 관리되며, 일반 사용자 흐름에는 노출되지 않습니다.</Li>
      </Sec>

      <Sec title="7. 쿠키 사용">
        <Li>로그인 세션 유지를 위해 Supabase 인증 쿠키를 사용합니다.</Li>
        <Li>온보딩 완료 여부 캐싱을 위해 `jt_onb` 쿠키(HttpOnly)를 사용합니다.</Li>
        <Li>화면 모드(라이트/다크) 설정을 위해 브라우저 localStorage를 사용합니다.</Li>
        <Li>제3자 광고/추적 쿠키는 사용하지 않습니다.</Li>
      </Sec>

      <Sec title="8. 개인정보 보호책임자">
        <Li>책임자: 커리업 운영자</Li>
        <Li>
          이메일:{" "}
          <a
            href="mailto:today.cotton.is@gmail.com"
            className="text-[#3182F6] hover:underline"
          >
            today.cotton.is@gmail.com
          </a>
        </Li>
      </Sec>

      <Sec title="9. 처리방침 변경">
        <Li>본 방침은 정책·법령·서비스 변경에 따라 수정될 수 있으며, 변경 시 서비스 내 공지사항을 통해 안내합니다.</Li>
      </Sec>

      <hr className="my-8 border-zinc-100 dark:border-zinc-800" />

      <p className="text-xs text-zinc-400 leading-relaxed">
        본 방침은 {UPDATED_AT}부터 시행됩니다.
      </p>
    </article>
  );
}

function Sec({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-7">
      <h2 className="text-base font-bold mb-2">{title}</h2>
      <div className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed space-y-1.5">
        {children}
      </div>
    </section>
  );
}

function Li({ children }: { children: React.ReactNode }) {
  return (
    <p className="flex gap-2">
      <span className="text-zinc-400 select-none">·</span>
      <span className="flex-1">{children}</span>
    </p>
  );
}

function Notice({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-blue-100 dark:border-blue-900/40 bg-blue-50/50 dark:bg-blue-900/10 p-4 mb-8 text-sm text-blue-800 dark:text-blue-200 leading-relaxed">
      {children}
    </div>
  );
}
