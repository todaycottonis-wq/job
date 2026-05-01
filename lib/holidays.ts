/**
 * 대한민국 공휴일 (2026 ~ 2028)
 * date: YYYY-MM-DD
 *
 * 음력 기반 공휴일(설날·부처님오신날·추석)은 매년 다르므로 직접 명시.
 * 대체공휴일은 행정안전부 고시 기준.
 */
export interface Holiday {
  date: string;
  name: string;
  /** 음력/대체 등 비고 — 표시는 안 함, 검색·디버깅용 */
  note?: string;
}

const HOLIDAYS: Holiday[] = [
  // ── 2026 ─────────────────────────────────────────────
  { date: "2026-01-01", name: "신정" },
  { date: "2026-02-16", name: "설날 연휴", note: "음력 12/29" },
  { date: "2026-02-17", name: "설날", note: "음력 1/1" },
  { date: "2026-02-18", name: "설날 연휴", note: "음력 1/2" },
  { date: "2026-03-01", name: "삼일절" },
  { date: "2026-03-02", name: "대체공휴일", note: "삼일절 대체" },
  { date: "2026-05-05", name: "어린이날" },
  { date: "2026-05-24", name: "부처님오신날", note: "음력 4/8" },
  { date: "2026-05-25", name: "대체공휴일", note: "부처님오신날 대체" },
  { date: "2026-06-06", name: "현충일" },
  { date: "2026-08-15", name: "광복절" },
  { date: "2026-08-17", name: "대체공휴일", note: "광복절 대체" },
  { date: "2026-09-24", name: "추석 연휴", note: "음력 8/14" },
  { date: "2026-09-25", name: "추석", note: "음력 8/15" },
  { date: "2026-09-26", name: "추석 연휴", note: "음력 8/16" },
  { date: "2026-10-03", name: "개천절" },
  { date: "2026-10-05", name: "대체공휴일", note: "개천절 대체" },
  { date: "2026-10-09", name: "한글날" },
  { date: "2026-12-25", name: "성탄절" },

  // ── 2027 ─────────────────────────────────────────────
  { date: "2027-01-01", name: "신정" },
  { date: "2027-02-06", name: "설날 연휴", note: "음력 12/30" },
  { date: "2027-02-07", name: "설날", note: "음력 1/1" },
  { date: "2027-02-08", name: "설날 연휴", note: "음력 1/2" },
  { date: "2027-02-09", name: "대체공휴일", note: "설날 대체" },
  { date: "2027-03-01", name: "삼일절" },
  { date: "2027-05-05", name: "어린이날" },
  { date: "2027-05-13", name: "부처님오신날", note: "음력 4/8" },
  { date: "2027-06-06", name: "현충일" },
  { date: "2027-08-15", name: "광복절" },
  { date: "2027-08-16", name: "대체공휴일", note: "광복절 대체" },
  { date: "2027-09-14", name: "추석 연휴", note: "음력 8/14" },
  { date: "2027-09-15", name: "추석", note: "음력 8/15" },
  { date: "2027-09-16", name: "추석 연휴", note: "음력 8/16" },
  { date: "2027-10-03", name: "개천절" },
  { date: "2027-10-04", name: "대체공휴일", note: "개천절 대체" },
  { date: "2027-10-09", name: "한글날" },
  { date: "2027-10-11", name: "대체공휴일", note: "한글날 대체" },
  { date: "2027-12-25", name: "성탄절" },

  // ── 2028 ─────────────────────────────────────────────
  { date: "2028-01-01", name: "신정" },
  { date: "2028-01-25", name: "설날 연휴", note: "음력 12/29" },
  { date: "2028-01-26", name: "설날", note: "음력 1/1" },
  { date: "2028-01-27", name: "설날 연휴", note: "음력 1/2" },
  { date: "2028-03-01", name: "삼일절" },
  { date: "2028-05-02", name: "부처님오신날", note: "음력 4/8" },
  { date: "2028-05-05", name: "어린이날" },
  { date: "2028-06-06", name: "현충일" },
  { date: "2028-08-15", name: "광복절" },
  { date: "2028-09-30", name: "추석 연휴", note: "음력 8/14" },
  { date: "2028-10-01", name: "추석", note: "음력 8/15" },
  { date: "2028-10-02", name: "추석 연휴", note: "음력 8/16" },
  { date: "2028-10-03", name: "개천절" },
  { date: "2028-10-09", name: "한글날" },
  { date: "2028-12-25", name: "성탄절" },

  // ── 2029 ─────────────────────────────────────────────
  { date: "2029-01-01", name: "신정" },
  { date: "2029-02-12", name: "설날 연휴", note: "음력 12/29" },
  { date: "2029-02-13", name: "설날", note: "음력 1/1" },
  { date: "2029-02-14", name: "설날 연휴", note: "음력 1/2" },
  { date: "2029-03-01", name: "삼일절" },
  { date: "2029-05-05", name: "어린이날" },
  { date: "2029-05-07", name: "대체공휴일", note: "어린이날 대체" },
  { date: "2029-05-21", name: "부처님오신날", note: "음력 4/8" },
  { date: "2029-06-06", name: "현충일" },
  { date: "2029-08-15", name: "광복절" },
  { date: "2029-09-21", name: "추석 연휴", note: "음력 8/14" },
  { date: "2029-09-22", name: "추석", note: "음력 8/15" },
  { date: "2029-09-23", name: "추석 연휴", note: "음력 8/16" },
  { date: "2029-09-24", name: "대체공휴일", note: "추석 대체" },
  { date: "2029-10-03", name: "개천절" },
  { date: "2029-10-09", name: "한글날" },
  { date: "2029-12-25", name: "성탄절" },
];

const HOLIDAY_MAP = new Map<string, Holiday>(
  HOLIDAYS.map((h) => [h.date, h])
);

/** YYYY-MM-DD → Holiday 또는 undefined */
export function getHoliday(date: string): Holiday | undefined {
  return HOLIDAY_MAP.get(date);
}

/** Date 객체 → YYYY-MM-DD (로컬 기준) */
function toYmdLocal(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Date 받아서 Holiday 또는 undefined */
export function getHolidayForDate(d: Date): Holiday | undefined {
  return HOLIDAY_MAP.get(toYmdLocal(d));
}
