"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Plus } from "lucide-react";
import { ApplicationForm } from "@/components/applications/application-form";
import { useToast } from "@/components/ui/toast";

// /applications는 자체 + 버튼 있어서 FAB 숨김
const HIDDEN_PREFIXES = ["/login", "/onboarding", "/admin", "/applications"];

export function FloatingAdd() {
  const pathname = usePathname();
  const toast = useToast();
  const [open, setOpen] = useState(false);

  const hidden = HIDDEN_PREFIXES.some(
    (p) => pathname === p || pathname?.startsWith(p + "/")
  );
  if (hidden) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="지원 빠른 추가"
        className="fixed bottom-5 right-5 md:bottom-7 md:right-7 z-30 flex items-center gap-1.5 rounded-full bg-[#3182F6] hover:bg-[#1a6fe8] active:bg-[#1560d4] text-white px-4 py-3 shadow-[0_8px_24px_rgba(49,130,246,0.4)] transition-all hover:shadow-[0_10px_28px_rgba(49,130,246,0.5)] hover:-translate-y-0.5"
      >
        <Plus size={18} strokeWidth={2.5} />
        <span className="hidden sm:inline text-sm font-semibold">지원 추가</span>
      </button>

      {open && (
        <ApplicationForm
          mode="create"
          onClose={() => setOpen(false)}
          onSuccess={() => {
            setOpen(false);
            toast.show("지원을 추가했어요", { variant: "success" });
          }}
        />
      )}
    </>
  );
}
