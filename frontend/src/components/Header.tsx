import { useState } from 'react';
import { useNavigate } from 'react-router';
import { CircleUser, LogOut } from 'lucide-react';
import { useAuth } from '@hooks/useAuth';
import { env } from '@config/env';

export const Header = () => {
  const { user, markAsLoggedOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [logoutError, setLogoutError] = useState<string | null>(null);
  const navigate = useNavigate();
  const isAdmin = user?.role === 'ADMIN';

  const handleLogout = async () => {
    try {
      await markAsLoggedOut();

      if (isAdmin) {
        const adminUrl = env.adminUrl;
        navigate(`/${adminUrl}`, { replace: true });
      } else {
        navigate('/', { replace: true });
      }
    } catch (error) {
      console.error('Erro ao efetuar logout', error);
      setIsMenuOpen(false);
      setLogoutError('Erro ao efetuar logout. Por favor, tente novamente.');
    }
  };

  return (
    <header className="flex h-14 items-center justify-end gap-4 border-b border-gray-200 bg-white px-6 shadow-sm">
      <span className="text-sm font-medium text-slate-700">{user?.email}</span>

      <div className="relative">
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="flex h-10 w-10 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 outline-none focus:ring-2 focus:ring-gray-300"
          aria-label="Menu do usuário"
        >
          <CircleUser className="h-8 w-8" />
        </button>

        {isMenuOpen ? (
          <div className="absolute right-0 top-12 mt-2 z-50 w-48 rounded-xl border border-slate-200 bg-white p-1 shadow-lg">
            <button
              onClick={() => void handleLogout()}
              className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-rose-600 transition-colors hover:bg-rose-50 outline-none"
            >
              <LogOut className="h-4 w-4" />
              Sair
            </button>
          </div>
        ) : null}

        {logoutError && (
          <div className="absolute right-0 top-12 mt-2 z-50 w-64 rounded-xl border border-rose-200 bg-rose-50 p-2 shadow-lg">
            <p className="text-sm text-rose-700">{logoutError}</p>
          </div>
        )}
      </div>
    </header>
  );
};
