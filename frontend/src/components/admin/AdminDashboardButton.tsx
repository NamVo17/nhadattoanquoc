/**
 * Admin Dashboard Button
 * Button to open admin dashboard in a new tab
 * Generates session token for security
 */

'use client';

import { generateAdminSessionToken } from '@/utils/adminAuth';

export default function AdminDashboardButton() {
  const handleOpenAdminDashboard = () => {
    // Generate session token to allow access to admin pages
    generateAdminSessionToken();
    
    // Open admin dashboard in new tab
    window.open('/admin', '_blank');
  };

  return (
    <button
      onClick={handleOpenAdminDashboard}
      className="flex items-center justify-center gap-2 w-full bg-linear-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-700 text-white px-4 py-3 rounded-lg font-semibold transition-all shadow-lg shadow-blue-500/30 hover:shadow-blue-500/40"
    >
      <span className="material-symbols-outlined text-lg">admin_panel_settings</span>
      <span>Mở Admin Dashboard</span>
    </button>
  );
}
