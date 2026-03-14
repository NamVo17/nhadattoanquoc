"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { authorizedFetch } from "@/lib/authorizedFetch";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

// ── Constants ─────────────────────────────────────────
const PACKAGES = {
  vip: {
    name: "Gói VIP",
    price: 50000,
    priceLabel: "50.000đ",
    duration: 7,
    color: "from-yellow-500 to-amber-600",
    badge: "bg-yellow-100 text-yellow-800 border-yellow-300",
    icon: "auto_awesome",
    features: ["Tự động đẩy tin lên đầu mỗi ngày", "Huy hiệu VIP nổi bật", "Ưu tiên trong kết quả tìm kiếm"],
  },
  diamond: {
    name: "Gói Kim Cương",
    price: 150000,
    priceLabel: "150.000đ",
    duration: 30,
    color: "from-indigo-500 to-purple-700",
    badge: "bg-indigo-100 text-indigo-800 border-indigo-300",
    icon: "diamond",
    features: ["Xuất hiện trang chủ chuyên mục", "Ảnh đại diện lớn gấp 2x", "Hỗ trợ quảng cáo Facebook & Google"],
  },
};

const BANK_INFO = {
  bankCode: "VCB",
  bankName: "Vietcombank",
  accountNumber: "1014787499",
  accountName: "VO CONG NAM",
};

const METHODS = [
  {
    key: "bank",
    label: "Chuyển khoản Bank",
    shortLabel: "Ngân hàng",
    icon: "account_balance",
    color: "green",
    desc: "Vietcombank · Tức thì",
  },
  {
    key: "momo",
    label: "Ví MoMo",
    icon: "phone_iphone",
    color: "pink",
    desc: "MoMo · 0979 123 456",
  },
  {
    key: "zalopay",
    label: "ZaloPay",
    icon: "payments",
    color: "blue",
    desc: "ZaloPay · 0979 123 456",
  },
];

// ── Helpers ──────────────────────────────────────────
function formatCurrency(n: number) {
  return n.toLocaleString("vi-VN") + "đ";
}

// VietQR auto-generate URL
function getQRUrl(amount: number, description: string) {
  const desc = encodeURIComponent(description);
  return `https://img.vietqr.io/image/${BANK_INFO.bankCode}-${BANK_INFO.accountNumber}-compact2.jpg?amount=${amount}&addInfo=${desc}&accountName=${encodeURIComponent(BANK_INFO.accountName)}`;
}

