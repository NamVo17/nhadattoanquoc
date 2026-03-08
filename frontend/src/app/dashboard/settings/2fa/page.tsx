"use client";
import { useState } from "react";

export default function TwoFactorPage() {
    const [twoFAEnabled, setTwoFAEnabled] = useState(false);
    const [method, setMethod] = useState<"app" | "sms">("app");

    return (
        <>
            <div className="mb-8">
                <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
                    Xác thực 2 yếu tố (2FA)
                </h1>
                <p className="text-slate-500 mt-1">
                    Bảo vệ tài khoản của bạn bằng các lớp bảo mật bổ sung.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <section className="lg:col-span-8 space-y-6">
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                        {/* Toggle Header */}
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-primary text-2xl">security</span>
                                <div>
                                    <h2 className="text-lg font-bold">Kích hoạt bảo mật 2 lớp</h2>
                                    <p className="text-xs text-slate-500">Khuyên dùng để bảo vệ tài sản và thông tin cá nhân</p>
                                </div>
                            </div>
                            {/* Toggle Switch */}
                            <button
                                onClick={() => setTwoFAEnabled(!twoFAEnabled)}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${twoFAEnabled ? "bg-primary" : "bg-slate-300"
                                    }`}
                            >
                                <span
                                    className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${twoFAEnabled ? "translate-x-6" : "translate-x-1"
                                        }`}
                                />
                            </button>
                        </div>

                        <div className="p-6 space-y-8">
                            {/* Info Banner */}
                            <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex gap-4">
                                <span className="material-symbols-outlined text-primary">info</span>
                                <p className="text-sm text-slate-600 leading-relaxed">
                                    Xác thực 2 yếu tố (2FA) thêm một bước xác minh khi đăng nhập. Ngay cả khi ai đó
                                    đánh cắp được mật khẩu, họ vẫn không thể truy cập tài khoản nếu không có mã xác
                                    nhận từ điện thoại của bạn.
                                </p>
                            </div>

                            {/* Method Selection */}
                            <div className="space-y-4">
                                <p className="text-sm font-bold text-slate-700">Chọn phương thức xác thực của bạn:</p>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <label
                                        className={`relative flex flex-col gap-3 p-5 border-2 rounded-2xl cursor-pointer transition-all ${method === "app" ? "border-primary bg-primary/5" : "border-slate-200 hover:border-primary/50"
                                            }`}
                                    >
                                        <input
                                            type="radio"
                                            name="2fa_method"
                                            checked={method === "app"}
                                            onChange={() => setMethod("app")}
                                            className="absolute top-4 right-4 w-5 h-5 text-primary"
                                        />
                                        <span className="material-symbols-outlined text-3xl text-primary">phonelink_lock</span>
                                        <div>
                                            <span className="block text-sm font-bold mb-1">Qua ứng dụng Authenticator</span>
                                            <span className="block text-xs text-slate-500 leading-normal">
                                                Sử dụng Google Authenticator, Microsoft Authenticator hoặc Authy để nhận mã.
                                            </span>
                                        </div>
                                    </label>

                                    <label
                                        className={`relative flex flex-col gap-3 p-5 border-2 rounded-2xl cursor-pointer transition-all ${method === "sms" ? "border-primary bg-primary/5" : "border-slate-200 hover:border-primary/50"
                                            }`}
                                    >
                                        <input
                                            type="radio"
                                            name="2fa_method"
                                            checked={method === "sms"}
                                            onChange={() => setMethod("sms")}
                                            className="absolute top-4 right-4 w-5 h-5 text-primary"
                                        />
                                        <span className={`material-symbols-outlined text-3xl ${method === "sms" ? "text-primary" : "text-slate-400"}`}>
                                            sms
                                        </span>
                                        <div>
                                            <span className="block text-sm font-bold mb-1">Qua tin nhắn SMS</span>
                                            <span className="block text-xs text-slate-500 leading-normal">
                                                Mã OTP sẽ được gửi trực tiếp đến số điện thoại đã đăng ký của bạn.
                                            </span>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            {/* Submit */}
                            <div className="pt-4 border-t border-slate-100">
                                <button className="w-full md:w-auto px-8 py-4 text-base font-bold bg-primary text-white rounded-xl hover:bg-primary/90 transition-all shadow-lg shadow-primary/25 flex items-center justify-center gap-3">
                                    <span className="material-symbols-outlined">settings_suggest</span>
                                    Thiết lập 2FA ngay bây giờ
                                </button>
                                <p className="text-xs text-slate-400 mt-4">
                                    Bằng cách bật tính năng này, bạn đồng ý với các điều khoản bảo mật của chúng tôi.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="lg:col-span-4 space-y-6">
                    {/* Benefits */}
                    <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl relative overflow-hidden">
                        <div className="relative z-10">
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <span className="material-symbols-outlined text-yellow-400">verified</span>
                                Lợi ích của 2FA
                            </h3>
                            <ul className="space-y-4">
                                {[
                                    "Chống lại các cuộc tấn công đánh cắp mật khẩu (Phishing).",
                                    "Bảo vệ số dư ví và các giao dịch thanh toán.",
                                    "Kiểm soát các lượt đăng nhập từ thiết bị lạ.",
                                    "Tăng uy tín hồ sơ môi giới chuyên nghiệp.",
                                ].map((item) => (
                                    <li key={item} className="flex gap-3 text-sm text-slate-300">
                                        <span className="material-symbols-outlined text-emerald-400 text-sm">check_circle</span>
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="absolute -bottom-10 -right-10 opacity-10">
                            <span className="material-symbols-outlined text-[160px]">shield</span>
                        </div>
                    </div>

                    {/* FAQ */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-6">
                        <h3 className="font-bold text-slate-900 mb-4">Câu hỏi thường gặp</h3>
                        <div className="space-y-4">
                            <details className="group">
                                <summary className="flex items-center justify-between cursor-pointer list-none text-sm font-semibold text-slate-700">
                                    Nếu mất điện thoại thì sao?
                                    <span className="material-symbols-outlined text-sm group-open:rotate-180 transition-transform">expand_more</span>
                                </summary>
                                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                                    Bạn có thể sử dụng các mã dự phòng (Recovery Codes) được cấp khi thiết lập hoặc liên
                                    hệ CSKH để xác minh danh tính lại.
                                </p>
                            </details>
                            <div className="h-px bg-slate-100" />
                            <details className="group">
                                <summary className="flex items-center justify-between cursor-pointer list-none text-sm font-semibold text-slate-700">
                                    Sử dụng App hay SMS tốt hơn?
                                    <span className="material-symbols-outlined text-sm group-open:rotate-180 transition-transform">expand_more</span>
                                </summary>
                                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                                    Sử dụng ứng dụng Authenticator được khuyên dùng hơn vì tính bảo mật cao và hoạt động
                                    ngay cả khi không có sóng điện thoại.
                                </p>
                            </details>
                        </div>
                    </div>
                </section>
            </div>
        </>
    );
}
