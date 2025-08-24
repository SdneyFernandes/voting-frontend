// /pages/admin.tsx
import { useAuth } from '@/contexts/AuthContext';
import { useEffect, useState } from 'react';
import { api } from '@/services/api';
import { VoteSession } from '@/types';

export default function AdminPage() {
  const { token, userId } = useAuth();
  const [sessions, setSessions] = useState<VoteSession[]>([]);

  useEffect(() => {
    api.get(`/votes_session/created?userId=${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    }).then(res => setSessions(res.data));
  }, []);

  return (
    <div>
      <h1>Admin Dashboard</h1>
      <ul>
        {sessions.map(session => (
          <li key={session.id}>{session.title} ({session.status})</li>
        ))}
      </ul>
    </div>
  );
}
