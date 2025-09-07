import { createContext, useContext, useEffect, useState } from 'react';
import { Role } from '@/types';
import { getCookie, deleteCookie } from '@/utils/cookies'; // Removido 'setCookie' pois não é mais usado aqui
import { api } from '@/services/api';

interface AuthContextType {
  role: Role | null;
  userId: string | null;
  token: string | null; // Mantido caso você use para algo mais no futuro
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loaded: boolean;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [role, setRole] = useState<Role | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  // 🔹 Carrega estado inicial a partir dos cookies (Esta parte continua igual e funcionando)
  useEffect(() => {
    const uid = getCookie('userId');
    const r = getCookie('role') as Role | null;
    const t = getCookie('token');

    setUserId(uid || null);
    setRole(r || null);
    setToken(t || null);
    setLoaded(true);
  }, []);

  // ✅ Implementação do login CORRIGIDA
  const login = async (email: string, password: string) => {
    try {
      const response = await api.post('/users/login', { email, password });
      const { userId: id, role: userRole } = response.data;
      
      // ✅ Atualizar o estado do React
      setUserId(id);
      setRole(userRole);
      
      // ❌ AS LINHAS QUE CRIAM O COOKIE MANUALMENTE FORAM REMOVIDAS.
      // O navegador agora vai cuidar disso sozinho, usando a resposta do backend.
      
    } catch (error: any) {
      // Melhorando o repasse do erro para a interface
      throw new Error(error.response?.data?.message || 'Credenciais inválidas');
    }
  };

  const logout = async () => {
    try {
      await api.post('/users/logout');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    } finally {
      setUserId(null);
      setRole(null);
      setToken(null);

      deleteCookie('userId');
      deleteCookie('role');
      deleteCookie('token');
    }
  };

  const value = { role, userId, token, login, logout, loaded };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext)!;