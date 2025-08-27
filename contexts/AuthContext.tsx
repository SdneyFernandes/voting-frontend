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
    const storedUserId = getCookie('userId');
    const storedRole = getCookie('role');
    const storedToken = getCookie('token');

    if (storedUserId && storedRole && storedToken) {
      setUserId(storedUserId);
      setRole(storedRole as Role);
      setToken(storedToken);
    }

    setLoaded(true);
  }, []);

 const login = ({ userId, role, token }: { userId: string; role: Role; token: string }) => {
  console.log("📦 [AuthContext] login recebido:", { userId, role, token });

  // Garante string no userId
  const safeUserId = String(userId);

  setUserId(safeUserId);
  setRole(role);
  setToken(token);

  setCookie('userId', safeUserId);
  setCookie('role', role);
  setCookie('token', token);

  console.log("✅ [AuthContext] cookies gravados:", {
    userId: getCookie("userId"),
    role: getCookie("role"),
    token: getCookie("token")
  });
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


      window.location.href = '/';
    }
  };

  const value = { role, userId, token, login, logout, loaded };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext)!;
