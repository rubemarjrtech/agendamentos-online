import { Navigate, Outlet } from 'react-router';
import { useAuth } from '@hooks/useAuth';

const PrivateRoutes = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/home" replace />;
  }

  return <Outlet />;
};

export default PrivateRoutes;
