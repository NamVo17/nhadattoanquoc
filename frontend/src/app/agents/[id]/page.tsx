"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

interface Agent {
    cover_url?: string;
    id: string;
    full_name: string;
    email: string;
    phone?: string;
    avatar_url?: string;
    title?: string;
    license_code?: string;
    join_year?: string;
    experience?: string;
    success_deals?: string;
    bio?: string;
    areas?: string[];
    property_types?: string[];
    created_at?: string;
}

const REVIEWS = [
    {
        avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuCLy_ULrdSkpCIft8qR19qvVXLG_YPOGJQ-kr6sQzAHYb5JhSAz2TiXIXLZv7a6n_Iveh3yLWzXfZfq8g02wNjY13uDtUssa4-KWLXGXlfSL7r0pezkvBg-uCWDCK0CywUToPOvN4-7BRgHCKurJbArHLZboyz8B-WKq55vvXvtuyhfgLh40VYywCA2A-8j6zBzHRJ1ivTJ1ryHzxITev7u5gs_zc0Y6xZ8xv2N8RliJRNGslzJcPfa_8lngr39Jw8vqah6yOOiaYfo",
        name: "Trần Thu Hà", stars: 5,
        comment: "Làm việc rất chuyên nghiệp, nắm pháp lý dự án cực kỳ chắc. Đã hợp tác chốt thành công 2 căn Thủ Thiêm.",
    },
    {
        avatar: "https://lh3.googleusercontent.com/aida-public/AB6AXuASOb9PSIXfD9kLWhAM-2Q3id_kMpd80kZwqRMyRPEvkQrndmrQODSlvgLPWBYlZpDOlDDftn3rd7zhwwrIHAghONgXQOen2FyLLQi2-9AyE-RXiYiMc47d3MOofmXzKjBpjjotYtK8BdpOicFidhSb3mJ1SfsoCvy9-pD4CdfPcAG-iNY5h7JponGR_jxRNL0p987TjxrsHg34R7rpI2X860cXf_aSom2F7y5HwwN6J_FIgkI3iJUUYSriaWeSXALCru_BUqlfQsXo",
        name: "Lê Minh Tuấn", stars: 4,
        comment: "Nhiệt tình hỗ trợ đồng nghiệp, quy trình làm việc rõ ràng. Hẹn gặp lại trong các dự án tới.",
    },
];

