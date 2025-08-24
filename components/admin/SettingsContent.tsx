// components/admin/SettingsContent.tsx
import { useState } from 'react';
import { FiSave, FiToggleLeft, FiToggleRight, FiAlertTriangle, FiMail, FiLock } from 'react-icons/fi';

export default function SettingsContent() {
  const [settings, setSettings] = useState({
    maintenanceMode: false,
    emailNotifications: true,
    requireTwoFactorAuth: false,
    sessionTimeout: 30,
    darkMode: true
  });

  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<{type: 'success' | 'error', message: string} | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = type === 'checkbox' ? (e.target as HTMLInputElement).checked : undefined;
    
    setSettings(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    
    try {
      // Simulando uma requisição à API
      await new Promise(resolve => setTimeout(resolve, 1000));
      setFeedback({ type: 'success', message: 'Configurações salvas com sucesso!' });
    } catch (err) {
      setFeedback({ type: 'error', message: 'Erro ao salvar configurações' });
    } finally {
      setIsSaving(false);
      setTimeout(() => setFeedback(null), 5000);
    }
  };

  return (
    <div className="settings-content">
      <h2 className="settings-title">Configurações do Sistema</h2>
      
      {feedback && (
        <div className={`feedback-message ${feedback.type}`}>
          {feedback.type === 'success' ? (
            <FiSave className="feedback-icon" />
          ) : (
            <FiAlertTriangle className="feedback-icon" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="settings-form">
        <div className="settings-section">
          <h3 className="section-title">
            <FiAlertTriangle className="section-icon" />
            Modo Manutenção
          </h3>
          <p className="section-description">
            Ative para colocar o sistema em modo manutenção, impedindo acesso de usuários comuns.
          </p>
          <label className="toggle-switch">
            <input
              type="checkbox"
              name="maintenanceMode"
              checked={settings.maintenanceMode}
              onChange={handleChange}
            />
            <span className="slider">
              {settings.maintenanceMode ? (
                <FiToggleRight className="toggle-icon" />
              ) : (
                <FiToggleLeft className="toggle-icon" />
              )}
            </span>
            <span className="toggle-label">
              {settings.maintenanceMode ? 'Ativado' : 'Desativado'}
            </span>
          </label>
        </div>
        
        <div className="settings-section">
          <h3 className="section-title">
            <FiMail className="section-icon" />
            Notificações por Email
          </h3>
          <p className="section-description">
            Habilite para enviar notificações por email aos usuários sobre novas sessões e resultados.
          </p>
          <label className="toggle-switch">
            <input
              type="checkbox"
              name="emailNotifications"
              checked={settings.emailNotifications}
              onChange={handleChange}
            />
            <span className="slider">
              {settings.emailNotifications ? (
                <FiToggleRight className="toggle-icon" />
              ) : (
                <FiToggleLeft className="toggle-icon" />
              )}
            </span>
            <span className="toggle-label">
              {settings.emailNotifications ? 'Ativado' : 'Desativado'}
            </span>
          </label>
        </div>
        
        <div className="settings-section">
          <h3 className="section-title">
            <FiLock className="section-icon" />
            Autenticação de Dois Fatores
          </h3>
          <p className="section-description">
            Exija que administradores utilizem autenticação em dois fatores para acessar o painel.
          </p>
          <label className="toggle-switch">
            <input
              type="checkbox"
              name="requireTwoFactorAuth"
              checked={settings.requireTwoFactorAuth}
              onChange={handleChange}
            />
            <span className="slider">
              {settings.requireTwoFactorAuth ? (
                <FiToggleRight className="toggle-icon" />
              ) : (
                <FiToggleLeft className="toggle-icon" />
              )}
            </span>
            <span className="toggle-label">
              {settings.requireTwoFactorAuth ? 'Obrigatório' : 'Opcional'}
            </span>
          </label>
        </div>
        
        <div className="settings-section">
          <h3 className="section-title">Tempo de Sessão (minutos)</h3>
          <p className="section-description">
            Defina após quantos minutos de inatividade o usuário será automaticamente desconectado.
          </p>
          <select
            name="sessionTimeout"
            value={settings.sessionTimeout}
            onChange={handleChange}
            className="settings-select"
          >
            <option value="15">15 minutos</option>
            <option value="30">30 minutos</option>
            <option value="60">1 hora</option>
            <option value="120">2 horas</option>
            <option value="0">Nunca expirar</option>
          </select>
        </div>
        
        <div className="form-actions">
          <button
            type="submit"
            disabled={isSaving}
            className="save-button"
          >
            {isSaving ? 'Salvando...' : 'Salvar Configurações'}
            <FiSave className="button-icon" />
          </button>
        </div>
      </form>
      
      <style jsx>{`
        .settings-content {
          padding: 1.5rem;
          animation: fadeIn 0.3s ease;
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .settings-title {
          font-size: 1.5rem;
          margin-bottom: 1.5rem;
          color: var(--white);
          font-weight: 600;
        }
        
        .settings-form {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }
        
        .settings-section {
          background-color: var(--black-3);
          padding: 1.5rem;
          border-radius: 0.5rem;
          border: 1px solid var(--gray-1);
        }
        
        .section-title {
          font-size: 1.1rem;
          margin-bottom: 0.5rem;
          color: var(--white);
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }
        
        .section-icon {
          color: var(--blue-3);
        }
        
        .section-description {
          font-size: 0.875rem;
          color: var(--gray-4);
          margin-bottom: 1rem;
        }
        
        .toggle-switch {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          cursor: pointer;
        }
        
        .toggle-switch input {
          position: absolute;
          opacity: 0;
          width: 0;
          height: 0;
        }
        
        .slider {
          display: flex;
          align-items: center;
        }
        
        .toggle-icon {
          font-size: 1.5rem;
          color: var(--gray-4);
          transition: all 0.3s ease;
        }
        
        .toggle-switch input:checked + .slider .toggle-icon {
          color: var(--blue-3);
        }
        
        .toggle-label {
          font-size: 0.875rem;
          color: var(--gray-4);
        }
        
        .settings-select {
          padding: 0.5rem 1rem;
          background-color: var(--black-4);
          border: 1px solid var(--gray-1);
          border-radius: 0.5rem;
          color: var(--white);
          width: 100%;
          max-width: 300px;
        }
        
        .form-actions {
          display: flex;
          justify-content: flex-end;
        }
        
        .save-button {
          padding: 0.75rem 1.5rem;
          background-color: var(--blue-2);
          color: white;
          border: none;
          border-radius: 0.5rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          transition: all 0.3s ease;
        }
        
        .save-button:hover {
          background-color: var(--blue-3);
        }
        
        .save-button:disabled {
          background-color: var(--gray-2);
          cursor: not-allowed;
        }
        
        .button-icon {
          font-size: 1rem;
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
        
        .feedback-icon {
          font-size: 1.25rem;
        }
        
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}