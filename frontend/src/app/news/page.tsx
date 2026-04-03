"use client";
import { useEffect, useRef, useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { newsService } from "@/features/news/news.service";
import type { NewsItem } from "@/features/news/news.types";

interface NewsColumn {
  dot: string;
  label: string;
  category: string;
  items: NewsItem[];
}

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

// ── Format date helper ──────────────────────────────────
function formatDate(dateString?: string): string {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (hours < 1) return "Vừa xong";
  if (hours < 24) return `${hours} giờ trước`;
  if (days < 7) return `${days} ngày trước`;
  
  return date.toLocaleDateString("vi-VN");
}

export default function NewsPage() {
  const [featuredRef, featuredInView] = useInView(0.1);
  const [sideRef, sideInView]         = useInView(0.1);
  const [colsRef, colsInView]         = useInView(0.08);
  const [ctaRef, ctaInView]           = useInView(0.15);

  const [featuredNews, setFeaturedNews] = useState<NewsItem | null>(null);
  const [relatedNews, setRelatedNews] = useState<NewsItem[]>([]);
  const [columns, setColumns] = useState<NewsColumn[]>([
    { dot: "bg-primary", label: "Thị trường", category: "Thị trường", items: [] },
    { dot: "bg-green-500", label: "Kinh nghiệm môi giới", category: "Kinh nghiệm môi giới", items: [] },
    { dot: "bg-orange-500", label: "Chính sách & Pháp lý", category: "Chính sách & Pháp lý", items: [] },
  ]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadNews = async () => {
      try {
        setLoading(true);
        
        // Fetch featured news from "Thị trường 24h" category
        const featuredRes = await newsService.getPublished({
          status: "published",
          limit: 5,
        });
        const featured = featuredRes.data.find(n => n.category === "Thị trường 24h") || featuredRes.data[0];
        setFeaturedNews(featured || null);
        
        // Fetch related news (other articles)
        const relatedItems = featuredRes.data.filter(n => n.id !== featured?.id).slice(0, 3);
        setRelatedNews(relatedItems);

        // Fetch news for each column
        const updatedColumns = await Promise.all(
          columns.map(async (col) => {
            const res = await newsService.getPublished({
              status: "published",
              limit: 3,
            });
            const categoryItems = res.data.filter(n => n.category === col.category);
            return { ...col, items: categoryItems.length > 0 ? categoryItems : res.data.slice(0, 3) };
          })
        );
        setColumns(updatedColumns);
      } catch (error) {
        console.error("Failed to load news:", error);
      } finally {
        setLoading(false);
      }
    };

    loadNews();
  }, []);

  return (
    <>
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(36px); }
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
        @keyframes sideItemIn {
          from { opacity: 0; transform: translateX(30px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes colIn {
          from { opacity: 0; transform: translateY(44px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes ctaIn {
          from { opacity: 0; transform: translateY(32px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes badgeSlide {
          from { opacity: 0; transform: translateX(-16px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes lineGrow {
          from { width: 0; }
          to   { width: 2rem; }
        }
        @keyframes glowPulse {
          0%,100% { opacity: 0.2; transform: scale(1); }
          50%      { opacity: 0.35; transform: scale(1.05); }
        }

        .featured-img { transition: transform 0.7s ease; }
        .featured-group:hover .featured-img { transform: scale(1.05); }

        .side-item { transition: transform 0.3s ease; }
        .side-item:hover { transform: translateX(4px); }
        .side-img { transition: transform 0.4s ease; }
        .side-item:hover .side-img { transform: scale(1.1); }

        .col-img { transition: transform 0.5s ease; }
        .col-group:hover .col-img { transform: scale(1.06); }

        .newsletter-btn {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .newsletter-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 28px rgba(19,91,236,0.35);
        }
        .newsletter-btn:active { transform: scale(0.97); }

        .glow-orb { animation: glowPulse 4s ease-in-out infinite; }
      `}</style>

      <div className="relative flex min-h-screen w-full flex-col bg-[#f6f6f8]">
        <Header />

        <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-10 xl:px-20 py-10">

          {/* ── Featured section ── */}
          <section className="mb-16">
            {/* Header title */}
            <div
              className="flex items-center gap-2 mb-8"
              style={{ animation: "fadeUp 0.5s ease both" }}
            >
              <span
                className="h-1 bg-primary rounded-full"
                style={{ width: "2rem", animation: "lineGrow 0.6s ease 0.1s both" }}
              />
              <h1 className="text-3xl font-black uppercase tracking-tight">Tin tức & Phân tích</h1>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Main featured */}
              <div
                ref={featuredRef as React.RefObject<HTMLDivElement>}
                className="lg:col-span-8 featured-group cursor-pointer"
                style={{
                  animation: featuredInView ? "fadeLeft 0.7s ease both" : "none",
                  opacity: featuredInView ? 1 : 0,
                }}
              >
                <div className="relative h-[420px] sm:h-[480px] rounded-3xl overflow-hidden mb-6">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    alt="Featured News"
                    className="featured-img w-full h-full object-cover"
                    src={featuredNews?.image_url || "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800"}
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/90 via-black/40 to-transparent" />
                  <div className="absolute bottom-0 left-0 p-8 w-full">
                    <span
                      className="inline-block px-3 py-1 bg-primary text-white text-xs font-bold rounded-lg mb-4"
                      style={{ animation: featuredInView ? "badgeSlide 0.5s ease 0.3s both" : "none", opacity: featuredInView ? 1 : 0 }}
                    >
                      THỊ TRƯỜNG 24H
                    </span>
                    <h2
                      className="text-3xl md:text-4xl font-extrabold text-white mb-4 leading-tight group-hover:text-primary transition-colors"
                      style={{ animation: featuredInView ? "fadeUp 0.6s ease 0.4s both" : "none", opacity: featuredInView ? 1 : 0 }}
                    >
                      {featuredNews?.title || "Dự báo thị trường Bất động sản năm 2024: Cơ hội phục hồi từ quý III"}
                    </h2>
                    <div
                      className="flex items-center gap-4 text-slate-300 text-sm flex-wrap"
                      style={{ animation: featuredInView ? "fadeUp 0.5s ease 0.52s both" : "none", opacity: featuredInView ? 1 : 0 }}
                    >
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">calendar_today</span> 
                        {featuredNews?.published_at ? formatDate(featuredNews.published_at) : "12/05/2024"}
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm">person</span> Ban Biên Tập
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Side news list */}
              <div
                ref={sideRef as React.RefObject<HTMLDivElement>}
                className="lg:col-span-4 flex flex-col gap-5"
              >
                {relatedNews.map((n, i) => (
                  <div
                    key={n.id}
                    className="side-item group flex gap-4 cursor-pointer"
                    style={{
                      animation: sideInView ? `sideItemIn 0.55s ease ${i * 110}ms both` : "none",
                      opacity: sideInView ? 1 : 0,
                    }}
                  >
                    <div className="w-28 h-20 shrink-0 rounded-xl overflow-hidden bg-slate-200">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img alt={n.title}
                        className="side-img w-full h-full object-cover"
                        src={n.image_url || "https://images.unsplash.com/photo-1552664730-d307ca884978?w=200"} />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors">
                        {n.title}
                      </h3>
                      <p className="text-xs text-slate-500 mt-2">{formatDate(n.published_at ?? undefined)}</p>
                    </div>
                  </div>
                ))}
                <div
                  className="mt-auto pt-4 border-t border-slate-100"
                  style={{
                    animation: sideInView ? "fadeUp 0.5s ease 0.4s both" : "none",
                    opacity: sideInView ? 1 : 0,
                  }}
                >
                  <a href="#"
                    className="flex items-center justify-center gap-2 bg-slate-100 py-3 rounded-xl font-bold text-sm hover:bg-primary hover:text-white transition-colors">
                    Xem tất cả tiêu điểm
                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </a>
                </div>
              </div>
            </div>
          </section>

          {/* ── 3 content columns ── */}
          <div
            ref={colsRef as React.RefObject<HTMLDivElement>}
            className="grid grid-cols-1 lg:grid-cols-3 gap-10"
          >
            {columns.map((col, ci) => {
              const mainItem = col.items[0];
              const otherItems = col.items.slice(1, 4);
              
              return (
                <section
                  key={col.label}
                  style={{
                    animation: colsInView ? `colIn 0.6s cubic-bezier(.34,1.1,.64,1) ${ci * 120}ms both` : "none",
                    opacity: colsInView ? 1 : 0,
                  }}
                >
                  <div className="flex items-center gap-2 mb-6 border-b-2 border-slate-100 pb-4">
                    <h2 className="text-xl font-extrabold flex items-center gap-2">
                      <span className={`w-2 h-2 ${col.dot} rounded-full`} />
                      {col.label}
                    </h2>
                  </div>
                  <div className="space-y-5">
                    {mainItem && (
                      <div className="col-group group cursor-pointer">
                        <div className="h-44 rounded-2xl overflow-hidden mb-4">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img alt={mainItem.title}
                            className="col-img w-full h-full object-cover"
                            src={mainItem.image_url || "https://images.unsplash.com/photo-1552664730-d307ca884978?w=600"} />
                        </div>
                        <h3 className="font-bold text-base leading-tight mb-2 group-hover:text-primary transition-colors">
                          {mainItem.title}
                        </h3>
                        <p className="text-sm text-slate-500 line-clamp-2 mb-3">{mainItem.summary}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                          <span className="material-symbols-outlined text-xs">schedule</span>
                          {formatDate(mainItem.published_at ?? undefined)}
                        </p>
                      </div>
                    )}
                    {otherItems.map((item, i) => (
                      <div key={item.id} className="py-4 border-t border-slate-100">
                        <h4 className="font-semibold text-sm hover:text-primary cursor-pointer line-clamp-2 transition-colors">
                          {item.title}
                        </h4>
                      </div>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>

          {/* ── Email newsletter CTA ── */}
          <section
            ref={ctaRef as React.RefObject<HTMLElement>}
            className="mt-20 bg-slate-900 rounded-3xl p-8 md:p-12 text-center text-white relative overflow-hidden"
            style={{
              animation: ctaInView ? "ctaIn 0.65s ease both" : "none",
              opacity: ctaInView ? 1 : 0,
            }}
          >
            <div className="glow-orb absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
            <div className="glow-orb absolute bottom-0 left-0 w-48 h-48 bg-primary/10 rounded-full blur-3xl -ml-24 -mb-24 pointer-events-none" style={{ animationDelay: "2s" }} />

            <div className="relative z-10 max-w-2xl mx-auto">
              <span
                className="inline-flex items-center justify-center p-3 bg-primary rounded-2xl mb-6 shadow-xl shadow-blue-500/20"
                style={{ animation: ctaInView ? "fadeUp 0.5s ease 0.15s both" : "none", opacity: ctaInView ? 1 : 0 }}
              >
                <span className="material-symbols-outlined text-3xl">mail</span>
              </span>
              <h2
                className="text-3xl font-black mb-4"
                style={{ animation: ctaInView ? "fadeUp 0.5s ease 0.22s both" : "none", opacity: ctaInView ? 1 : 0 }}
              >
                Đăng ký Bản tin Email
              </h2>
              <p
                className="text-slate-400 mb-8"
                style={{ animation: ctaInView ? "fadeUp 0.5s ease 0.3s both" : "none", opacity: ctaInView ? 1 : 0 }}
              >
                Nhận những phân tích thị trường độc quyền và kinh nghiệm môi giới thực chiến trực tiếp qua hòm thư của bạn hàng tuần.
              </p>
              <form
                className="flex flex-col md:flex-row gap-3"
                onSubmit={(e) => e.preventDefault()}
                style={{ animation: ctaInView ? "fadeUp 0.5s ease 0.38s both" : "none", opacity: ctaInView ? 1 : 0 }}
              >
                <input
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-5 py-4 focus:ring-2 focus:ring-primary focus:border-transparent outline-none placeholder:text-slate-500 text-white transition-all"
                  placeholder="Địa chỉ email của bạn"
                  type="email"
                />
                <button
                  type="submit"
                  className="newsletter-btn bg-primary hover:bg-blue-600 text-white font-bold px-8 py-4 rounded-xl shadow-lg shadow-blue-500/20"
                >
                  Đăng ký ngay
                </button>
              </form>
              <p
                className="mt-4 text-xs text-slate-500"
                style={{ animation: ctaInView ? "fadeUp 0.4s ease 0.48s both" : "none", opacity: ctaInView ? 1 : 0 }}
              >
                Chúng tôi cam kết bảo mật thông tin và không gửi spam.
              </p>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </>
  );
}