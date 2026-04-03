"use client";
import { useState, useEffect } from "react";
import { twoFAService } from "@/features/auth/twofa.service";
import type { TOTPSetupData } from "@/features/auth/twofa.types";

interface TwoFASetupProps {
  accessToken: string;
  email: string;
  onSuccess?: () => void;
  onBack?: () => void;
}

export default function TwoFASetup({ accessToken, email, onSuccess, onBack }: TwoFASetupProps) {
  const [setupData, setSetupData] = useState<TOTPSetupData | null>(null);
  const [verificationCode, setVerificationCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [step, setStep] = useState<"intro" | "scan" | "verify" | "backup">("intro");
  const [copied, setCopied] = useState(false);

  // Initialize 2FA setup
  const initializeSetup = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await twoFAService.setupTOTP();
      setSetupData(data);
      setStep("scan");
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to initialize 2FA setup");
      setLoading(false);
    }
  };

  // Verify TOTP code
  const verifyTOTP = async () => {
    if (verificationCode.length !== 6) {
      setError("Mã xác thực phải có 6 chữ số");
      return;
    }

    try {
      setLoading(true);
      setError("");
      await twoFAService.confirmTOTP(verificationCode);
      setStep("backup");
      setLoading(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Mã xác thực không hợp lệ");
      setLoading(false);
    }
  };

  // Copy backup codes to clipboard
  const copyBackupCodes = () => {
    if (setupData?.backupCodes) {
      const codesText = setupData.backupCodes.join("\n");
      navigator.clipboard.writeText(codesText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Download backup codes
  const downloadBackupCodes = () => {
    if (setupData?.backupCodes) {
      const codesText = setupData.backupCodes.join("\n");
      const element = document.createElement("a");
      element.setAttribute("href", `data:text/plain;charset=utf-8,${encodeURIComponent(codesText)}`);
      element.setAttribute("download", "backup-codes.txt");
      element.style.display = "none";
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }
  };

  if (step === "intro") {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8 space-y-6">
          <div className="text-center">
            <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-3xl text-blue-600">security</span>
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Bảo vệ tài khoản</h2>
            <p className="text-slate-600 mt-2">
              Kích hoạt xác thực 2 lớp để bảo vệ tài khoản của bạn
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3">
            <div className="flex gap-3">
              <span className="material-symbols-outlined text-blue-600 flex-shrink-0">check_circle</span>
              <div>
                <p className="font-semibold text-slate-900">Xác thực nhập liệu</p>
                <p className="text-sm text-slate-600">Nhập mã từ ứng dụng Authenticator</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="material-symbols-outlined text-blue-600 flex-shrink-0">check_circle</span>
              <div>
                <p className="font-semibold text-slate-900">Mã phục hồi</p>
                <p className="text-sm text-slate-600">Mã dự phòng nếu mất quyền truy cập</p>
              </div>
            </div>
            <div className="flex gap-3">
              <span className="material-symbols-outlined text-blue-600 flex-shrink-0">check_circle</span>
              <div>
                <p className="font-semibold text-slate-900">Bảo mật tối đa</p>
                <p className="text-sm text-slate-600">Được hỗ trợ bởi các ứng dụng uy tín</p>
              </div>
            </div>
          </div>

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
                disabled={loading}
              >
                Quay lại
              </button>
            )}
            <button
              onClick={initializeSetup}
              className="flex-1 px-4 py-2 bg-blue-600 rounded-lg text-white font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
              disabled={loading}
            >
              {loading ? "Đang tải..." : "Tiếp theo"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === "scan" && setupData) {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8 space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Quét mã QR</h2>
            <p className="text-slate-600 text-sm">
              Sử dụng ứng dụng Authenticator (Google Authenticator, Microsoft Authenticator, Authy, v.v.)
            </p>
          </div>

          {/* QR Code */}
          <div className="bg-gray-100 p-6 rounded-lg flex justify-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={setupData.qrCode} alt="QR Code" className="w-64 h-64" />
          </div>

          {/* Manual Entry Option */}
          <div className="border-t border-slate-200 pt-4">
            <p className="text-sm text-slate-600 mb-3">Không thể quét? Nhập chìa khóa này thủ công:</p>
            <div className="bg-slate-50 p-4 rounded-lg font-mono text-sm text-center text-slate-900 break-all">
              {setupData.secret}
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => setStep("intro")}
              className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50 transition-colors"
              disabled={loading}
            >
              Quay lại
            </button>
            <button
              onClick={() => setStep("verify")}
              className="flex-1 px-4 py-2 bg-blue-600 rounded-lg text-white font-medium hover:bg-blue-700 transition-colors"
              disabled={loading}
            >
              Tiếp theo
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === "verify") {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8 space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Xác thực mã</h2>
            <p className="text-slate-600 text-sm">
              Nhập mã 6 chữ số từ ứng dụng Authenticator của bạn
            </p>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-2">
              Mã xác thực
            </label>
            <input
              type="text"
              maxLength={6}
              placeholder="000000"
              value={verificationCode}
              onChange={(e) => {
                setVerificationCode(e.target.value.replace(/\D/g, ""));
                setError("");
              }}
              className="w-full px-4 py-3 text-center text-2xl font-bold tracking-widest border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
              disabled={loading}
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => setStep("scan")}
              className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50 transition-colors"
              disabled={loading}
            >
              Quay lại
            </button>
            <button
              onClick={verifyTOTP}
              className="flex-1 px-4 py-2 bg-blue-600 rounded-lg text-white font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
              disabled={loading || verificationCode.length !== 6}
            >
              {loading ? "Đang xác minh..." : "Xác thực"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (step === "backup" && setupData) {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8 space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Lưu mã phục hồi</h2>
            <p className="text-slate-600 text-sm">
              Lưu các mã này ở nơi an toàn. Bạn sẽ cần chúng nếu mất quyền truy cập vào ứng dụng Authenticator
            </p>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex gap-3">
            <span className="material-symbols-outlined text-yellow-600 flex-shrink-0">warning</span>
            <p className="text-sm text-yellow-800">
              Lưu các mã này nơi an toàn. Mỗi mã chỉ có thể sử dụng một lần.
            </p>
          </div>

          {/* Backup Codes Grid */}
          <div className="bg-slate-50 p-4 rounded-lg space-y-2 font-mono text-sm">
            {setupData.backupCodes.map((code, index) => (
              <div key={index} className="flex items-center justify-between text-slate-700">
                <span>{index + 1}.</span>
                <span className="font-bold tracking-wider">{code}</span>
              </div>
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <button
              onClick={copyBackupCodes}
              className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-lg">
                {copied ? "check" : "content_copy"}
              </span>
              {copied ? "Đã sao chép" : "Sao chép"}
            </button>
            <button
              onClick={downloadBackupCodes}
              className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50 transition-colors flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-lg">download</span>
              Tải xuống
            </button>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <button
            onClick={() => {
              setStep("intro");
              onSuccess?.();
            }}
            className="w-full px-4 py-3 bg-green-600 rounded-lg text-white font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined">check_circle</span>
            Hoàn thành
          </button>
        </div>
      </div>
    );
  }

  return null;
}