export default function AgentProfilePage() {
    const params = useParams();
    const fullName = params?.id as string;
    // Decode the full_name from URL (it's URL-encoded)
    const decodedFullName = fullName ? decodeURIComponent(fullName) : '';

    const [agent, setAgent] = useState<Agent | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);
    const [following, setFollowing] = useState(false);

    useEffect(() => {
        if (!decodedFullName) return;
        const fetchAgent = async () => {
            setIsLoading(true);
            try {
                const res = await fetch(`${API_URL}/auth/agents/${encodeURIComponent(decodedFullName)}`);
                const json = await res.json();
                if (json.success && json.data?.agent) {
                    setAgent(json.data.agent);
                } else {
                    setNotFound(true);
                }
            } catch {
                setNotFound(true);
            } finally {
                setIsLoading(false);
            }
        };
        fetchAgent();
    }, [decodedFullName]);

    const joinYear = agent?.join_year || (agent?.created_at ? new Date(agent.created_at).getFullYear().toString() : "N/A");

    if (isLoading) {
        return (
            <div className="relative flex min-h-screen w-full flex-col bg-[#f6f6f8]">
                <Header />
                <main className="grow flex items-center justify-center">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
                </main>
                <Footer />
            </div>
        );
    }

    if (notFound || !agent) {
        return (
            <div className="relative flex min-h-screen w-full flex-col bg-[#f6f6f8]">
                <Header />
                <main className="grow flex flex-col items-center justify-center gap-4 text-center px-4">
                    <span className="material-symbols-outlined text-6xl text-slate-300">person_off</span>
                    <h2 className="text-2xl font-bold text-slate-700">Không tìm thấy cộng tác viên</h2>
                    <p className="text-slate-400">Hồ sơ này không tồn tại hoặc đã bị xóa.</p>
                    <Link href="/agents" className="mt-4 px-6 py-2.5 bg-primary text-white rounded-xl font-bold text-sm hover:bg-blue-600 transition-colors">
                        Quay về danh sách
                    </Link>
                </main>
                <Footer />
            </div>
        );
    }

    return (
        <div className="relative flex min-h-screen w-full flex-col bg-[#f6f6f8]">
            <Header />

            <main className="grow">
                {/* ── Cover banner ── */}
                <div className="relative w-full h-56 md:h-72 bg-slate-300">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        className="w-full h-full object-cover"
                        alt="Cover"
                        src={
                            agent.cover_url
                                ? agent.cover_url
                                : "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1200"
                        }
                    />
                    <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 relative z-10 pb-16">

                    {/* ── Profile header card ── */}
                    <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">
                        <div className="flex flex-col md:flex-row items-center md:items-end gap-6">
                            {/* Avatar */}
                            <div className="relative shrink-0">
                                <div className="h-32 w-32 md:h-40 md:w-40 rounded-2xl border-4 border-white overflow-hidden shadow-lg">
                                    {agent.avatar_url ? (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img className="h-full w-full object-cover" alt={agent.full_name} src={agent.avatar_url} />
                                    ) : (
                                        <div className="h-full w-full bg-linear-to-br from-[#135bec] to-blue-400 flex items-center justify-center">
                                            <span className="text-white text-5xl font-bold">
                                                {agent.full_name?.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                <div className="absolute -bottom-2 -right-2 bg-green-500 text-white p-1 rounded-full border-2 border-white">
                                    <span className="material-symbols-outlined text-sm block">verified</span>
                                </div>
                            </div>

                            {/* Name & meta */}
                            <div className="grow text-center md:text-left">
                                <div className="flex flex-col md:flex-row md:items-center gap-2 mb-1">
                                    <h1 className="text-3xl font-extrabold text-slate-900 uppercase tracking-tight">
                                        {agent.full_name}
                                    </h1>
                                    {agent.title && (
                                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#135bec]/10 text-primary uppercase">
                                            {agent.title}
                                        </span>
                                    )}
                                </div>
                                {agent.license_code && (
                                    <p className="text-slate-500 font-medium flex items-center justify-center md:justify-start gap-1 text-sm">
                                        <span className="material-symbols-outlined text-sm">badge</span>
                                        Mã số chứng chỉ: {agent.license_code}
                                    </p>
                                )}
                                <div className="flex flex-wrap justify-center md:justify-start gap-4 mt-3">
                                    <div className="flex items-center gap-1 text-yellow-500">
                                        <span className="material-symbols-outlined text-lg"
                                            style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
                                        <span className="font-bold text-slate-900">5.0</span>
                                        <span className="text-slate-400 text-sm">(Mới)</span>
                                    </div>
                                    {joinYear && (
                                        <div className="flex items-center gap-1 text-slate-500 text-sm">
                                            <span className="material-symbols-outlined">schedule</span>
                                            Gia nhập: {joinYear}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 w-full md:w-auto">
                                <button className="flex-1 md:flex-none px-6 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-lg hover:bg-slate-200 transition-colors">
                                    Nhắn tin
                                </button>
                                <button
                                    onClick={() => setFollowing(!following)}
                                    className={`flex-1 md:flex-none px-6 py-2.5 font-bold rounded-lg transition-all ${following
                                        ? "bg-slate-200 text-slate-700"
                                        : "bg-[#135bec] text-white shadow-lg shadow-blue-500/20 hover:bg-blue-600"}`}>
                                    {following ? "Đang theo dõi" : "Theo dõi"}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* ── Content grid ── */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                        {/* Left: about */}
                        <div className="lg:col-span-8 space-y-8">

                            {/* About */}
                            <section className="bg-white rounded-xl shadow-sm p-6 border border-slate-100">
                                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-primary">person</span>
                                    Giới thiệu &amp; Kinh nghiệm
                                </h3>
                                {agent.bio ? (
                                    <p className="text-slate-600 leading-relaxed mb-6 text-sm whitespace-pre-line">{agent.bio}</p>
                                ) : (
                                    <p className="text-slate-400 mb-6 text-sm italic">Cộng tác viên chưa cập nhật phần giới thiệu.</p>
                                )}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-4 bg-slate-50 rounded-lg">
                                        <p className="text-xs font-bold text-slate-400 uppercase mb-2">Khu vực hoạt động</p>
                                        <div className="flex flex-wrap gap-2">
                                            {agent.areas && agent.areas.length > 0 ? (
                                                agent.areas.map((t) => (
                                                    <span key={t} className="px-3 py-1 bg-white border border-slate-200 rounded-md text-sm">{t}</span>
                                                ))
                                            ) : (
                                                <span className="px-3 py-1 bg-white border border-slate-200 rounded-md text-sm text-slate-400">Toàn quốc</span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="p-4 bg-slate-50 rounded-lg">
                                        <p className="text-xs font-bold text-slate-400 uppercase mb-2">Loại hình chuyên sâu</p>
                                        <div className="flex flex-wrap gap-2">
                                            {agent.property_types && agent.property_types.length > 0 ? (
                                                agent.property_types.map((t) => (
                                                    <span key={t} className="px-3 py-1 bg-white border border-slate-200 rounded-md text-sm">{t}</span>
                                                ))
                                            ) : (
                                                <span className="px-3 py-1 bg-white border border-slate-200 rounded-md text-sm text-slate-400">Chưa cập nhật</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* No listings section – placeholder */}
                            <section>
                                <div className="flex items-center justify-between mb-5">
                                    <h3 className="text-xl font-bold flex items-center gap-2">
                                        <span className="material-symbols-outlined text-primary">inventory_2</span>
                                        Giỏ hàng đang bán
                                    </h3>
                                </div>
                                <div className="bg-white rounded-xl p-8 text-center border border-slate-100">
                                    <span className="material-symbols-outlined text-4xl text-slate-200 block mb-2">home_work</span>
                                    <p className="text-slate-400 text-sm">Cộng tác viên chưa có bất động sản đang bán.</p>
                                </div>
                            </section>
                        </div>

                        {/* Right: stats + reviews */}
                        <div className="lg:col-span-4 space-y-5">

                            {/* Performance stats */}
                            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                                <div className="p-4 bg-slate-50 border-b border-slate-100">
                                    <h3 className="font-bold text-sm uppercase tracking-wider text-slate-500">Chỉ số uy tín</h3>
                                </div>
                                <div className="p-5 space-y-5">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-green-100 text-green-600 rounded-lg">
                                                <span className="material-symbols-outlined">handshake</span>
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-500 font-medium">Giao dịch thành công</p>
                                                <p className="text-xl font-bold">{agent.success_deals ? `${agent.success_deals}+` : "—"}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                                                <span className="material-symbols-outlined">military_tech</span>
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-500 font-medium">Kinh nghiệm</p>
                                                <p className="text-xl font-bold">{agent.experience ? `${agent.experience} năm` : "—"}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                                                <span className="material-symbols-outlined">location_on</span>
                                            </div>
                                            <div>
                                                <p className="text-xs text-slate-500 font-medium">Khu vực</p>
                                                <p className="text-sm font-bold">
                                                    {agent.areas?.length ? `${agent.areas.length} khu vực` : "Toàn quốc"}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Reviews */}
                            <div className="bg-white rounded-xl shadow-sm border border-slate-100">
                                <div className="p-4 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
                                    <h3 className="font-bold text-sm uppercase tracking-wider text-slate-500">Đánh giá từ đối tác</h3>
                                    <button className="text-xs text-primary font-bold">Gửi đánh giá</button>
                                </div>
                                <div className="p-5 space-y-4">
                                    {REVIEWS.map((r, i) => (
                                        <div key={i} className="border-b border-slate-100 pb-4 last:border-0 last:pb-0">
                                            <div className="flex items-center gap-3 mb-2">
                                                <div className="h-8 w-8 rounded-full overflow-hidden shrink-0">
                                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                                    <img className="h-full w-full object-cover" alt={r.name} src={r.avatar} />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold">{r.name}</p>
                                                    <div className="flex text-yellow-500">
                                                        {[1, 2, 3, 4, 5].map((s) => (
                                                            <span key={s} className="material-symbols-outlined text-sm"
                                                                style={{ fontVariationSettings: s <= r.stars ? "'FILL' 1" : "'FILL' 0" }}>star</span>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                            <p className="text-sm text-slate-600 line-clamp-2">{r.comment}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Certifications */}
                            <div className="bg-white rounded-xl shadow-sm border border-slate-100">
                                <div className="p-4 bg-slate-50 border-b border-slate-100">
                                    <h3 className="font-bold text-sm uppercase tracking-wider text-slate-500">Chứng chỉ hành nghề</h3>
                                </div>
                                <div className="p-4 grid grid-cols-2 gap-3">
                                    {[0, 1].map((i) => (
                                        <div key={i} className="aspect-4/3 bg-slate-100 rounded flex items-center justify-center border-2 border-dashed border-slate-300">
                                            <span className="material-symbols-outlined text-slate-400 text-3xl">description</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
}
