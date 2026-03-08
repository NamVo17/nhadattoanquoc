"use client";
import { useState } from "react";

export default function SettingsPage() {
    const [notifications, setNotifications] = useState({
        newRequests: true,
        requestUpdates: true,
        listingExpiry: true,
        marketing: false,
    });
    const [privacy, setPrivacy] = useState({
        showPhone: true,
        showEmail: false,
        publicProfile: true,
    });

    const Toggle = ({
        enabled,
        onChange,
    }: {
        enabled: boolean;
        onChange: () => void;
    }) => (
        <button
            onClick={onChange}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${enabled ? "bg-primary" : "bg-slate-200"
                }`}
        >
            <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow ${enabled ? "translate-x-6" : "translate-x-1"
                    }`}
            />
        </button>
    );

    return (
        <>
            {/* Page Header */}
            <div className="mb-8">
                <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
                    Cài đặt
                </h1>
                <p className="text-slate-500 mt-1">
                    Quản lý thông báo, bảo mật và tùy chỉnh trải nghiệm của bạn.
                </p>
            </div>

            <div className="space-y-6">
                {/* Notifications */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-6 border-b border-slate-100">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-primary">
                                <span className="material-symbols-outlined">notifications</span>
                            </div>
                            <div>
                                <h2 className="text-base font-bold text-slate-900">Cài đặt thông báo</h2>
                                <p className="text-xs text-slate-500">Chọn loại thông báo bạn muốn nhận</p>
                            </div>
                        </div>
                    </div>
                    <div className="divide-y divide-slate-100">
                        {[
                            { key: "newRequests", label: "Yêu cầu hợp tác mới", desc: "Nhận thông báo khi có đối tác gửi yêu cầu" },
                            { key: "requestUpdates", label: "Cập nhật yêu cầu", desc: "Khi yêu cầu của bạn được chấp nhận hoặc từ chối" },
                            { key: "listingExpiry", label: "Tin đăng sắp hết hạn", desc: "Nhắc nhở trước 3 ngày khi tin sắp hết hạn" },
                            { key: "marketing", label: "Tin tức & Khuyến mãi", desc: "Thông tin ưu đãi và tin tức thị trường" },
                        ].map((item) => (
                            <div key={item.key} className="px-6 py-4 flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-semibold text-slate-900">{item.label}</p>
                                    <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                                </div>
                                <Toggle
                                    enabled={notifications[item.key as keyof typeof notifications]}
                                    onChange={() =>
                                        setNotifications((prev) => ({
                                            ...prev,
                                            [item.key]: !prev[item.key as keyof typeof notifications],
                                        }))
                                    }
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Privacy */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-6 border-b border-slate-100">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                                <span className="material-symbols-outlined">lock</span>
                            </div>
                            <div>
                                <h2 className="text-base font-bold text-slate-900">Quyền riêng tư</h2>
                                <p className="text-xs text-slate-500">Kiểm soát thông tin hiển thị công khai</p>
                            </div>
                        </div>
                    </div>
                    <div className="divide-y divide-slate-100">
                        {[
                            { key: "showPhone", label: "Hiển thị số điện thoại", desc: "Cho phép người khác xem số điện thoại của bạn" },
                            { key: "showEmail", label: "Hiển thị email", desc: "Cho phép người khác xem địa chỉ email của bạn" },
                            { key: "publicProfile", label: "Hồ sơ công khai", desc: "Hồ sơ của bạn hiển thị trong kết quả tìm kiếm" },
                        ].map((item) => (
                            <div key={item.key} className="px-6 py-4 flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-semibold text-slate-900">{item.label}</p>
                                    <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                                </div>
                                <Toggle
                                    enabled={privacy[item.key as keyof typeof privacy]}
                                    onChange={() =>
                                        setPrivacy((prev) => ({
                                            ...prev,
                                            [item.key]: !prev[item.key as keyof typeof privacy],
                                        }))
                                    }
                                />
                            </div>
                        ))}
                    </div>
                </div>

                {/* Security */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-6 border-b border-slate-100">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
                                <span className="material-symbols-outlined">security</span>
                            </div>
                            <div>
                                <h2 className="text-base font-bold text-slate-900">Bảo mật tài khoản</h2>
                                <p className="text-xs text-slate-500">Bảo vệ tài khoản của bạn</p>
                            </div>
                        </div>
                    </div>
                    <div className="divide-y divide-slate-100">
                        <div className="px-6 py-4 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-semibold text-slate-900">Đổi mật khẩu</p>
                                <p className="text-xs text-slate-500 mt-0.5">Cập nhật lần cuối: 3 tháng trước</p>
                            </div>
                            <button className="px-4 py-2 border border-slate-200 text-sm font-bold rounded-xl hover:bg-slate-50 transition-colors">
                                Đổi ngay
                            </button>
                        </div>
                        <div className="px-6 py-4 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-semibold text-slate-900">Xác thực 2 bước (2FA)</p>
                                <p className="text-xs text-slate-500 mt-0.5">Tăng cường bảo mật cho tài khoản</p>
                            </div>
                            <button className="px-4 py-2 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary/90 transition-colors shadow-sm">
                                Kích hoạt
                            </button>
                        </div>
                        <div className="px-6 py-4 flex items-center justify-between">
                            <div>
                                <p className="text-sm font-semibold text-slate-900">Phiên đăng nhập</p>
                                <p className="text-xs text-slate-500 mt-0.5">Quản lý các thiết bị đang đăng nhập</p>
                            </div>
                            <button className="px-4 py-2 border border-slate-200 text-sm font-bold rounded-xl hover:bg-slate-50 transition-colors">
                                Xem tất cả
                            </button>
                        </div>
                    </div>
                </div>

                {/* Danger Zone */}
                <div className="bg-white rounded-2xl shadow-sm border border-red-100 overflow-hidden">
                    <div className="p-6 border-b border-red-50">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center text-red-500">
                                <span className="material-symbols-outlined">warning</span>
                            </div>
                            <div>
                                <h2 className="text-base font-bold text-slate-900">Vùng nguy hiểm</h2>
                                <p className="text-xs text-slate-500">Các hành động không thể hoàn tác</p>
                            </div>
                        </div>
                    </div>
                    <div className="px-6 py-4 flex items-center justify-between">
                        <div>
                            <p className="text-sm font-semibold text-slate-900">Xóa tài khoản</p>
                            <p className="text-xs text-slate-500 mt-0.5">Tài khoản và dữ liệu của bạn sẽ bị xóa vĩnh viễn</p>
                        </div>
                        <button className="px-4 py-2 bg-red-500 text-white text-sm font-bold rounded-xl hover:bg-red-600 transition-colors">
                            Xóa tài khoản
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
