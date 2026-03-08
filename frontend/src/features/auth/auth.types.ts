export interface AuthUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'user' | 'agent' | 'admin';
  avatar?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials extends LoginCredentials {
  name: string;
  phone: string;
}

export interface AuthResponse {
  user: AuthUser;
  token: string;
}
