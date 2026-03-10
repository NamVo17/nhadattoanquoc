/**
 * Admin - KYC Approval Page
 * Manage KYC verification requests
 */

'use client';

import { useState, useEffect } from 'react';

interface KYCRequest {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  phone: string;
  id_type: string;
  id_number: string;
  id_image_front: string;
  id_image_back: string;
  status: string;
  verification_score: number;
  submitted_at: string;
  users?: {
    avatar_url: string;
  };
}

export default function KYCApprovalPage() {
  const [kycRequests, setKycRequests] = useState<KYCRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<KYCRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectionForm, setShowRejectionForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("pending");
  const [page, setPage] = useState(1);
  const limit = 10;

  // Fetch KYC requests
  useEffect(() => {
    fetchKYCRequests();
  }, [page, filterStatus]);

  const fetchKYCRequests = async () => {
    try {
      setLoading(true);
      const offset = (page - 1) * limit;
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
      const res = await fetch(
        `${apiUrl}/kyc/admin/pending?limit=${limit}&offset=${offset}`,
        {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );
      const data = await res.json();
      if (data.success) {
        setKycRequests(data.data);
      }
    } catch (err) {
      console.error("Failed to fetch KYC requests:", err);
      setError("Không thể tải danh sách KYC.");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async () => {
    if (!selectedRequest) return;

    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
      const res = await fetch(`${apiUrl}/kyc/admin/${selectedRequest.id}/approve`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body: JSON.stringify({ verificationScore: 100 }),
      });

      const data = await res.json();
      if (data.success) {
        setSuccess("Xác thực KYC thành công!");
        setSelectedRequest(null);
        setShowRejectionForm(false);
        setTimeout(() => {
          fetchKYCRequests();
        }, 1500);
      } else {
        setError(data.message || "Có lỗi xảy ra.");
      }
    } catch (err) {
      setError("Có lỗi xảy ra khi phê duyệt KYC.");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!selectedRequest || !rejectionReason.trim()) {
      setError("Vui lòng nhập lý do từ chối.");
      return;
    }

    setSubmitting(true);
    setError("");
    setSuccess("");

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
      const res = await fetch(`${apiUrl}/kyc/admin/${selectedRequest.id}/reject`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("accessToken")}`,
        },
        body: JSON.stringify({ reason: rejectionReason }),
      });

      const data = await res.json();
      if (data.success) {
        setSuccess("Đã từ chối yêu cầu KYC.");
        setSelectedRequest(null);
        setShowRejectionForm(false);
        setRejectionReason("");
        setTimeout(() => {
          fetchKYCRequests();
        }, 1500);
      } else {
        setError(data.message || "Có lỗi xảy ra.");
      }
    } catch (err) {
      setError("Có lỗi xảy ra khi từ chối KYC.");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredRequests = kycRequests.filter((request) =>
    request.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    request.phone.includes(searchTerm)
  );

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Xác thực danh tính KYC</h1>
        <p className="text-slate-600 mt-1">
          Quản lý và phê duyệt các yêu cầu xác thực danh tính (KYC)
        </p>
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex gap-3">
            <span className="material-symbols-outlined text-red-600">error</span>
            <p className="text-sm text-red-600">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
          <div className="flex gap-3">
            <span className="material-symbols-outlined text-emerald-600">check_circle</span>
            <p className="text-sm text-emerald-600">{success}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* KYC List */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
          <div className="p-6 border-b border-slate-200">
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Tìm kiếm theo tên, email, SDT..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          {loading ? (
            <div className="p-6 text-center">
              <div className="inline-block animate-spin">
                <span className="material-symbols-outlined text-3xl text-primary">hourglass_empty</span>
              </div>
              <p className="mt-2 text-slate-600">Đang tải...</p>
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="p-6 text-center">
              <span className="material-symbols-outlined text-4xl text-slate-300 block mb-2">inbox</span>
              <p className="text-slate-600">Không có yêu cầu KYC nào.</p>
            </div>
          ) : (
            <>
              <div className="space-y-2 p-6 flex-1 overflow-y-auto max-h-[600px]">
                {filteredRequests.map((request) => (
                  <div
                    key={request.id}
                    onClick={() => setSelectedRequest(request)}
                    className={`p-4 border rounded-lg cursor-pointer transition-all ${
                      selectedRequest?.id === request.id
                        ? 'border-primary bg-primary/5'
                        : 'border-slate-200 hover:border-primary'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-lg">
                        {request.users?.avatar_url ? (
                          <img src={request.users.avatar_url} alt={request.full_name} className="w-full h-full rounded-full object-cover" />
                        ) : (
                          "👤"
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-semibold text-slate-900 truncate">
                            {request.full_name}
                          </p>
                          <span className={`text-xs font-semibold px-2 py-1 rounded-full whitespace-nowrap ${
                            request.status === 'verified'
                              ? 'bg-green-100 text-green-800'
                              : request.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {request.status === 'verified'
                              ? '✓ Đã xác minh'
                              : request.status === 'pending'
                              ? '⏳ Chờ phê duyệt'
                              : '✕ Bị từ chối'}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 truncate">
                          {request.email} | {request.phone}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between p-6 border-t border-slate-200">
                <p className="text-xs text-slate-600">
                  Trang {page}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(Math.max(1, page - 1))}
                    disabled={page === 1}
                    className="px-3 py-1 border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50"
                  >
                    ←
                  </button>
                  <button className="px-3 py-1 bg-primary text-white rounded-lg">{page}</button>
                  <button
                    onClick={() => setPage(page + 1)}
                    className="px-3 py-1 border border-slate-200 rounded-lg hover:bg-slate-50"
                  >
                    →
                  </button>
                </div>
              </div>
            </>
          )}
        </div>

        {/* KYC Detail */}
        {selectedRequest && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-200">
              <h3 className="font-semibold text-slate-900">Chi tiết xác thực</h3>
            </div>

            <div className="p-6 space-y-4 flex-1 overflow-y-auto">
              {/* User Info */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-slate-600 uppercase">Thông tin người dùng</p>
                <div className="bg-slate-50 p-3 rounded-lg text-sm">
                  <p className="font-semibold text-slate-900">{selectedRequest.full_name}</p>
                  <p className="text-slate-600">{selectedRequest.email}</p>
                  <p className="text-slate-600">{selectedRequest.phone}</p>
                </div>
              </div>

              {/* ID Info */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-slate-600 uppercase">Thông tin giấy tờ</p>
                <div className="bg-slate-50 p-3 rounded-lg text-sm space-y-1">
                  <p><span className="font-semibold">Loại:</span> {selectedRequest.id_type}</p>
                  <p><span className="font-semibold">Số:</span> {selectedRequest.id_number}</p>
                </div>
              </div>

              {/* Verification Score */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-slate-600 uppercase">Điểm xác thực</p>
                <div className="bg-slate-50 p-3 rounded-lg">
                  <p className="text-lg font-bold text-primary">{selectedRequest.verification_score}%</p>
                  <p className="text-xs text-slate-500">Độ khớp nhất định</p>
                </div>
              </div>

              {/* ID Images */}
              {selectedRequest.id_image_front && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-slate-600 uppercase">Mặt trước</p>
                  <img
                    src={selectedRequest.id_image_front}
                    alt="ID Front"
                    className="w-full h-40 object-cover rounded-lg border border-slate-200"
                  />
                </div>
              )}

              {selectedRequest.id_image_back && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-slate-600 uppercase">Mặt sau</p>
                  <img
                    src={selectedRequest.id_image_back}
                    alt="ID Back"
                    className="w-full h-40 object-cover rounded-lg border border-slate-200"
                  />
                </div>
              )}

              {/* Submitted Date */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-slate-600 uppercase">Ngày gửi</p>
                <p className="text-sm text-slate-700">
                  {new Date(selectedRequest.submitted_at).toLocaleString("vi-VN")}
                </p>
              </div>
            </div>

            {/* Actions */}
            {selectedRequest.status === 'pending' && (
              <>
                <div className="p-6 border-t border-slate-200 space-y-2">
                  <button
                    onClick={handleApprove}
                    disabled={submitting}
                    className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <span className="material-symbols-outlined text-sm">check_circle</span>
                    {submitting ? "Đang xử lý..." : "Phê duyệt KYC"}
                  </button>
                  <button
                    onClick={() => setShowRejectionForm(!showRejectionForm)}
                    className="w-full py-2.5 border border-red-300 text-red-600 hover:bg-red-50 font-medium rounded-lg transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm inline mr-2">cancel</span>
                    Từ chối
                  </button>
                </div>

                {showRejectionForm && (
                  <div className="p-6 border-t border-slate-200 space-y-3 bg-red-50">
                    <textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Nhập lý do từ chối..."
                      className="w-full px-3 py-2 border border-red-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
                      rows={3}
                      disabled={submitting}
                    />
                    <button
                      onClick={handleReject}
                      disabled={submitting || !rejectionReason.trim()}
                      className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
                    >
                      {submitting ? "Đang xử lý..." : "Xác nhận từ chối"}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
