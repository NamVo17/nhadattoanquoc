export default function Footer() {
    return (
        <footer className="mt-auto border-t border-slate-200 bg-white py-10 sm:py-12 px-4 sm:px-6 lg:px-10">
            {/* Grid: 1 col mobile → 2 col sm → 4 col md */}
            <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 sm:gap-10 mb-8 sm:mb-10">

                {/* Brand */}
                <div className="sm:col-span-2 md:col-span-1">
                    <div className="flex items-center gap-2 text-[#135bec] mb-4 sm:mb-6">
                        <span className="material-symbols-outlined text-2xl sm:text-3xl font-bold">home</span>
                        <h2 className="text-lg sm:text-xl font-extrabold tracking-tight">
                            NhàĐấtToànQuốc
                        </h2>
                    </div>
                    <p className="text-sm text-slate-500 mb-5 leading-relaxed">
                        Nền tảng kết nối môi giới bất động sản chuyên nghiệp số 1 Việt Nam. Minh bạch - Hiệu quả - Bền vững.
                    </p>
                    <div className="flex gap-3">
                        {[
                            { icon: "share", label: "Share" },
                            { icon: "mail", label: "Email" },
                            { icon: "phone", label: "Phone" },
                        ].map(({ icon, label }) => (
                            <a
                                key={icon}
                                href="#"
                                aria-label={label}
                                className="w-9 h-9 rounded-full bg-slate-100 hover:bg-blue-50 hover:text-[#135bec] flex items-center justify-center text-slate-600 transition-colors"
                            >
                                <span className="material-symbols-outlined text-[18px]">{icon}</span>
                            </a>
                        ))}
                    </div>
                </div>

                {/* About */}
                <div>
                    <h4 className="font-bold mb-4 sm:mb-6 text-slate-900">Về chúng tôi</h4>
                    <ul className="space-y-3 text-sm text-slate-500">
                        {["Giới thiệu", "Quy chế hoạt động", "Tuyển dụng", "Liên hệ"].map((item) => (
                            <li key={item}>
                                <a className="hover:text-[#135bec] transition-colors" href="#">{item}</a>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Services */}
                <div>
                    <h4 className="font-bold mb-4 sm:mb-6 text-slate-900">Dịch vụ</h4>
                    <ul className="space-y-3 text-sm text-slate-500">
                        {["Đăng tin bán/cho thuê", "Quản lý hoa hồng", "Đào tạo môi giới", "Hỗ trợ pháp lý"].map((item) => (
                            <li key={item}>
                                <a className="hover:text-[#135bec] transition-colors" href="#">{item}</a>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Support */}
                <div>
                    <h4 className="font-bold mb-4 sm:mb-6 text-slate-900">Hỗ trợ khách hàng</h4>
                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100">
                        <p className="text-[10px] text-slate-400 uppercase font-bold mb-2 tracking-widest">Hotline 24/7</p>
                        <p className="text-xl sm:text-2xl font-black text-[#135bec]">0347587212</p>
                        <p className="text-xs text-slate-500 mt-2 break-all">nhadattoanquoc9@gmail.com</p>
                    </div>
                </div>
            </div>

            {/* Bottom bar */}
            <div className="max-w-7xl mx-auto pt-6 sm:pt-8 border-t border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4">
                <span className="text-xs sm:text-sm text-slate-400 text-center sm:text-left">
                    © 2026 NhàĐấtToànQuốc. Tất cả các quyền được bảo hộ.
                </span>
                <div className="flex gap-4 sm:gap-6 text-xs sm:text-sm text-slate-500 font-medium">
                    <a className="hover:text-[#135bec] transition-colors" href="#">Điều khoản</a>
                    <a className="hover:text-[#135bec] transition-colors" href="#">Chính sách bảo mật</a>
                </div>
            </div>
        </footer>
    );
}
