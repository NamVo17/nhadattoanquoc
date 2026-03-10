/**
 * Admin Authentication & Security Utilities
 * Ensures only admin users with proper session can access admin dashboard
 */

const ADMIN_SESSION_KEY = '__admin_session_token__';
const ADMIN_ACCESS_FLAG = '__admin_access_granted__';

/**
 * Check if user is admin with valid role
 */
export const isAdminUser = (user: any): boolean => {
  return user?.role === 'admin' && user?.id;
};

/**
 * Generate a one-time session token when opening admin dashboard
 * This token is stored in sessionStorage and required for access
 */
export const generateAdminSessionToken = (): string => {
  const token = `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  sessionStorage.setItem(ADMIN_SESSION_KEY, token);
  sessionStorage.setItem(ADMIN_ACCESS_FLAG, 'true');
  return token;
};

/**
 * Verify if user has valid admin session token
 * This prevents direct URL access to admin pages
 */
export const verifyAdminSession = (): boolean => {
  const hasToken = sessionStorage.getItem(ADMIN_SESSION_KEY);
  const hasAccessFlag = sessionStorage.getItem(ADMIN_ACCESS_FLAG);
  return !!hasToken && !!hasAccessFlag;
};

/**
 * Clear admin session (on logout or navigation away)
 */
export const clearAdminSession = (): void => {
  sessionStorage.removeItem(ADMIN_SESSION_KEY);
  sessionStorage.removeItem(ADMIN_ACCESS_FLAG);
};

/**
 * Get current admin session info
 */
export const getAdminSessionInfo = () => {
  return {
    token: sessionStorage.getItem(ADMIN_SESSION_KEY),
    hasAccess: sessionStorage.getItem(ADMIN_ACCESS_FLAG) === 'true',
  };
};
