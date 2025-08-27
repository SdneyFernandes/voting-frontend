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

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [role, setRole] = useState<Role | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const checkAuth = () => {
      const storedUserId = getCookie('userId');
      const storedRole = getCookie('role');

      console.log("🔍 [AuthContext] Cookies encontrados:", {
        userId: storedUserId,
        role: storedRole
      });

      if (storedUserId && storedRole) {
        setUserId(storedUserId);
        setRole(storedRole as Role);
        console.log("✅ [AuthContext] Usuário autenticado via cookies");
      }

      setLoaded(true);
    };

    checkAuth();
  }, []);

  const login = () => {
    console.log("✅ [AuthContext] Login chamado - verificando cookies...");
    
    // Verificar cookies imediatamente
    const storedUserId = getCookie('userId');
    const storedRole = getCookie('role');
    
    if (storedUserId && storedRole) {
      setUserId(storedUserId);
      setRole(storedRole as Role);
      console.log("✅ [AuthContext] Cookies já disponíveis");
    } else {
      console.log("⏳ [AuthContext] Cookies ainda não disponíveis, aguardando...");
      // Recarregar após breve delay para cookies serem setados
      setTimeout(() => {
        const newUserId = getCookie('userId');
        const newRole = getCookie('role');
        
        if (newUserId && newRole) {
          setUserId(newUserId);
          setRole(newRole as Role);
          console.log("✅ [AuthContext] Cookies carregados após delay");
        } else {
          console.warn("❌ [AuthContext] Cookies ainda não encontrados após delay");
          window.location.reload();
        }
      }, 300);
    }
  };

  const logout = async () => {
    try {
      await api.post('/users/logout');
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    } finally {
      setUserId(null);
      setRole(null);
      window.location.href = '/';
    }
  };

  const value = { role, userId, login, logout, loaded };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext)!;
