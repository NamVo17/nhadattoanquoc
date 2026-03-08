"use client";
import { useState } from "react";

const transactions = [
    {
        id: "#TRX-88219",
        icon: "paid",
        iconBg: "bg-emerald-100 text-emerald-600",
        description: "Nhận hoa hồng: Biệt thự Thảo Điền",
        amount: "+15,000,000đ",
        amountClass: "text-emerald-600",
        time: "14:30 - 24/10/2023",
        status: "success",
    },
    {
        id: "#TRX-88154",
        icon: "account_balance_wallet",
        iconBg: "bg-blue-100 text-blue-600",
        description: "Nạp tiền vào ví (Ngân hàng)",
        amount: "+5,000,000đ",
        amountClass: "text-blue-600",
        time: "09:15 - 22/10/2023",
        status: "success",
    },
    {
        id: "#TRX-87992",
        icon: "description",
        iconBg: "bg-red-100 text-red-600",
        description: "Phí duy trì tin đăng VIP",
        amount: "-250,000đ",
        amountClass: "text-red-600",
        time: "18:45 - 20/10/2023",
        status: "success",
    },
    {
        id: "#TRX-87801",
        icon: "history",
        iconBg: "bg-slate-100 text-slate-500",
        description: "Phí đẩy tin tự động",
        amount: "-50,000đ",
        amountClass: "text-red-600",
        time: "08:00 - 19/10/2023",
        status: "pending",
    },
];

