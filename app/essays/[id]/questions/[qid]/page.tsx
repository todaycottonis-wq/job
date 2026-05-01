import { QuestionEditor } from "@/components/essays/question-editor";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "자소서 문항",
};

export default async function QuestionEditorPage({
  params,
}: {
  params: Promise<{ id: string; qid: string }>;
}) {
  const { id, qid } = await params;
  return (
    <div className="p-5 sm:p-6 max-w-3xl mx-auto pl-14 md:pl-6">
      <QuestionEditor essayId={id} questionId={qid} />
    </div>
  );
}
