// components/user/UserDashboard.tsx
import { useState, useEffect, useMemo } from 'react';
import { api } from '@/services/api';
import { 
  FiCalendar, 
  FiClock, 
  FiBarChart2, 
  FiSearch, 
  FiX,
  FiAward,
  FiPieChart,
  FiUsers,
  FiTrendingUp
} from 'react-icons/fi';
import { getCookie } from '@/utils/cookies';
import VoteModal from '@/components/VoteModal';
import ResultsModal from '@/components/ResultsModal';
import UserLayout from '@/components/layouts/UserLayout';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useVoteResults } from '@/hooks/useVoteResults';

type SessionStatus = 'ALL' | 'ACTIVE' | 'ENDED' | 'NOT_STARTED';

interface VoteSession {
  id: number;
  title: string;
  description: string;
  startAt: string;
  endAt: string;
  status: string;
  options: string[];
  hasVoted?: boolean;
  results?: {
    total?: number;
    totalVotos?: number;
    resultado?: Record<string, number>;
    _updatedAt?: number;
    [key: string]: number | Record<string, number> | undefined;
  };
}


export default function UserDashboard() {
  const [allSessions, setAllSessions] = useState<VoteSession[]>([]);
  const [myVotes, setMyVotes] = useState<VoteSession[]>([]);
  const [statusFilter, setStatusFilter] = useState<SessionStatus>('ALL');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedSession, setSelectedSession] = useState<VoteSession | null>(null);
  const [showVoteModal, setShowVoteModal] = useState(false);
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const { results, fetchResults } = useVoteResults();
  const userId = Number(getCookie('userId'));

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const [available, voted] = await Promise.all([
        api.get('/votes_session'),
        api.get(`/votes_session/voted?userId=${userId}`),
      ]);

      const votedIds = voted.data.map((s: VoteSession) => s.id);
      setAllSessions(available.data.map((s: VoteSession) => ({
        ...s,
        hasVoted: votedIds.includes(s.id)
      })));
      setMyVotes(voted.data);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      showToast('Erro ao carregar sessões', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, [userId]);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  const openVoteModal = (session: VoteSession) => {
    if (session.status !== 'ACTIVE') {
      showToast('Esta sessão não está ativa para votação', 'error');
      return;
    }
    if (session.hasVoted) {
      showToast('Você já votou nesta sessão', 'error');
      return;
    }
    setSelectedSession(session);
    setShowVoteModal(true);
  };

    const openResultsModal = async (session: VoteSession) => {
    if (session.status !== 'ENDED') {
      showToast('Resultados disponíveis apenas após o encerramento da sessão', 'error');
      return;
    }
    try {
      setLoading(true);
      const normalized = await fetchResults(session.id);

      // 🔑 Converte todos os valores para número
      const safeResults: VoteSession['results'] = {
        ...normalized,
        total: normalized.total ? Number(normalized.total) : undefined,
        totalVotos: normalized.totalVotos ? Number(normalized.totalVotos) : undefined,
        resultado: Object.fromEntries(
          Object.entries(normalized.resultado || {}).map(([k, v]) => [k, Number(v)])
        ),
        _updatedAt: normalized._updatedAt ? Number(normalized._updatedAt) : undefined,
      };

      setSelectedSession({ ...session, results: safeResults });
      setShowResultsModal(true);
    } catch {
      showToast('Erro ao carregar resultados', 'error');
    } finally {
      setLoading(false);
    }
  };

  const filteredSessions = useMemo(() => {
    return allSessions.filter(s => {
      const matchesStatus = statusFilter === 'ALL' || s.status === statusFilter;
      const matchesSearch = search === '' || 
                           s.title.toLowerCase().includes(search.toLowerCase()) || 
                           String(s.id).includes(search);
      return matchesStatus && matchesSearch;
    });
  }, [allSessions, statusFilter, search]);

  return (
    <ProtectedRoute requiredRole="USER">
    <UserLayout>
      {/* Toast Notification */}
      {toast && (
        <div 
          className={`toast ${toast.type}`} 
          role="alert" 
          aria-live="polite"
        >
          {toast.message}
          <button onClick={() => setToast(null)} className="toast-close">
            <FiX />
          </button>
        </div>
      )}

      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Seu Painel de Votações</h1>
          <p className="hero-subtitle">Participe das decisões e acompanhe os resultados em tempo real</p>
        </div>
        <div className="hero-stats">
          <div className="hero-stat">
            <FiAward className="stat-icon" />
            <span>{myVotes.length} Votações</span>
          </div>
          <div className="hero-stat">
            <FiTrendingUp className="stat-icon" />
            <span>{allSessions.filter(s => s.status === 'ACTIVE').length} Ativas</span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card stat-primary">
          <div className="stat-icon">
            <FiCalendar />
          </div>
          <div className="stat-content">
            <h3>Total de Sessões</h3>
            <p>{allSessions.length}</p>
          </div>
        </div>
        
        <div className="stat-card stat-success">
          <div className="stat-icon">
            <FiClock />
          </div>
          <div className="stat-content">
            <h3>Sessões Ativas</h3>
            <p>{allSessions.filter(s => s.status === 'ACTIVE').length}</p>
          </div>
        </div>
        
        <div className="stat-card stat-info">
          <div className="stat-icon">
            <FiBarChart2 />
          </div>
          <div className="stat-content">
            <h3>Suas Votações</h3>
            <p>{myVotes.length}</p>
          </div>
        </div>
      </div>

      {/* Active Sessions */}
      {allSessions.filter(s => s.status === 'ACTIVE').length > 0 && (
        <div className="section-container highlight-section">
          <h2 className="section-title">
            <FiClock className="section-icon" />
            Sessões Ativas para Votação
          </h2>
          <p className="section-description">
            Participe agora das decisões em andamento. Seu voto faz a diferença!
          </p>
          
          <div className="sessions-grid">
            {allSessions
              .filter(s => s.status === 'ACTIVE')
              .slice(0, 3)
              .map(session => (
                <div key={session.id} className="session-card active">
                  <div className="session-header">
                    <h3>{session.title}</h3>
                    <span className="session-badge active">Ativa</span>
                  </div>
                  <p className="session-description">{session.description}</p>
                  <div className="session-footer">
                    <button 
                      onClick={() => openVoteModal(session)}
                      className={`action-button ${session.hasVoted ? 'voted' : 'vote'}`}
                      disabled={session.hasVoted}
                    >
                      {session.hasVoted ? 'Voto Registrado' : 'Votar Agora'}
                    </button>
                    <span className="session-dates">
                      <FiCalendar /> {new Date(session.startAt).toLocaleDateString()} - {new Date(session.endAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* All Sessions */}
      <div className="section-container">
        <div className="section-header">
          <h2 className="section-title">
            <FiPieChart className="section-icon" />
            Todas as Sessões
          </h2>
          <div className="filters-container">
            <div className="search-input-container">
              <FiSearch className="search-icon" />
              <input
                placeholder="Buscar sessões..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
            <select
              className="status-filter"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value as SessionStatus)}
            >
              <option value="ALL">Todas</option>
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
          <div className="sessions-table">
            <div className="table-header">
              <div className="table-cell">Título</div>
              <div className="table-cell">Status</div>
              <div className="table-cell">Período</div>
              <div className="table-cell">Ações</div>
            </div>
            {filteredSessions.map(session => (
              <div key={session.id} className="table-row">
                <div className="table-cell">
                  <h4>{session.title}</h4>
                  <p className="session-description">{session.description}</p>
                </div>
                <div className="table-cell">
                  <span className={`status-badge ${session.status.toLowerCase()}`}>
                    {session.status === 'ACTIVE' ? 'Ativa' : 
                     session.status === 'ENDED' ? 'Encerrada' : 'Não Iniciada'}
                  </span>
                </div>
                <div className="table-cell">
                  {new Date(session.startAt).toLocaleDateString()} - {new Date(session.endAt).toLocaleDateString()}
                </div>
                <div className="table-cell actions-cell">
                  {session.status === 'ACTIVE' ? (
                    <button 
                      onClick={() => openVoteModal(session)}
                      className={`action-button ${session.hasVoted ? 'voted' : 'vote'}`}
                      disabled={session.hasVoted}
                    >
                      {session.hasVoted ? 'Votado' : 'Votar'}
                    </button>
                  ) : (
                    <button 
                      onClick={() => openResultsModal(session)}
                      className="action-button results"
                    >
                      Ver Resultados
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <img src="/empty-state.svg" alt="Nenhuma sessão encontrada" />
            <p>Tente ajustar seus filtros de busca</p>
          </div>
        )}
      </div>

      {/* Recent Votes */}
      {myVotes.length > 0 && (
        <div className="section-container">
          <h2 className="section-title">
            <FiUsers className="section-icon" />
            Suas Participações Recentes
          </h2>
          
          <div className="votes-timeline">
            {myVotes.slice(0, 5).map((vote, index) => (
              <div key={index} className="timeline-item">
                <div className="timeline-marker"></div>
                <div className="timeline-content">
                  <h4>{vote.title}</h4>
                  <p>Você participou desta votação em {new Date(vote.endAt).toLocaleDateString()}</p>
                  <button 
                    onClick={() => openResultsModal(vote)}
                    className="action-button results"
                  >
                    Ver Resultados
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      {showVoteModal && selectedSession && (
        <VoteModal
          session={selectedSession}
          userId={userId}
          onClose={() => setShowVoteModal(false)}
          hasVoted={selectedSession.hasVoted ?? false}
          showToast={showToast}
          fetchSessions={fetchSessions}
        />
      )}

      {showResultsModal && selectedSession && (
        <ResultsModal
          session={selectedSession}
          onClose={() => setShowResultsModal(false)}
        />
      )}

      <style jsx>{`
        /* Hero Section */
        .hero-section {
          background: linear-gradient(135deg, var(--blue-1), var(--purple-1));
          border-radius: 1rem;
          padding: 2.5rem;
          margin-bottom: 2rem;
          color: white;
          position: relative;
          overflow: hidden;
        }
        
        .hero-section::before {
          content: '';
          position: absolute;
          top: 0;
          right: 0;
          width: 40%;
          height: 100%;
          background-image: radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px);
          background-size: 20px 20px;
          opacity: 0.3;
        }
        
        .hero-content {
          max-width: 60%;
        }
        
        .hero-title {
          font-size: 2rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }
        
        .hero-subtitle {
          font-size: 1.1rem;
          opacity: 0.9;
          margin-bottom: 1.5rem;
        }
        
        .hero-stats {
          display: flex;
          gap: 1.5rem;
          margin-top: 1.5rem;
        }
        
        .hero-stat {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(255, 255, 255, 0.1);
          padding: 0.5rem 1rem;
          border-radius: 2rem;
        }
        
        .stat-icon {
          font-size: 1.2rem;
        }
        
        /* Stats Grid */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }
        
        .stat-card {
          padding: 1.5rem;
          border-radius: 0.75rem;
          display: flex;
          align-items: center;
          gap: 1.5rem;
          transition: all 0.3s ease;
          border: 1px solid var(--gray-1);
        }
        
        .stat-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
        }
        
        .stat-primary {
          background-color: var(--blue-900/10);
          border-left: 4px solid var(--blue-3);
        }
        
        .stat-success {
          background-color: var(--green-900/10);
          border-left: 4px solid var(--green-2);
        }
        
        .stat-info {
          background-color: var(--purple-900/10);
          border-left: 4px solid var(--purple-2);
        }
        
        .stat-icon {
          font-size: 1.75rem;
          padding: 1rem;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.1);
          display: flex;
        }
        
        .stat-primary .stat-icon {
          color: var(--blue-3);
        }
        
        .stat-success .stat-icon {
          color: var(--green-2);
        }
        
        .stat-info .stat-icon {
          color: var(--purple-2);
        }
        
        .stat-content h3 {
          font-size: 0.9rem;
          font-weight: 500;
          color: var(--gray-4);
          margin-bottom: 0.25rem;
        }
        
        .stat-content p {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--white);
        }
        
        /* Highlight Section */
        .highlight-section {
          background: var(--black-3);
          border: 1px solid var(--blue-1);
          box-shadow: 0 0 20px rgba(59, 130, 246, 0.1);
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
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .section-icon {
          color: var(--blue-3);
        }
        
        .section-description {
          color: var(--gray-4);
          margin-bottom: 1.5rem;
        }
        
        /* Sessions Grid */
        .sessions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1.5rem;
        }
        
        .session-card {
          background-color: var(--black-4);
          border-radius: 0.75rem;
          padding: 1.5rem;
          transition: all 0.3s ease;
          border-left: 4px solid transparent;
        }
        
        .session-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
        }
        
        .session-card.active {
          border-left-color: var(--green-2);
        }
        
        .session-card.ended {
          border-left-color: var(--blue-2);
        }
        
        .session-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
        }
        
        .session-card h3 {
          font-size: 1.1rem;
          font-weight: 600;
          color: var(--white);
          margin-bottom: 0.5rem;
        }
        
        .session-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 500;
        }
        
        .session-badge.active {
          background-color: var(--green-1);
          color: var(--white);
        }
        
        .session-badge.ended {
          background-color: var(--blue-1);
          color: var(--white);
        }
        
        .session-description {
          color: var(--gray-4);
          font-size: 0.9rem;
          margin-bottom: 1.5rem;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        .session-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .session-dates {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.8rem;
          color: var(--gray-4);
        }
        
        /* Action Buttons */
        .action-button {
          padding: 0.5rem 1.25rem;
          border-radius: 0.5rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          border: none;
        }
        
        .action-button.vote {
          background-color: var(--blue-2);
          color: white;
        }
        
        .action-button.vote:hover {
          background-color: var(--blue-3);
          transform: translateY(-1px);
        }
        
        .action-button.voted {
          background-color: var(--green-1);
          color: white;
          cursor: default;
        }
        
        .action-button.results {
          background-color: transparent;
          border: 1px solid var(--gray-2);
          color: var(--gray-4);
        }
        
        .action-button.results:hover {
          background-color: var(--gray-1);
          color: var(--white);
        }
        
        /* Sessions Table */
        .sessions-table {
          border-radius: 0.5rem;
          overflow: hidden;
          border: 1px solid var(--gray-1);
        }
        
        .table-header {
          display: grid;
          grid-template-columns: 2fr 1fr 1.5fr 1fr;
          background-color: var(--black-4);
          padding: 1rem 1.5rem;
          font-weight: 600;
          color: var(--gray-4);
          font-size: 0.9rem;
        }
        
        .table-row {
          display: grid;
          grid-template-columns: 2fr 1fr 1.5fr 1fr;
          padding: 1rem 1.5rem;
          border-bottom: 1px solid var(--gray-1);
          transition: all 0.2s;
        }
        
        .table-row:last-child {
          border-bottom: none;
        }
        
        .table-row:hover {
          background-color: var(--gray-1);
        }
        
        .table-cell {
          display: flex;
          align-items: center;
        }
        
        .table-cell h4 {
          font-size: 0.95rem;
          font-weight: 500;
          color: var(--white);
          margin-bottom: 0.25rem;
        }
        
        .table-cell .session-description {
          font-size: 0.85rem;
          color: var(--gray-4);
          margin-bottom: 0;
          -webkit-line-clamp: 2;
        }
        
        .actions-cell {
          justify-content: flex-end;
        }
        
        /* Status Badges */
        .status-badge {
          padding: 0.25rem 0.75rem;
          border-radius: 9999px;
          font-size: 0.75rem;
          font-weight: 500;
          display: inline-block;
        }
        
        .status-badge.active {
          background-color: var(--green-1);
          color: var(--white);
        }
        
        .status-badge.ended {
          background-color: var(--blue-1);
          color: var(--white);
        }
        
        .status-badge.not_started {
          background-color: var(--gray-1);
          color: var(--white);
        }
        
        /* Timeline */
        .votes-timeline {
          position: relative;
          padding-left: 1.5rem;
        }
        
        .votes-timeline::before {
          content: '';
          position: absolute;
          top: 0;
          bottom: 0;
          left: 0.5rem;
          width: 2px;
          background-color: var(--gray-1);
        }
        
        .timeline-item {
          position: relative;
          padding: 1.5rem 0;
        }
        
        .timeline-marker {
          position: absolute;
          left: -1.5rem;
          top: 2rem;
          width: 1rem;
          height: 1rem;
          border-radius: 50%;
          background-color: var(--blue-2);
          border: 3px solid var(--black-3);
        }
        
        .timeline-content {
          background-color: var(--black-4);
          border-radius: 0.5rem;
          padding: 1rem 1.5rem;
        }
        
        .timeline-content h4 {
          font-size: 1rem;
          margin-bottom: 0.5rem;
          color: var(--white);
        }
        
        .timeline-content p {
          font-size: 0.9rem;
          color: var(--gray-4);
          margin-bottom: 1rem;
        }
        
        /* Filters */
        .filters-container {
          display: flex;
          gap: 1rem;
          align-items: center;
        }
        
        .search-input-container {
          display: flex;
          align-items: center;
          background-color: var(--black-4);
          border-radius: 0.5rem;
          padding: 0.5rem 1rem;
          border: 1px solid var(--gray-1);
          flex: 1;
          max-width: 300px;
        }
        
        .search-icon {
          color: var(--gray-4);
          margin-right: 0.5rem;
        }
        
        .search-input-container input {
          background: transparent;
          border: none;
          color: var(--white);
          width: 100%;
        }
        
        .search-input-container input:focus {
          outline: none;
        }
        
        .status-filter {
          padding: 0.5rem 1rem;
          background-color: var(--black-4);
          border: 1px solid var(--gray-1);
          border-radius: 0.5rem;
          color: var(--white);
          cursor: pointer;
        }
        
        /* Empty State */
        .empty-state {
          padding: 3rem 0;
          text-align: center;
        }
        
        .empty-state img {
          max-width: 200px;
          margin-bottom: 1rem;
          opacity: 0.5;
        }
        
        .empty-state h3 {
          font-size: 1.1rem;
          color: var(--white);
          margin-bottom: 0.5rem;
        }
        
        .empty-state p {
          color: var(--gray-4);
        }
        
        /* Loading Spinner */
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
        
        /* Toast */
        .toast {
          position: fixed;
          bottom: 2rem;
          right: 2rem;
          padding: 1rem 1.5rem;
          border-radius: 0.5rem;
          color: white;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          z-index: 1000;
          animation: slideIn 0.3s ease-out;
        }
        
        .toast.success {
          background-color: var(--green-2);
        }
        
        .toast.error {
          background-color: var(--red-2);
        }
        
        .toast-close {
          background: transparent;
          border: none;
          color: white;
          margin-left: 0.5rem;
          cursor: pointer;
        }
        
        /* Animations */
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </UserLayout>
    </ProtectedRoute>
  );
}