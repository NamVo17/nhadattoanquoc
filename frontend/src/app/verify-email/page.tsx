"use client";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

type Status = "verifying" | "success" | "error" | "expired";

export function VerifyEmailContent() {
    const params = useSearchParams();
    const router = useRouter();
    const token = params.get("token");
    const [status, setStatus] = useState<Status>("verifying");
    const [message, setMessage] = useState("");
    const [resendEmail, setResendEmail] = useState("");
    const [resending, setResending] = useState(false);
    const [resendDone, setResendDone] = useState(false);

    useEffect(() => {
        if (!token) {
            setStatus("error");
            setMessage("Link xác thực không hợp lệ.");
            return;
        }
        (async () => {
            try {
                const res = await fetch(`${API_URL}/auth/verify-email`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ token }),
                });
                const json = await res.json();
                if (res.ok) {
                    setStatus("success");
                    setTimeout(() => router.push("/login"), 3000);
                } else {
                    setStatus(json.message?.includes("hết hạn") ? "expired" : "error");
                    setMessage(json.message || "Xác thực thất bại.");
                }
            } catch {
                setStatus("error");
                setMessage("Không thể kết nối tới máy chủ.");
            }
        })();
    }, [token, router]);

    const handleResend = async () => {
        if (!resendEmail) return;
        setResending(true);
        try {
            await fetch(`${API_URL}/auth/resend-verification`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: resendEmail }),
            });
            setResendDone(true);
        } finally {
            setResending(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#f6f6f8] flex items-center justify-center p-4">
            <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-10 text-center">
                {status === "verifying" && (
                    <>
                        <div className="flex justify-center mb-6">
                            <svg className="animate-spin h-14 w-14 text-[#135bec]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-black mb-3">Đang xác thực...</h2>
                        <p className="text-slate-500">Vui lòng chờ trong giây lát.</p>
                    </>
                )}

                {status === "success" && (
                    <>
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <span className="material-symbols-outlined text-5xl text-green-500"
                                style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 mb-3">Xác thực thành công!</h2>
                        <p className="text-slate-500 mb-6">Tài khoản của bạn đã được kích hoạt. Đang chuyển đến trang đăng nhập...</p>
                        <Link href="/login"
                            className="inline-block bg-[#135bec] text-white font-bold px-8 py-3 rounded-xl hover:bg-blue-600 transition-colors">
                            Đăng nhập ngay
                        </Link>
                    </>
                )}

                {(status === "error" || status === "expired") && (
                    <>
                        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <span className="material-symbols-outlined text-5xl text-red-500"
                                style={{ fontVariationSettings: "'FILL' 1" }}>
                                {status === "expired" ? "schedule" : "error"}
                            </span>
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 mb-3">
                            {status === "expired" ? "Link đã hết hạn" : "Xác thực thất bại"}
                        </h2>
                        <p className="text-slate-500 mb-6">{message}</p>

                        {/* Resend form */}
                        <div className="border border-slate-100 rounded-2xl p-5 text-left">
                            <p className="text-sm font-bold text-slate-700 mb-3">Gửi lại email xác thực</p>
                            {resendDone ? (
                                <p className="text-sm text-green-600 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-lg">check_circle</span>
                                    Đã gửi! Vui lòng kiểm tra hộp thư (và thư mục Spam).
                                </p>
                            ) : (
                                <div className="flex gap-2">
                                    <input
                                        type="email"
                                        placeholder="Nhập email đã đăng ký"
                                        value={resendEmail}
                                        onChange={(e) => setResendEmail(e.target.value)}
                                        className="flex-1 border border-slate-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#135bec]"
                                    />
                                    <button
                                        onClick={handleResend}
                                        disabled={resending || !resendEmail}
                                        className="bg-[#135bec] text-white font-bold px-4 py-2.5 rounded-xl text-sm disabled:opacity-50 hover:bg-blue-600 transition-colors whitespace-nowrap">
                                        {resending ? "..." : "Gửi lại"}
                                    </button>
                                </div>
                            )}
                        </div>

                        <Link href="/register" className="inline-block mt-4 text-sm text-slate-400 hover:text-slate-600 font-bold">
                            Quay lại đăng ký
                        </Link>
                    </>
                )}
            </div>
        </div>
    );
}

export default function VerifyEmailPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#f6f6f8] flex items-center justify-center">
                <svg className="animate-spin h-12 w-12 text-[#135bec]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
            </div>
        }>
            <VerifyEmailContent />
        </Suspense>
    );
}
