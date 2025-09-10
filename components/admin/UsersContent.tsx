 // components/admin/UsersContent.tsx
import { useState, useEffect, useCallback } from 'react';
import { FiSearch, FiTrash2, FiUser, FiClock, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import { api } from '@/services/api';
import { User, VoteSession } from '@/types';

export default function UsersContent() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sessions, setSessions] = useState<VoteSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const [expandedUserId, setExpandedUserId] = useState<number | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [usersRes, sessionsRes] = await Promise.all([
        api.get('/users'),
        api.get('/votes_session')
      ]);

const mappedUsers: User[] = usersRes.data.map((u: any) => ({
  ...u,
  name: u.userName, 
}));

      setUsers(mappedUsers);
setFilteredUsers(mappedUsers);
setSessions(sessionsRes.data);
      showFeedback('success', 'Dados carregados com sucesso');
    } catch (err) {
      showFeedback('error', 'Erro ao carregar dados');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = useCallback(() => {
    try {
      if (!searchTerm) {
        setFilteredUsers(users);
        return;
      }

      const term = searchTerm.toLowerCase().trim();
      const filtered = users.filter(user => {
        if (!user) return false;
        
        const nameMatch = user.name?.toLowerCase().includes(term) ?? false;
        const emailMatch = user.email?.toLowerCase().includes(term) ?? false;
        
        return nameMatch || emailMatch;
      });
      
      setFilteredUsers(filtered);
    } catch (error) {
      console.error("Erro ao filtrar usuários:", error);
      setFilteredUsers(users);
    }
  }, [searchTerm, users]);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      filterUsers();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm, users, filterUsers]);

  const showFeedback = (type: 'success' | 'error' | 'info', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 5000);
  };

  const deleteUser = async (userId: number) => {
    if (!window.confirm('Tem certeza que deseja excluir este usuário?')) return;
    
    try {
      await api.delete(`/users/${userId}`);
      setUsers(users.filter(user => user.id !== userId));
      showFeedback('success', 'Usuário excluído com sucesso');
    } catch (err) {
      showFeedback('error', 'Erro ao excluir usuário');
      console.error('Error deleting user:', err);
    }
  };

  const getUserSessions = (userId: number) => {
    return sessions.filter((session: VoteSession) => 
      users.find((u: User) => u.id === userId)?.votedSessions?.some((vs: {id: number}) => vs.id === session.id)
    );
  };

  const toggleExpandUser = (userId: number) => {
    setExpandedUserId(expandedUserId === userId ? null : userId);
  };

  return (
    <div className="users-content">
      {/* Feedback Message */}
      {feedback && (
        <div className={`feedback-message ${feedback.type}`}>
          {feedback.type === 'success' && <FiCheckCircle className="feedback-icon" />}
          {feedback.type === 'error' && <FiAlertCircle className="feedback-icon" />}
          {feedback.type === 'info' && <FiAlertCircle className="feedback-icon" />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Search Bar */}
      <div className="search-section">
        <div className="search-container">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Buscar por nome ou email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
      </div>

      {/* Users List */}
      <div className="users-list-container">
        {loading ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
          </div>
        ) : filteredUsers.length > 0 ? (
          <div className="users-list">
            {filteredUsers.map(user => (
              <div 
                key={user.id} 
                className={`user-card ${expandedUserId === user.id ? 'expanded' : ''}`}
                onMouseEnter={() => toggleExpandUser(user.id)}
                onMouseLeave={() => toggleExpandUser(user.id)}
              >
                <div className="user-info">
                  <div className="user-avatar">
                    <FiUser className="avatar-icon" />
                  </div>
                  <div className="user-details">
                    <h3 className="user-name">{user.name}</h3>
                    <p className="user-email">{user.email}</p>
                    <div className="user-sessions">
                      <FiClock className="session-icon" />
                      <span>
                        Participou de {user.votedSessions?.length || 0} sessões
                      </span>
                    </div>
                  </div>
                </div>
                
                {/* Expanded Content */}
                
{expandedUserId === user.id && (
  <div className="expanded-content">
    <div className="user-meta-grid">
      <div className="meta-item">
        <span className="meta-label">Nome:</span>
        <span className="meta-value">{user.name}</span>
      </div>
      <div className="meta-item">
        <span className="meta-label">ID:</span>
        <span className="meta-value">{user.id}</span>
      </div>
      <div className="meta-item">
        <span className="meta-label">Tipo:</span>
        <span className="meta-value">{user.role}</span>
      </div>
      <div className="meta-item">
        <span className="meta-label">Email:</span>
        <span className="meta-value">{user.email}</span>
      </div>
    </div>
    
    {user.votedSessions && user.votedSessions.length > 0 ? (
      <div className="user-sessions-list">
        <h4>Sessões que votou:</h4>
        <div className="session-grid">
          {getUserSessions(user.id).map(session => (
            <div key={session.id} className="session-item">
              <span className="session-id">ID: {session.id}</span>
              <span className="session-title">{session.title}</span>
              <span className="session-vote">
                Votou em: {user.votedSessions?.find(vs => vs.id === session.id)?.votedOption || 'N/A'}
              </span>
            </div>
          ))}
        </div>
      </div>
    ) : (
      <div className="no-sessions">
        <FiAlertCircle className="no-sessions-icon" />
        <span>Não participou de nenhuma sessão</span>
      </div>
    )}
  </div>
)}
                
                <div className="user-actions">
                  <button 
                    onClick={() => deleteUser(user.id)}
                    className="delete-btn"
                    title="Excluir usuário"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            {searchTerm ? (
              <>
                <FiAlertCircle size={48} className="empty-icon" />
                <p>Nenhum usuário encontrado</p>
                <button 
                  onClick={() => setSearchTerm('')}
                  className="reset-filters-btn"
                >
                  Limpar busca
                </button>
              </>
            ) : (
              <>
                <FiUser size={48} className="empty-icon" />
                <p>Nenhum usuário cadastrado no sistema</p>
              </>
            )}
          </div>
        )}
      </div>

      <style jsx>{`
        .users-content {
          padding: 1rem;
          animation: fadeIn 0.3s ease;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        /* Feedback Message */
        .feedback-message {
          padding: 1rem;
          margin-bottom: 1.5rem;
          border-radius: 0.5rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 0.875rem;
          animation: slideIn 0.3s ease;
        }
        
        .feedback-message.success {
          background-color: var(--green-1);
          color: var(--white);
        }
        
        .feedback-message.error {
          background-color: var(--red-1);
          color: var(--white);
        }
        
        .feedback-message.info {
          background-color: var(--blue-1);
          color: var(--white);
        }
        
        .feedback-icon {
          font-size: 1.25rem;
        }
        
        /* Search Section */
        .search-section {
          margin-bottom: 1.5rem;
        }
        
        .search-container {
          position: relative;
          max-width: 400px;
        }
        
        .search-icon {
          position: absolute;
          left: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--gray-4);
        }
        
        .search-input {
          padding: 0.75rem 1rem 0.75rem 2.5rem;
          background-color: var(--black-4);
          border: 1px solid var(--gray-1);
          border-radius: 0.5rem;
          color: var(--white);
          width: 100%;
          transition: all 0.3s ease;
        }
        
        .search-input:focus {
          outline: none;
          border-color: var(--gray-3);
        }
        
        /* Users List */
        .users-list-container {
          background-color: var(--black-3);
          border-radius: 0.75rem;
          padding: 1.5rem;
          border: 1px solid var(--gray-1);
        }
        
        .users-list {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        
        .user-card {
          display: flex;
          flex-direction: column;
          padding: 1rem;
          background-color: var(--black-4);
          border-radius: 0.5rem;
          transition: all 0.3s ease;
          cursor: pointer;
          position: relative;
        }
        
        .user-card:hover {
          background-color: var(--gray-1);
        }
        
        .user-card.expanded {
          padding-bottom: 1.5rem;
        }
        
        .user-info {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        
        .user-avatar {
          width: 3rem;
          height: 3rem;
          border-radius: 50%;
          background-color: var(--blue-1);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        
        .avatar-icon {
          font-size: 1.5rem;
          color: var(--white);
        }
        
        .user-details {
          flex: 1;
        }
        
        .user-name {
          font-size: 1rem;
          font-weight: 600;
          color: var(--white);
          margin-bottom: 0.25rem;
        }
        
        .user-email {
          font-size: 0.875rem;
          color: var(--gray-4);
          margin-bottom: 0.5rem;
        }
        
        .user-sessions {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.75rem;
          color: var(--gray-4);
        }
        
        .session-icon {
          font-size: 0.875rem;
        }
        
        /* Expanded Content */
        .expanded-content {
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid var(--gray-1);
          animation: fadeInExpand 0.3s ease;
        }
        
        @keyframes fadeInExpand {
          from { opacity: 0; max-height: 0; }
          to { opacity: 1; max-height: 500px; }
        }
        
        .user-meta {
          display: flex;
          gap: 1.5rem;
          margin-bottom: 1rem;
        }
        
        .meta-item {
          display: flex;
          gap: 0.5rem;
        }
        
        .meta-label {
          font-size: 0.875rem;
          color: var(--gray-4);
        }
        
        .meta-value {
          font-size: 0.875rem;
          color: var(--white);
          font-weight: 500;
        }
        
        .user-sessions-list {
          margin-top: 1rem;
        }
        
        .user-sessions-list h4 {
          font-size: 0.875rem;
          color: var(--gray-4);
          margin-bottom: 0.5rem;
        }
        
        .user-sessions-list ul {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        
        .user-sessions-list li {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
        }
        
        .session-id {
          color: var(--blue-3);
          font-weight: 600;
        }
        
        .session-title {
          color: var(--white);
        }
        
        /* User Actions */
        .user-actions {
          position: absolute;
          top: 1rem;
          right: 1rem;
        }
        
        .delete-btn {
          padding: 0.5rem;
          background-color: var(--red-1);
          border: none;
          border-radius: 0.5rem;
          color: var(--white);
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .delete-btn:hover {
          background-color: var(--red-2);
        }
        
        /* Empty State */
        .empty-state {
          padding: 2rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          text-align: center;
          color: var(--gray-4);
        }
        
        .empty-icon {
          color: var(--gray-2);
          margin-bottom: 0.5rem;
        }
        
        .reset-filters-btn {
          padding: 0.5rem 1rem;
          background-color: var(--blue-1);
          border: none;
          border-radius: 0.5rem;
          color: var(--white);
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .reset-filters-btn:hover {
          background-color: var(--blue-2);
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
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        /* Responsive */
        @media (max-width: 768px) {
          .user-meta {
            flex-direction: column;
            gap: 0.5rem;
          }
        }
          .user-meta-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1rem;
    margin-bottom: 1.5rem;
  }

  .session-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1rem;
  }

  .session-item {
    background-color: var(--black-2);
    padding: 0.75rem;
    border-radius: 0.5rem;
    border-left: 3px solid var(--blue-2);
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .session-id {
    color: var(--blue-3);
    font-weight: 600;
    font-size: 0.8rem;
  }

  .session-title {
    font-weight: 500;
    color: var(--white);
    font-size: 0.9rem;
  }

  .session-vote {
    color: var(--green-2);
    font-size: 0.8rem;
    margin-top: 0.25rem;
  }

  .no-sessions {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: var(--gray-4);
    padding: 1rem;
    background-color: var(--black-2);
    border-radius: 0.5rem;
  }

  .no-sessions-icon {
    color: var(--gray-3);
  }

  @media (max-width: 768px) {
    .user-meta-grid {
      grid-template-columns: 1fr;
    }
    
    .session-grid {
      grid-template-columns: 1fr;
    }
  }

      `}</style>
    </div>
  );
} 