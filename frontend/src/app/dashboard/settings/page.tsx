"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { authorizedFetch } from "@/lib/authorizedFetch";

const NOTIFICATION_DEFAULTS = {
    newRequests: true,
    requestUpdates: true,
    listingExpiry: true,
    marketing: false,
};

const PRIVACY_DEFAULTS = {
    showPhone: true,
    showEmail: false,
    publicProfile: true,
};

const LS_NOTIF_KEY = "notif_prefs";
const LS_PRIVACY_KEY = "privacy_prefs";

function loadFromLS<T>(key: string, defaults: T): T {
    if (typeof window === "undefined") return defaults;
    try {
        const raw = localStorage.getItem(key);
        if (raw) return { ...defaults, ...JSON.parse(raw) };
    } catch { }
    return defaults;
}

function Toggle({ enabled, onChange }: { enabled: boolean; onChange: () => void }) {
    return (
        <button
            type="button"
            onClick={onChange}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1 ${enabled ? "bg-primary" : "bg-slate-200"}`}
            aria-pressed={enabled}
        >
            <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow ${enabled ? "translate-x-6" : "translate-x-1"}`}
            />
        </button>
    );
}

export default function SettingsPage() {
    const router = useRouter();
    const [notifications, setNotifications] = useState(NOTIFICATION_DEFAULTS);
    const [privacy, setPrivacy] = useState(PRIVACY_DEFAULTS);
    const [saving, setSaving] = useState(false);
    const [savedMsg, setSavedMsg] = useState("");
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        setNotifications(loadFromLS(LS_NOTIF_KEY, NOTIFICATION_DEFAULTS));
        setPrivacy(loadFromLS(LS_PRIVACY_KEY, PRIVACY_DEFAULTS));
    }, []);

    const handleSave = async () => {
        setSaving(true);
        setSavedMsg("");
        try {
            localStorage.setItem(LS_NOTIF_KEY, JSON.stringify(notifications));
            localStorage.setItem(LS_PRIVACY_KEY, JSON.stringify(privacy));
            await authorizedFetch("/auth/settings", {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ notifications, privacy }),
            }).catch(() => { });
            setSavedMsg("Đã lưu cài đặt thành công!");
            setTimeout(() => setSavedMsg(""), 3000);
        } finally {
            setSaving(false);
        }
    };

    if (!mounted) return null;

    return (
        <>
            {/* Page Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">Cài đặt</h1>
                    <p className="text-slate-500 mt-1">Quản lý thông báo, bảo mật và tùy chỉnh trải nghiệm của bạn.</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm hover:bg-primary/90 transition-colors disabled:opacity-60"
                >
                    <span className="material-symbols-outlined text-base leading-none">save</span>
                    {saving ? "Đang lưu..." : "Lưu cài đặt"}
                </button>
            </div>

            {savedMsg && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 font-medium text-sm flex items-center gap-2">
                    <span className="material-symbols-outlined text-base">check_circle</span>
                    {savedMsg}
                </div>
            )}

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
                            <div key={item.key} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
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
                            <div key={item.key} className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
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
                        <div className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                            <div>
                                <p className="text-sm font-semibold text-slate-900">Đổi mật khẩu</p>
                                <p className="text-xs text-slate-500 mt-0.5">Cập nhật mật khẩu để bảo vệ tài khoản</p>
                            </div>
                            <button
                                onClick={() => router.push("/dashboard/settings/change-password")}
                                className="px-4 py-2 border border-slate-200 text-sm font-bold rounded-xl hover:bg-slate-50 hover:border-primary hover:text-primary transition-colors"
                            >
                                Đổi ngay
                            </button>
                        </div>
                        <div className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                            <div>
                                <p className="text-sm font-semibold text-slate-900">Xác thực 2 bước (2FA)</p>
                                <p className="text-xs text-slate-500 mt-0.5">Tăng cường bảo mật với mã xác thực TOTP</p>
                            </div>
                            <button
                                onClick={() => router.push("/dashboard/settings/2fa")}
                                className="px-4 py-2 bg-primary text-white text-sm font-bold rounded-xl hover:bg-primary/90 transition-colors shadow-sm"
                            >
                                Quản lý
                            </button>
                        </div>
                        <div className="px-6 py-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                            <div>
                                <p className="text-sm font-semibold text-slate-900">KYC / Định danh</p>
                                <p className="text-xs text-slate-500 mt-0.5">Xác minh danh tính để tăng độ tin cậy</p>
                            </div>
                            <button
                                onClick={() => router.push("/dashboard/settings/kyc")}
                                className="px-4 py-2 border border-slate-200 text-sm font-bold rounded-xl hover:bg-slate-50 hover:border-primary hover:text-primary transition-colors"
                            >
                                Xem
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
                        <button
                            onClick={() => {
                                if (window.confirm("Bạn có chắc chắn muốn xóa tài khoản? Hành động này không thể hoàn tác!")) {
                                    alert("Vui lòng liên hệ hỗ trợ để hoàn tất việc xóa tài khoản.");
                                }
                            }}
                            className="px-4 py-2 bg-red-500 text-white text-sm font-bold rounded-xl hover:bg-red-600 transition-colors"
                        >
                            Xóa tài khoản
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
