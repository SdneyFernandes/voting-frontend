// /pages/user.tsx
import { useEffect, useState } from 'react';
import { api } from '@/services/api';
import { VoteSession } from '@/types';
import { useAuth } from '@/contexts/AuthContext';

export default function UserPage() {
  const { token } = useAuth();
  const [sessions, setSessions] = useState<VoteSession[]>([]);

  useEffect(() => {
    api.get('/votes_session/status?status=ACTIVE', {
      headers: { Authorization: `Bearer ${token}` },
    }).then(res => setSessions(res.data));
  }, []);

  return (
    <div>
      <h1>User Dashboard</h1>
      <ul>
        {sessions.map(session => (
          <li key={session.id}>{session.title} ({session.status})</li>
        ))}
      </ul>
    </div>
  );
}
