"use client";
import { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const STATS = [
    { value: "8,500+", label: "Cộng tác viên", color: "text-[#135bec]" },
    { value: "12k+", label: "Giao dịch thành công", color: "text-green-500" },
    { value: "4.9/5", label: "Đánh giá trung bình", color: "text-orange-500" },
    { value: "63", label: "Tỉnh thành", color: "text-slate-900" },
];

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

interface Agent {
    id: string;
    full_name: string;
    email: string;
    phone?: string;
    avatar_url?: string;
    username?: string;
    title?: string;
    license_code?: string;
    join_year?: string;
    experience?: string;
    success_deals?: string;
    bio?: string;
    areas?: string[];
    property_types?: string[];
}

function StarIcons({ rating }: { rating: number }) {
    return (
        <div className="flex items-center gap-0.5 text-orange-400">
            {[1, 2, 3, 4, 5].map((i) => (
                <span key={i} className="material-symbols-outlined text-sm"
                    style={{ fontVariationSettings: i <= Math.floor(rating) ? "'FILL' 1" : "'FILL' 0" }}>
                    {i <= rating ? "star" : i - 0.5 === rating ? "star_half" : "star"}
                </span>
            ))}
        </div>
    );
}

function AgentCard({ agent }: { agent: Agent }) {
    const experienceLabel = agent.experience ? `${agent.experience} Năm` : "Chưa cập nhật";
    const dealsLabel = agent.success_deals ? `${agent.success_deals}+ Thành công` : "Đang cập nhật";
    const areaLabel = agent.areas?.length ? agent.areas.slice(0, 2).join(", ") + (agent.areas.length > 2 ? "..." : "") : "Toàn quốc";

    return (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl transition-all group">
            <div className="p-6">
                <div className="flex items-start gap-4 mb-6">
                    <div className="relative shrink-0">
                        {agent.avatar_url ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img alt={agent.full_name}
                                className="w-20 h-20 rounded-2xl object-cover border-2 border-slate-100"
                                src={agent.avatar_url} />
                        ) : (
                            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#135bec] to-blue-400 flex items-center justify-center border-2 border-slate-100">
                                <span className="text-white text-2xl font-bold">
                                    {agent.full_name?.charAt(0).toUpperCase()}
                                </span>
                            </div>
                        )}
                        {/* Online indicator: always show green for active agents */}
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white bg-green-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-slate-900 group-hover:text-[#135bec] transition-colors truncate">
                            {agent.full_name}
                        </h3>
                        <p className="text-sm text-slate-500 mb-1">{agent.title || "Cộng tác viên BĐS"}</p>
                        <div className="flex items-center gap-1">
                            <StarIcons rating={5} />
                            <span className="text-xs font-bold text-slate-400 ml-1">(Mới)</span>
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-6 py-4 border-y border-slate-100">
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Kinh nghiệm</p>
                        <p className="text-sm font-bold text-slate-700">{experienceLabel}</p>
                    </div>
                    <div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Giao dịch</p>
                        <p className="text-sm font-bold text-slate-700">{dealsLabel}</p>
                    </div>
                    <div className="col-span-2">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Khu vực thế mạnh</p>
                        <p className="text-sm font-bold text-slate-700">{areaLabel}</p>
                    </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <a href={`/agents/${encodeURIComponent(agent.full_name)}`}
                        className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all text-center">
                        Xem hồ sơ
                    </a>
                    <button className="py-2.5 px-4 bg-[#135bec] hover:bg-blue-600 text-white font-bold text-xs rounded-xl transition-all shadow-lg shadow-blue-500/20">
                        Kết nối hợp tác
                    </button>
                </div>
            </div>
        </div>
    );
}

function AgentCardSkeleton() {
    return (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm p-6 animate-pulse">
            <div className="flex items-start gap-4 mb-6">
                <div className="w-20 h-20 rounded-2xl bg-slate-200 shrink-0" />
                <div className="flex-1 space-y-2">
                    <div className="h-5 bg-slate-200 rounded w-3/4" />
                    <div className="h-4 bg-slate-100 rounded w-1/2" />
                    <div className="h-3 bg-slate-100 rounded w-24" />
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4 py-4 border-y border-slate-100 mb-6">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className={i === 2 ? "col-span-2" : ""}>
                        <div className="h-3 bg-slate-100 rounded w-16 mb-1" />
                        <div className="h-4 bg-slate-200 rounded w-20" />
                    </div>
                ))}
            </div>
            <div className="grid grid-cols-2 gap-3">
                <div className="h-9 bg-slate-100 rounded-xl" />
                <div className="h-9 bg-blue-100 rounded-xl" />
            </div>
        </div>
    );
}

