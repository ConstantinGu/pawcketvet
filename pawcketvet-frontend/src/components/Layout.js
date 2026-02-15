import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationsAPI } from '../services/api';
import {
  Calendar, MessageCircle, Bell, Users, Package,
  CreditCard, Activity, LogOut, Pill, Shield,
  UserPlus, BarChart3, Settings, Check, X,
  ChevronLeft, ChevronRight, Search, Menu
} from 'lucide-react';

const Layout = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const [showNotifications, setShowNotifications] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const notifRef = useRef(null);

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

  const menuSections = [
    {
      title: 'Principal',
      items: [
        { id: 'dashboard', label: 'Tableau de bord', icon: Activity, path: '/dashboard' },
        { id: 'patients', label: 'Patients', icon: Users, path: '/patients' },
        { id: 'appointments', label: 'Rendez-vous', icon: Calendar, path: '/appointments' },
        { id: 'messages', label: 'Messages', icon: MessageCircle, path: '/messages' },
      ],
    },
    {
      title: 'Medical',
      items: [
        { id: 'prescriptions', label: 'Ordonnances', icon: Pill, path: '/prescriptions' },
        { id: 'certificates', label: 'Certificats', icon: Shield, path: '/certificates' },
      ],
    },
    {
      title: 'Gestion',
      items: [
        { id: 'inventory', label: 'Stock', icon: Package, path: '/inventory' },
        { id: 'invoices', label: 'Facturation', icon: CreditCard, path: '/invoices' },
        { id: 'staff', label: 'Equipe', icon: UserPlus, path: '/staff' },
        { id: 'analytics', label: 'Statistiques', icon: BarChart3, path: '/analytics' },
        { id: 'settings', label: 'Parametres', icon: Settings, path: '/clinic-settings' },
      ],
    },
  ];

  const notifTypeIcon = {
    APPOINTMENT: Calendar,
    MESSAGE: MessageCircle,
    STOCK_ALERT: Package,
    PAYMENT: CreditCard,
    REMINDER: Bell,
    SYSTEM: Settings,
  };

  const notifTypeColor = {
    APPOINTMENT: '#B8704F',
    MESSAGE: '#059669',
    STOCK_ALERT: '#D97706',
    PAYMENT: '#2563EB',
    REMINDER: '#7C3AED',
    SYSTEM: '#6B7280',
  };

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
            onClick={() => setCollapsed(!collapsed)}
            style={{
              width: '36px', height: '36px', borderRadius: '10px',
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
            onClick={() => navigate('/dashboard')}
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
            <span style={{
              width: '32px', height: '32px', borderRadius: '10px',
              background: 'linear-gradient(135deg, #B8704F 0%, #D4956C 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.95rem',
            }}>
              🐾
            </span>
            {!collapsed && 'PawcketVet'}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {/* Notifications */}
          <div ref={notifRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              style={{
                width: '40px', height: '40px', borderRadius: '12px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#57534E', border: 'none',
                background: showNotifications ? '#F5E6D3' : 'transparent',
                transition: 'all 0.2s', position: 'relative',
              }}
              onMouseEnter={e => { if (!showNotifications) e.currentTarget.style.background = '#F5F5F4'; }}
              onMouseLeave={e => { if (!showNotifications) e.currentTarget.style.background = 'transparent'; }}
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <div style={{
                  position: 'absolute', top: '4px', right: '4px',
                  background: '#DC2626', color: '#fff',
                  borderRadius: '50%', width: '18px', height: '18px',
                  fontSize: '0.65rem', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, border: '2px solid #fff',
                }}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </div>
              )}
            </button>

            {showNotifications && (
              <div style={{
                position: 'absolute', top: 'calc(100% + 8px)', right: 0,
                background: '#fff', borderRadius: '16px',
                boxShadow: '0 12px 48px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.04)',
                width: '400px', maxHeight: '500px', overflow: 'hidden',
                zIndex: 200, animation: 'scaleIn 0.2s ease-out',
              }}>
                <div style={{
                  padding: '1rem 1.25rem', borderBottom: '1px solid #F5F5F4',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}>
                  <h3 style={{ fontFamily: "'Fraunces', serif", fontSize: '1.1rem', color: '#3E2723', fontWeight: 600 }}>
                    Notifications
                  </h3>
                  {unreadCount > 0 && (
                    <button
                      onClick={() => markAllReadMutation.mutate()}
                      style={{
                        background: 'none', border: 'none', color: '#B8704F',
                        cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600,
                        padding: '0.25rem 0.5rem', borderRadius: '6px',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = '#FFF8F0'}
                      onMouseLeave={e => e.currentTarget.style.background = 'none'}
                    >
                      Tout marquer lu
                    </button>
                  )}
                </div>
                <div style={{ maxHeight: '420px', overflow: 'auto' }}>
                  {(!Array.isArray(notifications) || notifications.length === 0) ? (
                    <div style={{ padding: '3rem 2rem', textAlign: 'center', color: '#A8A29E' }}>
                      <Bell size={32} style={{ marginBottom: '0.75rem', opacity: 0.3 }} />
                      <p style={{ fontSize: '0.9rem' }}>Aucune notification</p>
                    </div>
                  ) : notifications.slice(0, 15).map(notif => {
                    const NotifIcon = notifTypeIcon[notif.type] || Bell;
                    const notifColor = notifTypeColor[notif.type] || '#6B7280';
                    return (
                      <div
                        key={notif.id}
                        onClick={() => { if (!notif.isRead) markReadMutation.mutate(notif.id); }}
                        style={{
                          padding: '0.875rem 1.25rem',
                          borderBottom: '1px solid #F5F5F4',
                          cursor: notif.isRead ? 'default' : 'pointer',
                          background: notif.isRead ? '#fff' : '#FAFAF9',
                          display: 'flex', gap: '0.75rem', alignItems: 'flex-start',
                          transition: 'background 0.15s',
                        }}
                        onMouseEnter={e => { if (!notif.isRead) e.currentTarget.style.background = '#FFF8F0'; }}
                        onMouseLeave={e => e.currentTarget.style.background = notif.isRead ? '#fff' : '#FAFAF9'}
                      >
                        <div style={{
                          width: '34px', height: '34px', borderRadius: '10px',
                          background: `${notifColor}12`, display: 'flex',
                          alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                        }}>
                          <NotifIcon size={16} color={notifColor} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontWeight: notif.isRead ? 400 : 600, color: '#3E2723', fontSize: '0.88rem', margin: 0, marginBottom: '0.1rem' }}>
                            {notif.title}
                          </p>
                          <p style={{ color: '#78716C', fontSize: '0.8rem', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {notif.message}
                          </p>
                          <p style={{ color: '#A8A29E', fontSize: '0.72rem', margin: 0, marginTop: '0.2rem' }}>
                            {new Date(notif.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                        {!notif.isRead && (
                          <div style={{
                            width: '8px', height: '8px', borderRadius: '50%',
                            background: '#B8704F', flexShrink: 0, marginTop: '0.5rem',
                          }} />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* User */}
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
              <div style={{ fontSize: '0.7rem', color: '#A8A29E', lineHeight: 1.2 }}>
                {user?.role === 'ADMIN' ? 'Administrateur' : user?.role === 'VETERINARIAN' ? 'Veterinaire' : 'Assistant'}
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
            title="Deconnexion"
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      {/* Main Layout */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: collapsed ? '72px 1fr' : '252px 1fr',
        transition: 'grid-template-columns 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        minHeight: 'calc(100vh - 64px)',
      }}>
        {/* Sidebar */}
        <nav style={{
          background: '#fff',
          borderRight: '1px solid rgba(184, 112, 79, 0.06)',
          padding: collapsed ? '1rem 0.5rem' : '1.25rem 0.75rem',
          position: 'sticky',
          top: '64px',
          height: 'calc(100vh - 64px)',
          overflowY: 'auto',
          overflowX: 'hidden',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          display: 'flex',
          flexDirection: 'column',
        }}>
          <div style={{ flex: 1 }}>
            {menuSections.map((section, si) => (
              <div key={si} style={{ marginBottom: '1.25rem' }}>
                {!collapsed && (
                  <div style={{
                    padding: '0 0.75rem', marginBottom: '0.4rem',
                    color: '#A8A29E', fontSize: '0.68rem', fontWeight: 600,
                    textTransform: 'uppercase', letterSpacing: '0.08em',
                  }}>
                    {section.title}
                  </div>
                )}
                {section.items.map(item => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path ||
                    (item.path === '/patients' && location.pathname.startsWith('/patient/'));
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
                        marginBottom: '2px',
                        fontSize: '0.88rem',
                        fontWeight: isActive ? 600 : 500,
                        background: isActive ? 'linear-gradient(135deg, #B8704F 0%, #D4956C 100%)' : 'transparent',
                        color: isActive ? '#fff' : '#57534E',
                        justifyContent: collapsed ? 'center' : 'flex-start',
                        boxShadow: isActive ? '0 2px 8px rgba(184, 112, 79, 0.25)' : 'none',
                      }}
                      onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = '#FAFAF9'; }}
                      onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
                    >
                      <Icon size={19} />
                      {!collapsed && <span>{item.label}</span>}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {/* Collapse toggle */}
          <div
            onClick={() => setCollapsed(!collapsed)}
            style={{
              padding: '0.6rem', borderRadius: '10px', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: '0.5rem', color: '#A8A29E', fontSize: '0.82rem',
              transition: 'all 0.15s', marginTop: '0.5rem',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#FAFAF9'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            {collapsed ? <ChevronRight size={16} /> : <><ChevronLeft size={16} /> <span>Reduire</span></>}
          </div>
        </nav>

        {/* Content */}
        <main style={{
          padding: '1.75rem 2rem',
          maxWidth: '1600px',
          width: '100%',
          animation: 'fadeIn 0.3s ease-out',
        }}>
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
