import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router';
import { AuthProvider } from '@hooks/useAuth';
import AppLayout from '@layouts/AppLayout';
import ProtectedRoutes from './ProtectedRoutes';
import Home from '@pages/Home';
import Appointments from '@pages/Appointments';

const AppRoutes = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Rotas públicas */}
          <Route path="/home" element={<Home />} />
          <Route path="/" element={<Navigate to="/home" replace />} />

          {/* Rotas protegidas */}
          <Route element={<ProtectedRoutes />}>
            <Route element={<AppLayout />}>
              <Route path="/appointments" element={<Appointments />} />
            </Route>
          </Route>

          <Route path="*" element={<h2>Page not found</h2>} />
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default AppRoutes;
