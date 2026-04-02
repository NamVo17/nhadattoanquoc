"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { authorizedFetch } from "@/lib/authorizedFetch";

interface User {
  id: string;
  fullName?: string;
  email: string;
  role: string;
  avatarUrl?: string;
}

interface DashboardStats {
  totalProperties: number;
  activeProperties: number;
  totalSpent: number;
  totalFeesPaid: number;
  totalCommissionEarned: number;
  propertyStats: { approved: number; pending: number; expired: number };
  last7DaysChart: { date: string; count: number }[];
  last30DaysPayments: { date: string; amount: number; count: number }[];
  last30DaysCommissions: { date: string; amount: number; count: number }[];
  recentNotifications: any[];
  unreadCount: number;
  recentProperties: any[];
}

const NOTIFICATION_ICON: Record<string, { icon: string; color: string; bg: string }> = {
  property_posted: { icon: "home", color: "text-blue-600", bg: "bg-blue-100" },
  property_edited: { icon: "edit", color: "text-indigo-600", bg: "bg-indigo-100" },
  property_deleted: { icon: "delete", color: "text-red-500", bg: "bg-red-100" },
  collaboration_sent: { icon: "handshake", color: "text-[#135bec]", bg: "bg-blue-100" },
  collaboration_received: { icon: "real_estate_agent", color: "text-purple-600", bg: "bg-purple-100" },
  commission_received: { icon: "account_balance_wallet", color: "text-orange-600", bg: "bg-orange-100" },
  payment_success: { icon: "verified_user", color: "text-green-600", bg: "bg-green-100" },
};

function getNotifStyle(type: string) {
  return NOTIFICATION_ICON[type] || { icon: "notifications", color: "text-slate-500", bg: "bg-slate-100" };
}

function timeAgo(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return `${diff}s trước`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m trước`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h trước`;
  return `${Math.floor(diff / 86400)}d trước`;
}

