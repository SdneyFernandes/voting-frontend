import axios from 'axios';
import Router from 'next/router';

const baseURL = process.env.NEXT_PUBLIC_API_URL 
  ? `${process.env.NEXT_PUBLIC_API_URL}/api` 
  : 'http://localhost:8080/api';

export const api = axios.create({
  baseURL: baseURL,
  timeout: 600000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, 
});


// Interceptadores para tratamento de erros 
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      Router.push('/');
    }
    return Promise.reject(error);
  }
);