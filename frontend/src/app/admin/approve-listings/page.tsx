/**
 * Admin - Approve Listings Page
 * Manage and approve property listings
 */

'use client';

import { useState } from 'react';

const listings = [
  {
    id: 1,
    title: 'Biệt thự song lập...',
    location: 'Gò Vấp, Hà Nội + 120m²',
    owner: 'Nguyễn Anh',
    status: 'WAITING',
    submittedDate: '14:20, 24/05/2024',
    image: '🏠',
  },
  {
    id: 2,
    title: 'Căn hộ studio Sun...',
    location: 'Quận 1, TP HCM + 35m²',
    owner: 'Trần Minh',
    status: 'WAITING',
    submittedDate: '10:05, 24/05/2024',
    image: '🏢',
  },
  {
    id: 3,
    title: 'Nhà phố mặt tiền...',
    location: 'Phú Nhuận, TP HCM + 80m²',
    owner: 'Lê Huy',
    status: 'REJECTED',
    submittedDate: '08:45, 24/05/2024',
    image: '🏘️',
  },
];

export default function ApproveListingsPage() {
  const [selectedStatus, setSelectedStatus] = useState('waiting');

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 ">Phê duyệt tin đăng</h1>
        <p className="text-slate-600  mt-1">
          Quản lý và phê duyệt các tin đăng bất động sản
        </p>
      </div>

      {/* Filters */}
      <div className="admin-card">
        <div className="flex flex-wrap gap-4 items-center">
          <div>
            <label className="text-sm font-medium text-slate-700 ">
              Trạng thái
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="mt-1 px-3 py-2 border border-slate-200  rounded-lg  p-2"
            >
              <option value="waiting">Đợi duyệt</option>
              <option value="approved">Đã duyệt</option>
              <option value="rejected">Bị từchối</option>
            </select>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 ">
              Sắp xếp theo
            </label>
            <select className="mt-1 px-3 py-2 border border-slate-200  rounded-lg  p-2">
              <option>Mới nhất</option>
              <option>Cũ nhất</option>
            </select>
          </div>

          <div className="ml-auto">
            <input
              type="text"
              placeholder="Tìm kiếm..."
              className="px-4 py-2 border border-slate-200  rounded-lg  p-2"
            />
          </div>
        </div>
      </div>

      {/* Listings Table */}
      <div className="admin-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 ">
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-600  uppercase">
                  HÌNH ẢNH
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-600  uppercase">
                  TIÊU ĐỀ & THÔNG TIN
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-600  uppercase">
                  MỐI GIỚI ĐĂNG
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-600  uppercase">
                  NGÀY GỬI
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-600  uppercase">
                  TRẠNG THÁI
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-600  uppercase">
                  HÀNH ĐỘNG
                </th>
              </tr>
            </thead>
            <tbody>
              {listings.map((listing) => (
                <tr key={listing.id} className="table-row-hover border-b border-slate-200  last:border-b-0">
                  <td className="px-6 py-4">
                    <div className="text-3xl">{listing.image}</div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-slate-900 ">{listing.title}</p>
                    <p className="text-xs text-slate-500">{listing.location}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-slate-900 ">
                      {listing.owner}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-xs text-slate-600 ">
                      {listing.submittedDate}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`text-xs font-semibold px-3 py-1 rounded-full ${
                        listing.status === 'WAITING'
                          ? 'bg-yellow-100 text-yellow-800'
                          : listing.status === 'APPROVED'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {listing.status === 'WAITING'
                        ? 'Đợi duyệt'
                        : listing.status === 'APPROVED'
                        ? 'Đã duyệt'
                        : 'Bị từchối'}
                    </span>
                  </td>
                  <td className="px-6 py-4 flex gap-2">
                    <button className="p-2 hover:bg-slate-100  rounded-lg transition-colors">
                      <span className="material-symbols-outlined text-sm">visibility</span>
                    </button>
                    <button className="p-2 hover:bg-green-100  rounded-lg transition-colors text-green-600">
                      <span className="material-symbols-outlined text-sm">check_circle</span>
                    </button>
                    <button className="p-2 hover:bg-red-100  rounded-lg transition-colors text-red-600">
                      <span className="material-symbols-outlined text-sm">cancel</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 ">
          <p className="text-xs text-slate-600 ">Hiển thị 1 - 3 của 62 tin đăng chờ</p>
          <div className="flex gap-2">
            <button className="px-3 py-1 border border-slate-200  rounded-lg hover:bg-slate-50 ">
              ←
            </button>
            <button className="px-3 py-1 bg-primary text-white rounded-lg">1</button>
            <button className="px-3 py-1 border border-slate-200  rounded-lg hover:bg-slate-50 ">
              2
            </button>
            <button className="px-3 py-1 border border-slate-200  rounded-lg hover:bg-slate-50 ">
              3
            </button>
            <button className="px-3 py-1 border border-slate-200  rounded-lg hover:bg-slate-50 ">
              14
            </button>
            <button className="px-3 py-1 border border-slate-200  rounded-lg hover:bg-slate-50 ">
              →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