// ── Main Page ─────────────────────────────────────────
export default function PaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const propertyId = searchParams.get("propertyId") || "";
  const packageType = (searchParams.get("package") || "vip") as "vip" | "diamond";
  const propertyTitle = searchParams.get("title") || "Tin đăng bất động sản";

  const pkg = PACKAGES[packageType] || PACKAGES.vip;

  const [method, setMethod] = useState<"bank" | "momo" | "zalopay">("bank");
  const [transactionRef, setTransactionRef] = useState("");
  const [proofFile, setProofFile] = useState<File | null>(null);
  const [proofPreview, setProofPreview] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  // 15-minute countdown
  const [timeLeft, setTimeLeft] = useState(15 * 60);
  useEffect(() => {
    if (submitted) return;
    const t = setInterval(() => setTimeLeft((x) => Math.max(0, x - 1)), 1000);
    return () => clearInterval(t);
  }, [submitted]);

  const minutes = String(Math.floor(timeLeft / 60)).padStart(2, "0");
  const seconds = String(timeLeft % 60).padStart(2, "0");
  const transferNote = `NDTQ ${propertyId.slice(-8).toUpperCase()} ${packageType.toUpperCase()}`;

  const handleProofChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setProofFile(file);
    setProofPreview(URL.createObjectURL(file));
  };

  const handleSubmit = useCallback(async () => {
    if (!propertyId) {
      setError("Không tìm thấy thông tin tin đăng. Vui lòng thử lại.");
      return;
    }
    setIsSubmitting(true);
    setError("");
    try {
      // Upload proof image if provided
      let proofImageUrl = "";
      if (proofFile) {
        const formData = new FormData();
        formData.append("proof", proofFile);
        // We'll update proof after getting payment ID
      }

      // Confirm payment submission (property already created before redirect)
      const res = await authorizedFetch(`${API_URL}/payments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          propertyId,
          paymentMethod: method,
          transactionRef: transactionRef.trim() || null,
          proofImageUrl: proofImageUrl || null,
        }),
      });

      const data = await res.json() as { success: boolean; message?: string; data?: { payment?: { id: string } } };

      if (!res.ok || !data.success) {
        throw new Error(data.message || "Gửi xác nhận thất bại. Vui lòng thử lại.");
      }

      // Upload proof if we have it and got a payment ID
      if (proofFile && data.data?.payment?.id) {
        const formData = new FormData();
        formData.append("proof", proofFile);
        await authorizedFetch(`${API_URL}/payments/${data.data.payment.id}/proof`, {
          method: "POST",
          body: formData,
        });
      }

      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra.");
    } finally {
      setIsSubmitting(false);
    }
  }, [propertyId, method, transactionRef, proofFile]);

  // ── Success State ──────────────────────────────────
  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950">
        <Header />
        <main className="flex-1 flex items-center justify-center px-4 py-16">
          <div className="max-w-lg w-full text-center space-y-6">
            <div className="mx-auto w-24 h-24 bg-green-500/20 rounded-full flex items-center justify-center border-2 border-green-400 shadow-lg shadow-green-500/30 animate-pulse">
              <span className="material-symbols-outlined text-5xl text-green-400">task_alt</span>
            </div>
            <div>
              <h1 className="text-3xl font-extrabold text-white mb-3">Gửi xác nhận thành công!</h1>
              <p className="text-slate-300 leading-relaxed">
                Chúng tôi đã nhận được thông tin thanh toán của bạn. Admin sẽ xác nhận trong vòng <span className="text-green-400 font-semibold">1–4 giờ làm việc</span>. Tin đăng sẽ xuất hiện ngay sau khi được duyệt.
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-5 border border-white/20 text-left space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Gói đăng tin</span>
                <span className="text-white font-bold">{pkg.name}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Số tiền</span>
                <span className="text-green-400 font-bold">{pkg.priceLabel}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Phương thức</span>
                <span className="text-white font-semibold capitalize">{method === "bank" ? "Chuyển khoản ngân hàng" : method === "momo" ? "MoMo" : "ZaloPay"}</span>
              </div>
              {transactionRef && (
                <div className="flex justify-between text-sm">
                  <span className="text-slate-400">Mã giao dịch</span>
                  <span className="text-white font-mono">{transactionRef}</span>
                </div>
              )}
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/dashboard" className="px-6 py-3 bg-primary text-white rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg">
                Xem tin của tôi
              </Link>
              <Link href="/properties" className="px-6 py-3 bg-white/10 text-white rounded-xl font-bold hover:bg-white/20 transition-all border border-white/20">
                Về trang BĐS
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  // ── Main Payment UI ────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950">
      <Header />
      <main className="flex-1 py-10 px-4">
        <div className="max-w-4xl mx-auto">

          {/* Breadcrumb */}
          <div className="flex items-center gap-2 mb-6">
            <Link href="/" className="text-slate-400 text-sm hover:text-white transition-colors">Trang chủ</Link>
            <span className="text-slate-600 text-sm">/</span>
            <Link href="/post" className="text-slate-400 text-sm hover:text-white transition-colors">Đăng tin</Link>
            <span className="text-slate-600 text-sm">/</span>
            <span className="text-white text-sm font-medium">Thanh toán</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

            {/* ── Left: Payment Form ─────────────────── */}
            <div className="lg:col-span-3 space-y-5">
              <div>
                <h1 className="text-3xl font-extrabold text-white mb-1">Xác nhận thanh toán</h1>
                <p className="text-slate-400 text-sm">Hoàn tất thanh toán để tin đăng của bạn được kích hoạt.</p>
              </div>

              {/* Countdown */}
              {timeLeft > 0 && (
                <div className="flex items-center gap-3 bg-amber-500/10 border border-amber-500/30 rounded-xl px-4 py-3">
                  <span className="material-symbols-outlined text-amber-400">timer</span>
                  <p className="text-amber-300 text-sm font-medium">
                    Vui lòng hoàn tất trong: <span className="font-mono text-amber-200 text-lg font-bold">{minutes}:{seconds}</span>
                  </p>
                </div>
              )}

              {/* Method Selector */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5">
                <h2 className="text-white font-bold text-base mb-4 flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">credit_card</span>
                  Chọn phương thức thanh toán
                </h2>
                <div className="grid grid-cols-3 gap-3">
                  {METHODS.map((m) => (
                    <button
                      key={m.key}
                      onClick={() => setMethod(m.key as "bank" | "momo" | "zalopay")}
                      className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all text-center ${
                        method === m.key
                          ? "border-primary bg-primary/10 shadow-lg shadow-primary/20"
                          : "border-white/10 bg-white/5 hover:border-white/30"
                      }`}
                    >
                      <span className={`material-symbols-outlined text-2xl ${method === m.key ? "text-primary" : "text-slate-400"}`}>
                        {m.icon}
                      </span>
                      <span className={`text-xs font-bold leading-tight ${method === m.key ? "text-white" : "text-slate-400"}`}>
                        {m.shortLabel || m.label}
                      </span>
                      <span className="text-[10px] text-slate-500">{m.desc}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Bank Transfer Details */}
              {method === "bank" && (
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5 space-y-4">
                  <h2 className="text-white font-bold text-base flex items-center gap-2">
                    <span className="material-symbols-outlined text-green-400">account_balance</span>
                    Thông tin chuyển khoản
                  </h2>
                  <div className="flex flex-col md:flex-row gap-5">
                    {/* QR Code */}
                    <div className="flex-shrink-0 flex flex-col items-center gap-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={getQRUrl(pkg.price, transferNote)}
                        alt="QR chuyển khoản"
                        className="w-40 h-40 rounded-xl border-4 border-white/20 object-contain bg-white p-1"
                      />
                      <span className="text-xs text-slate-400">Quét QR để chuyển khoản</span>
                    </div>
                    {/* Account Details */}
                    <div className="flex-1 space-y-3">
                      {[
                        { label: "Ngân hàng", value: "Vietcombank (VCB)", copy: false },
                        { label: "Chủ tài khoản", value: BANK_INFO.accountName, copy: false },
                        { label: "Số tài khoản", value: BANK_INFO.accountNumber, copy: true },
                        { label: "Số tiền", value: formatCurrency(pkg.price), copy: true },
                        { label: "Nội dung CK", value: transferNote, copy: true },
                      ].map(({ label, value, copy }) => (
                        <div key={label} className="flex items-center justify-between bg-white/5 rounded-lg px-4 py-2.5">
                          <div>
                            <p className="text-slate-400 text-xs">{label}</p>
                            <p className={`text-white font-mono font-bold text-sm mt-0.5 ${label === "Nội dung CK" ? "text-amber-300" : ""}`}>{value}</p>
                          </div>
                          {copy && (
                            <button
                              onClick={() => navigator.clipboard.writeText(value)}
                              className="ml-3 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all flex-shrink-0"
                              title="Sao chép"
                            >
                              <span className="material-symbols-outlined text-sm">content_copy</span>
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 flex gap-2">
                    <span className="material-symbols-outlined text-amber-400 text-sm flex-shrink-0 mt-0.5">warning</span>
                    <p className="text-amber-200 text-xs leading-relaxed">
                      <strong>Quan trọng:</strong> Nhập đúng nội dung chuyển khoản <strong className="text-amber-300 font-mono">{transferNote}</strong> để admin xác nhận tự động. Sau khi chuyển khoản, vui lòng nhập mã giao dịch bên dưới và nhấn &ldquo;Gửi xác nhận&rdquo;.
                    </p>
                  </div>
                </div>
              )}

              {/* MoMo */}
              {method === "momo" && (
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5 space-y-4">
                  <h2 className="text-white font-bold text-base flex items-center gap-2">
                    <span className="material-symbols-outlined text-pink-400">phone_iphone</span>
                    Thanh toán qua MoMo
                  </h2>
                  <div className="flex flex-col md:flex-row gap-5 items-start">
                    <div className="w-36 h-36 bg-pink-500/10 rounded-xl border-2 border-pink-400/30 flex flex-col items-center justify-center text-pink-400 flex-shrink-0">
                      <span className="material-symbols-outlined text-5xl">phone_iphone</span>
                      <span className="text-xs mt-1 font-bold">MoMo</span>
                    </div>
                    <div className="flex-1 space-y-3">
                      {[
                        { label: "Số điện thoại MoMo", value: "0979 123 456" },
                        { label: "Tên người nhận", value: BANK_INFO.accountName },
                        { label: "Số tiền", value: formatCurrency(pkg.price) },
                        { label: "Lời nhắn", value: transferNote },
                      ].map(({ label, value }) => (
                        <div key={label} className="flex items-center justify-between bg-white/5 rounded-lg px-4 py-2.5">
                          <div>
                            <p className="text-slate-400 text-xs">{label}</p>
                            <p className="text-white font-mono font-bold text-sm mt-0.5">{value}</p>
                          </div>
                          <button onClick={() => navigator.clipboard.writeText(value)} className="ml-3 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all">
                            <span className="material-symbols-outlined text-sm">content_copy</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ZaloPay */}
              {method === "zalopay" && (
                <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5 space-y-4">
                  <h2 className="text-white font-bold text-base flex items-center gap-2">
                    <span className="material-symbols-outlined text-blue-400">payments</span>
                    Thanh toán qua ZaloPay
                  </h2>
                  <div className="flex flex-col md:flex-row gap-5 items-start">
                    <div className="w-36 h-36 bg-blue-500/10 rounded-xl border-2 border-blue-400/30 flex flex-col items-center justify-center text-blue-400 flex-shrink-0">
                      <span className="material-symbols-outlined text-5xl">payments</span>
                      <span className="text-xs mt-1 font-bold">ZaloPay</span>
                    </div>
                    <div className="flex-1 space-y-3">
                      {[
                        { label: "Số điện thoại ZaloPay", value: "0979 123 456" },
                        { label: "Tên người nhận", value: BANK_INFO.accountName },
                        { label: "Số tiền", value: formatCurrency(pkg.price) },
                        { label: "Lời nhắn", value: transferNote },
                      ].map(({ label, value }) => (
                        <div key={label} className="flex items-center justify-between bg-white/5 rounded-lg px-4 py-2.5">
                          <div>
                            <p className="text-slate-400 text-xs">{label}</p>
                            <p className="text-white font-mono font-bold text-sm mt-0.5">{value}</p>
                          </div>
                          <button onClick={() => navigator.clipboard.writeText(value)} className="ml-3 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-all">
                            <span className="material-symbols-outlined text-sm">content_copy</span>
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Confirmation Form */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5 space-y-4">
                <h2 className="text-white font-bold text-base flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">receipt_long</span>
                  Xác nhận đã chuyển khoản
                </h2>

                {/* Transaction Ref */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">
                    Mã giao dịch / Transaction ID
                    <span className="text-slate-500 ml-1 text-xs">(không bắt buộc)</span>
                  </label>
                  <input
                    type="text"
                    className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-primary font-mono text-sm transition-all"
                    placeholder="VD: 24031300123456 hoặc mã tham chiếu từ app"
                    value={transactionRef}
                    onChange={(e) => setTransactionRef(e.target.value)}
                  />
                </div>

                {/* Proof Upload */}
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-1.5">
                    Ảnh chụp màn hình chuyển khoản
                    <span className="text-slate-500 ml-1 text-xs">(khuyến khích)</span>
                  </label>
                  <div className="relative">
                    {proofPreview ? (
                      <div className="relative rounded-xl overflow-hidden border-2 border-white/20">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={proofPreview} alt="Proof" className="w-full max-h-60 object-contain bg-black/20" />
                        <button
                          onClick={() => { setProofFile(null); setProofPreview(""); }}
                          className="absolute top-2 right-2 bg-red-500/80 text-white rounded-full p-1 hover:bg-red-600 transition-all"
                        >
                          <span className="material-symbols-outlined text-sm">close</span>
                        </button>
                      </div>
                    ) : (
                      <label className="flex flex-col items-center gap-2 border-2 border-dashed border-white/20 rounded-xl py-8 cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all">
                        <span className="material-symbols-outlined text-3xl text-slate-500">cloud_upload</span>
                        <span className="text-slate-400 text-sm">Click hoặc kéo ảnh vào đây</span>
                        <span className="text-slate-600 text-xs">JPG, PNG – Tối đa 5MB</span>
                        <input type="file" accept="image/*" className="hidden" onChange={handleProofChange} />
                      </label>
                    )}
                  </div>
                </div>

                {/* Error */}
                {error && (
                  <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
                    <span className="material-symbols-outlined text-red-400 text-sm">error</span>
                    <p className="text-red-300 text-sm">{error}</p>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="w-full py-4 rounded-xl font-extrabold text-lg text-white bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-700 transition-all shadow-xl shadow-primary/30 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Đang gửi xác nhận...
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined">send</span>
                      Gửi xác nhận thanh toán
                    </>
                  )}
                </button>
                <p className="text-slate-500 text-xs text-center leading-relaxed">
                  🔒 Thông tin thanh toán được mã hóa và bảo mật. Tin đăng sẽ được duyệt sau khi admin xác nhận.
                </p>
              </div>
            </div>

            {/* ── Right: Order Summary ───────────────── */}
            <div className="lg:col-span-2 space-y-5">
              {/* Package Card */}
              <div className={`bg-gradient-to-br ${pkg.color} rounded-2xl p-5 shadow-xl`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <span className="material-symbols-outlined text-white text-2xl">{pkg.icon}</span>
                  </div>
                  <div>
                    <h2 className="text-white font-extrabold text-lg">{pkg.name}</h2>
                    <p className="text-white/70 text-xs">{pkg.duration} ngày hiển thị</p>
                  </div>
                </div>
                <ul className="space-y-2 mb-4">
                  {pkg.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-white/90 text-sm">
                      <span className="material-symbols-outlined text-white text-base flex-shrink-0">check_circle</span>
                      {f}
                    </li>
                  ))}
                </ul>
                <div className="border-t border-white/20 pt-4 flex items-end justify-between">
                  <span className="text-white/70 text-sm">Tổng thanh toán</span>
                  <span className="text-white text-3xl font-black">{pkg.priceLabel}</span>
                </div>
              </div>

              {/* Property Info */}
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-5 space-y-3">
                <h3 className="text-white font-bold text-sm flex items-center gap-2">
                  <span className="material-symbols-outlined text-slate-400 text-base">home</span>
                  Thông tin tin đăng
                </h3>
                <p className="text-slate-300 text-sm font-medium leading-relaxed">{propertyTitle}</p>
                <div className="text-xs text-slate-500 font-mono border-t border-white/10 pt-3">
                  ID: {propertyId || "Chưa tạo"}
                </div>
              </div>

              {/* Security Notice */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 space-y-3">
                <h3 className="text-white font-bold text-sm flex items-center gap-2">
                  <span className="material-symbols-outlined text-green-400 text-base">security</span>
                  Cam kết bảo mật
                </h3>
                {[
                  "Thông tin không chia sẻ với bên thứ ba",
                  "Admin xác nhận trong 1–4 giờ làm việc",
                  "Hoàn tiền nếu không duyệt trong 24h",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-2">
                    <span className="material-symbols-outlined text-green-400 text-sm flex-shrink-0 mt-0.5">shield</span>
                    <span className="text-slate-400 text-xs">{item}</span>
                  </div>
                ))}
              </div>

              {/* Help */}
              <div className="text-center">
                <p className="text-slate-500 text-xs">Cần hỗ trợ?</p>
                <a href="tel:0979123456" className="text-primary text-sm font-bold hover:text-primary/80 transition-colors">
                  📞 0979 123 456
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
