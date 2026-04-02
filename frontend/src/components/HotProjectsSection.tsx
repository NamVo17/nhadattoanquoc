"use client";

import { useInView } from "@/hooks/useInView";
import HotProjectCard, { HotProjectCardProps } from "./property/HotProjectCard";

const hotProjects: HotProjectCardProps[] = [
  {
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCVkwPEvoUKrL52xtPLKuZyLSx4KRRFeY0KuQ-6F2jAYopUpv0jRH-aqyJCBbxwWoR1Rb7YinZQzAvqJI-Upbo_nf_FPoIaimXqpMrxyn35fHTHXn493GLbjIy03Tnr4pt4dcjFKwRIbakrYagtICJkkcJVOrZQUdOul9VHKBXZUpINviCFG2cm24Ja9FgWfnNAH9Cq8UaByKwWBRN5BeKY4EGFjvkif7AoZh6nkvzjb31iaGXEznWgnSIYCO7S1GO-1BjDZFyQkXGb",
    title: "The Heritage Boutique Hotel",
    commission: "HH 5%",
    description: "Dự án biệt thự nghỉ dưỡng đẳng cấp tại lõi phố cổ Hội An. Cơ hội nhận hoa hồng lên đến 2 tỷ đồng mỗi căn.",
    price: "45 tỷ VNĐ",
  },
  {
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCBmhFpzyL2ZKdMnbe1CzA9ro5l6w21CdUOgjeHb1CUwG-0cXDHUJkQae9E81i8VdHjNyGS2kARaeyEuwmDbEMOOzNycp4w-rRsqithu-BvWPjRYLVIQvjjPDSSzCXa1LoEjHCErFcFFUbxVVmoBXSG4VBLFtzuSHX8kvnYfepEztf2CXVoTU0xv2UFaC4cdqIsEokMi9LzP5aKHmuRc3ehXy-uiEjA9JUDg3LheGhTKNSBB8qVVuLXK_LpcyFLrpgI21R66qTV6U_u",
    title: "Grand Park Villa Marina",
    commission: "HH 4.5%",
    description: "Tổ hợp biệt thự ven sông Đồng Nai với bến du thuyền riêng. Hỗ trợ tài chính cực tốt cho khách hàng.",
    price: "18 tỷ VNĐ",
  },
];

export default function HotProjectsSection() {
  const [sectionRef, inView] = useInView<HTMLElement>(0.1);

  return (
    <>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(28px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeLeft {
          from { opacity: 0; transform: translateX(-40px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeRight {
          from { opacity: 0; transform: translateX(40px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes hotBadgePop {
          0%   { transform: scale(0.6); opacity: 0; }
          70%  { transform: scale(1.15); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes bgShimmer {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .hot-card-wrap {
          transition: transform 0.35s ease, box-shadow 0.35s ease;
        }
        .hot-card-wrap:hover {
          transform: translateY(-8px) scale(1.01);
          box-shadow: 0 24px 48px rgba(19,91,236,0.13);
          z-index: 10;
          position: relative;
        }

        .hot-badge {
          animation: hotBadgePop 0.5s cubic-bezier(.34,1.56,.64,1) 0.6s both,
                     pulse 2s ease-in-out 1.1s infinite;
        }
        @keyframes pulse {
          0%,100% { opacity: 1; }
          50%      { opacity: 0.6; }
        }

        .section-bg-animated {
          background-size: 200% 200%;
          animation: bgShimmer 8s ease infinite;
        }
      `}</style>

      <section
        ref={sectionRef as React.RefObject<HTMLElement>}
        className="section-bg-animated bg-blue-50 -mx-4 sm:-mx-6 lg:-mx-10 xl:-mx-20 px-4 sm:px-6 lg:px-10 xl:px-20 py-10 sm:py-14 lg:py-16 rounded-2xl sm:rounded-3xl"
        style={{
          background: "linear-gradient(135deg, #eff6ff 0%, #dbeafe 50%, #eff6ff 100%)",
          backgroundSize: "200% 200%",
        }}
      >
        {/* Header */}
        <div
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 sm:mb-8"
          style={{ animation: inView ? "fadeUp 0.5s ease both" : "none", opacity: inView ? 1 : 0 }}
        >
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold flex items-center gap-2">
              Dự án hot cho cộng tác
              <span
                className="hot-badge bg-red-500 text-white text-[10px] uppercase px-2 py-0.5 rounded-full inline-block"
                style={{ opacity: inView ? 1 : 0 }}
              >
                Hot
              </span>
            </h2>
            <p
              className="text-sm sm:text-base text-slate-500 mt-1"
              style={{ animation: inView ? "fadeUp 0.5s ease 0.15s both" : "none", opacity: inView ? 1 : 0 }}
            >
              Tập trung nguồn hàng có mức hoa hồng cộng tác cao nhất thị trường
            </p>
          </div>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
          {hotProjects.map((project, i) => (
            <div
              key={project.title}
              className="hot-card-wrap"
              style={{
                animation: inView
                  ? `${i === 0 ? "fadeLeft" : "fadeRight"} 0.65s cubic-bezier(.25,.8,.25,1) ${0.2 + i * 0.15}s both`
                  : "none",
                opacity: inView ? 1 : 0,
              }}
            >
              <HotProjectCard {...project} />
            </div>
          ))}
        </div>
      </section>
    </>
  );
}