import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { analyticsAPI } from '../services/api';
import { DashboardSkeleton } from '../components/LoadingSkeleton';
import {
  BarChart3, TrendingUp, Users, Calendar, CreditCard,
  Activity, Clock, Star, Package, AlertTriangle
} from 'lucide-react';

const AnalyticsPage = () => {
  const { data: stats, isLoading: loadingStats } = useQuery({
    queryKey: ['analytics-dashboard'],
    queryFn: () => analyticsAPI.getDashboardStats().then(r => r.data),
  });

  const { data: revenue, isLoading: loadingRevenue } = useQuery({
    queryKey: ['analytics-revenue'],
    queryFn: () => analyticsAPI.getMonthlyRevenue().then(r => r.data),
  });

  const { data: todayData } = useQuery({
    queryKey: ['analytics-today'],
    queryFn: () => analyticsAPI.getTodayAppointments().then(r => r.data),
  });

  const { data: activity } = useQuery({
    queryKey: ['analytics-activity'],
    queryFn: () => analyticsAPI.getRecentActivity().then(r => r.data),
  });

  const isLoading = loadingStats || loadingRevenue;

  const styles = {
    section: {
      background: '#fff',
      borderRadius: '16px',
      padding: '1.5rem',
      boxShadow: '0 2px 12px rgba(184,112,79,0.06)',
      border: '1px solid rgba(184,112,79,0.08)',
    },
    sectionTitle: {
      fontFamily: "'Fraunces', serif",
      fontSize: '1.15rem',
      color: '#3E2723',
      marginBottom: '1rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
    },
  };

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  const statCards = [
    { label: 'Patients', value: stats?.totalAnimals ?? '-', icon: Users, color: '#B8704F', change: stats?.newAnimalsThisMonth ? `+${stats.newAnimalsThisMonth} ce mois` : null },
    { label: "RDV aujourd'hui", value: todayData?.appointments?.length ?? stats?.todayAppointments ?? '-', icon: Calendar, color: '#4CAF50' },
    { label: 'RDV ce mois', value: stats?.monthlyAppointments ?? '-', icon: Activity, color: '#2196F3' },
    { label: 'Revenus du mois', value: revenue?.currentMonth != null ? `${Number(revenue.currentMonth).toFixed(0)} EUR` : '-', icon: CreditCard, color: '#FF9800' },
    { label: 'Factures en attente', value: stats?.pendingInvoices ?? '-', icon: AlertTriangle, color: '#dc2626' },
    { label: 'Alertes stock', value: stats?.stockAlerts ?? '-', icon: Package, color: '#9C27B0' },
  ];

  const monthNames = ['Jan', 'Fev', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aou', 'Sep', 'Oct', 'Nov', 'Dec'];
  const revenueData = revenue?.monthly || [];
  const maxRevenue = Math.max(...revenueData.map(r => r.total || 0), 1);

  const appointmentsByType = stats?.appointmentsByType || [];
  const typeColors = {
    CONSULTATION: '#B8704F',
    VACCINATION: '#4CAF50',
    SURGERY: '#dc2626',
    FOLLOWUP: '#2196F3',
    EMERGENCY: '#FF9800',
    GROOMING: '#9C27B0',
  };
  const typeLabels = {
    CONSULTATION: 'Consultations',
    VACCINATION: 'Vaccinations',
    SURGERY: 'Chirurgie',
    FOLLOWUP: 'Suivis',
    EMERGENCY: 'Urgences',
    GROOMING: 'Toilettage',
  };

  const recentActivities = activity?.activities || activity || [];

  return (
    <>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: '2.5rem', marginBottom: '0.5rem', color: '#3E2723', fontWeight: 700 }}>
          Statistiques
        </h1>
        <p style={{ color: '#A1887F', fontSize: '1.05rem' }}>
          Vue d'ensemble de l'activite de votre clinique
        </p>
      </div>

      {/* KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {statCards.map(card => {
          const Icon = card.icon;
          return (
            <div key={card.label} style={{
              ...styles.section,
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#A1887F', fontSize: '0.85rem', fontWeight: 600 }}>{card.label}</span>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '10px',
                  background: `${card.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Icon size={18} color={card.color} />
                </div>
              </div>
              <span style={{ fontSize: '1.8rem', fontWeight: 700, color: '#3E2723' }}>{card.value}</span>
              {card.change && (
                <span style={{ fontSize: '0.8rem', color: '#4CAF50', fontWeight: 600 }}>
                  {card.change}
                </span>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '1.5rem' }}>
        {/* Revenue Chart */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>
            <TrendingUp size={20} color="#B8704F" /> Revenus mensuels
          </h3>
          {revenueData.length > 0 ? (
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem', height: '200px', paddingTop: '1rem' }}>
              {revenueData.slice(-12).map((item, i) => {
                const height = maxRevenue > 0 ? (item.total / maxRevenue) * 170 : 0;
                const monthIndex = item.month ? item.month - 1 : i;
                return (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.25rem' }}>
                    <span style={{ fontSize: '0.7rem', color: '#6D4C41', fontWeight: 600 }}>
                      {item.total ? `${Number(item.total).toFixed(0)}` : '0'}
                    </span>
                    <div style={{
                      width: '100%',
                      height: `${Math.max(height, 4)}px`,
                      background: 'linear-gradient(180deg, #B8704F 0%, #D4956C 100%)',
                      borderRadius: '6px 6px 2px 2px',
                      transition: 'height 0.3s ease',
                    }} />
                    <span style={{ fontSize: '0.7rem', color: '#A1887F', fontWeight: 500 }}>
                      {monthNames[monthIndex] || ''}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#A1887F' }}>
              Pas encore de donnees de revenus
            </div>
          )}
        </div>

        {/* Appointments by Type */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>
            <BarChart3 size={20} color="#B8704F" /> RDV par type
          </h3>
          {appointmentsByType.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {appointmentsByType.map((item) => {
                const total = appointmentsByType.reduce((s, t) => s + (t._count || t.count || 0), 0);
                const count = item._count || item.count || 0;
                const pct = total > 0 ? (count / total) * 100 : 0;
                return (
                  <div key={item.type}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#3E2723' }}>
                        {typeLabels[item.type] || item.type}
                      </span>
                      <span style={{ fontSize: '0.85rem', color: '#A1887F' }}>{count}</span>
                    </div>
                    <div style={{ background: '#F5E6D3', borderRadius: '4px', height: '8px', overflow: 'hidden' }}>
                      <div style={{
                        background: typeColors[item.type] || '#B8704F',
                        height: '100%',
                        width: `${pct}%`,
                        borderRadius: '4px',
                        transition: 'width 0.3s',
                      }} />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#A1887F', fontSize: '0.9rem' }}>
              Pas encore de donnees
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* Today's Schedule */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>
            <Clock size={20} color="#B8704F" /> Planning du jour
          </h3>
          {todayData?.appointments?.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {todayData.appointments.slice(0, 8).map((apt) => (
                <div key={apt.id} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  padding: '0.75rem',
                  background: '#FFF8F0',
                  borderRadius: '10px',
                }}>
                  <span style={{
                    fontWeight: 700,
                    color: '#B8704F',
                    fontSize: '0.85rem',
                    minWidth: '50px',
                  }}>
                    {new Date(apt.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <div style={{ flex: 1 }}>
                    <span style={{ fontWeight: 600, color: '#3E2723', fontSize: '0.9rem' }}>
                      {apt.animal?.name || 'Patient'}
                    </span>
                    <span style={{ color: '#A1887F', fontSize: '0.8rem', marginLeft: '0.5rem' }}>
                      {apt.type || 'Consultation'}
                    </span>
                  </div>
                  <span style={{
                    fontSize: '0.75rem',
                    fontWeight: 600,
                    padding: '0.25rem 0.5rem',
                    borderRadius: '6px',
                    background: apt.status === 'CONFIRMED' ? '#D1FAE5' : apt.status === 'COMPLETED' ? '#E0E7FF' : '#FEF3C7',
                    color: apt.status === 'CONFIRMED' ? '#059669' : apt.status === 'COMPLETED' ? '#4338CA' : '#D97706',
                  }}>
                    {apt.status === 'CONFIRMED' ? 'Confirme' : apt.status === 'COMPLETED' ? 'Termine' : apt.status || 'En attente'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#A1887F', fontSize: '0.9rem' }}>
              Aucun rendez-vous aujourd'hui
            </div>
          )}
        </div>

        {/* Recent Activity */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>
            <Activity size={20} color="#B8704F" /> Activite recente
          </h3>
          {Array.isArray(recentActivities) && recentActivities.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {recentActivities.slice(0, 8).map((act, i) => (
                <div key={act.id || i} style={{
                  display: 'flex',
                  gap: '0.75rem',
                  alignItems: 'flex-start',
                  padding: '0.5rem 0',
                  borderBottom: i < recentActivities.length - 1 ? '1px solid #F5E6D3' : 'none',
                }}>
                  <div style={{
                    width: '8px', height: '8px', borderRadius: '50%',
                    background: '#B8704F', flexShrink: 0, marginTop: '0.4rem',
                  }} />
                  <div>
                    <p style={{ fontSize: '0.9rem', color: '#3E2723', margin: 0, fontWeight: 500 }}>
                      {act.description || act.title || act.message || 'Activite'}
                    </p>
                    <p style={{ fontSize: '0.75rem', color: '#A1887F', margin: 0, marginTop: '0.15rem' }}>
                      {act.createdAt ? new Date(act.createdAt).toLocaleDateString('fr-FR', {
                        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                      }) : ''}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '2rem', color: '#A1887F', fontSize: '0.9rem' }}>
              Pas d'activite recente
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AnalyticsPage;