export default function AgentsPage() {
    const [agents, setAgents] = useState<Agent[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");

    // Debounce search input
    useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(search), 400);
        return () => clearTimeout(t);
    }, [search]);

    useEffect(() => {
        const fetchAgents = async () => {
            setIsLoading(true);
            try {
                const params = new URLSearchParams();
                if (debouncedSearch) params.set("search", debouncedSearch);
                const res = await fetch(`${API_URL}/auth/agents?${params.toString()}`);
                const json = await res.json();
                if (json.success) {
                    setAgents(json.data.agents || []);
                }
            } catch {
                setAgents([]);
            } finally {
                setIsLoading(false);
            }
        };
        fetchAgents();
    }, [debouncedSearch]);

    return (
        <div className="relative flex min-h-screen w-full flex-col bg-[#f6f6f8]">
            <Header />

            {/* ── Hero search ── */}
            <section className="bg-slate-900 py-16 flex items-center justify-center overflow-hidden">
                <div className="max-w-5xl w-full px-4 text-center">
                    <h1 className="text-4xl md:text-5xl font-black text-white mb-6">
                        Mạng lưới Cộng tác viên Môi giới
                    </h1>
                    <p className="text-lg text-slate-400 mb-10 max-w-2xl mx-auto">
                        Tìm kiếm và kết nối với các chuyên gia môi giới hàng đầu để tối ưu hóa hiệu quả kinh doanh của bạn.
                    </p>
                    <div className="bg-white p-2 md:p-3 rounded-2xl shadow-2xl max-w-4xl mx-auto border border-white/10">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                            <div className="flex items-center border-b md:border-b-0 md:border-r border-slate-100 px-3 py-2">
                                <span className="material-symbols-outlined text-[#135bec] mr-2">search</span>
                                <div className="text-left flex-1">
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase">Tìm theo tên</label>
                                    <input
                                        className="w-full border-none p-0 text-sm font-medium bg-transparent focus:ring-0 outline-none placeholder:text-slate-300"
                                        placeholder="Tên môi giới..."
                                        type="text"
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                    />
                                </div>
                            </div>
                            <div className="flex items-center border-b md:border-b-0 md:border-r border-slate-100 px-3 py-2">
                                <span className="material-symbols-outlined text-[#135bec] mr-2">location_on</span>
                                <div className="text-left flex-1">
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase">Khu vực hoạt động</label>
                                    <select className="w-full border-none p-0 text-sm font-medium bg-transparent focus:ring-0 outline-none">
                                        <option>Tất cả khu vực</option>
                                        <option>Hà Nội</option>
                                        <option>TP. Hồ Chí Minh</option>
                                        <option>Đà Nẵng</option>
                                        <option>Bình Dương</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex items-center px-2">
                                <button
                                    onClick={() => setDebouncedSearch(search)}
                                    className="w-full bg-[#135bec] hover:bg-blue-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all"
                                >
                                    <span className="material-symbols-outlined">search</span>
                                    Tìm đối tác
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-10 xl:px-20 py-12">

                {/* ── Stats ── */}
                <section className="mb-16">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {STATS.map((s) => (
                            <div key={s.label} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm text-center">
                                <p className={`text-3xl font-black mb-1 ${s.color}`}>{s.value}</p>
                                <p className="text-sm text-slate-500 font-medium uppercase tracking-wider">{s.label}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* ── Agent grid ── */}
                <section className="mb-16">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h2 className="text-2xl font-extrabold">Danh sách Chuyên gia</h2>
                            <p className="text-slate-500">
                                {isLoading ? "Đang tải..." : `${agents.length} cộng tác viên`}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-slate-500 whitespace-nowrap">Sắp xếp theo:</span>
                            <select className="bg-white border border-slate-200 rounded-lg text-sm font-bold focus:ring-[#135bec] py-2 px-3 outline-none">
                                <option>Mới nhất</option>
                                <option>Kinh nghiệm nhiều nhất</option>
                                <option>Giao dịch nhiều nhất</option>
                            </select>
                        </div>
                    </div>

                    {isLoading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[...Array(6)].map((_, i) => <AgentCardSkeleton key={i} />)}
                        </div>
                    ) : agents.length === 0 ? (
                        <div className="text-center py-24 bg-white rounded-2xl border border-slate-200">
                            <span className="material-symbols-outlined text-5xl text-slate-300 block mb-3">group_off</span>
                            <p className="text-slate-400 font-medium">
                                {search ? `Không tìm thấy cộng tác viên nào với từ khoá "${search}".` : "Chưa có cộng tác viên nào trong hệ thống."}
                            </p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {agents.map((a) => <AgentCard key={a.id} agent={a} />)}
                        </div>
                    )}
                </section>

                {/* ── Join CTA ── */}
                <section className="bg-[#135bec]/5 px-6 md:px-12 py-16 rounded-3xl text-center">
                    <h2 className="text-3xl font-black text-slate-900 mb-6">Bạn là môi giới chuyên nghiệp?</h2>
                    <p className="text-slate-500 mb-8 text-lg max-w-2xl mx-auto">
                        Tham gia vào mạng lưới cộng tác viên của chúng tôi để tiếp cận kho hàng độc quyền và mở rộng mạng lưới khách hàng.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <button className="bg-[#135bec] text-white px-8 py-4 rounded-xl font-bold text-lg shadow-xl shadow-blue-500/20 hover:-translate-y-1 transition-transform">
                            Đăng ký ngay
                        </button>
                        <button className="bg-white text-slate-700 border border-slate-200 px-8 py-4 rounded-xl font-bold text-lg hover:bg-slate-50 transition-all">
                            Quy trình cộng tác
                        </button>
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}
