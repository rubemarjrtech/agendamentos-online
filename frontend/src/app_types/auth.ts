export type UserRole = 'CLIENT' | 'ADMIN';

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
