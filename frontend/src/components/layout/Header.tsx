"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { generateAdminSessionToken } from "@/utils/adminAuth";
import { performLogout } from "@/utils/authFetch";
import { authorizedFetch } from "@/lib/authorizedFetch";

const NAV_LINKS = [
    { label: "Trang chủ", href: "/" },
    { label: "Bất động sản", href: "/properties" },
    { label: "Dự án mới", href: "/projects" },
    { label: "Cộng tác viên", href: "/agents" },
    { label: "Tin tức", href: "/news" },
];

interface UserInfo {
    fullName?: string;
    email?: string;
    avatarUrl?: string;
    role?: string;
}

interface Notification {
    id: string;
    type: string;
    title: string;
    body: string;
    is_read: boolean;
    created_at: string;
    metadata?: any;
}

function getInitialUser(): UserInfo | null {
    if (typeof window === "undefined") return null;
    try {
        const savedUser = localStorage.getItem("user");
        const token = localStorage.getItem("accessToken");
        if (savedUser && token) {
            const userData = JSON.parse(savedUser) as UserInfo;
            const role = userData.role ||
                (userData as any).userRole ||
                (userData as any).user_role ||
                (userData as any).type ||
                'user';
            return { ...userData, role };
        }
    } catch { }
    return null;
}

// Map notification type to icon + color
function getNotifStyle(type: string) {
    const map: Record<string, { icon: string; bg: string; color: string }> = {
        property_posted: { icon: "home", bg: "bg-blue-100", color: "text-blue-600" },
        property_edited: { icon: "edit", bg: "bg-indigo-100", color: "text-indigo-600" },
        property_deleted: { icon: "delete", bg: "bg-red-100", color: "text-red-500" },
        property_expired: { icon: "timer_off", bg: "bg-orange-100", color: "text-orange-600" },
        property_renewed: { icon: "autorenew", bg: "bg-teal-100", color: "text-teal-600" },
        collaboration_sent: { icon: "handshake", bg: "bg-blue-100", color: "text-[#135bec]" },
        collaboration_received: { icon: "real_estate_agent", bg: "bg-purple-100", color: "text-purple-600" },
        commission_received: { icon: "account_balance_wallet", bg: "bg-orange-100", color: "text-orange-600" },
        payment_success: { icon: "verified_user", bg: "bg-green-100", color: "text-green-600" },
    };
    return map[type] || { icon: "notifications", bg: "bg-slate-100", color: "text-slate-600" };
}

