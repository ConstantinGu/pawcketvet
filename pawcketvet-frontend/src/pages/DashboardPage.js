import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { analyticsAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { DashboardSkeleton } from '../components/LoadingSkeleton';
import {
  Calendar, MessageCircle, Package, Users, Activity,
  TrendingUp, AlertTriangle, Clock, CheckCircle, FileText,
  CreditCard, Syringe, ChevronRight
} from 'lucide-react';

const DashboardPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: statsData, isLoading: statsLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: () => analyticsAPI.getDashboardStats().then(res => res.data),
    refetchInterval: 60000,
  });

  const { data: todayData } = useQuery({
    queryKey: ['today-appointments'],
    queryFn: () => analyticsAPI.getTodayAppointments().then(res => res.data),
  });

  const { data: activityData } = useQuery({
    queryKey: ['recent-activity'],
    queryFn: () => analyticsAPI.getRecentActivity().then(res => res.data),
  });

  const { data: revenueData } = useQuery({
    queryKey: ['monthly-revenue'],
    queryFn: () => analyticsAPI.getMonthlyRevenue().then(res => res.data),
  });

  const stats = statsData?.stats || {};
  const todayAppointments = todayData?.appointments || [];
  const activity = activityData?.activity || [];
  const months = revenueData?.months || [];

  const maxRevenue = Math.max(...months.map(m => m.revenue), 1);

  const statCards = [
    { label: 'RDV aujourd\'hui', value: stats.todayAppointments || 0, icon: Calendar, color: '#B8704F', path: '/appointments' },
    { label: 'Patients actifs', value: stats.activePatients || 0, icon: Users, color: '#2563eb', path: '/patients' },
    { label: 'Messages', value: stats.unreadMessages || 0, icon: MessageCircle, color: '#059669', path: '/messages' },
    { label: 'Stock faible', value: stats.lowStockItems || 0, icon: Package, color: stats.lowStockItems > 0 ? '#dc2626' : '#6b7280', path: '/inventory' },
  ];

  const quickStats = [
    { label: 'CA du mois', value: `${(stats.monthRevenue || 0).toFixed(0)} EUR`, icon: TrendingUp, color: '#059669' },
    { label: 'RDV ce mois', value: stats.monthAppointments || 0, icon: Calendar, color: '#7c3aed' },
    { label: 'Factures en attente', value: stats.pendingInvoices || 0, icon: CreditCard, color: '#f59e0b' },
    { label: 'Vaccins à venir', value: stats.upcomingVaccinations || 0, icon: Syringe, color: '#0ea5e9' },
  ];

  const typeEmoji = {
    CONSULTATION: '🩺', VACCINATION: '💉', SURGERY: '🔪',
    FOLLOWUP: '🔄', EMERGENCY: '🚨', GROOMING: '✂️', OTHER: '📋',
  };

  const statusColors = {
    PENDING: '#f59e0b', CONFIRMED: '#2563eb', COMPLETED: '#16a34a', CANCELLED: '#dc2626',
  };

  const styles = {
    card: {
      background: '#fff',
      borderRadius: '18px',
      padding: '1.5rem',
      boxShadow: '0 2px 15px rgba(184, 112, 79, 0.06)',
      border: '1px solid rgba(184, 112, 79, 0.08)',
    },
  };

  if (statsLoading) return <DashboardSkeleton />;

  return (
    <div style={{ animation: 'fadeIn 0.4s ease' }}>
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{
          fontFamily: "'Fraunces', serif",
          fontSize: '2.2rem',
          marginBottom: '0.4rem',
          color: '#3E2723',
          fontWeight: 700,
        }}>
          Bonjour, {user?.firstName} !
        </h1>
        <p style={{ color: '#78716C', fontSize: '1rem' }}>
          {new Date().toLocaleDateString('fr-FR', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
          })}
          {user?.clinic && ` | ${user.clinic.name}`}
        </p>
      </div>

      {/* Main Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '1rem',
        marginBottom: '1.5rem',
      }}>
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              style={{
                ...styles.card,
                borderLeft: `4px solid ${stat.color}`,
                cursor: 'pointer',
                transition: 'all 0.3s',
              }}
              onClick={() => navigate(stat.path)}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ color: '#78716C', fontSize: '0.8rem', marginBottom: '0.4rem' }}>
                    {stat.label}
                  </div>
                  <div style={{ fontSize: '2rem', fontWeight: 700, color: stat.color }}>
                    {stat.value}
                  </div>
                </div>
                <div style={{
                  background: `${stat.color}15`,
                  padding: '0.85rem',
                  borderRadius: '14px',
                  color: stat.color,
                }}>
                  <Icon size={22} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Secondary stats row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '1rem',
        marginBottom: '1.5rem',
      }}>
        {quickStats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} style={{
              ...styles.card,
              padding: '1rem 1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
            }}>
              <div style={{
                width: '36px', height: '36px', borderRadius: '10px',
                background: `${stat.color}15`, display: 'flex',
                alignItems: 'center', justifyContent: 'center',
              }}>
                <Icon size={18} color={stat.color} />
              </div>
              <div>
                <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#3E2723' }}>{stat.value}</div>
                <div style={{ fontSize: '0.75rem', color: '#78716C' }}>{stat.label}</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main content grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))',
        gap: '1.5rem',
      }}>
        {/* Today's appointments */}
        <div style={styles.card}>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            marginBottom: '1.25rem',
          }}>
            <h2 style={{ fontSize: '1.15rem', color: '#3E2723', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Calendar size={20} color="#B8704F" />
              RDV aujourd'hui
            </h2>
            <button
              onClick={() => navigate('/appointments')}
              style={{
                background: 'none', border: 'none', color: '#B8704F',
                fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: '0.25rem',
              }}
            >
              Voir tout <ChevronRight size={16} />
            </button>
          </div>

          {todayAppointments.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#78716C' }}>
              <Calendar size={32} style={{ marginBottom: '0.5rem', opacity: 0.4 }} />
              <p style={{ fontSize: '0.9rem' }}>Aucun RDV aujourd'hui</p>
            </div>
          ) : (
            todayAppointments.map(appt => (
              <div key={appt.id} style={{
                display: 'flex', alignItems: 'center', gap: '0.75rem',
                padding: '0.65rem 0',
                borderBottom: '1px solid rgba(184, 112, 79, 0.06)',
              }}>
                <div style={{ fontSize: '1.5rem' }}>
                  {typeEmoji[appt.type] || '📋'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', color: '#3E2723' }}>
                    {appt.animal?.name} - {appt.type}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#78716C' }}>
                    {new Date(appt.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    {appt.veterinarian && ` | Dr. ${appt.veterinarian.lastName}`}
                  </div>
                </div>
                <div style={{
                  width: '8px', height: '8px', borderRadius: '50%',
                  background: statusColors[appt.status] || '#6b7280',
                }} />
              </div>
            ))
          )}
        </div>

        {/* Revenue chart */}
        <div style={styles.card}>
          <h2 style={{
            fontSize: '1.15rem', color: '#3E2723', fontWeight: 700,
            marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem',
          }}>
            <TrendingUp size={20} color="#059669" />
            Chiffre d'affaires
          </h2>

          {months.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#78716C' }}>
              <TrendingUp size={32} style={{ marginBottom: '0.5rem', opacity: 0.4 }} />
              <p style={{ fontSize: '0.9rem' }}>Pas de données</p>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem', height: '160px', paddingTop: '1rem' }}>
              {months.map((m, i) => (
                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.4rem' }}>
                  <div style={{ fontSize: '0.7rem', color: '#3E2723', fontWeight: 600 }}>
                    {m.revenue > 0 ? `${m.revenue.toFixed(0)}` : ''}
                  </div>
                  <div style={{
                    width: '100%', maxWidth: '40px',
                    height: `${Math.max((m.revenue / maxRevenue) * 120, 4)}px`,
                    background: i === months.length - 1
                      ? 'linear-gradient(135deg, #B8704F 0%, #D4956C 100%)'
                      : 'linear-gradient(135deg, #F5E6D3 0%, #FFF8F0 100%)',
                    borderRadius: '6px 6px 0 0',
                    transition: 'height 0.5s ease',
                  }} />
                  <div style={{ fontSize: '0.65rem', color: '#78716C' }}>{m.month}</div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent activity */}
        <div style={{ ...styles.card, gridColumn: '1 / -1' }}>
          <h2 style={{
            fontSize: '1.15rem', color: '#3E2723', fontWeight: 700,
            marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem',
          }}>
            <Activity size={20} color="#7c3aed" />
            Activité récente
          </h2>

          {activity.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#78716C' }}>
              <Activity size={32} style={{ marginBottom: '0.5rem', opacity: 0.4 }} />
              <p style={{ fontSize: '0.9rem' }}>Aucune activité récente</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.5rem' }}>
              {activity.slice(0, 10).map((item, i) => {
                const iconMap = { appointment: Calendar, consultation: FileText, invoice: CreditCard };
                const colorMap = { appointment: '#B8704F', consultation: '#2563eb', invoice: '#059669' };
                const Icon = iconMap[item.type] || Activity;
                const color = colorMap[item.type] || '#6b7280';

                return (
                  <div key={i} style={{
                    display: 'flex', alignItems: 'center', gap: '0.6rem',
                    padding: '0.5rem 0.75rem', borderRadius: '10px',
                    transition: 'background 0.2s',
                  }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#FFF8F0'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <div style={{
                      width: '30px', height: '30px', borderRadius: '8px',
                      background: `${color}12`, display: 'flex',
                      alignItems: 'center', justifyContent: 'center',
                    }}>
                      <Icon size={14} color={color} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: '0.8rem', color: '#3E2723',
                        whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                      }}>
                        {item.description}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: '#78716C' }}>
                        {new Date(item.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
