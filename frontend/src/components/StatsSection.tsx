"use client";

import { useEffect, useState } from "react";
import { useInView } from "@/hooks/useInView";

function parseNumber(str: string): number {
  // Extract numeric part: "1,240+" => 1240, "2.5%" => 2.5, "8.5k" => 8500
  const cleaned = str.replace(/,/g, "");
  if (cleaned.includes("k")) return parseFloat(cleaned) * 1000;
  return parseFloat(cleaned);
}

function formatNumber(num: number, original: string): string {
  const cleaned = original.replace(/,/g, "");
  if (cleaned.includes("k")) {
    // e.g. 8.5k
    const val = num / 1000;
    return val % 1 === 0 ? val.toFixed(0) + "k" : val.toFixed(1) + "k";
  }
  if (cleaned.includes("%")) {
    return num % 1 === 0 ? num.toFixed(0) + "%" : num.toFixed(1) + "%";
  }
  // thousand separator
  return Math.floor(num).toLocaleString();
}

function AnimatedCounter({ value }: { value: string }) {
  const [display, setDisplay] = useState("0");
  const [ref, inView] = useInView<HTMLSpanElement>(0.2);

  useEffect(() => {
    if (!inView) return;
    const end = parseNumber(value);
    const suffix = value.replace(/[\d.,k%]/g, ""); // e.g. "+"
    const duration = 1400;
    const frames = duration / 16;
    let frame = 0;

    const timer = setInterval(() => {
      frame++;
      const progress = Math.min(frame / frames, 1);
      // ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = eased * end;
      setDisplay(formatNumber(current, value) + suffix);
      if (progress >= 1) clearInterval(timer);
    }, 16);

    return () => clearInterval(timer);
  }, [inView, value]);

  return <span ref={ref}>{display}</span>;
}

const stats = [
  { value: "1,240+", label: "Tin đăng mới",     color: "text-[#135bec]" },
  { value: "450+",   label: "Đã giao dịch",      color: "text-green-500" },
  { value: "2.5%",   label: "HH Trung bình",     color: "text-orange-500" },
  { value: "8.5k",   label: "Môi giới kết nối",  color: "text-slate-900" },
];

export default function StatsSection() {
  const [gridRef, gridInView] = useInView<HTMLDivElement>(0.15);

  return (
    <>
      <style>{`
        @keyframes statCardIn {
          from { opacity: 0; transform: translateY(32px) scale(0.95); }
          to   { opacity: 1; transform: translateY(0)    scale(1); }
        }
        .stat-card {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .stat-card:hover {
          transform: translateY(-6px) scale(1.03);
          box-shadow: 0 16px 40px rgba(0,0,0,0.10);
        }
      `}</style>

      <section className="-mt-10 sm:-mt-12 lg:-mt-16 mb-10 sm:mb-14 lg:mb-16 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 xl:px-20">
          <div ref={gridRef} className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {stats.map((stat, i) => (
              <div
                key={stat.label}
                className="stat-card bg-white p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-slate-100 shadow-sm text-center"
                style={{
                  animation: gridInView
                    ? `statCardIn 0.55s cubic-bezier(.34,1.56,.64,1) ${i * 100}ms both`
                    : "none",
                  opacity: gridInView ? 1 : 0,
                }}
              >
                <p className={`text-2xl sm:text-3xl font-black ${stat.color} mb-1`}>
                  <AnimatedCounter value={stat.value} />
                </p>
                <p className="text-xs sm:text-sm text-slate-500 font-medium uppercase tracking-wider">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}