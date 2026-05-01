import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "이용약관",
};

const UPDATED_AT = "2026년 5월 1일";

export default function TermsPage() {
  return (
    <article className="max-w-3xl mx-auto p-5 sm:p-8 pl-14 md:pl-8 prose-zinc">
      <Link
        href="/settings"
        className="inline-flex items-center gap-1 text-xs text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50 mb-6"
      >
        <ArrowLeft size={12} />
        환경설정으로
      </Link>

      <h1 className="text-2xl font-bold tracking-tight mb-1">이용약관</h1>
      <p className="text-xs text-zinc-400 mb-8">최종 업데이트: {UPDATED_AT}</p>

      <Notice>
        커리업(Career up)은 현재 베타 서비스로 운영 중입니다. 본 약관은 베타 운영 기간 동안 적용되며, 정식 출시 시 일부 조항이 변경될 수 있습니다.
      </Notice>

      <Sec title="제1조 (목적)">
        본 약관은 커리업(이하 “서비스”)이 제공하는 취업 지원 관리 서비스 이용에 관한 조건과 절차, 이용자와 서비스 운영자의 권리·의무를 규정함을 목적으로 합니다.
      </Sec>

      <Sec title="제2조 (정의)">
        <Li>“서비스”란 운영자가 제공하는 취업 지원 현황 추적, 일정 관리, 문서 보관, AI 피드백 등의 기능을 의미합니다.</Li>
        <Li>“회원”이란 본 약관에 동의하고 회원가입을 완료한 자를 의미합니다.</Li>
        <Li>“계정”이란 이메일과 비밀번호로 식별되는 회원의 식별자를 의미합니다.</Li>
      </Sec>

      <Sec title="제3조 (서비스 이용)">
        <Li>회원가입은 이메일 주소와 비밀번호 등록 후 이메일 인증을 완료한 시점에 성립합니다.</Li>
        <Li>회원은 본인의 계정 정보(이메일·비밀번호)를 안전하게 관리할 책임이 있습니다.</Li>
        <Li>운영자는 무료로 서비스를 제공하며, 베타 기간 동안 결제 정보를 수집하지 않습니다.</Li>
        <Li>회원은 환경설정에서 자신의 데이터 초기화 또는 계정 삭제를 직접 수행할 수 있습니다.</Li>
      </Sec>

      <Sec title="제4조 (회원의 의무)">
        <Li>타인의 정보를 도용하거나 허위 정보로 가입하지 않습니다.</Li>
        <Li>서비스의 정상적인 운영을 방해하는 행위(과도한 자동화 요청, 보안 우회 시도 등)를 하지 않습니다.</Li>
        <Li>업로드한 문서 등 콘텐츠에 대한 저작권 및 적법성 책임은 회원 본인에게 있습니다.</Li>
        <Li>관계 법령, 본 약관 및 서비스 이용 안내를 준수합니다.</Li>
      </Sec>

      <Sec title="제5조 (서비스 운영자의 의무)">
        <Li>운영자는 회원의 데이터를 본인 외에는 접근할 수 없도록 행 수준 보안(Row Level Security)을 적용합니다.</Li>
        <Li>운영자는 베타 기간 중 안정적인 서비스 제공을 위해 노력하나, 사전 공지 후 일시적으로 서비스를 중단할 수 있습니다.</Li>
        <Li>운영자는 회원의 데이터를 서비스 제공 목적 외로 사용하지 않으며, 제3자에게 판매하지 않습니다.</Li>
      </Sec>

      <Sec title="제6조 (저작권 및 콘텐츠)">
        <Li>서비스의 디자인, 로고, 코드, 콘텐츠 등 모든 저작권은 운영자에게 있으며, 무단 복제·배포·2차 가공을 금지합니다.</Li>
        <Li>회원이 직접 입력하거나 업로드한 콘텐츠의 저작권은 회원 본인에게 있으며, 운영자는 서비스 제공 목적 범위 내에서만 처리합니다.</Li>
      </Sec>

      <Sec title="제7조 (서비스 변경 및 중단)">
        <Li>운영자는 서비스 개선을 위해 기능을 추가, 수정, 삭제할 수 있습니다.</Li>
        <Li>베타 종료 또는 정식 출시 시점에 약관·정책이 변경될 수 있으며, 변경 시 사전에 공지합니다.</Li>
      </Sec>

      <Sec title="제8조 (면책)">
        <Li>운영자는 천재지변, 외부 인프라 장애(Vercel, Supabase 등) 등 운영자의 통제 밖 사유로 인한 서비스 장애에 대해 책임지지 않습니다.</Li>
        <Li>회원이 입력한 정보의 정확성, 신뢰성에 대해서는 회원 본인이 책임집니다.</Li>
        <Li>AI 피드백 등 자동 분석 결과는 참고용이며, 채용 결과를 보장하지 않습니다.</Li>
      </Sec>

      <Sec title="제9조 (회원 탈퇴 및 데이터 삭제)">
        <Li>회원은 환경설정 → 위험 영역 → “계정 삭제”에서 직접 탈퇴할 수 있습니다.</Li>
        <Li>탈퇴 시 회원의 모든 개인정보 및 콘텐츠는 즉시 영구 삭제되며 복구되지 않습니다.</Li>
      </Sec>

      <Sec title="제10조 (분쟁 해결)">
        <Li>본 약관과 관련된 분쟁은 대한민국 법령에 따르며, 관할법원은 민사소송법에 따릅니다.</Li>
      </Sec>

      <hr className="my-8 border-zinc-100 dark:border-zinc-800" />

      <p className="text-xs text-zinc-400 leading-relaxed">
        문의:{" "}
        <a
          href="mailto:today.cotton.is@gmail.com"
          className="text-[#3182F6] hover:underline"
        >
          today.cotton.is@gmail.com
        </a>
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
