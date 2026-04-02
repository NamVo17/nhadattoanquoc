"use client";
import { useState, useEffect } from "react";
import { twoFAService } from "@/features/auth/twofa.service";
import type { TwoFAStatus } from "@/features/auth/twofa.types";
import TwoFASetup from "./TwoFASetup";

interface TwoFASettingsProps {
  accessToken: string;
  email: string;
}

export default function TwoFASettings({ accessToken, email }: TwoFASettingsProps) {
  const [status, setStatus] = useState<TwoFAStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showSetup, setShowSetup] = useState(false);
  const [showDisableForm, setShowDisableForm] = useState(false);
  const [disablePassword, setDisablePassword] = useState("");
  const [disableLoading, setDisableLoading] = useState(false);
  const [disableError, setDisableError] = useState("");
  const [showRegenerateForm, setShowRegenerateForm] = useState(false);
  const [regeneratePassword, setRegeneratePassword] = useState("");
  const [regenerateLoading, setRegenerateLoading] = useState(false);
  const [regenerateError, setRegenerateError] = useState("");
  const [regeneratedCodes, setRegeneratedCodes] = useState<string[] | null>(null);

  // Load 2FA status on mount
  useEffect(() => {
    loadStatus();
  }, [accessToken]);

  const loadStatus = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await twoFAService.get2FAStatus(accessToken);
      setStatus(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load 2FA status");
    } finally {
      setLoading(false);
    }
  };

  // Handle disable 2FA
  const handleDisable2FA = async () => {
    if (!disablePassword.trim()) {
      setDisableError("Vui lòng nhập mật khẩu");
      return;
    }

    try {
      setDisableLoading(true);
      setDisableError("");
      await twoFAService.disable2FA(accessToken, disablePassword);
      setShowDisableForm(false);
      setDisablePassword("");
      await loadStatus();
    } catch (err) {
      setDisableError(err instanceof Error ? err.message : "Failed to disable 2FA");
    } finally {
      setDisableLoading(false);
    }
  };

  // Handle regenerate backup codes
  const handleRegenerate = async () => {
    if (!regeneratePassword.trim()) {
      setRegenerateError("Vui lòng nhập mật khẩu");
      return;
    }

    try {
      setRegenerateLoading(true);
      setRegenerateError("");
      const codes = await twoFAService.regenerateBackupCodes(accessToken, regeneratePassword);
      setRegeneratedCodes(codes);
      setRegeneratePassword("");
      await loadStatus();
    } catch (err) {
      setRegenerateError(err instanceof Error ? err.message : "Failed to regenerate backup codes");
    } finally {
      setRegenerateLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 text-center">
        <div className="animate-spin inline-block w-8 h-8 border-4 border-slate-300 border-t-blue-600 rounded-full"></div>
        <p className="mt-4 text-slate-600">Đang tải...</p>
      </div>
    );
  }

  if (showSetup) {
    return (
      <TwoFASetup
        accessToken={accessToken}
        email={email}
        onSuccess={() => {
          setShowSetup(false);
          loadStatus();
        }}
        onBack={() => setShowSetup(false)}
      />
    );
  }

  if (regeneratedCodes) {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8 space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Mã phục hồi mới</h2>
            <p className="text-slate-600 text-sm">
              Lưu các mã này ở nơi an toàn. Chúng sẽ thay thế mã cũ của bạn.
            </p>
          </div>

          {/* Backup Codes Grid */}
          <div className="bg-slate-50 p-4 rounded-lg space-y-2 font-mono text-sm">
            {regeneratedCodes.map((code, index) => (
              <div key={index} className="flex items-center justify-between text-slate-700">
                <span>{index + 1}.</span>
                <span className="font-bold tracking-wider">{code}</span>
              </div>
            ))}
          </div>

          <button
            onClick={() => {
              setRegeneratedCodes(null);
              loadStatus();
            }}
            className="w-full px-4 py-3 bg-blue-600 rounded-lg text-white font-medium hover:bg-blue-700 transition-colors"
          >
            Đóng
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* 2FA Status Card */}
      <div className="bg-white rounded-xl shadow-lg p-8">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Xác thực 2 lớp</h2>
            <p className="text-slate-600 mt-1">Bảo vệ tài khoản của bạn bằng xác thực 2 lớp</p>
          </div>
          <div
            className={`px-4 py-2 rounded-full text-sm font-bold ${
              status?.is2FAEnabled
                ? "bg-green-100 text-green-800"
                : "bg-slate-100 text-slate-800"
            }`}
          >
            {status?.is2FAEnabled ? "Đã kích hoạt" : "Chưa kích hoạt"}
          </div>
        </div>

        {status?.is2FAEnabled && (
          <div className="space-y-4 mb-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex gap-3">
              <span className="material-symbols-outlined text-green-600 flex-shrink-0">
                check_circle
              </span>
              <div className="text-sm">
                <p className="font-semibold text-green-900">Tài khoản của bạn được bảo vệ</p>
                <p className="text-green-800 mt-1">
                  Bạn sẽ cần nhập mã xác thực khi đăng nhập từ thiết bị mới
                </p>
              </div>
            </div>

            {status.backupCodesRemaining <= 3 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex gap-3">
                <span className="material-symbols-outlined text-yellow-600 flex-shrink-0">
                  warning
                </span>
                <div className="text-sm">
                  <p className="font-semibold text-yellow-900">Mã phục hồi sắp hết</p>
                  <p className="text-yellow-800 mt-1">
                    Chỉ còn {status.backupCodesRemaining} mã. Hãy tạo mã mới ngay.
                  </p>
                </div>
              </div>
            )}

            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-slate-600">vpn_key</span>
                  <div>
                    <p className="font-semibold text-slate-900">Mã phục hồi</p>
                    <p className="text-sm text-slate-600">
                      {status.backupCodesRemaining} mã còn lại
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowRegenerateForm(true)}
                  className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                >
                  Tạo lại
                </button>
              </div>
            </div>
          </div>
        )}

        {!status?.is2FAEnabled ? (
          <button
            onClick={() => setShowSetup(true)}
            className="w-full px-6 py-3 bg-blue-600 rounded-lg text-white font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined">security</span>
            Kích hoạt xác thực 2 lớp
          </button>
        ) : (
          <button
            onClick={() => setShowDisableForm(true)}
            className="w-full px-6 py-3 bg-red-50 border border-red-200 rounded-lg text-red-600 font-medium hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined">block</span>
            Vô hiệu hóa xác thực 2 lớp
          </button>
        )}
      </div>

      {/* Disable 2FA Form */}
      {showDisableForm && (
        <div className="bg-white rounded-xl shadow-lg p-8 space-y-4 border border-red-200">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Vô hiệu hóa xác thực 2 lớp?</h3>
            <p className="text-slate-600 text-sm mt-1">
              Tài khoản của bạn sẽ ít được bảo vệ hơn. Bạn chắc chắn muốn tiếp tục?
            </p>
          </div>

          <input
            type="password"
            placeholder="Nhập mật khẩu của bạn"
            value={disablePassword}
            onChange={(e) => {
              setDisablePassword(e.target.value);
              setDisableError("");
            }}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-red-600 focus:border-transparent outline-none"
            disabled={disableLoading}
          />

          {disableError && (
            <div className="text-sm text-red-600">{disableError}</div>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => {
                setShowDisableForm(false);
                setDisablePassword("");
                setDisableError("");
              }}
              className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50 transition-colors"
              disabled={disableLoading}
            >
              Hủy
            </button>
            <button
              onClick={handleDisable2FA}
              className="flex-1 px-4 py-2 bg-red-600 rounded-lg text-white font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
              disabled={disableLoading}
            >
              {disableLoading ? "Đang xử lý..." : "Vô hiệu hóa"}
            </button>
          </div>
        </div>
      )}

      {/* Regenerate Backup Codes Form */}
      {showRegenerateForm && (
        <div className="bg-white rounded-xl shadow-lg p-8 space-y-4">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Tạo mã phục hồi mới?</h3>
            <p className="text-slate-600 text-sm mt-1">
              Mã cũ sẽ không còn hoạt động. Hãy lưu mã mới ở nơi an toàn.
            </p>
          </div>

          <input
            type="password"
            placeholder="Nhập mật khẩu của bạn"
            value={regeneratePassword}
            onChange={(e) => {
              setRegeneratePassword(e.target.value);
              setRegenerateError("");
            }}
            className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none"
            disabled={regenerateLoading}
          />

          {regenerateError && (
            <div className="text-sm text-red-600">{regenerateError}</div>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => {
                setShowRegenerateForm(false);
                setRegeneratePassword("");
                setRegenerateError("");
              }}
              className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-medium hover:bg-slate-50 transition-colors"
              disabled={regenerateLoading}
            >
              Hủy
            </button>
            <button
              onClick={handleRegenerate}
              className="flex-1 px-4 py-2 bg-blue-600 rounded-lg text-white font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
              disabled={regenerateLoading}
            >
              {regenerateLoading ? "Đang xử lý..." : "Tạo lại"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
