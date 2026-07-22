import { Navigate, Outlet } from 'react-router';
import { useAuth } from '@hooks/useAuth';

const PrivateRoutes = () => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to={'/login'} replace />;
  }

  return <Outlet />;
};

export default PrivateRoutes;
