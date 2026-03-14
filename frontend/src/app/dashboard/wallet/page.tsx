"use client";
import { useState, useEffect } from "react";
import { collaborationService } from "@/features/collaboration/collaboration.service";
import { propertyService } from "@/features/property/property.service";
import type { Collaboration } from "@/features/collaboration/collaboration.types";
import type { Property } from "@/features/property/property.types";

// Package fee map
const PACKAGE_FEE: Record<string, number> = {
  free: 0,
  vip: 50000,
  diamond: 150000,
};

function formatCurrency(amount: number): string {
  if (amount >= 1e9) return `${(amount / 1e9).toFixed(2)} tỷ`;
  if (amount >= 1e6) return `${(amount / 1e6).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}M`;
  return amount.toLocaleString("vi-VN") + "đ";
}

export default function WalletPage() {
  const [collaborations, setCollaborations] = useState<Collaboration[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [collabs, props] = await Promise.all([
          collaborationService.getMyCollaborations(),
          propertyService.getByAgent(),
        ]);
        setCollaborations(collabs);
        setProperties(props);
      } catch (err) {
        console.error("Error fetching wallet data:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Tổng hoa hồng nhận được = sum of (commission_rate% * price) for sold/completed collaborations
  const totalCommission = collaborations
    .filter((c) => c.status === "sold" || c.status === "completed")
    .reduce((sum, c) => {
      const price = c.property?.price || 0;
      const rate = c.commission_rate || 0;
      return sum + (rate / 100) * price;
    }, 0);

  // Tổng phí dịch vụ = sum of package fees for all agent's properties
  const totalServiceFee = properties.reduce((sum, p) => {
    return sum + (PACKAGE_FEE[p.package || "free"] || 0);
  }, 0);

  // Build transaction history from sold collaborations + own properties with fees
  const txHistory = [
    ...collaborations
      .filter((c) => c.status === "sold" || c.status === "completed")
      .map((c) => ({
        id: `HH-${c.id.slice(-6).toUpperCase()}`,
        icon: "paid",
        iconBg: "bg-emerald-100 text-emerald-600",
        description: `Nhận hoa hồng: ${c.property?.title || "BĐS"}`,
        amount: `+${formatCurrency((c.commission_rate / 100) * (c.property?.price || 0))}`,
        amountClass: "text-emerald-600",
        time: c.started_at ? new Date(c.started_at).toLocaleDateString("vi-VN") : "—",
        status: "success",
      })),
    ...properties
      .filter((p) => p.package && p.package !== "free")
      .map((p) => ({
        id: `PHI-${p.id.slice(-6).toUpperCase()}`,
        icon: "description",
        iconBg: "bg-red-100 text-red-600",
        description: `Phí dịch vụ: ${p.package === "vip" ? "Gói VIP" : "Gói Kim Cương"} – ${p.title}`,
        amount: `-${formatCurrency(PACKAGE_FEE[p.package!])}`,
        amountClass: "text-red-600",
        time: p.createdat ? new Date(p.createdat).toLocaleDateString("vi-VN") : "—",
        status: "success",
      })),
  ].sort(() => -1); // newest first (stable for now)

  const filteredTx = filter === "all"
    ? txHistory
    : filter === "commission"
      ? txHistory.filter((t) => t.id.startsWith("HH-"))
      : txHistory.filter((t) => t.id.startsWith("PHI-"));

  return (
    <>
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
            Ví & Thanh toán
          </h1>
          <p className="text-slate-500 mt-1">
            Theo dõi hoa hồng, phí dịch vụ và lịch sử giao dịch của bạn.
          </p>
        </div>
        <button className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-slate-50 transition-colors">
          <span className="material-symbols-outlined text-lg">file_download</span>
          <span>Xuất sao kê</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Commission Card */}
        <div className="bg-gradient-to-br from-emerald-50 to-green-50 p-8 rounded-2xl border border-emerald-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-200/30 rounded-full -mr-10 -mt-10 pointer-events-none" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-emerald-500 text-white rounded-xl shadow-lg shadow-emerald-500/30">
                <span className="material-symbols-outlined text-xl leading-none">trending_up</span>
              </div>
              <p className="text-emerald-700 font-bold">Tổng hoa hồng nhận được</p>
            </div>
            {loading ? (
              <div className="animate-pulse h-10 bg-emerald-200 rounded w-40 mb-2" />
            ) : (
              <p className="text-4xl font-black text-emerald-800 mb-1">
                {formatCurrency(totalCommission)}
              </p>
            )}
            <p className="text-xs text-emerald-600 mt-2">
              Từ {collaborations.filter(c => c.status === "sold" || c.status === "completed").length} giao dịch đã hoàn tất
            </p>
          </div>
        </div>

        {/* Service Fee Card */}
        <div className="bg-gradient-to-br from-slate-50 to-blue-50 p-8 rounded-2xl border border-slate-200 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-200/20 rounded-full -mr-10 -mt-10 pointer-events-none" />
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 bg-slate-600 text-white rounded-xl shadow-lg shadow-slate-500/20">
                <span className="material-symbols-outlined text-xl leading-none">receipt_long</span>
              </div>
              <p className="text-slate-600 font-bold">Tổng phí dịch vụ đã chi</p>
            </div>
            {loading ? (
              <div className="animate-pulse h-10 bg-slate-200 rounded w-40 mb-2" />
            ) : (
              <p className="text-4xl font-black text-slate-900 mb-1">
                {formatCurrency(totalServiceFee)}
              </p>
            )}
            <p className="text-xs text-slate-500 mt-2">
              Từ {properties.filter(p => p.package && p.package !== "free").length} gói VIP / Kim Cương đã đăng ký
            </p>
          </div>
        </div>
      </div>

      {/* Transaction History Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-lg font-bold">Lịch sử giao dịch</h2>
            <p className="text-sm text-slate-500">Hoa hồng nhận được và phí dịch vụ đã chi.</p>
          </div>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
              filter_list
            </span>
            <select
              className="pl-9 pr-4 py-2 text-xs font-bold border border-slate-200 bg-transparent rounded-lg focus:ring-primary focus:border-primary focus:outline-none appearance-none"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option value="all">Tất cả giao dịch</option>
              <option value="commission">Hoa hồng nhận</option>
              <option value="fee">Phí dịch vụ</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
            </div>
          ) : filteredTx.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-slate-400">
              <span className="material-symbols-outlined text-5xl mb-3">receipt_long</span>
              <p className="font-medium">Chưa có giao dịch nào</p>
              <p className="text-xs mt-1">Các hoa hồng và phí sẽ xuất hiện ở đây.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                  <th className="px-6 py-4 whitespace-nowrap">Mã giao dịch</th>
                  <th className="px-6 py-4 whitespace-nowrap">Nội dung</th>
                  <th className="px-6 py-4 whitespace-nowrap">Số tiền</th>
                  <th className="px-6 py-4 whitespace-nowrap text-center">Thời gian</th>
                  <th className="px-6 py-4 whitespace-nowrap text-center">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTx.map((txn) => (
                  <tr key={txn.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <span className="text-sm font-mono text-slate-500 uppercase">{txn.id}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-full ${txn.iconBg} flex items-center justify-center`}>
                          <span className="material-symbols-outlined text-lg">{txn.icon}</span>
                        </div>
                        <span className="text-sm font-bold text-slate-900 line-clamp-1 max-w-xs">{txn.description}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-sm font-bold ${txn.amountClass}`}>{txn.amount}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="text-xs text-slate-500">{txn.time}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className="px-2 py-1 text-[10px] font-bold uppercase tracking-wide bg-emerald-100 text-emerald-700 rounded-full">
                        Thành công
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {!loading && filteredTx.length > 0 && (
          <div className="p-6 bg-slate-50 flex items-center justify-between border-t border-slate-100">
            <p className="text-sm text-slate-500">
              Hiển thị {filteredTx.length} giao dịch
            </p>
          </div>
        )}
      </div>
    </>
  );
}
