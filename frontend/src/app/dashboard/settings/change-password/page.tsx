"use client";
import { useState } from "react";

export default function ChangePasswordPage() {
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [currentPw, setCurrentPw] = useState("");
    const [newPw, setNewPw] = useState("");
    const [confirmPw, setConfirmPw] = useState("");

    const checks = [
        { label: "Tối thiểu 8 ký tự", pass: newPw.length >= 8 },
        { label: "Chứa ít nhất một chữ hoa", pass: /[A-Z]/.test(newPw) },
        { label: "Chứa ít nhất một con số", pass: /[0-9]/.test(newPw) },
        { label: "Ký tự đặc biệt (!@#$%^&*)", pass: /[!@#$%^&*]/.test(newPw) },
    ];

    const strength = checks.filter((c) => c.pass).length;
    const strengthColors = ["bg-red-400", "bg-orange-400", "bg-yellow-400", "bg-emerald-500"];
    const strengthLabels = ["Yếu", "Trung bình", "Khá", "Mạnh"];

    return (
        <>
            <div className="mb-8">
                <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
                    Thay đổi mật khẩu
                </h1>
                <p className="text-slate-500 mt-1">
                    Cập nhật mật khẩu định kỳ để bảo vệ tài khoản của bạn.
                </p>
            </div>

            <div className="max-w-2xl">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 flex items-center gap-3">
                        <span className="material-symbols-outlined text-primary">lock_reset</span>
                        <h2 className="text-lg font-bold">Cập nhật mật khẩu mới</h2>
                    </div>

                    <div className="p-6 lg:p-8">
                        <form
                            className="space-y-6"
                            onSubmit={(e) => {
                                e.preventDefault();
                                if (newPw !== confirmPw) {
                                    alert("Mật khẩu xác nhận không khớp!");
                                    return;
                                }
                                alert("Đã đổi mật khẩu thành công!");
                            }}
                        >
                            {/* Current Password */}
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Mật khẩu hiện tại</label>
                                <div className="relative">
                                    <input
                                        type={showCurrent ? "text" : "password"}
                                        value={currentPw}
                                        onChange={(e) => setCurrentPw(e.target.value)}
                                        placeholder="Nhập mật khẩu hiện tại"
                                        className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 focus:ring-primary focus:border-primary focus:outline-none text-sm"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowCurrent(!showCurrent)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary"
                                    >
                                        <span className="material-symbols-outlined text-xl">
                                            {showCurrent ? "visibility_off" : "visibility"}
                                        </span>
                                    </button>
                                </div>
                            </div>

                            {/* New Password */}
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Mật khẩu mới</label>
                                <div className="relative">
                                    <input
                                        type={showNew ? "text" : "password"}
                                        value={newPw}
                                        onChange={(e) => setNewPw(e.target.value)}
                                        placeholder="Nhập mật khẩu mới"
                                        className="w-full px-4 py-3 rounded-lg border border-slate-200 bg-slate-50 focus:ring-primary focus:border-primary focus:outline-none text-sm"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowNew(!showNew)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary"
                                    >
                                        <span className="material-symbols-outlined text-xl">
                                            {showNew ? "visibility_off" : "visibility"}
                                        </span>
                                    </button>
                                </div>
                                {/* Strength bar */}
                                {newPw && (
                                    <div className="mt-2">
                                        <div className="flex gap-1 mb-1">
                                            {[0, 1, 2, 3].map((i) => (
                                                <div
                                                    key={i}
                                                    className={`h-1.5 flex-1 rounded-full transition-colors ${i < strength ? strengthColors[strength - 1] : "bg-slate-200"
                                                        }`}
                                                />
                                            ))}
                                        </div>
                                        <p className="text-xs text-slate-500">
                                            Độ mạnh: <span className="font-bold">{strength > 0 ? strengthLabels[strength - 1] : "Rất yếu"}</span>
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Confirm Password */}
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700">Nhập lại mật khẩu mới</label>
                                <div className="relative">
                                    <input
                                        type={showConfirm ? "text" : "password"}
                                        value={confirmPw}
                                        onChange={(e) => setConfirmPw(e.target.value)}
                                        placeholder="Nhập lại mật khẩu mới"
                                        className={`w-full px-4 py-3 rounded-lg border bg-slate-50 focus:ring-primary focus:border-primary focus:outline-none text-sm ${confirmPw && newPw !== confirmPw ? "border-red-300" : "border-slate-200"
                                            }`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirm(!showConfirm)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-primary"
                                    >
                                        <span className="material-symbols-outlined text-xl">
                                            {showConfirm ? "visibility_off" : "visibility"}
                                        </span>
                                    </button>
                                </div>
                                {confirmPw && newPw !== confirmPw && (
                                    <p className="text-xs text-red-500">Mật khẩu không khớp!</p>
                                )}
                            </div>

                            {/* Password Requirements */}
                            <div className="p-5 bg-slate-50 rounded-xl border border-slate-100">
                                <p className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-4 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-base">security</span>
                                    Yêu cầu về độ mạnh:
                                </p>
                                <ul className="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-4">
                                    {checks.map((check) => (
                                        <li key={check.label} className="flex items-center gap-2.5 text-xs font-medium">
                                            <span
                                                className={`material-symbols-outlined text-sm ${check.pass ? "text-emerald-500" : "text-slate-300"
                                                    }`}
                                            >
                                                {check.pass ? "check_circle" : "circle"}
                                            </span>
                                            <span className={check.pass ? "text-emerald-700" : "text-slate-400"}>
                                                {check.label}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>

                            <div className="pt-4">
                                <button
                                    type="submit"
                                    className="w-full px-6 py-3.5 text-sm font-bold bg-primary text-white rounded-lg hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                                >
                                    <span className="material-symbols-outlined text-lg">save</span>
                                    Cập nhật mật khẩu
                                </button>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Security Note */}
                <div className="mt-8 flex items-start gap-4 p-4 rounded-xl bg-amber-50 border border-amber-200">
                    <span className="material-symbols-outlined text-amber-500">info</span>
                    <div className="text-sm">
                        <p className="font-bold text-amber-900 mb-1">Lưu ý bảo mật</p>
                        <p className="text-amber-700 leading-relaxed">
                            Sau khi đổi mật khẩu thành công, tất cả các phiên đăng nhập khác của bạn trên các thiết
                            bị sẽ được đăng xuất tự động để đảm bảo an toàn.
                        </p>
                    </div>
                </div>
            </div>
        </>
    );
}
