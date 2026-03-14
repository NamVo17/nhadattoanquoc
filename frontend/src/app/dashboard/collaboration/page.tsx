"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { collaborationService } from "@/features/collaboration/collaboration.service";
import type { Collaboration } from "@/features/collaboration/collaboration.types";

const statusConfig: Record<string, { label: string; className: string; icon: string }> = {
  active: { label: "Đang nhận bán", className: "bg-emerald-100 text-emerald-700", icon: "check_circle" },
  inactive: { label: "Đã kết thúc", className: "bg-slate-100 text-slate-500", icon: "cancel" },
  "pending-confirmation": { label: "Chờ xác nhận", className: "bg-amber-100 text-amber-700", icon: "pending" },
  sold: { label: "Đã bán", className: "bg-blue-100 text-blue-700", icon: "task_alt" },
  completed: { label: "Đã bán", className: "bg-blue-100 text-blue-700", icon: "task_alt" },
};

function formatPrice(price: number): string {
  if (price >= 1e9) return `${(price / 1e9).toFixed(1)} tỷ`;
  if (price >= 1e6) return `${(price / 1e6).toFixed(0)}M`;
  return `${(price / 1e3).toFixed(0)}K`;
}

function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN");
  } catch {
    return dateString;
  }
}

export default function CollaborationPage() {
  const [activeTab, setActiveTab] = useState<"selling" | "owned">("selling");
  const [myCollaborations, setMyCollaborations] = useState<Collaboration[]>([]);
  const [myProperties, setMyProperties] = useState<Collaboration[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive" | "completed" | "pending-confirmation" | "sold">("all");
  const [actioningId, setActioningId] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [collabs, props] = await Promise.all([
        collaborationService.getMyCollaborations(),
        collaborationService.getMyPropertiesWithCollaborations(),
      ]);
      setMyCollaborations(collabs);
      setMyProperties(props);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lỗi khi tải dữ liệu");
      console.error("Error fetching collaborations:", err);
    } finally {
      setLoading(false);
    }
  };

  // Handle agent marking property as sold (gửi yêu cầu xác nhận)
  const handleMarkAsSold = async (collaborationId: string) => {
    if (!window.confirm("Xác nhận rằng bất động sản này đã được bán? Chủ BĐS sẽ nhận được yêu cầu xác nhận.")) {
      return;
    }

    try {
      setActioningId(collaborationId);
      await collaborationService.markAsSold(collaborationId);
      // Update local state
      setMyCollaborations(prev =>
        prev.map(c => c.id === collaborationId ? { ...c, status: "pending-confirmation" } : c)
      );
      alert("Yêu cầu xác nhận đã được gửi tới chủ bất động sản");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Lỗi khi gửi yêu cầu");
    } finally {
      setActioningId(null);
    }
  };

  // Handle agent canceling collaboration
  const handleCancelCollaboration = async (collaborationId: string) => {
    if (!window.confirm("Bạn có chắc muốn bỏ nhận bán bất động sản này? Bất động sản sẽ được hiển thị lại để những người khác nhận bán.")) {
      return;
    }

    try {
      setActioningId(collaborationId);
      await collaborationService.cancelCollaboration(collaborationId);
      // Remove from list
      setMyCollaborations(prev => prev.filter(c => c.id !== collaborationId));
      alert("Bỏ nhận bán thành công");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Lỗi khi bỏ nhận bán");
    } finally {
      setActioningId(null);
    }
  };

  // Handle property owner confirming sale
  const handleConfirmSale = async (collaborationId: string) => {
    if (!window.confirm("Xác nhận bất động sản này đã được bán? Trạng thái sẽ chuyển thành 'Đã bán'.")) {
      return;
    }

    try {
      setActioningId(collaborationId);
      await collaborationService.confirmSold(collaborationId);
      // Update both lists
      setMyCollaborations(prev =>
        prev.map(c => c.id === collaborationId ? { ...c, status: "sold" } : c)
      );
      setMyProperties(prev =>
        prev.map(c => c.id === collaborationId ? { ...c, status: "sold" } : c)
      );
      alert("Xác nhận bán thành công");
    } catch (err) {
      alert(err instanceof Error ? err.message : "Lỗi khi xác nhận");
    } finally {
      setActioningId(null);
    }
  };

  // Get data based on active tab
  const currentData = activeTab === "selling" ? myCollaborations : myProperties;

  // Filter data
  const filtered = currentData.filter(item => {
    const matchesSearch =
      !searchTerm ||
      item.property?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.property?.address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ((activeTab === "owned" && item.agent?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())));

    const matchesStatus = statusFilter === "all" || item.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const sellingCount = myCollaborations.filter(c => c.status === "active").length;
  const ownedCount = myProperties.filter(c => c.status === "active").length;

  return (
    <>
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
          Quản lý Yêu cầu Hợp tác
        </h1>
        <p className="text-slate-500 mt-1">
          Quản lý các bất động sản mà bạn đang nhận bán hoặc cộng tác với các môi giới khác.
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          ⚠️ {error}
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-8 border-b border-slate-200 mb-8">
        <button
          onClick={() => setActiveTab("selling")}
          className={`pb-4 text-sm font-bold relative transition-colors ${
            activeTab === "selling"
              ? "text-primary border-b-2 border-primary"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          Bất động sản đang nhận bán
          <span className="ml-2 px-2 py-0.5 bg-primary/10 text-primary rounded-full text-[10px]">
            {sellingCount}
          </span>
        </button>
        <button
          onClick={() => setActiveTab("owned")}
          className={`pb-4 text-sm font-bold transition-colors ${
            activeTab === "owned"
              ? "text-primary border-b-2 border-primary"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          Bất động sản được nhận bán
          <span className="ml-2 px-2 py-0.5 bg-slate-100 text-slate-600 rounded-full text-[10px]">
            {ownedCount}
          </span>
        </button>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Search & Filter Bar */}
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-64">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
                search
              </span>
              <input
                className="w-full pl-10 pr-4 py-2 text-xs rounded-lg border border-slate-200 bg-white focus:ring-primary focus:ring-2 focus:outline-none"
                placeholder="Tìm theo tên BĐS, địa chỉ..."
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              className="text-xs border border-slate-200 bg-white rounded-lg focus:ring-primary focus:ring-2 px-3 py-2 focus:outline-none"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as "all" | "active" | "inactive" | "completed" | "pending-confirmation" | "sold")}
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="active">Đang nhận bán</option>
              <option value="pending-confirmation">Chờ xác nhận</option>
              <option value="sold">Đã bán</option>
              <option value="inactive">Đã kết thúc</option>
            </select>
          </div>
        </div>

        {/* Table or Empty State */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4">
            <span className="material-symbols-outlined text-5xl text-slate-300 mb-3">
              handshake
            </span>
            <p className="text-slate-500 font-medium mb-2">
              {currentData.length === 0
                ? activeTab === "selling"
                  ? "Chưa nhận bán bất động sản nào"
                  : "Chưa có bất động sản nào được nhận bán"
                : "Không tìm thấy kết quả"}
            </p>
            <p className="text-xs text-slate-400">
              {currentData.length === 0
                ? activeTab === "selling"
                  ? "Hãy vào trang Bất Động Sản và click 'Nhận bán' để bắt đầu!"
                  : "Chờ các môi giới khác nắn bán bất động sản của bạn"
                : "Thử thay đổi bộ lọc hoặc tìm kiếm"}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                  <th className="px-6 py-4">Bất động sản</th>
                  <th className="px-6 py-4">Vị trí</th>
                  <th className="px-6 py-4">Giá</th>
                  <th className="px-6 py-4">
                    {activeTab === "selling" ? "Hoa hồng" : "Người nhận bán"}
                  </th>
                  <th className="px-6 py-4">Ngày</th>
                  <th className="px-6 py-4">Trạng thái</th>
                  <th className="px-6 py-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                    {/* Property */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-12 h-10 rounded bg-slate-100 shrink-0 overflow-hidden border border-slate-200"
                          style={{
                            backgroundImage: item.property?.images?.[0]
                              ? `url('${item.property.images[0]}')`
                              : "none",
                            backgroundSize: "cover",
                            backgroundPosition: "center",
                          }}
                        />
                        <Link
                          href={`/properties/${item.property?.slug}`}
                          className="text-xs font-semibold text-primary hover:underline line-clamp-2 max-w-xs"
                        >
                          {item.property?.title || "N/A"}
                        </Link>
                      </div>
                    </td>

                    {/* Location */}
                    <td className="px-6 py-4 text-xs text-slate-600">
                      {item.property?.district && item.property?.city
                        ? `${item.property.district}, ${item.property.city}`
                        : "N/A"}
                    </td>

                    {/* Price */}
                    <td className="px-6 py-4 text-sm font-bold text-primary">
                      {item.property?.price ? formatPrice(item.property.price) : "N/A"}
                    </td>

                    {/* Commission or Agent Name */}
                    <td className="px-6 py-4 text-sm font-semibold">
                      {activeTab === "selling" ? (
                        <span className="text-emerald-600">{item.commission_rate}%</span>
                      ) : (
                        <span className="text-slate-700">{item.agent?.full_name || "N/A"}</span>
                      )}
                    </td>

                    {/* Date */}
                    <td className="px-6 py-4 text-sm font-medium text-slate-600">
                      {formatDate(item.started_at)}
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <span
                        className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide rounded-full flex items-center gap-1 w-fit ${
                          statusConfig[item.status].className
                        }`}
                      >
                        <span className="material-symbols-outlined text-xs">
                          {statusConfig[item.status].icon}
                        </span>
                        {statusConfig[item.status].label}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                      <Link
                        href={`/properties/${item.property?.slug}`}
                        className="p-2 text-slate-500 hover:bg-slate-100 rounded transition-colors"
                        title="Xem chi tiết"
                      >
                        <span className="material-symbols-outlined text-lg">
                          visibility
                        </span>
                      </Link>

                      {/* Tab 1: I'm the selling agent (Bất động sản đang nhận bán) */}
                      {activeTab === "selling" && (
                        <>
                          {item.status === "active" && (
                            <>
                              <button
                                onClick={() => handleMarkAsSold(item.id)}
                                disabled={actioningId === item.id}
                                className="p-2 text-blue-500 hover:bg-blue-50 rounded transition-colors disabled:opacity-50"
                                title="Đã bán"
                              >
                                <span className="material-symbols-outlined text-lg">
                                  {actioningId === item.id ? "hourglass_empty" : "task_alt"}
                                </span>
                              </button>
                              <button
                                onClick={() => handleCancelCollaboration(item.id)}
                                disabled={actioningId === item.id}
                                className="p-2 text-red-500 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                                title="Bỏ nhận bán"
                              >
                                <span className="material-symbols-outlined text-lg">
                                  {actioningId === item.id ? "hourglass_empty" : "close"}
                                </span>
                              </button>
                            </>
                          )}
                          {item.status === "pending-confirmation" && (
                            <span className="text-xs text-amber-600">Chờ xác nhận từ chủ BĐS</span>
                          )}
                        </>
                      )}

                      {/* Tab 2: I'm the owner (Bất động sản được nhận bán) */}
                      {activeTab === "owned" && (
                        <>
                          {item.status === "pending-confirmation" && (
                            <>
                              <button
                                onClick={() => handleConfirmSale(item.id)}
                                disabled={actioningId === item.id}
                                className="p-2 text-emerald-500 hover:bg-emerald-50 rounded transition-colors disabled:opacity-50"
                                title="Xác nhận đã bán"
                              >
                                <span className="material-symbols-outlined text-lg">
                                  {actioningId === item.id ? "hourglass_empty" : "check_circle"}
                                </span>
                              </button>
                              <button
                                onClick={() => handleCancelCollaboration(item.id)}
                                disabled={actioningId === item.id}
                                className="p-2 text-red-500 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                                title="Từ chối xác nhận"
                              >
                                <span className="material-symbols-outlined text-lg">
                                  {actioningId === item.id ? "hourglass_empty" : "close"}
                                </span>
                              </button>
                            </>
                          )}
                        </>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
      