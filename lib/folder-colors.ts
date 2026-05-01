/**
 * 폴더 색상 팔레트. id를 DB에 저장하고 UI에서 매핑.
 */
export interface FolderColorOption {
  id: string;
  label: string;
  /** Tailwind classes for tile bg + icon stroke/fill */
  bg: string;
  icon: string; // hex (SVG fill)
  stroke: string; // hex (SVG stroke)
}

export const FOLDER_COLORS: FolderColorOption[] = [
  { id: "blush",    label: "핑크",   bg: "bg-pink-100 dark:bg-pink-900/30",   icon: "#F472B6", stroke: "#9D174D" },
  { id: "peach",    label: "피치",   bg: "bg-orange-100 dark:bg-orange-900/30", icon: "#FB923C", stroke: "#9A3412" },
  { id: "sand",     label: "샌드",   bg: "bg-amber-100 dark:bg-amber-900/30",  icon: "#FBBF24", stroke: "#92400E" },
  { id: "mint",     label: "민트",   bg: "bg-emerald-100 dark:bg-emerald-900/30", icon: "#34D399", stroke: "#065F46" },
  { id: "sky",      label: "스카이", bg: "bg-sky-100 dark:bg-sky-900/30",      icon: "#38BDF8", stroke: "#075985" },
  { id: "lavender", label: "라벤더", bg: "bg-purple-100 dark:bg-purple-900/30", icon: "#A78BFA", stroke: "#5B21B6" },
  { id: "slate",    label: "슬레이트", bg: "bg-zinc-100 dark:bg-zinc-800",      icon: "#A1A1AA", stroke: "#3F3F46" },
];

const COLOR_MAP = new Map(FOLDER_COLORS.map((c) => [c.id, c]));

export function getFolderColor(id: string | null | undefined): FolderColorOption {
  return COLOR_MAP.get(id ?? "blush") ?? FOLDER_COLORS[0];
}
