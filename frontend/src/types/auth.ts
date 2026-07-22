export type UserRole = 'client' | 'admin';

export interface User {
  id: string;
  email: string;
  role: UserRole;
}

export interface AuthState {
  user: User | null;
  error: string | null;
  isLoading: boolean;
}

export interface AuthResponse {
  user: User;
}
