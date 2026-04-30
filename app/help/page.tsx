export default function HelpPage() {
  return (
    <div className="p-6 max-w-2xl">
      <h1 className="text-2xl font-semibold tracking-tight mb-1">도움말</h1>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        JobTrack 기능 사용법을 안내합니다.
      </p>

      <div className="mt-6 space-y-4">
        <Section title="지원현황">
          <Step n={1} text="+ 지원 추가 버튼을 클릭합니다." />
          <Step n={2} text="회사명, 직무명, 상태, 지원일 등을 입력하고 추가합니다." />
          <Step n={3} text="목록의 항목을 클릭하면 수정할 수 있습니다." />
          <Step n={4} text="행에 마우스를 올리면 삭제 버튼이 나타납니다." />
          <Step n={5} text="상단 탭에서 상태별로 필터링할 수 있습니다." />
        </Section>

        <Section title="캘린더">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            면접 일정과 지원 마감일을 한눈에 확인하는 기능입니다. 곧 업데이트될 예정입니다.
          </p>
        </Section>

        <Section title="문서함">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            이력서, 자기소개서, 포트폴리오를 저장하고 버전을 관리하는 기능입니다. 곧 업데이트될 예정입니다.
          </p>
        </Section>

        <Section title="AI 피드백">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            문서함에 등록한 이력서나 자기소개서를 선택하면 Claude AI가 구체적인 개선 방안을 제안합니다. 곧 업데이트될 예정입니다.
          </p>
        </Section>
      </div>

      <div className="mt-8">
        <h2 className="text-base font-semibold mb-3">자주 묻는 질문 (FAQ)</h2>
        <div className="space-y-3">
          <Faq
            q="지원 상태는 어떻게 바꾸나요?"
            a="지원현황 페이지에서 수정하려는 항목을 클릭하면 수정 폼이 열립니다. '진행 상태' 드롭다운에서 원하는 상태로 변경 후 저장하세요."
          />
          <Faq
            q="삭제한 지원은 복구할 수 있나요?"
            a="현재는 삭제 후 복구 기능이 없습니다. 삭제 전 확인 팝업이 표시되니 신중하게 진행해주세요."
          />
          <Faq
            q="AI 피드백은 어떻게 받나요?"
            a="문서함에 이력서 또는 자기소개서를 먼저 등록한 뒤, AI 피드백 메뉴에서 해당 문서를 선택하면 분석을 시작합니다. (기능 업데이트 예정)"
          />
          <Faq
            q="로그아웃은 어디서 하나요?"
            a="왼쪽 사이드바 맨 아래 '로그아웃' 버튼을 클릭하세요."
          />
        </div>
      </div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 p-4">
      <h2 className="text-sm font-semibold mb-3">{title}</h2>
      <div className="space-y-1.5">{children}</div>
    </div>
  );
}

function Step({ n, text }: { n: number; text: string }) {
  return (
    <div className="flex items-start gap-2.5">
      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-xs font-medium text-zinc-600 dark:text-zinc-400 mt-0.5">
        {n}
      </span>
      <p className="text-sm text-zinc-700 dark:text-zinc-300">{text}</p>
    </div>
  );
}

function Faq({ q, a }: { q: string; a: string }) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900 p-4">
      <p className="text-sm font-medium mb-1">{q}</p>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">{a}</p>
    </div>
  );
}
