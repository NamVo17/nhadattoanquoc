"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [captcha, setCaptcha] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [captchaError, setCaptchaError] = useState("");
  const [mounted, setMounted] = useState(false);

  // Load saved email from localStorage on mount
  useEffect(() => {
    try {
      const savedEmail = localStorage.getItem("rememberMe_email");
      const savedRememberMe = localStorage.getItem("rememberMe_checked") === "true";
      if (savedEmail) {
        setEmail(savedEmail);
        setRememberMe(savedRememberMe);
      }
    } catch (err) {
      console.error("Error loading saved credentials:", err);
    }
    setMounted(true);
  }, []);

  const handleRememberMeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setRememberMe(checked);
    if (checked && email) {
      localStorage.setItem("rememberMe_email", email);
      localStorage.setItem("rememberMe_checked", "true");
    } else {
      localStorage.removeItem("rememberMe_email");
      localStorage.removeItem("rememberMe_checked");
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (rememberMe) {
      localStorage.setItem("rememberMe_email", e.target.value);
    }
  };

  const handleCaptchaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCaptcha(e.target.checked);
    setCaptchaError("");
    if (e.target.checked) {
      console.log("CAPTCHA verified by user");
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setCaptchaError("");
    setIsLoading(true);

    if (!captcha) {
      setCaptchaError("Vui lòng xác nhận bạn không phải là robot");
      setIsLoading(false);
      return;
    }

    if (!email || !password) {
      setError("Vui lòng điền đầy đủ thông tin");
      setIsLoading(false);
      return;
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
      console.log("Logging in to:", `${apiUrl}/auth/login`);
      
      const response = await fetch(`${apiUrl}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Đăng nhập thất bại. Vui lòng kiểm tra email và mật khẩu.");
        setIsLoading(false);
        return;
      }

      // Store token and user info
      if (data.data?.accessToken && data.data?.user) {
        // Debug: Log backend response to check what fields are available
        console.log("✅ Login successful! Backend user data:", data.data.user);
        
        // Ensure role field exists (backend may use different field names)
        const userData = {
          ...data.data.user,
          // Map role from various possible field names if not present
          role: data.data.user.role || 
                data.data.user.userRole || 
                data.data.user.user_role ||
                data.data.user.type ||
                data.data.user.userType ||
                data.data.user.user_type ||
                'user' // Default to 'user' if not found
        };
        
        console.log("📋 User data to be stored:", userData);
        
        localStorage.setItem("accessToken", data.data.accessToken);
        localStorage.setItem("user", JSON.stringify(userData));

        // Save email if remember me is checked
        if (rememberMe) {
          localStorage.setItem("rememberMe_email", email);
          localStorage.setItem("rememberMe_checked", "true");
        } else {
          localStorage.removeItem("rememberMe_email");
          localStorage.removeItem("rememberMe_checked");
        }

        // Redirect to dashboard
        router.push("/");
      } else {
        setError("Phản hồi từ server không hợp lệ");
        setIsLoading(false);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Lỗi kết nối";
      setError(`Lỗi kết nối: ${errorMsg}. Vui lòng kiểm tra backend đang chạy trên http://localhost:5000`);
      console.error("Login error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full">

      {/* ── Left: Hero Image ── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          alt="Luxury Real Estate"
          className="absolute inset-0 h-full w-full object-cover"
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuCVkwPEvoUKrL52xtPLKuZyLSx4KRRFeY0KuQ-6F2jAYopUpv0jRH-aqyJCBbxwWoR1Rb7YinZQzAvqJI-Upbo_nf_FPoIaimXqpMrxyn35fHTHXn493GLbjIy03Tnr4pt4dcjFKwRIbakrYagtICJkkcJVOrZQUdOul9VHKBXZUpINviCFG2cm24Ja9FgWfnNAH9Cq8UaByKwWBRN5BeKY4EGFjvkif7AoZh6nkvzjb31iaGXEznWgnSIYCO7S1GO-1BjDZFyQkXGb"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-slate-900 via-slate-900/40 to-transparent" />

        <div className="relative z-10 flex flex-col justify-end p-20 w-full h-full">
          <div className="max-w-md">
            {/* Logo */}
            <div className="flex items-center gap-2 text-white mb-8">
              <span className="material-symbols-outlined text-4xl font-bold">home</span>
              <h2 className="text-2xl font-extrabold tracking-tight">
                NhàĐấtToànQuốc
              </h2>
            </div>

            <h1 className="text-5xl font-extrabold text-white leading-tight mb-6">
              Nâng tầm giá trị, Kết nối thành công.
            </h1>

            <p className="text-xl text-slate-300 font-medium border-l-4 border-[#135bec] pl-6 py-2">
              Chào mừng bạn đến với hệ thống quản lý bất động sản dành riêng cho
              cộng đồng môi giới chuyên nghiệp. An toàn, bảo mật và hiệu quả là
              ưu tiên hàng đầu của chúng tôi.
            </p>
          </div>

          {/* Stats */}
          <div className="mt-20 flex gap-12">
            <div>
              <p className="text-3xl font-bold text-white">8,500+</p>
              <p className="text-sm text-slate-400">Môi giới tin dùng</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-white">2.5%</p>
              <p className="text-sm text-slate-400">Hoa hồng trung bình</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-white">100%</p>
              <p className="text-sm text-slate-400">Bảo mật thông tin</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right: Login Form ── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-16 lg:p-24 bg-white overflow-y-auto">
        <div className="max-w-md w-full">

          {/* Mobile logo */}
          <div className="lg:hidden flex items-center justify-center gap-2 text-[#135bec] mb-12">
            <span className="material-symbols-outlined text-4xl font-bold">home</span>
            <h2 className="text-2xl font-extrabold tracking-tight">NhàĐấtToànQuốc</h2>
          </div>

          {/* Heading */}
          <div className="text-left mb-10">
            <h2 className="text-3xl font-black text-slate-900 mb-2">Chào mừng trở lại</h2>
            <p className="text-slate-500">
              Vui lòng nhập thông tin đăng nhập của bạn để tiếp tục.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
                {error}
              </div>
            )}

            {/* Email / Phone */}
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wide">
                Email hoặc Số điện thoại
              </label>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#135bec] transition-colors">
                  person
                </span>
                <input
                  className="w-full pl-12 pr-4 py-4 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-[#135bec] focus:border-transparent outline-none transition-all"
                  placeholder="name@company.com"
                  required
                  type="email"
                  value={email}
                  onChange={handleEmailChange}
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-bold text-slate-700 uppercase tracking-wide">
                  Mật khẩu
                </label>
              </div>
              <div className="relative group">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#135bec] transition-colors">
                  lock
                </span>
                <input
                  className="w-full pl-12 pr-12 py-4 rounded-xl border border-slate-200 bg-slate-50 focus:ring-2 focus:ring-[#135bec] focus:border-transparent outline-none transition-all"
                  placeholder="••••••••"
                  required
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                />
                <button
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password visibility"
                  disabled={isLoading}
                >
                  <span className="material-symbols-outlined">
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
            </div>

            {/* Remember me + Forgot password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  className="rounded border-slate-300 text-[#135bec] focus:ring-[#135bec] h-4 w-4 accent-[#135bec]"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={handleRememberMeChange}
                  disabled={isLoading}
                />
                <span className="text-sm text-slate-600 font-medium">Ghi nhớ đăng nhập</span>
              </label>
              <a className="text-sm font-bold text-[#135bec] hover:underline" href="#">
                Quên mật khẩu?
              </a>
            </div>

            {/* reCAPTCHA */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <input
                  className="w-6 h-6 rounded-sm border-slate-300 text-[#135bec] focus:ring-[#135bec] accent-[#135bec]"
                  id="captcha"
                  type="checkbox"
                  checked={captcha}
                  onChange={handleCaptchaChange}
                  disabled={isLoading}
                />
                <label className="text-sm font-medium text-slate-700" htmlFor="captcha">
                  Tôi không phải là người máy
                </label>
              </div>
              <div className="flex flex-col items-center opacity-60">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  alt="reCAPTCHA"
                  className="w-8 h-8"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDB7jpoEKDWzq1nI0GcfGZz1XoC-eo-tD8JbbTIB32qCJATQ_0r_EOdjxnmVnohIw6jYhyy07WwxXOGrf6CCz5417o40sbaENIGNJnEtRRt48YRxgLhjCBf-1f60jvgsxdNKeb6h4X3bdv_8lWHZ4B_lDcE22Bk_Z24VStoEXBpfWqmNm9FpD17VD-gpwI6fqrRZ6V8QXyn2C6c-njufVW60pZRWJisTeFqymAiXcwsljy24y_fLbD-Fl4N0d9LPrwgEGpygG03jkjD"
                />
                <span className="text-[8px] font-bold uppercase">reCAPTCHA</span>
              </div>
            </div>

            {/* CAPTCHA Error */}
            {captchaError && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-700">
                {captchaError}
              </div>
            )}

            {/* Submit */}
            <button
              className="w-full bg-[#135bec] hover:bg-blue-600 disabled:bg-blue-300 text-white py-4 rounded-xl font-bold text-lg shadow-xl shadow-blue-500/25 transition-all transform hover:-translate-y-0.5 active:scale-[0.98]"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? "Đang đăng nhập..." : "Đăng nhập ngay"}
            </button>

            {/* Divider */}
            <div className="relative py-4">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-slate-400 font-medium uppercase tracking-widest text-[10px]">
                  Hoặc tiếp tục với
                </span>
              </div>
            </div>

            {/* Social login */}
            <div className="grid grid-cols-2 gap-4">
              <button
                className="flex items-center justify-center gap-3 px-4 py-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors font-semibold text-sm"
                type="button"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  alt="Google"
                  className="w-5 h-5"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBB8rGS2c8zVdF-fgUDM1NkdrsUxTq5SerVIBK0erZOnmJNJntIu7nLXo_8Oi3E0X7JVd8C3QqfHdwyjRKpG454ltAgY_UKLyRKAH69JVE8kj9YbmeVGEJHQJttQFW6hPqF7eJEEmMj8X3Xc1elS0LNyZxxvee6YRKBJhcQNTAZd9tw2E5EIjwJBWeZUjgMPswZ0QKjzkVdN2f1OYaeGroo0TdJW2nAiyl1eJIr-MtjtmGfuZvIq8eGbdObcqQ86TUljKXEishfnX0I"
                />
                Google
              </button>
              <button
                className="flex items-center justify-center gap-3 px-4 py-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors font-semibold text-sm"
                type="button"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  alt="Apple"
                  className="w-5 h-5"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuABptDBIISz55yVR4_rph7dqMX7AhflCIvolmH_8_-6oCkLnRaas35GE1YuIMB6BjW2AjG1rpHOh2imX6xix0VwIbp3gvCEqd02_0aBfqmHTmt-7GGZ2f_NZbHET8ODe8rosbqPaeCrQHQkLgFj31_60GZPonNOa9r4HEzXOqisa1Y35l46aPXdR-zrNQ6iNJ3-qPHrgeUZdoHBD4nuDYJwlwMbYYJFRyJvZab78AanFu7v9NCuplSp5tGUT1WOgxBO3Xn02B0R1YQh"
                />
                Apple
              </button>
            </div>

            {/* Sign up link */}
            <p className="text-center text-slate-600 text-sm font-medium mt-8">
              Chưa có tài khoản?{" "}
              <Link className="text-[#135bec] font-bold hover:underline" href="/register">
                Đăng ký ngay
              </Link>
            </p>
          </form>

          {/* Footer links */}
          <div className="mt-16 text-center text-[11px] text-slate-400 uppercase tracking-widest space-x-4">
            <a className="hover:text-[#135bec] transition-colors" href="#">Điều khoản</a>
            <span>•</span>
            <a className="hover:text-[#135bec] transition-colors" href="#">Bảo mật</a>
            <span>•</span>
            <a className="hover:text-[#135bec] transition-colors" href="#">Trợ giúp</a>
          </div>
        </div>
      </div>
    </div>
  );
}
