import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { AuthState, User } from '@app_types/auth';
import { useNavigate } from 'react-router';
import { logout, me } from '../services/auth';

interface AuthContextData {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  login: (user: User) => void;
  markAsLoggedOut: () => void;
}

const AuthContext = createContext<AuthContextData | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const navigate = useNavigate();
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    error: null,
    isLoading: true,
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await me();

        setAuthState({
          user: data,
          error: null,
          isLoading: false,
        });
      } catch (error) {
        console.log(error);
        setAuthState({
          user: null,
          error: null,
          isLoading: false,
        });
      }
    };

    fetchUser();
  }, []);

  const login = (user: User) => {
    setAuthState({
      user,
      error: null,
      isLoading: false,
    });

    navigate('/appointments', { replace: true });
  };
  const markAsLoggedOut = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Erro ao fazer logout na API', error);
    } finally {
      setAuthState({
        user: null,
        error: null,
        isLoading: false,
      });
      navigate('/home', { replace: true });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user: authState.user,
        isAuthenticated: !!authState.user,
        isAdmin: authState.user?.role === 'admin',
        login,
        markAsLoggedOut,
      }}
    >
      {authState.isLoading ? (
        <div className="flex h-screen items-center justify-center">
          <p>Carregando...</p>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = (): AuthContextData => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};
