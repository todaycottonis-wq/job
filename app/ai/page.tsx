export default function AiFeedbackPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold tracking-tight mb-1">AI 피드백</h1>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        이력서와 자기소개서에 대한 AI 피드백을 받아보세요.
      </p>

      <div className="mt-6 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <p className="text-sm font-medium mb-3">분석할 문서 선택</p>
        <div className="rounded-lg border border-dashed border-zinc-200 dark:border-zinc-700 p-8 text-center">
          <p className="text-sm text-zinc-400">
            문서를 먼저 문서함에 등록하세요.
          </p>
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <p className="text-sm font-medium mb-3">최근 피드백</p>
        <p className="text-sm text-zinc-400">아직 피드백 내역이 없습니다.</p>
      </div>
    </div>
  );
}
