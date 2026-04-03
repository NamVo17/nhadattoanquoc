'use client';

import React, { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { authorizedFetch } from '@/lib/authorizedFetch';

/**
 * Inner component that reads search params (must be inside Suspense)
 */
function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId') || '';
  const transId = searchParams.get('transId') || '';
  const message = searchParams.get('message') || 'Thanh toán thành công';
  const [timestamp, setTimestamp] = useState<string>('');
  const [isClient, setIsClient] = useState(false);

  // Only render timestamp on client to avoid hydration mismatch
  useEffect(() => {
    setIsClient(true);
    setTimestamp(new Date().toLocaleString('vi-VN'));
  }, []);

  // Invalidate property cache and refresh data on mount
  useEffect(() => {
    const invalidateCache = async () => {
      try {
        // Call API to refresh property data (warm cache)
        await authorizedFetch('/properties/agent');
        
        // Set flag to signal dashboard to refresh
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('paymentSuccess', 'true');
          sessionStorage.setItem('paymentRefreshTime', Date.now().toString());
        }
      } catch (error) {
        console.warn('Could not pre-warm cache:', error);
        // Still set the flag even if pre-warming fails
        if (typeof window !== 'undefined') {
          sessionStorage.setItem('paymentSuccess', 'true');
        }
      }
    };

    invalidateCache();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        {/* Success Icon */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
            <svg
              className="w-8 h-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Thanh toán thành công!</h1>
          <p className="text-gray-600">{message}</p>
        </div>

        {/* Details */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6 space-y-3">
          {orderId && (
            <div className="flex justify-between">
              <span className="text-gray-600">Mã đơn hàng:</span>
              <span className="font-mono text-sm font-semibold text-gray-900">{orderId}</span>
            </div>
          )}
          {transId && (
            <div className="flex justify-between">
              <span className="text-gray-600">Mã giao dịch:</span>
              <span className="font-mono text-sm font-semibold text-gray-900">{transId}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-gray-600">Thời gian:</span>
            <span className="text-sm font-semibold text-gray-900">
              {isClient ? timestamp : '—'}
            </span>
          </div>
        </div>

        {/* Message */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
          <p className="text-green-900 text-sm">
            ✓ Tin đăng của bạn đã được thanh toán phí thành công. Gói tin sẽ có hiệu lực ngay lập tức.
          </p>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <Link
            href="/dashboard"
            className="block w-full bg-green-600 text-white text-center py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
          >
            Quay lại bảng điều khiển
          </Link>
          <Link
            href="/dashboard/properties"
            className="block w-full bg-gray-100 text-gray-900 text-center py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
          >
            Xem tin đăng của tôi
          </Link>
        </div>

        {/* Support */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-600 text-center">
            Nếu bạn cần hỗ trợ, vui lòng liên hệ:
            <br />
            <a href="mailto:support@nhadattoanquoc.vn" className="text-blue-600 hover:underline">
              nhadattoanquoc9@gmail.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

/**
 * Payment Success Page
 * Wrapped in Suspense to support useSearchParams() during SSG/prerender
 */
export default function PaymentSuccess() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-blue-50 flex items-center justify-center">
        <div className="text-gray-500">Đang tải...</div>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}
