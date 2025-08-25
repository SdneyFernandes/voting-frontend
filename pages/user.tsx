// /pages/user.tsx
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { api } from '@/services/api';
import { VoteSession } from '@/types';

export default function UserPage() {
  const { userId, loaded } = useAuth(); // usamos apenas userId e loaded
  const [sessions, setSessions] = useState<VoteSession[]>([]);

  useEffect(() => {
    if (loaded && userId) { // espera carregar e verifica se userId existe
      api.get(`/votes_session/voted?userId=${userId}`) // exemplo: sessões que o usuário pode votar
        .then(res => setSessions(res.data))
        .catch(err => console.error('Erro ao buscar sessões:', err));
    }
  }, [loaded, userId]);

  return (
    <div>
      <h1>User Dashboard</h1>
      <ul>
        {sessions.map(session => (
          <li key={session.id}>
            {session.title} ({session.status})
          </li>
        ))}
      </ul>
    </div>
  );
}
