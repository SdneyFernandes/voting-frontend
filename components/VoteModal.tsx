// components/VoteModal.tsx
import { useState } from 'react';
import { FiX, FiCheck, FiAlertCircle } from 'react-icons/fi';
import { api } from '@/services/api';

interface VoteModalProps {
  session: { id: number; title: string; options: string[]; hasVoted?: boolean };
  userId: number;
  onClose: () => void;
  hasVoted: boolean;
  showToast: (message: string, type: 'success' | 'error') => void;
  fetchSessions: () => void;
}

export default function VoteModal({ 
  session, userId, onClose, hasVoted, showToast, fetchSessions
}: VoteModalProps) {
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleVoteClick = async () => {
    if (!selectedOption) {
      setError('Selecione uma opção para votar');
      return;
    }
    try {
      setIsSubmitting(true);
      setError(null);

      const response = await api.post(
        `/votes/${session.id}/cast`,
        null,
        {
          params: { userId, option: selectedOption },
          headers: { 'X-User-Id': userId.toString(), 'X-User-Role': 'USER' }
        }
      );

      if (response.status !== 200) throw new Error('Status inválido');

      setSuccess(true);
      showToast('Voto registrado com sucesso!', 'success');
      await fetchSessions();

      setTimeout(onClose, 1500);

    } catch (err: any) {
      console.error('Erro detalhado:', err);
      const errorMsg = err.response?.data?.message || 'Erro ao registrar voto. Tente novamente.';
      setError(errorMsg);
      showToast(errorMsg, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (session.hasVoted) {
    return (
      <div className="modal-overlay">
        <div className="vote-modal">
          <div className="modal-header">
            <h3>Você já votou</h3>
            <button onClick={onClose} className="close-button"><FiX /></button>
          </div>
          <div className="modal-body">
            <div className="already-voted">
              <FiCheck className="success-icon" />
              <p>Seu voto nesta sessão já foi registrado.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="modal-overlay">
        <div className="vote-modal">
          <div className="modal-body">
            <div className="vote-success">
              <FiCheck className="success-icon" />
              <h3>Voto registrado com sucesso!</h3>
              <p>Obrigado por participar.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay">
      <div className="vote-modal">
        <div className="modal-header">
          <h3>Votar em: {session.title}</h3>
          <button onClick={onClose} className="close-button"><FiX /></button>
        </div>
        <div className="modal-body">
          <p className="instruction">Selecione uma das opções abaixo:</p>
          {error && <div className="error-message"><FiAlertCircle /> {error}</div>}
          <div className="options-grid">
            {session.options.map((option) => (
              <div 
                key={option}
                className={`option-card ${selectedOption === option ? 'selected' : ''}`}
                onClick={() => setSelectedOption(option)}
              >
                {option}
              </div>
            ))}
          </div>
        </div>
        <div className="modal-footer">
          <button onClick={onClose} className="cancel-button" disabled={isSubmitting}>Cancelar</button>
          <button onClick={handleVoteClick} className="submit-button" disabled={isSubmitting || !selectedOption}>
            {isSubmitting ? 'Enviando...' : 'Confirmar Voto'}
          </button>
        </div>
      </div>

      {/**/}
      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.7);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
          padding: 1rem;
        }
        
        .vote-modal {
          background-color: var(--black-3);
          border-radius: 0.75rem;
          width: 100%;
          max-width: 500px;
          border: 1px solid var(--gray-1);
          overflow: hidden;
          animation: slideUp 0.3s ease-out;
        }
        
        .modal-header {
          padding: 1.5rem;
          border-bottom: 1px solid var(--gray-1);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .modal-header h3 {
          font-size: 1.25rem;
          margin: 0;
          color: var(--white);
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
        }
        
        .close-button:hover {
          background: var(--gray-1);
          color: var(--white);
        }
        
        .modal-body {
          padding: 1.5rem;
        }
        
        .instruction {
          color: var(--gray-4);
          margin-bottom: 1.5rem;
        }
        
        .options-grid {
          display: grid;
          grid-template-columns: 1fr;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
        }
        
        .option-card {
          padding: 1.25rem;
          background-color: var(--black-4);
          border-radius: 0.5rem;
          cursor: pointer;
          transition: all 0.2s;
          border: 1px solid var(--gray-1);
          text-align: center;
          font-weight: 500;
        }
        
        .option-card:hover {
          background-color: var(--gray-1);
          transform: translateY(-2px);
        }
        
        .option-card.selected {
          background-color: var(--blue-1);
          border-color: var(--blue-2);
          color: white;
        }
        
        .error-message {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: var(--red-2);
          margin-bottom: 1rem;
          font-size: 0.9rem;
        }
        
        .modal-footer {
          padding: 1rem 1.5rem;
          border-top: 1px solid var(--gray-1);
          display: flex;
          justify-content: flex-end;
          gap: 0.75rem;
        }
        
        .cancel-button, .submit-button {
          padding: 0.75rem 1.5rem;
          border-radius: 0.5rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }
        
        .cancel-button {
          background-color: var(--black-4);
          border: 1px solid var(--gray-1);
          color: var(--white);
        }
        
        .cancel-button:hover {
          background-color: var(--gray-1);
        }
        
        .submit-button {
          background-color: var(--blue-2);
          border: none;
          color: white;
        }
        
        .submit-button:disabled {
          background-color: var(--gray-1);
          cursor: not-allowed;
          opacity: 0.7;
        }
        
        .submit-button:not(:disabled):hover {
          background-color: var(--blue-3);
          transform: translateY(-1px);
        }
        
        .already-voted, .vote-success {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 2rem 1rem;
        }
        
        .success-icon {
          font-size: 3rem;
          color: var(--green-2);
          margin-bottom: 1rem;
        }
        
        @keyframes slideUp {
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