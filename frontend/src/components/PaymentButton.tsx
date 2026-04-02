'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import { authorizedFetch } from '@/lib/authorizedFetch';

interface PaymentButtonProps {
  propertyId: string;
  packageType: 'vip' | 'diamond';
  method: 'momo' | 'vnpay';
  disabled?: boolean;
  isLoading?: boolean;
  onLoadingChange?: (loading: boolean) => void;
  buttonClassName?: string;
  buttonText?: string;
  useCustomStyles?: boolean;
}

const PACKAGE_PRICES: Record<'vip' | 'diamond', number> = {
  vip: 50000,
  diamond: 150000,
};

const METHOD_LABELS: Record<'momo' | 'vnpay', string> = {
  momo: 'Thanh toán qua MoMo',
  vnpay: 'Thanh toán qua VNPay',
};

const METHOD_ICONS: Record<'momo' | 'vnpay', string> = {
  momo: '💬',
  vnpay: '🏦',
};

/**
 * PaymentButton - Initiates payment with selected gateway
 * Handles loading states, error handling, and redirects to payment page
 */
export const PaymentButton: React.FC<PaymentButtonProps> = ({
  propertyId,
  packageType,
  method,
  disabled = false,
  isLoading = false,
  onLoadingChange,
  buttonClassName = 'w-full',
  buttonText,
  useCustomStyles = false,
}) => {
  const [localLoading, setLocalLoading] = useState(false);
  const loading = isLoading || localLoading;

  const handlePayment = async () => {
    try {
      setLocalLoading(true);
      onLoadingChange?.(true);

      // Validate inputs
      if (!propertyId || !packageType) {
        toast.error('Thiếu thông tin bất động sản hoặc gói tin');
        return;
      }

      // Call backend to create payment request using authorizedFetch
      // This will auto-handle token refresh on 401
      const response = await authorizedFetch(`/payments/${method}/create`, {
        method: 'POST',
        body: JSON.stringify({
          propertyId,
          packageType,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        toast.error(errorData.message || `Lỗi tạo yêu cầu thanh toán ${method.toUpperCase()}`);
        return;
      }

      const data = await response.json();

      if (!data.success || !data.data?.paymentUrl) {
        toast.error('Không thể tạo liên kết thanh toán');
        return;
      }

      // Redirect to payment gateway
      toast.success('Đang chuyển hướng đến cổng thanh toán...');
      window.location.href = data.data.paymentUrl;
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Lỗi khi xử lý thanh toán, vui lòng thử lại');
    } finally {
      setLocalLoading(false);
      onLoadingChange?.(false);
    }
  };

  const price = PACKAGE_PRICES[packageType];

  return (
    <button
      onClick={handlePayment}
      disabled={disabled || loading}
      className={`${buttonClassName}${useCustomStyles ? '' : ' px-4 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed'}`}
      {...(!useCustomStyles && {
        style: {
          backgroundColor:
            method === 'momo'
              ? loading
                ? '#e0e0e0'
                : '#A60035'
              : loading
                ? '#e0e0e0'
                : '#1434CB',
          color: 'white',
        },
      })}
    >
      {buttonText ? (
        <span>{loading ? 'Đang xử lý...' : buttonText}</span>
      ) : (
        <>
          <span>{METHOD_ICONS[method]}</span>
          <span>
            {loading ? 'Đang xử lý...' : `${METHOD_LABELS[method]} - ${price.toLocaleString('vi-VN')} đ`}
          </span>
        </>
      )}
    </button>
  );
};

export default PaymentButton;
