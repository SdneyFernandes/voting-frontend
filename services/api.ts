import axios from 'axios';
import Router from 'next/router';

// ✅ URL base dinâmica para desenvolvimento e produção
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true, // ✅ CONFIGURAÇÃO MAIS IMPORTANTE
});

// Interceptor para debug
api.interceptors.request.use((config) => {
  console.log('🚀 [API Request]', config.method?.toUpperCase(), config.url);
  console.log('🍪 [Cookies to send]', document.cookie);
  return config;
});

api.interceptors.response.use(
  (response) => {
    console.log('✅ [API Response]', response.status, response.data);
    console.log('📦 [Response headers]', response.headers);
    return response;
  },
  (error) => {
    console.error('❌ [API Error]', error.response?.status, error.message);
    return Promise.reject(error);
  }
);