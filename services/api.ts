import axios from 'axios';
import Router from 'next/router';

// ✅ URL base dinâmica para desenvolvimento e produção
const baseURL = process.env.NEXT_PUBLIC_API_URL 
  ? `${process.env.NEXT_PUBLIC_API_URL}/api` 
  : 'http://localhost:8080/api';

export const api = axios.create({
  baseURL: baseURL,
  timeout: 600000, // 10 minutos
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptadores para tratamento de erros (opcional mas recomendado)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirecionar para login se não autenticado
      Router.push('/');
    }
    return Promise.reject(error);
  }
);