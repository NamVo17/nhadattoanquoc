"use client";
import { useState } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const PROJECTS = [
    {
        id: 1,
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBnp1gqp3tDSaacHfMTmxAEquVDuGEc3iFG-9zV5JISKp8tIQ8HNXNwO7mZcM5Ew-_u3EYDsPrya48G1-eARg0jdhyRPMqYn2-hagzwm5hIqI5kKsukXQVptgj20Xzk1hmXNiI9Bejx6tfQpAnWPyDa7U3KCXDm_WggqAeRyCgtA-Ck3xzuO7F2HhBha6BP0v6jq9O64k1gtfV3AEpXOHtiJEl6YyBOhNKuNK8Z9SX90IY31a5zNnrCQGdkql6QfXDhAqbIeQHFyJjj",
        badge: "HOA HỒNG 4.0%", badgeColor: "bg-[#135bec]",
        name: "The Beverly Solari",
        status: "Đang mở bán", statusColor: "bg-green-100 text-green-600",
        location: "Thủ Đức, TP. Hồ Chí Minh",
        developer: "Vinhomes & Mitsubishi", progress: "Hoàn thiện nội thất", scale: "8.7 ha, 13 blocks",
    },
    {
        id: 2,
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAMeQkVoFYmMLA62xLct8uT6BPRSjZ7acBAfhOoPjrIF87ClMB3mV3PdZL7URn5nbyMGoXKktP2YXlMEH1vW-d2wD5kROlDnLRCEfMi12jL70BSk87ph8ySW7ZqfujF-lRzkFuSNx9XdQjV1TZjQvg4PcR9zetWNivU9H0Zzb2fJnvWY8424YWuGC9p_gIuY9y1ouYm7nBaR7qBTMTOsqmfe8aQKiVecCt3o-fjCrh7qFf76FGQs0vE0_BTSogdnU72pDx6207KLrrh",
        badge: "THƯỞNG NÓNG 50TR", badgeColor: "bg-orange-500",
        name: "Masteri West Heights",
        status: "Sắp bàn giao", statusColor: "bg-blue-100 text-blue-600",
        location: "Nam Từ Liêm, Hà Nội",
        developer: "Masterise Homes", progress: "Đang cất nóc", scale: "4 tòa căn hộ cao cấp",
    },
    {
        id: 3,
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBHj-248c90mrzDxivvIc9zX-1PmCqWGeqWjuh4N3ZbiE6EyUCZvFnWqctGgaYtv4Y-k_mL02q_OsIt2hNYljmfV_rtV2na088aEg3KUbJp2mP9w0milBkHUqvSj9fAjcsQ4o2GTRmD79WknSBNfXj_ceItPHNiRDCnBYqZC2ZkyoKsYY2_2FhQLWezqRmxyqINEuTWUKoklBVw29Sse8tnKaJFD1VvOz01pTkd1qhiztUSHjPo6bElth6mCR_hYaYexKdNG-SOBMka",
        badge: "HOA HỒNG 2.5%", badgeColor: "bg-[#135bec]",
        name: "Lumiere Riverside",
        status: "Booking GĐ2", statusColor: "bg-orange-100 text-orange-600",
        location: "Quận 2, TP. Hồ Chí Minh",
        developer: "Masterise Homes", progress: "Xong móng hầm", scale: "1.9 ha, 2 tòa tháp",
    },
];

