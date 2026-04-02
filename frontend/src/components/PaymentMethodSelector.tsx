'use client';
import React, { useState } from 'react';
import { toast } from 'sonner';
import { authorizedFetch } from '@/lib/authorizedFetch';
import Header from './layout/Header';
import Image from "next/image";

interface PaymentMethodSelectorProps {
  propertyId?: string;
  packageType?: 'vip' | 'diamond';
  propertyPrice?: number;
}

const PACKAGE_PRICES: Record<'vip' | 'diamond', number> = {
  vip: 50000,
  diamond: 150000,
};

/**
 * PaymentMethodSelector - Displays payment methods and initiates payment
 * Shows MoMo and VNPay options with total payment amount
 */
export const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  propertyId = '',
  packageType = 'vip',
}) => {
  const [selectedMethod, setSelectedMethod] = useState<'momo' | 'vnpay'>('momo');
  const [isLoading, setIsLoading] = useState(false);

  const totalPrice = PACKAGE_PRICES[packageType] || 50000;

  const handlePayment = async () => {
    try {
      setIsLoading(true);

      if (!propertyId || !packageType) {
        toast.error('Thiếu thông tin bất động sản hoặc gói tin');
        return;
      }

      const response = await authorizedFetch(`/payments/${selectedMethod}/create`, {
        method: 'POST',
        body: JSON.stringify({
          propertyId,
          packageType,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        toast.error(errorData.message || `Lỗi tạo yêu cầu thanh toán ${selectedMethod.toUpperCase()}`);
        return;
      }

      const data = await response.json();

      if (!data.success || !data.data?.paymentUrl) {
        toast.error('Không thể tạo liên kết thanh toán');
        return;
      }

      toast.success('Đang chuyển hướng đến cổng thanh toán...');
      window.location.href = data.data.paymentUrl;
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Lỗi khi xử lý thanh toán, vui lòng thử lại');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <Header />
      
      {/* Breadcrumb */}
      <div style={{ padding: '1.5rem 2rem', background: '#f5f5f5', fontSize: '18px', color: '#666' }}>
        <span style={{ cursor: 'pointer', color: '#bbb' }}>Thanh toán</span>
        <span style={{ margin: '0 8px', color: '#ae2070' }}>/</span>
        <span style={{ margin: '0 8px', color: '#ae2070' }}>Thanh toán phí</span>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 200px)', padding: '2rem 1rem', background: '#f5f5f5' }}>
      
      <div style={{ background: '#ffffff', borderRadius: '20px', border: '0.5px solid #e0e0e0', width: '100%', maxWidth: '420px', overflow: 'hidden', boxShadow: '0 4px 24px rgba(0,0,0,0.06)' }}>
        {/* Total Section */}
        <div style={{ padding: '1.5rem 1.5rem 1.25rem', borderBottom: '0.5px solid #e0e0e0' }}>
          <p style={{ fontSize: '13px', color: '#888', marginBottom: '4px', fontWeight: 400 }}>
            Tổng thanh toán
          </p>
          <p style={{ fontSize: '28px', fontWeight: 700, color: '#111', letterSpacing: '-0.5px' }}>
            {totalPrice.toLocaleString('vi-VN')} ₫
          </p>
        </div>

        {/* Methods Section */}
        <div style={{ padding: '1.25rem 1.5rem 1.5rem' }}>
          <p style={{ fontSize: '11px', fontWeight: 600, color: '#999', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '12px' }}>
            Chọn phương thức
          </p>

          {/* MoMo Option */}
          <button
            onClick={() => setSelectedMethod('momo')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              padding: '14px 16px',
              borderRadius: '14px',
              border: `1.5px solid ${selectedMethod === 'momo' ? '#ae2070' : '#e0e0e0'}`,
              cursor: 'pointer',
              marginBottom: '10px',
              background: selectedMethod === 'momo' ? '#fdf0f5' : '#fff',
              transition: 'border-color 0.2s, background 0.2s',
              width: '100%',
            }}
          >
            <div style={{ width: '44px', height: '44px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: '#ae2070', fontSize: '13px', fontWeight: 800, color: 'white', letterSpacing: '-0.5px' }}>
              MoMo
            </div>
            <div style={{ flex: 1, textAlign: 'left' }}>
              <p style={{ fontSize: '15px', fontWeight: 600, color: '#111', marginBottom: '2px' }}>
                Ví MoMo
              </p>
              <p style={{ fontSize: '12px', color: '#888', fontWeight: 400 }}>
                Thanh toán qua ví điện tử MoMo
              </p>
            </div>
            <div style={{
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              border: `1.5px solid ${selectedMethod === 'momo' ? '#ae2070' : '#ccc'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              background: selectedMethod === 'momo' ? '#ae2070' : 'transparent',
              transition: 'border-color 0.2s, background 0.2s',
            }}>
              {selectedMethod === 'momo' && (
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: 'white',
                }} />
              )}
            </div>
          </button>

          {/* VNPay Option */}
          <button
            onClick={() => setSelectedMethod('vnpay')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              padding: '14px 16px',
              borderRadius: '14px',
              border: `1.5px solid ${selectedMethod === 'vnpay' ? '#0066b3' : '#e0e0e0'}`,
              cursor: 'pointer',
              marginBottom: '0',
              background: selectedMethod === 'vnpay' ? '#f0f4f9' : '#fff',
              transition: 'border-color 0.2s, background 0.2s',
              width: '100%',
            }}
          >
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                background: '#0066b3',
                fontSize: '11px',
                fontWeight: 800,
                color: 'white',
                letterSpacing: '-0.5px',
              }}
            >
              <Image src="/assets/vnpay.png" alt="VNPay" width={44} height={44} style={{ objectFit: 'contain' }} />
            </div>
            <div style={{ flex: 1, textAlign: 'left' }}>
              <p style={{ fontSize: '15px', fontWeight: 600, color: '#111', marginBottom: '2px' }}>
                VNPay
              </p>
              <p style={{ fontSize: '12px', color: '#888', fontWeight: 400 }}>
                Thanh toán qua cổng VNPay
              </p>
            </div>
            <div style={{
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              border: `1.5px solid ${selectedMethod === 'vnpay' ? '#0066b3' : '#ccc'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              background: selectedMethod === 'vnpay' ? '#0066b3' : 'transparent',
              transition: 'border-color 0.2s, background 0.2s',
            }}>
              {selectedMethod === 'vnpay' && (
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: 'white',
                }} />
              )}
            </div>
          </button>

          {/* Payment Button */}
          <button
            onClick={handlePayment}
            disabled={isLoading}
            style={{
              display: 'block',
              width: '100%',
              padding: '16px',
              background: selectedMethod === 'momo' ? '#ae2070' : '#0066b3',
              color: 'white',
              border: 'none',
              borderRadius: '14px',
              fontSize: '16px',
              fontWeight: 600,
              cursor: isLoading ? 'not-allowed' : 'pointer',
              fontFamily: 'Be Vietnam Pro, sans-serif',
              marginTop: '1.25rem',
              transition: 'background 0.2s, transform 0.1s',
              letterSpacing: '0.01em',
              opacity: isLoading ? 0.8 : 1,
            }}
            onMouseEnter={(e) => {
              if (!isLoading) {
                if (selectedMethod === 'momo') {
                  (e.target as HTMLButtonElement).style.background = '#951b60';
                } else {
                  (e.target as HTMLButtonElement).style.background = '#004f8c';
                }
              }
            }}
            onMouseLeave={(e) => {
              if (!isLoading) {
                if (selectedMethod === 'momo') {
                  (e.target as HTMLButtonElement).style.background = '#ae2070';
                } else {
                  (e.target as HTMLButtonElement).style.background = '#0066b3';
                }
              }
            }}
          >
            {isLoading ? 'Đang xử lý...' : `Thanh toán ${totalPrice.toLocaleString('vi-VN')} ₫`}
          </button>

          {/* Security Note */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            marginTop: '12px',
            fontSize: '12px',
            color: '#aaa',
          }}>
            <svg style={{ width: '14px', height: '14px', opacity: 0.5 }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            <span>Giao dịch được bảo mật &amp; mã hóa SSL</span>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
};

export default PaymentMethodSelector;
