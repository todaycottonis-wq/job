interface Props {
  /** YYYY-MM-DD or ISO string */
  date: string;
  /** 라벨 prefix (기본 'D') */
  prefix?: string;
}

export function DDayBadge({ date, prefix = "D" }: Props) {
  const target = new Date(date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  target.setHours(0, 0, 0, 0);
  const diffDays = Math.round(
    (target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  let label: string;
  let cls: string;
  let pulse = false;

  if (diffDays < 0) {
    label = `${prefix}+${Math.abs(diffDays)}`;
    cls = "bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500";
  } else if (diffDays === 0) {
    label = `${prefix}-DAY`;
    cls = "bg-red-500 text-white";
    pulse = true;
  } else if (diffDays <= 3) {
    label = `${prefix}-${diffDays}`;
    cls = "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300";
  } else if (diffDays <= 7) {
    label = `${prefix}-${diffDays}`;
    cls = "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300";
  } else {
    label = `${prefix}-${diffDays}`;
    cls = "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400";
  }

  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide ${cls} ${
        pulse ? "animate-pulse" : ""
      }`}
    >
      {label}
    </span>
  );
}
