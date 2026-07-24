import { Navigate, Outlet } from 'react-router';
import { useAuth } from '@hooks/useAuth';
import { env } from '@config/env';

const AdminProtectedRoutes = () => {
  const { user, isAdmin } = useAuth();

  if (!user) {
    const adminUrl = env.adminUrl;

    return <Navigate to={`/${adminUrl}`} replace />;
  }

  if (!isAdmin) {
    return <Navigate to="/home" replace />;
  }

  return <Outlet />;
};

export default AdminProtectedRoutes;
