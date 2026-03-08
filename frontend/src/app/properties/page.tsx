"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { propertyService } from "@/features/property/property.service";
import type { Property } from "@/features/property/property.types";

const PLACEHOLDER_IMAGE = "https://placehold.co/400x300/e2e8f0/64748b?text=Kh%C3%B4ng+c%C3%B3+%E1%BA%A3nh";

const PROPERTY_TYPES = [
  { value: "", label: "Tất cả loại hình" },
  { value: "apartment", label: "Căn hộ chung cư" },
  { value: "house", label: "Nhà phố" },
  { value: "villa", label: "Biệt thự" },
  { value: "land", label: "Đất nền" },
  { value: "commercial", label: "Văn phòng" },
];

const PRICE_OPTIONS = [
  { value: "all", label: "Tất cả", min: undefined, max: undefined },
  { value: "u2", label: "Dưới 2 tỷ", min: 0, max: 2e9 },
  { value: "2-5", label: "2 - 5 tỷ", min: 2e9, max: 5e9 },
  { value: "5-10", label: "5 - 10 tỷ", min: 5e9, max: 10e9 },
  { value: "o10", label: "Trên 10 tỷ", min: 10e9, max: undefined },
];

const AREA_OPTIONS = [
  { value: "all", label: "Tất cả diện tích", min: undefined, max: undefined },
  { value: "u50", label: "Dưới 50m²", min: 0, max: 50 },
  { value: "50-100", label: "50 - 100m²", min: 50, max: 100 },
  { value: "100-200", label: "100 - 200m²", min: 100, max: 200 },
  { value: "o200", label: "Trên 200m²", min: 200, max: undefined },
];

const BEDROOM_OPTIONS = ["", "1", "2", "3", "4", "5"];
const DIRECTION_OPTIONS = ["", "Đông", "Tây", "Nam", "Bắc", "Đông Nam", "Đông Bắc", "Tây Nam", "Tây Bắc"];

function formatPrice(price: number): string {
  if (price >= 1e9) return `${(price / 1e9).toFixed(1)} tỷ VNĐ`;
  if (price >= 1e6) return `${(price / 1e6).toFixed(0)} triệu VNĐ`;
  return `${price.toLocaleString("vi-VN")} VNĐ`;
}

