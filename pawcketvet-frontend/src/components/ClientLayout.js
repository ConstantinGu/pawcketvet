import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Home, Heart, Calendar, MessageCircle, FileText,
  Bell, CreditCard, LogOut, ChevronLeft, ChevronRight, Menu
} from 'lucide-react';

const ClientLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { id: 'dashboard', label: 'Accueil', icon: Home, path: '/client/dashboard' },
    { id: 'pets', label: 'Mes animaux', icon: Heart, path: '/client/my-pets' },
    { id: 'appointments', label: 'Rendez-vous', icon: Calendar, path: '/client/appointments' },
    { id: 'messages', label: 'Messages', icon: MessageCircle, path: '/client/messages' },
    { id: 'documents', label: 'Documents', icon: FileText, path: '/client/documents' },
    { id: 'reminders', label: 'Rappels', icon: Bell, path: '/client/reminders' },
    { id: 'payments', label: 'Paiements', icon: CreditCard, path: '/client/payments' },
  ];

  const styles = {
    container: {
      fontFamily: "'IBM Plex Sans', -apple-system, system-ui, sans-serif",
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #FFF8F0 0%, #F5E6D3 100%)',
      color: '#3E2723',
    },
    header: {
      background: 'linear-gradient(135deg, #B8704F 0%, #D4956C 100%)',
      padding: '1rem 2rem',
      boxShadow: '0 4px 20px rgba(184, 112, 79, 0.15)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    },
    logo: {
      fontFamily: "'Fraunces', serif",
      fontSize: '1.5rem',
      fontWeight: 700,
      color: '#fff',
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      cursor: 'pointer',
    },
    mainLayout: {
      display: 'grid',
      gridTemplateColumns: collapsed ? '80px 1fr' : '240px 1fr',
      transition: 'grid-template-columns 0.3s ease',
      minHeight: 'calc(100vh - 60px)',
    },
    sidebar: {
      background: '#fff',
      borderRight: '1px solid rgba(184, 112, 79, 0.1)',
      padding: collapsed ? '1rem 0.5rem' : '1.5rem 1rem',
      display: 'flex',
      flexDirection: 'column',
      transition: 'all 0.3s ease',
      position: 'sticky',
      top: '60px',
      height: 'calc(100vh - 60px)',
      overflowY: 'auto',
    },
    menuItem: {
      padding: collapsed ? '0.85rem' : '0.85rem 1rem',
      borderRadius: '14px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      transition: 'all 0.3s',
      marginBottom: '0.35rem',
      fontSize: '0.9rem',
      fontWeight: 500,
      justifyContent: collapsed ? 'center' : 'flex-start',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
    },
    content: {
      padding: '2rem',
      minHeight: '100%',
      maxWidth: '1400px',
    },
    collapseBtn: {
      background: 'rgba(255,255,255,0.15)',
      border: 'none',
      borderRadius: '10px',
      padding: '0.5rem',
      cursor: 'pointer',
      color: '#fff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      transition: 'all 0.3s',
    },
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button
            onClick={() => setCollapsed(!collapsed)}
            style={styles.collapseBtn}
            title={collapsed ? 'Ouvrir le menu' : 'Fermer le menu'}
          >
            <Menu size={20} />
          </button>
          <div style={styles.logo} onClick={() => navigate('/client/dashboard')}>
            🐾 PawcketVet
          </div>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <div style={{
            background: 'rgba(255, 255, 255, 0.15)',
            borderRadius: '12px',
            padding: '0.6rem 1rem',
            color: '#fff',
            fontSize: '0.9rem',
            fontWeight: 500,
          }}>
            {user?.firstName} {user?.lastName}
          </div>
          <button
            onClick={handleLogout}
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              border: 'none',
              borderRadius: '12px',
              padding: '0.6rem',
              cursor: 'pointer',
              color: '#fff',
              transition: 'all 0.3s',
            }}
            title="Déconnexion"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>

      {/* Main Layout */}
      <div style={styles.mainLayout}>
        {/* Sidebar */}
        <div style={styles.sidebar}>
          <div style={{ flex: 1 }}>
            {menuItems.map(item => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path ||
                (item.path === '/client/dashboard' && location.pathname === '/client');
              return (
                <div
                  key={item.id}
                  style={{
                    ...styles.menuItem,
                    background: isActive
                      ? 'linear-gradient(135deg, #B8704F 0%, #D4956C 100%)'
                      : 'transparent',
                    color: isActive ? '#fff' : '#3E2723',
                  }}
                  onClick={() => navigate(item.path)}
                  onMouseEnter={(e) => {
                    if (!isActive) e.currentTarget.style.background = '#FFF8F0';
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) e.currentTarget.style.background = 'transparent';
                  }}
                  title={collapsed ? item.label : undefined}
                >
                  <Icon size={20} />
                  {!collapsed && item.label}
                </div>
              );
            })}
          </div>

          {/* Collapse toggle at bottom */}
          <div
            onClick={() => setCollapsed(!collapsed)}
            style={{
              ...styles.menuItem,
              color: '#A1887F',
              marginTop: '1rem',
              justifyContent: 'center',
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#FFF8F0'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
            {!collapsed && <span style={{ fontSize: '0.85rem' }}>Réduire</span>}
          </div>
        </div>

        {/* Content */}
        <div style={styles.content}>
          {children}
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&family=Fraunces:wght@700&display=swap');
      `}</style>
    </div>
  );
};

export default ClientLayout;
