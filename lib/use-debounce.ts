"use client";

import { useEffect, useState } from "react";

/** 값이 delay ms 동안 안 바뀌면 새 값을 반환. (debounce 패턴) */
export function useDebounce<T>(value: T, delay = 1500): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}
