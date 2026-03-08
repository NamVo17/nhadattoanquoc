import { LoginCredentials, RegisterCredentials, AuthResponse } from './auth.types';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || '';

export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    if (!res.ok) throw new Error('Login failed');
    return res.json();
  },

  register: async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    const res = await fetch(`${BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    if (!res.ok) throw new Error('Registration failed');
    return res.json();
  },

  logout: async (): Promise<void> => {
    await fetch(`${BASE_URL}/api/auth/logout`, { method: 'POST' });
  },
};
