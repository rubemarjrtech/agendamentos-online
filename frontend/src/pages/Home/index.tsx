import { useState } from 'react';
import { login as loginApi, register as registerApi } from '@services/auth';
import { useAuth } from '@hooks/useAuth';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { authSchema } from './auth.schema';
import { Button } from '@components/Button';
import { TextButton } from './components/TextButton';
import fundoAzul from '../../assets/fundo-azul.jpg';

interface AuthFormData {
  email: string;
  password: string;
}

const Home = () => {
  const [showForm, setShowForm] = useState(false);
  const [isRegister, setIsRegister] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const { login: loginContext } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<AuthFormData>({
    resolver: zodResolver(authSchema),
  });

  const onSubmit = async (data: AuthFormData) => {
    setIsLoading(true);
    setApiError(null);

    try {
      const action = isRegister ? registerApi : loginApi;
      const response = await action(data);
      loginContext(response);
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Ocorreu um erro');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFormMode = () => {
    setIsRegister(!isRegister);
    setApiError(null);
    reset();
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <div
        className="w-full min-h-[70vh] md:min-h-screen md:w-1/2 bg-cover bg-center bg-no-repeat bg-black/50 bg-blend-overlay flex items-center justify-center"
        style={{ backgroundImage: `url(${fundoAzul})` }}
      >
        <div className="text-white text-center p-6">
          <h1 className="text-3xl font-bold mb-2">
            Bem-vindo ao nosso espaço dedicado ao seu estilo e bem-estar!
          </h1>
          <p className="text-blue-100 text-lg">
            Sabemos que o seu tempo é valioso, por isso criamos um sistema de agendamento
            inteligente, rápido e sem complicações. Oferecemos serviços premium para cuidar da sua
            imagem com excelência. Mantenha o visual alinhado com nossos serviços. Nossa plataforma
            garante que a sua reserva seja feita em tempo real e de forma exclusiva. Com poucos
            cliques, você escolhe o que precisa e garante o seu momento de autocuidado. O horário
            que você selecionar estará reservado com segurança só para você. Acesse, escolha seu
            serviço e deixe o resto com a gente.
          </p>
        </div>
      </div>

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
            Faça login/cadastre-se
          </Button>
        </div>

        <div
          className={`${showForm ? 'flex' : 'hidden'} md:flex flex-1 flex-col items-center justify-center p-6`}
        >
          <div className="w-full max-w-sm">
            <TextButton
              onClick={() => setShowForm(false)}
              className="md:hidden text-gray-600 hover:text-gray-800 mb-6 flex items-center gap-2"
            >
              <span>← Voltar</span>
            </TextButton>

            <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">
              {isRegister ? 'Crie sua conta' : 'Faça login'}
            </h2>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  E-mail
                </label>
                <input
                  type="email"
                  id="email"
                  {...register('email')}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all ${
                    errors.email ? 'focus:ring-red-500' : 'border-gray-300'
                  }`}
                  placeholder="seu@email.com"
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
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

            <p className="mt-6 text-center text-sm text-gray-600">
              <TextButton
                onClick={toggleFormMode}
                className="text-blue-600 hover:text-blue-700 font-medium underline"
              >
                {isRegister ? 'Já tem uma conta? Faça login' : 'Não tem uma conta? Cadastre-se'}
              </TextButton>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
