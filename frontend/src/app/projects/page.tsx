"use client";
import { useState, useEffect, useRef } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

// ── useInView ──────────────────────────────────────────
function useInView(threshold = 0.12) {
  const ref = useRef<HTMLElement>(null);
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
  return [ref, inView] as const;
}

// ── Data ───────────────────────────────────────────────
const PROJECTS = [
  {
    id: 1,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBnp1gqp3tDSaacHfMTmxAEquVDuGEc3iFG-9zV5JISKp8tIQ8HNXNwO7mZcM5Ew-_u3EYDsPrya48G1-eARg0jdhyRPMqYn2-hagzwm5hIqI5kKsukXQVptgj20Xzk1hmXNiI9Bejx6tfQpAnWPyDa7U3KCXDm_WggqAeRyCgtA-Ck3xzuO7F2HhBha6BP0v6jq9O64k1gtfV3AEpXOHtiJEl6YyBOhNKuNK8Z9SX90IY31a5zNnrCQGdkql6QfXDhAqbIeQHFyJjj",
    badge: "HOA HỒNG 4.0%", badgeColor: "bg-primary",
    name: "The Beverly Solari",
    status: "Đang mở bán", statusColor: "bg-green-100 text-green-600",
    location: "Thủ Đức, TP. Hồ Chí Minh",
    developer: "Vinhomes & Mitsubishi", progress: "Hoàn thiện nội thất", scale: "8.7 ha, 13 blocks",
  },
  {
    id: 2,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAMeQkVoFYmMLA62xLct8uT6BPRSjZ7acBAfhOoPjrIF87ClMB3mV3PdZL7URn5nbyMGoXKktP2YXlMEH1vW-d2wD5kROlDnLRCEfMi12jL70BSk87ph8ySW7ZqfujF-lRzkFuSNx9XdQjV1TZjQvg4PcR9zetWNivU9H0Zzb2fJnvWY8424YWuGC9p_gIuY9y1ouYm7nBaR7qBTMTOsqmfe8aQKiVecCt3o-fjCrh7qFf76FGQs0vE0_BTSogdnU72pDx6207KLrrh",
    badge: "THƯỞNG NÓNG 50TR", badgeColor: "bg-orange-500",
    name: "Masteri West Heights",
    status: "Sắp bàn giao", statusColor: "bg-blue-100 text-blue-600",
    location: "Nam Từ Liêm, Hà Nội",
    developer: "Masterise Homes", progress: "Đang cất nóc", scale: "4 tòa căn hộ cao cấp",
  },
  {
    id: 3,
    image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBHj-248c90mrzDxivvIc9zX-1PmCqWGeqWjuh4N3ZbiE6EyUCZvFnWqctGgaYtv4Y-k_mL02q_OsIt2hNYljmfV_rtV2na088aEg3KUbJp2mP9w0milBkHUqvSj9fAjcsQ4o2GTRmD79WknSBNfXj_ceItPHNiRDCnBYqZC2ZkyoKsYY2_2FhQLWezqRmxyqINEuTWUKoklBVw29Sse8tnKaJFD1VvOz01pTkd1qhiztUSHjPo6bElth6mCR_hYaYexKdNG-SOBMka",
    badge: "HOA HỒNG 2.5%", badgeColor: "bg-primary",
    name: "Lumiere Riverside",
    status: "Booking GĐ2", statusColor: "bg-orange-100 text-orange-600",
    location: "Quận 2, TP. Hồ Chí Minh",
    developer: "Masterise Homes", progress: "Xong móng hầm", scale: "1.9 ha, 2 tòa tháp",
  },
];

