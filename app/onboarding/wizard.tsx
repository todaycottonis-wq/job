"use client";

import { useState, useTransition } from "react";
import { Briefcase, CalendarCheck, Sparkles, ArrowRight, X } from "lucide-react";
import {
  completeOnboarding,
  logOnboardingStep,
  skipOnboarding,
} from "@/app/actions/onboarding";

const STEPS = [
  {
    icon: <Briefcase size={36} strokeWidth={1.5} className="text-[#3182F6]" />,
    tag: "지원현황",
    title: "흩어진 지원 기록,\n한 곳에서",
    desc: "지원한 회사와 진행 상태를 한 화면에서 추적하세요. 서류·면접·합격 여부까지 빠짐없이 기록할 수 있어요.",
  },
  {
    icon: <CalendarCheck size={36} strokeWidth={1.5} className="text-[#3182F6]" />,
    tag: "캘린더",
    title: "면접·마감일을\n놓치지 않게",
    desc: "면접 일정과 지원 마감일을 캘린더에서 한눈에 확인하세요. 중요한 날짜를 놓쳐 후회하는 일이 없어집니다.",
  },
  {
    icon: <Sparkles size={36} strokeWidth={1.5} className="text-[#3182F6]" />,
    tag: "AI 피드백",
    title: "AI가 방향을\n잡아드려요",
    desc: "이력서와 자기소개서를 AI가 분석하고 개선 방향을 제안해 드려요. 혼자 고민하던 시간을 아낄 수 있어요.",
  },
] as const;

export function OnboardingWizard() {
  const [step, setStep] = useState(0);
  const [pending, startTransition] = useTransition();

  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;

  function goNext() {
    const next = step + 1;
    setStep(next);
    void logOnboardingStep(next + 1);
  }

  function jumpTo(i: number) {
    setStep(i);
    void logOnboardingStep(i + 1);
  }

  function handleSkip() {
    startTransition(() => {
      void skipOnboarding();
    });
  }

  function handleFinish() {
    startTransition(() => {
      void completeOnboarding();
    });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-zinc-900 shadow-[0_8px_32px_rgba(0,0,0,0.08)] flex flex-col">
        <div className="flex items-center justify-between px-5 pt-4">
          <span className="text-xs font-medium text-[#3182F6]">
            {current.tag}
          </span>
          <button
            type="button"
            onClick={handleSkip}
            disabled={pending}
            className="flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors disabled:opacity-50"
          >
            건너뛰기
            <X size={12} />
          </button>
        </div>

        <div className="px-6 pt-5 pb-6 flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#3182F6]/10 flex items-center justify-center mb-5">
            {current.icon}
          </div>

          <h2 className="text-[22px] font-bold tracking-tight leading-snug mb-2 text-zinc-900 dark:text-zinc-50 whitespace-pre-line">
            {current.title}
          </h2>

          <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
            {current.desc}
          </p>
        </div>

        <div className="px-6 pb-6 flex flex-col items-center gap-4">
          <div className="flex gap-1.5">
            {STEPS.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => jumpTo(i)}
                className={`rounded-full transition-all ${
                  i === step
                    ? "w-5 h-1.5 bg-[#3182F6]"
                    : "w-1.5 h-1.5 bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600"
                }`}
                aria-label={`${i + 1}번째 단계`}
              />
            ))}
          </div>

          {isLast ? (
            <button
              type="button"
              onClick={handleFinish}
              disabled={pending}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#3182F6] px-4 py-3 text-sm font-semibold text-white hover:bg-[#1a6fe8] active:bg-[#1560d4] transition-colors disabled:opacity-60"
            >
              {pending ? "이동 중..." : "첫 지원 추가하기"}
              <ArrowRight size={15} />
            </button>
          ) : (
            <button
              type="button"
              onClick={goNext}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#3182F6] px-4 py-3 text-sm font-semibold text-white hover:bg-[#1a6fe8] active:bg-[#1560d4] transition-colors"
            >
              다음
              <ArrowRight size={15} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
