"use client";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const SIDE_NEWS = [
    {
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBnp1gqp3tDSaacHfMTmxAEquVDuGEc3iFG-9zV5JISKp8tIQ8HNXNwO7mZcM5Ew-_u3EYDsPrya48G1-eARg0jdhyRPMqYn2-hagzwm5hIqI5kKsukXQVptgj20Xzk1hmXNiI9Bejx6tfQpAnWPyDa7U3KCXDm_WggqAeRyCgtA-Ck3xzuO7F2HhBha6BP0v6jq9O64k1gtfV3AEpXOHtiJEl6YyBOhNKuNK8Z9SX90IY31a5zNnrCQGdkql6QfXDhAqbIeQHFyJjj",
        title: "Tác động của lãi suất vay mua nhà đến tâm lý nhà đầu tư",
        date: "11/05/2024",
    },
    {
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuAMeQkVoFYmMLA62xLct8uT6BPRSjZ7acBAfhOoPjrIF87ClMB3mV3PdZL7URn5nbyMGoXKktP2YXlMEH1vW-d2wD5kROlDnLRCEfMi12jL70BSk87ph8ySW7ZqfujF-lRzkFuSNx9XdQjV1TZjQvg4PcR9zetWNivU9H0Zzb2fJnvWY8424YWuGC9p_gIuY9y1ouYm7nBaR7qBTMTOsqmfe8aQKiVecCt3o-fjCrh7qFf76FGQs0vE0_BTSogdnU72pDx6207KLrrh",
        title: "Sửa đổi Luật Đất đai: Những điểm mới môi giới cần nắm vững",
        date: "10/05/2024",
    },
    {
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuBHj-248c90mrzDxivvIc9zX-1PmCqWGeqWjuh4N3ZbiE6EyUCZvFnWqctGgaYtv4Y-k_mL02q_OsIt2hNYljmfV_rtV2na088aEg3KUbJp2mP9w0milBkHUqvSj9fAjcsQ4o2GTRmD79WknSBNfXj_ceItPHNiRDCnBYqZC2ZkyoKsYY2_2FhQLWezqRmxyqINEuTWUKoklBVw29Sse8tnKaJFD1VvOz01pTkd1qhiztUSHjPo6bElth6mCR_hYaYexKdNG-SOBMka",
        title: "Kinh nghiệm phân tích pháp lý dự án căn hộ trước khi tư vấn",
        date: "09/05/2024",
    },
];

