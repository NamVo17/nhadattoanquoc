"use client";

import { useEffect, useRef, useState } from "react";

function useInView(threshold = 0.15) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setInView(true); observer.disconnect(); } },
      { threshold }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);
  return [ref, inView];
}

const features = [
  {
    icon: "analytics",
    title: "Phân tích chuyên sâu",
    desc: "Cung cấp báo cáo thị trường và định giá chính xác cho từng dự án.",
  },
  {
    icon: "gavel",
    title: "Hỗ trợ pháp lý",
    desc: "Quy trình thủ tục nhanh gọn, minh bạch, đảm bảo quyền lợi tối đa cho khách hàng.",
  },
  {
    icon: "support_agent",
    title: "Hỗ trợ 24/7",
    desc: "Đội ngũ chuyên viên tận tâm, sẵn sàng giải đáp mọi thắc mắc của bạn.",
  },
];

export default function WhyChooseUsSection() {
  const [imgRef, imgInView]   = useInView(0.15);
  const [textRef, textInView] = useInView(0.15);

  return (
    <>
      <style>{`
        @keyframes fadeLeft {
          from { opacity: 0; transform: translateX(-50px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeRight {
          from { opacity: 0; transform: translateX(50px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(30px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes badgePop {
          from { opacity: 0; transform: translate(0, 20px) scale(0.8); }
          to   { opacity: 1; transform: translate(0, 0)    scale(1); }
        }
        @keyframes iconPulse {
          0%, 100% { transform: scale(1); }
          50%       { transform: scale(1.12); }
        }
        @keyframes shimmer {
          0%   { background-position: -200% center; }
          100% { background-position:  200% center; }
        }

        .feature-row {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          border-radius: 1rem;
          padding: 0.75rem;
          margin: -0.75rem;
        }
        .feature-row:hover {
          transform: translateX(6px);
          background: rgba(19,91,236,0.04);
        }
        .feature-icon {
          transition: transform 0.35s ease;
        }
        .feature-row:hover .feature-icon {
          animation: iconPulse 0.6s ease;
        }

        .img-main {
          transition: transform 0.5s ease, box-shadow 0.5s ease;
        }
        .img-main:hover {
          transform: scale(1.02);
          box-shadow: 0 32px 64px rgba(0,0,0,0.18);
        }

        .badge-card {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .badge-card:hover {
          transform: translateY(-4px) scale(1.04);
          box-shadow: 0 20px 40px rgba(0,0,0,0.12);
        }
      `}</style>

      <section className="py-16 sm:py-20 lg:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">

          {/* ── Left: Image ── */}
          <div
            ref={imgRef}
            className="relative"
            style={{
              animation: imgInView ? "fadeLeft 0.7s ease both" : "none",
              opacity: imgInView ? 1 : 0,
            }}
          >
            <div className="absolute -top-6 -left-6 w-24 sm:w-32 h-24 sm:h-32 bg-primary/10 rounded-full blur-3xl" />
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                className="img-main rounded-3xl shadow-2xl relative z-10 w-full"
                alt="Real estate professional showing property"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAf06h7FrrF5Qc3FM1qo8UQiv2EI0xw36Cp3SuPbMGBx7txz9XFOfF4WwakcLQbIu9XStGZvui1n6O8Q-B_SlOOfRS30S-RHdc11Gk59CpCCytzhcHHkPFrVX26moxc_LAnn533Tjwx1bh29SKT5dQT467PbdkQp2bBOi2maoy4uM9TVkb0UWu1bzyIzmIo9zNDj0Jg9KFW3pvWXS0tKwXQTMkXjEtakggZ7sHN3zvd_hqgRjGzeNRKrf4TACKCgr6lN0ktunxQpLO8"
              />

              {/* Badge */}
              <div
                className="badge-card absolute -bottom-4 sm:-bottom-6 -right-4 sm:-right-6 bg-white p-4 sm:p-6 rounded-2xl shadow-xl z-20 border border-slate-100"
                style={{
                  animation: imgInView ? "badgePop 0.6s cubic-bezier(.34,1.56,.64,1) 0.4s both" : "none",
                  opacity: imgInView ? 1 : 0,
                }}
              >
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="bg-primary/20 p-2 sm:p-3 rounded-full">
                    <span className="material-symbols-outlined text-primary text-xl">verified</span>
                  </div>
                  <div>
                    <p className="text-slate-900 font-bold text-sm sm:text-base">100% Tin cậy</p>
                    <p className="text-slate-500 text-[10px] sm:text-xs">Đã qua kiểm duyệt</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ── Right: Text ── */}
          <div
            ref={textRef}
            className="space-y-6"
            style={{
              animation: textInView ? "fadeRight 0.7s ease 0.1s both" : "none",
              opacity: textInView ? 1 : 0,
            }}
          >
            <h2
              className="text-primary font-bold tracking-widest uppercase text-xs sm:text-sm mb-1"
              style={{ animation: textInView ? "fadeUp 0.5s ease 0.2s both" : "none", opacity: textInView ? 1 : 0 }}
            >
              Tại sao nên chọn chúng tôi ?
            </h2>

            <h3
              className="text-2xl sm:text-3xl lg:text-4xl font-extrabold mb-2 sm:mb-4"
              style={{ animation: textInView ? "fadeUp 0.6s ease 0.3s both" : "none", opacity: textInView ? 1 : 0 }}
            >
              Trải nghiệm dịch vụ bất động sản chuyên nghiệp
            </h3>

            <div className="space-y-5 sm:space-y-6">
              {features.map((f, i) => (
                <div
                  key={f.title}
                  className="feature-row flex gap-4"
                  style={{
                    animation: textInView ? `fadeUp 0.6s ease ${0.4 + i * 0.12}s both` : "none",
                    opacity: textInView ? 1 : 0,
                  }}
                >
                  <div className="feature-icon flex-shrink-0 bg-primary/10 w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary text-xl">{f.icon}</span>
                  </div>
                  <div>
                    <h4 className="text-base sm:text-lg font-bold mb-1">{f.title}</h4>
                    <p className="text-slate-500 text-sm sm:text-base">{f.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </section>
    </>
  );
}