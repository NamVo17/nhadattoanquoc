'use client';

import React from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

/**
 * Payment Failed Page
 * Displayed when payment fails or is cancelled
 */
export default function PaymentFailed() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId') || '';
  const message = searchParams.get('message') || 'Thanh toán thất bại';

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        {/* Error Icon */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Thanh toán thất bại</h1>
          <p className="text-gray-600">{message}</p>
        </div>

        {/* Details */}
        {orderId && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex justify-between">
              <span className="text-gray-600">Mã đơn hàng:</span>
              <span className="font-mono text-sm font-semibold text-gray-900">{orderId}</span>
            </div>
          </div>
        )}

        {/* Error Message */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-900 text-sm">
            ❌ Giao dịch thanh toán không thành công. Vui lòng thử lại hoặc chọn phương thức thanh toán khác.
          </p>
        </div>

        {/* Possible Reasons */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-yellow-900 text-sm font-semibold mb-2">Các lý do có thể:</p>
          <ul className="text-yellow-900 text-sm space-y-1">
            <li>• Số tiền trong tài khoản không đủ</li>
            <li>• Thẻ hoặc tài khoản bị khóa</li>
            <li>• Kết nối mạng bị gián đoạn</li>
            <li>• OTP không hợp lệ hoặc hết hạn</li>
          </ul>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <Link
            href="/payment"
            className="block w-full bg-blue-600 text-white text-center py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Thử lại thanh toán
          </Link>
          <Link
            href="/dashboard"
            className="block w-full bg-gray-100 text-gray-900 text-center py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
          >
            Quay lại bảng điều khiển
          </Link>
        </div>

        {/* Support */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-600 text-center">
            Nếu vấn đề vẫn tiếp diễn, vui lòng liên hệ với bộ phận hỗ trợ:
            <br />
            <a href="mailto:support@nhadattoanquoc.vn" className="text-blue-600 hover:underline">
              support@nhadattoanquoc.vn
            </a>
            <br />
            <a href="tel:1900xxxx" className="text-blue-600 hover:underline">
              1900 xxxx
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
