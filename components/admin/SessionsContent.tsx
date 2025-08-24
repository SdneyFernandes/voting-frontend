// components/admin/SessionsContent.tsx
import { useState, useEffect } from 'react';
import { 
  FiPlus, FiClock, FiCalendar, FiUsers, 
  FiSearch, FiTrash2, FiCheck, 
  FiX, FiBarChart2, FiUser 
} from 'react-icons/fi';
import { api } from '@/services/api';
import { getCookie } from '@/utils/cookies';

interface VoteSession {
  id: number;
  title: string;
  description: string;
  startAt: string;
  endAt: string;
  status: 'ACTIVE' | 'ENDED' | 'NOT_STARTED';
  options: string[];
  creatorId: number;
}

interface VoteResult {
  totalVotos: number;
  resultado: Record<string, number>;
  vencedor?: string;
}

export default function SessionsContent() {
  const [sessions, setSessions] = useState<VoteSession[]>([]);
  const [filteredSessions, setFilteredSessions] = useState<VoteSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'results' | 'userVotes' | 'create'>('all');
  const [searchUserId, setSearchUserId] = useState('');
  const [searchSessionId, setSearchSessionId] = useState('');
  const [sessionResults, setSessionResults] = useState<Record<number, VoteResult>>({});
  const [userVotedSessions, setUserVotedSessions] = useState<VoteSession[]>([]);
  const [newSession, setNewSession] = useState({
    title: '',
    description: '',
    startAt: '',
    endAt: '',
    options: ['', '']
  });
  const [creationMessage, setCreationMessage] = useState({ text: '', isError: false });

  const userId = Number(getCookie('userId'));

  useEffect(() => {
    fetchSessions();
  }, []);

  useEffect(() => {
    setSearchSessionId('');
    setFilteredSessions(sessions);
  }, [activeTab, sessions]);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const res = await api.get('/votes_session');
      setSessions(res.data);
      setFilteredSessions(res.data);
    } catch (err) {
      console.error('Error fetching sessions:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSessionResults = async (sessionId: number) => {
  try {
    console.log(`Buscando resultados para sessão ${sessionId}...`);
    const res = await api.get(`/votes_session/${sessionId}/results`);
    console.log('Dados recebidos:', res.data);
    
    setSessionResults(prev => ({
      ...prev,
      [sessionId]: {
        totalVotos: res.data.total,
        resultado: res.data.results,
        vencedor: res.data.winner
      }
    }));
  } catch (err) {
    console.error('Error fetching session results:', err);
    showToast('Erro ao carregar resultados', 'error');
  }
};

  const fetchUserVotedSessions = async (userId: string) => {
    try {
      setLoading(true);
      const res = await api.get(`/votes_session/voted?userId=${userId}`);
      setUserVotedSessions(res.data);
    } catch (err) {
      console.error('Error fetching user voted sessions:', err);
    } finally {
      setLoading(false);
    }
  };

  const deleteSession = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir esta sessão?')) return;
    
    try {
      await api.delete(`/votes_session/${id}`);
      fetchSessions();
    } catch (err) {
      console.error('Error deleting session:', err);
    }
  };

  const validateSession = () => {
    if (!newSession.title.trim()) {
      setCreationMessage({ text: 'Título é obrigatório', isError: true });
      return false;
    }
    if (!newSession.startAt || !newSession.endAt) {
      setCreationMessage({ text: 'Datas de início e término são obrigatórias', isError: true });
      return false;
    }
    if (new Date(newSession.endAt) <= new Date(newSession.startAt)) {
      setCreationMessage({ text: 'Data de término deve ser posterior à data de início', isError: true });
      return false;
    }
    if (newSession.options.filter(opt => opt.trim()).length < 2) {
      setCreationMessage({ text: 'Pelo menos 2 opções são necessárias', isError: true });
      return false;
    }
    return true;
  };

  const createSession = async () => {
    if (!validateSession()) return;

    try {
      const { title, startAt, endAt, options } = newSession;
      await api.post('/votes_session/create', { 
        title,
        description: newSession.description,
        startAt,
        endAt,
        options: options.filter(opt => opt.trim()),
        creatorId: userId
      });
      
      setCreationMessage({ text: 'Sessão criada com sucesso!', isError: false });
      setNewSession({
        title: '',
        description: '',
        startAt: '',
        endAt: '',
        options: ['', '']
      });
      fetchSessions();
      
      // Limpa a mensagem após 3 segundos
      setTimeout(() => setCreationMessage({ text: '', isError: false }), 3000);
    } catch (err) {
      setCreationMessage({ text: 'Erro ao criar sessão', isError: true });
      console.error('Error creating session:', err);
    }
  };

  const searchSessionById = async () => {
    if (!searchSessionId) return;
    
    try {
      setLoading(true);
      const res = await api.get(`/votes_session/${searchSessionId}`);
      setFilteredSessions([res.data]);
    } catch (err) {
      console.error('Error searching session:', err);
      setFilteredSessions([]);
    } finally {
      setLoading(false);
    }
  };

  const resetSearch = () => {
    setFilteredSessions(sessions);
    setSearchSessionId('');
    setSearchUserId('');
  };

  const getStatusBadge = (status: string) => {
    const base = "px-2 py-1 rounded-full text-xs font-medium";
    switch(status) {
      case 'ACTIVE':
        return `${base} bg-green-900 text-green-300`;
      case 'ENDED':
        return `${base} bg-red-900 text-red-300`;
      case 'NOT_STARTED':
        return `${base} bg-yellow-900 text-yellow-300`;
      default:
        return `${base} bg-gray-700 text-gray-300`;
    }
  };

  const renderResultsCard = (sessionId: number) => {
    const result = sessionResults[sessionId];
    if (!result) {
      fetchSessionResults(sessionId);
      return <div className="loading-spinner">Carregando resultados...</div>;
    }

    if (result.totalVotos === 0) {
      return (
        <div className="result-card no-results">
          <h3>Nenhum voto registrado ainda</h3>
        </div>
      );
    }

    const winner = result.vencedor || 
      Object.entries(result.resultado).reduce((a, b) => a[1] > b[1] ? a : b)[0];
    return (
      <div className="result-card">
        <h3>Resultado Final</h3>
        <div className="total-votes">Total de votos: {result.totalVotos}</div>
        
        <div className="results-grid">
          {Object.entries(result.resultado).map(([option, votes]) => (
            <div 
              key={option} 
              className={`result-item ${option === winner ? 'winner' : ''}`}
            >
              <div className="option">{option}</div>
              <div className="votes">{votes} votos</div>
              <div className="percentage">
                {Math.round((votes / result.totalVotos) * 100)}%
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${(votes / result.totalVotos) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
        
        <div className="winner-section">
          <span className="winner-label">Vencedor:</span>
          <span className="winner-name">{winner}</span>
        </div>
      </div>
    );
  };

  return (
    <div className="sessions-container">
      {/* Tabs de Navegação */}
      <div className="tabs-container">
        <button 
          className={`tab ${activeTab === 'all' ? 'active' : ''}`}
          onClick={() => setActiveTab('all')}
        >
          <FiCalendar className="tab-icon" /> Todas as Sessões
        </button>
        <button 
          className={`tab ${activeTab === 'results' ? 'active' : ''}`}
          onClick={() => setActiveTab('results')}
        >
          <FiBarChart2 className="tab-icon" /> Ver Resultados
        </button>
        <button 
          className={`tab ${activeTab === 'userVotes' ? 'active' : ''}`}
          onClick={() => setActiveTab('userVotes')}
        >
          <FiUser className="tab-icon" /> Votos por Usuário
        </button>
        <button 
          className={`tab ${activeTab === 'create' ? 'active' : ''}`}
          onClick={() => setActiveTab('create')}
        >
          <FiPlus className="tab-icon" /> Nova Sessão
        </button>
      </div>

      {/* Conteúdo das Tabs */}
      {activeTab === 'all' && (
  <div className="tab-content">
    <div className="search-container">
      <div className="search-group">
        <FiSearch className="search-icon" />
        <input 
          type="text" 
          placeholder="Buscar por ID da sessão" 
          value={searchSessionId}
          onChange={(e) => setSearchSessionId(e.target.value)}
          className="search-input"
        />
        <button 
          onClick={searchSessionById}
          className="search-button"
        >
          Buscar
        </button>
      </div>
    </div>

    {loading ? (
      <div className="loading-spinner">Carregando sessões...</div>
    ) : filteredSessions.length === 0 ? (
      <div className="empty-state">Nenhuma sessão encontrada</div>
    ) : (
      <div className="sessions-grid">
        {filteredSessions.map(session => (
          <div key={session.id} className="session-card">
            <div className="session-header">
              <h3 className="session-title">{session.title}</h3>
              <span className={getStatusBadge(session.status)}>
                {session.status === 'ACTIVE' ? 'Ativa' : 
                 session.status === 'ENDED' ? 'Encerrada' : 'Não Iniciada'}
              </span>
            </div>
            
            {session.description && (
              <div className="session-description">
                <p>{session.description}</p>
              </div>
            )}
            
            <div className="session-details">
              <div className="detail-item">
                <FiClock className="icon" />
                <span>Início: {new Date(session.startAt).toLocaleString()}</span>
              </div>
              <div className="detail-item">
                <FiClock className="icon" />
                <span>Término: {new Date(session.endAt).toLocaleString()}</span>
              </div>
              <div className="detail-item">
                <FiUsers className="icon" />
                <span>Opções: {session.options.length}</span>
              </div>
            </div>
            
            <div className="session-options">
              <h4>Opções disponíveis:</h4>
              <div className="options-grid">
                {session.options.map((opt, i) => (
                  <span key={i} className="option-tag">{opt}</span>
                ))}
              </div>
            </div>
            
            <div className="session-actions">
              <button 
                className="action-button delete"
                onClick={() => deleteSession(session.id)}
              >
                <FiTrash2 /> Excluir Sessão
              </button>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
)}

      {activeTab === 'results' && (
  <div className="tab-content">
    <div className="search-container">
      <div className="search-group">
        <FiSearch className="search-icon" />
        <input 
          type="text" 
          placeholder="Buscar por ID da sessão" 
          value={searchSessionId}
          onChange={(e) => setSearchSessionId(e.target.value)}
          className="search-input"
        />
        <button 
          onClick={searchSessionById}
          className="search-button"
        >
          Buscar Resultado
        </button>
      </div>
    </div>

    {loading ? (
      <div className="loading-spinner">Carregando resultados...</div>
    ) : filteredSessions.length === 0 ? (
      <div className="empty-state">Nenhuma sessão encontrada</div>
    ) : (
      <div className="results-container">
        {filteredSessions.map(session => (
          <div key={session.id} className="result-card-container">
            <div className="session-info-card">
              <h3>{session.title}</h3>
              {session.description && (
                <p className="session-description">{session.description}</p>
              )}
              
              <div className="session-meta-grid">
                <div className="meta-item">
                  <FiCalendar className="icon" />
                  <span>Início: {new Date(session.startAt).toLocaleString()}</span>
                </div>
                <div className="meta-item">
                  <FiCalendar className="icon" />
                  <span>Término: {new Date(session.endAt).toLocaleString()}</span>
                </div>
                <div className="meta-item">
                  <FiUsers className="icon" />
                  <span>Opções: {session.options.length}</span>
                </div>
                <div className="meta-item status">
                  <span className={getStatusBadge(session.status)}>
                    {session.status === 'ACTIVE' ? 'Em andamento' : 
                     session.status === 'ENDED' ? 'Encerrada' : 'Não iniciada'}
                  </span>
                </div>
              </div>
            </div>

            {session.status === 'ACTIVE' ? (
              <div className="active-session-notice">
                <FiClock className="icon" />
                <div>
                  <h4>Sessão em andamento</h4>
                  <p>Os resultados estarão disponíveis após o encerramento</p>
                </div>
              </div>
            ) : (
              <div className="results-card">
                <div className="results-header">
                  <h4>Resultados da Votação</h4>
                  <div className="total-votes">
                    <FiUsers className="icon" />
                    <span>Total de votos: {sessionResults[session.id]?.totalVotos || 0}</span>
                  </div>
                </div>

                {sessionResults[session.id]?.totalVotos === 0 ? (
                  <div className="no-results">
                    <FiBarChart2 className="icon" />
                    <p>Nenhum voto registrado nesta sessão</p>
                  </div>
                ) : (
                  <>
                    <div className="results-grid">
                      {Object.entries(sessionResults[session.id]?.resultado || {}).map(([option, votes]) => {
                        const percentage = Math.round((votes / sessionResults[session.id].totalVotos) * 100);
                        const isWinner = sessionResults[session.id].vencedor === option;
                        
                        return (
                          <div 
                            key={option} 
                            className={`result-item ${isWinner ? 'winner' : ''}`}
                          >
                            <div className="option-info">
                              <span className="option-name">{option}</span>
                              <span className="vote-count">{votes} votos</span>
                            </div>
                            <div className="percentage-bar">
                              <div className="percentage-value">{percentage}%</div>
                              <div className="progress-container">
                                <div 
                                  className="progress-fill"
                                  style={{ width: `${percentage}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {sessionResults[session.id]?.vencedor && (
                      <div className="winner-card">
                        <FiCheck className="icon" />
                        <div>
                          <span className="winner-label">Opção vencedora:</span>
                          <span className="winner-name">{sessionResults[session.id].vencedor}</span>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    )}
  </div>
)}

      {activeTab === 'userVotes' && (
  <div className="tab-content">
    <div className="search-container">
      <div className="search-group">
        <FiUser className="search-icon" />
        <input 
          type="text" 
          placeholder="Digite o ID do usuário" 
          value={searchUserId}
          onChange={(e) => setSearchUserId(e.target.value)}
          className="search-input"
        />
        <button 
          onClick={() => fetchUserVotedSessions(searchUserId)}
          className="search-button"
        >
          Buscar Sessões
        </button>
      </div>
    </div>

    {loading ? (
      <div className="loading-spinner">Carregando sessões...</div>
    ) : userVotedSessions.length === 0 ? (
      <div className="empty-state">
        {searchUserId ? 
          'Nenhuma sessão encontrada para este usuário' : 
          <div className="empty-state-content">
            <FiUser className="icon" />
            <p>Digite um ID de usuário para buscar as sessões votadas</p>
          </div>
        }
      </div>
    ) : (
      <div className="user-votes-container">
        <div className="user-info-header">
          <div className="user-avatar">
            <FiUser />
          </div>
          <h3>Sessões votadas pelo usuário #{searchUserId}</h3>
          <span className="total-sessions">
            {userVotedSessions.length} {userVotedSessions.length === 1 ? 'sessão' : 'sessões'}
          </span>
        </div>

        <div className="user-sessions-grid">
          {userVotedSessions.map(session => (
            <div key={session.id} className="user-session-card">
              <div className="session-header">
                <h3>{session.title}</h3>
                <span className={getStatusBadge(session.status)}>
                  {session.status === 'ACTIVE' ? 'Ativa' : 
                   session.status === 'ENDED' ? 'Encerrada' : 'Não Iniciada'}
                </span>
              </div>
              
              {session.description && (
                <div className="session-description">
                  <p>{session.description}</p>
                </div>
              )}
              
              <div className="session-meta">
                <div className="meta-item">
                  <FiCalendar className="icon" />
                  <span>Início: {new Date(session.startAt).toLocaleString()}</span>
                </div>
                <div className="meta-item">
                  <FiCalendar className="icon" />
                  <span>Término: {new Date(session.endAt).toLocaleString()}</span>
                </div>
                <div className="meta-item">
                  <FiUsers className="icon" />
                  <span>Opções: {session.options.length}</span>
                </div>
              </div>
              
              <div className="session-actions">
                <button 
                  className="view-results-button"
                  onClick={() => {
                    setSearchSessionId(session.id.toString());
                    setActiveTab('results');
                    fetchSessionResults(session.id);
                  }}
                >
                  <FiBarChart2 /> Ver Resultados
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    )}
  </div>
)}


      {activeTab === 'create' && (
        <div className="tab-content">
          <div className="create-session-card">
            <h2>Criar Nova Sessão de Votação</h2>
            
            {creationMessage.text && (
              <div className={`alert ${creationMessage.isError ? 'error' : 'success'}`}>
                <FiClock className="icon" />
                <span>{creationMessage.text}</span>
              </div>
            )}

            <div className="form-group">
              <label>Título*</label>
              <input
                type="text"
                value={newSession.title}
                onChange={(e) => setNewSession({...newSession, title: e.target.value})}
                placeholder="Título da sessão"
              />
            </div>
            
            <div className="form-group">
              <label>Descrição</label>
              <textarea
                value={newSession.description}
                onChange={(e) => setNewSession({...newSession, description: e.target.value})}
                placeholder="Descrição detalhada da sessão"
                rows={3}
              />
            </div>
            
            <div className="dates-container">
              <div className="form-group">
                <label>Data de Início*</label>
                <input
                  type="datetime-local"
                  value={newSession.startAt}
                  onChange={(e) => setNewSession({...newSession, startAt: e.target.value})}
                />
              </div>
              
              <div className="form-group">
                <label>Data de Término*</label>
                <input
                  type="datetime-local"
                  value={newSession.endAt}
                  onChange={(e) => setNewSession({...newSession, endAt: e.target.value})}
                />
              </div>
            </div>
            
            <div className="options-container">
              <label>Opções de Voto*</label>
              {newSession.options.map((option, index) => (
                <div key={index} className="option-input-group">
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => {
                      const newOptions = [...newSession.options];
                      newOptions[index] = e.target.value;
                      setNewSession({...newSession, options: newOptions});
                    }}
                    placeholder={`Opção ${index + 1}`}
                  />
                  {newSession.options.length > 2 && (
                    <button
                      onClick={() => {
                        const newOptions = [...newSession.options];
                        newOptions.splice(index, 1);
                        setNewSession({...newSession, options: newOptions});
                      }}
                      className="remove-option"
                    >
                      <FiX />
                    </button>
                  )}
                </div>
              ))}
              
              <button
                onClick={() => setNewSession({...newSession, options: [...newSession.options, '']})}
                className="add-option"
                disabled={newSession.options.length >= 5}
              >
                <FiPlus /> Adicionar Opção {newSession.options.length >= 5 && '(Máx. 5)'}
              </button>
            </div>
            
            <div className="form-actions">
              <button
                onClick={() => {
                  setNewSession({
                    title: '',
                    description: '',
                    startAt: '',
                    endAt: '',
                    options: ['', '']
                  });
                  setCreationMessage({ text: '', isError: false });
                }}
                className="cancel-button"
              >
                Limpar
              </button>
              <button
                onClick={createSession}
                className="submit-button"
              >
                <FiCheck /> Criar Sessão
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .sessions-container {
          padding: 1rem;
        }
        
        .tabs-container {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 1.5rem;
          border-bottom: 1px solid var(--gray-1);
          padding-bottom: 0.5rem;
        }
        
        .tab {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          background: transparent;
          border: none;
          border-radius: 0.5rem;
          color: var(--gray-4);
          cursor: pointer;
          transition: all 0.3s ease;
          font-weight: 500;
        }
        
        .tab:hover {
          background: var(--gray-1);
          color: var(--white);
        }
        
        .tab.active {
          background: var(--blue-1);
          color: var(--white);
        }
        
        .tab-icon {
          font-size: 1rem;
        }
        
        .tab-content {
          animation: slideIn 0.3s ease-out;
        }
        
        .search-container {
          margin-bottom: 1.5rem;
        }
        
        .search-group {
          display: flex;
          align-items: center;
          background: var(--black-4);
          border-radius: 0.5rem;
          padding: 0.5rem;
          border: 1px solid var(--gray-1);
        }
        
        .search-icon {
          margin: 0 0.5rem;
          color: var(--gray-4);
        }
        
        .search-input {
          flex: 1;
          background: transparent;
          border: none;
          color: var(--white);
          padding: 0.5rem;
        }
        
        .search-input:focus {
          outline: none;
        }
        
        .search-button, .reset-button {
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 0.25rem;
          margin-left: 0.5rem;
          cursor: pointer;
          transition: all 0.3s ease;
          font-weight: 500;
        }
        
        .search-button {
          background: var(--blue-2);
          color: white;
        }
        
        .search-button:hover {
          background: var(--blue-3);
        }
        
        .reset-button {
          background: var(--gray-1);
          color: var(--white);
        }
        
        .reset-button:hover {
          background: var(--gray-2);
        }
        
        .loading-spinner {
          padding: 2rem;
          text-align: center;
          color: var(--gray-4);
        }
        
        .empty-state {
          padding: 2rem;
          text-align: center;
          background: var(--black-3);
          border-radius: 0.5rem;
          color: var(--gray-4);
        }
        
        .sessions-grid, .user-sessions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 1rem;
        }
        
        .session-card {
    background: var(--black-3);
    border-radius: 0.75rem;
    padding: 1.75rem;
    border: 1px solid var(--gray-1);
    transition: all 0.3s ease;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  }
  
  .session-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
    border-color: var(--blue-1);
  }
  
  .session-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 1.25rem;
  }
  
  .session-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: var(--white);
    margin: 0;
  }
  
  .session-description {
    color: var(--gray-4);
    margin-bottom: 1.5rem;
    line-height: 1.5;
    font-size: 0.95rem;
  }
  
  .session-details {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 1rem;
    margin-bottom: 1.5rem;
  }
  
  .detail-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: var(--gray-4);
    font-size: 0.9rem;
  }
  
  .detail-item .icon {
    min-width: 16px;
  }
  
  .session-options h4 {
    font-size: 0.95rem;
    margin-bottom: 0.75rem;
    color: var(--gray-4);
  }
  
  .options-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 0.75rem;
    margin-bottom: 1.5rem;
  }
  
  .option-tag {
    background: var(--black-4);
    padding: 0.5rem 1rem;
    border-radius: 0.5rem;
    font-size: 0.85rem;
    border: 1px solid var(--gray-1);
  }
  
  .session-actions {
    display: flex;
    justify-content: flex-end;
  }
  
  .action-button.delete {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem 1.5rem;
    background: var(--red-1);
    color: var(--white);
    border: none;
    border-radius: 0.5rem;
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 0.95rem;
  }
  
  .action-button.delete:hover {
    background: var(--red-2);
    transform: translateY(-2px);
  }
        
        /* Result Card Styles */
        .results-container {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        
        .session-with-results {
          background: var(--black-3);
          border-radius: 0.5rem;
          padding: 1.5rem;
          border: 1px solid var(--gray-1);
        }
        
        .session-info {
          margin-bottom: 1rem;
        }
        
        .session-info h3 {
          font-size: 1.2rem;
          margin-bottom: 0.5rem;
          color: var(--white);
        }
        
        .session-meta {
          display: flex;
          gap: 1rem;
          color: var(--gray-4);
          font-size: 0.9rem;
        }
        
        .active-session-message {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 1rem;
          background: var(--black-4);
          border-radius: 0.5rem;
          color: var(--gray-4);
        }
        
        .result-card {
          background: var(--black-4);
          border-radius: 0.5rem;
          padding: 1.5rem;
          border-left: 4px solid var(--blue-2);
        }
        
        .result-card.no-results {
          border-left-color: var(--gray-2);
          text-align: center;
          color: var(--gray-4);
        }
        
        .result-card h3 {
          font-size: 1.1rem;
          margin-bottom: 1rem;
          color: var(--white);
        }
        
        .total-votes {
          color: var(--gray-4);
          margin-bottom: 1rem;
          font-size: 0.9rem;
        }
        
        .results-grid {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
        }
        
        .result-item {
          background: var(--black-3);
          padding: 0.75rem;
          border-radius: 0.25rem;
          position: relative;
        }
        
        .result-item.winner {
          border-left: 3px solid var(--green-2);
        }
        
        .option {
          font-weight: 500;
          margin-bottom: 0.25rem;
          color: var(--white);
        }
        
        .votes {
          font-size: 0.8rem;
          color: var(--gray-4);
        }
        
        .percentage {
          position: absolute;
          right: 0.75rem;
          top: 0.75rem;
          font-weight: 600;
          color: var(--white);
        }
        
        .progress-bar {
          height: 4px;
          background: var(--black-2);
          border-radius: 2px;
          margin-top: 0.5rem;
          overflow: hidden;
        }
        
        .progress-fill {
          height: 100%;
          background: var(--blue-3);
          border-radius: 2px;
        }
        
        .winner-section {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem;
          background: var(--green-1);
          border-radius: 0.25rem;
          margin-top: 1rem;
        }
        
        .winner-label {
          font-weight: 500;
        }
        
        .winner-name {
          font-weight: 600;
          color: var(--white);
        }

        .result-card-container {
    background: var(--black-3);
    border-radius: 0.75rem;
    padding: 0;
    border: 1px solid var(--gray-1);
    margin-bottom: 2rem;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .session-info-card {
    padding: 1.75rem;
    background: var(--black-4);
    border-bottom: 1px solid var(--gray-1);
  }

  .session-info-card h3 {
    font-size: 1.25rem;
    margin: 0 0 0.5rem 0;
    color: var(--white);
  }

  .session-description {
    color: var(--gray-4);
    margin-bottom: 1.25rem;
    line-height: 1.5;
    font-size: 0.95rem;
  }

  .session-meta-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
  }

  .meta-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: var(--gray-4);
    font-size: 0.9rem;
  }

  .meta-item.status {
    justify-content: flex-end;
  }

  .active-session-notice {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1.5rem;
    background: var(--black-3);
    color: var(--gray-4);
  }

  .active-session-notice .icon {
    font-size: 1.5rem;
    color: var(--yellow-1);
  }

  .active-session-notice h4 {
    margin: 0 0 0.25rem 0;
    color: var(--white);
  }

  .active-session-notice p {
    margin: 0;
    font-size: 0.9rem;
  }

  .results-card {
    padding: 1.75rem;
  }

  .results-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1.5rem;
  }

  .results-header h4 {
    font-size: 1.1rem;
    margin: 0;
    color: var(--white);
  }

  .total-votes {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: var(--gray-4);
    font-size: 0.9rem;
  }

  .no-results {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    padding: 2rem;
    color: var(--gray-4);
    text-align: center;
  }

  .no-results .icon {
    font-size: 2rem;
    color: var(--gray-2);
  }

  .results-grid {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-bottom: 1.5rem;
  }

  .result-item {
    background: var(--black-4);
    border-radius: 0.5rem;
    padding: 1rem;
    transition: all 0.3s ease;
  }

  .result-item.winner {
    border-left: 3px solid var(--green-1);
    background: var(--black-3);
  }

  .option-info {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.75rem;
  }

  .option-name {
    font-weight: 500;
    color: var(--white);
  }

  .vote-count {
    color: var(--gray-4);
    font-size: 0.9rem;
  }

  .percentage-bar {
    display: flex;
    align-items: center;
    gap: 1rem;
  }

  .percentage-value {
    min-width: 40px;
    text-align: right;
    font-weight: 600;
    color: var(--white);
  }

  .progress-container {
    flex: 1;
    height: 8px;
    background: var(--black-2);
    border-radius: 4px;
    overflow: hidden;
  }

  .progress-fill {
    height: 100%;
    background: var(--blue-1);
    border-radius: 4px;
    transition: width 0.5s ease;
  }

  .winner-card {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background: var(--green-1);
    border-radius: 0.5rem;
    color: var(--white);
  }

  .winner-card .icon {
    font-size: 1.5rem;
  }

  .winner-label {
    font-size: 0.9rem;
    opacity: 0.8;
  }

  .winner-name {
    font-weight: 600;
    font-size: 1.1rem;
  }

        
        /* User Sessions */
        .user-session-card {
          background: var(--black-3);
          border-radius: 0.5rem;
          padding: 1.5rem;
          border: 1px solid var(--gray-1);
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        
        .user-session-card h3 {
          font-size: 1.1rem;
          color: var(--white);
        }
        
        .view-results-button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: var(--blue-1);
          color: var(--white);
          border: none;
          border-radius: 0.25rem;
          cursor: pointer;
          margin-top: 0.5rem;
          transition: all 0.3s ease;
        }
        
        .view-results-button:hover {
          background: var(--blue-2);
        }

        .user-votes-container {
    background: var(--black-3);
    border-radius: 0.75rem;
    padding: 0;
    overflow: hidden;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  .user-info-header {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1.5rem;
    background: var(--black-4);
    border-bottom: 1px solid var(--gray-1);
  }

  .user-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: var(--blue-1);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 1.25rem;
  }

  .user-info-header h3 {
    margin: 0;
    flex: 1;
    color: var(--white);
  }

  .total-sessions {
    background: var(--black-2);
    padding: 0.5rem 1rem;
    border-radius: 9999px;
    font-size: 0.85rem;
    color: var(--gray-4);
  }

  .user-sessions-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1.5rem;
    padding: 1.5rem;
  }

  .user-session-card {
    background: var(--black-4);
    border-radius: 0.5rem;
    padding: 1.5rem;
    border: 1px solid var(--gray-1);
    transition: all 0.3s ease;
    display: flex;
    flex-direction: column;
    height: 100%;
  }

  .user-session-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
    border-color: var(--blue-1);
  }

  .session-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 1rem;
  }

  .session-header h3 {
    font-size: 1.1rem;
    margin: 0;
    color: var(--white);
  }

  .session-description {
    color: var(--gray-4);
    margin-bottom: 1rem;
    font-size: 0.9rem;
    line-height: 1.5;
    flex: 1;
  }

  .session-meta {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    margin-bottom: 1.5rem;
  }

  .meta-item {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: var(--gray-4);
    font-size: 0.85rem;
  }

  .session-actions {
    margin-top: auto;
  }

  .view-results-button {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    width: 100%;
    padding: 0.75rem;
    background: var(--blue-1);
    color: white;
    border: none;
    border-radius: 0.5rem;
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 0.9rem;
  }

  .view-results-button:hover {
    background: var(--blue-2);
    transform: translateY(-2px);
  }

  .empty-state-content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    text-align: center;
    color: var(--gray-4);
  }

  .empty-state-content .icon {
    font-size: 2.5rem;
    opacity: 0.5;
  }
        
        /* Create Session Form */
        .create-session-card {
          background: var(--black-3);
          border-radius: 0.5rem;
          padding: 1.5rem;
          border: 1px solid var(--gray-1);
        }
        
        .create-session-card h2 {
          font-size: 1.25rem;
          margin-bottom: 1.5rem;
          color: var(--white);
        }
        
        .alert {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem;
          margin-bottom: 1rem;
          border-radius: 0.25rem;
          font-size: 0.9rem;
        }
        
        .alert.success {
          background: var(--green-1);
          color: var(--white);
        }
        
        .alert.error {
          background: var(--red-1);
          color: var(--white);
        }
        
        .alert .icon {
          font-size: 1rem;
        }
        
        .form-group {
          margin-bottom: 1rem;
        }
        
        .form-group label {
          display: block;
          margin-bottom: 0.5rem;
          color: var(--gray-4);
          font-size: 0.9rem;
        }
        
        .form-group input, 
        .form-group textarea {
          width: 100%;
          padding: 0.75rem;
          background: var(--black-4);
          border: 1px solid var(--gray-1);
          border-radius: 0.25rem;
          color: var(--white);
        }
        
        .form-group textarea {
          resize: vertical;
          min-height: 100px;
        }
        
        .dates-container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-bottom: 1rem;
        }
        
        .options-container {
          margin-bottom: 1.5rem;
        }
        
        .option-input-group {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
        }
        
        .option-input-group input {
          flex: 1;
          padding: 0.75rem;
          background: var(--black-4);
          border: 1px solid var(--gray-1);
          border-radius: 0.25rem;
          color: var(--white);
        }
        
        .remove-option {
          background: var(--red-1);
          color: var(--white);
          border: none;
          border-radius: 0.25rem;
          width: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }
        
        .add-option {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: var(--black-4);
          color: var(--white);
          border: 1px dashed var(--gray-2);
          border-radius: 0.25rem;
          cursor: pointer;
          margin-top: 0.5rem;
        }
        
        .add-option:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        
        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 0.5rem;
          margin-top: 1rem;
        }
        
        .cancel-button {
          padding: 0.75rem 1.5rem;
          background: var(--black-4);
          color: var(--white);
          border: 1px solid var(--gray-1);
          border-radius: 0.25rem;
          cursor: pointer;
        }
        
        .submit-button {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1.5rem;
          background: var(--blue-2);
          color: white;
          border: none;
          border-radius: 0.25rem;
          cursor: pointer;
          font-weight: 500;
        }
        
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
