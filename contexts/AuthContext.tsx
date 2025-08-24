 import { createContext, useContext, useEffect, useState } from 'react';
import { Role } from '@/types';
import { getCookie } from '@/utils/cookies';
import { useRouter } from 'next/router';
import { api } from '@/services/api';

interface AuthContextType {
  role: Role | null;
  userId: string | null;
  login: () => void;
  logout: () => void;
  loaded: boolean;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [role, setRole] = useState<Role | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [loaded, setLoaded] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const storedUserId = getCookie('userId');
    const storedRole = getCookie('role');

    if (storedUserId && storedRole) {
      setUserId(storedUserId);
      setRole(storedRole as Role); // Type assertion here
    }

    setLoaded(true);
  }, []);

  const login = () => {
    setLoaded(true);
    const storedUserId = getCookie('userId');
    const storedRole = getCookie('role');
    if (storedUserId && storedRole) {
      setUserId(storedUserId);
      setRole(storedRole as Role); // Type assertion here
       if (storedRole === 'ADMIN') {
          router.push('/dashboard/admin');
        } else {
          router.push('/dashboard/user');
        }
    }else {
         router.push('/login');
    }
  };

  const logout = async () => {
     try {
        await api.post('/users/logout');
        setLoaded(false);
        setRole(null);
        setUserId(null);
        router.push('/login');
      } catch (error) {
        console.error("Erro ao fazer logout:", error);
        alert("Erro ao fazer logout.");
      }
  };

  const value = {
        role,
        userId,
        login,
        logout,
        loaded,
      };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext)!;