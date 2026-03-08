"use client";
import { useState } from "react";

export default function KYCPage() {
    const [kycStatus] = useState<"verified" | "pending" | "unverified">("verified");

    return (
        <>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
                        Xác thực danh tính
                    </h1>
                    <p className="text-slate-500 mt-1">
                        Hoàn thành KYC để nâng cao độ tin cậy và hưởng đầy đủ quyền lợi môi giới.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                {/* Main KYC Form */}
                <section className="xl:col-span-8 space-y-6">
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                            <div className="flex items-center gap-3">
                                <span className="material-symbols-outlined text-primary">verified_user</span>
                                <h2 className="text-lg font-bold">Xác thực danh tính (KYC)</h2>
                            </div>
                            {kycStatus === "verified" && (
                                <span className="flex items-center gap-1.5 px-3 py-1 text-xs font-bold uppercase tracking-wide bg-emerald-100 text-emerald-700 rounded-full">
                                    <span className="material-symbols-outlined text-sm">check_circle</span>
                                    Đã xác minh
                                </span>
                            )}
                            {kycStatus === "pending" && (
                                <span className="flex items-center gap-1.5 px-3 py-1 text-xs font-bold uppercase tracking-wide bg-amber-100 text-amber-700 rounded-full">
                                    <span className="material-symbols-outlined text-sm">schedule</span>
                                    Đang xử lý
                                </span>
                            )}
                            {kycStatus === "unverified" && (
                                <span className="flex items-center gap-1.5 px-3 py-1 text-xs font-bold uppercase tracking-wide bg-slate-100 text-slate-500 rounded-full">
                                    <span className="material-symbols-outlined text-sm">cancel</span>
                                    Chưa xác thực
                                </span>
                            )}
                        </div>

                        <div className="p-6 space-y-8 flex-1">
                            {/* CCCD Upload */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <label className="text-sm font-bold text-slate-700">CCCD Mặt trước</label>
                                    <div className="relative group aspect-[1.6/1] border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center bg-slate-50 hover:border-primary transition-colors cursor-pointer overflow-hidden">
                                        <div
                                            className="absolute inset-0 bg-cover bg-center opacity-60"
                                            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400')" }}
                                        />
                                        <div className="relative z-10 text-center p-4">
                                            <span className="material-symbols-outlined text-3xl text-slate-400 group-hover:text-primary mb-2">cloud_upload</span>
                                            <p className="text-xs text-slate-500">Tải lên hoặc kéo thả tệp</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <label className="text-sm font-bold text-slate-700">CCCD Mặt sau</label>
                                    <div className="relative group aspect-[1.6/1] border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center bg-slate-50 hover:border-primary transition-colors cursor-pointer overflow-hidden">
                                        <div
                                            className="absolute inset-0 bg-cover bg-center opacity-60"
                                            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400')" }}
                                        />
                                        <div className="relative z-10 text-center p-4">
                                            <span className="material-symbols-outlined text-3xl text-slate-400 group-hover:text-primary mb-2">cloud_upload</span>
                                            <p className="text-xs text-slate-500">Tải lên hoặc kéo thả tệp</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Portrait Photo */}
                            <div className="space-y-3">
                                <label className="text-sm font-bold text-slate-700">Ảnh chân dung</label>
                                <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                                    <div className="w-32 h-32 rounded-full border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center shrink-0 hover:border-primary transition-colors cursor-pointer group">
                                        <span className="material-symbols-outlined text-3xl text-slate-400 group-hover:text-primary">person_add</span>
                                    </div>
                                    <div className="flex-1 bg-slate-50 p-4 rounded-xl border border-slate-100">
                                        <p className="text-sm font-bold text-slate-900 flex items-center gap-2">
                                            <span className="material-symbols-outlined text-primary text-lg">info</span>
                                            Hướng dẫn chụp ảnh chân dung
                                        </p>
                                        <ul className="mt-2 space-y-1.5 text-xs text-slate-500 list-disc list-inside">
                                            <li>Nhìn thẳng vào camera, không đeo kính râm hoặc đội mũ</li>
                                            <li>Đảm bảo khuôn mặt rõ nét, không bị lóa hoặc quá tối</li>
                                            <li>Phông nền đơn sắc, sáng sủa và không có người khác</li>
                                            <li>Không sử dụng ảnh đã qua chỉnh sửa hoặc filter</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-6 border-t border-slate-100 flex justify-end">
                            <button className="px-8 py-3 text-sm font-bold bg-primary text-white rounded-lg hover:bg-primary/90 transition-all shadow-md flex items-center gap-2">
                                <span className="material-symbols-outlined text-lg">send</span>
                                Gửi yêu cầu xác thực
                            </button>
                        </div>
                    </div>
                </section>

                {/* Why KYC */}
                <section className="xl:col-span-4 space-y-6">
                    <div className="bg-primary/5 rounded-2xl p-6 border border-primary/20">
                        <h3 className="font-bold text-primary mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined">security_update_good</span>
                            Tại sao cần KYC?
                        </h3>
                        <div className="space-y-4">
                            {[
                                { title: "Xác thực uy tín", desc: "Tài khoản được gắn nhãn \"Đã xác minh\" giúp khách hàng tin tưởng hơn." },
                                { title: "Mở khóa tính năng", desc: "Đăng tin không giới hạn và tiếp cận các dự án độc quyền của hệ thống." },
                                { title: "An toàn giao dịch", desc: "Bảo vệ bạn trước các rủi ro giả mạo và tranh chấp trong giao dịch." },
                            ].map((item) => (
                                <div key={item.title} className="flex gap-3">
                                    <span className="material-symbols-outlined text-primary text-lg">task_alt</span>
                                    <div className="text-sm">
                                        <p className="font-bold mb-1">{item.title}</p>
                                        <p className="text-slate-500">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>
            </div>
        </>
    );
}
