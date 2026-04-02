"use client";
import { useEffect, useState } from "react";
import TwoFASettings from "@/components/TwoFASettings";
import { useRouter } from "next/navigation";

export default function TwoFactorPage() {
    const router = useRouter();
    const [accessToken, setAccessToken] = useState<string>("");
    const [userEmail, setUserEmail] = useState<string>("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Get token and user from localStorage
        const token = localStorage.getItem("accessToken");
        const userStr = localStorage.getItem("user");

        if (!token || !userStr) {
            // Redirect to login if not authenticated
            router.push("/login");
            return;
        }

        try {
            const user = JSON.parse(userStr);
            setAccessToken(token);
            setUserEmail(user.email || "");
        } catch (err) {
            console.error("Error parsing user data:", err);
            router.push("/login");
            return;
        }
        setLoading(false);
    }, [router]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin inline-block w-8 h-8 border-4 border-slate-300 border-t-primary rounded-full"></div>
                    <p className="mt-4 text-slate-600">Đang tải...</p>
                </div>
            </div>
        );
    }

    if (!accessToken || !userEmail) {
        return (
            <div className="text-center py-8">
                <p className="text-red-600">Lỗi xác thực. Vui lòng đăng nhập lại.</p>
            </div>
        );
    }

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
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden p-6">
                        {/* TwoFASettings Component */}
                        <TwoFASettings accessToken={accessToken} email={userEmail} />

                        <div className="mt-8 pt-8 border-t border-slate-100">
                            {/* Info Banner */}
                            <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex gap-4">
                                <span className="material-symbols-outlined text-primary">info</span>
                                <p className="text-sm text-slate-600 leading-relaxed">
                                    Xác thực 2 yếu tố (2FA) thêm một bước xác minh khi đăng nhập. Ngay cả khi ai đó
                                    đánh cắp được mật khẩu, họ vẫn không thể truy cập tài khoản nếu không có mã xác
                                    nhận từ ứng dụng Authenticator của bạn.
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="lg:col-span-4 space-y-6">
                    {/* Benefits */}
                    <div className="bg-white rounded-2xl p-6 shadow-xl relative overflow-hidden">
                        <div className="relative z-10">
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-900">
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
                                    <li key={item} className="flex gap-3 text-sm text-slate-600">
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
                                    Bạn có thể sử dụng các mã dự phòng (Recovery Codes) được cấp khi thiết lập 2FA hoặc liên
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
                            <div className="h-px bg-slate-100" />
                            <details className="group">
                                <summary className="flex items-center justify-between cursor-pointer list-none text-sm font-semibold text-slate-700">
                                    Có phí để sử dụng 2FA không?
                                    <span className="material-symbols-outlined text-sm group-open:rotate-180 transition-transform">expand_more</span>
                                </summary>
                                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                                    Không. 2FA là tính năng miễn phí cho tất cả người dùng để tăng cường bảo mật.
                                </p>
                            </details>
                        </div>
                    </div>

                    {/* Info Box */}
                    <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
                        <p className="text-xs text-amber-900">
                            <strong>💡 Mẹo:</strong> Lưu trữ mã dự phòng ở nơi an toàn. Bạn sẽ cần chúng nếu mất quyền truy cập vào ứng dụng Authenticator.
                        </p>
                    </div>
                </section>
            </div>
        </>
    );
}
    