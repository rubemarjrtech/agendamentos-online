import { BrowserRouter as Router, Routes, Route } from 'react-router';
import { AuthProvider } from '@hooks/useAuth';
import AppLayout from '@layouts/AppLayout';
import ProtectedRoutes from './ProtectedRoutes';

const AppRoutes = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          // rotas não protegidas, renderizam páginas que não requerem autenticação
          <Route element={<ProtectedRoutes />}>
            <Route element={<AppLayout />}>// renderizam páginas que requerem autenticação</Route>
          </Route>
          <Route path="*" element={<h2>Page not found</h2>} />
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default AppRoutes;
