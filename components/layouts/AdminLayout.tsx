import { ReactNode, useState, useEffect } from 'react';
import { FiHome, FiUsers, FiBarChart2, FiSettings, FiMenu, FiBell, FiLogOut, FiX } from 'react-icons/fi';
import { useAuth } from '@/contexts/AuthContext';
import SessionsContent from '../admin/SessionsContent';
import UsersContent from '../admin/UsersContent';
import SettingsContent from '../admin/SettingsContent';
import { useRouter } from 'next/router';

type AdminRoute = 'dashboard' | 'users' | 'sessions' | 'settings';

export default function AdminLayout({ children }: { children: ReactNode }) {
  // Estado para o sidebar no desktop (largo/estreito)
  const [sidebarDesktopOpen, setSidebarDesktopOpen] = useState(true);
  // Estado para o sidebar no mobile (aberto/fechado)
  const [sidebarMobileOpen, setSidebarMobileOpen] = useState(false);
  
  const [activeRoute, setActiveRoute] = useState<AdminRoute>('dashboard');
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const renderContent = () => {
    switch (activeRoute) {
      case 'dashboard': return children;
      case 'users': return <UsersContent />;
      case 'sessions': return <SessionsContent />;
      case 'settings': return <SettingsContent />;
      default: return children;
    }
  };

  // Efeito de digitação (mantido como estava)
  const [typingText, setTypingText] = useState('');
  const [showCursor, setShowCursor] = useState(true);
  const fullText = "🥖🥖 🧀🧀";
  useEffect(() => {
    // A lógica do efeito de digitação continua a mesma aqui...
    let i = 0;
    let typingInterval: NodeJS.Timeout;
    let cursorInterval: NodeJS.Timeout;
    const startTyping = () => { /*...*/ };
    const startErasing = () => { /*...*/ };
    // O código completo do useEffect está oculto para simplicidade, mas mantenha o seu.
    // ...
  }, [fullText]);

  const handleNavClick = (route: AdminRoute) => {
    setActiveRoute(route);
    // Fecha o menu mobile ao navegar
    if (window.innerWidth <= 768) {
      setSidebarMobileOpen(false);
    }
  };
  
  return (
    <>
      <div className="admin-container">
        {/* Overlay para fechar o menu no mobile */}
        <div 
          className={`mobile-overlay ${sidebarMobileOpen ? 'visible' : ''}`}
          onClick={() => setSidebarMobileOpen(false)}
        />

        {/* Sidebar */}
        <div className={`sidebar ${sidebarDesktopOpen ? 'desktop-open' : 'desktop-closed'} ${sidebarMobileOpen ? 'mobile-open' : ''}`}>
          <div className="sidebar-header">
            {sidebarDesktopOpen && <h1 className="logo">MONOPÓLIO</h1>}
            
            <button onClick={() => setSidebarMobileOpen(false)} className="sidebar-toggle-mobile-close">
              <FiX size={20} />
            </button>
            
            <button onClick={() => setSidebarDesktopOpen(!sidebarDesktopOpen)} className="sidebar-toggle-desktop">
              <FiMenu size={20} />
            </button>
          </div>
          
          <nav className="sidebar-nav">
            <NavItem icon={<FiHome size={20} />} text="Dashboard" active={activeRoute === 'dashboard'} expanded={sidebarDesktopOpen || sidebarMobileOpen} onClick={() => handleNavClick('dashboard')} />
            <NavItem icon={<FiUsers size={20} />} text="Usuários" active={activeRoute === 'users'} expanded={sidebarDesktopOpen || sidebarMobileOpen} onClick={() => handleNavClick('users')} />
            <NavItem icon={<FiBarChart2 size={20} />} text="Sessões" active={activeRoute === 'sessions'} expanded={sidebarDesktopOpen || sidebarMobileOpen} onClick={() => handleNavClick('sessions')} />
            <NavItem icon={<FiSettings size={20} />} text="Configurações" active={activeRoute === 'settings'} expanded={sidebarDesktopOpen || sidebarMobileOpen} onClick={() => handleNavClick('settings')} />
          </nav>
        </div>

        {/* Main Content */}
        <div className="main-content">
          <header className="admin-header">
            <button onClick={() => setSidebarMobileOpen(true)} className="mobile-menu-toggle">
              <FiMenu size={22} />
            </button>
            
            <h2 className="header-title">Painel de Administração</h2>

            <div className="header-right">
              <div className="creative-text">
                {typingText}<span className={`cursor ${showCursor ? 'visible' : ''}`}>|</span>
              </div>
              <button className="notification-btn">
                <FiBell size={20} /><span className="notification-badge"></span>
              </button>
              <div className="user-profile">
                <div className="avatar"><span className="avatar-initial">A</span></div>
                <span className="username">Admin</span>
                <button onClick={handleLogout} className="logout-btn" title="Sair">
                  <FiLogOut size={20} />
                </button>
              </div>
            </div>
          </header>
          <main className="content-area">{renderContent()}</main>
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
          --blue-1: #1e3a8a;
          --blue-2: #2563eb;
          --blue-3: #3b82f6;
          --blue-4: #60a5fa;
          --green-1: #14532d;
          --green-2: #15803d;
          --red-1: #7f1d1d;
          --red-2: #dc2626;
          --purple-1: #4c1d95;
          --purple-2: #7e22ce;
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
        
        @keyframes slideIn {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
      
      <style jsx>{`
        .admin-container {
          display: flex;
          min-height: 100vh;
          background-color: var(--black-1);
          color: var(--white);
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
        
        .search-container {
          position: relative;
        }
        
        .search-icon {
          position: absolute;
          left: 0.75rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--gray-4);
        }
        
        .search-input {
          padding: 0.5rem 1rem 0.5rem 2.5rem;
          background-color: var(--black-4);
          border: 1px solid var(--gray-1);
          border-radius: 0.5rem;
          color: var(--white);
          transition: all 0.3s ease;
          width: 200px;
        }
        
        .search-input:focus {
          outline: none;
          border-color: var(--gray-3);
          width: 250px;
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
        
        .avatar-initial {
          font-weight: 600;
          font-size: 0.875rem;
        }
        
        .username {
          font-size: 0.875rem;
        }
        
        .content-area {
          flex: 1;
          overflow-y: auto;
          padding: 2rem;
          background-color: var(--black-2);
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
        
        /* Ajuste para o user-profile */
        .user-profile {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          position: relative;
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
          position: relative;
        }
        
        .cursor {
          opacity: 0;
          transition: opacity 0.1s;
        }
        
        .cursor.visible {
          opacity: 1;
        }
        
        /* Ajustes para o header-right */
        .header-right {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .mobile-logo {
font-size: 1.5rem;
font-weight: bold;
color: var(--blue-3);
padding: 0.25rem 0.5rem;
background: var(--black-4);
border-radius: 0.25rem;
}
.desktop-menu-btn {
background: transparent;
border: none;
color: var(--white);
cursor: pointer;
}

      `}</style>
    </>
  );
}

function NavItem({ icon, text, active = false, expanded, onClick }: { icon: React.ReactNode; text: string; active?: boolean; expanded: boolean; onClick: () => void }) {
return (
<>
<div className={`nav-item ${active ? 'active' : ''}`} onClick={onClick}>
<span className="nav-icon">{icon}</span>
{expanded && <span className="nav-text">{text}</span>}
</div>
      
      <style jsx>{`
        .nav-item {
          display: flex;
          align-items: center;
          padding: 0.75rem 1rem;
          border-radius: 0.5rem;
          transition: all 0.3s ease;
          cursor: pointer;
          color: var(--gray-4);
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
      `}</style>
    </>
  );
} 