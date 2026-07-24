import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router';
import { AuthProvider } from '@hooks/useAuth';
import AppLayout from '@layouts/AppLayout';
import ProtectedRoutes from './ProtectedRoutes';
import AdminProtectedRoutes from './AdminProtectedRoutes';
import Home from '@pages/Home';
import Appointments from '@pages/Appointments';
import AdminLogin from '@pages/Admin/Login';
import AdminDashboard from '@pages/Admin/Dashboard';
import { env } from '@config/env';

const AppRoutes = () => {
  const adminUrl = env.adminUrl;

  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Rotas públicas */}
          <Route path="/home" element={<Home />} />
          <Route path="/" element={<Navigate to="/home" replace />} />
          <Route path={`/${adminUrl}`} element={<AdminLogin />} />

          {/* Rotas protegidas */}
          <Route element={<ProtectedRoutes />}>
            <Route element={<AppLayout />}>
              <Route path="/appointments" element={<Appointments />} />
            </Route>
          </Route>

          <Route element={<AdminProtectedRoutes />}>
            <Route element={<AppLayout />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
            </Route>
          </Route>

          <Route path="*" element={<h2>Page not found</h2>} />
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default AppRoutes;
