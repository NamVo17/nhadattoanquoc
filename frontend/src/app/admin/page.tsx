/**
 * Admin Dashboard - Main Page
 * Overview and statistics for admins
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface UserInfo {
  fullName?: string;
  email?: string;
  avatarUrl?: string;
  role?: string;
  userRole?: string
  user_role?: string
  type?: string
}

export default function AdminDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      router.push('/login');
      return;
    }

    try {
      const parsedUser = JSON.parse(userData) as UserInfo;
      // Ensure role is mapped correctly
      const role = parsedUser.role || parsedUser.userRole || parsedUser.user_role || parsedUser.type || 'user';
      setUser({
        ...parsedUser,
        role
      });

      // Verify user is admin
      if (role !== 'admin') {
        router.push('/dashboard');
        return;
      }
    } catch  {
      router.push('/login');
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  const stats = [
    {
      id: 1,
      icon: 'store',
      label: 'Tổng doanh thu từ phí dịch vụ',
      value: '1.248.000.000đ',
      change: '+12.5%',
      color: 'text-blue-500',
    },
    {
      id: 2,
      icon: 'trending_up',
      label: 'Hoa hồng đã luân chuyển',
      value: '4.850.200.000đ',
      change: '+8.2%',
      color: 'text-purple-500',
    },
    {
      id: 3,
      icon: 'people',
      label: 'Số lượng môi giới mới',
      value: '156',
      label2: 'Tháng này',
      color: 'text-orange-500',
    },
    {
      id: 4,
      icon: 'warning',
      label: 'Hộ chủ chờ xử lý',
      value: '24',
      label2: 'Cần phê duyệt',
      color: 'text-red-500',
    },
  ];
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <p className="text-slate-500">Đang tải bảng điều khiển...</p>
      </div>
    );
  }
  return (
    <div className="p-8 space-y-8">
      {/* Welcome Section */}
      <div className="bg-linear-to-r from-primary to-blue-600 rounded-lg p-6 text-white">
        <h1 className="text-2xl font-bold mb-2">Chào mừng, {user?.fullName || 'Administrator'}!</h1>
        <p className="text-blue-100">
          Đây là bảng điều khiển quản trị hệ thống NhàĐấtToànQuốc.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.id} className="admin-stat">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-slate-600  uppercase">
                  {stat.label}
                </p>
                <p className="text-2xl font-bold text-slate-900  mt-2">
                  {stat.value}
                </p>
                {stat.label2 && (
                  <p className="text-xs text-slate-500 mt-1">{stat.label2}</p>
                )}
                {stat.change && (
                  <p className="text-xs text-green-600  mt-1">{stat.change}</p>
                )}
              </div>
              <span className={`material-symbols-outlined text-3xl ${stat.color}`}>
                {stat.icon}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart Section */}
        <div className="lg:col-span-2 admin-card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-900 ">
              Thống kê Hiệu năng Hệ thống
            </h3>
            <div className="flex gap-2">
              <button className="text-sm text-primary font-medium">Doanh thu</button>
              <button className="text-sm text-slate-500">Tin đăng</button>
            </div>
          </div>

          <div className="h-64 chart-placeholder rounded-lg border border-slate-200  flex items-center justify-center text-slate-400">
            <div className="text-center">
              <span className="material-symbols-outlined text-4xl mb-2">bar_chart</span>
              <p>Biểu đồ thống kê sẽ được hiển thị tại đây</p>
            </div>
          </div>
        </div>

        {/* Activity Section */}
        <div className="admin-card">
          <h3 className="font-semibold text-slate-900  mb-4">Hoạt động gần đây</h3>

          <div className="space-y-4">
            <div className="pb-4 border-b border-slate-200  last:border-b-0">
              <p className="text-sm font-medium text-slate-900 ">
                Nguyễn Văn A vừa đăng ký môi giới
              </p>
              <p className="text-xs text-slate-500 mt-1">2 phút trước • Xác thực qua CCCD</p>
            </div>

            <div className="pb-4 border-b border-slate-200  last:border-b-0">
              <p className="text-sm font-medium text-slate-900 ">
                Yêu cầu rút tiền lớn (500tr)
              </p>
              <p className="text-xs text-red-500 mt-1">Cần duyệt ngay • Trần Thị B</p>
            </div>

            <div className="pb-4 border-b border-slate-200  last:border-b-0">
              <p className="text-sm font-medium text-slate-900 ">
                Đã phê duyệt 15 tin đăng mới
              </p>
              <p className="text-xs text-slate-500 mt-1">45 phút trước • Admin: Lê Văn C</p>
            </div>

            <div className="pb-4 border-b border-slate-200  last:border-b-0">
              <p className="text-sm font-medium text-slate-900 ">
                Cảnh báo bảo mật: Login lạ
              </p>
              <p className="text-xs text-orange-500 mt-1">
                1 giờ trước • IP: 192.168.1.1
              </p>
            </div>
          </div>

          <button className="mt-4 w-full py-2 text-sm font-medium text-primary hover:bg-primary/5 rounded-lg transition-colors">
            Xem tất cả hoạt động
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="admin-card">
        <h3 className="font-semibold text-slate-900  mb-4">Tác vụ nhanh</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <a
            href="/admin/approve-listings"
            className="p-4 border border-slate-200  rounded-lg hover:border-primary hover:bg-primary/5 transition-colors"
          >
            <span className="material-symbols-outlined text-2xl text-primary mb-2">fact_check</span>
            <p className="text-sm font-medium text-slate-900 ">Phê duyệt tin</p>
          </a>

          <a
            href="/admin/kyc"
            className="p-4 border border-slate-200  rounded-lg hover:border-primary hover:bg-primary/5 transition-colors"
          >
            <span className="material-symbols-outlined text-2xl text-primary mb-2">verified_user</span>
            <p className="text-sm font-medium text-slate-900 ">Xác thực KYC</p>
          </a>

          <a
            href="/admin/users"
            className="p-4 border border-slate-200  rounded-lg hover:border-primary hover:bg-primary/5 transition-colors"
          >
            <span className="material-symbols-outlined text-2xl text-primary mb-2">group</span>
            <p className="text-sm font-medium text-slate-900 ">Quản lý users</p>
          </a>

          <a
            href="/admin/cashflow"
            className="p-4 border border-slate-200  rounded-lg hover:border-primary hover:bg-primary/5 transition-colors"
          >
            <span className="material-symbols-outlined text-2xl text-primary mb-2">payments</span>
            <p className="text-sm font-medium text-slate-900 ">Dòng tiền</p>
          </a>
        </div>
      </div>
    </div>
  );
}
