import { DocumentsView } from "@/components/documents/documents-view";

export default function DocumentsPage() {
  return (
    <div className="p-6">
      <div className="mb-1">
        <h1 className="text-2xl font-semibold tracking-tight">문서함</h1>
      </div>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">
        이력서, 자기소개서, 포트폴리오를 관리하세요.
      </p>

      <div className="mt-6">
        <DocumentsView />
      </div>
    </div>
  );
}
