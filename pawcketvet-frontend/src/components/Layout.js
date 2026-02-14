import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsAPI } from '../services/api';
import {
  Calendar, MessageCircle, Bell, Users, Package,
  CreditCard, Activity, LogOut, Pill, Shield,
  UserPlus, BarChart3, Settings, ChevronDown, Check, X
} from 'lucide-react';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef(null);

  // Fetch notifications
  const { data: notifData } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => notificationsAPI.getAll().then(r => r.data),
    refetchInterval: 30000,
  });

  const markReadMutation = useMutation({
    mutationFn: (id) => notificationsAPI.markAsRead(id),
    onSuccess: () => queryClient.invalidateQueries(['notifications']),
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => notificationsAPI.markAllAsRead(),
    onSuccess: () => queryClient.invalidateQueries(['notifications']),
  });

  const notifications = notifData?.notifications || notifData || [];
  const unreadCount = Array.isArray(notifications) ? notifications.filter(n => !n.isRead).length : (notifData?.unreadCount || 0);

  // Close notifications on click outside
  useEffect(() => {
    const handleClick = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const menuItems = [
    { id: 'dashboard', label: 'Tableau de bord', icon: Activity, path: '/dashboard' },
    { id: 'patients', label: 'Patients', icon: Users, path: '/patients' },
    { id: 'appointments', label: 'Rendez-vous', icon: Calendar, path: '/appointments' },
    { id: 'messages', label: 'Messages', icon: MessageCircle, path: '/messages' },
    { id: 'prescriptions', label: 'Ordonnances', icon: Pill, path: '/prescriptions' },
    { id: 'certificates', label: 'Certificats', icon: Shield, path: '/certificates' },
    { id: 'inventory', label: 'Stock', icon: Package, path: '/inventory' },
    { id: 'invoices', label: 'Facturation', icon: CreditCard, path: '/invoices' },
    { id: 'staff', label: 'Équipe', icon: UserPlus, path: '/staff' },
    { id: 'analytics', label: 'Statistiques', icon: BarChart3, path: '/analytics' },
    { id: 'settings', label: 'Paramètres', icon: Settings, path: '/clinic-settings' },
  ];

  const notifTypeIcon = { APPOINTMENT: '📅', MESSAGE: '💬', STOCK_ALERT: '📦', PAYMENT: '💳', REMINDER: '🔔', SYSTEM: '⚙️' };

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
      padding: '0.85rem 1.25rem',
      borderRadius: '14px',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      transition: 'all 0.3s',
      marginBottom: '0.35rem',
      fontSize: '0.93rem',
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
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          {/* Notification Bell */}
          <div ref={notifRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              style={{
                background: showNotifications ? 'rgba(255,255,255,0.3)' : 'rgba(255,255,255,0.15)',
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
              {unreadCount > 0 && (
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
                  {unreadCount > 9 ? '9+' : unreadCount}
                </div>
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <div style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: '0.75rem',
                background: '#fff',
                borderRadius: '16px',
                boxShadow: '0 8px 40px rgba(0,0,0,0.15)',
                width: '380px',
                maxHeight: '480px',
                overflow: 'hidden',
                zIndex: 200,
              }}>
                <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid #F5E6D3', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: '1.1rem', color: '#3E2723', margin: 0 }}>Notifications</h3>
                  {unreadCount > 0 && (
                    <button onClick={() => markAllReadMutation.mutate()} style={{ background: 'none', border: 'none', color: '#B8704F', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600 }}>
                      Tout marquer lu
                    </button>
                  )}
                </div>
                <div style={{ maxHeight: '400px', overflow: 'auto' }}>
                  {(!Array.isArray(notifications) || notifications.length === 0) ? (
                    <div style={{ padding: '2rem', textAlign: 'center', color: '#A1887F' }}>
                      Aucune notification
                    </div>
                  ) : notifications.slice(0, 15).map(notif => (
                    <div
                      key={notif.id}
                      onClick={() => { if (!notif.isRead) markReadMutation.mutate(notif.id); }}
                      style={{
                        padding: '0.875rem 1.25rem',
                        borderBottom: '1px solid #F5E6D3',
                        cursor: notif.isRead ? 'default' : 'pointer',
                        background: notif.isRead ? '#fff' : '#FFF8F0',
                        display: 'flex',
                        gap: '0.75rem',
                        alignItems: 'flex-start',
                        transition: 'background 0.2s',
                      }}
                    >
                      <span style={{ fontSize: '1.2rem', flexShrink: 0, marginTop: '0.1rem' }}>
                        {notifTypeIcon[notif.type] || '🔔'}
                      </span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontWeight: notif.isRead ? 400 : 600, color: '#3E2723', fontSize: '0.9rem', margin: 0, marginBottom: '0.15rem' }}>{notif.title}</p>
                        <p style={{ color: '#A1887F', fontSize: '0.8rem', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{notif.message}</p>
                        <p style={{ color: '#BCAAA4', fontSize: '0.75rem', margin: 0, marginTop: '0.25rem' }}>
                          {new Date(notif.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      {!notif.isRead && <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#B8704F', flexShrink: 0, marginTop: '0.4rem' }} />}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

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
          <div style={{ marginBottom: '0.5rem', padding: '0 0.5rem', color: '#A1887F', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Principal
          </div>
          {menuItems.slice(0, 4).map(item => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path || (item.path === '/patients' && location.pathname.startsWith('/patient/'));
            return (
              <div
                key={item.id}
                style={{
                  ...styles.menuItem,
                  background: isActive ? 'linear-gradient(135deg, #B8704F 0%, #D4956C 100%)' : 'transparent',
                  color: isActive ? '#fff' : '#3E2723',
                }}
                onClick={() => navigate(item.path)}
                onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = '#FFF8F0'; }}
                onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
              >
                <Icon size={20} />
                {item.label}
              </div>
            );
          })}

          <div style={{ marginTop: '1rem', marginBottom: '0.5rem', padding: '0 0.5rem', color: '#A1887F', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Médical
          </div>
          {menuItems.slice(4, 6).map(item => {
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
                onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = '#FFF8F0'; }}
                onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
              >
                <Icon size={20} />
                {item.label}
              </div>
            );
          })}

          <div style={{ marginTop: '1rem', marginBottom: '0.5rem', padding: '0 0.5rem', color: '#A1887F', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Gestion
          </div>
          {menuItems.slice(6).map(item => {
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
                onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = '#FFF8F0'; }}
                onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
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
