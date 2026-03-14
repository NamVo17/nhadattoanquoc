"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { propertyService } from "@/features/property/property.service";
import type { Property } from "@/features/property/property.types";

const statusConfig: Record<string, { label: string; className: string }> = {
  "for-sale": { label: "Đang hiển thị", className: "bg-emerald-100 text-emerald-700" },
  "for-rent": { label: "Cho thuê", className: "bg-blue-100 text-blue-700" },
  "pending-approval": { label: "Chờ duyệt", className: "bg-amber-100 text-amber-700" },
  rejected: { label: "Bị từ chối", className: "bg-red-100 text-red-700" },
  expired: { label: "Đã hết hạn", className: "bg-slate-100 text-slate-500" },
};

// Helper function to determine actual approval status
function getApprovalStatus(property: Property): { label: string; className: string } {
  if (property.isapproved === false) {
    return statusConfig["pending-approval"];
  }
  return statusConfig[property.status] || { label: property.status, className: "bg-slate-100 text-slate-500" };
}

const typeLabels: Record<string, string> = {
  apartment: "Căn hộ",
  house: "Nhà phố",
  villa: "Biệt thự",
  land: "Đất nền",
  commercial: "Văn phòng",
};

function formatPrice(price: number): string {
  if (price >= 1e9) return `${(price / 1e9).toFixed(1)} tỷ`;
  if (price >= 1e6) return `${(price / 1e6).toFixed(0)}M`;
  return `${(price / 1e3).toFixed(0)}K`;
}

export default function PropertiesPage() {
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState("all");
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const fetchProperties = useCallback(async () => {
    try {
      if (!refreshing) setLoading(true);
      setError(null);
      const data = await propertyService.getByAgent();
      setProperties(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi khi tải dữ liệu");
      console.error("Error fetching properties:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [refreshing]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  const handleManualRefresh = async () => {
    setRefreshing(true);
    await fetchProperties();
  };

  // Simple type filtering
  const filteredProperties = properties.filter(p => 
    typeFilter === "all" || p.type === typeFilter
  );

  return (
    <>
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
            Tin đăng của tôi
          </h1>
          <p className="text-slate-500 mt-1">
            Quản lý các bất động sản bạn đã đăng.
          </p>
        </div>
        <button
          onClick={handleManualRefresh}
          disabled={refreshing || loading}
          className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary/90 disabled:opacity-50 transition-colors flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-lg">refresh</span>
          {refreshing ? "Đang tải..." : "Làm mới"}
        </button>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          ⚠️ {error}
        </div>
      )}

      {/* Filters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
            home
          </span>
          <select
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:ring-primary focus:ring-2 focus:outline-none"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="all">Tất cả loại hình</option>
            <option value="apartment">Căn hộ</option>
            <option value="house">Nhà phố</option>
            <option value="villa">Biệt thự</option>
            <option value="land">Đất nền</option>
            <option value="commercial">Văn phòng</option>
          </select>
        </div>
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
            location_on
          </span>
          <select className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:ring-primary focus:ring-2 focus:outline-none">
            <option>Tất cả khu vực</option>
            <option>Quận 1</option>
            <option>Quận 2</option>
            <option>Quận 7</option>
            <option>Quận 9</option>
            <option>Thủ Đức</option>
          </select>
        </div>
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
            payments
          </span>
          <select className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:ring-primary focus:ring-2 focus:outline-none">
            <option>Mức giá (Tất cả)</option>
            <option>Dưới 2 tỷ</option>
            <option>2 - 5 tỷ</option>
            <option>5 - 10 tỷ</option>
            <option>Trên 10 tỷ</option>
          </select>
        </div>
        <button className="flex items-center justify-center gap-2 bg-white border border-slate-200 px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors">
          <span className="material-symbols-outlined text-lg">filter_alt</span>
          <span>Bộ lọc nâng cao</span>
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-8">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
          </div>
        ) : filteredProperties.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <span className="material-symbols-outlined text-5xl text-slate-300 mb-3">
              home
            </span>
            <p className="text-slate-500 font-medium mb-2">
              {properties.length === 0 ? "Chưa có tin đăng nào" : "Không tìm thấy kết quả"}
            </p>
            <p className="text-xs text-slate-400">
              {properties.length === 0
                ? "Hãy click 'Đăng tin mới' để bắt đầu!"
                : "Thử thay đổi bộ lọc hoặc tìm kiếm"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                  <th className="px-6 py-4">Hình ảnh &amp; Tiêu đề</th>
                  <th className="px-6 py-4">Loại / Giá</th>
                  <th className="px-6 py-4">Trạng thái</th>
                  <th className="px-6 py-4 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProperties.map((property) => (
                  <tr key={property.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div
                          className="w-20 h-16 rounded-lg bg-slate-100 shrink-0 overflow-hidden border border-slate-200"
                          style={{
                            backgroundImage: property.images?.[0] ? `url('${property.images[0]}')` : "none",
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                          }}
                        />
                        <div>
                          <a
                            className="text-sm font-bold text-slate-900 line-clamp-1 hover:text-primary transition-colors"
                            href={`/properties/${property.slug}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {property.title}
                          </a>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs text-slate-400">
                              {property.address}
                            </span>
                            <span className="w-1 h-1 rounded-full bg-slate-300" />
                            <span className="text-xs text-slate-400">
                              {property.district}, {property.city}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-bold text-slate-900">
                          {typeLabels[property.type] || property.type}
                        </p>
                        <p className="text-xs text-primary font-bold mt-1">
                          {formatPrice(property.price)}
                        </p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide rounded-full ${
                          getApprovalStatus(property).className
                        }`}
                      >
                        {getApprovalStatus(property).label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => router.push(`/properties/${property.slug}`)}
                          className="p-2 text-slate-400 hover:text-primary transition-colors"
                          title="Xem"
                        >
                          <span className="material-symbols-outlined text-xl">
                            visibility
                          </span>
                        </button>
                        <button
                          onClick={() => router.push(`/dashboard/properties/${property.id}/edit`)}
                          className="p-2 text-slate-400 hover:text-blue-500 transition-colors"
                          title="Sửa"
                        >
                          <span className="material-symbols-outlined text-xl">
                            edit
                          </span>
                        </button>
                        <button
                          onClick={async () => {
                            if (!window.confirm("Bạn chắc chắn muốn xóa bất động sản này?")) {
                              return;
                            }
                            try {
                              await propertyService.delete(property.id);
                              setProperties(prev => prev.filter(p => p.id !== property.id));
                              alert('Xóa thành công!');
                            } catch (err) {
                              alert(err instanceof Error ? err.message : 'Lỗi khi xóa');
                            }
                          }}
                          className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                          title="Xóa"
                        >
                          <span className="material-symbols-outlined text-xl">
                            delete
                          </span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination (simple) */}
        {filteredProperties.length > 0 && (
          <div className="p-6 bg-slate-50 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-slate-500">
            <div>
              Hiển thị {filteredProperties.length} của {properties.length} tin đăng
            </div>
          </div>
        )}
      </div>
    </>
  );
}
