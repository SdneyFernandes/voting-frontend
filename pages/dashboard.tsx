// /pages/dashboard.tsx
import { useAuth } from '@/contexts/AuthContext';
import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Dashboard() {
  const { role } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (role === 'ADMIN') router.push('/admin');
    else router.push('/user');
  }, [role]);

  return <div>Redirecionando...</div>;
}