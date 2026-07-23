import { api } from '@lib/axios';
import type { User } from '@app_types/auth';

interface LoginCredentials {
  email: string;
  password: string;
}

export async function register(credentials: LoginCredentials): Promise<User> {
  const { data } = await api.post<User>('/api/auth/register', credentials);

  return data;
}

export async function login(credentials: LoginCredentials): Promise<User> {
  const { data } = await api.post<User>('/api/auth/login', credentials);
  return data;
}

export async function adminLogin(credentials: LoginCredentials): Promise<User> {
  const { data } = await api.post<User>('/api/auth/admin/login', credentials);

  return data;
}

export async function logout(): Promise<void> {
  await api.get('/api/auth/logout');
}

export async function me(): Promise<User> {
  const { data } = await api.get<User>('/api/auth/me');

  return data;
}
