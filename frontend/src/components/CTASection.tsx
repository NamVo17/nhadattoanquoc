import Link from "next/link";

export default function CTASection() {
    return (
        <section className="bg-slate-900 py-12 sm:py-16 px-4 sm:px-6">
            <div className="max-w-3xl mx-auto text-center">
                <h2 className="text-2xl sm:text-3xl font-black text-white mb-4 sm:mb-6 leading-tight">
                    Trở thành đối tác cộng tác ngay hôm nay
                </h2>
                <p className="text-slate-400 mb-6 sm:mb-8 text-base sm:text-lg max-w-xl mx-auto">
                    Gia nhập cộng đồng hơn 8,500 môi giới chuyên nghiệp để tiếp cận nguồn hàng độc quyền và hoa hồng hấp dẫn.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
                    <Link
                        href="/register"
                        className="inline-flex items-center justify-center bg-primary text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg shadow-xl shadow-blue-500/20 hover:-translate-y-1 active:translate-y-0 transition-transform"
                    >
                        Đăng ký cộng tác viên
                    </Link>
                    <Link
                        href="/agents"
                        className="inline-flex items-center justify-center bg-white/10 text-white border border-white/20 backdrop-blur px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-bold text-base sm:text-lg hover:bg-white/20 active:bg-white/30 transition-all"
                    >
                        Tìm hiểu thêm
                    </Link>
                </div>
            </div>
        </section>
    );
}
