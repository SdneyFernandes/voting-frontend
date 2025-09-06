import { FiX, FiPieChart, FiBarChart2, FiDownload, FiUsers, FiCheck } from 'react-icons/fi';
import { useState, useEffect } from 'react';
import { normalizeResults, NormalizedResults } from '@/utils/normalizeResults';

interface ResultsModalProps {
  session: {
    id: number;
    title: string;
    description: string;
    options: string[];
    results?: Record<string, number | undefined> & {
      total?: number;
      totalVotos?: number;
      resultado?: Record<string, number>;
      _updatedAt?: number;
    };
  };
  onClose: () => void;
}

export default function ResultsModal({ session, onClose }: ResultsModalProps) {
  console.log('[RESULTS-MODAL] Props recebidos:', { session });

  const [activeTab, setActiveTab] = useState<'chart' | 'table'>('chart');
  const [isAnimating, setIsAnimating] = useState(false);
  const [animationProgress, setAnimationProgress] = useState(0);
  const [localResults, setLocalResults] = useState<NormalizedResults | undefined>(() =>
    normalizeResults(session.results)
  );

  useEffect(() => {
    setLocalResults(normalizeResults(session.results));
  }, [session.results]);

  useEffect(() => {
    setIsAnimating(true);
    const duration = 1000;
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      setAnimationProgress(progress);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setIsAnimating(false);
      }
    };

    animate();

    return () => {
      setIsAnimating(false);
      setAnimationProgress(0);
    };
  }, [localResults]);

  if (!localResults) {
    return (
      <div className="modal-overlay">
        <div className="results-modal">
          <div className="modal-header">
            <h3>Resultados não disponíveis</h3>
            <button onClick={onClose} className="close-button">
              <FiX />
            </button>
          </div>
          <div className="modal-body">
            <div className="empty-results">
              <p>Os resultados para esta sessão ainda não estão disponíveis.</p>
              <button onClick={onClose} className="action-button">
                Fechar
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const totalVotes = localResults.total || 1;
  const maxVotes = Math.max(...session.options.map(opt => localResults?.[opt] as number || 0), 1);

  const sortedOptions = [...session.options].sort((a, b) => {
    const votesA = (localResults?.[a] as number) || 0;
    const votesB = (localResults?.[b] as number) || 0;
    return votesB - votesA;
  });

  const winner = sortedOptions.length > 0 ? sortedOptions[0] : null;
  const isTie =
    sortedOptions.length > 1 &&
    ((localResults?.[sortedOptions[0]] as number) || 0) ===
      ((localResults?.[sortedOptions[1]] as number) || 0);

  useEffect(() => {
    console.log('Results atualizados no modal:', localResults);
  }, [localResults]);

  function getBarColor(index: number) {
    const colors = ['#4CAF50', '#2196F3', '#FFC107', '#E91E63', '#9C27B0', '#FF5722'];
    return colors[index % colors.length];
  }

  return (
    <div className="modal-overlay">
      <div className="results-modal">
        <div className="modal-header">
          <div className="header-content">
            <h3>Resultados: {session.title}</h3>
            <p className="session-description">{session.description}</p>
          </div>
          <button onClick={onClose} className="close-button">
            <FiX />
          </button>
        </div>

        <div className="modal-body">
          <div className="results-header">
            <div className="total-votes">
              <FiUsers className="icon" />
              <span>Total de votos: <strong>{totalVotes}</strong></span>
            </div>

            {winner && !isTie && (
              <div className="winner-banner">
                <FiCheck className="icon" />
                <span>Vencedor: <strong>{winner}</strong></span>
              </div>
            )}

            {isTie && (
              <div className="tie-banner">
                <span>Empate entre <strong>{sortedOptions[0]}</strong> e <strong>{sortedOptions[1]}</strong></span>
              </div>
            )}

            <div className="tabs">
              <button
                className={`tab-button ${activeTab === 'chart' ? 'active' : ''}`}
                onClick={() => setActiveTab('chart')}
              >
                <FiPieChart /> Gráfico
              </button>
              <button
                className={`tab-button ${activeTab === 'table' ? 'active' : ''}`}
                onClick={() => setActiveTab('table')}
              >
                <FiBarChart2 /> Tabela
              </button>
            </div>
          </div>

          {activeTab === 'chart' ? (
            <div className="chart-container" key={localResults?._updatedAt}>
              <div className="bar-chart">
                {sortedOptions.map((option, index) => {
                  const votes = localResults?.[option] || 0;
                  const percentage = (votes / totalVotes) * 100;
                  const animatedPercentage = isAnimating
                    ? (percentage * animationProgress)
                    : percentage;

                  return (
                    <div key={option} className="bar-item">
                      <div className="bar-label">
                        <span>{option}</span>
                        <span className="bar-value">{votes} votos ({percentage.toFixed(1)}%)</span>
                      </div>
                      <div className="bar-track">
                        <div
                          className="bar-fill"
                          style={{
                            width: `${animatedPercentage}%`,
                            backgroundColor: getBarColor(index),
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="results-table" key={localResults?._updatedAt}>
              <div className="table-header">
                <div className="table-cell">Opção</div>
                <div className="table-cell">Votos</div>
                <div className="table-cell">Porcentagem</div>
              </div>
              {sortedOptions.map((option, index) => {
                const votes = localResults?.[option] || 0;
                const percentage = (votes / totalVotes) * 100;

                return (
                  <div key={option} className="table-row">
                    <div className="table-cell">
                      <div className="option-color" style={{ backgroundColor: getBarColor(index) }} />
                      {option}
                    </div>
                    <div className="table-cell">{votes}</div>
                    <div className="table-cell">
                      <div className="percentage-bar">
                        <div
                          className="percentage-fill"
                          style={{
                            width: `${percentage}%`,
                            backgroundColor: getBarColor(index),
                          }}
                        />
                        <span>{percentage.toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <button className="export-button">
            <FiDownload /> Exportar Resultados
          </button>
          <button onClick={onClose} className="close-modal-button">
            Fechar
          </button>
        </div>
      </div>


      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.8);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
          padding: 1rem;
          backdrop-filter: blur(5px);
        }
        
        .results-modal {
          background-color: var(--black-3);
          border-radius: 0.75rem;
          width: 100%;
          max-width: 800px;
          max-height: 90vh;
          display: flex;
          flex-direction: column;
          border: 1px solid var(--gray-1);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
          overflow: hidden;
          animation: modalFadeIn 0.3s ease-out;
        }
        
        .modal-header {
          padding: 1.5rem;
          border-bottom: 1px solid var(--gray-1);
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          background-color: var(--black-4);
        }
        
        .header-content {
          flex: 1;
        }
        
        .modal-header h3 {
          font-size: 1.5rem;
          margin: 0;
          color: var(--white);
          font-weight: 600;
        }
        
        .session-description {
          color: var(--gray-4);
          margin-top: 0.5rem;
          font-size: 0.9rem;
        }
        
        .close-button {
          background: transparent;
          border: none;
          color: var(--gray-4);
          font-size: 1.25rem;
          cursor: pointer;
          padding: 0.25rem;
          border-radius: 50%;
          transition: all 0.2s;
          margin-left: 1rem;
        }
        
        .close-button:hover {
          background: var(--gray-1);
          color: var(--white);
        }
        
        .modal-body {
          padding: 1.5rem;
          overflow-y: auto;
          flex: 1;
        }
        
        .results-header {
          margin-bottom: 2rem;
        }
        
        .total-votes, .winner-banner, .tie-banner {
          display: inline-flex;
          align-items: center;
          padding: 0.5rem 1rem;
          border-radius: 0.5rem;
          background-color: var(--black-4);
          margin-right: 1rem;
          margin-bottom: 1rem;
          font-size: 0.9rem;
        }
        
        .total-votes {
          color: var(--gray-4);
        }
        
        .winner-banner {
          background-color: var(--green-900/20);
          color: var(--green-2);
        }
        
        .tie-banner {
          background-color: var(--yellow-900/20);
          color: var(--yellow-1);
        }
        
        .icon {
          margin-right: 0.5rem;
        }
        
        .tabs {
          display: flex;
          border-bottom: 1px solid var(--gray-1);
          margin-top: 1.5rem;
        }
        
        .tab-button {
          padding: 0.75rem 1.5rem;
          background: transparent;
          border: none;
          color: var(--gray-4);
          font-weight: 500;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          position: relative;
        }
        
        .tab-button.active {
          color: var(--white);
        }
        
        .tab-button.active::after {
          content: '';
          position: absolute;
          bottom: -1px;
          left: 0;
          right: 0;
          height: 2px;
          background-color: var(--blue-3);
        }
        
        .chart-container {
          margin-top: 1rem;
        }
        
        .bar-chart {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        
        .bar-item {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        
        .bar-label {
          display: flex;
          justify-content: space-between;
          font-size: 0.9rem;
        }
        
        .bar-value {
          color: var(--gray-4);
        }
        
        .bar-track {
          height: 1.5rem;
          background-color: var(--black-4);
          border-radius: 0.25rem;
          overflow: hidden;
          position: relative;
        }
        
        .bar-fill {
          height: 100%;
          border-radius: 0.25rem;
          transition: width 0.3s ease-out;
          position: relative;
        }
        
        .bar-fill::after {
          content: '';
          position: absolute;
          top: 0;
          right: 0;
          bottom: 0;
          left: 0;
          background: linear-gradient(90deg, rgba(255,255,255,0.1), transparent);
        }
        
        .results-table {
          margin-top: 1rem;
          border-radius: 0.5rem;
          overflow: hidden;
          border: 1px solid var(--gray-1);
        }
        
        .table-header {
          display: grid;
          grid-template-columns: 2fr 1fr 2fr;
          background-color: var(--black-4);
          padding: 1rem;
          font-weight: 600;
          color: var(--gray-4);
          font-size: 0.9rem;
        }
        
        .table-row {
          display: grid;
          grid-template-columns: 2fr 1fr 2fr;
          padding: 1rem;
          border-bottom: 1px solid var(--gray-1);
        }
        
        .table-row:last-child {
          border-bottom: none;
        }
        
        .table-cell {
          display: flex;
          align-items: center;
        }
        
        .option-color {
          width: 0.75rem;
          height: 0.75rem;
          border-radius: 50%;
          margin-right: 0.75rem;
        }
        
        .percentage-bar {
          display: flex;
          align-items: center;
          width: 100%;
          position: relative;
        }
        
        .percentage-fill {
          height: 0.5rem;
          border-radius: 0.25rem;
          margin-right: 0.5rem;
        }
        
        .empty-results {
          padding: 2rem;
          text-align: center;
        }
        
        .empty-results p {
          margin-bottom: 1.5rem;
          color: var(--gray-4);
        }
        
        .modal-footer {
          padding: 1rem 1.5rem;
          border-top: 1px solid var(--gray-1);
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
        }
        
        .export-button, .close-modal-button, .action-button {
          padding: 0.75rem 1.5rem;
          border-radius: 0.5rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .export-button {
          background-color: transparent;
          border: 1px solid var(--blue-2);
          color: var(--blue-2);
        }
        
        .export-button:hover {
          background-color: var(--blue-900/10);
        }
        
        .close-modal-button, .action-button {
          background-color: var(--blue-2);
          border: none;
          color: white;
        }
        
        .close-modal-button:hover, .action-button:hover {
          background-color: var(--blue-3);
        }
        
        @keyframes modalFadeIn {
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
    </div>
  );
}

// Função auxiliar para cores das barras
function getBarColor(index: number): string {
  const colors = [
    '#3B82F6', // blue-500
    '#10B981', // emerald-500
    '#F59E0B', // amber-500
    '#6366F1', // indigo-500
    '#EC4899', // pink-500
    '#14B8A6', // teal-500
    '#F97316', // orange-500
    '#8B5CF6', // violet-500
  ];
  return colors[index % colors.length];
}