// ── ProjectCard ────────────────────────────────────────
function ProjectCard({ project, index }: { project: typeof PROJECTS[0]; index: number }) {
  const [ref, inView] = useInView(0.08);
  return (
    <div
      ref={ref as React.RefObject<HTMLDivElement>}
      className="project-card bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm flex flex-col lg:flex-row h-auto lg:h-72"
      style={{
        animation: inView ? `cardIn 0.6s cubic-bezier(.34,1.1,.64,1) ${index * 130}ms both` : "none",
        opacity: inView ? 1 : 0,
      }}
    >
      {/* Image */}
      <div className="w-full lg:w-[400px] h-60 lg:h-full relative overflow-hidden shrink-0">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          alt={project.name}
          className="project-img w-full h-full object-cover"
          src={project.image}
        />
        <div className={`absolute top-4 left-4 ${project.badgeColor} text-white px-3 py-1 rounded-lg text-xs font-black shadow-lg`}>
          {project.badge}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-6 flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start mb-2 gap-3">
            <h3 className="text-2xl font-extrabold text-slate-900">{project.name}</h3>
            <span className={`text-xs font-bold px-2 py-1 rounded uppercase shrink-0 ${project.statusColor}`}>
              {project.status}
            </span>
          </div>
          <p className="text-sm text-slate-500 flex items-center gap-1 mb-4">
            <span className="material-symbols-outlined text-sm">location_on</span>
            {project.location}
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-6">
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Chủ đầu tư</p>
              <p className="text-sm font-bold">{project.developer}</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Tiến độ</p>
              <p className="text-sm font-bold">{project.progress}</p>
            </div>
            <div className="hidden md:block">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Quy mô</p>
              <p className="text-sm font-bold">{project.scale}</p>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-100">
          <div className="flex items-center gap-3 flex-wrap">
            <button className="action-btn flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-lg transition-colors">
              <span className="material-symbols-outlined text-sm">download</span>
              Tải tài liệu bán hàng
            </button>
            <button className="action-btn flex items-center gap-2 px-4 py-2.5 bg-primary/10 text-primary hover:bg-primary/20 font-bold text-sm rounded-lg transition-colors">
              <span className="material-symbols-outlined text-sm">event</span>
              Đăng ký tham quan
            </button>
          </div>
          <a href={`/projects/${project.id}`}
            className="detail-link text-primary font-bold text-sm flex items-center gap-1 hover:underline">
            Xem chi tiết
            <span className="material-symbols-outlined text-sm">arrow_right_alt</span>
          </a>
        </div>
      </div>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────
export default function ProjectsPage() {
  const [page, setPage] = useState(1);
  const [bannerRef, bannerInView] = useInView(0.1);
  const [headerRef, headerInView] = useInView(0.15);
  const [statsRef, statsInView]   = useInView(0.15);
  const [pageRef, pageInView]     = useInView(0.2);

  return (
    <>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(32px); }
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
        @keyframes cardIn {
          from { opacity: 0; transform: translateY(44px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes bannerImgIn {
          from { opacity: 0; transform: scale(1.06); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes badgePop {
          from { opacity: 0; transform: scale(0.6); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes statIn {
          from { opacity: 0; transform: translateY(28px) scale(0.95); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes paginationIn {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        /* Banner image ken-burns on hover */
        .banner-img { transition: transform 8s ease; }
        .banner-group:hover .banner-img { transform: scale(1.04); }

        /* Project card */
        .project-card { transition: transform 0.35s ease, box-shadow 0.35s ease; }
        .project-card:hover { transform: translateY(-6px); box-shadow: 0 24px 48px rgba(0,0,0,0.10); }
        .project-img { transition: transform 0.6s ease; }
        .project-card:hover .project-img { transform: scale(1.06); }

        /* Action buttons */
        .action-btn { transition: transform 0.2s ease, background 0.2s ease; }
        .action-btn:hover { transform: translateY(-2px); }

        /* Detail link arrow */
        .detail-link { transition: gap 0.2s ease; }
        .detail-link:hover { gap: 0.4rem; }

        /* CTA card */
        .cta-card { transition: transform 0.35s ease, box-shadow 0.35s ease; }
        .cta-card:hover { transform: translateY(-4px); box-shadow: 0 16px 40px rgba(0,0,0,0.15); }

        /* Stat cards */
        .stat-card { transition: transform 0.3s ease, box-shadow 0.3s ease; }
        .stat-card:hover { transform: translateY(-5px); box-shadow: 0 12px 32px rgba(0,0,0,0.08); }

        /* Featured banner btn */
        .banner-cta-btn { transition: transform 0.3s ease, box-shadow 0.3s ease; }
        .banner-cta-btn:hover { transform: scale(1.05); box-shadow: 0 12px 32px rgba(19,91,236,0.4); }
      `}</style>

      <div className="relative flex min-h-screen w-full flex-col bg-[#f6f6f8]">
        <Header />

        {/* ── Featured Banner ── */}
        <section
          ref={bannerRef as React.RefObject<HTMLElement>}
          className="relative w-full overflow-hidden bg-slate-900 py-10"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 xl:px-20">
            {/* Banner header */}
            <div
              className="flex items-center justify-between mb-6"
              style={{ animation: bannerInView ? "fadeUp 0.5s ease both" : "none", opacity: bannerInView ? 1 : 0 }}
            >
              <h2 className="text-2xl font-black text-white flex items-center gap-2">
                <span className="material-symbols-outlined text-yellow-500">hotel_class</span>
                Dự án Tiêu điểm
              </h2>
              <div className="flex gap-2">
                <button className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors">
                  <span className="material-symbols-outlined">chevron_left</span>
                </button>
                <button className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors">
                  <span className="material-symbols-outlined">chevron_right</span>
                </button>
              </div>
            </div>

            {/* Banner image */}
            <div
              className="relative h-[380px] rounded-3xl overflow-hidden banner-group"
              style={{ animation: bannerInView ? "bannerImgIn 0.9s ease 0.1s both" : "none", opacity: bannerInView ? 1 : 0 }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt="Featured Project"
                className="banner-img w-full h-full object-cover"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCVkwPEvoUKrL52xtPLKuZyLSx4KRRFeY0KuQ-6F2jAYopUpv0jRH-aqyJCBbxwWoR1Rb7YinZQzAvqJI-Upbo_nf_FPoIaimXqpMrxyn35fHTHXn493GLbjIy03Tnr4pt4dcjFKwRIbakrYagtICJkkcJVOrZQUdOul9VHKBXZUpINviCFG2cm24Ja9FgWfnNAH9Cq8UaByKwWBRN5BeKY4EGFjvkif7AoZh6nkvzjb31iaGXEznWgnSIYCO7S1GO-1BjDZFyQkXGb"
              />
              <div className="absolute inset-0 bg-linear-to-t from-slate-900 via-transparent to-transparent" />
              <div className="absolute bottom-8 left-8 max-w-2xl">
                <span
                  className="bg-red-500 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest mb-4 inline-block"
                  style={{ animation: bannerInView ? "badgePop 0.5s cubic-bezier(.34,1.56,.64,1) 0.5s both" : "none", opacity: bannerInView ? 1 : 0 }}
                >
                  Nổi bật nhất thị trường
                </span>
                <h3
                  className="text-3xl sm:text-4xl font-black text-white mb-4 leading-tight"
                  style={{ animation: bannerInView ? "fadeUp 0.6s ease 0.55s both" : "none", opacity: bannerInView ? 1 : 0 }}
                >
                  Vinhomes Global Gate - Biểu tượng thịnh vượng mới
                </h3>
                <div
                  className="flex items-center gap-6 text-slate-200 mb-6 flex-wrap"
                  style={{ animation: bannerInView ? "fadeUp 0.5s ease 0.65s both" : "none", opacity: bannerInView ? 1 : 0 }}
                >
                  <span className="flex items-center gap-2 text-sm">
                    <span className="material-symbols-outlined text-primary">location_on</span>
                    Đông Anh, Hà Nội
                  </span>
                  <span className="flex items-center gap-2 text-sm">
                    <span className="material-symbols-outlined text-primary">sell</span>
                    Hoa hồng đến 3.5%
                  </span>
                </div>
                <button
                  className="banner-cta-btn bg-primary text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-blue-500/30"
                  style={{ animation: bannerInView ? "fadeUp 0.5s ease 0.75s both" : "none", opacity: bannerInView ? 1 : 0 }}
                >
                  Xem chi tiết dự án
                </button>
              </div>
            </div>
          </div>
        </section>

        <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-10 xl:px-20 py-12">

          {/* ── Header + Search ── */}
          <div
            ref={headerRef as React.RefObject<HTMLDivElement>}
            className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-10"
          >
            <div style={{ animation: headerInView ? "fadeLeft 0.6s ease both" : "none", opacity: headerInView ? 1 : 0 }}>
              <h1 className="text-3xl font-black mb-2">Kho Dự án Mới</h1>
              <p className="text-slate-500">Danh sách dự án đang triển khai với bộ tài liệu bán hàng đầy đủ</p>
            </div>
            <div
              className="flex gap-3 w-full md:w-auto"
              style={{ animation: headerInView ? "fadeRight 0.6s ease 0.1s both" : "none", opacity: headerInView ? 1 : 0 }}
            >
              <div className="relative flex-1 md:w-80">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">search</span>
                <input
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-primary focus:ring-primary text-sm bg-white outline-none transition-shadow focus:shadow-md"
                  placeholder="Tìm tên dự án, chủ đầu tư..."
                  type="text"
                />
              </div>
              <button className="flex items-center gap-2 px-4 py-3 bg-white border border-slate-200 rounded-xl font-bold text-sm hover:bg-slate-50 transition-colors">
                <span className="material-symbols-outlined text-lg">tune</span>
                Bộ lọc
              </button>
            </div>
          </div>

          {/* ── Project list ── */}
          <div className="space-y-6 mb-12">
            {PROJECTS.map((p, i) => <ProjectCard key={p.id} project={p} index={i} />)}
          </div>

          {/* ── Pagination ── */}
          <div
            ref={pageRef as React.RefObject<HTMLDivElement>}
            className="flex justify-center"
            style={{ animation: pageInView ? "paginationIn 0.5s ease both" : "none", opacity: pageInView ? 1 : 0 }}
          >
            <nav className="flex items-center gap-2">
              <button onClick={() => setPage(Math.max(1, page - 1))}
                className="p-2 border border-slate-200 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors">
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              {[1, 2, 3].map((p) => (
                <button key={p} onClick={() => setPage(p)}
                  className={`w-10 h-10 rounded-lg font-bold text-sm transition-all ${page === p ? "bg-primary text-white shadow-lg shadow-blue-500/20 scale-110" : "hover:bg-slate-100"}`}>
                  {p}
                </button>
              ))}
              <span className="px-2 text-slate-400">...</span>
              <button onClick={() => setPage(12)}
                className={`w-10 h-10 rounded-lg font-bold text-sm transition-all ${page === 12 ? "bg-primary text-white shadow-lg shadow-blue-500/20 scale-110" : "hover:bg-slate-100"}`}>
                12
              </button>
              <button onClick={() => setPage(Math.min(12, page + 1))}
                className="p-2 border border-slate-200 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors">
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </nav>
          </div>

          {/* ── Market stats + CTA ── */}
          <div
            ref={statsRef as React.RefObject<HTMLDivElement>}
            className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 border-t border-slate-200 pt-16"
          >
            <div className="col-span-1 md:col-span-2">
              <h2
                className="text-xl font-black mb-6 flex items-center gap-2"
                style={{ animation: statsInView ? "fadeLeft 0.5s ease both" : "none", opacity: statsInView ? 1 : 0 }}
              >
                <span className="material-symbols-outlined text-primary">analytics</span>
                Tình hình thị trường Dự án mới
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  {
                    bg: "bg-primary/5 border-primary/10",
                    labelColor: "text-primary",
                    label: "Cung mới tháng này",
                    value: "2,450+",
                    valueColor: "",
                    sub: "Tăng 15% so với tháng trước",
                    delay: 100,
                  },
                  {
                    bg: "bg-green-500/5 border-green-500/10",
                    labelColor: "text-green-600",
                    label: "Tỷ lệ hấp thụ",
                    value: "68%",
                    valueColor: "text-green-600",
                    sub: "Phân khúc chung cư cao cấp dẫn đầu",
                    delay: 200,
                  },
                ].map((s) => (
                  <div
                    key={s.label}
                    className={`stat-card p-6 rounded-2xl border ${s.bg}`}
                    style={{ animation: statsInView ? `statIn 0.55s cubic-bezier(.34,1.2,.64,1) ${s.delay}ms both` : "none", opacity: statsInView ? 1 : 0 }}
                  >
                    <p className={`text-xs font-bold ${s.labelColor} uppercase tracking-widest mb-1`}>{s.label}</p>
                    <p className={`text-3xl font-black mb-2 ${s.valueColor}`}>{s.value}</p>
                    <p className="text-xs text-slate-500">{s.sub}</p>
                  </div>
                ))}
              </div>
            </div>

            <div
              className="cta-card bg-slate-900 rounded-2xl p-6 text-white flex flex-col justify-between"
              style={{ animation: statsInView ? "fadeRight 0.6s ease 0.15s both" : "none", opacity: statsInView ? 1 : 0 }}
            >
              <div>
                <h3 className="text-lg font-bold mb-2">Bạn cần tài liệu dự án cụ thể?</h3>
                <p className="text-sm text-slate-400">Yêu cầu bộ Sales Kit riêng cho dự án bạn đang quan tâm.</p>
              </div>
              <button className="mt-6 w-full py-3 bg-white text-slate-900 font-bold rounded-xl text-sm hover:bg-slate-100 transition-colors hover:-translate-y-1 transition-transform">
                Yêu cầu tài liệu ngay
              </button>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    </>
  );
}