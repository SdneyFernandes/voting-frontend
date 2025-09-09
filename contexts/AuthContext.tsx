import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Role, User, LoginRequest } from '@/types'; // ✅ Importando User e LoginRequest
import { getCookie, setCookie, deleteCookie } from '@/utils/cookies';
import { api } from '@/services/api';

interface AuthContextType {
  user: User | null; // ✅ Estado unificado para o usuário
  isAuthenticated: boolean;
  login: (data: LoginRequest) => Promise<void>; // ✅ Assinatura correta
  logout: () => void;
  loaded: boolean;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // ✅ MUDANÇA: Usamos um único estado para o objeto do usuário
  const [user, setUser] = useState<User | null>(null);
  const [loaded, setLoaded] = useState(false);
  const isAuthenticated = !!user;

  // 🔹 Carrega estado inicial a partir dos cookies
  useEffect(() => {
    const userId = getCookie('userId');
    const role = getCookie('role') as Role | null;
    const userName = getCookie('userName'); // ✅ Carrega o nome do cookie

    if (userId && role && userName) {
      // ✅ Monta o objeto de usuário a partir dos cookies
      setUser({
        id: parseInt(userId, 10),
        name: userName,
        role: role,
        email: '', // Outras informações podem ser carregadas depois se necessário
        votedSessions: [],
      });
    }
    setLoaded(true);
  }, []);

  // ✅ NOVA implementação do login
  const login = async ({ email, password }: LoginRequest) => {
    try {
      const response = await api.post('/users/login', { email, password });
      
      // ✅ Captura o 'userName' que o backend agora envia
      const { userId, role, userName } = response.data;
      
      const loggedInUser: User = {
        id: userId,
        name: userName,
        role: role,
        email: email,
        votedSessions: [],
      };

      // ✅ Atualizar o estado unificado
      setUser(loggedInUser);
      
      // ✅ Setar cookies, incluindo o novo 'userName'
      setCookie('userId', userId);
      setCookie('role', role);
      setCookie('userName', userName);
      
    } catch (error: any) {
      console.error("Falha no login:", error);
      throw new Error(error.response?.data?.message || 'Login falhou');
    }
  };

  const logout = async () => {
    try {
      await api.post('/users/logout');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    } finally {
      // ✅ Limpa o estado unificado
      setUser(null);

      // ✅ Limpa todos os cookies relacionados
      deleteCookie('userId');
      deleteCookie('role');
      deleteCookie('userName');
    }
  };

  // ✅ Expõe o objeto 'user' completo no valor do contexto
  const value = { user, isAuthenticated, login, logout, loaded };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth deve ser usado dentro de um AuthProvider');
    }
    return context;
};