"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { X, Undo2 } from "lucide-react";

interface ToastItem {
  id: number;
  message: string;
  variant: "info" | "success" | "error";
  undoLabel?: string;
  onUndo?: () => void | Promise<void>;
  duration: number;
}

interface ToastApi {
  show: (
    message: string,
    opts?: {
      variant?: ToastItem["variant"];
      duration?: number;
      undoLabel?: string;
      onUndo?: () => void | Promise<void>;
    }
  ) => void;
}

const ToastCtx = createContext<ToastApi | null>(null);

export function useToast(): ToastApi {
  const ctx = useContext(ToastCtx);
  if (!ctx) {
    return {
      show: () => {
        // SSR / 컨텍스트 밖 호출 — 무시
      },
    };
  }
  return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ToastItem[]>([]);
  const idRef = useRef(0);
  const timersRef = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

  const dismiss = useCallback((id: number) => {
    setItems((prev) => prev.filter((t) => t.id !== id));
    const t = timersRef.current.get(id);
    if (t) {
      clearTimeout(t);
      timersRef.current.delete(id);
    }
  }, []);

  const show = useCallback<ToastApi["show"]>(
    (message, opts) => {
      const id = ++idRef.current;
      const item: ToastItem = {
        id,
        message,
        variant: opts?.variant ?? "info",
        duration: opts?.duration ?? 5000,
        undoLabel: opts?.undoLabel,
        onUndo: opts?.onUndo,
      };
      setItems((prev) => [...prev, item]);
      const timer = setTimeout(() => dismiss(id), item.duration);
      timersRef.current.set(id, timer);
    },
    [dismiss]
  );

  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      timers.forEach((t) => clearTimeout(t));
      timers.clear();
    };
  }, []);

  return (
    <ToastCtx.Provider value={{ show }}>
      {children}
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[100] flex flex-col gap-2 pointer-events-none">
        {items.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.16)] flex items-center gap-3 px-4 py-3 min-w-[280px] max-w-[420px] text-sm font-medium animate-in slide-in-from-bottom-4 ${
              t.variant === "success"
                ? "bg-zinc-900 text-white"
                : t.variant === "error"
                ? "bg-red-600 text-white"
                : "bg-zinc-900 text-white"
            }`}
          >
            <span className="flex-1">{t.message}</span>
            {t.undoLabel && t.onUndo && (
              <button
                onClick={async () => {
                  dismiss(t.id);
                  await t.onUndo?.();
                }}
                className="flex items-center gap-1 rounded-lg bg-white/15 hover:bg-white/25 px-2.5 py-1 text-xs font-semibold transition-colors"
              >
                <Undo2 size={12} />
                {t.undoLabel}
              </button>
            )}
            <button
              onClick={() => dismiss(t.id)}
              className="rounded-md p-1 text-white/60 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="닫기"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </ToastCtx.Provider>
  );
}
