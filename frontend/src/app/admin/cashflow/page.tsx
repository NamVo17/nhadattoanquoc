/**
 * Admin - Cashflow & Commission Page
 * Manage financial flows and commissions
 */

'use client';

import { useState } from 'react';

const transactions = [
  {
    id: 1,
    code: 'TXN-204855',
    status: 'APPROVED',
    name: 'Phạm Văn Mạnh',
    amount: '+2.000.000đ',
    date: '11 20:24/05/2024',
    label: 'Thành công',
  },
  {
    id: 2,
    code: 'TXN-204856',
    status: 'REJECTED',
    name: 'Trần Minh Hiếu',
    amount: '-12.500.000đ',
    date: '10:45 24/05/2024',
    label: 'Yêu cầu rút tiền',
  },
  {
    id: 3,
    code: 'TXN-201853',
    status: 'PENDING',
    name: 'Điền Dương Vũ',
    amount: '+7.500.000đ',
    date: '08:15 24/05/2024',
    label: 'Chờ duyệt',
  },
];

export default function CashflowPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('2024-06');

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 ">
          Quản lý Dòng tiền & Hoa hồng
        </h1>
        <p className="text-slate-600  mt-1">
          Theo dõi và quản lý các giao dịch tài chính
        </p>
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="admin-stat">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-600  uppercase">
                Tổng tiền nạp
              </p>
              <p className="text-2xl font-bold text-slate-900  mt-2">
                12.840.000.000đ
              </p>
              <p className="text-xs text-slate-500 mt-1">Tổng nạp</p>
            </div>
            <span className="material-symbols-outlined text-4xl text-blue-500">account_balance</span>
          </div>
        </div>

        <div className="admin-stat">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-600  uppercase">
                Tổng phí tin đăng
              </p>
              <p className="text-2xl font-bold text-slate-900  mt-2">
                1.248.000.000đ
              </p>
              <p className="text-xs text-slate-500 mt-1">Doanh thu</p>
            </div>
            <span className="material-symbols-outlined text-4xl text-green-500">trending_up</span>
          </div>
        </div>

        <div className="admin-stat">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-slate-600  uppercase">
                Tổng hoa hồng đã chuyển
              </p>
              <p className="text-2xl font-bold text-slate-900  mt-2">
                4.850.200.000đ
              </p>
              <p className="text-xs text-slate-500 mt-1">Đã chi</p>
            </div>
            <span className="material-symbols-outlined text-4xl text-orange-500">send</span>
          </div>
        </div>
      </div>

      {/* Chart & Revenue Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 admin-card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-900 ">
              Doanh thu phí & Hoa hồng
            </h3>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-3 py-1 border border-slate-200  rounded-lg  text-sm"
            >
              <option value="2024-06">Năm 2024</option>
              <option value="2024-05">Tháng 5</option>
              <option value="2024-04">Tháng 4</option>
            </select>
          </div>

          <div className="h-80 chart-placeholder rounded-lg border border-slate-200  flex items-center justify-center text-slate-400">
            <div className="text-center">
              <span className="material-symbols-outlined text-4xl mb-2">bar_chart</span>
              <p>Biểu đồ doanh thu sẽ được hiển thị tại đây</p>
            </div>
          </div>

          <div className="mt-4 flex gap-4">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
              <span className="text-xs text-slate-600 ">Phí tin đăng</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
              <span className="text-xs text-slate-600 ">Hoa hồng</span>
            </div>
          </div>
        </div>

        {/* Request Stats */}
        <div className="admin-card">
          <h3 className="font-semibold text-slate-900  mb-4">Yêu cầu rút tiền</h3>

          <div className="space-y-3">
            <div className="p-4 bg-slate-50  rounded-lg">
              <p className="text-xs font-medium text-slate-600 ">
                TỶ LỆ PHÍ SÀN TỪ MỖI GIỚI
              </p>
              <p className="text-3xl font-bold text-slate-900  mt-2">2.5%</p>
              <p className="text-xs text-slate-500 mt-1">
                Được sử dụng cho bổ sung nhân sự và bảo trì hệ thống
              </p>

              <div className="mt-4 pt-4 border-t border-slate-200 ">
                <p className="text-xs font-semibold text-slate-600  mb-2">
                  GHI CHÚ VẤN HẠN:
                </p>
                <p className="text-xs text-slate-600 ">
                  Mức tối thiểu giữ được trong tài khoản là 25% - 50%, Việc nâng tỷ lệ phí sàn có thể thực hiện trong thời gian danh dự kinh doanh
                </p>
              </div>
            </div>

            <button className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors">
              + Lưu cấu hình phí
            </button>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="admin-card overflow-hidden">
        <h3 className="font-semibold text-slate-900  mb-4 px-6 pt-6">
          Giao dịch tài chính gần nhất
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-200 ">
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-600  uppercase">
                  MÃ GIAO DỊCH
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-600  uppercase">
                  LOẠI
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-600  uppercase">
                  NGƯỜI THỰC HIỆN
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-600  uppercase">
                  SỐ TIỀN
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-600  uppercase">
                  THỜI GIAN
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold text-slate-600  uppercase">
                  TRẠNG THÁI
                </th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((txn) => (
                <tr key={txn.id} className="table-row-hover border-b border-slate-200  last:border-b-0">
                  <td className="px-6 py-4 text-sm font-medium text-slate-900 ">
                    {txn.code}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded-full ${
                        txn.status === 'APPROVED'
                          ? 'bg-green-100 text-green-800'
                          : txn.status === 'REJECTED'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {txn.status === 'APPROVED'
                        ? 'Nạp tiền'
                        : txn.status === 'REJECTED'
                        ? 'Rút hoa hồng'
                        : 'Điều chỉnh'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-sm text-slate-900 ">{txn.name}</p>
                  </td>
                  <td className="px-6 py-4">
                    <p
                      className={`text-sm font-semibold ${
                        txn.amount.startsWith('+')
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}
                    >
                      {txn.amount}
                    </p>
                  </td>
                  <td className="px-6 py-4">
                    <p className="text-xs text-slate-600 ">{txn.date}</p>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`text-xs font-semibold px-2 py-1 rounded-full ${
                        txn.status === 'APPROVED'
                          ? 'bg-green-100 text-green-800'
                          : txn.status === 'REJECTED'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}
                    >
                      {txn.label}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 ">
          <p className="text-xs text-slate-600 ">
            Hiển thị 1 - 3 của 1,250 giao dịch
          </p>
          <div className="flex gap-2">
            <button className="px-3 py-1 border border-slate-200  rounded-lg hover:bg-slate-50 ">
              ←
            </button>
            <button className="px-3 py-1 bg-primary text-white rounded-lg">1</button>
            <button className="px-3 py-1 border border-slate-200  rounded-lg hover:bg-slate-50 ">
              2
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
