'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { PaymentMethodSelector } from '@/components/PaymentMethodSelector';
import { authorizedFetch } from '@/lib/authorizedFetch';

interface Property {
  id: string;
  title: string;
  price: number;
  package: 'free' | 'vip' | 'diamond';
  package_expires_at?: string;
}

/**
 * Payment Page - Main payment checkout page
 * Users can select a property and package type to upgrade
 */
export default function PaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get propertyId from URL (passed from post/edit form)
  const propertyIdFromUrl = searchParams?.get('propertyId') || '';
  
  // Get packageType from URL or default to 'vip'
  const packageType = (searchParams?.get('package') as 'vip' | 'diamond') || 'vip';

  // Fetch user's properties
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        setLoading(true);
        
        // Check if token exists, if not redirect to login
        const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
        if (!token) {
          router.push('/login');
          return;
        }

        // Use authorizedFetch for automatic token refresh on 401
        const response = await authorizedFetch('/properties/agent');

        if (!response.ok) {
          if (response.status === 401) {
            // Token still invalid after refresh attempt
            localStorage.removeItem('accessToken');
            localStorage.removeItem('refreshToken');
            router.push('/login?expired=true');
            return;
          }
          throw new Error('Không thể tải danh sách bất động sản');
        }

        const data = await response.json();
        setProperties(data.data || []);

        if (data.data && data.data.length > 0) {
          // If propertyId is in URL, use it; otherwise select the first property
          if (propertyIdFromUrl && data.data.some((p: Property) => p.id === propertyIdFromUrl)) {
            setSelectedPropertyId(propertyIdFromUrl);
            console.log('✓ Selected property from URL:', propertyIdFromUrl);
          } else {
            setSelectedPropertyId(data.data[0].id);
            console.log('⚠️ PropertyId from URL not found, using first property:', data.data[0].id);
          }
        } else {
          setError('Bạn không có bất động sản nào. Vui lòng tạo bất động sản trước.');
        }
      } catch (err) {
        console.error('Error fetching properties:', err);
        setError(err instanceof Error ? err.message : 'Lỗi khi tải dữ liệu');
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, [router, propertyIdFromUrl]);

  const selectedProperty = properties.find((p) => p.id === selectedPropertyId);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  if (error || properties.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Không thể tiếp tục</h2>
          <p className="text-gray-600 mb-6">{error || 'Bạn không có bất động sản nào'}</p>
          <a
            href="/post"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Tạo bất động sản mới
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {selectedProperty ? (
        <PaymentMethodSelector
          propertyId={selectedProperty.id}
          packageType={packageType}
        />
      ) : (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-card rounded-lg shadow-lg p-8 text-center border border-border">
            <div className="text-4xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-foreground mb-4">Không thể tiếp tục</h2>
            <p className="text-muted-foreground mb-6">{error || 'Bạn không có bất động sản nào'}</p>
            <a
              href="/post"
              className="inline-block bg-momo text-primary-foreground px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition-opacity"
            >
              Tạo bất động sản mới
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
