"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Shared IntersectionObserver hook.
 * Khi phần tử xuất hiện trong viewport, trả về inView = true (một lần duy nhất).
 * Generic T cho phép dùng với bất kỳ kiểu phần tử HTML nào.
 */
export function useInView<T extends HTMLElement = HTMLElement>(threshold = 0.15) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return [ref, inView] as const;
}
