"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

const properties = [
    {
        id: "#12345",
        title: "Biệt thự Thảo Điền - 400m2 Sân vườn",
        location: "Quận 2, TP.HCM",
        image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=400",
        status: "active",
        date: "12/10/2023",
        views: 1420,
        requests: 24,
    },
    {
        id: "#12346",
        title: "Căn hộ Vinhomes Grand Park - Tầng cao",
        location: "Quận 9, TP.HCM",
        image: "https://images.unsplash.com/photo-1512917774080-9b274b3f59c7?w=400",
        status: "pending",
        date: "15/10/2023",
        views: 452,
        requests: 0,
    },
    {
        id: "#12347",
        title: "Nhà phố Thủ Đức - Hẻm xe hơi",
        location: "Thủ Đức, TP.HCM",
        image: "https://images.unsplash.com/photo-1565693566231-b5a15ebc4d2b?w=400",
        status: "rejected",
        date: "01/10/2023",
        views: 12,
        requests: 0,
    },
    {
        id: "#12348",
        title: "Nhà phố Quận 2 - Mặt tiền đường lớn",
        location: "Quận 2, TP.HCM",
        image: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=400",
        status: "expired",
        date: "01/08/2023",
        views: 580,
        requests: 5,
    },
];

const statusConfig: Record<string, { label: string; className: string }> = {
    active: { label: "Đang hiển thị", className: "bg-emerald-100 text-emerald-700" },
    pending: { label: "Chờ duyệt", className: "bg-amber-100 text-amber-700" },
    rejected: { label: "Bị từ chối", className: "bg-red-100 text-red-700" },
    expired: { label: "Đã hết hạn", className: "bg-slate-100 text-slate-500" },
};

const tabs = [
    { key: "all", label: "Tất cả", count: 1284 },
    { key: "active", label: "Đang hiển thị", count: 856 },
    { key: "pending", label: "Chờ duyệt", count: 12 },
    { key: "rejected", label: "Bị từ chối", count: 5 },
    { key: "expired", label: "Đã hết hạn", count: 411 },
];

