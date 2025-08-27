import { createContext, useContext, useEffect, useState } from 'react';
import { Role } from '@/types';
import { getCookie, setCookie, deleteCookie } from '@/utils/cookies';
import { api } from '@/services/api';

interface AuthContextType {
  role: Role | null;
  userId: string | null;
  token: string | null;
  login: (data: { userId: string; role: Role; token: string }) => void;
  logout: () => void;
  loaded: boolean;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [role, setRole] = useState<Role | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
  const checkAuth = async () => {
    try {
      const res = await api.get("/users/me"); // backend retorna userId e role
      setUserId(res.data.userId);
      setRole(res.data.role);
      setToken("cookie"); // token agora fica só no cookie HttpOnly
    } catch {
      setUserId(null);
      setRole(null);
      setToken(null);
    } finally {
      setLoaded(true);
    }
  };

  checkAuth();
}, []);


  const login = ({ userId, role, token }: { userId: string; role: Role; token: string }) => {
    setUserId(userId);
    setRole(role);
    setToken(token);

    setCookie('userId', userId);
    setCookie('role', role);
    setCookie('token', token);
  };

  const logout = async () => {
    try {
      await api.post('/users/logout');
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
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
