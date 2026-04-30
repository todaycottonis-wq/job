export default function AdminPage() {
  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight mb-1">관리자 패널</h1>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        사용자 및 시스템 설정을 관리합니다.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { label: "총 사용자", value: "0" },
          { label: "총 지원 건수", value: "0" },
          { label: "AI 요청 수", value: "0" },
        ].map(({ label, value }) => (
          <div
            key={label}
            className="rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900"
          >
            <p className="text-xs text-zinc-500 dark:text-zinc-400">{label}</p>
            <p className="mt-1 text-2xl font-semibold">{value}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-xl border border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900">
        <p className="text-sm font-medium mb-3">사용자 목록</p>
        <p className="text-sm text-zinc-400">사용자가 없습니다.</p>
      </div>
    </div>
  );
}
