/**
 * Admin - System Settings Page
 * Configure system parameters and settings
 */

'use client';

import { useState } from 'react';

export default function SettingsPage() {
  const [settings, setSettings] = useState({
    vpnPrice: '50000',
    economyPrice: '150000',
    pushNotifications: true,
    emailNotifications: false,
  });

  const handleSave = () => {
    alert('Cấu hình đã được lưu thành công');
  };

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 ">Cấu hình hệ thống</h1>
        <p className="text-slate-600  mt-1">
          Quản lý cấu hình chung của hệ thống PropTech
        </p>
      </div>

      {/* Settings Sections */}
      <div className="space-y-6">
        {/* Subscription Settings */}
        <div className="admin-card">
          <h3 className="text-lg font-semibold text-slate-900  mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">card_membership</span>
            Cấu hình phí đăng tin
          </h3>

          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-700  mb-2">
                  Gói VIP (VND/tin)
                </label>
                <input
                  type="number"
                  value={settings.vpnPrice}
                  onChange={(e) => setSettings({ ...settings, vpnPrice: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200  rounded-lg "
                />
                <p className="text-xs text-slate-500 mt-2">
                  Áp dụng cho các tin đăng dạy ưu tiên - 7 ngày
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700  mb-2">
                  Gói Kim cương (VND/tin)
                </label>
                <input
                  type="number"
                  value={settings.economyPrice}
                  onChange={(e) => setSettings({ ...settings, economyPrice: e.target.value })}
                  className="w-full px-4 py-2 border border-slate-200  rounded-lg "
                />
                <p className="text-xs text-slate-500 mt-2">
                  Áp dụng cho bộ đăng có từ đó dữ liệu Tính thành Tính
                </p>
              </div>
            </div>

            <div className="p-4 bg-blue-50  border border-blue-200  rounded-lg">
              <p className="text-sm font-medium text-blue-900 ">
                💡 Ghi chú về các khoảng giá
              </p>
              <p className="text-xs text-blue-800  mt-2">
                Mức tối thiểu giữ được không được nhỏ hơn 25% - 50%, Việc nâng tỷ lệ phí sàn có thể
                thực hiện trong thời gian danh dự kinh doanh
              </p>
            </div>

            <button
              onClick={handleSave}
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
            >
              Lưu cấu hình phí
            </button>
          </div>
        </div>

        {/* Notification Settings */}
        <div className="admin-card">
          <h3 className="text-lg font-semibold text-slate-900  mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">notifications</span>
            Thiết lập thông báo hệ thống
          </h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border border-slate-200  rounded-lg hover:bg-slate-50  transition-colors">
              <div>
                <p className="font-medium text-slate-900 ">
                  Thông báo đẩy (Push Notifications)
                </p>
                <p className="text-sm text-slate-600  mt-1">
                  Gợi thông báo về các sự kiện quan trọng trên các địa chỉ ghi tập trung
                </p>
              </div>
              <label className="relative flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.pushNotifications}
                  onChange={(e) =>
                    setSettings({ ...settings, pushNotifications: e.target.checked })
                  }
                  className="w-5 h-5"
                />
              </label>
            </div>

            <div className="flex items-center justify-between p-4 border border-slate-200  rounded-lg hover:bg-slate-50  transition-colors">
              <div>
                <p className="font-medium text-slate-900 ">
                  Email báo cáo hàng tuần
                </p>
                <p className="text-sm text-slate-600  mt-1">
                  Tự động gửi về ưu điểm kế hoạch các ngày trong tuần (Sáng thứ 2)
                </p>
              </div>
              <label className="relative flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.emailNotifications}
                  onChange={(e) =>
                    setSettings({ ...settings, emailNotifications: e.target.checked })
                  }
                  className="w-5 h-5"
                />
              </label>
            </div>
          </div>
        </div>

        {/* API Settings */}
        <div className="admin-card">
          <h3 className="text-lg font-semibold text-slate-900  mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">api</span>
            API & Integration Settings
          </h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700  mb-2">
                API Key (Sandbox)
              </label>
              <div className="flex gap-2">
                <input
                  type="password"
                  defaultValue="sk_test_51234567890abcdef"
                  className="flex-1 px-4 py-2 border border-slate-200  rounded-lg  "
                  readOnly
                />
                <button className="px-4 py-2 border border-slate-200  rounded-lg hover:bg-slate-50  transition-colors">
                  Sao chép
                </button>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Dùng cho môi trường test. Không được chia sẻ công khai
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700  mb-2">
                API Key (Production)
              </label>
              <div className="flex gap-2">
                <input
                  type="password"
                  defaultValue="sk_live_abcdef1234567890"
                  className="flex-1 px-4 py-2 border border-slate-200  rounded-lg  "
                  readOnly
                />
                <button className="px-4 py-2 border border-slate-200  rounded-lg hover:bg-slate-50  transition-colors">
                  Sao chép
                </button>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Dùng cho môi trường production. Bảo mật tuyệt đối
              </p>
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="admin-card">
          <h3 className="text-lg font-semibold text-slate-900  mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">health_and_safety</span>
            Trạng thái hệ thống
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border border-green-200  bg-green-50  rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-900 ">API Server</p>
                  <p className="text-xs text-green-700  mt-1">Hoạt động bình thường</p>
                </div>
                <span className="material-symbols-outlined text-green-600 text-2xl">
                  done_all
                </span>
              </div>
            </div>

            <div className="p-4 border border-green-200  bg-green-50  rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-900 ">Database</p>
                  <p className="text-xs text-green-700  mt-1">99.99% up-time</p>
                </div>
                <span className="material-symbols-outlined text-green-600 text-2xl">
                  done_all
                </span>
              </div>
            </div>

            <div className="p-4 border border-green-200  bg-green-50  rounded-lg">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-900 ">CDN</p>
                  <p className="text-xs text-green-700  mt-1">Tất cả regions OK</p>
                </div>
                <span className="material-symbols-outlined text-green-600 text-2xl">
                  done_all
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="admin-card border-red-200 ">
          <h3 className="text-lg font-semibold text-red-600  mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined">warning</span>
            Vùng nguy hiểm
          </h3>

          <div className="space-y-4">
            <p className="text-sm text-slate-600 ">
              Các hoạt động dưới đây có thể ảnh hưởng nghiêm trọng đến hệ thống. Vui lòng thực hiện
              cẩn thận.
            </p>

            <div className="flex gap-2">
              <button className="px-4 py-2 border border-yellow-500 text-yellow-600 hover:bg-yellow-50  rounded-lg transition-colors font-medium">
                Xóasis hết cache
              </button>
              <button className="px-4 py-2 border border-red-500 text-red-600 hover:bg-red-50  rounded-lg transition-colors font-medium">
                Reset toàn bộ dữ liệu
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
