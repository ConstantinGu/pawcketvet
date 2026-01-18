import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Calendar, MessageCircle, Bell, Users, Package, 
  CreditCard, Activity, LogOut, Search 
} from 'lucide-react';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { id: 'dashboard', label: 'Tableau de bord', icon: Activity, path: '/dashboard' },
    { id: 'patients', label: 'Patients', icon: Users, path: '/patients' },
    { id: 'appointments', label: 'Rendez-vous', icon: Calendar, path: '/appointments' },
    { id: 'messages', label: 'Messages', icon: MessageCircle, path: '/messages' },
    { id: 'inventory', label: 'Stock', icon: Package, path: '/inventory' },
    { id: 'invoices', label: 'Facturation', icon: CreditCard, path: '/invoices' },
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
      padding: '1.5rem 2rem',
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
      fontSize: '1.8rem',
      fontWeight: 700,
      color: '#fff',
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      cursor: 'pointer',
    },
    mainLayout: {
      display: 'grid',
      gridTemplateColumns: '260px 1fr',
      gap: '2rem',
      padding: '2rem',
      maxWidth: '1800px',
      margin: '0 auto',
    },
    sidebar: {
      background: '#fff',
      borderRadius: '20px',
      padding: '1.5rem',
      boxShadow: '0 4px 30px rgba(45, 80, 22, 0.08)',
      height: 'fit-content',
      position: 'sticky',
      top: '6rem',
    },
    menuItem: {
      padding: '1rem 1.25rem',
      borderRadius: '14px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      transition: 'all 0.3s',
      marginBottom: '0.5rem',
      fontSize: '0.95rem',
      fontWeight: 500,
    },
    content: {
      background: '#fff',
      borderRadius: '20px',
      padding: '2rem',
      boxShadow: '0 4px 30px rgba(45, 80, 22, 0.08)',
      minHeight: '600px',
    },
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.logo} onClick={() => navigate('/dashboard')}>
          🐾 PawcketVet
        </div>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <button
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              border: 'none',
              borderRadius: '12px',
              padding: '0.75rem',
              cursor: 'pointer',
              color: '#fff',
              transition: 'all 0.3s',
            }}
          >
            <Search size={20} />
          </button>
          <button
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              border: 'none',
              borderRadius: '12px',
              padding: '0.75rem',
              cursor: 'pointer',
              color: '#fff',
              transition: 'all 0.3s',
              position: 'relative',
            }}
          >
            <Bell size={20} />
            <div style={{
              position: 'absolute',
              top: '-5px',
              right: '-5px',
              background: '#dc2626',
              color: '#fff',
              borderRadius: '50%',
              width: '20px',
              height: '20px',
              fontSize: '0.7rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              border: '2px solid #B8704F',
            }}>
              3
            </div>
          </button>
          <div style={{
            background: 'rgba(255, 255, 255, 0.15)',
            borderRadius: '12px',
            padding: '0.75rem 1.25rem',
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
              padding: '0.75rem',
              cursor: 'pointer',
              color: '#fff',
              transition: 'all 0.3s',
            }}
            title="Déconnexion"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>

      {/* Main Layout */}
      <div style={styles.mainLayout}>
        {/* Sidebar */}
        <div style={styles.sidebar}>
          {menuItems.map(item => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <div
                key={item.id}
                style={{
                  ...styles.menuItem,
                  background: isActive ? 'linear-gradient(135deg, #B8704F 0%, #D4956C 100%)' : 'transparent',
                  color: isActive ? '#fff' : '#3E2723',
                }}
                onClick={() => navigate(item.path)}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = '#FFF8F0';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                <Icon size={20} />
                {item.label}
              </div>
            );
          })}
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

export default Layout;
