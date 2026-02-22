import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Home, Heart, Calendar, MessageCircle, FileText,
  Bell, CreditCard, LogOut, ChevronLeft, ChevronRight,
  Menu, AlertTriangle, BookOpen
} from 'lucide-react';
import PawcketVetLogo from './PawcketVetLogo';

const ClientLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(typeof window !== 'undefined' && window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth <= 768;
      setIsMobile(mobile);
      if (!mobile) setMobileOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { id: 'dashboard', label: 'Accueil', icon: Home, path: '/client/dashboard' },
    { id: 'pets', label: 'Mes animaux', icon: Heart, path: '/client/my-pets' },
    { id: 'health-book', label: 'Carnet de santé', icon: BookOpen, path: '/client/health-book' },
    { id: 'appointments', label: 'Rendez-vous', icon: Calendar, path: '/client/appointments' },
    { id: 'messages', label: 'Messages', icon: MessageCircle, path: '/client/messages' },
    { id: 'documents', label: 'Documents', icon: FileText, path: '/client/documents' },
    { id: 'reminders', label: 'Rappels', icon: Bell, path: '/client/reminders' },
    { id: 'payments', label: 'Paiements', icon: CreditCard, path: '/client/payments' },
    { id: 'sos', label: 'SOS Urgence', icon: AlertTriangle, path: '/client/sos', highlight: true },
  ];

  return (
    <div style={{
      fontFamily: "'Inter', -apple-system, system-ui, sans-serif",
      minHeight: '100vh',
      color: '#3E2723',
    }}>
      {/* Top Bar */}
      <header style={{
        background: '#fff',
        borderBottom: '1px solid rgba(184, 112, 79, 0.08)',
        padding: '0 1.5rem',
        height: '64px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        backdropFilter: 'blur(12px)',
        backgroundColor: 'rgba(255,255,255,0.92)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            onClick={() => isMobile ? setMobileOpen(!mobileOpen) : setCollapsed(!collapsed)}
            aria-label="Menu de navigation"
            style={{
              width: '44px', height: '44px', borderRadius: '10px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#78716C', border: 'none', background: 'transparent',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#F5F5F4'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <Menu size={20} />
          </button>
          <div
            onClick={() => navigate('/client/dashboard')}
            style={{
              fontFamily: "'Fraunces', serif",
              fontSize: '1.35rem',
              fontWeight: 700,
              color: '#3E2723',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              cursor: 'pointer',
              letterSpacing: '-0.02em',
            }}
          >
            <PawcketVetLogo size={28} />
            {!collapsed && 'PawcketVet'}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.75rem',
            background: '#FAFAF9', borderRadius: '12px',
            padding: '0.4rem 1rem 0.4rem 0.4rem',
          }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '10px',
              background: 'linear-gradient(135deg, #B8704F 0%, #D4956C 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#fff', fontSize: '0.8rem', fontWeight: 700,
            }}>
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            <div>
              <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#3E2723', lineHeight: 1.2 }}>
                {user?.firstName} {user?.lastName}
              </div>
              <div style={{ fontSize: '0.7rem', color: '#78716C', lineHeight: 1.2 }}>
                Mon espace
              </div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            style={{
              width: '40px', height: '40px', borderRadius: '12px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#78716C', border: 'none', background: 'transparent',
              transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#FEF2F2'; e.currentTarget.style.color = '#DC2626'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#78716C'; }}
            title="Déconnexion"
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* Mobile backdrop */}
      {mobileOpen && isMobile && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{
            position: 'fixed',
            top: '64px',
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.3)',
            zIndex: 89,
          }}
        />
      )}

      {/* Main Layout */}
      <div style={{
        display: isMobile ? 'block' : 'grid',
        gridTemplateColumns: isMobile ? undefined : (collapsed ? '72px 1fr' : '240px 1fr'),
        transition: 'grid-template-columns 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        minHeight: 'calc(100vh - 64px)',
      }}>
        {/* Sidebar */}
        <nav style={{
          background: '#fff',
          borderRight: '1px solid rgba(184, 112, 79, 0.06)',
          padding: (isMobile || !collapsed) ? '1.25rem 0.75rem' : '1rem 0.5rem',
          position: isMobile ? 'fixed' : 'sticky',
          top: '64px',
          left: 0,
          width: isMobile ? '260px' : undefined,
          height: 'calc(100vh - 64px)',
          overflowY: 'auto',
          overflowX: 'hidden',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          display: 'flex',
          flexDirection: 'column',
          zIndex: isMobile ? 90 : undefined,
          transform: isMobile ? (mobileOpen ? 'translateX(0)' : 'translateX(-100%)') : undefined,
          boxShadow: isMobile && mobileOpen ? '4px 0 20px rgba(0,0,0,0.15)' : undefined,
        }}>
          <div style={{ flex: 1 }}>
            {menuItems.map(item => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path ||
                (item.path === '/client/my-pets' && location.pathname.startsWith('/client/animal/')) ||
                (item.path === '/client/dashboard' && location.pathname === '/client');
              const isSOS = item.highlight;

              return (
                <div
                  key={item.id}
                  onClick={() => navigate(item.path)}
                  title={collapsed ? item.label : undefined}
                  style={{
                    padding: collapsed ? '0.7rem' : '0.6rem 0.75rem',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.7rem',
                    transition: 'all 0.15s',
                    marginBottom: isSOS ? '0' : '2px',
                    marginTop: isSOS ? '0.75rem' : '0',
                    fontSize: '0.88rem',
                    fontWeight: isActive ? 600 : 500,
                    background: isActive
                      ? (isSOS ? 'linear-gradient(135deg, #DC2626 0%, #EF4444 100%)' : 'linear-gradient(135deg, #B8704F 0%, #D4956C 100%)')
                      : isSOS ? '#FEF2F2' : 'transparent',
                    color: isActive ? '#fff' : isSOS ? '#DC2626' : '#57534E',
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    boxShadow: isActive ? (isSOS ? '0 2px 8px rgba(220,38,38,0.25)' : '0 2px 8px rgba(184, 112, 79, 0.25)') : 'none',
                  }}
                  onMouseEnter={e => {
                    if (!isActive) e.currentTarget.style.background = isSOS ? '#FEE2E2' : '#FAFAF9';
                  }}
                  onMouseLeave={e => {
                    if (!isActive) e.currentTarget.style.background = isSOS ? '#FEF2F2' : 'transparent';
                  }}
                >
                  <Icon size={19} />
                  {!collapsed && <span>{item.label}</span>}
                </div>
              );
            })}
          </div>

          <div
            onClick={() => setCollapsed(!collapsed)}
            style={{
              padding: '0.6rem', borderRadius: '10px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: '0.5rem', color: '#78716C', fontSize: '0.82rem',
              transition: 'all 0.15s', marginTop: '0.5rem',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#FAFAF9'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            {collapsed ? <ChevronRight size={16} /> : <><ChevronLeft size={16} /> <span>Réduire</span></>}
          </div>
        </nav>

        {/* Content */}
        <main style={{
          padding: isMobile ? '1.25rem 1rem' : '1.75rem 2rem',
          maxWidth: '1400px',
          width: '100%',
          animation: 'fadeIn 0.3s ease-out',
        }}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default ClientLayout;
