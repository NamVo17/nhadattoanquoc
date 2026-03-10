"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const navItems = [
  { href: "/dashboard", label: "Tổng quan", icon: "dashboard" },
  { href: "/dashboard/properties", label: "Tin đăng của tôi", icon: "description" },
  { href: "/dashboard/collaboration", label: "Yêu cầu hợp tác", icon: "handshake" },
  { href: "/dashboard/wallet", label: "Ví & Thanh toán", icon: "account_balance_wallet" },
  { href: "/dashboard/profile", label: "Cập nhật hồ sơ", icon: "manage_accounts" },
];

const settingsSubItems = [
  { href: "/dashboard/settings", label: "Thông báo & Quyền riêng tư" },
  { href: "/dashboard/settings/kyc", label: "Xác thực danh tính (KYC)" },
  { href: "/dashboard/settings/2fa", label: "Xác thực 2 yếu tố (2FA)" },
  { href: "/dashboard/settings/change-password", label: "Đổi mật khẩu" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname === href;
  };

  const isSettingsActive = pathname.startsWith("/dashboard/settings");

  // Auto-expand settings dropdown when on a settings page
  if (isSettingsActive && !settingsOpen) {
    // We need to use effect, but for simplicity we just use initial state logic
  }

  return (
    <div className="min-h-screen bg-background-light flex flex-col">
      {/* Header */}
      <Header />

      <div className="flex flex-1 max-w-[1440px] mx-auto w-full relativen ">
        {/* Mobile Menu Button */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden fixed top-16 left-4 z-50 w-10 h-10 bg-white border border-slate-200 rounded-lg flex items-center justify-center shadow-lg hover:bg-slate-50 transition-colors "
        >
          <span className="material-symbols-outlined text-slate-600">menu</span>
        </button>

        {/* Sidebar Overlay */}
        {sidebarOpen && (
          <div
            className="lg:hidden fixed inset-0 bg-black/50 z-40 "
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`
            fixed lg:static inset-y-0 left-0 z-50 lg:z-auto w-72 lg:w-72
            bg-white border-r border-slate-200
            flex flex-col transform transition-transform duration-300 ease-in-out
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
            lg:h-[calc(100vh-64px)] overflow-y-auto overflow-x-hidden  shadow-xl
          `}
        >
          {/* Close Button for Mobile */}
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden absolute top-4 right-4 w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center hover:bg-slate-200 transition-colors "
          >
            <span className="material-symbols-outlined text-slate-600 text-lg">close</span>
          </button>

          <nav className="flex-1 px-4 space-y-1 mt-8">
            {/* Regular nav items */}
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg font-semibold transition-colors ${isActive(item.href)
                    ? "bg-primary/10 text-primary"
                    : "text-slate-600 hover:bg-slate-100"
                  }`}
              >
                <span className="material-symbols-outlined">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}

            {/* Settings Dropdown */}
            <div>
              <button
                onClick={() => setSettingsOpen(!settingsOpen)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-lg font-semibold transition-colors ${isSettingsActive
                    ? "bg-primary/10 text-primary"
                    : "text-slate-600 hover:bg-slate-100"
                  }`}
              >
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined">settings</span>
                  <span>Cài đặt</span>
                </div>
                <span
                  className={`material-symbols-outlined text-sm transition-transform duration-200 ${settingsOpen || isSettingsActive ? "rotate-180" : ""
                    }`}
                >
                  expand_more
                </span>
              </button>

              {/* Sub-items */}
              {(settingsOpen || isSettingsActive) && (
                <div className="mt-1 flex flex-col space-y-0.5">
                  {settingsSubItems.map((sub) => (
                    <Link
                      key={sub.href}
                      href={sub.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center pl-11 pr-4 py-2.5 text-sm rounded-lg transition-colors ${pathname === sub.href
                          ? "bg-primary/10 text-primary font-bold"
                          : "text-slate-600 hover:bg-slate-100"
                        }`}
                    >
                      {sub.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </nav>

          <div className="p-4 mb-8">
            <Link
              href="/post"
              className="w-full flex items-center justify-center gap-2 bg-primary text-white py-3 px-4 rounded-xl font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all"
            >
              <span className="material-symbols-outlined text-sm">add_circle</span>
              <span>Đăng tin mới</span>
            </Link>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 overflow-hidden bg-background-light p-4 lg:p-8 pt-16 lg:pt-8">
          {children}
        </main>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