export default function WalletPage() {
    const [showTopUp, setShowTopUp] = useState(false);
    const [showWithdraw, setShowWithdraw] = useState(false);
    const [selectedAmount, setSelectedAmount] = useState("");

    const quickAmounts = ["100K", "200K", "500K", "1M", "2M", "5M"];

    return (
        <>
            {/* Page Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
                        Ví tiền &amp; Thanh toán
                    </h1>
                    <p className="text-slate-500 mt-1">
                        Quản lý số dư, nạp tiền và theo dõi lịch sử giao dịch dịch vụ.
                    </p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-slate-50 transition-colors">
                        <span className="material-symbols-outlined text-lg">file_download</span>
                        <span>Xuất sao kê</span>
                    </button>
                </div>
            </div>

            {/* Balance + Stats Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Main Balance Card */}
                <div className="lg:col-span-2 bg-white p-8 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 pointer-events-none" />
                    <div className="relative z-10">
                        <p className="text-slate-500 font-semibold mb-2">Số dư hiện tại</p>
                        <div className="flex items-baseline gap-2">
                            <span className="text-4xl lg:text-5xl font-black text-slate-900">
                                12,500,000
                            </span>
                            <span className="text-xl font-bold text-slate-400 uppercase tracking-wide">
                                VNĐ
                            </span>
                        </div>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 w-full md:w-auto relative z-10">
                        <button
                            onClick={() => setShowTopUp(true)}
                            className="bg-primary text-white px-6 sm:px-7 py-3 sm:py-3.5 rounded-xl font-extrabold text-sm sm:text-base shadow-lg shadow-primary/30 hover:bg-primary/90 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                        >
                            <span className="material-symbols-outlined">add_card</span>
                            Nạp tiền ngay
                        </button>
                        <button
                            onClick={() => setShowWithdraw(true)}
                            className="bg-white border border-slate-200 text-slate-700 px-6 sm:px-7 py-3 sm:py-3.5 rounded-xl font-extrabold text-sm sm:text-base shadow-sm hover:border-primary hover:text-primary hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                        >
                            <span className="material-symbols-outlined">account_balance</span>
                            Rút tiền
                        </button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-rows-2 gap-4">
                    <div className="bg-emerald-50 p-6 rounded-2xl border border-emerald-100">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-1.5 bg-emerald-500 text-white rounded-lg">
                                <span className="material-symbols-outlined text-lg leading-none">
                                    trending_up
                                </span>
                            </div>
                            <p className="text-emerald-700 text-sm font-bold">
                                Tổng hoa hồng nhận (tháng này)
                            </p>
                        </div>
                        <p className="text-2xl font-black text-emerald-800">
                            +45,000,000{" "}
                            <span className="text-sm font-normal opacity-70">đ</span>
                        </p>
                    </div>
                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-1.5 bg-slate-400 text-white rounded-lg">
                                <span className="material-symbols-outlined text-lg leading-none">
                                    account_balance
                                </span>
                            </div>
                            <p className="text-slate-600 text-sm font-bold">
                                Tổng phí dịch vụ đã chi
                            </p>
                        </div>
                        <p className="text-2xl font-black text-slate-900">
                            2,450,000{" "}
                            <span className="text-sm font-normal opacity-50">đ</span>
                        </p>
                    </div>
                </div>
            </div>

            {/* Transactions Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h2 className="text-lg font-bold">Lịch sử giao dịch gần đây</h2>
                        <p className="text-sm text-slate-500">
                            Xem tất cả các biến động số dư trong ví của bạn.
                        </p>
                    </div>
                    <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">
                            filter_list
                        </span>
                        <select className="pl-9 pr-4 py-2 text-xs font-bold border border-slate-200 bg-transparent rounded-lg focus:ring-primary focus:border-primary focus:outline-none appearance-none">
                            <option>Tất cả giao dịch</option>
                            <option>Nạp tiền</option>
                            <option>Trừ phí</option>
                            <option>Nhận hoa hồng</option>
                        </select>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50 text-slate-500 text-xs font-bold uppercase tracking-wider">
                                <th className="px-6 py-4 whitespace-nowrap">Mã giao dịch</th>
                                <th className="px-6 py-4 whitespace-nowrap">Nội dung giao dịch</th>
                                <th className="px-6 py-4 whitespace-nowrap">Số tiền</th>
                                <th className="px-6 py-4 whitespace-nowrap text-center">Thời gian</th>
                                <th className="px-6 py-4 whitespace-nowrap text-center">Trạng thái</th>
                                <th className="px-6 py-4 whitespace-nowrap text-right">Chi tiết</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {transactions.map((txn) => (
                                <tr
                                    key={txn.id}
                                    className="hover:bg-slate-50 transition-colors"
                                >
                                    <td className="px-6 py-4">
                                        <span className="text-sm font-mono text-slate-500 uppercase">
                                            {txn.id}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className={`w-8 h-8 rounded-full ${txn.iconBg} flex items-center justify-center`}
                                            >
                                                <span className="material-symbols-outlined text-lg">
                                                    {txn.icon}
                                                </span>
                                            </div>
                                            <span className="text-sm font-bold text-slate-900">
                                                {txn.description}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`text-sm font-bold ${txn.amountClass}`}>
                                            {txn.amount}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <span className="text-xs text-slate-500">{txn.time}</span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        {txn.status === "success" ? (
                                            <span className="px-2 py-1 text-[10px] font-bold uppercase tracking-wide bg-emerald-100 text-emerald-700 rounded-full">
                                                Thành công
                                            </span>
                                        ) : (
                                            <span className="px-2 py-1 text-[10px] font-bold uppercase tracking-wide bg-amber-100 text-amber-700 rounded-full">
                                                Đang xử lý
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="p-2 text-slate-400 hover:text-primary transition-colors">
                                            <span className="material-symbols-outlined text-xl">
                                                visibility
                                            </span>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                <div className="p-6 bg-slate-50 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-slate-500">
                        Hiển thị 1 - 4 của 156 giao dịch
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
                            3
                        </button>
                        <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200 hover:bg-white transition-colors">
                            <span className="material-symbols-outlined text-lg">chevron_right</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Top-Up Modal */}
            {showTopUp && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-slate-900">Nạp tiền vào ví</h3>
                            <button
                                onClick={() => setShowTopUp(false)}
                                className="p-1 text-slate-400 hover:text-slate-700"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Chọn mệnh giá nhanh
                            </label>
                            <div className="grid grid-cols-3 gap-2">
                                {quickAmounts.map((amount) => (
                                    <button
                                        key={amount}
                                        onClick={() => setSelectedAmount(amount)}
                                        className={`py-2.5 rounded-xl border text-sm font-bold transition-colors ${selectedAmount === amount
                                            ? "border-primary bg-primary/10 text-primary"
                                            : "border-slate-200 hover:border-primary hover:text-primary"
                                            }`}
                                    >
                                        {amount}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="mb-6">
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Hoặc nhập số tiền
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    placeholder="Nhập số tiền..."
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-primary focus:outline-none focus:border-primary"
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">
                                    VNĐ
                                </span>
                            </div>
                        </div>
                        <div className="mb-6">
                            <label className="block text-sm font-semibold text-slate-700 mb-2">
                                Phương thức thanh toán
                            </label>
                            <div className="space-y-2">
                                {["Thẻ ngân hàng / ATM", "Ví MoMo", "Chuyển khoản ngân hàng"].map(
                                    (method) => (
                                        <label
                                            key={method}
                                            className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 cursor-pointer hover:border-primary transition-colors"
                                        >
                                            <input
                                                type="radio"
                                                name="payment"
                                                className="text-primary"
                                            />
                                            <span className="text-sm font-medium">{method}</span>
                                        </label>
                                    )
                                )}
                            </div>
                        </div>
                        <button className="w-full bg-primary text-white py-3 rounded-xl font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all">
                            Nạp tiền ngay
                        </button>
                    </div>
                </div>
            )}

            {/* Withdraw Modal */}
            {showWithdraw && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-lg font-bold text-slate-900">Rút tiền về tài khoản</h3>
                            <button
                                onClick={() => setShowWithdraw(false)}
                                className="p-1 text-slate-400 hover:text-slate-700"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>
                        <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 mb-6">
                            <p className="text-xs font-bold text-emerald-700 mb-1">Số dư khả dụng</p>
                            <p className="text-2xl font-black text-emerald-800">12,500,000 <span className="text-sm font-normal">VNĐ</span></p>
                        </div>
                        <div className="mb-4">
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Số tiền muốn rút</label>
                            <div className="relative">
                                <input
                                    type="number"
                                    placeholder="Nhập số tiền cần rút..."
                                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-primary focus:outline-none focus:border-primary"
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-bold">VNĐ</span>
                            </div>
                        </div>
                        <div className="mb-6">
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Tài khoản ngân hàng nhận tiền</label>
                            <div className="space-y-2">
                                {["Vietcombank - 0123456789 - Nguyễn Văn A", "Techcombank - 9876543210 - Nguyễn Văn A"].map((bank) => (
                                    <label key={bank} className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 cursor-pointer hover:border-primary transition-colors">
                                        <input type="radio" name="bank" className="text-primary" />
                                        <span className="text-sm font-medium">{bank}</span>
                                    </label>
                                ))}
                            </div>
                        </div>
                        <div className="p-3 bg-amber-50 border border-amber-100 rounded-xl mb-4 flex gap-2">
                            <span className="material-symbols-outlined text-amber-500 text-sm mt-0.5">info</span>
                            <p className="text-xs text-amber-700">Thời gian xử lý: 1-3 ngày làm việc. Phí rút tiền: 0đ.</p>
                        </div>
                        <button className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold shadow-lg hover:bg-slate-800 transition-all flex items-center justify-center gap-2">
                            <span className="material-symbols-outlined text-lg">account_balance</span>
                            Xác nhận rút tiền
                        </button>
                    </div>
                </div>
            )}
        </>
    );
}
