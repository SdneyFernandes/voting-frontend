// src/components/LogoutButton.tsx (exemplo)
import { api } from '@/services/api';
import { useRouter } from 'next/router';

const LogoutButton = () => {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await api.post('/users/logout');
      router.push('/');
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      alert("Erro ao fazer logout.");
    }
  };

  return (
    <button onClick={handleLogout}>Sair</button>
  );
};

export default LogoutButton;
