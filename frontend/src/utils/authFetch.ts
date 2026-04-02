/**
 * authFetch - A wrapper around fetch that auto-handles 401 responses.
 * When ANY API call returns 401 (token expired), it clears localStorage
 * and dispatches a custom event so all tabs/components can react.
 */

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export function getAccessToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('accessToken');
}

export function clearAuthStorage(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
}

/**
 * Perform authenticated logout: call API + clear local storage
 */
export async function performLogout(): Promise<void> {
    const token = getAccessToken();
    try {
        await fetch(`${API_BASE}/auth/logout`, {
            method: 'POST',
            credentials: 'include',
            headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
    } catch {
        // ignore network errors — we still clear local state
    }
    clearAuthStorage();
    // Broadcast logout to all tabs via storage event
    localStorage.setItem('__logout_signal__', Date.now().toString());
    localStorage.removeItem('__logout_signal__');
}

/**
 * Authenticated fetch with automatic 401 → logout handling.
 * Usage: authFetch('/auth/me') or authFetch('/properties', { method: 'POST', body: ... })
 */
export async function authFetch(
    path: string,
    options: RequestInit = {}
): Promise<Response> {
    const token = getAccessToken();

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string>),
    };
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE}${path}`, {
        ...options,
        credentials: 'include',
        headers,
    });

    if (res.status === 401) {
        // Auto-logout: clear local state and redirect
        clearAuthStorage();
        if (typeof window !== 'undefined') {
            // Broadcast to other tabs
            localStorage.setItem('__logout_signal__', Date.now().toString());
            localStorage.removeItem('__logout_signal__');
            window.location.href = '/login';
        }
    }

    return res;
}
