// pages/dashboard/admin.tsx
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { api } from '@/services/api';
import { getCookie } from '@/utils/cookies';
import AdminLayout from '@/components/layouts/AdminLayout';
import { FiPlus, FiClock, FiCalendar, FiUsers } from 'react-icons/fi';
import ProtectedRoute from '@/components/ProtectedRoute';

// Definindo o tipo para os status
type SessionStatus = 'ALL' | 'ACTIVE' | 'ENDED' | 'NOT_STARTED';

interface VoteSession {
  id: number;
  title: string;
  startAt: string;
  endAt: string;
  status: string;
}

export default function AdminDashboard() {
  const router = useRouter();
  const [sessions, setSessions] = useState<VoteSession[]>([]);
  const [users, setUsers] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<SessionStatus>('ALL');

  const userId = Number(getCookie('userId'));
  const role = getCookie('role');

  useEffect(() => {
    if (!userId || role !== 'ADMIN') {
      router.push('/');
    } else {
      fetchData();
    }
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersRes, sessionsRes] = await Promise.all([
        api.get('/users'),
        api.get('/votes_session/created?userId=' + userId)
      ]);
      setUsers(usersRes.data.length);
      setSessions(sessionsRes.data);
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const activeSessions = sessions.filter(s => s.status === 'ACTIVE');
  const filteredSessions = statusFilter === 'ALL' 
    ? sessions 
    : sessions.filter(s => s.status === statusFilter);

  const getStatusMessage = () => {
    switch(statusFilter) {
      case 'ACTIVE': return 'ativas';
      case 'ENDED': return 'encerradas';
      case 'NOT_STARTED': return 'não iniciadas';
      default: return '';
    }
  };

  return (
    <ProtectedRoute requiredRole="ADMIN">
    <AdminLayout>
      {/* Stats Cards */}
      <div className="stats-grid">
        <StatCard 
          title="Total de Sessões" 
          value={sessions.length} 
          icon={<FiCalendar />}
          color="blue"
        />
        <StatCard 
          title="Sessões Ativas" 
          value={activeSessions.length} 
          icon={<FiClock />}
          color="green"
        />
        <StatCard 
          title="Total de Usuários" 
          value={users} 
          icon={<FiUsers />}
          color="purple"
        />
      </div>

      {/* Sessões em Andamento */}
      <div className="section-container">
        <h2 className="section-title">
          {activeSessions.length > 0 
            ? 'Sessões em Andamento' 
            : 'Nenhuma Sessão em Andamento'}
        </h2>
        
        {loading ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
          </div>
        ) : activeSessions.length > 0 ? (
          <div className="session-list">
            {activeSessions.map(session => (
              <div key={session.id} className="session-item">
                <div className="session-info">
                  <h3 className="session-title">{session.title}</h3>
                  <div className="session-dates">
                    <span>
                      <FiCalendar className="icon" />
                      {new Date(session.startAt).toLocaleDateString()} - {new Date(session.endAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="session-status active">
                  Em Andamento
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>Não há sessões ativas no momento</p>
          </div>
        )}
      </div>

      {/* Lista de Todas as Sessões com Filtro */}
      <div className="section-container">
        <div className="section-header">
          <h2 className="section-title">Lista de Sessões</h2>
          <div className="filter-container">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as SessionStatus)}
              className="status-filter"
            >
              <option value="ALL">Todas as sessões</option>
              <option value="ACTIVE">Ativas</option>
              <option value="ENDED">Encerradas</option>
              <option value="NOT_STARTED">Não iniciadas</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
          </div>
        ) : filteredSessions.length > 0 ? (
          <div className="session-list">
            {filteredSessions.map(session => (
              <div key={session.id} className="session-item">
                <div className="session-info">
                  <h3 className="session-title">{session.title}</h3>
                  <div className="session-dates">
                    <span>
                      <FiCalendar className="icon" />
                      {new Date(session.startAt).toLocaleDateString()} - {new Date(session.endAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className={`session-status ${session.status === 'ACTIVE' ? 'active' : session.status === 'ENDED' ? 'ended' : 'pending'}`}>
                  {session.status === 'ACTIVE' ? 'Ativa' : session.status === 'ENDED' ? 'Encerrada' : 'Pendente'}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>{`Nenhuma sessão ${getStatusMessage()} encontrada`}</p>
          </div>
        )}
      </div>

      <style jsx>{`
          .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
            gap: 1.5rem;
            margin-bottom: 2rem;
          }
          .section-container {
            background-color: var(--black-3);
            border-radius: 0.75rem;
            padding: 1.5rem;
            margin-bottom: 2rem;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            border: 1px solid var(--gray-1);
          }
          .section-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1.5rem;
            flex-wrap: wrap;
            gap: 1rem;
          }
          .section-title {
            font-size: 1.25rem;
            font-weight: 600;
            color: var(--white);
          }
          .filter-container {
            position: relative;
            min-width: 250px;
          }
          .status-filter {
            padding: 0.5rem 1rem;
            background-color: var(--black-4);
            border: 1px solid var(--gray-1);
            border-radius: 0.5rem;
            color: var(--white);
            width: 100%;
            transition: all 0.3s ease;
            cursor: pointer;
          }
          .status-filter:focus {
            outline: none;
            border-color: var(--gray-3);
          }
          .session-list {
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
          }
          .session-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1rem;
            background-color: var(--black-4);
            border-radius: 0.5rem;
            transition: all 0.3s ease;
          }
          .session-item:hover {
            background-color: var(--gray-1);
            transform: translateX(5px);
          }
          .session-info {
            flex: 1;
          }
          .session-title {
            font-size: 1rem;
            font-weight: 500;
            margin-bottom: 0.25rem;
            color: var(--white);
          }
          .session-dates {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-size: 0.875rem;
            color: var(--gray-4);
          }
          .session-dates .icon {
            margin-right: 0.25rem;
          }
          .session-status {
            padding: 0.25rem 0.75rem;
            border-radius: 9999px;
            font-size: 0.75rem;
            font-weight: 500;
          }
          .session-status.active {
            background-color: var(--green-1);
            color: var(--white);
          }
          .session-status.ended {
            background-color: var(--red-1);
            color: var(--white);
          }
          .session-status.pending {
            background-color: var(--gray-1);
            color: var(--white);
          }
          .empty-state {
            padding: 2rem;
            text-align: center;
            color: var(--gray-4);
          }
          .loading-spinner {
            display: flex;
            justify-content: center;
            padding: 2rem;
          }
          .spinner {
            width: 2rem;
            height: 2rem;
            border: 3px solid var(--gray-1);
            border-top-color: var(--blue-3);
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
          
          /* --- MEDIA QUERIES PARA O DASHBOARD ADMIN --- */
          @media (max-width: 768px) {
            .stats-grid {
              grid-template-columns: 1fr; /* Cards de estatísticas em uma única coluna */
            }
            .section-header {
              flex-direction: column;
              align-items: flex-start;
            }
            .filter-container {
              width: 100%;
            }
            .session-item {
              flex-direction: column; /* Transforma itens da lista em cards */
              align-items: flex-start;
              gap: 0.75rem;
            }
            .session-item:hover {
              transform: translateX(0); /* Remove efeito de hover no mobile */
            }
            .session-status {
              align-self: flex-end; /* Alinha o status à direita do card */
            }
          }
        `}</style>
    </AdminLayout>
    </ProtectedRoute>
  );
}

function StatCard({ title, value, icon, color }: { title: string, value: number, icon: React.ReactNode, color: string }) {
  return (
    <div className={`stat-card stat-card-${color}`}>
      <div className="stat-icon">
        {icon}
      </div>
      <div className="stat-content">
        <p className="stat-title">{title}</p>
        <p className="stat-value">{value}</p>
      </div>
      
      <style jsx>{`
        .stat-card {
          background-color: var(--black-3);
          border-radius: 0.75rem;
          padding: 1.5rem;
          display: flex;
          align-items: center;
          border: 1px solid var(--gray-1);
          transition: all 0.3s ease;
        }
        
        .stat-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
        }
        
        .stat-card-blue {
          border-left: 4px solid var(--blue-2);
        }
        
        .stat-card-green {
          border-left: 4px solid var(--green-2);
        }
        
        .stat-card-purple {
          border-left: 4px solid var(--purple-2);
        }
        
        .stat-icon {
          padding: 1rem;
          border-radius: 50%;
          background-color: var(--black-4);
          margin-right: 1.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .stat-card-blue .stat-icon {
          color: var(--blue-3);
        }
        
        .stat-card-green .stat-icon {
          color: var(--green-2);
        }
        
        .stat-card-purple .stat-icon {
          color: var(--purple-2);
        }
        
        .stat-title {
          font-size: 0.875rem;
          color: var(--gray-4);
          margin-bottom: 0.25rem;
        }
        
        .stat-value {
          font-size: 1.75rem;
          font-weight: 700;
          color: var(--white);
        }       

      `}</style>
    </div>
  );
}