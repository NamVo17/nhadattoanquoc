"use client";
import { useState } from "react";

const incomingRequests = [
    {
        id: 1,
        partner: { name: "Trần Minh Quân", role: "Môi giới Tự do", avatar: "https://randomuser.me/api/portraits/men/32.jpg" },
        property: { title: "Biệt thự Thảo Điền", image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=200" },
        commission: "2.0%",
        date: "20/10/2023",
        status: "pending",
    },
    {
        id: 2,
        partner: { name: "Lê Thị Mai", role: "Phú Mỹ Hưng Agency", avatar: "https://randomuser.me/api/portraits/women/44.jpg" },
        property: { title: "Căn hộ Vinhomes Grand Park", image: "https://images.unsplash.com/photo-1512917774080-9b274b3f59c7?w=200" },
        commission: "1.5%",
        date: "18/10/2023",
        status: "accepted",
    },
    {
        id: 3,
        partner: { name: "Hoàng Anh Tuấn", role: "Sài Gòn Land", avatar: "https://randomuser.me/api/portraits/men/56.jpg" },
        property: { title: "Nhà phố Thủ Đức", image: "https://images.unsplash.com/photo-1565693566231-b5a15ebc4d2b?w=200" },
        commission: "3.0%",
        date: "15/10/2023",
        status: "rejected",
    },
];

const sentRequests = [
    {
        id: 4,
        partner: { name: "Phạm Quốc Huy", role: "Gold Land Agency", avatar: "https://randomuser.me/api/portraits/men/71.jpg" },
        property: { title: "Căn hộ Masteri Thảo Điền", image: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=200" },
        commission: "2.5%",
        date: "19/10/2023",
        status: "pending",
    },
    {
        id: 5,
        partner: { name: "Nguyễn Thị Hoa", role: "Môi giới Tự do", avatar: "https://randomuser.me/api/portraits/women/22.jpg" },
        property: { title: "Đất nền Long An", image: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=200" },
        commission: "1.8%",
        date: "17/10/2023",
        status: "accepted",
    },
];

const statusConfig: Record<string, { label: string; className: string }> = {
    pending: { label: "Đang chờ", className: "bg-amber-100 text-amber-700" },
    accepted: { label: "Đã đồng ý", className: "bg-emerald-100 text-emerald-700" },
    rejected: { label: "Đã từ chối", className: "bg-slate-100 text-slate-500" },
};

export default function CollaborationPage() {
    const [activeTab, setActiveTab] = useState<"incoming" | "sent">("incoming");

    const data = activeTab === "incoming" ? incomingRequests : sentRequests;

    return (
        <>
            {/* Page Header */}
            <div className="mb-8">
                <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
                    Quản lý Yêu cầu Hợp tác
                </h1>
                <p className="text-slate-500 mt-1">
                    Quản lý các yêu cầu nhận bán hoặc gửi bán bất động sản từ đối tác trong mạng lưới.
                </p>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-8 border-b border-slate-200 mb-8">
                <button
                    onClick={() => setActiveTab("incoming")}
                    className={`pb-4 text-sm font-bold relative transition-colors ${activeTab === "incoming"
                            ? "text-primary border-b-2 border-primary"
                            : "text-slate-500 hover:text-slate-700"
                        }`}
                >
                    Yêu cầu gửi đến
                    <span className="ml-2 px-2 py-0.5 bg-primary/10 text-primary rounded-full text-[10px]">
                        12
                    </span>
                </button>
                <button
                    onClick={() => setActiveTab("sent")}
                    className={`pb-4 text-sm font-bold transition-colors ${activeTab === "sent"
                            ? "text-primary border-b-2 border-primary"
                            : "text-slate-500 hover:text-slate-700"
                        }`}
                >
                    Yêu cầu đã gửi
                </button>
            </div>

            {/* Table Container */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                {/* Search & Filter Bar */}
                <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                        <div className="relative flex-1 sm:w-64">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
                                search
                            </span>
                            <input
                                className="w-full pl-10 pr-4 py-2 text-xs rounded-lg border border-slate-200 bg-white focus:ring-primary focus:outline-none"
                                placeholder="Tìm theo tên môi giới, BĐS..."
                                type="text"
                            />
                        </div>
                        <button className="p-2 text-slate-500 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                            <span className="material-symbols-outlined text-xl">filter_list</span>
                        </button>
                    </div>
                    <div className="flex gap-2">
                        <select className="text-xs border border-slate-200 bg-white rounded-lg focus:ring-primary px-3 py-2 focus:outline-none">
                            <option>Tất cả trạng thái</option>
                            <option>Đang chờ</option>
                            <option>Đã đồng ý</option>
                            <option>Đã từ chối</option>
                        </select>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                                <th className="px-6 py-4">Môi giới đối tác</th>
                                <th className="px-6 py-4">Bất động sản liên quan</th>
                                <th className="px-6 py-4">Hoa hồng thỏa thuận</th>
                                <th className="px-6 py-4">Ngày gửi</th>
                                <th className="px-6 py-4">Trạng thái</th>
                                <th className="px-6 py-4 text-right">Thao tác</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {data.map((item) => (
                                <tr
                                    key={item.id}
                                    className="hover:bg-slate-50 transition-colors"
                                >
                                    {/* Partner */}
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="w-10 h-10 rounded-full bg-slate-200 shrink-0"
                                                style={{
                                                    backgroundImage: `url('${item.partner.avatar}')`,
                                                    backgroundSize: "cover",
                                                }}
                                            />
                                            <div>
                                                <p className="text-sm font-bold text-slate-900 leading-tight">
                                                    {item.partner.name}
                                                </p>
                                                <p className="text-[11px] text-slate-500 mt-0.5">
                                                    {item.partner.role}
                                                </p>
                                            </div>
                                        </div>
                                    </td>

                                    {/* Property */}
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="w-12 h-10 rounded bg-slate-100 shrink-0 overflow-hidden border border-slate-200"
                                                style={{
                                                    backgroundImage: `url('${item.property.image}')`,
                                                    backgroundSize: "cover",
                                                    backgroundPosition: "center",
                                                }}
                                            />
                                            <p className="text-xs font-semibold text-slate-700 line-clamp-1">
                                                {item.property.title}
                                            </p>
                                        </div>
                                    </td>

                                    {/* Commission */}
                                    <td className="px-6 py-4 text-sm font-bold text-primary">
                                        {item.commission}
                                    </td>

                                    {/* Date */}
                                    <td className="px-6 py-4 text-sm font-medium text-slate-600">
                                        {item.date}
                                    </td>

                                    {/* Status */}
                                    <td className="px-6 py-4">
                                        <span
                                            className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide rounded-full ${statusConfig[item.status].className
                                                }`}
                                        >
                                            {statusConfig[item.status].label}
                                        </span>
                                    </td>

                                    {/* Actions */}
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            {activeTab === "incoming" && item.status === "pending" && (
                                                <>
                                                    <button className="px-3 py-1.5 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary/90 transition-colors">
                                                        Đồng ý
                                                    </button>
                                                    <button className="px-3 py-1.5 border border-slate-200 text-slate-600 text-xs font-bold rounded-lg hover:bg-slate-100 transition-colors">
                                                        Từ chối
                                                    </button>
                                                    <button
                                                        className="p-1.5 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                                                        title="Chat ngay"
                                                    >
                                                        <span className="material-symbols-outlined text-xl">chat</span>
                                                    </button>
                                                </>
                                            )}
                                            {item.status === "accepted" && (
                                                <>
                                                    <button className="flex items-center gap-1.5 px-4 py-1.5 border border-primary text-primary text-xs font-bold rounded-lg hover:bg-primary/5 transition-colors">
                                                        <span className="material-symbols-outlined text-sm">chat</span>
                                                        Chat ngay
                                                    </button>
                                                    <button className="p-1.5 text-slate-400 hover:text-slate-600 transition-colors">
                                                        <span className="material-symbols-outlined text-xl">more_horiz</span>
                                                    </button>
                                                </>
                                            )}
                                            {item.status === "rejected" && (
                                                <>
                                                    <button className="px-3 py-1.5 border border-slate-200 text-slate-400 text-xs font-bold rounded-lg cursor-not-allowed opacity-50">
                                                        {activeTab === "incoming" ? "Đã từ chối" : "Bị từ chối"}
                                                    </button>
                                                    <button className="p-1.5 text-slate-400 hover:text-primary transition-colors">
                                                        <span className="material-symbols-outlined text-xl">history</span>
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="p-6 bg-slate-50 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-slate-500">
                        Hiển thị 1 - {data.length} của {activeTab === "incoming" ? "12" : "5"} yêu cầu
                    </p>
                    <div className="flex gap-2">
                        <button
                            className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 disabled:opacity-50"
                            disabled
                        >
                            <span className="material-symbols-outlined text-lg">chevron_left</span>
                        </button>
                        <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 bg-primary text-white">
                            1
                        </button>
                        <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 hover:bg-white transition-colors">
                            2
                        </button>
                        <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 hover:bg-white transition-colors">
                            <span className="material-symbols-outlined text-lg">chevron_right</span>
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
}
