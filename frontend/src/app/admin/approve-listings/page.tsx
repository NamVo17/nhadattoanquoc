'use client';

import { useState, useEffect, useCallback } from 'react';
import { authorizedFetch } from '@/lib/authorizedFetch';

interface PaymentRecord {
  id: string;
  property_id: string;
  user_id: string;
  package: 'vip' | 'diamond';
  amount: number;
  payment_method: string;
  transaction_ref?: string;
  proof_image_url?: string;
  status: 'pending' | 'confirmed' | 'rejected';
  created_at: string;
  confirmed_at?: string;
  notes?: string;
  property?: {
    id: string;
    title: string;
    slug: string;
    type: string;
    city: string;
    district: string;
  };
  user?: {
    id: string;
    full_name: string;
    email: string;
    phone?: string;
  };
}

const PACKAGE_PRICE: Record<string, string> = {
  vip: '50.000đ',
  diamond: '150.000đ',
};

const STATUS_LABELS: Record<string, { label: string; cls: string }> = {
  pending:   { label: 'Chờ xác nhận', cls: 'bg-yellow-100 text-yellow-800' },
  confirmed: { label: 'Đã xác nhận',  cls: 'bg-green-100 text-green-800' },
  rejected:  { label: 'Đã từ chối',   cls: 'bg-red-100 text-red-800' },
};

const PACKAGE_LABELS: Record<string, { label: string; cls: string }> = {
  vip:     { label: 'VIP',     cls: 'bg-blue-100 text-blue-700' },
  diamond: { label: 'Diamond', cls: 'bg-purple-100 text-purple-700' },
};

function formatDate(dateStr: string) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}, ${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
}

function formatAmount(amount: number) {
  return amount?.toLocaleString('vi-VN') + 'đ';
}

