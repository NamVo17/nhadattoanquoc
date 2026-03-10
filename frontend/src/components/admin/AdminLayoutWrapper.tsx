/**
 * Admin Layout - Protected Wrapper for Admin Pages
 * Verifies user role and session token before showing admin content
 */

'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { isAdminUser, verifyAdminSession, clearAdminSession } from '@/utils/adminAuth';

interface UserInfo {
  fullName?: string;
  email?: string;
  avatarUrl?: string;
  role?: string;
  id?: string;
}

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const [user, setUser] = useState<UserInfo | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check 1: User must be logged in
    const token = localStorage.getItem('accessToken');
    const userData = localStorage.getItem('user');

    if (!token || !userData) {
      router.push('/login');
      setIsLoading(false);
      return;
    }

    try {
      const parsedUser = JSON.parse(userData) as UserInfo;
      // Ensure role is mapped correctly
      const role = parsedUser.role || (parsedUser as any).userRole || (parsedUser as any).user_role || (parsedUser as any).type || 'user';
      const userWithRole = {
        ...parsedUser,
        role
      };
      setUser(userWithRole);

      // Check 2: User must have admin role
      if (!isAdminUser(userWithRole)) {
        clearAdminSession();
        router.push('/dashboard');
        setIsLoading(false);
        return;
      }

      // Check 3: User must have valid admin session token (not direct URL access)
      if (!verifyAdminSession()) {
        clearAdminSession();
        router.push('/');
        setIsLoading(false);
        return;
      }

      setIsAuthorized(true);
      setIsLoading(false);
    } catch (err) {
      router.push('/login');
      setIsLoading(false);
    }
  }, [router]);

  // If still loading, show nothing
  if (isLoading) {
    return null;
  }

  // If not authorized, show nothing (will redirect via useEffect)
  if (!isAuthorized) {
    return null;
  }

  return <div className="h-screen overflow-hidden">{children}</div>;
}
