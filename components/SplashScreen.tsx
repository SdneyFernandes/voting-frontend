// components/SplashScreen.tsx

'use client';

import { useEffect, useState } from 'react';

export default function SplashScreen() {
  const [progress, setProgress] = useState(0);
   const [particles, setParticles] = useState<Array<{
    left: string;
    top: string;
    width: string;
    height: string;
    animationDelay: string;
  }>>([]);

  useEffect(() => {

    setParticles(
      Array(20).fill(0).map(() => ({
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        width: `${Math.random() * 10 + 5}px`,
        height: `${Math.random() * 10 + 5}px`,
        animationDelay: `${Math.random() * 5}s`
      }))
    );

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 10;
      });
    }, 150);

    return () => clearInterval(interval);
  }, []);

  

  return (
    <div className="splash-container">
      {/* Efeito de partículas modificado */}
      <div className="particles">
        {particles.map((p, i) => (
          <div 
            key={i} 
            className="particle" 
            style={{
              left: p.left,
              top: p.top,
              width: p.width,
              height: p.height,
              animationDelay: p.animationDelay
            }}
          />
        ))}
      </div>
      
      {/* Conteúdo principal */}
      <div className="splash-content">
        <div className="logo-container">
          <div className="logo-animation">
            <span className="logo-letter">M</span>
            <span className="logo-letter">O</span>
            <span className="logo-letter">N</span>
            <span className="logo-letter">O</span>
            <span className="logo-letter">P</span>
            <span className="logo-letter">Ó</span>
            <span className="logo-letter">L</span>
            <span className="logo-letter">I</span>
            <span className="logo-letter">O</span>
          </div>
          <p className="splash-tagline">Plataforma de Decisão Coletiva</p>
        </div>
        
        <div className="progress-container">
          <div 
            className="progress-bar" 
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <style jsx>{`
        .splash-container {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          display: flex;
          justify-content: center;
          align-items: center;
          background: linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 100%);
          z-index: 9999;
          overflow: hidden;
        }
        
        .particles {
          position: absolute;
          width: 100%;
          height: 100%;
        }
        
        .particle {
          position: absolute;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 50%;
          animation: float 15s infinite linear;
          opacity: 0;
        }
        
        @keyframes float {
          0% {
            transform: translateY(0) translateX(0);
            opacity: 0;
          }
          10% {
            opacity: 0.3;
          }
          90% {
            opacity: 0.3;
          }
          100% {
            transform: translateY(-100px) translateX(50px);
            opacity: 0;
          }
        }
        
        .splash-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          z-index: 1;
          width: 100%;
          max-width: 500px;
          padding: 2rem;
        }
        
        .logo-container {
          margin-bottom: 3rem;
          text-align: center;
        }
        
        .logo-animation {
          display: flex;
          margin-bottom: 1rem;
          justify-content: center;
        }
        
        .logo-letter {
          font-size: 3rem;
          font-weight: 800;
          color: #fff;
          opacity: 0;
          transform: translateY(20px);
          animation: letter-appear 0.5s forwards;
        }
        
        @keyframes letter-appear {
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        /* Animação sequencial para cada letra */
        .logo-letter:nth-child(1) { animation-delay: 0.1s; }
        .logo-letter:nth-child(2) { animation-delay: 0.2s; }
        .logo-letter:nth-child(3) { animation-delay: 0.3s; }
        .logo-letter:nth-child(4) { animation-delay: 0.4s; }
        .logo-letter:nth-child(5) { animation-delay: 0.5s; }
        .logo-letter:nth-child(6) { animation-delay: 0.6s; }
        .logo-letter:nth-child(7) { animation-delay: 0.7s; }
        .logo-letter:nth-child(8) { animation-delay: 0.8s; }
        .logo-letter:nth-child(9) { animation-delay: 0.9s; }
        
        .splash-tagline {
          color: rgba(255, 255, 255, 0.7);
          font-size: 1.2rem;
          letter-spacing: 1px;
          margin-top: 1rem;
          opacity: 0;
          animation: fade-in 0.5s 1.5s forwards;
        }
        
        @keyframes fade-in {
          to { opacity: 1; }
        }
        
        .progress-container {
          width: 100%;
          height: 4px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 2px;
          overflow: hidden;
        }
        
        .progress-bar {
          height: 100%;
          background: linear-gradient(90deg, #333, #fff);
          transition: width 0.3s ease;
          border-radius: 2px;
        }
      `}</style>
    </div>
  );
}