function timeAgo(dateStr: string): string {
    const now = new Date();
    const date = new Date(dateStr);
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diff < 60) return `${diff} giây trước`;
    if (diff < 3600) return `${Math.floor(diff / 60)} phút trước`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} giờ trước`;
    return `${Math.floor(diff / 86400)} ngày trước`;
}

export default function Header() {
    const [menuOpen, setMenuOpen] = useState(false);
    const [notiOpen, setNotiOpen] = useState(false);
    const [userDropdownOpen, setUserDropdownOpen] = useState(false);
    const [user, setUser] = useState<UserInfo | null>(getInitialUser);
    const [mounted, setMounted] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [notiLoading, setNotiLoading] = useState(false);
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        setMounted(true);
    }, []);

    // Cross-tab logout sync
    useEffect(() => {
        const handleStorage = (e: StorageEvent) => {
            if (e.key === '__logout_signal__') {
                setUser(null);
                router.push('/login');
            }
            // If accessToken is removed in another tab
            if (e.key === 'accessToken' && !e.newValue) {
                setUser(null);
            }
        };
        window.addEventListener('storage', handleStorage);
        return () => window.removeEventListener('storage', handleStorage);
    }, [router]);

    const handleLogout = async () => {
        await performLogout();
        setUser(null);
        setUserDropdownOpen(false);
        router.push("/");
    };

    // Fetch unread count (poll every 30s)
    const fetchUnreadCount = useCallback(async () => {
        if (!user) return;
        try {
            const res = await authorizedFetch('/notifications/unread-count');
            if (res.ok) {
                const data = await res.json();
                setUnreadCount(data.data?.count ?? 0);
            }
        } catch { }
    }, [user]);

    useEffect(() => {
        if (!mounted || !user) return;
        fetchUnreadCount();
        const interval = setInterval(fetchUnreadCount, 30000);
        return () => clearInterval(interval);
    }, [mounted, user, fetchUnreadCount]);

    // Fetch notifications on dropdown open
    const handleNotiOpen = async () => {
        setNotiOpen(true);
        if (notifications.length === 0) {
            setNotiLoading(true);
            try {
                const res = await authorizedFetch('/notifications?limit=10');
                if (res.ok) {
                    const data = await res.json();
                    setNotifications(data.data?.notifications ?? []);
                }
            } catch { }
            setNotiLoading(false);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await authorizedFetch('/notifications/read-all', { method: 'PATCH' });
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
            setUnreadCount(0);
        } catch { }
    };

    const handleMarkRead = async (id: string) => {
        try {
            await authorizedFetch(`/notifications/${id}/read`, { method: 'PATCH' });
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch { }
    };

    return (
        <header className="sticky top-0 w-full border-b border-slate-200 bg-white shadow-sm z-40 lg:z-50">
            <div className="max-w-7xl mx-auto flex items-center justify-between gap-4 px-4 sm:px-6 lg:px-10 py-3">

                {/* ── Logo ── */}
                <Link href="/" className="flex items-center gap-2 text-primary shrink-0 hover:opacity-90 transition-opacity">
                    <span className="material-symbols-outlined text-2xl sm:text-3xl font-bold">home</span>
                    <h2 className="text-lg sm:text-xl font-extrabold tracking-tight">
                        NhàĐấtToànQuốc
                    </h2>
                </Link>

                {/* ── Desktop Nav ── */}
                <nav className="hidden lg:flex items-center gap-5 xl:gap-7">
                    {NAV_LINKS.map(({ label, href }) => {
                        const active = pathname === href || (href !== "/" && pathname.startsWith(href));
                        return (
                            <Link key={href} href={href}
                                className={`text-md font-semibold transition-colors ${active ? "text-primary" : "text-slate-600 hover:text-primary"}`}>
                                {label}
                            </Link>
                        );
                    })}
                </nav>

                {/* ── Right actions ── */}
                <div className="flex items-center gap-2 sm:gap-3">

                    {/* Đăng tin */}
                    {mounted && user && (user.role === "agent" || user.role === "admin") && (
                        <button
                            onClick={() => router.push("/post")}
                            className="hidden sm:flex items-center gap-1.5 bg-primary text-white px-3 py-2 rounded-lg text-sm font-bold shadow-lg shadow-blue-500/20 whitespace-nowrap hover:bg-primary/90 transition-colors"
                        >
                            <span className="material-symbols-outlined text-base leading-none">add_circle</span>
                            <span className="hidden md:inline">Đăng tin ngay</span>
                            <span className="inline md:hidden">Đăng tin</span>
                        </button>
                    )}

                    {/* ── Notifications ── */}
                    {mounted && user && (
                        <div
                            className="relative"
                            onMouseEnter={handleNotiOpen}
                            onMouseLeave={() => setNotiOpen(false)}
                        >
                            <button
                                className="flex items-center justify-center w-9 h-9 text-slate-600 hover:bg-slate-100 rounded-full transition-colors relative"
                                aria-label={`Thông báo${unreadCount > 0 ? ` (${unreadCount} chưa đọc)` : ''}`}
                                onClick={() => notiOpen ? setNotiOpen(false) : handleNotiOpen()}
                            >
                                <span className="material-symbols-outlined text-[22px]">notifications</span>
                                {unreadCount > 0 && (
                                    <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white border-2 border-white">
                                        {unreadCount > 9 ? '9+' : unreadCount}
                                    </span>
                                )}
                            </button>

                            {notiOpen && (
                                <div className="absolute right-0 top-full pt-2 w-72 sm:w-80 z-50">
                                    <div className="bg-white rounded-xl shadow-2xl border border-slate-100 overflow-hidden">
                                        <div className="p-3 border-b border-slate-100 flex justify-between items-center">
                                            <h3 className="font-bold text-sm">Thông báo</h3>
                                            {unreadCount > 0 && (
                                                <button
                                                    onClick={handleMarkAllRead}
                                                    className="text-xs text-primary font-bold hover:underline"
                                                >
                                                    Đọc tất cả
                                                </button>
                                            )}
                                        </div>
                                        <div className="max-h-80 overflow-y-auto divide-y divide-slate-50">
                                            {notiLoading ? (
                                                <div className="p-4 text-center text-sm text-slate-400">
                                                    <div className="inline-block w-5 h-5 border-2 border-slate-200 border-t-primary rounded-full animate-spin mb-2"></div>
                                                    <p>Đang tải...</p>
                                                </div>
                                            ) : notifications.length === 0 ? (
                                                <div className="p-6 text-center text-sm text-slate-400">
                                                    <span className="material-symbols-outlined text-3xl mb-2 block">notifications_none</span>
                                                    Không có thông báo nào
                                                </div>
                                            ) : (
                                                notifications.map((n) => {
                                                    const style = getNotifStyle(n.type);
                                                    return (
                                                        <div
                                                            key={n.id}
                                                            onClick={() => handleMarkRead(n.id)}
                                                            className={`flex gap-3 p-3 hover:bg-slate-50 cursor-pointer transition-colors ${!n.is_read ? 'bg-blue-50/50' : ''}`}
                                                        >
                                                            <div className={`size-8 rounded-full ${style.bg} flex items-center justify-center ${style.color} shrink-0`}>
                                                                <span className="material-symbols-outlined text-base">{style.icon}</span>
                                                            </div>
                                                            <div className="min-w-0 flex-1">
                                                                <div className="flex items-start justify-between gap-1">
                                                                    <p className={`text-sm font-semibold ${!n.is_read ? 'text-slate-900' : 'text-slate-700'}`}>{n.title}</p>
                                                                    {!n.is_read && <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5"></span>}
                                                                </div>
                                                                <p className="text-xs text-slate-500 line-clamp-2">{n.body}</p>
                                                                <p className="text-[10px] text-slate-400 mt-0.5 uppercase font-bold">{timeAgo(n.created_at)}</p>
                                                            </div>
                                                        </div>
                                                    );
                                                })
                                            )}
                                        </div>
                                        {notifications.length > 0 && (
                                            <div className="p-2 border-t border-slate-100 text-center">
                                                <Link href="/dashboard/settings" className="text-xs text-primary font-bold hover:underline">
                                                    Xem tất cả thông báo
                                                </Link>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── User Avatar / Login ── */}
                    <div className="border-l border-slate-200 pl-2 sm:pl-3">
                        {!mounted ? (
                            <div className="w-9 h-9 rounded-full bg-slate-100 animate-pulse" />
                        ) : user ? (
                            <div className="relative">
                                <button
                                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                                    className="flex items-center gap-2 hover:bg-slate-100 px-2 py-2 rounded-lg transition-colors"
                                >
                                    {user.avatarUrl ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                            alt={user.fullName}
                                            className="w-8 h-8 min-w-8 min-h-8 rounded-full object-cover object-center shrink-0"
                                            src={user.avatarUrl}
                                        />
                                    ) : (
                                        <div className="w-8 h-8 min-w-8 min-h-8 rounded-full bg-linear-to-br from-primary to-blue-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
                                            {user.fullName?.[0]?.toUpperCase() ?? "U"}
                                        </div>
                                    )}
                                </button>

                                {userDropdownOpen && (
                                    <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-xl border border-slate-100 z-50 overflow-hidden">
                                        <div className="px-4 py-3 border-b border-slate-100">
                                            <p className="text-sm font-bold text-slate-900">{user.fullName}</p>
                                            <p className="text-xs text-slate-500">{user.email}</p>
                                        </div>
                                        {user.role === 'admin' ? (
                                            <button
                                                onClick={() => {
                                                    generateAdminSessionToken();
                                                    window.open("/admin", "_blank");
                                                }}
                                                className="w-full text-left px-4 py-2.5 hover:bg-slate-50 text-sm font-medium text-slate-700 flex items-center gap-2 transition-colors"
                                            >
                                                <span className="material-symbols-outlined text-base">admin_panel_settings</span>
                                                Admin Dashboard
                                            </button>
                                        ) : (
                                            <button
                                                onClick={() => router.push("/dashboard")}
                                                className="w-full text-left px-4 py-2.5 hover:bg-slate-50 text-sm font-medium text-slate-700 flex items-center gap-2 transition-colors"
                                            >
                                                <span className="material-symbols-outlined text-base">person</span>
                                                Hồ sơ cá nhân
                                            </button>
                                        )}
                                        <button
                                            onClick={handleLogout}
                                            className="w-full text-left px-4 py-2.5 hover:bg-red-50 text-sm font-medium text-red-600 flex items-center gap-2 transition-colors border-t border-slate-100"
                                        >
                                            <span className="material-symbols-outlined text-base">logout</span>
                                            Đăng xuất
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => router.push("/post")}
                                    className="flex items-center gap-1.5 bg-primary text-white px-3 py-2 rounded-lg text-sm font-bold shadow-lg shadow-blue-500/20 hover:bg-primary/90 transition-colors whitespace-nowrap"
                                >
                                    <span className="material-symbols-outlined text-base leading-none">add_circle</span>
                                    <span>Đăng tin mới</span>
                                </button>
                                <a
                                    href="/login"
                                    className="flex items-center gap-1.5 border border-primary text-primary hover:bg-primary hover:text-white px-3 py-2 rounded-lg text-sm font-bold transition-colors whitespace-nowrap"
                                >
                                    <span className="material-symbols-outlined text-base leading-none">login</span>
                                    <span className="hidden sm:inline">Đăng Nhập</span>
                                </a>
                            </div>
                        )}
                    </div>

                    {/* Hamburger — mobile only */}
                    <button
                        className="flex lg:hidden items-center justify-center w-9 h-9 text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
                        onClick={() => setMenuOpen(!menuOpen)}
                        aria-label="Toggle menu"
                    >
                        <span className="material-symbols-outlined text-[22px]">
                            {menuOpen ? "close" : "menu"}
                        </span>
                    </button>
                </div>
            </div>

            {/* ── Mobile Nav Drawer ── */}
            {menuOpen && (
                <div className="lg:hidden border-t border-slate-100 bg-white px-4 py-4 space-y-1">
                    {NAV_LINKS.map(({ label, href }) => {
                        const active = pathname === href || (href !== "/" && pathname.startsWith(href));
                        return (
                            <Link key={href} href={href}
                                className={`block py-2.5 px-3 rounded-lg text-sm font-semibold transition-colors ${
                                    active
                                    ? "text-primary bg-blue-50"
                                    : "text-slate-700 hover:bg-slate-50 hover:text-primary"
                                    }`}
                                onClick={() => setMenuOpen(false)}
                            >
                                {label}
                            </Link>
                        );
                    })}
                    <div className="pt-3 border-t border-slate-100">
                        <Link
                            href="/post"
                            className="w-full flex items-center justify-center gap-2 bg-primary text-white px-4 py-3 rounded-lg text-sm font-bold shadow-md shadow-blue-500/20"
                            onClick={() => setMenuOpen(false)}
                        >
                            <span className="material-symbols-outlined text-base leading-none">add_circle</span>
                            Đăng tin ngay
                        </Link>
                    </div>
                </div>
            )}
        </header>
    );
}