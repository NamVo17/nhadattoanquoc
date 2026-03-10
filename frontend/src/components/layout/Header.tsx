"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { generateAdminSessionToken } from "@/utils/adminAuth";

const NAV_LINKS = [
    { label: "Trang chủ", href: "/" },
    { label: "Bất động sản", href: "/properties" },
    { label: "Dự án mới", href: "/projects" },
    { label: "Cộng tác viên", href: "/agents" },
    { label: "Tin tức", href: "/news" },
];

// ── Types ──────────────────────────────────────────────
interface UserInfo {
    fullName?: string;
    email?: string;
    avatarUrl?: string;
    role?: string;
}

function getInitialUser(): UserInfo | null {
    if (typeof window === "undefined") return null;
    try {
        const savedUser = localStorage.getItem("user");
        const token = localStorage.getItem("accessToken");
        if (savedUser && token) {
            const userData = JSON.parse(savedUser) as UserInfo;
            // Ensure role field is mapped correctly
            const role = userData.role || 
                        (userData as any).userRole || 
                        (userData as any).user_role ||
                        (userData as any).type ||
                        'user';
            return {
                ...userData,
                role: role
            };
        }
    } catch { }
    return null;
}

export default function Header() {
    const [menuOpen, setMenuOpen] = useState(false);
    const [notiOpen, setNotiOpen] = useState(false);
    const [userDropdownOpen, setUserDropdownOpen] = useState(false);
    const [user, setUser] = useState<UserInfo | null>(getInitialUser);
    const [mounted, setMounted] = useState(false);
    const pathname = usePathname();
    const router = useRouter();

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleLogout = async () => {
        try {
            await fetch(
                `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api/v1"}/auth/logout`,
                {
                    method: "POST",
                    credentials: "include",
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
                    },
                }
            ).catch(() => { });
        } finally {
            localStorage.removeItem("accessToken");
            localStorage.removeItem("user");
            setUser(null);
            setUserDropdownOpen(false);
            router.push("/");
        }
    };

    const notifications = [
        { icon: "handshake", bg: "bg-blue-100", color: "text-[#135bec]", title: "Yêu cầu hợp tác mới", body: "Môi giới Nguyễn Văn A muốn hợp tác bán căn hộ Masteri West Heights.", time: "5 phút trước" },
        { icon: "verified_user", bg: "bg-green-100", color: "text-green-600", title: "Tin đăng đã được duyệt", body: 'Tin đăng "Biệt thự Vinhomes Ocean Park" đã hiển thị trên sàn.', time: "1 giờ trước" },
        { icon: "account_balance_wallet", bg: "bg-orange-100", color: "text-orange-600", title: "Hoa hồng đã về ví", body: "Bạn vừa nhận được 25.000.000 VNĐ hoa hồng từ dự án Heritage.", time: "2 giờ trước" },
    ];

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
                            <a key={href} href={href}
                                className={`text-md font-semibold transition-colors ${active ? "text-primary" : "text-slate-600 hover:text-primary"}`}>
                                {label}
                            </a>
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
                            onMouseEnter={() => setNotiOpen(true)}
                            onMouseLeave={() => setNotiOpen(false)}
                        >
                            <button className="flex items-center justify-center w-9 h-9 text-slate-600 hover:bg-slate-100 rounded-full transition-colors relative">
                                <span className="material-symbols-outlined text-[22px]">notifications</span>
                                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white border-2 border-white">
                                    3
                                </span>
                            </button>

                            {notiOpen && (
                                <div className="absolute right-0 top-full pt-2 w-72 sm:w-80 z-50">
                                    <div className="bg-white rounded-xl shadow-2xl border border-slate-100 overflow-hidden">
                                        <div className="p-3 border-b border-slate-100 flex justify-between items-center">
                                            <h3 className="font-bold text-sm">Thông báo</h3>
                                            <button className="text-xs text-primary font-bold hover:underline">Xem tất cả</button>
                                        </div>
                                        <div className="max-h-80 overflow-y-auto divide-y divide-slate-50">
                                            {notifications.map((n) => (
                                                <div key={n.title} className="flex gap-3 p-3 hover:bg-slate-50 cursor-pointer transition-colors">
                                                    <div className={`size-8 rounded-full ${n.bg} flex items-center justify-center ${n.color} shrink-0`}>
                                                        <span className="material-symbols-outlined text-base">{n.icon}</span>
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-semibold">{n.title}</p>
                                                        <p className="text-xs text-slate-500 line-clamp-2">{n.body}</p>
                                                        <p className="text-[10px] text-slate-400 mt-0.5 uppercase font-bold">{n.time}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
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
                            <a key={href} href={href}
                                className={`block py-2.5 px-3 rounded-lg text-sm font-semibold transition-colors ${active
                                    ? "text-primary bg-blue-50"
                                    : "text-slate-700 hover:bg-slate-50 hover:text-primary"
                                    }`}
                                onClick={() => setMenuOpen(false)}
                            >
                                {label}
                            </a>
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