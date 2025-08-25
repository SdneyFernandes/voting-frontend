// /pages/admin.tsx
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { api } from '@/services/api';
import { VoteSession } from '@/types';

export default function AdminPage() {
  const { userId, loaded } = useAuth(); // usamos apenas userId e loaded
  const [sessions, setSessions] = useState<VoteSession[]>([]);

  useEffect(() => {
    if (loaded && userId) { // espera carregar e verifica se userId existe
      api.get(`/votes_session/created?userId=${userId}`)
        .then(res => setSessions(res.data))
        .catch(err => console.error('Erro ao buscar sessões:', err));
    }
  }, [loaded, userId]);

  return (
    <div>
      <h1>Admin Dashboard</h1>
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
