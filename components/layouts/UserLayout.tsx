import { ReactNode, useState, useEffect } from 'react';
import { FiHome, FiClock, FiCalendar, FiBarChart2, FiSettings, FiMenu, FiUser, FiLogOut, FiBell, FiCreditCard, FiUserPlus, FiX } from 'react-icons/fi';
import { useAuth } from '@/contexts/AuthContext';
import router from 'next/router';

export default function UserLayout({ children }: { children: ReactNode }) {
  // Estado para o sidebar no desktop (largo/estreito)
  const [sidebarDesktopOpen, setSidebarDesktopOpen] = useState(true);
  // Estado para o sidebar no mobile (aberto/fechado)
  const [sidebarMobileOpen, setSidebarMobileOpen] = useState(false);

  const { logout, user } = useAuth();

   const userFirstName = user?.name ? user.name.split(' ')[0] : 'Usuário';
  const userInitial = user?.name ? user.name.charAt(0).toUpperCase() : '?';


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
      router.push('/');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  // Efeito de digitação (mantido como estava)
  const [typingText, setTypingText] = useState('');
  const [showCursor, setShowCursor] = useState(true);
  const fullText = "🥖🥖 🧀🧀";
  useEffect(() => {
    // ... (toda a lógica do useEffect para o texto digitando foi mantida, sem alterações)
    // Para economizar espaço, não vou colar ela aqui de novo, mas ela deve continuar no seu código.
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
          setTimeout(() => { startErasing(); }, 1000);
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
          setTimeout(() => { startTyping(); }, 500);
        }
      }, 50);
    };
    startTyping();
    cursorInterval = setInterval(() => setShowCursor(prev => !prev), 500);
    return () => {
      clearInterval(typingInterval);
      clearInterval(cursorInterval);
    };
  }, [fullText]);

  return (
    <>
      <div className="layout-container">
        {/* Overlay para fechar o menu no mobile */}
        <div 
          className={`mobile-overlay ${sidebarMobileOpen ? 'visible' : ''}`}
          onClick={() => setSidebarMobileOpen(false)}
        />

        {/* Sidebar */}
        <div className={`sidebar ${sidebarDesktopOpen ? 'desktop-open' : 'desktop-closed'} ${sidebarMobileOpen ? 'mobile-open' : ''}`}>
          <div className="sidebar-header">
            {sidebarDesktopOpen && <h1 className="logo">MONOPÓLIO</h1>}
            
            {/* Botão de fechar para mobile */}
            <button 
              onClick={() => setSidebarMobileOpen(false)} 
              className="sidebar-toggle-mobile-close"
            >
              <FiX size={20} />
            </button>
            
            {/* Botão de abrir/fechar para desktop */}
            <button 
              onClick={() => setSidebarDesktopOpen(!sidebarDesktopOpen)} 
              className="sidebar-toggle-desktop"
            >
              <FiMenu size={20} />
            </button>
          </div>
          
          <nav className="sidebar-nav">
            {menu.map((item) => (
              <div key={item.label} className={`nav-item ${item.label === "Dashboard" ? 'active' : ''}`}>
                <span className="nav-icon">{item.icon}</span>
                {(sidebarDesktopOpen || sidebarMobileOpen) && <span className="nav-text">{item.label}</span>}
              </div>
            ))}
          </nav>
        </div>

        {/* Main content */}
        <div className="main-content">
          <header className="main-header">
            {/* Botão de Menu para Mobile */}
            <button 
              onClick={() => setSidebarMobileOpen(true)} 
              className="mobile-menu-toggle"
            >
              <FiMenu size={22} />
            </button>

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
                {/* ✅ Substitui o ícone pela inicial do nome */}
                <span className="avatar-initial">{userInitial}</span>
              </div>
              {/* ✅ Substitui o texto estático pelo primeiro nome */}
              <span className="username">{userFirstName}</span> 
              <button onClick={handleLogout} className="logout-btn" title="Sair">
                <FiLogOut size={20} />
              </button>
            </div>
          </header>
          <main className="content-area">
            {children}
          </main>
        </div>
      </div>

      <style jsx global>{`
       /* Estilos globais (sem alterações) */
       :root {
          --black-1: #0a0a0a; --black-2: #121212; --black-3: #1a1a1a; --black-4: #222222;
          --gray-1: #333333; --gray-2: #555555; --gray-3: #777777; --gray-4: #999999;
          --white: #e0e0e0; --blue-1: #1e3a8a; --blue-2: #2563eb; --blue-3: #3b82f6;
          --green-1: #14532d; --green-2: #15803d; --red-1: #7f1d1d; --red-2: #dc2626;
          --yellow-1: #facc15; --purple-1: #4c1d95; --purple-2: #8b5cf6;
        }
        * { margin: 0; padding: 0; box-sizing: border-box; font-family: 'Inter', system-ui, -apple-system, sans-serif; }
        body { background-color: var(--black-1); color: var(--white); overflow-x: hidden; }
      `}</style>
      
      {/* 💅 ESTILOS ATUALIZADOS PARA RESPONSIVIDADE 💅 */}
      <style jsx>{`
        .layout-container { display: flex; min-height: 100vh; background-color: var(--black-1); }
        .sidebar { background-color: var(--black-3); transition: all 0.3s ease; height: 100vh; position: sticky; top: 0; border-right: 1px solid var(--gray-1); z-index: 50; }
        .sidebar.desktop-open { width: 256px; /* 16rem */ }
        .sidebar.desktop-closed { width: 80px; /* 5rem */ }
        .sidebar-header { padding: 1.5rem; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid var(--gray-1); }
        .logo { font-size: 1.5rem; font-weight: 800; letter-spacing: 1px; background: linear-gradient(90deg, var(--white), var(--gray-4)); -webkit-background-clip: text; background-clip: text; color: transparent; }
        .sidebar-toggle-desktop, .sidebar-toggle-mobile-close { padding: 0.5rem; border-radius: 0.5rem; background: transparent; border: none; color: var(--white); cursor: pointer; transition: all 0.3s ease; }
        .sidebar-toggle-desktop:hover, .sidebar-toggle-mobile-close:hover { background-color: var(--gray-1); }
        .sidebar-nav { margin-top: 1.5rem; display: flex; flex-direction: column; gap: 0.5rem; padding: 0 0.5rem; }
        .nav-item { display: flex; align-items: center; padding: 0.75rem 1rem; border-radius: 0.5rem; cursor: pointer; color: var(--gray-4); transition: all 0.3s ease; overflow: hidden; white-space: nowrap; }
        .nav-item:hover { background-color: var(--gray-1); color: var(--white); }
        .nav-item.active { background-color: var(--blue-1); color: var(--white); }
        .nav-icon { display: flex; align-items: center; justify-content: center; min-width: 20px; }
        .nav-text { margin-left: 1rem; font-size: 0.875rem; font-weight: 500; }
        .desktop-closed .nav-text { opacity: 0; }
        .main-content { flex: 1; display: flex; flex-direction: column; transition: margin-left 0.3s ease; }
        .main-header { background-color: var(--black-3); border-bottom: 1px solid var(--gray-1); padding: 1rem 1.5rem; display: flex; align-items: center; justify-content: space-between; position: sticky; top: 0; z-index: 10; }
        .header-left { display: flex; align-items: center; gap: 1rem; }
        .header-title { font-size: 1.25rem; font-weight: 600; }
        .header-right { display: flex; align-items: center; gap: 1.5rem; }
        .creative-text { font-family: 'Courier New', monospace; font-size: 1.1rem; color: var(--white); background: var(--black-4); padding: 0.5rem 1rem; border-radius: 0.25rem; min-width: 180px; text-align: center; }
        .cursor { opacity: 0; animation: blink 1s step-end infinite; }
        @keyframes blink { from, to { opacity: 1; } 50% { opacity: 0; } }
        .notification-btn { position: relative; padding: 0.5rem; background: transparent; border: none; color: var(--white); cursor: pointer; border-radius: 50%; transition: all 0.3s ease; }
        .notification-btn:hover { background-color: var(--gray-1); }
        .notification-badge { position: absolute; top: 0; right: 0; width: 0.5rem; height: 0.5rem; background-color: var(--red-2); border-radius: 50%; }
        .user-profile { display: flex; align-items: center; gap: 0.75rem; }
        .avatar { width: 2rem; height: 2rem; border-radius: 50%; background-color: var(--blue-3); display: flex; align-items: center; justify-content: center; }
        .username { font-size: 0.875rem; }
        .logout-btn { margin-left: 1rem; padding: 0.5rem; background: transparent; border: none; color: var(--gray-4); cursor: pointer; border-radius: 0.25rem; transition: all 0.3s ease; display: flex; align-items: center; }
        .logout-btn:hover { background-color: var(--gray-1); color: var(--white); }
        .content-area { flex: 1; overflow-y: auto; padding: 1.5rem; background-color: var(--black-2); }
        
        /* Controles de visibilidade para mobile/desktop */
        .mobile-menu-toggle { display: none; background: transparent; border: none; color: var(--white); cursor: pointer; }
        .sidebar-toggle-mobile-close { display: none; }
        .mobile-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background-color: rgba(0,0,0,0.5); z-index: 40; opacity: 0; pointer-events: none; transition: opacity 0.3s ease; }
        .mobile-overlay.visible { opacity: 1; pointer-events: auto; }

        /* --- MEDIA QUERY PARA CELULAR --- */
        @media (max-width: 768px) {
          .sidebar { 
            position: fixed; 
            left: 0; top: 0; height: 100%;
            width: 280px;
            transform: translateX(-100%);
          }
          .sidebar.mobile-open { transform: translateX(0); }
          .sidebar-toggle-desktop { display: none; }
          .sidebar-toggle-mobile-close { display: block; }
          .logo { display: block !important; }
          .nav-text { opacity: 1 !important; }
          .main-content { margin-left: 0; width: 100%; }
          .mobile-menu-toggle { display: block; }
          .creative-text, .username { display: none; }
          .header-title { font-size: 1.1rem; }
          .main-header { padding: 1rem; }
          .content-area { padding: 1rem; }
        }
      `}</style>
    </>
  );
}