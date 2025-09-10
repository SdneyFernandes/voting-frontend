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
    if (!auth?.loaded) return; 

    if (!auth.userId || !auth.role) {
      router.push('/');
      return;
    }

    if (requiredRole && auth.role !== requiredRole) {
      router.push(auth.role === 'ADMIN' ? '/dashboard/admin' : '/dashboard/user');
      return;
    }

    setIsAuthorized(true);
  }, [auth, router, requiredRole]);

  if (!auth?.loaded || isAuthorized === null) {
    return <SplashScreen />;
  }

  if (!isAuthorized) {
    return <SplashScreen />;
  }

  return <>{children}</>;
}