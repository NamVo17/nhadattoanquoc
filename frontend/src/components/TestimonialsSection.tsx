"use client";

import { useInView } from "@/hooks/useInView";

const testimonials = [
  {
    stars: 5,
    half: false,
    text: "Dịch vụ vô cùng chuyên nghiệp. Tôi đã tìm được căn hộ mơ ước chỉ sau 2 tuần liên hệ. Thủ tục pháp lý rất nhanh chóng.",
    name: "Nguyễn Văn A",
    role: "CEO tại Alpha Tech",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDoB1QYBy8D61H2xuL8ZAFIrAvgyQlcu9PGaNHLNRBOu5ZOAiik7MUxsVJNHvaRuGFc5LzHQo5_zzdRynIvs_TAZtkL1tq-Wq5oefqpV7v_o2lLtr5i8MKKi3KQ0p1e7iBmTH1JmCjtG7EcwknFIHbTMFB6iG4-07uZMDPuY1VvyXa0eTkf2f8Yo_GUfInliQwM8klSat3WWn0kbIVRuQUxqVaV05boYnLIF1oRKQCP2YhgbvmY6pnH69lSgazYKipD3uSU0LYhK5aJ",
  },
  {
    stars: 4,
    half: true,
    text: "Rất hài lòng với sự tận tâm của các chuyên viên. Họ không chỉ bán nhà mà còn tư vấn phương án tài chính rất tối ưu.",
    name: "Lê Thị B",
    role: "Nhà đầu tư tự do",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDL9LxDyRAioh_OD-WO5W1vKjfsBeB3HNY3Ee-WcJP8_3Rua8RPF3LzUBQJ3SEyTB9UrJfxc_R1eY9dkVrMDr9SZ1CSIGEP7T7Vq85GOTh71Msc-xuzUysZp5nC6Y5HM3oTDhDmk2lseVhwYNZQ7VAF0u7kUVzBXPWfzv3PK2wjc0qF_sLEk32VFRv6lcDM28qqQLKMdBLT-V7Zxlsxi84BBuOndQs50GcqQ-XSCvEsD_kszknaZLadONTkW3qe1ydC0wJsR7cpSt6I",
  },
  {
    stars: 5,
    half: false,
    text: "The Ocean View là dự án tuyệt vời nhất mà tôi từng đầu tư qua Luxury Estate. Cảm ơn đội ngũ tư vấn rất nhiều.",
    name: "Phạm Minh C",
    role: "Giám đốc kinh doanh",
    avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuDd7XMN_li6oCB_yCEHBNEhzKNPU-sFC2gUVHc3celNf3R7OBb33Rxmd1n__uVQv0xZl1EsQm2fVsclmdSVkkagvlHvhMYhy8X1QRJ5ZqtDDzS0CXzwHEL3keafloM6-Z4uGTowlilkeb_tC8M5Qwb2sIa92jo2SFGtyAEIuEXO83zAwowCxZ5bjAF3oyOjOirfeQ072myByx7cz7Tnm0-p3AztQRZN6hZXx7l4vIw5xBlmZxfRpQgmpR4mtHZy4ldKpcMubeF7B5yB",
  },
];

const partners = ["VINHOMES", "SUN GROUP", "NOVALAND", "MASTERISE", "KANGAROO"];

