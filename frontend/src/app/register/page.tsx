"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

const STEPS = [
  { num: 1, label: "Thông tin" },
  { num: 2, label: "Bảo mật" },
  { num: 3, label: "Vai trò" },
];

const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
const isValidPhone = (v: string) => /^(0|\+84)[0-9]{9}$/.test(v.replace(/\s/g, ""));

// ─── Shared data types ────────────────────────────────────────────────────────
interface FormData {
  fullName: string;
  email: string;
  phone: string;
  agreed: boolean;
  password: string;
  confirm: string;
  twoFA: string;
  role: string;
  referralCode: string;
}

// ─── Left Panel ───────────────────────────────────────────────────────────────
function LeftPanel({ step }: { step: number }) {
  const features =
    step === 2
      ? [
        { icon: "verified_user", title: "Bảo mật đa tầng", sub: "Dữ liệu được mã hóa chuẩn quốc tế" },
        { icon: "shield_lock", title: "An toàn giao dịch", sub: "Xác thực 2 lớp cho mọi tài khoản" },
      ]
      : [
        { icon: "verified_user", title: "Bảo mật đa tầng", sub: "Dữ liệu được mã hóa chuẩn quốc tế" },
        { icon: "payments", title: "Hoa hồng hấp dẫn", sub: "Chi trả nhanh chóng, minh bạch" },
      ];
  return (
    <div className="hidden md:flex md:w-5/12 bg-[#135bec] p-12 flex-col justify-between relative overflow-hidden">
      <div className="absolute inset-0 opacity-10 pointer-events-none">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img alt="" className="w-full h-full object-cover"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuCVkwPEvoUKrL52xtPLKuZyLSx4KRRFeY0KuQ-6F2jAYopUpv0jRH-aqyJCBbxwWoR1Rb7YinZQzAvqJI-Upbo_nf_FPoIaimXqpMrxyn35fHTHXn493GLbjIy03Tnr4pt4dcjFKwRIbakrYagtICJkkcJVOrZQUdOul9VHKBXZUpINviCFG2cm24Ja9FgWfnNAH9Cq8UaByKwWBRN5BeKY4EGFjvkif7AoZh6nkvzjb31iaGXEznWgnSIYCO7S1GO-1BjDZFyQkXGb"
        />
      </div>
      <div className="relative z-10">
        <div className="flex items-center gap-2 text-white mb-12">
          <span className="material-symbols-outlined text-4xl font-bold">home</span>
          <h2 className="text-2xl font-extrabold tracking-tight">NhàĐấtToànQuốc</h2>
        </div>
        <h1 className="text-4xl font-black text-white leading-tight mb-6">
          Nền tảng dành cho Môi giới chuyên nghiệp
        </h1>
        <p className="text-blue-100 text-lg">
          Gia nhập mạng lưới hơn 8,500 môi giới, tiếp cận nguồn hàng độc quyền và quản lý hoa hồng minh bạch.
        </p>
      </div>
      <div className="relative z-10">
        <div className="flex flex-col gap-6">
          {features.map((f) => (
            <div key={f.icon} className="flex items-center gap-4 text-white">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <span className="material-symbols-outlined">{f.icon}</span>
              </div>
              <div>
                <p className="font-bold">{f.title}</p>
                <p className="text-sm text-blue-100">{f.sub}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-12 pt-8 border-t border-white/20 text-blue-100 text-sm">
          © 2024 NhàĐấtToànQuốc. Mọi quyền được bảo lưu.
        </div>
      </div>
    </div>
  );
}

// ─── Step Indicator ───────────────────────────────────────────────────────────
function StepIndicator({ current }: { current: number }) {
  return (
    <div className="flex items-center justify-between mb-10 relative">
      <div className="absolute top-5 left-0 w-full h-0.5 bg-slate-100 z-0" />
      {current === 3 && <div className="absolute top-5 left-0 w-full h-0.5 bg-[#135bec] z-0" />}
      {STEPS.map((step) => {
        const done = step.num < current;
        const active = step.num === current;
        return (
          <div key={step.num} className="relative z-10 flex flex-col items-center gap-2">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-lg
                            ${done ? "bg-green-500 text-white shadow-green-500/30"
                : active ? "bg-[#135bec] text-white shadow-blue-500/30"
                  : "bg-white border-2 border-slate-100 text-slate-400"}`}>
              {done ? <span className="material-symbols-outlined text-xl">check</span> : step.num}
            </div>
            <span className={`text-[10px] font-bold uppercase tracking-wider
                            ${done ? "text-green-600" : active ? "text-[#135bec]" : "text-slate-400"}`}>
              {step.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
    <span className="material-symbols-outlined text-[14px]">error</span>{msg}
  </p>;
}

// ─── Step 1 ───────────────────────────────────────────────────────────────────
function Step1({
  data, setData, onNext,
}: {
  data: FormData;
  setData: (d: Partial<FormData>) => void;
  onNext: () => void;
}) {
  const [touched, setTouched] = useState(false);

  const errors = {
    fullName: !data.fullName.trim() ? "Vui lòng nhập họ và tên" : "",
    email: !data.email.trim() ? "Vui lòng nhập email"
      : !isValidEmail(data.email) ? "Email không hợp lệ" : "",
    phone: !data.phone.trim() ? "Vui lòng nhập số điện thoại"
      : !isValidPhone(data.phone) ? "Số điện thoại không hợp lệ (VD: 0912345678)" : "",
    agreed: !data.agreed ? "Bạn cần đồng ý với điều khoản dịch vụ" : "",
  };
  const isValid = !Object.values(errors).some(Boolean);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (isValid) onNext();
  };

  const inputCls = (err: string) =>
    `w-full pl-10 pr-4 py-3 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-[#135bec]/20 focus:border-[#135bec] transition-all outline-none
        ${touched && err ? "border-red-400 bg-red-50" : "border-slate-100"}`;

  return (
    <>
      <div className="mb-10">
        <h2 className="text-3xl font-black mb-2">Tạo tài khoản mới</h2>
        <p className="text-slate-500">Hoàn thành các bước để bắt đầu sự nghiệp của bạn.</p>
      </div>
      <StepIndicator current={1} />
      <form className="space-y-5" onSubmit={handleSubmit} noValidate>
        <div className="space-y-1">
          <label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Họ và tên</label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">person</span>
            <input className={inputCls(errors.fullName)} placeholder="Nguyễn Văn A" type="text"
              value={data.fullName} onChange={(e) => setData({ fullName: e.target.value })} />
          </div>
          {touched && <FieldError msg={errors.fullName} />}
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Email</label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">mail</span>
            <input className={inputCls(errors.email)} placeholder="email@example.com" type="email"
              value={data.email} onChange={(e) => setData({ email: e.target.value })} />
          </div>
          {touched && <FieldError msg={errors.email} />}
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Số điện thoại</label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">call</span>
            <input className={inputCls(errors.phone)} placeholder="090 123 4567" type="tel"
              value={data.phone} onChange={(e) => setData({ phone: e.target.value })} />
          </div>
          {touched && <FieldError msg={errors.phone} />}
        </div>

        <div className="pt-1">
          <div className="flex items-start gap-3">
            <input className="mt-1 w-4 h-4 rounded border-slate-300 accent-[#135bec]" id="terms"
              type="checkbox" checked={data.agreed} onChange={(e) => setData({ agreed: e.target.checked })} />
            <label className="text-sm text-slate-500 leading-tight cursor-pointer" htmlFor="terms">
              Tôi đồng ý với{" "}
              <a className="text-[#135bec] font-bold hover:underline" href="#">Điều khoản dịch vụ</a>
              {" "}và{" "}
              <a className="text-[#135bec] font-bold hover:underline" href="#">Chính sách bảo mật</a>
              {" "}của NhàĐấtToànQuốc.
            </label>
          </div>
          {touched && <FieldError msg={errors.agreed} />}
        </div>

        <div className="pt-4 flex flex-col gap-4">
          <button type="submit"
            className="w-full bg-[#135bec] hover:bg-blue-600 text-white py-4 rounded-xl font-bold shadow-xl shadow-blue-500/20 transition-all flex items-center justify-center gap-2 hover:-translate-y-0.5 active:scale-[0.98]">
            Tiếp tục bước kế tiếp
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </button>
          <p className="text-center text-sm text-slate-500">
            Đã có tài khoản?{" "}
            <Link className="text-[#135bec] font-bold hover:underline" href="/login">Đăng nhập ngay</Link>
          </p>
        </div>
      </form>
    </>
  );
}

// ─── Step 2 ───────────────────────────────────────────────────────────────────
function Step2({
  data, setData, onNext, onBack,
}: {
  data: FormData;
  setData: (d: Partial<FormData>) => void;
  onNext: () => void;
  onBack: () => void;
}) {
  const [showPw, setShowPw] = useState(false);
  const [showCf, setShowCf] = useState(false);
  const [touched, setTouched] = useState(false);

  const checks = [
    { label: "Ít nhất 8 ký tự", ok: data.password.length >= 8 },
    { label: "Chứa ít nhất 1 chữ hoa", ok: /[A-Z]/.test(data.password) },
    { label: "Ít nhất 1 số", ok: /[0-9]/.test(data.password) },
    { label: "Ít nhất 1 ký tự đặc biệt", ok: /[^a-zA-Z0-9]/.test(data.password) },
  ];
  const strength = checks.filter((c) => c.ok).length;
  const strengthLabel = ["", "Yếu", "Yếu", "Trung bình", "Mạnh"][strength];
  const strengthColor = ["bg-slate-200", "bg-red-400", "bg-red-400", "bg-orange-400", "bg-green-500"][strength];
  const strengthText = ["", "text-red-500", "text-red-500", "text-orange-500", "text-green-600"][strength];

  const errors = {
    password: !data.password ? "Vui lòng nhập mật khẩu"
      : strength < 3 ? "Mật khẩu chưa đủ mạnh" : "",
    confirm: !data.confirm ? "Vui lòng nhập lại mật khẩu"
      : data.confirm !== data.password ? "Mật khẩu xác nhận không khớp" : "",
    twoFA: !data.twoFA ? "Vui lòng chọn phương thức xác thực 2 lớp" : "",
  };
  const isValid = !Object.values(errors).some(Boolean);

  const inputCls = (err: string) =>
    `w-full pl-10 pr-12 py-3 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-[#135bec]/20 focus:border-[#135bec] transition-all outline-none
        ${touched && err ? "border-red-400 bg-red-50" : "border-slate-100"}`;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (isValid) onNext();
  };

  return (
    <>
      <div className="mb-8">
        <h2 className="text-3xl font-black mb-2 text-slate-800">Thiết lập bảo mật</h2>
        <p className="text-slate-500">Bảo vệ tài khoản của bạn với mật khẩu mạnh và xác thực 2 lớp.</p>
      </div>
      <StepIndicator current={2} />
      <form className="space-y-5" onSubmit={handleSubmit} noValidate>

        <div className="space-y-1">
          <label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Mật khẩu mới</label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">lock</span>
            <input className={inputCls(errors.password)} placeholder="••••••••"
              type={showPw ? "text" : "password"}
              value={data.password} onChange={(e) => setData({ password: e.target.value })} />
            <button className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#135bec] transition-colors"
              type="button" onClick={() => setShowPw(!showPw)}>
              <span className="material-symbols-outlined">{showPw ? "visibility_off" : "visibility"}</span>
            </button>
          </div>
          {touched && <FieldError msg={errors.password} />}
        </div>

        <div className="space-y-3 p-4 bg-slate-50 border border-slate-100 rounded-xl">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-600 uppercase">Độ mạnh mật khẩu</span>
            {data.password && <span className={`text-xs font-bold ${strengthText}`}>{strengthLabel}</span>}
          </div>
          <div className="flex gap-1.5 h-1.5">
            {[1, 2, 3, 4].map((bar) => (
              <div key={bar} className={`flex-1 rounded-full transition-colors
                                ${data.password && strength >= bar ? strengthColor : "bg-slate-200"}`} />
            ))}
          </div>
          <ul className="space-y-1.5">
            {checks.map((c) => (
              <li key={c.label} className={`flex items-center gap-2 text-xs font-medium
                                ${data.password ? (c.ok ? "text-green-600" : "text-red-400") : "text-slate-400"}`}>
                <span className="material-symbols-outlined text-[15px]">
                  {data.password ? (c.ok ? "check_circle" : "cancel") : "radio_button_unchecked"}
                </span>
                {c.label}
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-bold uppercase text-slate-500 tracking-wider">Nhập lại mật khẩu</label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">lock_reset</span>
            <input className={inputCls(errors.confirm)} placeholder="••••••••"
              type={showCf ? "text" : "password"}
              value={data.confirm} onChange={(e) => setData({ confirm: e.target.value })} />
            <button className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#135bec] transition-colors"
              type="button" onClick={() => setShowCf(!showCf)}>
              <span className="material-symbols-outlined">{showCf ? "visibility_off" : "visibility"}</span>
            </button>
          </div>
          {touched && <FieldError msg={errors.confirm} />}
          {data.confirm && data.password && !errors.confirm && (
            <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">check_circle</span>Mật khẩu khớp
            </p>
          )}
        </div>

        <div className="space-y-3 pt-1">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#135bec]">security</span>
            <h3 className="font-bold text-slate-800">Xác thực 2 lớp (2FA)</h3>
          </div>
          {[
            { value: "email", icon: "mail", title: "Xác thực qua Email", sub: "Mã OTP gửi đến hòm thư" },
            { value: "app", icon: "app_shortcut", title: "Google Authenticator", sub: "Dùng ứng dụng để lấy mã" },
          ].map((opt) => (
            <div key={opt.value} onClick={() => setData({ twoFA: opt.value })}
              className={`flex items-center justify-between p-4 border-2 rounded-xl cursor-pointer transition-all
                                ${data.twoFA === opt.value ? "border-[#135bec] bg-[#135bec]/5" : "border-slate-100 hover:border-[#135bec]/30"}`}>
              <div className={`flex items-center gap-3 ${data.twoFA !== opt.value ? "text-slate-500" : ""}`}>
                <span className={`material-symbols-outlined ${data.twoFA === opt.value ? "text-[#135bec]" : ""}`}>{opt.icon}</span>
                <div>
                  <p className="font-bold text-sm text-slate-700">{opt.title}</p>
                  <p className="text-[10px] text-slate-500">{opt.sub}</p>
                </div>
              </div>
              <input className="accent-[#135bec] h-4 w-4" name="2fa" type="radio"
                value={opt.value} checked={data.twoFA === opt.value} onChange={() => setData({ twoFA: opt.value })} />
            </div>
          ))}
          {touched && <FieldError msg={errors.twoFA} />}
        </div>

        <div className="pt-4 flex flex-col gap-4">
          <button type="submit"
            className="w-full bg-[#135bec] hover:bg-blue-600 text-white py-4 rounded-xl font-bold shadow-xl shadow-blue-500/20 transition-all flex items-center justify-center gap-2 hover:-translate-y-0.5 active:scale-[0.98]">
            Tiếp tục bước kế tiếp
            <span className="material-symbols-outlined text-sm">arrow_forward</span>
          </button>
          <button type="button" onClick={onBack}
            className="text-center text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors">
            Quay lại bước trước
          </button>
        </div>
      </form>
    </>
  );
}

// ─── Step 3 ───────────────────────────────────────────────────────────────────
function Step3({
  data, setData, onBack, onSubmit, loading, apiError,
}: {
  data: FormData;
  setData: (d: Partial<FormData>) => void;
  onBack: () => void;
  onSubmit: () => void;
  loading: boolean;
  apiError: string;
}) {
  const roles = [
    {
      value: "agent (Recommend)",
      icon: "manage_accounts",
      title: "Môi giới cá nhân",
      desc: "Dành cho cá nhân hoạt động độc lập, quản lý danh mục và khách hàng riêng.",
    },
    // {
    //   value: "agent",
    //   icon: "apartment",
    //   title: "Đại diện Sàn giao dịch",
    //   desc: "Quản lý đội ngũ, nguồn hàng tập trung và theo dõi hiệu suất nhân viên.",
    // },
    {
      value: "user",
      icon: "person",
      title: "Người dùng",
      desc: "Tìm kiếm, xem thông tin bất động sản và liên hệ trực tiếp với môi giới.",
    },
  ];

  return (
    <>
      <div className="mb-10">
        <h2 className="text-3xl font-black mb-2">Lựa chọn vai trò</h2>
        <p className="text-slate-500">Xác định hình thức hoạt động của bạn trên hệ thống.</p>
      </div>
      <StepIndicator current={3} />
      <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); onSubmit(); }}>
        <div className="grid grid-cols-1 gap-3">
          {roles.map((r, idx) => (
            <div key={idx} onClick={() => setData({ role: r.value })}
              className={`p-5 border-2 rounded-2xl cursor-pointer transition-all flex items-start gap-4
                                ${data.role === r.value && idx === roles.indexOf(roles.find(x => x.value === data.role && x.icon === r.icon)!)
                  ? "border-[#135bec] bg-[#135bec]/5"
                  : "border-slate-100 hover:border-[#135bec]/40"}`}>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors shrink-0
                                ${data.role === r.value ? "bg-[#135bec] text-white" : "bg-slate-100 text-slate-400"}`}>
                <span className="material-symbols-outlined text-3xl">{r.icon}</span>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-slate-900">{r.title}</h3>
                <p className="text-sm text-slate-500 mt-1">{r.desc}</p>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-1
                                ${data.role === r.value ? "border-[#135bec]" : "border-slate-200"}`}>
                <div className={`w-2.5 h-2.5 rounded-full bg-[#135bec] transition-transform
                                    ${data.role === r.value ? "scale-100" : "scale-0"}`} />
              </div>
            </div>
          ))}
        </div>

        <div className="space-y-2">
          <label className="text-xs font-bold uppercase text-slate-500 tracking-wider">
            Mã giới thiệu (Nếu có)
          </label>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              confirmation_number
            </span>
            <input
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-2 focus:ring-[#135bec]/20 focus:border-[#135bec] transition-all outline-none"
              placeholder="Nhập mã giới thiệu" type="text"
              value={data.referralCode}
              onChange={(e) => setData({ referralCode: e.target.value })} />
          </div>
        </div>

        {/* API Error */}
        {apiError && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
            <span className="material-symbols-outlined text-red-500 shrink-0">error</span>
            <p className="text-sm text-red-600 font-medium">{apiError}</p>
          </div>
        )}

        <div className="pt-2 flex flex-col gap-4">
          <button type="submit" disabled={loading}
            className="w-full bg-[#135bec] hover:bg-blue-600 disabled:opacity-60 disabled:cursor-not-allowed text-white py-4 rounded-xl font-bold shadow-2xl shadow-blue-500/30 transition-all flex items-center justify-center gap-2 hover:-translate-y-0.5 active:scale-[0.98]">
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                Đang xử lý...
              </>
            ) : (
              <>
                Hoàn tất đăng ký
                <span className="material-symbols-outlined text-xl">done_all</span>
              </>
            )}
          </button>
          <button type="button" onClick={onBack} disabled={loading}
            className="text-center text-sm font-bold text-slate-400 hover:text-slate-600 transition-colors disabled:opacity-50">
            Quay lại bước trước
          </button>
        </div>
      </form>
    </>
  );
}

// ─── Success Screen ───────────────────────────────────────────────────────────
function SuccessScreen({ email }: { email: string }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-8">
      <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
        <span className="material-symbols-outlined text-5xl text-green-500"
          style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
      </div>
      <h2 className="text-3xl font-black text-slate-900 mb-3">Đăng ký thành công!</h2>
      <p className="text-slate-500 mb-2">
        Tài khoản của bạn đã được tạo. Chúng tôi đã gửi email xác thực đến:
      </p>
      <p className="text-[#135bec] font-bold text-lg mb-8">{email}</p>
      <p className="text-sm text-slate-400 mb-6">Vui lòng kiểm tra hộp thư và nhấn vào link xác thực để kích hoạt tài khoản.</p>
      <Link href="/login"
        className="bg-[#135bec] hover:bg-blue-600 text-white py-3 px-8 rounded-xl font-bold shadow-xl shadow-blue-500/20 transition-all">
        Đến trang đăng nhập
      </Link>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    email: "",
    phone: "",
    agreed: false,
    password: "",
    confirm: "",
    twoFA: "",
    role: "user",
    referralCode: "",
  });

  const updateData = (partial: Partial<FormData>) =>
    setFormData((prev) => ({ ...prev, ...partial }));

  const handleSubmit = async () => {
    setLoading(true);
    setApiError("");
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
          confirmPassword: formData.confirm,
          agreedToTerms: "true",
          role: formData.role,
          enable2FA: formData.twoFA === "app",
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        setApiError(json.message || "Đã xảy ra lỗi, vui lòng thử lại.");
        return;
      }

      setSuccess(true);
    } catch {
      setApiError("Không thể kết nối tới máy chủ. Vui lòng kiểm tra kết nối và thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f6f6f8] flex items-center justify-center p-4">
      <div className="max-w-6xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[700px]">
        <LeftPanel step={step} />
        <div className="flex-1 p-8 md:p-16 overflow-y-auto">
          <div className="max-w-md mx-auto">
            {success ? (
              <SuccessScreen email={formData.email} />
            ) : (
              <>
                {step === 1 && <Step1 data={formData} setData={updateData} onNext={() => setStep(2)} />}
                {step === 2 && <Step2 data={formData} setData={updateData} onNext={() => setStep(3)} onBack={() => setStep(1)} />}
                {step === 3 && (
                  <Step3
                    data={formData}
                    setData={updateData}
                    onBack={() => setStep(2)}
                    onSubmit={handleSubmit}
                    loading={loading}
                    apiError={apiError}
                  />
                )}
              </>
            )}

            {!success && (
              <div className="mt-10 flex items-center justify-center gap-4 text-slate-400">
                <button className="flex items-center gap-1 text-xs font-bold hover:text-slate-600 transition-colors">
                  <span className="material-symbols-outlined text-sm">help</span>Hỗ trợ đăng ký
                </button>
                <span className="text-slate-200">|</span>
                <button className="flex items-center gap-1 text-xs font-bold hover:text-slate-600 transition-colors">
                  <span className="material-symbols-outlined text-sm">language</span>Tiếng Việt
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
