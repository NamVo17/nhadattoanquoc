/**
 * Admin Sidebar Navigation Component
 */

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

const menuItems = [
  {
    name: 'Tổng quan',
    href: '/admin',
    icon: 'dashboard',
    label: 'Tổng quan',
  },
  {
    name: 'Phê duyệt tin đăng',
    href: '/admin/approve-listings',
    icon: 'fact_check',
    label: 'Phê duyệt tin đăng',
  },
  {
    name: 'Quản lý tin tức',
    href: '/admin/news',
    icon: 'article',
    label: 'Quản lý tin tức',
  },
  {
    name: 'Quản lý người dùng',
    href: '/admin/users',
    icon: 'group',
    label: 'Quản lý người dùng',
  },
  {
    name: 'Xác thực KYC',
    href: '/admin/kyc',
    icon: 'verified_user',
    label: 'Xác thực KYC',
    badge: 0, // Will be updated dynamically
  },
  {
    name: 'Dòng tiền & Hoa hồng',
    href: '/admin/cashflow',
    icon: 'payments',
    label: 'Dòng tiền & Hoa hồng',
  },
  {
    name: 'Cấu hình hệ thống',
    href: '/admin/settings',
    icon: 'settings',
    label: 'Cấu hình hệ thống',
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const [kycPendingCount, setKycPendingCount] = useState(0);

  useEffect(() => {
    const fetchKYCCount = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
        const res = await fetch(`${apiUrl}/kyc/admin/statistics`, {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("accessToken")}`,
          },
        });
        
        const data = await res.json();
        if (data.success && data.data) {
          setKycPendingCount(data.data.pending || 0);
        }
      } catch (err) {
        console.error("Failed to fetch KYC count:", err);
      }
    };

    fetchKYCCount();
    // Refresh every 30 seconds
    const interval = setInterval(fetchKYCCount, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <aside className="w-64 shrink-0 border-r border-slate-200  bg-sidebar-light  flex flex-col">
      <div className="p-6 flex items-center gap-3">
        <div className="size-8 text-primary">
            <span className="material-symbols-outlined text-2xl sm:text-3xl font-bold">home</span>
        </div>
        <h1 className="text-lg font-extrabold tracking-tight text-primary"> 
          NhàĐấtToànQuốc
        </h1>
      </div>

      <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 text-sm rounded-lg transition-all ${
                isActive
                  ? 'bg-blue-100 text-primary border-r-4 border-primary font-semibold'
                  : 'text-slate-600 hover:bg-slate-50 font-medium border-r-4 border-transparent'
              }`}
            >
              <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
              <span className="flex-1">{item.name}</span>
              {item.href === '/admin/kyc' && kycPendingCount > 0 && (
                <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                  {kycPendingCount}
                </span>
              )}
              {item.badge && item.href !== '/admin/kyc' && (
                <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