// Animated number counter
function AnimatedNumber({ value, prefix = '', suffix = '', duration = 900 }: { value: number; prefix?: string; suffix?: string; duration?: number }) {
  const [display, setDisplay] = useState(0);
  const start = useRef(0);
  useEffect(() => {
    start.current = 0;
    const step = (timestamp: number) => {
      if (!start.current) start.current = timestamp;
      const progress = Math.min((timestamp - start.current) / duration, 1);
      setDisplay(Math.floor(progress * value));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [value, duration]);
  return <>{prefix}{display.toLocaleString('vi-VN')}{suffix}</>;
}

// Mini SVG bar chart — uses fixed 96px max height with px-based bars (% doesn't work in flex)
const BAR_MAX_PX = 96;
function BarChart({ data }: { data: { date: string; count: number }[] }) {
  const max = Math.max(...data.map(d => d.count), 1);
  const days = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
  return (
    <div className="flex items-end gap-1.5 w-full mt-2" style={{ height: BAR_MAX_PX + 20 }}>
      {data.map((d, i) => {
        const barPx = d.count > 0 ? Math.max(Math.round((d.count / max) * BAR_MAX_PX), 6) : 4;
        const dayIdx = new Date(d.date).getDay();
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative" style={{ height: BAR_MAX_PX + 20 }}>
            {/* spacer fills remaining space above bar */}
            <div className="flex-1" />
            <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-[10px] font-bold px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
              {d.count} tin
            </div>
            <div
              className="w-full rounded-t-md transition-all duration-500"
              style={{
                height: barPx,
                background: d.count > 0
                  ? 'linear-gradient(180deg, #3d78fb 0%, #135bec 100%)'
                  : '#e2e8f0',
              }}
            />
            <span className="text-[9px] font-bold text-slate-400 shrink-0">{days[dayIdx]}</span>
          </div>
        );
      })}
    </div>
  );
}

// Interactive SVG line chart with X/Y axes and hover tooltip
function InteractiveLineChart({ data, color = '#135bec' }: {
  data: { date: string; amount: number }[];
  color?: string;
}) {
  const [tooltip, setTooltip] = useState<{ idx: number } | null>(null);
  const amounts = data.map(d => d.amount);
  const max = Math.max(...amounts, 1);
  const W = 500, H = 170, PL = 68, PR = 10, PT = 10, PB = 26;
  const cW = W - PL - PR;
  const cH = H - PT - PB;

  const pts = data.map((d, i) => ({
    x: PL + (data.length > 1 ? (i / (data.length - 1)) * cW : cW / 2),
    y: PT + cH - (d.amount / max) * cH,
    amount: d.amount,
    date: d.date,
    idx: i,
  }));

  const lineStr = pts.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ');
  const areaStr = `${PL},${PT + cH} ${lineStr} ${PL + cW},${PT + cH}`;

  const yTicks = [0, 1, 2, 3].map(i => ({
    value: max * ((3 - i) / 3),
    y: PT + (i / 3) * cH,
  }));

  const xTickIdxs = Array.from(new Set([0, 7, 14, 21, data.length - 1])).filter(i => i < data.length);
  const ttPt = tooltip !== null ? pts[tooltip.idx] : null;

  const fmtY = (v: number) => {
    if (v >= 1_000_000_000) return (v / 1_000_000_000).toFixed(1) + 'B';
    if (v >= 1_000_000) return (v / 1_000_000).toFixed(1) + 'M';
    if (v >= 1_000) return (v / 1_000).toFixed(0) + 'K';
    return v.toFixed(0);
  };

  return (
    <div className="relative w-full select-none mt-3">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full"
        style={{ height: H }}
        onMouseLeave={() => setTooltip(null)}
      >
        <defs>
          <linearGradient id={`area-${color.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.18" />
            <stop offset="100%" stopColor={color} stopOpacity="0.01" />
          </linearGradient>
          <clipPath id={`clip-${color.replace('#', '')}`}>
            <rect x={PL} y={PT - 2} width={cW} height={cH + 4} />
          </clipPath>
        </defs>

        {/* Y axis grid & labels */}
        {yTicks.map((t, i) => (
          <g key={i}>
            <line x1={PL} y1={t.y} x2={PL + cW} y2={t.y} stroke="#f1f5f9" strokeWidth="1" />
            <text x={PL - 5} y={t.y + 3.5} textAnchor="end" fontSize="9" fill="#94a3b8">{fmtY(t.value)}</text>
          </g>
        ))}

        {/* Y axis line */}
        <line x1={PL} y1={PT} x2={PL} y2={PT + cH} stroke="#e2e8f0" strokeWidth="1" />

        {/* Area */}
        <polygon points={areaStr} fill={`url(#area-${color.replace('#', '')})`} clipPath={`url(#clip-${color.replace('#', '')})`} />

        {/* Line */}
        <polyline points={lineStr} fill="none" stroke={color} strokeWidth="2"
          strokeLinecap="round" strokeLinejoin="round" clipPath={`url(#clip-${color.replace('#', '')})`} />

        {/* Dots */}
        {pts.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y}
            r={tooltip?.idx === i ? 5.5 : 3.5}
            fill={p.amount > 0 ? color : '#cbd5e1'}
            stroke="white" strokeWidth="1.5"
            onMouseEnter={() => setTooltip({ idx: i })}
            style={{ cursor: 'crosshair' }}
          />
        ))}

        {/* X axis labels */}
        {xTickIdxs.map(idx => (
          <text key={idx} x={pts[idx].x} y={H - 4}
            textAnchor="middle" fontSize="9" fill="#94a3b8">
            {new Date(data[idx].date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
          </text>
        ))}

        {/* Tooltip */}
        {ttPt && (() => {
          const boxW = 115, boxH = 38;
          const bx = ttPt.x > W / 2 ? ttPt.x - boxW - 10 : ttPt.x + 10;
          const by = Math.max(PT + 4, Math.min(ttPt.y - boxH / 2, PT + cH - boxH));
          return (
            <g>
              <line x1={ttPt.x} y1={PT} x2={ttPt.x} y2={PT + cH}
                stroke={color} strokeWidth="1" strokeDasharray="3 3" opacity="0.45" />
              <rect x={bx} y={by} width={boxW} height={boxH} rx="6" fill="white"
                style={{ filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.13))' }} />
              <rect x={bx} y={by} width={boxW} height={boxH} rx="6" fill="none"
                stroke={color} strokeWidth="0.7" opacity="0.3" />
              <text x={bx + boxW / 2} y={by + 13} textAnchor="middle" fontSize="9" fill="#64748b">
                {new Date(ttPt.date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
              </text>
              <text x={bx + boxW / 2} y={by + 28} textAnchor="middle" fontSize="10.5"
                fontWeight="700" fill={color}>
                {ttPt.amount.toLocaleString('vi-VN')} ₫
              </text>
            </g>
          );
        })()}
      </svg>
    </div>
  );
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 12) return "Chào buổi sáng";
  if (h < 18) return "Chào buổi chiều";
  return "Chào buổi tối";
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const userData = localStorage.getItem('user');
    if (!token || !userData) { router.push('/login'); return; }
    try {
      const parsed = JSON.parse(userData);
      const role = parsed.role || parsed.userRole || parsed.user_role || parsed.type || 'user';
      setUser({ ...parsed, role });
    } catch { router.push('/login'); }
    finally { setIsLoading(false); }
  }, [router]);

  useEffect(() => {
    if (!user) return;
    setStatsLoading(true);
    authorizedFetch('/auth/dashboard-stats')
      .then(r => r.json())
      .then(d => {
        if (d.success) setStats(d.data);
        else setError('Không thể tải dữ liệu.');
      })
      .catch(() => setError('Lỗi kết nối.'))
      .finally(() => setStatsLoading(false));
  }, [user]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  if (!user) return null;

  const firstName = user.fullName?.split(' ').pop() || 'Bạn';
  const profit = (stats?.totalCommissionEarned ?? 0) - (stats?.totalFeesPaid ?? 0);

  return (
    <div className="pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
            {getGreeting()}, {firstName}! 👋
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            {statsLoading ? 'Đang tải dữ liệu...' : 'Tổng quan hoạt động của bạn hôm nay.'}
          </p>
        </div>
        <a href="/post" className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all">
          <span className="material-symbols-outlined text-base leading-none">add_circle</span>
          Đăng tin mới
        </a>
      </div>

      {/* ── Stats Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">

        {/* Total properties */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group">
          <div className="flex justify-between items-start mb-3">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined">assignment</span>
            </div>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-full">Tổng cộng</span>
          </div>
          <p className="text-slate-500 text-sm font-medium mb-1">Tổng tin đăng</p>
          <p className="text-3xl font-extrabold text-slate-900">
            {statsLoading ? (
              <span className="inline-block w-12 h-8 bg-slate-100 animate-pulse rounded-lg" />
            ) : (
              <AnimatedNumber value={stats?.totalProperties ?? 0} />
            )}
          </p>
        </div>

        {/* Active properties */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group">
          <div className="flex justify-between items-start mb-3">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined">check_circle</span>
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">Đang hiển thị</span>
          </div>
          <p className="text-slate-500 text-sm font-medium mb-1">Tin đang hoạt động</p>
          <p className="text-3xl font-extrabold text-slate-900">
            {statsLoading ? (
              <span className="inline-block w-12 h-8 bg-slate-100 animate-pulse rounded-lg" />
            ) : (
              <AnimatedNumber value={stats?.activeProperties ?? 0} />
            )}
          </p>
        </div>

        {/* Expired */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group">
          <div className="flex justify-between items-start mb-3">
            <div className="p-2 bg-red-50 text-red-500 rounded-xl group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined">timer_off</span>
            </div>
            <span className="text-xs font-bold text-red-500 bg-red-50 px-2 py-1 rounded-full">Hết hạn</span>
          </div>
          <p className="text-slate-500 text-sm font-medium mb-1">Tin hết hạn</p>
          <p className="text-3xl font-extrabold text-slate-900">
            {statsLoading ? (
              <span className="inline-block w-12 h-8 bg-slate-100 animate-pulse rounded-lg" />
            ) : (
              <AnimatedNumber value={stats?.propertyStats?.expired ?? 0} />
            )}
          </p>
        </div>

        {/* Profit */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group">
          <div className="flex justify-between items-start mb-3">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl group-hover:scale-110 transition-transform">
              <span className="material-symbols-outlined">trending_up</span>
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">Lợi nhuận</span>
          </div>
          <p className="text-slate-500 text-sm font-medium mb-1">Lợi nhuận (tất cả)</p>
          <p className="text-2xl font-extrabold">
            {statsLoading ? (
              <span className="inline-block w-20 h-8 bg-slate-100 animate-pulse rounded-lg" />
            ) : (
              <span className={profit >= 0 ? 'text-emerald-600' : 'text-red-500'}>
                {profit < 0 ? '-' : ''}
                <AnimatedNumber value={Math.abs(profit) / 1000} suffix="K ₫" />
              </span>
            )}
          </p>
        </div>
      </div>

      {/* ── Bar chart: 7-day posting activity (full width) ── */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm mb-6">
        <div className="flex justify-between items-center mb-1">
          <h3 className="font-bold text-slate-900">Hoạt động 7 ngày qua</h3>
          <span className="text-xs text-slate-400 font-medium">Số tin đăng mỗi ngày</span>
        </div>
        {statsLoading ? (
          <div className="h-28 bg-slate-50 animate-pulse rounded-xl mt-2" />
        ) : (
          <BarChart data={stats?.last7DaysChart ?? []} />
        )}
      </div>

      {/* ── Payment Fee + Commission Charts ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">

        {/* Listing fee chart */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start mb-1">
            <div>
              <h3 className="font-bold text-slate-900">Phí đăng tin (30 ngày)</h3>
              <p className="text-xs text-slate-400 mt-0.5">Tổng chi phí gói VIP/Kim cương (VNĐ)</p>
            </div>
            <div className="text-right shrink-0 ml-3">
              <p className="text-base font-extrabold text-purple-600">
                {statsLoading ? (
                  <span className="inline-block w-16 h-5 bg-slate-100 animate-pulse rounded" />
                ) : (
                  (stats?.last30DaysPayments ?? []).reduce((s, d) => s + d.amount, 0).toLocaleString('vi-VN') + ' ₫'
                )}
              </p>
              <span className="text-[10px] text-slate-400">tháng này</span>
            </div>
          </div>
          {statsLoading ? (
            <div className="bg-slate-50 animate-pulse rounded-xl mt-3" style={{ height: 170 }} />
          ) : (stats?.last30DaysPayments ?? []).every(d => d.amount === 0) ? (
            <div className="flex flex-col items-center justify-center text-slate-300 gap-1.5 mt-3" style={{ height: 170 }}>
              <span className="material-symbols-outlined text-4xl">receipt_long</span>
              <p className="text-xs">Chưa có giao dịch nào</p>
            </div>
          ) : (
            <InteractiveLineChart
              data={stats?.last30DaysPayments ?? []}
              color="#9333ea"
            />
          )}
        </div>

        {/* Commission chart */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-start mb-1">
            <div>
              <h3 className="font-bold text-slate-900">Hoa hồng (30 ngày)</h3>
              <p className="text-xs text-slate-400 mt-0.5">Thu nhập từ đại lý đã bán (VNĐ)</p>
            </div>
            <div className="text-right shrink-0 ml-3">
              <p className="text-base font-extrabold text-orange-500">
                {statsLoading ? (
                  <span className="inline-block w-16 h-5 bg-slate-100 animate-pulse rounded" />
                ) : (
                  (stats?.last30DaysCommissions ?? []).reduce((s, d) => s + d.amount, 0).toLocaleString('vi-VN') + ' ₫'
                )}
              </p>
              <span className="text-[10px] text-slate-400">tháng này</span>
            </div>
          </div>
          {statsLoading ? (
            <div className="bg-slate-50 animate-pulse rounded-xl mt-3" style={{ height: 170 }} />
          ) : (stats?.last30DaysCommissions ?? []).every(d => d.amount === 0) ? (
            <div className="flex flex-col items-center justify-center text-slate-300 gap-1.5 mt-3" style={{ height: 170 }}>
              <span className="material-symbols-outlined text-4xl">handshake</span>
              <p className="text-xs">Chưa có giao dịch đã bán nào</p>
            </div>
          ) : (
            <InteractiveLineChart
              data={stats?.last30DaysCommissions ?? []}
              color="#f97316"
            />
          )}
        </div>
      </div>

      {/* ── Recent Activity (full width) ── */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-bold text-slate-900">Hoạt động gần đây</h3>
          {(stats?.unreadCount ?? 0) > 0 && (
            <span className="text-xs bg-red-500 text-white font-bold px-2 py-0.5 rounded-full">
              {stats?.unreadCount} mới
            </span>
          )}
        </div>
        <div className="divide-y divide-slate-50">
          {statsLoading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex gap-3 p-4">
                <div className="w-9 h-9 rounded-full bg-slate-100 animate-pulse shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-slate-100 animate-pulse rounded w-3/4" />
                  <div className="h-3 bg-slate-100 animate-pulse rounded w-1/2" />
                </div>
              </div>
            ))
          ) : (stats?.recentNotifications ?? []).length === 0 ? (
            <div className="p-8 text-center text-slate-400">
              <span className="material-symbols-outlined text-4xl mb-2 block">notifications_none</span>
              <p className="text-sm">Chưa có thông báo nào.</p>
              <p className="text-xs mt-1">Hãy đăng tin đầu tiên của bạn!</p>
            </div>
          ) : (
            stats!.recentNotifications.map((n: any) => {
              const style = getNotifStyle(n.type);
              return (
                <div key={n.id} className={`flex gap-3 p-4 hover:bg-slate-50 transition-colors ${!n.is_read ? 'bg-blue-50/40' : ''}`}>
                  <div className={`size-9 rounded-full ${style.bg} flex items-center justify-center ${style.color} shrink-0`}>
                    <span className="material-symbols-outlined text-base">{style.icon}</span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex justify-between items-start gap-2">
                      <p className="text-sm font-semibold text-slate-800 leading-tight">{n.title}</p>
                      <span className="text-[10px] text-slate-400 whitespace-nowrap">{timeAgo(n.created_at)}</span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{n.body}</p>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 flex items-center gap-2">
          <span className="material-symbols-outlined text-base">error</span>
          {error} — Một số dữ liệu có thể không hiển thị chính xác.
        </div>
      )}
    </div>
  );
}
