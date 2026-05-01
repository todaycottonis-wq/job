import { EssayDetail } from "@/components/essays/essay-detail";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "자소서 폴더",
};

export default async function EssayDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <div className="p-5 sm:p-6 max-w-4xl mx-auto pl-14 md:pl-6">
      <EssayDetail essayId={id} />
    </div>
  );
}
