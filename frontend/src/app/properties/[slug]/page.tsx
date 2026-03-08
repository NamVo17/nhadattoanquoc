"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { propertyService } from "@/features/property/property.service";
import type { Property } from "@/features/property/property.types";

const PLACEHOLDER_IMAGE = "https://placehold.co/600x400/e2e8f0/64748b?text=Kh%C3%B4ng+c%C3%B3+%E1%BA%A3nh";

const TYPE_LABELS: Record<string, string> = {
  apartment: "Căn hộ / Chung cư",
  house: "Nhà phố",
  villa: "Biệt thự",
  land: "Đất nền",
  commercial: "Văn phòng",
};

function formatPrice(price: number): string {
  if (price >= 1e9) return `${(price / 1e9).toFixed(1)} tỷ VNĐ`;
  if (price >= 1e6) return `${(price / 1e6).toFixed(0)} triệu VNĐ`;
  return `${price.toLocaleString("vi-VN")} VNĐ`;
}

export default function PropertyDetailPage() {
  const params = useParams();
  const slug = typeof params?.slug === "string" ? params.slug : "";
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [liked, setLiked] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    try {
      const u = localStorage.getItem("user");
      if (u) {
        const parsed = JSON.parse(u);
        setUserRole(parsed?.role ?? null);
      }
    } catch {
      setUserRole(null);
    }
  }, []);

  useEffect(() => {
    if (!slug) {
      setLoading(false);
      setNotFound(true);
      return;
    }
    let cancelled = false;
    propertyService
      .getBySlug(slug)
      .then((data) => {
        if (!cancelled) setProperty(data);
      })
      .catch(() => {
        if (!cancelled) setNotFound(true);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-[#f6f6f8]">
        <Header />
        <main className="flex-1 flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-[#135bec] border-t-transparent" />
        </main>
        <Footer />
      </div>
    );
  }

  if (notFound || !property) {
    return (
      <div className="min-h-screen flex flex-col bg-[#f6f6f8]">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center py-20 px-4">
          <p className="text-slate-600 mb-4">Không tìm thấy tin đăng.</p>
          <Link href="/properties" className="text-[#135bec] font-bold hover:underline">
            ← Quay lại danh sách
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const rawImages = Array.isArray(property.images) ? property.images : [];
  const images = rawImages.map((u) => (typeof u === "string" && u.trim() !== "" ? u : PLACEHOLDER_IMAGE));
  const mainImage = images[0] || PLACEHOLDER_IMAGE;
  const sideImages = images.slice(1, 4);
  const location = [property.district, property.city].filter(Boolean).join(", ") || "—";

  const details: { icon: string; label: string; value: string }[] = [
    { icon: "home", label: "Loại hình", value: TYPE_LABELS[property.type] || property.type },
    { icon: "bed", label: "Số phòng ngủ", value: property.bedrooms != null ? `${property.bedrooms} PN` : "—" },
    { icon: "explore", label: "Hướng nhà", value: property.direction || "—" },
  ];

  const stats = [
    { label: "Giá bán", value: formatPrice(property.price), highlight: true },
    { label: "Diện tích", value: property.area ? `${property.area} m²` : "—", highlight: false },
    { label: "Phòng ngủ", value: property.bedrooms != null ? `${property.bedrooms} PN` : "—", highlight: false },
    { label: "Hướng nhà", value: property.direction || "—", highlight: false },
  ];

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-[#f6f6f8]">
      <Header />

      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-10 xl:px-20 py-6">
        <nav className="flex items-center gap-2 text-sm text-slate-500 mb-6 flex-wrap">
          <Link className="hover:text-[#135bec] transition-colors" href="/">Trang chủ</Link>
          <span className="material-symbols-outlined text-xs">chevron_right</span>
          <Link className="hover:text-[#135bec] transition-colors" href="/properties">Bất động sản</Link>
          <span className="material-symbols-outlined text-xs">chevron_right</span>
          {property.city && (
            <>
              <span>{property.city}</span>
              <span className="material-symbols-outlined text-xs">chevron_right</span>
            </>
          )}
          <span className="text-slate-900 font-medium line-clamp-1">{property.title}</span>
        </nav>

        <div className="grid grid-cols-1 grid-rows-1 md:grid-cols-4 md:grid-rows-2 gap-3 h-[280px] sm:h-[320px] md:h-[500px] mb-8">
          <button
            type="button"
            className="col-span-1 row-span-1 md:col-span-2 md:row-span-2 h-full min-h-0 rounded-xl overflow-hidden relative group border border-slate-200 bg-slate-200 text-left focus:outline-none focus:ring-2 focus:ring-[#135bec]"
            onClick={() => {
              setLightboxIndex(0);
              setLightboxOpen(true);
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img alt={property.title} className="w-full h-full object-cover cursor-pointer" src={mainImage} />
            <div className="absolute bottom-4 left-4 z-20 bg-white/90 px-4 py-2 rounded-lg text-sm font-bold shadow-sm text-slate-900 pointer-events-none">
              <span className="material-symbols-outlined text-lg align-middle">photo_library</span> {rawImages.length} Ảnh — Nhấp để xem
            </div>
          </button>
          {sideImages.map((img, i) => (
            <button
              key={i}
              type="button"
              className="hidden md:block rounded-xl overflow-hidden border border-slate-200 bg-slate-200 focus:outline-none focus:ring-2 focus:ring-[#135bec]"
              onClick={() => {
                setLightboxIndex(i + 1);
                setLightboxOpen(true);
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img alt="" className="w-full h-full object-cover cursor-pointer" src={img} />
            </button>
          ))}
          {rawImages.length > 4 && (
            <button
              type="button"
              className="hidden md:flex rounded-xl overflow-hidden border border-slate-200 bg-slate-300 items-center justify-center hover:bg-slate-400/50 transition-colors focus:outline-none focus:ring-2 focus:ring-[#135bec]"
              onClick={() => {
                setLightboxIndex(4);
                setLightboxOpen(true);
              }}
            >
              <span className="text-slate-600 font-bold">+{rawImages.length - 4} Ảnh</span>
            </button>
          )}
        </div>

        {/* Lightbox */}
        {lightboxOpen && (
          <div
            className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4"
            role="dialog"
            aria-modal="true"
            aria-label="Xem ảnh"
            onClick={() => setLightboxOpen(false)}
          >
            <button
              type="button"
              className="absolute top-4 right-4 text-white p-2 rounded-full hover:bg-white/20 transition-colors z-10"
              onClick={() => setLightboxOpen(false)}
              aria-label="Đóng"
            >
              <span className="material-symbols-outlined text-3xl">close</span>
            </button>
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-white p-2 rounded-full hover:bg-white/20 transition-colors z-10"
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightboxIndex((prev) => (prev <= 0 ? images.length - 1 : prev - 1));
                  }}
                  aria-label="Ảnh trước"
                >
                  <span className="material-symbols-outlined text-4xl">chevron_left</span>
                </button>
                <button
                  type="button"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-white p-2 rounded-full hover:bg-white/20 transition-colors z-10"
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightboxIndex((prev) => (prev >= images.length - 1 ? 0 : prev + 1));
                  }}
                  aria-label="Ảnh sau"
                >
                  <span className="material-symbols-outlined text-4xl">chevron_right</span>
                </button>
              </>
            )}
            <div className="max-w-5xl max-h-[90vh] flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt={`${property.title} - ảnh ${lightboxIndex + 1}`}
                className="max-w-full max-h-[90vh] object-contain rounded-lg"
                src={images[lightboxIndex] ?? PLACEHOLDER_IMAGE}
              />
            </div>
            {images.length > 1 && (
              <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/90 text-sm font-medium">
                {lightboxIndex + 1} / {images.length}
              </p>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <div className="flex flex-wrap justify-between items-start gap-4 mb-4">
                <div className="flex-1 min-w-[280px]">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mb-2">{property.title}</h1>
                  <p className="flex items-center gap-1 text-slate-500">
                    <span className="material-symbols-outlined text-[#135bec] text-sm">location_on</span>
                    {property.address ? `${property.address}, ` : ""}{location}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                    <span className="material-symbols-outlined">share</span>
                  </button>
                  <button
                    onClick={() => setLiked(!liked)}
                    className={`p-2 border rounded-lg flex items-center gap-1 font-bold transition-colors ${
                      liked ? "border-red-300 text-red-500 bg-red-50" : "border-slate-200 text-[#135bec] hover:bg-slate-50"
                    }`}
                  >
                    <span className="material-symbols-outlined" style={liked ? { fontVariationSettings: "'FILL' 1" } : {}}>
                      favorite
                    </span>
                    Lưu tin
                  </button>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 mt-6">
                {stats.map((s) => (
                  <div
                    key={s.label}
                    className={`flex-1 min-w-[130px] p-4 rounded-xl border ${
                      s.highlight ? "bg-[#135bec]/5 border-[#135bec]/10" : "bg-slate-50 border-slate-200"
                    }`}
                  >
                    <p className="text-xs text-slate-500 uppercase font-bold tracking-wider mb-1">{s.label}</p>
                    <p className={`text-xl font-extrabold ${s.highlight ? "text-[#135bec]" : ""}`}>{s.value}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h3 className="text-xl font-bold mb-4">Mô tả chi tiết</h3>
              <div className="text-slate-600 space-y-4 text-sm leading-relaxed whitespace-pre-line">
                {property.description || "Chưa có mô tả."}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
              <h3 className="text-xl font-bold mb-4">Đặc điểm bất động sản</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
                {details.map((d) => (
                  <div key={d.label} className="flex items-center justify-between py-2 border-b border-slate-100">
                    <span className="text-slate-500 flex items-center gap-2 text-sm">
                      <span className="material-symbols-outlined text-sm">{d.icon}</span>
                      {d.label}
                    </span>
                    <span className="font-semibold text-sm text-right">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {property.mapurl && (
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                <h3 className="text-xl font-bold mb-4">Vị trí trên bản đồ</h3>
                <div className="w-full h-64 md:h-80 rounded-xl overflow-hidden border border-slate-200">
                  <iframe
                    src={property.mapurl}
                    className="w-full h-full border-0"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    allowFullScreen
                    title={`Bản đồ vị trí - ${property.title}`}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              <div className="bg-white rounded-xl shadow-xl shadow-slate-200/50 border border-slate-200 p-6">
                {property.commission != null && (
                  <div className="mb-6 text-center py-4 bg-[#135bec]/5 rounded-xl border-2 border-dashed border-[#135bec]/30">
                    <p className="text-slate-500 text-sm font-medium mb-1">Hoa hồng cộng tác</p>
                    <p className="text-3xl font-black text-[#135bec]">{property.commission}%</p>
                  </div>
                )}
                <button className="w-full bg-[#135bec] hover:bg-blue-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 transition-all active:scale-95">
                  <span className="material-symbols-outlined">handshake</span>
                  LIÊN HỆ HỢP TÁC
                </button>
                {(userRole === "agent" || userRole === "admin") ? (
                  <Link
                    href={`/properties/${property.slug}?action=nhan-ban`}
                    className="mt-3 w-full bg-slate-800 hover:bg-slate-900 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all"
                  >
                    <span className="material-symbols-outlined">sell</span>
                    Nhận Bán
                  </Link>
                ) : (
                  <Link
                    href={`/properties/${property.slug}?action=mua`}
                    className="mt-3 w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 transition-all"
                  >
                    <span className="material-symbols-outlined">shopping_cart</span>
                    Mua
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
