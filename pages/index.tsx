import { useState } from 'react';
import { api } from '@/services/api';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { LoginRequest } from '@/types';
import Head from 'next/head';
import Link from 'next/link';
import axios from 'axios';

export default function Login() {
  const [form, setForm] = useState<LoginRequest>({ email: '', password: '' });
  const [errors, setErrors] = useState({
    email: '',
    password: '',
    general: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const auth = useAuth();
  const router = useRouter();

  if (auth.userId && auth.role) {
    router.push(auth.role === 'ADMIN' ? '/dashboard/admin' : '/dashboard/user');
    return null;
  }

  const validateForm = () => {
    let valid = true;
    const newErrors = {
      email: '',
      password: '',
      general: ''
    };

    if (!form.email.trim()) {
      newErrors.email = 'Email é obrigatório';
      valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = 'Email inválido';
      valid = false;
    }

    if (!form.password) {
      newErrors.password = 'Senha é obrigatória';
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!validateForm()) return;

  setIsLoading(true);
  setErrors({ email: '', password: '', general: '' });

  try {
  const response = await api.post('/users/login', form);
  console.log("🔑 [LoginPage] response.data:", response.data);

  const { userId, role, token } = response.data;

  auth.login({ userId, role, token });

  router.push(role === 'ADMIN' ? '/dashboard/admin' : '/dashboard/user');
} catch (error) {
  setIsLoading(false);
  setErrors((prev) => ({ ...prev, general: 'Credenciais inválidas' }));
  console.error("❌ [LoginPage] erro no login:", error);
}

};


  return (
    <>
      <Head>
        <title>Monopólio - Login</title>
      </Head>
      
      <div className="login-container">
        <div className="grid-background"></div>
        <div className="floating-shapes">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="shape" style={{
              animationDelay: `${i * 3}s`,
              left: `${Math.random() * 80 + 10}%`,
              top: `${Math.random() * 80 + 10}%`,
              opacity: Math.random() * 0.2 + 0.05
            }}></div>
          ))}
        </div>
        
        <div className="login-content">
          <div className="brand-header">
            <div className="logo-wrapper">
              <h1 className="logo">MONOPÓLIO</h1>
            </div>
            <p className="tagline">Domine o jogo da decisão coletiva</p>
          </div>
          
          <form onSubmit={handleSubmit} className="login-form">
            {errors.general && (
              <div className="error-message">
                {errors.general}
              </div>
            )}
            
            <div className="input-group">
              <input 
                placeholder="Email" 
                type="email"
                value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })} 
                className={`input-field ${errors.email ? 'error' : ''}`}
                required
              />
              <span className="input-highlight"></span>
              {errors.email && <span className="error-text">{errors.email}</span>}
            </div>
            
            <div className="input-group">
              <input 
                placeholder="Senha" 
                type="password" 
                value={form.password}
                onChange={e => setForm({ ...form, password: e.target.value })} 
                className={`input-field ${errors.password ? 'error' : ''}`}
                required
              />
              <span className="input-highlight"></span>
              {errors.password && <span className="error-text">{errors.password}</span>}
            </div>
            
            <button type="submit" className="login-button" disabled={isLoading}>
              {isLoading ? (
                <span className="button-loader"></span>
              ) : (
                'ACESSAR PLATAFORMA'
              )}
              <span className="button-border"></span>
            </button>
          </form>
          
          <div className="footer-links">
            <p>Não tem uma conta? <Link href="/register" className="link">Criar conta</Link></p>
          </div>
        </div>
      </div>
      
      <style jsx global>{`
        :root {
          --black-1: #0a0a0a;
          --black-2: #121212;
          --black-3: #1a1a1a;
          --black-4: #222222;
          --gray-1: #333333;
          --gray-2: #555555;
          --gray-3: #777777;
          --gray-4: #999999;
          --white: #e0e0e0;
          --white-alpha: rgba(255, 255, 255, 0.1);
          --error-red: #ff4444;
          --success-green: #2ecc71;
        }
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
        }
        
        body {
          background-color: var(--black-2);
          color: var(--white);
          overflow-x: hidden;
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(5deg); }
        }
        
        @keyframes rotate {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
          20%, 40%, 60%, 80% { transform: translateX(5px); }
        }
        
        @keyframes success-pulse {
          0% { box-shadow: 0 0 0 0 rgba(46, 204, 113, 0.4); }
          70% { box-shadow: 0 0 0 15px rgba(46, 204, 113, 0); }
          100% { box-shadow: 0 0 0 0 rgba(46, 204, 113, 0); }
        }
        
        @keyframes slideIn {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        
        .shake {
          animation: shake 0.5s cubic-bezier(.36,.07,.19,.97) both;
        }
        
        .success-pulse {
          animation: success-pulse 1s ease;
        }
      `}</style>
      
      <style jsx>{`
        .login-container {
          position: relative;
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 2rem;
          overflow: hidden;
          background: var(--black-1);
        }
        
        .grid-background {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-image: 
            linear-gradient(to right, var(--white-alpha) 1px, transparent 1px),
            linear-gradient(to bottom, var(--white-alpha) 1px, transparent 1px);
          background-size: 40px 40px;
          opacity: 0.2;
        }
        
        .floating-shapes {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }
        
        .floating-shapes .shape {
          position: absolute;
          width: 100px;
          height: 100px;
          background: var(--white);
          border-radius: 10px;
          animation: float 15s ease-in-out infinite;
          filter: blur(1px);
        }
        
        .login-content {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 420px;
          background: rgba(10, 10, 10, 0.8);
          backdrop-filter: blur(10px);
          border-radius: 16px;
          padding: 3rem;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
          border: 1px solid var(--gray-1);
          animation: slideIn 0.8s ease-out;
        }
        
        .brand-header {
          text-align: center;
          margin-bottom: 3rem;
        }
        
        .logo-wrapper {
          position: relative;
          display: inline-block;
          margin-bottom: 1rem;
        }
        
        .logo {
          font-size: 2.5rem;
          font-weight: 800;
          letter-spacing: 2px;
          background: linear-gradient(90deg, var(--white), var(--gray-4));
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          position: relative;
        }
        
        .logo::after {
          content: '';
          position: absolute;
          bottom: -5px;
          left: 0;
          width: 100%;
          height: 3px;
          background: linear-gradient(90deg, var(--gray-4), transparent);
        }
        
        .tagline {
          color: var(--gray-4);
          font-size: 0.9rem;
          letter-spacing: 1px;
        }
        
        .login-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        
        .input-group {
          position: relative;
          margin-bottom: 1.5rem;
        }
        
        .input-field {
          width: 100%;
          padding: 1rem 1rem 1rem 0;
          background: transparent;
          border: none;
          border-bottom: 1px solid var(--gray-2);
          color: var(--white);
          font-size: 1rem;
          transition: all 0.3s ease;
        }
        
        .input-field.error {
          border-bottom-color: var(--error-red);
        }
        
        .input-field:focus {
          outline: none;
          border-bottom-color: var(--white);
        }
        
        .input-field.error:focus {
          border-bottom-color: var(--error-red);
        }
        
        .input-field::placeholder {
          color: var(--gray-3);
        }
        
        .input-highlight {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 0;
          height: 2px;
          background: var(--white);
          transition: width 0.3s ease;
        }
        
        .input-field:focus ~ .input-highlight {
          width: 100%;
        }
        
        .input-field.error:focus ~ .input-highlight {
          background: var(--error-red);
          width: 100%;
        }
        
        .error-text {
          position: absolute;
          bottom: -1.2rem;
          left: 0;
          color: var(--error-red);
          font-size: 0.75rem;
          margin-top: 0.25rem;
        }
        
        .error-message {
          background-color: rgba(255, 68, 68, 0.1);
          color: var(--error-red);
          padding: 0.75rem;
          border-radius: 8px;
          margin-bottom: 1rem;
          border: 1px solid rgba(255, 68, 68, 0.3);
          text-align: center;
        }
        
        .success-message {
          background-color: rgba(46, 204, 113, 0.1);
          color: var(--success-green);
          padding: 0.75rem;
          border-radius: 8px;
          margin-bottom: 1rem;
          border: 1px solid rgba(46, 204, 113, 0.3);
          text-align: center;
        }
        
        .login-button {
          position: relative;
          padding: 1rem;
          background: var(--black-3);
          color: var(--white);
          border: none;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 600;
          letter-spacing: 0.5px;
          cursor: pointer;
          transition: all 0.3s ease;
          overflow: hidden;
          margin-top: 1rem;
        }
        
        .login-button:hover {
          background: var(--black-4);
        }
        
        .login-button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        
        .button-border {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          border: 1px solid var(--white-alpha);
          border-radius: 8px;
          pointer-events: none;
        }
        
        .button-loader {
          display: inline-block;
          width: 20px;
          height: 20px;
          border: 3px solid var(--white-alpha);
          border-radius: 50%;
          border-top-color: var(--white);
          animation: rotate 1s ease-in-out infinite;
          margin: 0 auto;
        }
        
        .footer-links {
          text-align: center;
          margin-top: 2rem;
          color: var(--gray-3);
          font-size: 0.9rem;
        }
        
        .link {
          color: var(--gray-4);
          text-decoration: none;
          transition: color 0.3s ease;
          font-weight: 600;
        }
        
        .link:hover {
          color: var(--white);
        }

        @media (max-width: 600px) {
  .login-container {
    padding: 0.5rem;
  }
  .login-content {
    padding: 1.5rem 1rem;
    max-width: 100%;
    box-shadow: none;
    border-radius: 10px;
  }
  .brand-header {
    margin-bottom: 2rem;
  }
  .logo {
    font-size: 1.4rem;
  }
  .login-form {
    gap: 0.75rem;
  }
  .footer-links {
    margin-top: 1.2rem;
    font-size: 0.95rem;
  }
}


      `}</style>
    </>
  );
}