const COLUMNS = [
    {
        dot: "bg-[#135bec]", label: "Thị trường 24h",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCBmhFpzyL2ZKdMnbe1CzA9ro5l6w21CdUOgjeHb1CUwG-0cXDHUJkQae9E81i8VdHjNyGS2kARaeyEuwmDbEMOOzNycp4w-rRsqithu-BvWPjRYLVIQvjjPDSSzCXa1LoEjHCErFcFFUbxVVmoBXSG4VBLFtzuSHX8kvnYfepEztf2CXVoTU0xv2UFaC4cdqIsEokMi9LzP5aKHmuRc3ehXy-uiEjA9JUDg3LheGhTKNSBB8qVVuLXK_LpcyFLrpgI21R66qTV6U_u",
        featured: "TP.HCM: Nguồn cung căn hộ cao cấp dẫn dắt thị trường cuối năm",
        summary: "Số lượng dự án mới chào bán tại khu Đông liên tục tăng, ghi nhận mức thanh khoản tích cực ở phân khúc căn hộ hạng sang...",
        time: "2 giờ trước",
        others: [
            "Đà Nẵng thu hút dòng vốn đầu tư vào bất động sản nghỉ dưỡng mặt biển",
            "Làn sóng đầu tư đón đầu hạ tầng tại các tỉnh vệ tinh Hà Nội",
        ],
    },
    {
        dot: "bg-green-500", label: "Kinh nghiệm môi giới",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCVkwPEvoUKrL52xtPLKuZyLSx4KRRFeY0KuQ-6F2jAYopUpv0jRH-aqyJCBbxwWoR1Rb7YinZQzAvqJI-Upbo_nf_FPoIaimXqpMrxyn35fHTHXn493GLbjIy03Tnr4pt4dcjFKwRIbakrYagtICJkkcJVOrZQUdOul9VHKBXZUpINviCFG2cm24Ja9FgWfnNAH9Cq8UaByKwWBRN5BeKY4EGFjvkif7AoZh6nkvzjb31iaGXEznWgnSIYCO7S1GO-1BjDZFyQkXGb",
        featured: "5 Kỹ năng chốt deal 'triệu đô' dành cho môi giới chuyên nghiệp",
        summary: "Hiểu tâm lý khách hàng cao cấp và xây dựng uy tín cá nhân là chìa khóa để thành công trong phân khúc biệt thự.",
        time: "1 ngày trước",
        others: [
            "Cách xây dựng thương hiệu cá nhân trên mạng xã hội cho môi giới BĐS",
            "Quy trình xử lý từ chối khéo léo khi khách hàng chê giá cao",
        ],
    },
    {
        dot: "bg-orange-500", label: "Chính sách & Pháp lý",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuCBmhFpzyL2ZKdMnbe1CzA9ro5l6w21CdUOgjeHb1CUwG-0cXDHUJkQae9E81i8VdHjNyGS2kARaeyEuwmDbEMOOzNycp4w-rRsqithu-BvWPjRYLVIQvjjPDSSzCXa1LoEjHCErFcFFUbxVVmoBXSG4VBLFtzuSHX8kvnYfepEztf2CXVoTU0xv2UFaC4cdqIsEokMi9LzP5aKHmuRc3ehXy-uiEjA9JUDg3LheGhTKNSBB8qVVuLXK_LpcyFLrpgI21R66qTV6U_u",
        featured: "Hướng dẫn thủ tục sang tên sổ đỏ mới nhất năm 2024",
        summary: "Các bước chuẩn bị hồ sơ và nộp thuế phí khi thực hiện giao dịch chuyển nhượng bất động sản.",
        time: "3 ngày trước",
        others: [
            "Pháp lý Condotel: Những thay đổi quan trọng nhà đầu tư cần biết",
            "Nghị định mới về quản lý và sử dụng đất dự án phát triển đô thị",
        ],
    },
];

