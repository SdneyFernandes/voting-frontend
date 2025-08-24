import axios from 'axios';
import Router from 'next/router';

export const api = axios.create({
  baseURL: '/api',
  timeout: 600000, // 10 minutos em ms para debug (ajuste depois para valor razoável)
});
