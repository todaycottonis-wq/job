export type CountMode = "with_spaces" | "without_spaces";

export function countChars(text: string, mode: CountMode): number {
  if (mode === "without_spaces") {
    return text.replace(/\s/g, "").length;
  }
  return text.length;
}

export function modeLabel(mode: CountMode): string {
  return mode === "without_spaces" ? "공백 제외" : "공백 포함";
}
