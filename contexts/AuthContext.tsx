import { createContext, useContext, useEffect, useState } from 'react';
import { Role } from '@/types';
import { getCookie } from '@/utils/cookies';
import { api } from '@/services/api';

interface AuthContextType {
  role: Role | null;
  userId: string | null;
  login: () => void; // ✅ REMOVER parâmetro obrigatório
  logout: () => void;
  loaded: boolean;
}

export const AuthContext = createContext<AuthContextType | null>(null);

// contexts/AuthContext.tsx
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [role, setRole] = useState<Role | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    // ✅ LER COOKIES DIRETAMENTE DO NAVEGADOR (não usar setCookie)
    const storedUserId = getCookie('userId');
    const storedRole = getCookie('role');

    if (storedUserId && storedRole) {
      setUserId(storedUserId);
      setRole(storedRole as Role);
    }

    setLoaded(true);
  }, []);

  const login = () => {
    // ✅ REMOVER setCookie DA FUNÇÃO login!
    // Os cookies já devem vir do backend via Set-Cookie header
    console.log("✅ [AuthContext] Login realizado, aguardando cookies...");
    
    // Forçar recarregamento para ler cookies do navegador
    setTimeout(() => window.location.reload(), 100);
  };

  const logout = async () => {
    try {
      await api.post('/users/logout');
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    } finally {
      // ✅ APENAS limpar estado local, os cookies são removidos pelo backend
      setUserId(null);
      setRole(null);
      
      // Forçar recarregamento para limpar completamente
      window.location.href = '/';
    }
  };

  const value = { role, userId, login, logout, loaded };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext)!;