export default function PropertiesPage() {
    const [activeTab, setActiveTab] = useState("all");
    const router = useRouter();

    const filteredProperties =
        activeTab === "all"
            ? properties
            : properties.filter((p) => p.status === activeTab);

    return (
        <>
            {/* Page Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
                        Tin đăng của tôi
                    </h1>
                    <p className="text-slate-500 mt-1">
                        Tổng cộng 1,284 tin đăng trong hệ thống.
                    </p>
                </div>
                <button
                    onClick={() => router.push('/post')}
                    className="flex items-center gap-2 bg-primary text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all"
                >
                    <span className="material-symbols-outlined text-lg">add</span>
                    <span>Đăng tin mới</span>
                </button>
            </div>

            {/* Tabs */}
            <div className="border-b border-slate-200 mb-6 overflow-x-auto">
                <div className="flex gap-8 min-w-max">
                    {tabs.map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setActiveTab(tab.key)}
                            className={`pb-4 text-sm font-bold transition-colors ${activeTab === tab.key
                                ? "border-b-2 border-primary text-primary"
                                : "text-slate-500 hover:text-primary"
                                }`}
                        >
                            {tab.label} ({tab.count.toLocaleString()})
                        </button>
                    ))}
                </div>
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
                        home
                    </span>
                    <select className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:ring-primary focus:outline-none">
                        <option>Tất cả loại hình</option>
                        <option>Căn hộ</option>
                        <option>Nhà phố</option>
                        <option>Đất nền</option>
                        <option>Biệt thự</option>
                    </select>
                </div>
                <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
                        location_on
                    </span>
                    <select className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:ring-primary focus:outline-none">
                        <option>Tất cả khu vực</option>
                        <option>Quận 1</option>
                        <option>Quận 2</option>
                        <option>Quận 7</option>
                        <option>Quận 9</option>
                        <option>Thủ Đức</option>
                    </select>
                </div>
                <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">
                        payments
                    </span>
                    <select className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-white text-sm focus:ring-primary focus:outline-none">
                        <option>Mức giá (Tất cả)</option>
                        <option>Dưới 2 tỷ</option>
                        <option>2 - 5 tỷ</option>
                        <option>5 - 10 tỷ</option>
                        <option>Trên 10 tỷ</option>
                    </select>
                </div>
                <button className="flex items-center justify-center gap-2 bg-white border border-slate-200 px-4 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-50 transition-colors">
                    <span className="material-symbols-outlined text-lg">filter_alt</span>
                    <span>Bộ lọc nâng cao</span>
                </button>
            </div>

            {/* Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mb-8">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                                <th className="px-6 py-4">Hình ảnh &amp; Tiêu đề</th>
                                <th className="px-6 py-4">Trạng thái</th>
                                <th className="px-6 py-4">Ngày đăng</th>
                                <th className="px-6 py-4 text-center">Lượt xem</th>
                                <th className="px-6 py-4 text-center">Yêu cầu HT</th>
                                <th className="px-6 py-4 text-right">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredProperties.map((property) => (
                                <tr
                                    key={property.id}
                                    className="hover:bg-slate-50 transition-colors"
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-4">
                                            <div
                                                className="w-20 h-16 rounded-lg bg-slate-100 shrink-0 overflow-hidden border border-slate-200"
                                                style={{
                                                    backgroundImage: `url('${property.image}')`,
                                                    backgroundSize: "cover",
                                                    backgroundPosition: "center",
                                                }}
                                            />
                                            <div>
                                                <a
                                                    className="text-sm font-bold text-slate-900 line-clamp-1 hover:text-primary transition-colors"
                                                    href="#"
                                                >
                                                    {property.title}
                                                </a>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-xs text-slate-400">
                                                        ID: {property.id}
                                                    </span>
                                                    <span className="w-1 h-1 rounded-full bg-slate-300" />
                                                    <span className="text-xs text-slate-400">
                                                        {property.location}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span
                                            className={`px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide rounded-full ${statusConfig[property.status].className
                                                }`}
                                        >
                                            {statusConfig[property.status].label}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm font-medium">
                                        {property.date}
                                    </td>
                                    <td className="px-6 py-4 text-center text-sm font-bold">
                                        {property.views.toLocaleString()}
                                    </td>
                                    <td className="px-6 py-4 text-center text-sm font-bold text-primary">
                                        {property.requests}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-1">
                                            {property.status === "rejected" && (
                                                <button
                                                    className="p-2 text-slate-400 hover:text-primary transition-colors"
                                                    title="Xem lý do"
                                                >
                                                    <span className="material-symbols-outlined text-xl">info</span>
                                                </button>
                                            )}
                                            {property.status === "expired" ? (
                                                <button
                                                    className="p-2 text-slate-400 hover:text-orange-500 transition-colors"
                                                    title="Gia hạn"
                                                >
                                                    <span className="material-symbols-outlined text-xl">refresh</span>
                                                </button>
                                            ) : (
                                                <>
                                                    <button
                                                        className="p-2 text-slate-400 hover:text-primary transition-colors"
                                                        title="Sửa"
                                                    >
                                                        <span className="material-symbols-outlined text-xl">edit</span>
                                                    </button>
                                                    {property.status === "active" && (
                                                        <>
                                                            <button
                                                                className="p-2 text-slate-400 hover:text-orange-500 transition-colors"
                                                                title="Đẩy tin"
                                                            >
                                                                <span className="material-symbols-outlined text-xl">bolt</span>
                                                            </button>
                                                            <button
                                                                className="p-2 text-slate-400 hover:text-slate-900 transition-colors"
                                                                title="Ẩn tin"
                                                            >
                                                                <span className="material-symbols-outlined text-xl">visibility_off</span>
                                                            </button>
                                                        </>
                                                    )}
                                                </>
                                            )}
                                            <button
                                                className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                                                title="Xóa"
                                            >
                                                <span className="material-symbols-outlined text-xl">delete</span>
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="p-6 bg-slate-50 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-slate-500">
                    <div className="flex items-center gap-2">
                        <span>Hiển thị</span>
                        <select className="bg-transparent border border-slate-200 rounded-lg py-1 text-xs px-2">
                            <option>10</option>
                            <option>20</option>
                            <option>50</option>
                        </select>
                        <span>kết quả mỗi trang</span>
                    </div>
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
                            3
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
