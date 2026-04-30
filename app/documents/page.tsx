export default function DocumentsPage() {
  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-1">
        <h1 className="text-2xl font-semibold tracking-tight">문서함</h1>
        <button className="rounded-lg bg-zinc-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200 transition-colors">
          + 문서 추가
        </button>
      </div>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        이력서, 자기소개서, 포트폴리오를 관리하세요.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border border-dashed border-zinc-200 bg-white p-8 dark:border-zinc-700 dark:bg-zinc-900 flex flex-col items-center justify-center text-center">
          <p className="text-sm text-zinc-400">문서가 없습니다.</p>
          <p className="mt-1 text-xs text-zinc-300 dark:text-zinc-600">
            + 문서 추가를 눌러 시작하세요.
          </p>
        </div>
      </div>
    </div>
  );
}
