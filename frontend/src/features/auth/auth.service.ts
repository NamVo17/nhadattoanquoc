import { LoginCredentials, RegisterCredentials, AuthResponse } from './auth.types';
import { authorizedFetch } from '@/lib/authorizedFetch';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
      credentials: 'include',
    });
    if (!res.ok) throw new Error('Login failed');
    return res.json();
  },

  register: async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    const res = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
      credentials: 'include',
    });
    if (!res.ok) throw new Error('Registration failed');
    return res.json();
  },

  logout: async (): Promise<void> => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;
    try {
      await fetch(`${BASE_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
    } catch {
      // Ignore network errors on logout
    }
  },
};
