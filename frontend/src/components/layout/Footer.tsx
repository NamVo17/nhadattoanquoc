import Link from "next/link";

const ABOUT_LINKS = [
    { label: "Giới thiệu", href: "/about" },
    { label: "Quy chế hoạt động", href: "/terms" },
    { label: "Tuyển dụng", href: "/careers" },
    { label: "Liên hệ", href: "/contact" },
];

const SERVICE_LINKS = [
    { label: "Đăng tin bán/cho thuê", href: "/post" },
    { label: "Quản lý hoa hồng", href: "/dashboard" },
    { label: "Đào tạo môi giới", href: "/agents" },
    { label: "Hỗ trợ pháp lý", href: "/news" },
];

const HOTLINE = "0347587212";
const EMAIL = "nhadattoanquoc9@gmail.com";

export default function Footer() {
    return (
        <footer className="mt-auto border-t border-slate-200 bg-white py-10 sm:py-12 px-4 sm:px-6 lg:px-10">
            {/* Grid: 1 col mobile → 2 col sm → 4 col md */}
            <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 sm:gap-10 mb-8 sm:mb-10">

                {/* Brand */}
                <div className="sm:col-span-2 md:col-span-1">
                    <Link href="/" className="flex items-center gap-2 text-[#135bec] mb-4 sm:mb-6 hover:opacity-90 transition-opacity">
                        <span className="material-symbols-outlined text-2xl sm:text-3xl font-bold" aria-hidden="true">home</span>
                        <h2 className="text-lg sm:text-xl font-extrabold tracking-tight">
                            NhàĐấtToànQuốc
                        </h2>
                    </Link>
                    <p className="text-sm text-slate-500 mb-5 leading-relaxed">
                        Nền tảng kết nối môi giới bất động sản chuyên nghiệp số 1 Việt Nam. Minh bạch - Hiệu quả - Bền vững.
                    </p>
                    <div className="flex gap-3">
                        <a
                            href={`tel:${HOTLINE}`}
                            aria-label="Gọi điện"
                            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-blue-50 hover:text-[#135bec] flex items-center justify-center text-slate-600 transition-colors"
                        >
                            <span className="material-symbols-outlined text-[18px]" aria-hidden="true">phone</span>
                        </a>
                        <a
                            href={`mailto:${EMAIL}`}
                            aria-label="Gửi email"
                            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-blue-50 hover:text-[#135bec] flex items-center justify-center text-slate-600 transition-colors"
                        >
                            <span className="material-symbols-outlined text-[18px]" aria-hidden="true">mail</span>
                        </a>
                        <a
                            href="https://facebook.com"
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Facebook"
                            className="w-9 h-9 rounded-full bg-slate-100 hover:bg-blue-50 hover:text-[#135bec] flex items-center justify-center text-slate-600 transition-colors"
                        >
                            <span className="material-symbols-outlined text-[18px]" aria-hidden="true">share</span>
                        </a>
                    </div>
                </div>

                {/* About */}
                <div>
                    <h4 className="font-bold mb-4 sm:mb-6 text-slate-900">Về chúng tôi</h4>
                    <ul className="space-y-3 text-sm text-slate-500">
                        {ABOUT_LINKS.map(({ label, href }) => (
                            <li key={label}>
                                <Link className="hover:text-[#135bec] transition-colors" href={href}>{label}</Link>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Services */}
                <div>
                    <h4 className="font-bold mb-4 sm:mb-6 text-slate-900">Dịch vụ</h4>
                    <ul className="space-y-3 text-sm text-slate-500">
                        {SERVICE_LINKS.map(({ label, href }) => (
                            <li key={label}>
                                <Link className="hover:text-[#135bec] transition-colors" href={href}>{label}</Link>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Support */}
                <div>
                    <h4 className="font-bold mb-4 sm:mb-6 text-slate-900">Hỗ trợ khách hàng</h4>
                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                        <p className="text-[10px] text-slate-400 uppercase font-bold mb-2 tracking-widest">Hotline 24/7</p>
                        <a
                            href={`tel:${HOTLINE}`}
                            className="text-xl sm:text-2xl font-black text-[#135bec] hover:underline block"
                            aria-label={`Gọi hotline ${HOTLINE}`}
                        >
                            {HOTLINE}
                        </a>
                        <a
                            href={`mailto:${EMAIL}`}
                            className="text-xs text-slate-500 mt-2 break-all hover:text-[#135bec] transition-colors block"
                        >
                            {EMAIL}
                        </a>
                    </div>
                </div>
            </div>

            {/* Bottom bar */}
            <div className="max-w-7xl mx-auto pt-6 sm:pt-8 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4">
                <span className="text-xs sm:text-sm text-slate-400 text-center sm:text-left">
                    © 2026 NhàĐấtToànQuốc. Tất cả các quyền được bảo hộ.
                </span>
                <div className="flex gap-4 sm:gap-6 text-xs sm:text-sm text-slate-500 font-medium">
                    <Link className="hover:text-[#135bec] transition-colors" href="/terms">Điều khoản</Link>
                    <Link className="hover:text-[#135bec] transition-colors" href="/privacy">Chính sách bảo mật</Link>
                </div>
            </div>
        </footer>
    );
}