export default function ApproveListingsPage() {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [proofModal, setProofModal] = useState<string | null>(null);
  const [rejectModal, setRejectModal] = useState<{ id: string } | null>(null);
  const [rejectNote, setRejectNote] = useState('');

  const fetchPayments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const params = statusFilter ? `?status=${statusFilter}` : '';
      const res = await authorizedFetch(`/payments${params}`);
      if (!res.ok) throw new Error('Không thể tải dữ liệu thanh toán');
      const json = await res.json();
      setPayments(json.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Lỗi không xác định');
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  const handleConfirm = async (id: string) => {
    if (!window.confirm('Xác nhận thanh toán này? Tin đăng sẽ được duyệt và hiển thị công khai.')) return;
    setActionLoading(id);
    try {
      const res = await authorizedFetch(`/payments/${id}/confirm`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) });
      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        throw new Error(e.message || 'Lỗi xác nhận');
      }
      await fetchPayments();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Lỗi xác nhận thanh toán');
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async () => {
    if (!rejectModal) return;
    setActionLoading(rejectModal.id);
    try {
      const res = await authorizedFetch(`/payments/${rejectModal.id}/reject`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes: rejectNote }),
      });
      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        throw new Error(e.message || 'Lỗi từ chối');
      }
      setRejectModal(null);
      setRejectNote('');
      await fetchPayments();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Lỗi từ chối thanh toán');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Phê duyệt tin đăng</h1>
        <p className="text-slate-600 mt-1">Quản lý và phê duyệt các tin đăng bất động sản</p>
      </div>

      {/* Filters */}
      <div className="admin-card">
        <div className="flex flex-wrap gap-4 items-center">
          <div>
            <label className="text-sm font-medium text-slate-700">Trạng thái</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="mt-1 px-3 py-2 border border-slate-200 rounded-lg p-2 ml-2"
            >
              <option value="">Tất cả</option>
              <option value="pending">Chờ xác nhận</option>
              <option value="confirmed">Đã xác nhận</option>
              <option value="rejected">Đã từ chối</option>
            </select>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <button
              onClick={fetchPayments}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-bold hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2"
            >
              <span className="material-symbols-outlined text-lg">refresh</span>
              Làm mới
            </button>
            <div className="text-sm text-slate-500">
              {!loading && <span>Tổng: <strong>{payments.length}</strong> giao dịch</span>}
            </div>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          ⚠️ {error}
          <button onClick={fetchPayments} className="ml-4 underline text-red-600">Thử lại</button>
        </div>
      )}

      {/* Table */}
      <div className="admin-card overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent" />
          </div>
        ) : payments.length === 0 ? (
          <div className="text-center py-16 text-slate-500">
            <p className="text-lg font-medium">Không có giao dịch nào</p>
            <p className="text-sm mt-1">
              {statusFilter === 'pending' ? 'Chưa có yêu cầu xác nhận thanh toán mới.' : 'Không có dữ liệu.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full min-w-[1200px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  {['TIN ĐĂNG', 'MÔI GIỚI', 'GÓI / SỐ TIỀN', 'PHƯƠNG THỨC', 'NGÀY GỬI', 'TRẠNG THÁI', 'HÀNH ĐỘNG'].map((h) => (
                    <th key={h} className="text-left px-6 py-4 text-xs font-semibold text-slate-600 uppercase whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id} className="border-b border-slate-100 last:border-b-0 hover:bg-slate-50 transition-colors">
                    {/* Property */}
                    <td className="px-6 py-4 max-w-[220px]">
                      <p className="font-medium text-slate-900 text-sm line-clamp-2">
                        {p.property?.title || '—'}
                      </p>
                      {p.property?.city && (
                        <p className="text-xs text-slate-500 mt-0.5">
                          {p.property.district}, {p.property.city}
                        </p>
                      )}
                    </td>

                    {/* Agent */}
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-slate-900">{p.user?.full_name || '—'}</p>
                      <p className="text-xs text-slate-500">{p.user?.email}</p>
                      {p.user?.phone && <p className="text-xs text-slate-400">{p.user.phone}</p>}
                    </td>

                    {/* Package / Amount */}
                    <td className="px-6 py-4">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${PACKAGE_LABELS[p.package]?.cls || 'bg-slate-100 text-slate-600'}`}>
                        {PACKAGE_LABELS[p.package]?.label || p.package}
                      </span>
                      <p className="text-sm font-bold text-slate-800 mt-1">{formatAmount(p.amount)}</p>
                    </td>

                    {/* Payment Method + Proof */}
                    <td className="px-6 py-4">
                      <p className="text-xs text-slate-700 capitalize">{p.payment_method?.replace('bank', 'Ngân hàng')}</p>
                      {p.transaction_ref && (
                        <p className="text-xs text-slate-500 mt-0.5 font-mono">#{p.transaction_ref}</p>
                      )}
                      {p.proof_image_url && (
                        <button
                          onClick={() => setProofModal(p.proof_image_url!)}
                          className="mt-1 text-xs text-blue-600 underline hover:text-blue-800"
                        >
                          Xem ảnh
                        </button>
                      )}
                    </td>

                    {/* Date */}
                    <td className="px-6 py-4">
                      <p className="text-xs text-slate-600">{formatDate(p.created_at)}</p>
                      {p.confirmed_at && (
                        <p className="text-xs text-slate-400 mt-0.5">Duyệt: {formatDate(p.confirmed_at)}</p>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-xs font-semibold px-3 py-1 rounded-full ${STATUS_LABELS[p.status]?.cls}`}>
                        {STATUS_LABELS[p.status]?.label || p.status}
                      </span>
                      {p.notes && (
                        <p className="text-xs text-slate-400 mt-1 italic">"{p.notes}"</p>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      {p.status === 'pending' ? (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleConfirm(p.id)}
                            disabled={actionLoading === p.id}
                            className="flex items-center gap-1 px-3 py-1.5 bg-green-50 hover:bg-green-100 text-green-700 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                          >
                            {actionLoading === p.id ? (
                              <span className="animate-spin inline-block w-3 h-3 border border-green-600 border-t-transparent rounded-full" />
                            ) : (
                              <span className="material-symbols-outlined text-sm">check_circle</span>
                            )}
                            Xác nhận
                          </button>
                          <button
                            onClick={() => { setRejectModal({ id: p.id }); setRejectNote(''); }}
                            disabled={actionLoading === p.id}
                            className="flex items-center gap-1 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50"
                          >
                            <span className="material-symbols-outlined text-sm">cancel</span>
                            Từ chối
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Proof Image Modal */}
      {proofModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
          onClick={() => setProofModal(null)}
        >
          <div className="bg-white rounded-xl p-4 max-w-lg w-full mx-4 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-semibold text-slate-800">Ảnh chứng minh thanh toán</h3>
              <button onClick={() => setProofModal(null)} className="text-slate-400 hover:text-slate-700">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <img src={proofModal} alt="Proof" className="w-full rounded-lg object-contain max-h-[70vh]" />
          </div>
        </div>
      )}

      {/* Reject Note Modal */}
      {rejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <h3 className="font-semibold text-slate-800 mb-3">Từ chối thanh toán</h3>
            <p className="text-sm text-slate-600 mb-4">Nhập lý do từ chối (tùy chọn, sẽ thông báo cho môi giới):</p>
            <textarea
              value={rejectNote}
              onChange={(e) => setRejectNote(e.target.value)}
              rows={3}
              placeholder="VD: Ảnh chứng minh không rõ ràng..."
              className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-300 focus:outline-none resize-none"
            />
            <div className="flex gap-3 mt-4 justify-end">
              <button
                onClick={() => { setRejectModal(null); setRejectNote(''); }}
                className="px-4 py-2 text-sm rounded-lg border border-slate-200 hover:bg-slate-50"
              >
                Huỷ
              </button>
              <button
                onClick={handleReject}
                disabled={actionLoading === rejectModal.id}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {actionLoading === rejectModal.id ? 'Đang xử lý...' : 'Xác nhận từ chối'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