// Card nhận property từ API (có slug, title, price, area, bedrooms, direction, city, district, images)
function PropertyCard({ item }: { item: Property }) {
  const [liked, setLiked] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const rawImg = Array.isArray(item.images) && item.images.length > 0 ? item.images[0] : null;
  const imgSrc = typeof rawImg === "string" && rawImg.trim() !== "" ? rawImg : PLACEHOLDER_IMAGE;
  const location = [item.district, item.city].filter(Boolean).join(", ") || "—";
  const commission = item.commission != null ? `HH ${Number(item.commission)}%` : "";
  const commissionHigh = item.commission != null && Number(item.commission) >= 3;

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

  return (
    <div className="group bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all duration-300">
      <div className="relative h-48 overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          alt={item.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          src={imgSrc}
        />
        {commission && (
          <div
            className={`absolute top-3 left-3 text-white text-xs font-black px-3 py-1.5 rounded shadow-lg ${
              commissionHigh ? "bg-red-600" : "bg-orange-500"
            }`}
          >
            {commission}
          </div>
        )}
        <button
          onClick={() => setLiked(!liked)}
          className="absolute top-3 right-3 p-1.5 bg-white/80 backdrop-blur rounded-full transition-colors hover:scale-110"
          aria-label="Yêu thích"
        >
          <span
            className={`material-symbols-outlined text-lg transition-colors ${
              liked ? "text-red-500" : "text-slate-700 hover:text-red-400"
            }`}
            style={liked ? { fontVariationSettings: "'FILL' 1" } : {}}
          >
            favorite
          </span>
        </button>
      </div>
      <div className="p-4">
        <p className="text-[#135bec] font-bold text-lg mb-1">{formatPrice(item.price)}</p>
        <h3 className="font-bold text-slate-900 line-clamp-1 mb-2">{item.title}</h3>
        <div className="flex items-center gap-3 text-xs text-slate-500 mb-3 flex-wrap">
          <span className="flex items-center gap-1">
            <span className="material-symbols-outlined text-sm">square_foot</span>
            {item.area ? `${item.area} m²` : "—"}
          </span>
          {item.bedrooms != null && item.bedrooms > 0 && (
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">bed</span>
              {item.bedrooms} PN
            </span>
          )}
          {item.direction && (
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">explore</span>
              {item.direction}
            </span>
          )}
        </div>
        <p className="text-xs text-slate-400 flex items-center gap-1 mb-4">
          <span className="material-symbols-outlined text-sm">location_on</span>
          {location}
        </p>
        <div className="flex gap-2">
          <Link
            href={`/properties/${item.slug}`}
            className="flex-1 py-2.5 text-center bg-slate-100 hover:bg-[#135bec] hover:text-white text-slate-700 font-bold text-sm rounded-lg transition-colors duration-200"
          >
            Xem chi tiết
          </Link>
          {(userRole === "agent" || userRole === "admin") ? (
            <Link
              href={`/properties/${item.slug}?action=nhan-ban`}
              className="flex-1 py-2.5 text-center bg-[#135bec] text-white font-bold text-sm rounded-lg hover:bg-blue-600 transition-colors duration-200"
            >
              Nhận Bán
            </Link>
          ) : (
            <Link
              href={`/properties/${item.slug}?action=mua`}
              className="flex-1 py-2.5 text-center bg-green-600 text-white font-bold text-sm rounded-lg hover:bg-green-700 transition-colors duration-200"
            >
              Mua
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

interface FiltersState {
  type: string;
  priceRange: string;
  areaRange: string;
  bedrooms: string;
  direction: string;
}

function FilterSidebar({
  filters,
  setFilters,
  onApply,
}: {
  filters: FiltersState;
  setFilters: React.Dispatch<React.SetStateAction<FiltersState>>;
  onApply: () => void;
}) {
  const clearFilters = () => {
    setFilters({
      type: "",
      priceRange: "all",
      areaRange: "all",
      bedrooms: "",
      direction: "",
    });
  };

  return (
    <aside className="w-full md:w-72 flex-shrink-0">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm sticky top-24">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-extrabold text-lg">Bộ lọc chi tiết</h3>
          <button
            onClick={() => {
              clearFilters();
              setTimeout(onApply, 0);
            }}
            className="text-[#135bec] text-xs font-bold hover:underline"
          >
            Xóa lọc
          </button>
        </div>
        <div className="space-y-6">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-3">Loại nhà đất</label>
            <select
              className="w-full bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-[#135bec] focus:border-[#135bec] py-2 px-3 outline-none"
              value={filters.type}
              onChange={(e) => setFilters((f) => ({ ...f, type: e.target.value }))}
            >
              {PROPERTY_TYPES.map((opt) => (
                <option key={opt.value || "all"} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-3">Khoảng giá</label>
            <div className="space-y-2">
              {PRICE_OPTIONS.map((opt) => (
                <label key={opt.value} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    className="accent-[#135bec]"
                    name="price"
                    type="radio"
                    checked={filters.priceRange === opt.value}
                    onChange={() => setFilters((f) => ({ ...f, priceRange: opt.value }))}
                  />
                  <span>{opt.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-3">Diện tích</label>
            <select
              className="w-full bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-[#135bec] focus:border-[#135bec] py-2 px-3 outline-none"
              value={filters.areaRange}
              onChange={(e) => setFilters((f) => ({ ...f, areaRange: e.target.value }))}
            >
              {AREA_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-3">Số phòng ngủ</label>
            <div className="flex flex-wrap gap-2">
              {BEDROOM_OPTIONS.map((opt) => (
                <button
                  key={opt || "all"}
                  onClick={() => setFilters((f) => ({ ...f, bedrooms: opt }))}
                  className={`px-3 py-1.5 border rounded-lg text-xs font-bold transition-colors ${
                    filters.bedrooms === opt
                      ? "bg-[#135bec] text-white border-[#135bec]"
                      : "border-slate-200 hover:border-[#135bec] hover:text-[#135bec]"
                  }`}
                >
                  {opt || "Tất cả"}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase mb-3">Hướng nhà</label>
            <select
              className="w-full bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-[#135bec] focus:border-[#135bec] py-2 px-3 outline-none"
              value={filters.direction}
              onChange={(e) => setFilters((f) => ({ ...f, direction: e.target.value }))}
            >
              <option value="">Tất cả hướng</option>
              {DIRECTION_OPTIONS.filter(Boolean).map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          onClick={onApply}
          className="w-full mt-8 bg-[#135bec] text-white py-3 rounded-xl font-bold hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/20"
        >
          Áp dụng bộ lọc
        </button>
      </div>
    </aside>
  );
}

function Pagination({
  current,
  total,
  onPageChange,
}: {
  current: number;
  total: number;
  onPageChange: (p: number) => void;
}) {
  const btnCls = (p: number) =>
    `w-10 h-10 rounded-lg border font-bold text-sm transition-colors ${
      current === p ? "bg-[#135bec] text-white border-[#135bec]" : "border-slate-200 hover:border-[#135bec] hover:text-[#135bec]"
    }`;

  if (total <= 1) return null;

  const pages: number[] = [];
  const show = 5;
  let start = Math.max(1, current - Math.floor(show / 2));
  let end = Math.min(total, start + show - 1);
  if (end - start + 1 < show) start = Math.max(1, end - show + 1);
  for (let i = start; i <= end; i++) pages.push(i);

  return (
    <div className="mt-12 flex items-center justify-center gap-2 flex-wrap">
      <button
        onClick={() => onPageChange(Math.max(1, current - 1))}
        disabled={current <= 1}
        className="w-10 h-10 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 hover:text-[#135bec] hover:border-[#135bec] transition-colors disabled:opacity-50"
      >
        <span className="material-symbols-outlined">chevron_left</span>
      </button>
      {start > 1 && (
        <>
          <button onClick={() => onPageChange(1)} className={btnCls(1)}>1</button>
          {start > 2 && <span className="px-2 text-slate-400">...</span>}
        </>
      )}
      {pages.map((p) => (
        <button key={p} onClick={() => onPageChange(p)} className={btnCls(p)}>
          {p}
        </button>
      ))}
      {end < total && (
        <>
          {end < total - 1 && <span className="px-2 text-slate-400">...</span>}
          <button onClick={() => onPageChange(total)} className={btnCls(total)}>
            {total}
          </button>
        </>
      )}
      <button
        onClick={() => onPageChange(Math.min(total, current + 1))}
        disabled={current >= total}
        className="w-10 h-10 rounded-lg border border-slate-200 flex items-center justify-center text-slate-400 hover:text-[#135bec] hover:border-[#135bec] transition-colors disabled:opacity-50"
      >
        <span className="material-symbols-outlined">chevron_right</span>
      </button>
    </div>
  );
}

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState("");
  const [searchSubmitted, setSearchSubmitted] = useState("");
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ page: 1, limit: 12, total: 0, pages: 1 });
  const [filters, setFilters] = useState<FiltersState>({
    type: "",
    priceRange: "all",
    areaRange: "all",
    bedrooms: "",
    direction: "",
  });

  const buildParams = useCallback(() => {
    const limit = 12;
    const params: Record<string, string | number> = {
      page,
      limit,
    };
    if (searchSubmitted) params.search = searchSubmitted;
    if (filters.type) params.type = filters.type;
    const priceOpt = PRICE_OPTIONS.find((o) => o.value === filters.priceRange);
    if (priceOpt?.min != null) params.minPrice = priceOpt.min;
    if (priceOpt?.max != null) params.maxPrice = priceOpt.max;
    const areaOpt = AREA_OPTIONS.find((o) => o.value === filters.areaRange);
    if (areaOpt?.min != null) params.minArea = areaOpt.min;
    if (areaOpt?.max != null) params.maxArea = areaOpt.max;
    if (filters.bedrooms) params.bedrooms = filters.bedrooms;
    if (filters.direction) params.direction = filters.direction;
    return params;
  }, [page, searchSubmitted, filters]);

  const fetchList = useCallback(async () => {
    setLoading(true);
    try {
      const result = await propertyService.getAll(buildParams());
      setProperties(result.data);
      setPagination(result.pagination);
    } catch {
      setProperties([]);
      setPagination((p) => ({ ...p, total: 0, pages: 1 }));
    } finally {
      setLoading(false);
    }
  }, [buildParams]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  const handleSearch = () => {
    setSearchSubmitted(searchInput.trim());
    setPage(1);
  };

  const handleApplyFilter = () => {
    setPage(1);
  };

  const handlePageChange = (p: number) => {
    setPage(p);
  };

  return (
    <div className="relative flex min-h-screen w-full flex-col bg-[#f6f6f8]">
      <Header />

      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-10 xl:px-20 pt-6">
        <div className="flex items-center bg-white border border-slate-200 rounded-xl px-4 py-3 mb-6 shadow-sm gap-3">
          <span className="material-symbols-outlined text-slate-400 text-xl shrink-0">search</span>
          <input
            className="bg-transparent border-none focus:ring-0 text-sm w-full outline-none placeholder:text-slate-400"
            placeholder="Tìm kiếm theo tiêu đề tin đăng..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <button
            onClick={handleSearch}
            className="shrink-0 bg-[#135bec] text-white text-sm font-bold px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Tìm kiếm
          </button>
        </div>
      </div>

      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-10 xl:px-20 pb-8 flex flex-col md:flex-row gap-8">
        <FilterSidebar filters={filters} setFilters={setFilters} onApply={handleApplyFilter} />

        <div className="flex-1">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-2xl font-extrabold">Danh sách Bất động sản</h1>
              <p className="text-sm text-slate-500">
                Tìm thấy <span className="font-bold text-[#135bec]">{pagination.total}</span> kết quả phù hợp
              </p>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-2 border-[#135bec] border-t-transparent" />
            </div>
          ) : properties.length === 0 ? (
            <p className="text-slate-500 py-12 text-center">Chưa có tin nào phù hợp.</p>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {properties.map((item) => (
                  <PropertyCard key={item.id} item={item} />
                ))}
              </div>
              <Pagination
                current={pagination.page}
                total={pagination.pages}
                onPageChange={handlePageChange}
              />
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
