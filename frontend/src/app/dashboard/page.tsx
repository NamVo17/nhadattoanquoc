"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarUrl?: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      router.push('/login');
      return;
    }

    try {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
    } catch (err) {
      router.push('/login');
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <>
      {/* Page Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900  tracking-tight">
            Chào buổi sáng, {user.name?.split(' ').pop()}!
          </h1>
          <p className="text-slate-500  mt-1">Đây là thống kê hiệu quả hoạt động của bạn hôm nay.</p>
        </div>
        <button className="flex items-center gap-2 bg-white  border border-slate-200  px-4 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-slate-50 dark:hover:bg-slate-200 transition-all">
          <span className="material-symbols-outlined text-lg">calendar_today</span>
          <span>Tất cả thời gian</span>
          <span className="material-symbols-outlined text-lg">expand_more</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
        {/* Total Posts */}
        <div className="bg-white  p-6 rounded-2xl shadow-sm border border-slate-200 ">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-blue-50  text-blue-600 rounded-lg">
              <span className="material-symbols-outlined">assignment</span>
            </div>
            <span className="text-xs font-bold text-emerald-500 bg-emerald-50  px-2 py-1 rounded-full">+12%</span>
          </div>
          <p className="text-slate-500  text-sm font-medium">Tổng tin đăng</p>
          <p className="text-2xl font-extrabold text-slate-900  mt-1">1,284</p>
        </div>

        {/* Active Posts */}
        <div className="bg-white  p-6 rounded-2xl shadow-sm border border-slate-200 ">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-emerald-50  text-emerald-600 rounded-lg">
              <span className="material-symbols-outlined">visibility</span>
            </div>
            <span className="text-xs font-bold text-emerald-500 bg-emerald-50  px-2 py-1 rounded-full">+5.4%</span>
          </div>
          <p className="text-slate-500  text-sm font-medium">Tin đang hiển thị</p>
          <p className="text-2xl font-extrabold text-slate-900  mt-1">856</p>
        </div>

        {/* Commission */}
        <div className="bg-white  p-6 rounded-2xl shadow-sm border border-slate-200 ">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-amber-50  text-amber-600 rounded-lg">
              <span className="material-symbols-outlined">payments</span>
            </div>
            <span className="text-xs font-bold text-slate-400 bg-slate-100  px-2 py-1 rounded-full">Dự kiến</span>
          </div>
          <p className="text-slate-500  text-sm font-medium">Hoa hồng dự kiến</p>
          <p className="text-2xl font-extrabold text-slate-900  mt-1">450.0M <span className="text-sm font-normal text-slate-400">VNĐ</span></p>
        </div>

        {/* Wallet */}
        <div className="bg-white  p-6 rounded-2xl shadow-sm border border-slate-200 ">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-primary/10 text-primary rounded-lg">
              <span className="material-symbols-outlined">account_balance_wallet</span>
            </div>
            <button className="text-xs font-bold text-primary hover:underline">Nạp tiền</button>
          </div>
          <p className="text-slate-500  text-sm font-medium">Số dư ví</p>
          <p className="text-2xl font-extrabold text-slate-900  mt-1">12,500K <span className="text-sm font-normal text-slate-400">VNĐ</span></p>
        </div>
      </div>

      {/* Chart & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* Chart */}
        <div className="lg:col-span-2 bg-white  rounded-2xl shadow-sm border border-slate-200  p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-slate-900 ">Biến động lượt xem tin</h3>
            <select className="text-xs border border-slate-200  bg-white  text-slate-900  px-3 py-1.5 rounded-lg focus:ring-primary focus:border-primary">
              <option>7 ngày qua</option>
              <option>30 ngày qua</option>
            </select>
          </div>
          <div className="h-64 flex items-end justify-between gap-2 px-2">
            <div className="w-full bg-primary/20 rounded-t-lg h-[40%]" title="Thứ 2"></div>
            <div className="w-full bg-primary/20 rounded-t-lg h-[65%]" title="Thứ 3"></div>
            <div className="w-full bg-primary/20 rounded-t-lg h-[45%]" title="Thứ 4"></div>
            <div className="w-full bg-primary rounded-t-lg h-[90%]" title="Thứ 5"></div>
            <div className="w-full bg-primary/20 rounded-t-lg h-[60%]" title="Thứ 6"></div>
            <div className="w-full bg-primary/20 rounded-t-lg h-[75%]" title="Thứ 7"></div>
            <div className="w-full bg-primary/20 rounded-t-lg h-[55%]" title="Chủ nhật"></div>
          </div>
          <div className="flex justify-between mt-4 px-2 text-xs text-slate-400 font-medium">
            <span>T2</span><span>T3</span><span>T4</span><span>T5</span><span>T6</span><span>T7</span><span>CN</span>
          </div>
        </div>

        {/* Activity */}
        <div className="bg-white  rounded-2xl shadow-sm border border-slate-200  p-6">
          <h3 className="text-lg font-bold text-slate-900  mb-6">Hoạt động gần đây</h3>
          <div className="space-y-6">
            <div className="flex gap-4">
              <div className="w-2 h-2 mt-2 rounded-full bg-emerald-500 ring-4 ring-emerald-500/10 shrink-0"></div>
              <div>
                <p className="text-sm font-semibold text-slate-900 ">Tin đăng được phê duyệt</p>
                <p className="text-xs text-slate-500  mt-1 line-clamp-1">Căn hộ Landmark 81 - 3PN, Full nội thất</p>
                <p className="text-[10px] text-slate-400  mt-1 uppercase font-bold tracking-wider">2 giờ trước</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-2 h-2 mt-2 rounded-full bg-blue-500 ring-4 ring-blue-500/10 shrink-0"></div>
              <div>
                <p className="text-sm font-semibold text-slate-900 ">Yêu cầu hợp tác mới</p>
                <p className="text-xs text-slate-500  mt-1">Trần Minh Quân gửi yêu cầu cộng tác</p>
                <p className="text-[10px] text-slate-400  mt-1 uppercase font-bold tracking-wider">5 giờ trước</p>
              </div>
            </div>
            <div className="flex gap-4">
              <div className="w-2 h-2 mt-2 rounded-full bg-amber-500 ring-4 ring-amber-500/10 shrink-0"></div>
              <div>
                <p className="text-sm font-semibold text-slate-900 ">Cảnh báo hết hạn</p>
                <p className="text-xs text-slate-500  mt-1">Nhà phố Quận 2 sẽ hết hạn sau 2 ngày</p>
                <p className="text-[10px] text-slate-400  mt-1 uppercase font-bold tracking-wider">1 ngày trước</p>
              </div>
            </div>
          </div>
          <button className="w-full mt-6 py-2 text-sm font-bold text-primary hover:bg-primary/5 rounded-lg transition-colors">Xem tất cả</button>
        </div>
      </div>

      {/* Listings Table */}
      <div className="bg-white  rounded-2xl shadow-sm border border-slate-200  overflow-hidden">
        <div className="p-6 border-b border-slate-100  flex justify-between items-center">
          <h3 className="text-lg font-bold text-slate-900 ">Danh sách tin đăng chi tiết</h3>
          <div className="flex gap-2">
            <button className="px-3 py-1.5 text-xs font-bold border border-slate-200  text-slate-700  rounded-lg hover:bg-slate-50  transition-colors">Lọc</button>
            <button className="px-3 py-1.5 text-xs font-bold border border-slate-200  text-slate-700  rounded-lg hover:bg-slate-50  transition-colors">Xuất báo cáo</button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50  text-slate-500  text-xs font-bold uppercase tracking-wider">
                <th className="px-6 py-4">Hình ảnh &amp; Tiêu đề</th>
                <th className="px-6 py-4">Trạng thái</th>
                <th className="px-6 py-4">Ngày đăng</th>
                <th className="px-6 py-4">Phí dịch vụ</th>
                <th className="px-6 py-4">Hoa hồng cam kết</th>
                <th className="px-6 py-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 ">
              {/* Row 1 */}
              <tr className="hover:bg-slate-50  transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-12 rounded-lg bg-slate-100 shrink-0 overflow-hidden border border-slate-200 " style={{ backgroundImage: "url('https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=200')", backgroundSize: "cover" }}></div>
                    <div>
                      <p className="text-sm font-bold text-slate-900  line-clamp-1">Biệt thự Thảo Điền - 400m2 Sân vườn</p>
                      <p className="text-xs text-slate-400 mt-0.5">Quận 2, TP. Hồ Chí Minh</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 text-[10px] font-bold uppercase tracking-wide bg-emerald-100 text-emerald-700  rounded-full">Đã duyệt</span>
                </td>
                <td className="px-6 py-4 text-sm font-medium text-slate-900 ">12/10/2023</td>
                <td className="px-6 py-4 text-sm font-medium text-slate-900 ">500,000đ</td>
                <td className="px-6 py-4 text-sm font-bold text-primary">2.5% (400M)</td>
                <td className="px-6 py-4 text-right">
                  <button className="p-2 text-slate-400 hover:text-primary transition-colors">
                    <span className="material-symbols-outlined text-xl">edit</span>
                  </button>
                  <button className="p-2 text-slate-400 hover:text-primary transition-colors">
                    <span className="material-symbols-outlined text-xl">more_vert</span>
                  </button>
                </td>
              </tr>

              {/* Row 2 */}
              <tr className="hover:bg-slate-50  transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-12 rounded-lg bg-slate-100 shrink-0 overflow-hidden border border-slate-200 " style={{ backgroundImage: "url('https://images.unsplash.com/photo-1512917774080-9b274b3f59c7?w=200')", backgroundSize: "cover" }}></div>
                    <div>
                      <p className="text-sm font-bold text-slate-900  line-clamp-1">Căn hộ Vinhomes Grand Park - Tầng cao</p>
                      <p className="text-xs text-slate-400 mt-0.5">Quận 9, TP. Hồ Chí Minh</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 text-[10px] font-bold uppercase tracking-wide bg-amber-100 text-amber-700   rounded-full">Chờ duyệt</span>
                </td>
                <td className="px-6 py-4 text-sm font-medium text-slate-900 ">15/10/2023</td>
                <td className="px-6 py-4 text-sm font-medium text-slate-900 ">250,000đ</td>
                <td className="px-6 py-4 text-sm font-bold text-primary">3% (120M)</td>
                <td className="px-6 py-4 text-right">
                  <button className="p-2 text-slate-400 hover:text-primary transition-colors">
                    <span className="material-symbols-outlined text-xl">edit</span>
                  </button>
                  <button className="p-2 text-slate-400 hover:text-primary transition-colors">
                    <span className="material-symbols-outlined text-xl">more_vert</span>
                  </button>
                </td>
              </tr>

              {/* Row 3 */}
              <tr className="hover:bg-slate-50  transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-12 rounded-lg bg-slate-100 shrink-0 overflow-hidden border border-slate-200 " style={{ backgroundImage: "url('https://images.unsplash.com/photo-1565693566231-b5a15ebc4d2b?w=200')", backgroundSize: "cover" }}></div>
                    <div>
                      <p className="text-sm font-bold text-slate-900  line-clamp-1">Nhà phố Thủ Đức - Hẻm xe hơi</p>
                      <p className="text-xs text-slate-400 mt-0.5">Thủ Đức, TP. Hồ Chí Minh</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="px-2 py-1 text-[10px] font-bold uppercase tracking-wide bg-slate-100 text-slate-500   rounded-full">Hết hạn</span>
                </td>
                <td className="px-6 py-4 text-sm font-medium text-slate-900 ">01/09/2023</td>
                <td className="px-6 py-4 text-sm font-medium text-slate-900 ">0đ</td>
                <td className="px-6 py-4 text-sm font-bold text-primary">1.5% (80M)</td>
                <td className="px-6 py-4 text-right">
                  <button className="p-2 text-slate-400 hover:text-primary transition-colors">
                    <span className="material-symbols-outlined text-xl">refresh</span>
                  </button>
                  <button className="p-2 text-slate-400 hover:text-primary transition-colors">
                    <span className="material-symbols-outlined text-xl">more_vert</span>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-6 bg-slate-50  flex flex-col sm:flex-row justify-between items-center gap-4 border-t border-slate-100 ">
          <p className="text-sm text-slate-500 ">Hiển thị 1 - 3 của 1,284 tin đăng</p>
          <div className="flex gap-2">
            <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200  text-slate-700  disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-100   transition-colors" disabled>
              <span className="material-symbols-outlined text-lg">chevron_left</span>
            </button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-primary text-white font-bold">1</button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200  text-slate-700  hover:bg-blue-100  transition-colors">2</button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200  text-slate-700  hover:bg-blue-100   transition-colors">3</button>
            <button className="w-8 h-8 flex items-center justify-center rounded-lg border border-slate-200  text-slate-700  hover:bg-blue-100   transition-colors">
              <span className="material-symbols-outlined text-lg">chevron_right</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
