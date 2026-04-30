import { Sparkles, Bell, Award, Target, Compass } from "lucide-react";

export default function AiFeedbackPage() {
  return (
    <div className="p-5 sm:p-6 max-w-3xl mx-auto pl-14 md:pl-6">
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <h1 className="text-2xl font-bold tracking-tight">AI 피드백</h1>
          <span className="rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300 text-[10px] font-bold px-2 py-0.5">
            출시 예정
          </span>
        </div>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          현재는 베타 테스트 중이에요. 곧 정식 출시 예정입니다.
        </p>
      </div>

      <div className="rounded-2xl border border-zinc-100 dark:border-zinc-800 bg-gradient-to-br from-[#3182F6]/8 to-transparent p-7 sm:p-9 text-center">
        <div className="mx-auto w-14 h-14 rounded-2xl bg-[#3182F6]/10 flex items-center justify-center mb-4">
          <Sparkles size={22} className="text-[#3182F6]" />
        </div>
        <h2 className="text-[20px] sm:text-[22px] font-bold tracking-tight mb-2">
          AI가 이력서를 분석해드릴게요
        </h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed max-w-md mx-auto">
          현재 베타 테스트 중인 기능입니다.<br />
          정식 출시 전이라 잠시만 기다려주세요. 출시되면 사이드바 메뉴에서 바로 안내드릴게요.
        </p>
        <button
          type="button"
          disabled
          className="mt-6 inline-flex items-center gap-1.5 rounded-xl bg-zinc-200 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 px-5 py-2.5 text-sm font-semibold cursor-not-allowed"
        >
          <Bell size={14} />
          출시 예정
        </button>
      </div>

      <div className="mt-6">
        <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 mb-3 tracking-wide">
          출시되면 이런 분석을 받아볼 수 있어요
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <PreviewCard
            icon={<Award size={16} className="text-amber-500" />}
            title="또래 비교"
            desc="같은 연차·직무에서 돋보이는 영역과 채워가면 좋은 영역을 짚어줍니다."
          />
          <PreviewCard
            icon={<Target size={16} className="text-purple-500" />}
            title="Best Match 직무"
            desc="이력서·포폴 기반으로 가장 잘 맞을 직무 3가지와 추천 회사."
          />
          <PreviewCard
            icon={<Sparkles size={16} className="text-[#3182F6]" />}
            title="섹션별 리뷰"
            desc="이력서 각 섹션을 분석해 무엇을 보완하면 좋을지 제안."
          />
          <PreviewCard
            icon={<Compass size={16} className="text-green-500" />}
            title="커리어 경로"
            desc="단기·중기·장기 커리어 방향을 제안해드립니다."
          />
        </div>
      </div>
    </div>
  );
}

function PreviewCard({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="rounded-xl border border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4">
      <div className="flex items-center gap-2 mb-1.5">
        <div className="w-7 h-7 rounded-lg bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center">
          {icon}
        </div>
        <p className="text-sm font-bold">{title}</p>
      </div>
      <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
        {desc}
      </p>
    </div>
  );
}
