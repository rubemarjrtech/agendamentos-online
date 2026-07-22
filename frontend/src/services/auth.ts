import { api } from '@lib/axios';
import type { AuthResponse, User } from '@app_types/auth';

interface LoginCredentials {
  email: string;
  password: string;
}

export async function register(credentials: LoginCredentials): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/api/auth/register', credentials);

  return data;
}

export async function login(credentials: LoginCredentials): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/api/auth/login', credentials);

  return data;
}

export async function adminLogin(credentials: LoginCredentials): Promise<AuthResponse> {
  const { data } = await api.post<AuthResponse>('/api/auth/admin/login', credentials);

  return data;
}

export async function logout(): Promise<void> {
  await api.get('/api/auth/logout');
}

export async function me(): Promise<User> {
  const { data } = await api.get<User>('/api/auth/me');

  return data;
}
