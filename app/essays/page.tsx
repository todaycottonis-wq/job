import { EssayList } from "@/components/essays/essay-list";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "자소서 — 회사별 문항 관리",
  description: "회사별로 자소서 문항을 모아 작성하고 관리하세요.",
};

export default function EssaysPage() {
  return (
    <div className="p-5 sm:p-6 max-w-5xl mx-auto pl-14 md:pl-6">
      <EssayList />
    </div>
  );
}
