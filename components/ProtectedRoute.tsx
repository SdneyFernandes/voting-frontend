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
    // Aguarda o AuthContext carregar os dados dos cookies
    if (!auth.loaded) {
      return; 
    }

    // ✅ MUDANÇA: Verifica se o objeto 'user' existe. Se não, o usuário não está logado.
    if (!auth.user) {
      // Não autenticado - redireciona para a página de login
      router.push('/');
      return;
    }

    // ✅ MUDANÇA: Verifica a 'role' do usuário a partir de 'auth.user.role'
    if (requiredRole && auth.user.role !== requiredRole) {
      // Role não autorizada - redireciona para o dashboard correto do usuário
      // ✅ MUDANÇA: Usa 'auth.user.role' para a lógica de redirecionamento
      router.push(auth.user.role === 'ADMIN' ? '/dashboard/admin' : '/dashboard/user');
      return;
    }

    // Se passou por todas as verificações, o usuário está autorizado
    setIsAuthorized(true);

  // ✅ MUDANÇA: Otimizado o array de dependências para evitar re-renderizações desnecessárias
  }, [auth.loaded, auth.user, router, requiredRole]);

  // Enquanto as verificações do useEffect estão em andamento, mostra a SplashScreen
  if (!auth.loaded || isAuthorized === null) {
    return <SplashScreen />;
  }

  // Se autorizado, mostra o conteúdo da página
  return <>{children}</>;
}