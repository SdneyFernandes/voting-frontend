// components/ProtectedRoute.tsx
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import SplashScreen from './SplashScreen';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'ADMIN' | 'USER';
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const auth = useAuth();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  useEffect(() => {
    if (!auth?.loaded) return; // Aguarda o carregamento inicial

    if (!auth.userId || !auth.role) {
      // Não autenticado - redireciona para login
      router.push('/');
      return;
    }

    if (requiredRole && auth.role !== requiredRole) {
      // Role não autorizado - redireciona para dashboard do usuário ou página 403
      router.push(auth.role === 'ADMIN' ? '/dashboard/admin' : '/dashboard/user');
      return;
    }

    // Autorizado
    setIsAuthorized(true);
  }, [auth, router, requiredRole]);

  if (!auth?.loaded || isAuthorized === null) {
    // Pode adicionar um loading spinner aqui
    return <SplashScreen />;
  }

  if (!isAuthorized) {
    // Redirecionamento em andamento
    return <SplashScreen />;
  }

  return <>{children}</>;
}