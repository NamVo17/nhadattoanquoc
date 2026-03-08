"use client";

import { useSearchParams } from "next/navigation";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export default function PaymentPage() {
  const searchParams = useSearchParams();
  const packageType = searchParams.get("package") || "free";
  const title = searchParams.get("title") || "Tin đăng bất động sản";

  const packageLabel =
    packageType === "vip" ? "Gói VIP" : packageType === "diamond" ? "Gói Kim Cương" : "Gói Thường";

  return (
    <div className="min-h-screen flex flex-col bg-[#f6f6f8]">
      <Header />
      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="max-w-xl w-full bg-white rounded-2xl shadow-xl border border-slate-200 p-8 space-y-6">
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-extrabold text-slate-900">Thanh toán gói tin</h1>
            <p className="text-sm text-slate-500">
              Bạn đang chọn <span className="font-bold text-primary">{packageLabel}</span> cho tin:{" "}
              <span className="font-semibold text-slate-800">{title}</span>
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
              Chọn phương thức thanh toán
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { key: "momo", label: "MoMo", color: "bg-pink-100 text-pink-600" },
                { key: "zalopay", label: "ZaloPay", color: "bg-sky-100 text-sky-600" },
                { key: "vnpay", label: "VNPay", color: "bg-blue-100 text-blue-600" },
              ].map((m) => (
                <button
                  key={m.key}
                  type="button"
                  className={`flex flex-col items-center justify-center gap-1 rounded-xl border border-slate-200 py-4 font-bold text-sm ${m.color}`}
                >
                  <span className="material-symbols-outlined">payments</span>
                  <span>{m.label}</span>
                  <span className="text-[10px] font-medium text-slate-500">
                    (Demo – chưa kết nối cổng thật)
                  </span>
                </button>
              ))}
            </div>
          </div>

          <p className="text-xs text-slate-400 text-center">
            Đây là màn hình demo để minh họa luồng thanh toán (MoMo, ZaloPay, VNPay). Khi tích hợp
            thật, hệ thống sẽ tạo giao dịch, chuyển hướng sang cổng thanh toán và kích hoạt gói tin
            sau khi thanh toán thành công.
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
}