function ProjectCard({ project }: { project: typeof PROJECTS[0] }) {
    return (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all flex flex-col lg:flex-row h-auto lg:h-72">
            <div className="w-full lg:w-[400px] h-60 lg:h-full relative overflow-hidden shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img alt={project.name}
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                    src={project.image} />
                <div className={`absolute top-4 left-4 ${project.badgeColor} text-white px-3 py-1 rounded-lg text-xs font-black shadow-lg`}>
                    {project.badge}
                </div>
            </div>
            <div className="flex-1 p-6 flex flex-col justify-between">
                <div>
                    <div className="flex justify-between items-start mb-2 gap-3">
                        <h3 className="text-2xl font-extrabold text-slate-900">{project.name}</h3>
                        <span className={`text-xs font-bold px-2 py-1 rounded uppercase shrink-0 ${project.statusColor}`}>
                            {project.status}
                        </span>
                    </div>
                    <p className="text-sm text-slate-500 flex items-center gap-1 mb-4">
                        <span className="material-symbols-outlined text-sm">location_on</span>
                        {project.location}
                    </p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-6">
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Chủ đầu tư</p>
                            <p className="text-sm font-bold">{project.developer}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Tiến độ</p>
                            <p className="text-sm font-bold">{project.progress}</p>
                        </div>
                        <div className="hidden md:block">
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Quy mô</p>
                            <p className="text-sm font-bold">{project.scale}</p>
                        </div>
                    </div>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-100">
                    <div className="flex items-center gap-3 flex-wrap">
                        <button className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm rounded-lg transition-colors">
                            <span className="material-symbols-outlined text-sm">download</span>
                            Tải tài liệu bán hàng
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2.5 bg-[#135bec]/10 text-[#135bec] hover:bg-[#135bec]/20 font-bold text-sm rounded-lg transition-colors">
                            <span className="material-symbols-outlined text-sm">event</span>
                            Đăng ký tham quan
                        </button>
                    </div>
                    <a href={`/projects/${project.id}`}
                        className="text-[#135bec] font-bold text-sm flex items-center gap-1 hover:underline">
                        Xem chi tiết
                        <span className="material-symbols-outlined text-sm">arrow_right_alt</span>
                    </a>
                </div>
            </div>
        </div>
    );
}

export default function ProjectsPage() {
    const [page, setPage] = useState(1);

    return (
        <div className="relative flex min-h-screen w-full flex-col bg-[#f6f6f8]">
            <Header />

            {/* ── Featured Banner ── */}
            <section className="relative w-full overflow-hidden bg-slate-900 py-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 xl:px-20">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-black text-white flex items-center gap-2">
                            <span className="material-symbols-outlined text-yellow-500">hotel_class</span>
                            Dự án Tiêu điểm
                        </h2>
                        <div className="flex gap-2">
                            <button className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors">
                                <span className="material-symbols-outlined">chevron_left</span>
                            </button>
                            <button className="p-2 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors">
                                <span className="material-symbols-outlined">chevron_right</span>
                            </button>
                        </div>
                    </div>
                    <div className="relative h-[380px] rounded-3xl overflow-hidden group">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img alt="Featured Project"
                            className="w-full h-full object-cover"
                            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCVkwPEvoUKrL52xtPLKuZyLSx4KRRFeY0KuQ-6F2jAYopUpv0jRH-aqyJCBbxwWoR1Rb7YinZQzAvqJI-Upbo_nf_FPoIaimXqpMrxyn35fHTHXn493GLbjIy03Tnr4pt4dcjFKwRIbakrYagtICJkkcJVOrZQUdOul9VHKBXZUpINviCFG2cm24Ja9FgWfnNAH9Cq8UaByKwWBRN5BeKY4EGFjvkif7AoZh6nkvzjb31iaGXEznWgnSIYCO7S1GO-1BjDZFyQkXGb"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
                        <div className="absolute bottom-8 left-8 max-w-2xl">
                            <span className="bg-red-500 text-white text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest mb-4 inline-block">
                                Nổi bật nhất thị trường
                            </span>
                            <h3 className="text-3xl sm:text-4xl font-black text-white mb-4 leading-tight">
                                Vinhomes Global Gate - Biểu tượng thịnh vượng mới
                            </h3>
                            <div className="flex items-center gap-6 text-slate-200 mb-6 flex-wrap">
                                <span className="flex items-center gap-2 text-sm">
                                    <span className="material-symbols-outlined text-[#135bec]">location_on</span>
                                    Đông Anh, Hà Nội
                                </span>
                                <span className="flex items-center gap-2 text-sm">
                                    <span className="material-symbols-outlined text-[#135bec]">sell</span>
                                    Hoa hồng đến 3.5%
                                </span>
                            </div>
                            <button className="bg-[#135bec] text-white px-8 py-3 rounded-xl font-bold hover:scale-105 transition-transform shadow-lg shadow-blue-500/30">
                                Xem chi tiết dự án
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-10 xl:px-20 py-12">
                {/* ── Header + Search ── */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-10">
                    <div>
                        <h1 className="text-3xl font-black mb-2">Kho Dự án Mới</h1>
                        <p className="text-slate-500">Danh sách dự án đang triển khai với bộ tài liệu bán hàng đầy đủ</p>
                    </div>
                    <div className="flex gap-3 w-full md:w-auto">
                        <div className="relative flex-1 md:w-80">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">search</span>
                            <input
                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-[#135bec] focus:ring-[#135bec] text-sm bg-white outline-none"
                                placeholder="Tìm tên dự án, chủ đầu tư..."
                                type="text"
                            />
                        </div>
                        <button className="flex items-center gap-2 px-4 py-3 bg-white border border-slate-200 rounded-xl font-bold text-sm hover:bg-slate-50 transition-colors">
                            <span className="material-symbols-outlined text-lg">tune</span>
                            Bộ lọc
                        </button>
                    </div>
                </div>

                {/* ── Project list ── */}
                <div className="space-y-6 mb-12">
                    {PROJECTS.map((p) => <ProjectCard key={p.id} project={p} />)}
                </div>

                {/* ── Pagination ── */}
                <div className="flex justify-center">
                    <nav className="flex items-center gap-2">
                        <button onClick={() => setPage(Math.max(1, page - 1))}
                            className="p-2 border border-slate-200 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors">
                            <span className="material-symbols-outlined">chevron_left</span>
                        </button>
                        {[1, 2, 3].map((p) => (
                            <button key={p} onClick={() => setPage(p)}
                                className={`w-10 h-10 rounded-lg font-bold text-sm transition-colors ${page === p ? "bg-[#135bec] text-white" : "hover:bg-slate-100"}`}>
                                {p}
                            </button>
                        ))}
                        <span className="px-2 text-slate-400">...</span>
                        <button onClick={() => setPage(12)}
                            className={`w-10 h-10 rounded-lg font-bold text-sm transition-colors ${page === 12 ? "bg-[#135bec] text-white" : "hover:bg-slate-100"}`}>
                            12
                        </button>
                        <button onClick={() => setPage(Math.min(12, page + 1))}
                            className="p-2 border border-slate-200 rounded-lg text-slate-400 hover:bg-slate-100 transition-colors">
                            <span className="material-symbols-outlined">chevron_right</span>
                        </button>
                    </nav>
                </div>

                {/* ── Market stats + CTA ── */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16 border-t border-slate-200 pt-16">
                    <div className="col-span-1 md:col-span-2">
                        <h2 className="text-xl font-black mb-6 flex items-center gap-2">
                            <span className="material-symbols-outlined text-[#135bec]">analytics</span>
                            Tình hình thị trường Dự án mới
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="bg-[#135bec]/5 p-6 rounded-2xl border border-[#135bec]/10">
                                <p className="text-xs font-bold text-[#135bec] uppercase tracking-widest mb-1">Cung mới tháng này</p>
                                <p className="text-3xl font-black mb-2">2,450+</p>
                                <p className="text-xs text-slate-500">Tăng 15% so với tháng trước</p>
                            </div>
                            <div className="bg-green-500/5 p-6 rounded-2xl border border-green-500/10">
                                <p className="text-xs font-bold text-green-600 uppercase tracking-widest mb-1">Tỷ lệ hấp thụ</p>
                                <p className="text-3xl font-black mb-2 text-green-600">68%</p>
                                <p className="text-xs text-slate-500">Phân khúc chung cư cao cấp dẫn đầu</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-slate-900 rounded-2xl p-6 text-white flex flex-col justify-between">
                        <div>
                            <h3 className="text-lg font-bold mb-2">Bạn cần tài liệu dự án cụ thể?</h3>
                            <p className="text-sm text-slate-400">Yêu cầu bộ Sales Kit riêng cho dự án bạn đang quan tâm.</p>
                        </div>
                        <button className="mt-6 w-full py-3 bg-white text-slate-900 font-bold rounded-xl text-sm hover:bg-slate-100 transition-colors">
                            Yêu cầu tài liệu ngay
                        </button>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
