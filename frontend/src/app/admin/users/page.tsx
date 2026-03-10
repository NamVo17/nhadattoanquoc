/**
 * Admin - User Management Page
 * Manage system users and broker accounts
 */

'use client';

import { useState, useEffect } from 'react';

interface User {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  role: string;
  is_active: boolean;
  kyc_status: string;
  avatar_url?: string;
  created_at: string;
  last_login?: string | null;
}

interface Stats {
  total_users: number;
  kyc_pending: number;
  violations: number;
  active_users: number;
}

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [stats, setStats] = useState<Stats>({
    total_users: 0,
    kyc_pending: 0,
    violations: 0,
    active_users: 0
  });
  const [loading, setLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const limit = 10;
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  // Fetch users with KYC status
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const offset = (page - 1) * limit;
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
      let url = `${apiUrl}/auth/users?limit=${limit}&offset=${offset}`;
      
      if (roleFilter !== 'all') url += `&role=${roleFilter}`;
      if (statusFilter !== 'all') url += `&status=${statusFilter}`;

      const res = await fetch(url, {
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
      
      const data = await res.json();
      if (data.success) {
        let usersData = data.data || [];
        
        // Fetch KYC status for each user
        const usersWithKYC = await Promise.all(
          usersData.map(async (user: User) => {
            const kycRes = await fetch(`${apiUrl}/kyc/admin/user/${user.id}`, {
              headers: {
                "Authorization": `Bearer ${localStorage.getItem("accessToken")}`,
              },
            }).catch(() => null);
            
            let kyc_status = 'unverified';
            if (kycRes?.ok) {
              const kycData = await kycRes.json();
              if (kycData.success && kycData.data) {
                kyc_status = kycData.data.status || 'unverified';
              }
            }
            
            return { ...user, kyc_status };
          })
        );
        
        setUsers(usersWithKYC);
        
        // Update total users for stats
        if (data.pagination) {
          setTotalUsers(data.pagination.total);
          // Calculate active users based on last_login
          const activeCount = usersWithKYC.filter(u => u.last_login).length;
          setStats((prev) => ({
            ...prev,
            total_users: data.pagination.total,
            active_users: activeCount,
          }));
        }
      }
    } catch (err) {
      console.error("Failed to fetch users:", err);
    } finally {
      setLoading(false);
    }
  };

  // Fetch users with KYC status
  useEffect(() => {
    fetchUsers();
    // Auto-refresh every 30 seconds
    const interval = setInterval(() => fetchUsers(), 30000);
    return () => clearInterval(interval);
  }, [page, roleFilter, statusFilter]);

  // Fetch stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
        const res = await fetch(`${apiUrl}/kyc/admin/statistics`, {
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("accessToken")}`,
          },
        });
        
        const data = await res.json();
        if (data.success) {
          setStats((prev) => ({
            ...prev,
            kyc_pending: data.data.pending,
          }));
        }
      } catch (err) {
        console.error("Failed to fetch stats:", err);
      }
    };

    fetchStats();
  }, []);

  const filteredUsers = users.filter((user) =>
    user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.phone.includes(searchTerm)
  );

  const handleDeleteUser = async () => {
    if (!userToDelete) return;
    
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
      const res = await fetch(`${apiUrl}/auth/users/${userToDelete.id}`, {
        method: 'DELETE',
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });

      if (res.ok) {
        setShowDeleteModal(false);
        setUserToDelete(null);
        fetchUsers();
        alert("Xóa người dùng thành công");
      } else {
        alert("Xóa người dùng thất bại");
      }
    } catch (err) {
      console.error("Failed to delete user:", err);
      alert("Lỗi khi xóa người dùng");
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Quản lý người dùng & Môi giới
          </h1>
          <p className="text-slate-600 mt-1">
            Quản lý tài khoản người dùng và môi giới trên hệ thống
          </p>
        </div>
        <button
          onClick={() => fetchUsers()}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
          title="Tải lại dữ liệu"
        >
          <span className="material-symbols-outlined text-sm">refresh</span>
          Tải lại
        </button>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl shadow-sm border border-blue-200 p-5 transition-all hover:shadow-md">
          <label className="text-sm font-semibold text-blue-900 uppercase flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-600">person_outline</span>
            VÀI TRÒ
          </label>
          <select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(1);
            }}
            className="mt-2 w-full px-3 py-2.5 border border-blue-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
          >
            <option value="all">Tất cả vai trò</option>
            <option value="user">👤 Người dùng</option>
            <option value="agent">🏢 Môi giới</option>
            <option value="admin">👑 Quản trị viên</option>
          </select>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl shadow-sm border border-emerald-200 p-5 transition-all hover:shadow-md">
          <label className="text-sm font-semibold text-emerald-900 uppercase flex items-center gap-2">
            <span className="material-symbols-outlined text-emerald-600">check_circle</span>
            TRẠNG THÁI TÀI KHOẢN
          </label>
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            className="mt-2 w-full px-3 py-2.5 border border-emerald-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="active">🟢 Hoạt động</option>
            <option value="inactive">⚫ Không hoạt động</option>
          </select>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl shadow-sm border border-purple-200 p-5 transition-all hover:shadow-md">
          <label className="text-sm font-semibold text-purple-900 uppercase flex items-center gap-2">
            <span className="material-symbols-outlined text-purple-600">search</span>
            TÌM KIẾM
          </label>
          <input
            type="text"
            placeholder="Tên, email, SDT..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="mt-2 w-full px-3 py-2.5 border border-purple-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-purple-500 font-medium"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl shadow-sm border border-blue-200 p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-blue-600 uppercase">
                Tổng người dùng
              </p>
              <p className="text-3xl font-bold text-blue-900 mt-2">{stats.total_users}</p>
            </div>
            <span className="material-symbols-outlined text-5xl text-blue-400">group</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl shadow-sm border border-purple-200 p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-purple-600 uppercase">
                Chờ xác thực KYC
              </p>
              <p className="text-3xl font-bold text-purple-900 mt-2">{stats.kyc_pending}</p>
            </div>
            <span className="material-symbols-outlined text-5xl text-purple-400">verified_user</span>
          </div>
        </div>

        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl shadow-sm border border-emerald-200 p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-emerald-600 uppercase">
                Đang hoạt động
              </p>
              <p className="text-3xl font-bold text-emerald-900 mt-2">{stats.active_users}</p>
            </div>
            <span className="material-symbols-outlined text-5xl text-emerald-400">check_circle</span>
          </div>
        </div>

      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin">
                <span className="material-symbols-outlined text-3xl text-primary">hourglass_empty</span>
              </div>
              <p className="text-slate-600 mt-2">Đang tải...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-8 text-center">
              <span className="material-symbols-outlined text-4xl text-slate-300 block mb-2">people</span>
              <p className="text-slate-600">Không có người dùng nào.</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-600 uppercase">
                    HỌ TÊN & THÔNG TIN
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-600 uppercase">
                    EMAIL / SDT
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-600 uppercase">
                    VÀI TRÒ
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-600 uppercase">
                    KYC
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-600 uppercase">
                    NGÀY THAM GIA
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-600 uppercase">
                    TRẠNG THÁI
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-semibold text-slate-600 uppercase">
                    HÀNH ĐỘNG
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b border-slate-200 hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden">
                          {user.avatar_url ? (
                            <img src={user.avatar_url} alt={user.full_name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="material-symbols-outlined text-slate-400">person</span>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">
                            {user.full_name}
                          </p>
                          <p className="text-xs text-slate-500">{user.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm text-slate-900">{user.email}</p>
                        <p className="text-xs text-slate-500">{user.phone}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-medium text-slate-700 bg-slate-100 px-2 py-1 rounded capitalize">
                        {user.role === 'user' ? 'Người dùng' : user.role === 'agent' ? 'Môi giới' : user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-semibold px-2 py-1 rounded-full ${
                        user.kyc_status === 'verified'
                          ? 'bg-emerald-100 text-emerald-800'
                          : user.kyc_status === 'pending'
                          ? 'bg-amber-100 text-amber-800'
                          : user.kyc_status === 'rejected'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-slate-100 text-slate-800'
                      }`}>
                        {user.kyc_status === 'verified'
                          ? '✓ Đã xác minh'
                          : user.kyc_status === 'pending'
                          ? '⏳ Chờ phê duyệt'
                          : user.kyc_status === 'rejected'
                          ? '✕ Bị từ chối'
                          : 'Chưa xác thực'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-xs text-slate-600">
                        {new Date(user.created_at).toLocaleDateString("vi-VN")}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                        user.last_login
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-100 text-slate-800'
                      }`}>
                        {user.last_login ? '🟢 Hoạt động' : '⚫ Không hoạt động'}
                      </span>
                    </td>
                    <td className="px-6 py-4 flex gap-2">
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setShowModal(true);
                        }}
                        title="Chi tiết"
                        className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                      >
                        <span className="material-symbols-outlined text-sm">visibility</span>
                      </button>
                      <button
                        onClick={() => {
                          setSelectedUser(user);
                          setShowModal(true);
                        }}
                        title="Chỉnh sửa"
                        className="p-2 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors"
                      >
                        <span className="material-symbols-outlined text-sm">edit</span>
                      </button>
                      <button
                        onClick={() => {
                          setUserToDelete(user);
                          setShowDeleteModal(true);
                        }}
                        title="Xóa"
                        className="p-2 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                      >
                        <span className="material-symbols-outlined text-sm">delete</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200">
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
      </div>

      {/* User Detail Modal */}
      {showModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 p-6 border-b border-slate-200 flex justify-between items-center bg-white">
              <h2 className="text-lg font-bold">Chi tiết người dùng</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto rounded-full bg-slate-200 flex items-center justify-center overflow-hidden mb-4">
                  {selectedUser.avatar_url ? (
                    <img src={selectedUser.avatar_url} alt={selectedUser.full_name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="material-symbols-outlined text-3xl text-slate-400">person</span>
                  )}
                </div>
                <h3 className="text-lg font-bold">{selectedUser.full_name}</h3>
              </div>

              <div className="space-y-3 pt-4 border-t border-slate-200">
                <div>
                  <p className="text-xs font-semibold text-slate-600 uppercase">Email</p>
                  <p className="text-sm text-slate-900">{selectedUser.email}</p>
                </div>

                <div>
                  <p className="text-xs font-semibold text-slate-600 uppercase">Điện thoại</p>
                  <p className="text-sm text-slate-900">{selectedUser.phone}</p>
                </div>

                <div>
                  <p className="text-xs font-semibold text-slate-600 uppercase">Vai trò</p>
                  <p className="text-sm text-slate-900 capitalize">
                    {selectedUser.role === 'user' ? 'Người dùng' : selectedUser.role === 'agent' ? 'Môi giới' : selectedUser.role}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold text-slate-600 uppercase">Trạng thái KYC</p>
                  <p className="text-sm text-slate-900 capitalize">{selectedUser.kyc_status}</p>
                </div>

                <div>
                  <p className="text-xs font-semibold text-slate-600 uppercase">Trạng thái tài khoản</p>
                  <p className="text-sm text-slate-900">
                    {selectedUser.last_login ? 'Hoạt động' : 'Không hoạt động'}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold text-slate-600 uppercase">Lần đăng nhập cuối</p>
                  <p className="text-sm text-slate-900">
                    {selectedUser.last_login 
                      ? new Date(selectedUser.last_login).toLocaleString("vi-VN")
                      : 'Chưa đăng nhập'}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold text-slate-600 uppercase">Ngày tham gia</p>
                  <p className="text-sm text-slate-900">
                    {new Date(selectedUser.created_at).toLocaleString("vi-VN")}
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-200">
                <button
                  onClick={() => setShowModal(false)}
                  className="w-full px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && userToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full">
            <div className="p-6 border-b border-slate-200">
              <div className="flex items-center gap-3 mb-2">
                <span className="material-symbols-outlined text-4xl text-red-500">warning</span>
                <h2 className="text-lg font-bold text-slate-900">Xóa người dùng</h2>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-sm text-red-800 font-medium">
                  ⚠️ Hành động này không thể hoàn tác!
                </p>
              </div>
              <p className="text-slate-700">
                Bạn có chắc muốn xóa tài khoản của <strong>{userToDelete.full_name}</strong> (<strong>{userToDelete.email}</strong>)?
              </p>
            </div>

            <div className="p-6 border-t border-slate-200 flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setUserToDelete(null);
                }}
                className="flex-1 px-4 py-2 bg-slate-200 text-slate-900 rounded-lg hover:bg-slate-300 transition-colors font-medium"
              >
                Hủy
              </button>
              <button
                onClick={handleDeleteUser}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
           