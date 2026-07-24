import axios from 'axios';
import { env } from '@config/env';

const apiUrl = env.apiURL;
export const api = axios.create({
  baseURL: apiUrl,
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
        error.message = 'Sessão expirada ou usuário não autenticado.';
        console.error('Sessão expirada ou usuário não autenticado.');
        window.location.href = '/home';
      }
      if (status === 409) {
        error.message = 'E-mail já está em uso.';
      }
    } else if (error.request) {
      error.message = 'Servidor indisponível no momento.';
      console.error('Servidor indisponível no momento.');
    } else {
      error.message = 'Não foi possível completar a requisição.';
      console.error('Erro na requisição:', error.message);
    }

    return Promise.reject(error);
  },
);