export default function NewsPage() {
    return (
        <div className="relative flex min-h-screen w-full flex-col bg-[#f6f6f8]">
            <Header />

            <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-10 xl:px-20 py-10">

                {/* ── Featured section ── */}
                <section className="mb-16">
                    <div className="flex items-center gap-2 mb-8">
                        <span className="w-8 h-1 bg-[#135bec] rounded-full" />
                        <h1 className="text-3xl font-black uppercase tracking-tight">Tin tức & Phân tích</h1>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Main featured */}
                        <div className="lg:col-span-8 group cursor-pointer">
                            <div className="relative h-[420px] sm:h-[480px] rounded-3xl overflow-hidden mb-6">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img alt="Featured News"
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuCVkwPEvoUKrL52xtPLKuZyLSx4KRRFeY0KuQ-6F2jAYopUpv0jRH-aqyJCBbxwWoR1Rb7YinZQzAvqJI-Upbo_nf_FPoIaimXqpMrxyn35fHTHXn493GLbjIy03Tnr4pt4dcjFKwRIbakrYagtICJkkcJVOrZQUdOul9VHKBXZUpINviCFG2cm24Ja9FgWfnNAH9Cq8UaByKwWBRN5BeKY4EGFjvkif7AoZh6nkvzjb31iaGXEznWgnSIYCO7S1GO-1BjDZFyQkXGb"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
                                <div className="absolute bottom-0 left-0 p-8 w-full">
                                    <span className="inline-block px-3 py-1 bg-[#135bec] text-white text-xs font-bold rounded-lg mb-4">
                                        THỊ TRƯỜNG 24H
                                    </span>
                                    <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4 leading-tight group-hover:text-[#135bec] transition-colors">
                                        Dự báo thị trường Bất động sản năm 2024: Cơ hội phục hồi từ quý III
                                    </h2>
                                    <div className="flex items-center gap-4 text-slate-300 text-sm flex-wrap">
                                        <span className="flex items-center gap-1">
                                            <span className="material-symbols-outlined text-sm">calendar_today</span> 12/05/2024
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <span className="material-symbols-outlined text-sm">person</span> Ban Biên Tập
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Side news list */}
                        <div className="lg:col-span-4 flex flex-col gap-5">
                            {SIDE_NEWS.map((n, i) => (
                                <div key={i} className="group flex gap-4 cursor-pointer">
                                    <div className="w-28 h-20 shrink-0 rounded-xl overflow-hidden bg-slate-200">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img alt={n.title}
                                            className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                                            src={n.image} />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-sm leading-snug line-clamp-2 group-hover:text-[#135bec] transition-colors">
                                            {n.title}
                                        </h3>
                                        <p className="text-xs text-slate-500 mt-2">{n.date}</p>
                                    </div>
                                </div>
                            ))}
                            <div className="mt-auto pt-4 border-t border-slate-100">
                                <a href="#"
                                    className="flex items-center justify-center gap-2 bg-slate-100 py-3 rounded-xl font-bold text-sm hover:bg-[#135bec] hover:text-white transition-colors">
                                    Xem tất cả tiêu điểm
                                    <span className="material-symbols-outlined text-sm">arrow_forward</span>
                                </a>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── 3 content columns ── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {COLUMNS.map((col) => (
                        <section key={col.label}>
                            <div className="flex items-center gap-2 mb-6 border-b-2 border-slate-100 pb-4">
                                <h2 className="text-xl font-extrabold flex items-center gap-2">
                                    <span className={`w-2 h-2 ${col.dot} rounded-full`} />
                                    {col.label}
                                </h2>
                            </div>
                            <div className="space-y-5">
                                <div className="group cursor-pointer">
                                    <div className="h-44 rounded-2xl overflow-hidden mb-4">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img alt={col.featured}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                                            src={col.image} />
                                    </div>
                                    <h3 className="font-bold text-base leading-tight mb-2 group-hover:text-[#135bec] transition-colors">
                                        {col.featured}
                                    </h3>
                                    <p className="text-sm text-slate-500 line-clamp-2 mb-3">{col.summary}</p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                        <span className="material-symbols-outlined text-xs">schedule</span>
                                        {col.time}
                                    </p>
                                </div>
                                {col.others.map((title, i) => (
                                    <div key={i} className="py-4 border-t border-slate-100">
                                        <h4 className="font-semibold text-sm hover:text-[#135bec] cursor-pointer line-clamp-2 transition-colors">
                                            {title}
                                        </h4>
                                    </div>
                                ))}
                            </div>
                        </section>
                    ))}
                </div>

                {/* ── Email newsletter CTA ── */}
                <section className="mt-20 bg-slate-900 rounded-3xl p-8 md:p-12 text-center text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#135bec]/20 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#135bec]/10 rounded-full blur-3xl -ml-24 -mb-24 pointer-events-none" />
                    <div className="relative z-10 max-w-2xl mx-auto">
                        <span className="inline-flex items-center justify-center p-3 bg-[#135bec] rounded-2xl mb-6 shadow-xl shadow-blue-500/20">
                            <span className="material-symbols-outlined text-3xl">mail</span>
                        </span>
                        <h2 className="text-3xl font-black mb-4">Đăng ký Bản tin Email</h2>
                        <p className="text-slate-400 mb-8">
                            Nhận những phân tích thị trường độc quyền và kinh nghiệm môi giới thực chiến
                            trực tiếp qua hòm thư của bạn hàng tuần.
                        </p>
                        <form className="flex flex-col md:flex-row gap-3" onSubmit={(e) => e.preventDefault()}>
                            <input
                                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-5 py-4 focus:ring-2 focus:ring-[#135bec] focus:border-transparent outline-none placeholder:text-slate-500 text-white"
                                placeholder="Địa chỉ email của bạn"
                                type="email"
                            />
                            <button
                                type="submit"
                                className="bg-[#135bec] hover:bg-blue-600 text-white font-bold px-8 py-4 rounded-xl shadow-lg shadow-blue-500/20 transition-all active:scale-95">
                                Đăng ký ngay
                            </button>
                        </form>
                        <p className="mt-4 text-xs text-slate-500">Chúng tôi cam kết bảo mật thông tin và không gửi spam.</p>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
