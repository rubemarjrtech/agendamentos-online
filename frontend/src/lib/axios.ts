import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      const status = error.response.status;

      if (status === 401) {
        console.error('Sessão expirada ou usuário não autenticado.');
        window.location.href = '/home';
      }
      if (status === 409) {
        console.warn('Conflito: O recurso tentado já está em uso ou foi modificado.');
      }
    } else if (error.request) {
      console.error('Servidor indisponível no momento.');
    } else {
      console.error('Erro na requisição:', error.message);
    }

    return Promise.reject(error);
  },
);
