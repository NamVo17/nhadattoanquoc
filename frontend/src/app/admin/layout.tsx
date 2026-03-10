/**
 * Admin Dashboard Layout
 * Main layout wrapper for all admin pages
 */

import AdminLayout from '@/components/admin/AdminLayoutWrapper';
import AdminSidebar from '@/components/admin/AdminSidebar';
import AdminHeader from '@/components/admin/AdminHeader';
import './admin.css';

export const metadata = {
  title: 'Admin Dashboard | NhàĐấtToànQuốc',
  description: 'Admin Dashboard - Quản trị hệ thống',
};

interface AdminLayoutProps {
  children: React.ReactNode;
  params?: any;
}

export default function Layout({ children }: AdminLayoutProps) {
  return (
    <AdminLayout>
      <div className="flex h-screen overflow-hidden">
        <AdminSidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <AdminHeader title="Admin Dashboard" />
          <main className="flex-1 overflow-y-auto bg-white">
            {children}
          </main>
        </div>
      </div>
    </AdminLayout>
  );
}
