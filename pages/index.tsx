import { useState } from 'react';
import axios from 'axios';
import { api } from '@/services/api';
import { RegisterRequest, Role } from '@/types';
import Head from 'next/head';
import { useRouter } from 'next/router';

export default function Register() {
  const [form, setForm] = useState<RegisterRequest>({ 
    userName: '', 
    email: '', 
    password: '', 
    role: 'USER' 
  });
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await api.post('/users/register', form, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      console.log('Resposta completa:', response.data);
      setIsLoading(false);
      
      // Efeito visual de sucesso
      const formElement = e.currentTarget as HTMLFormElement;
      formElement.classList.add('success-pulse');
      setTimeout(() => formElement.classList.remove('success-pulse'), 1000);
      
      // Redirecionar após breve delay
      setTimeout(() => router.push('/login'), 1500);
    } catch (error) {
      setIsLoading(false);
      const formElement = e.currentTarget as HTMLFormElement;
      formElement.classList.add('shake');
      setTimeout(() => formElement.classList.remove('shake'), 500);
      
      if (axios.isAxiosError(error)) {
        console.error('Erro detalhado:', error.response?.data || error.message);
      } else if (error instanceof Error) {
        console.error('Erro:', error.message);
      } else {
        console.error('Erro desconhecido:', error);
      }
    }
  };

  return (
    <>
      <Head>
        <title>Monopólio - Registrar</title>
      </Head>
      
      <div className="register-container">
        {/* Efeitos de fundo (mesmos da página de login) */}
        <div className="background-effects">
          <div className="grid-lines"></div>
          <div className="floating-tokens">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="token" style={{
                animationDelay: `${i * 2}s`,
                left: `${Math.random() * 80 + 10}%`,
                top: `${Math.random() * 80 + 10}%`
              }}></div>
            ))}
          </div>
          <div className="glow-effect"></div>
          <div className="dice-effect">🎲</div>
        </div>
        
        {/* Conteúdo principal */}
        <div className="register-content">
          <div className="brand-header">
            <h1 className="logo">
              <span className="logo-gradient">MONOPÓLIO</span>
            </h1>
            <p className="tagline">Junte-se ao jogo da decisão coletiva</p>
          </div>
          
          <form onSubmit={handleSubmit} className="register-form">
            <div className="form-group">
              <input 
                placeholder="Nome completo" 
                onChange={e => setForm({ ...form, userName: e.target.value })} 
                className="input-field"
                required
              />
              <span className="input-icon">👤</span>
            </div>
            
            <div className="form-group">
              <input 
                placeholder="Email" 
                type="email"
                onChange={e => setForm({ ...form, email: e.target.value })} 
                className="input-field"
                required
              />
              <span className="input-icon">✉️</span>
            </div>
            
            <div className="form-group">
              <input 
                placeholder="Senha" 
                type="password" 
                onChange={e => setForm({ ...form, password: e.target.value })} 
                className="input-field"
                required
                minLength={6}
              />
              <span className="input-icon">🔒</span>
            </div>
            
            <div className="form-group">
              <select 
                onChange={e => setForm({ ...form, role: e.target.value as Role })} 
                className="input-field select-field"
              >
                <option value="USER">Usuário</option>
                <option value="ADMIN">Administrador</option>
              </select>
              <span className="input-icon">👑</span>
            </div>
            
            <button type="submit" className="register-button" disabled={isLoading}>
              {isLoading ? (
                <span className="button-loader"></span>
              ) : (
                'CRIAR CONTA'
              )}
            </button>
          </form>
          
          <div className="footer-links">
            <p className="login-text">Já tem uma conta?</p>
            <a href="/login" className="login-link">Faça login</a>
          </div>
        </div>
      </div>
      
      <style jsx global>{`
        @keyframes dice-roll {
          0% { transform: translateY(0) rotate(0deg); }
          25% { transform: translateY(-20px) rotate(90deg); }
          50% { transform: translateY(-40px) rotate(180deg); }
          75% { transform: translateY(-20px) rotate(270deg); }
          100% { transform: translateY(0) rotate(360deg); }
        }
        
        @keyframes success-pulse {
          0% { box-shadow: 0 0 0 0 rgba(46, 204, 113, 0); }
          50% { box-shadow: 0 0 0 15px rgba(46, 204, 113, 0.2); }
          100% { box-shadow: 0 0 0 0 rgba(46, 204, 113, 0); }
        }
        
        .success-pulse {
          animation: success-pulse 1s ease;
        }
        
        .dice-effect {
          position: absolute;
          font-size: 2rem;
          opacity: 0.1;
          animation: dice-roll 4s linear infinite;
        }
        
        .register-container {
          position: relative;
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 2rem;
          overflow: hidden;
          background: radial-gradient(circle at center, var(--darker), var(--dark));
        }
        
        .register-content {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 450px;
          background: rgba(18, 18, 24, 0.8);
          backdrop-filter: blur(10px);
          border-radius: 16px;
          padding: 2.5rem;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.05);
        }
        
        .register-content::before {
          content: '';
          position: absolute;
          top: -2px;
          left: -2px;
          right: -2px;
          bottom: -2px;
          background: linear-gradient(45deg, var(--primary), var(--secondary), var(--primary));
          z-index: -1;
          border-radius: 18px;
          opacity: 0;
          transition: opacity 0.3s ease;
        }
        
        .register-content:hover::before {
          opacity: 0.3;
        }
        
        .brand-header {
          text-align: center;
          margin-bottom: 2rem;
        }
        
        .tagline {
          color: rgba(224, 224, 232, 0.7);
          font-size: 0.95rem;
          letter-spacing: 1px;
          margin-bottom: 1.5rem;
        }
        
        .register-form {
          display: flex;
          flex-direction: column;
          gap: 1.3rem;
        }
        
        .select-field {
          appearance: none;
          cursor: pointer;
        }
        
        .select-field option {
          background: var(--darker);
          color: var(--light);
        }
        
        .register-button {
          padding: 1rem;
          background: linear-gradient(90deg, var(--secondary), #ff2d6d);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 0.95rem;
          font-weight: 600;
          letter-spacing: 0.5px;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
          margin-top: 1rem;
        }
        
        .register-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(255, 62, 129, 0.4);
        }
        
        .register-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        
        .footer-links {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          margin-top: 2rem;
        }
        
        .login-text {
          color: rgba(224, 224, 232, 0.7);
          font-size: 0.9rem;
        }
        
        .login-link {
          color: var(--light);
          font-weight: 600;
          text-decoration: none;
          transition: color 0.3s ease;
          position: relative;
        }
        
        .login-link::after {
          content: '';
          position: absolute;
          bottom: -2px;
          left: 0;
          width: 0;
          height: 2px;
          background: var(--primary);
          transition: width 0.3s ease;
        }
        
        .login-link:hover {
          color: var(--primary);
        }
        
        .login-link:hover::after {
          width: 100%;
        }
      `}</style>
    </>
  );
}