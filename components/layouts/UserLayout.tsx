import { ReactNode, useState, useEffect } from 'react';
import { FiHome, FiClock, FiCalendar, FiBarChart2, FiSettings, FiMenu, FiUser, FiLogOut, FiBell, FiCreditCard, FiUserPlus } from 'react-icons/fi';
import { useAuth } from '@/contexts/AuthContext';
import router from 'next/router';


export default function UserLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [typingText, setTypingText] = useState('');
  const fullText = "🥖🥖 🧀🧀";
  const [showCursor, setShowCursor] = useState(true);
  const { logout } = useAuth();

  // Menus do usuário atualizados
  const menu = [
    { icon: <FiHome size={20} />, label: "Dashboard" },
    { icon: <FiClock size={20} />, label: "Sessões Ativas" },
    { icon: <FiCalendar size={20} />, label: "Histórico" },
    { icon: <FiBarChart2 size={20} />, label: "Estatísticas" },
    { icon: <FiCreditCard size={20} />, label: "Assinatura" },
    { icon: <FiUserPlus size={20} />, label: "Convidar Amigos" },
    { icon: <FiSettings size={20} />, label: "Configurações" }
  ];


  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  useEffect(() => {
  let i = 0;
  let typingInterval: NodeJS.Timeout;
  let cursorInterval: NodeJS.Timeout;

  const startTyping = () => {
    typingInterval = setInterval(() => {
      if (i < fullText.length) {
        setTypingText(fullText.substring(0, i + 1));
        i++;
      } else {
        clearInterval(typingInterval);
        
        // Espera 1 segundo antes de apagar
        setTimeout(() => {
          startErasing();
        }, 1000);
      }
    }, 100);
  };

  const startErasing = () => {
    typingInterval = setInterval(() => {
      if (i > 0) {
        setTypingText(fullText.substring(0, i - 1));
        i--;
      } else {
        clearInterval(typingInterval);
        
        // Espera 500ms antes de começar a digitar novamente
        setTimeout(() => {
          startTyping();
        }, 500);
      }
    }, 50); // Apaga mais rápido que digita
  };

  // Inicia o efeito de digitação
  startTyping();

  // Efeito de cursor piscando
    // eslint-disable-next-line prefer-const
    cursorInterval = setInterval(() => setShowCursor(prev => !prev), 500);
  
  return () => {
    clearInterval(typingInterval);
    clearInterval(cursorInterval);
  };
}, [fullText]);

  return (
    <>
      <div className="admin-container">
        {/* Sidebar */}
        <div className={`sidebar ${sidebarOpen ? 'w-64' : 'w-20'}`}>
          <div className="sidebar-header">
            {sidebarOpen && <h1 className="logo">MONOPÓLIO</h1>}
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)} 
              className="sidebar-toggle"
            >
              <FiMenu size={20} />
            </button>
          </div>
          
          <nav className="sidebar-nav">
            {menu.map((item) => (
              <div 
                key={item.label} 
                className={`nav-item ${item.label === "Dashboard" ? 'active' : ''}`}
              >
                <span className="nav-icon">{item.icon}</span>
                {sidebarOpen && <span className="nav-text">{item.label}</span>}
              </div>
            ))}
          </nav>
        </div>

        {/* Main content */}
        <div className="main-content">
          <header className="admin-header">
            <div className="header-left">
              <h2 className="header-title">Área do Usuário</h2>
            </div>
            <div className="header-right">
              <div className="creative-text">
                {typingText}
                <span className={`cursor ${showCursor ? 'visible' : ''}`}>|</span>
              </div>
              
              <button className="notification-btn">
                <FiBell size={20} />
                <span className="notification-badge"></span>
              </button>
              
              <div className="user-profile">
                <div className="avatar">
                  <FiUser size={18} />
                </div>
                {sidebarOpen && <span className="username">Você</span>}
                <button 
                                onClick={handleLogout}
                                className="logout-btn"
                                title="Sair"
                              >
                                <FiLogOut size={20} />
                              </button>
              </div>
            </div>
          </header>
          <main className="content-area">
            {children}
          </main>
        </div>
      </div>

      {/* Estilos globais (iguais ao AdminLayout) */}
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
          --blue-1: #1e3a8a;
          --blue-2: #2563eb;
          --blue-3: #3b82f6;
          --green-1: #14532d;
          --green-2: #15803d;
          --red-1: #7f1d1d;
          --red-2: #dc2626;
          --yellow-1: #facc15;
        }
        * { 
          margin: 0; 
          padding: 0; 
          box-sizing: border-box; 
          font-family: 'Inter', system-ui, -apple-system, sans-serif; 
        }
        body { 
          background-color: var(--black-1); 
          color: var(--white); 
          overflow-x: hidden; 
        }
      `}</style>
      
      {/* Estilos específicos do layout */}
      <style jsx>{`
        .admin-container {
          display: flex;
          min-height: 100vh;
          background-color: var(--black-1);
        }
        
        .sidebar {
          background-color: var(--black-3);
          transition: all 0.3s ease;
          height: 100vh;
          position: sticky;
          top: 0;
          border-right: 1px solid var(--gray-1);
        }
        
        .sidebar-header {
          padding: 1.5rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid var(--gray-1);
        }
        
        .logo {
          font-size: 1.5rem;
          font-weight: 800;
          letter-spacing: 1px;
          background: linear-gradient(90deg, var(--white), var(--gray-4));
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
        }
        
        .sidebar-toggle {
          padding: 0.5rem;
          border-radius: 0.5rem;
          background: transparent;
          border: none;
          color: var(--white);
          cursor: pointer;
          transition: all 0.3s ease;
        }
        
        .sidebar-toggle:hover {
          background-color: var(--gray-1);
        }
        
        .sidebar-nav {
          margin-top: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          padding: 0 0.5rem;
        }
        
        .nav-item {
          display: flex;
          align-items: center;
          padding: 0.75rem 1rem;
          border-radius: 0.5rem;
          cursor: pointer;
          color: var(--gray-4);
          transition: all 0.3s ease;
        }
        
        .nav-item:hover {
          background-color: var(--gray-1);
          color: var(--white);
        }
        
        .nav-item.active {
          background-color: var(--blue-1);
          color: var(--white);
        }
        
        .nav-icon {
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .nav-text {
          margin-left: 0.75rem;
          font-size: 0.875rem;
          font-weight: 500;
        }
        
        .main-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        
        .admin-header {
          background-color: var(--black-3);
          border-bottom: 1px solid var(--gray-1);
          padding: 1rem 2rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          position: sticky;
          top: 0;
          z-index: 10;
        }
        
        .header-left {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        
        .header-title {
          font-size: 1.25rem;
          font-weight: 600;
        }
        
        .header-right {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }
        
        .creative-text {
          font-family: 'Courier New', monospace;
          font-size: 1.1rem;
          color: var(--white);
          background: var(--black-4);
          padding: 0.5rem 1rem;
          border-radius: 0.25rem;
          margin-right: 1rem;
          min-width: 180px;
          text-align: center;
        }
        
        .cursor {
          opacity: 0;
          transition: opacity 0.1s;
        }
        
        .cursor.visible {
          opacity: 1;
        }
        
        .notification-btn {
          position: relative;
          padding: 0.5rem;
          background: transparent;
          border: none;
          color: var(--white);
          cursor: pointer;
          border-radius: 50%;
          transition: all 0.3s ease;
        }
        
        .notification-btn:hover {
          background-color: var(--gray-1);
        }
        
        .notification-badge {
          position: absolute;
          top: 0;
          right: 0;
          width: 0.5rem;
          height: 0.5rem;
          background-color: var(--red-2);
          border-radius: 50%;
        }
        
        .user-profile {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        
        .avatar {
          width: 2rem;
          height: 2rem;
          border-radius: 50%;
          background-color: var(--blue-3);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        
        .username {
          font-size: 0.875rem;
        }
        
        .logout-btn {
          margin-left: 1rem;
          padding: 0.5rem;
          background: transparent;
          border: none;
          color: var(--gray-4);
          cursor: pointer;
          border-radius: 0.25rem;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
        }
        
        .logout-btn:hover {
          background-color: var(--gray-1);
          color: var(--white);
        }
        
        .content-area {
          flex: 1;
          overflow-y: auto;
          padding: 2rem;
          background-color: var(--black-2);
        }
        
        @media (max-width: 800px) {
          .sidebar { 
            position: fixed; 
            z-index: 20; 
          }
          .main-content { 
            margin-left: 0; 
          }
        }
      `}</style>
    </>
  );
}