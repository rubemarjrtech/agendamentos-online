import { useState } from 'react';
import { adminLogin as adminLoginApi } from '@services/auth';
import { useAuth } from '@hooks/useAuth';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { adminAuthSchema } from './auth.schema';
import { Button } from '@components/Button';
import { TextButton } from '@pages/Home/components/TextButton';

interface AdminAuthFormData {
  credential: string;
  password: string;
}

const AdminLogin = () => {
  const [showForm, setShowForm] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const { login: loginContext } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AdminAuthFormData>({
    resolver: zodResolver(adminAuthSchema),
  });

  const onSubmit = async (data: AdminAuthFormData) => {
    setIsLoading(true);
    setApiError(null);

    try {
      const response = await adminLoginApi({
        email: data.credential,
        password: data.password,
      });

      loginContext(response);
    } catch (error) {
      setApiError(error instanceof Error ? error.message : 'Ocorreu um erro');
    } finally {
      setIsLoading(false);
    }
  };

  const clearAndReturn = () => {
    setShowForm(false);
    setApiError(null);
    reset();
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center md:flex-row">
      <div className="w-full md:w-1/2 bg-white flex flex-col">
        <div
          className={`${!showForm ? 'flex' : 'hidden'} md:hidden flex-1 items-center justify-center p-8 mt-12`}
        >
          <Button
            type="button"
            onClick={() => setShowForm(true)}
            fullWidth
            className="max-w-sm py-4"
          >
            Acessar painel administrativo
          </Button>
        </div>

        <div
          className={`${showForm ? 'flex' : 'hidden'} md:flex flex-1 flex-col items-center justify-center p-6`}
        >
          <div className="w-full max-w-sm">
            <TextButton
              onClick={clearAndReturn}
              className="md:hidden text-gray-600 hover:text-gray-800 mb-6 flex items-center gap-2"
            >
              <span>← Voltar</span>
            </TextButton>

            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Acesso do Admin</h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label
                  htmlFor="credential"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Credencial
                </label>
                <input
                  type="text"
                  id="credential"
                  {...register('credential')}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all ${
                    errors.credential ? 'focus:ring-red-500' : 'border-gray-300'
                  }`}
                  placeholder="sua credencial"
                />
                {errors.credential && (
                  <p className="text-red-500 text-sm mt-1">{errors.credential.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Senha
                </label>
                <input
                  type="password"
                  id="password"
                  {...register('password')}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all ${
                    errors.password ? 'focus:ring-red-500' : 'border-gray-300'
                  }`}
                  placeholder="••••••••"
                />
                {errors.password && (
                  <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>
                )}
              </div>

              {apiError && (
                <p className="text-red-500 text-sm text-center font-medium">{apiError}</p>
              )}

              <Button type="submit" disabled={isLoading} fullWidth className="mt-2">
                {isLoading ? 'Enviando...' : 'Enviar'}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