export default function TestimonialsSection() {
  const [headRef, headInView]         = useInView<HTMLDivElement>(0.2);
  const [cardsRef, cardsInView]       = useInView<HTMLDivElement>(0.1);
  const [partnersRef, partnersInView] = useInView<HTMLParagraphElement>(0.2);

  return (
    <>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(36px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes cardIn {
          from { opacity: 0; transform: translateY(44px) scale(0.96); }
          to   { opacity: 1; transform: translateY(0)    scale(1); }
        }
        @keyframes partnerIn {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes starPop {
          0%   { transform: scale(0); opacity: 0; }
          70%  { transform: scale(1.3); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }

        .tcard {
          transition: transform 0.35s ease, box-shadow 0.35s ease, border-color 0.35s ease;
        }
        .tcard:hover {
          transform: translateY(-8px);
          box-shadow: 0 24px 48px rgba(0,0,0,0.3);
          border-color: rgb(19 91 236 / 0.5);
        }
        .avatar-ring {
          transition: transform 0.3s ease;
        }
        .tcard:hover .avatar-ring {
          transform: scale(1.1);
        }
        .star-animated {
          display: inline-block;
          opacity: 0;
          transform: scale(0);
        }
        .star-animated.visible {
          animation: starPop 0.4s cubic-bezier(.34,1.56,.64,1) forwards;
        }

        .marquee-track {
          display: flex;
          width: max-content;
          animation: marquee 18s linear infinite;
        }
        .marquee-track:hover {
          animation-play-state: paused;
        }
        .partner-item {
          transition: color 0.3s ease, transform 0.3s ease;
        }
        .partner-item:hover {
          color: #135bec;
          transform: scale(1.1);
        }
      `}</style>

      {/* ── Testimonials ── */}
      <section className="py-12 sm:py-16 lg:py-20 bg-slate-900 text-white mt-8 sm:mt-10 lg:mt-12 rounded-t-3xl overflow-hidden">

        {/* Header */}
        <div
          ref={headRef}
          className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-12 sm:mb-16"
        >
          <h2
            className="text-primary font-bold tracking-widest uppercase text-sm sm:text-xl mb-4"
            style={{ animation: headInView ? "fadeUp 0.5s ease both" : "none", opacity: headInView ? 1 : 0 }}
          >
            Ý kiến khách hàng
          </h2>
          <h3
            className="text-2xl sm:text-3xl lg:text-4xl font-extrabold"
            style={{ animation: headInView ? "fadeUp 0.6s ease 0.12s both" : "none", opacity: headInView ? 1 : 0 }}
          >
            Hàng ngàn người đã tìm thấy ngôi nhà ưng ý
          </h3>
        </div>

        {/* Cards */}
        <div
          ref={cardsRef}
          className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8"
        >
          {testimonials.map((t, i) => (
            <div
              key={t.name}
              className="tcard bg-slate-800 p-6 sm:p-8 rounded-2xl border border-slate-700 text-left"
              style={{
                animation: cardsInView ? `cardIn 0.6s cubic-bezier(.34,1.2,.64,1) ${i * 120}ms both` : "none",
                opacity: cardsInView ? 1 : 0,
              }}
            >
              {/* Stars */}
              <div className="flex text-yellow-500 mb-4 gap-0.5" aria-label={`${t.stars}${t.half ? '.5' : ''} sao`}>
                {Array.from({ length: t.stars }).map((_, si) => (
                  <span
                    key={si}
                    className={`material-symbols-outlined text-base sm:text-lg star-animated ${cardsInView ? "visible" : ""}`}
                    style={{ animationDelay: cardsInView ? `${i * 120 + si * 80}ms` : "0ms" }}
                    aria-hidden="true"
                  >
                    star
                  </span>
                ))}
                {t.half && (
                  <span
                    className={`material-symbols-outlined text-base sm:text-lg star-animated ${cardsInView ? "visible" : ""}`}
                    style={{ animationDelay: cardsInView ? `${i * 120 + t.stars * 80}ms` : "0ms" }}
                    aria-hidden="true"
                  >
                    star_half
                  </span>
                )}
              </div>

              <p className="text-slate-300 mb-6 italic text-sm sm:text-base">"{t.text}"</p>

              <div className="flex items-center gap-4">
                <div className="avatar-ring w-12 h-12 rounded-full bg-slate-600 flex items-center justify-center overflow-hidden ring-2 ring-slate-600">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img className="w-full h-full object-cover" alt={t.name} src={t.avatar} />
                </div>
                <div>
                  <p className="font-bold text-sm sm:text-base">{t.name}</p>
                  <p className="text-[11px] sm:text-xs text-slate-500">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Partners ── */}
      <section className="py-12 sm:py-16 border-b border-slate-200 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4">
          <p
            ref={partnersRef}
            className="text-center text-slate-400 font-bold uppercase tracking-widest text-[10px] sm:text-xs mb-8 sm:mb-10"
            style={{ animation: partnersInView ? "fadeUp 0.5s ease both" : "none", opacity: partnersInView ? 1 : 0 }}
          >
            Đối tác chiến lược
          </p>

          {/* Infinite marquee */}
          <div className="overflow-hidden">
            <div className="marquee-track text-slate-600">
              {[...partners, ...partners].map((brand, i) => (
                <div
                  key={i}
                  className="partner-item text-base sm:text-xl lg:text-2xl font-black tracking-wide mx-8 sm:mx-12 cursor-default select-none"
                >
                  {brand}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}