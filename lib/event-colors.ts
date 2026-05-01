export const EVENT_COLOR_OPTIONS = [
  { id: "purple",  label: "보라", bg: "bg-purple-500",  light: "bg-purple-100 text-purple-700" },
  { id: "red",     label: "빨강", bg: "bg-red-500",     light: "bg-red-100 text-red-700" },
  { id: "blue",    label: "파랑", bg: "bg-blue-500",    light: "bg-blue-100 text-blue-700" },
  { id: "green",   label: "초록", bg: "bg-green-500",   light: "bg-green-100 text-green-700" },
  { id: "yellow",  label: "노랑", bg: "bg-yellow-500",  light: "bg-yellow-100 text-yellow-700" },
  { id: "pink",    label: "핑크", bg: "bg-pink-500",    light: "bg-pink-100 text-pink-700" },
  { id: "orange",  label: "주황", bg: "bg-orange-500",  light: "bg-orange-100 text-orange-700" },
  { id: "zinc",    label: "회색", bg: "bg-zinc-400",    light: "bg-zinc-100 text-zinc-700" },
] as const;

type EventColor = (typeof EVENT_COLOR_OPTIONS)[number];

const MAP = new Map<string, EventColor>(
  EVENT_COLOR_OPTIONS.map((c) => [c.id, c])
);

export function getEventColor(id: string | null | undefined): EventColor {
  return MAP.get(id ?? "purple") ?? EVENT_COLOR_OPTIONS[0];
}
