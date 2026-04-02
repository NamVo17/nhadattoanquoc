"use client";
import { useState } from "react";

interface TwoFAVerificationProps {
  email: string;
  onVerified: (totpCode?: string, backupCode?: string, trustDevice?: boolean) => void;
  onBack?: () => void;
  isLoading?: boolean;
}

export default function TwoFAVerification({ email, onVerified, onBack, isLoading = false }: TwoFAVerificationProps) {
  const [mode, setMode] = useState<"totp" | "backup">("totp");
  const [totpCode, setTotpCode] = useState("");
  const [backupCode, setBackupCode] = useState("");
  const [trustDevice, setTrustDevice] = useState(false);
  const [error, setError] = useState("");

  const handleTOTPSubmit = () => {
    if (totpCode.length !== 6) {
      setError("Mã xác thực phải có 6 chữ số");
      return;
    }
    setError("");
    onVerified(totpCode, undefined, trustDevice);
  };

  const handleBackupSubmit = () => {
    if (!backupCode.trim()) {
      setError("Vui lòng nhập mã phục hồi");
      return;
    }
    setError("");
    onVerified(undefined, backupCode, trustDevice);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-xl shadow-lg p-8 space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Xác thực 2 lớp</h2>
          <p className="text-slate-600 text-sm">
            Nhập mã xác thực để tiếp tục đăng nhập
          </p>
        </div>

        {/* Tab Selection */}
        <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-lg">
          <button
            onClick={() => {
              setMode("totp");
              setError("");
              setTotpCode("");
              setBackupCode("");
            }}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              mode === "totp"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span className="material-symbols-outlined inline mr-2 text-lg">phone_iphone</span>
            Ứng dụng
          </button>
          <button
            onClick={() => {
              setMode("backup");
              setError("");
              setTotpCode("");
              setBackupCode("");
            }}
            className={`px-4 py-2 rounded-md font-medium transition-colors ${
              mode === "backup"
                ? "bg-white text-blue-600 shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span className="material-symbols-outlined inline mr-2 text-lg">key</span>
            Mã phục hồi
          </button>
        </div>

        {/* TOTP Mode */}
        {mode === "totp" && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Mã 6 chữ số từ ứng dụng Authenticator
              </label>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="000000"
                value={totpCode}
                onChange={(e) => {
                  setTotpCode(e.target.value.replace(/\D/g, ""));
                  setError("");
                }}
                className="w-full px-4 py-3 text-center text-2xl font-bold tracking-widest border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
                disabled={isLoading}
              />
            </div>

            {/* Remember Device Checkbox */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={trustDevice}
                onChange={(e) => setTrustDevice(e.target.checked)}
                disabled={isLoading}
                className="w-4 h-4 rounded border-slate-300 cursor-pointer"
              />
              <span className="text-sm text-slate-700 font-medium">
                Ghi nhớ thiết bị này (30 ngày)
              </span>
            </label>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              {onBack && (
                <button
                  onClick={onBack}
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50 transition-colors disabled:opacity-50"
                  disabled={isLoading}
                >
                  Quay lại
                </button>
              )}
              <button
                onClick={handleTOTPSubmit}
                className="flex-1 px-4 py-2 bg-blue-600 rounded-lg text-white font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                disabled={isLoading || totpCode.length !== 6}
              >
                {isLoading ? "Đang xác minh..." : "Xác thực"}
              </button>
            </div>
          </div>
        )}

        {/* Backup Code Mode */}
        {mode === "backup" && (
          <div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex gap-2 text-sm text-yellow-800">
              <span className="material-symbols-outlined flex-shrink-0">info</span>
              <p>
                Nhập một trong các mã phục hồi bạn đã lưu lại. Mỗi mã chỉ sử dụng được một lần.
              </p>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-2">
                Mã phục hồi
              </label>
              <input
                type="text"
                placeholder="XXX-XXX-XXX"
                value={backupCode}
                onChange={(e) => {
                  setBackupCode(e.target.value.toUpperCase());
                  setError("");
                }}
                className="w-full px-4 py-3 font-mono text-lg border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
                disabled={isLoading}
              />
            </div>

            {/* Remember Device Checkbox */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={trustDevice}
                onChange={(e) => setTrustDevice(e.target.checked)}
                disabled={isLoading}
                className="w-4 h-4 rounded border-slate-300 cursor-pointer"
              />
              <span className="text-sm text-slate-700 font-medium">
                Ghi nhớ thiết bị này (30 ngày)
              </span>
            </label>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="flex gap-3">
              {onBack && (
                <button
                  onClick={onBack}
                  className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50 transition-colors disabled:opacity-50"
                  disabled={isLoading}
                >
                  Quay lại
                </button>
              )}
              <button
                onClick={handleBackupSubmit}
                className="flex-1 px-4 py-2 bg-blue-600 rounded-lg text-white font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                disabled={isLoading || !backupCode.trim()}
              >
                {isLoading ? "Đang xác minh..." : "Xác thực"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
