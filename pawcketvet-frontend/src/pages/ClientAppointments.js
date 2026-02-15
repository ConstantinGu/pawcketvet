import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { appointmentsAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';
import {
  Calendar, Clock, Plus, CheckCircle, XCircle, AlertCircle, ChevronRight
} from 'lucide-react';
import { ListItemSkeleton } from '../components/LoadingSkeleton';

const ClientAppointments = () => {
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');

  const { data, isLoading } = useQuery({
    queryKey: ['my-appointments'],
    queryFn: () => appointmentsAPI.getAll().then(res => res.data),
  });

  const appointments = data?.appointments || [];

  const filtered = filter === 'all'
    ? appointments
    : appointments.filter(a => {
        if (filter === 'upcoming') return ['PENDING', 'CONFIRMED'].includes(a.status);
        if (filter === 'past') return ['COMPLETED', 'CANCELLED', 'NOSHOW'].includes(a.status);
        return a.status === filter;
      });

  const statusConfig = {
    PENDING: { label: 'En attente', color: '#f59e0b', bg: '#fef3c7', icon: Clock },
    CONFIRMED: { label: 'Confirmé', color: '#2563eb', bg: '#dbeafe', icon: CheckCircle },
    COMPLETED: { label: 'Terminé', color: '#16a34a', bg: '#dcfce7', icon: CheckCircle },
    CANCELLED: { label: 'Annulé', color: '#dc2626', bg: '#fef2f2', icon: XCircle },
    NOSHOW: { label: 'Absent', color: '#9333ea', bg: '#f3e8ff', icon: AlertCircle },
  };

  const typeLabels = {
    CONSULTATION: 'Consultation',
    VACCINATION: 'Vaccination',
    SURGERY: 'Chirurgie',
    FOLLOWUP: 'Suivi',
    EMERGENCY: 'Urgence',
    GROOMING: 'Toilettage',
    OTHER: 'Autre',
  };

  const speciesEmoji = {
    DOG: '🐕', CAT: '🐈', RABBIT: '🐇', BIRD: '🐦',
    RODENT: '🐹', REPTILE: '🦎', OTHER: '🐾',
  };

  const styles = {
    title: {
      fontFamily: "'Fraunces', serif",
      fontSize: '2.5rem',
      marginBottom: '0.5rem',
      background: 'linear-gradient(135deg, #B8704F 0%, #D4956C 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      fontWeight: 700,
    },
    subtitle: { color: '#A1887F', fontSize: '1.1rem', marginBottom: '2rem' },
    filterBar: {
      display: 'flex',
      gap: '0.5rem',
      marginBottom: '2rem',
      flexWrap: 'wrap',
    },
    filterBtn: {
      padding: '0.6rem 1.2rem',
      borderRadius: '12px',
      border: '2px solid rgba(184, 112, 79, 0.15)',
      cursor: 'pointer',
      fontSize: '0.9rem',
      fontWeight: 500,
      transition: 'all 0.3s',
      background: '#fff',
      color: '#3E2723',
    },
    filterBtnActive: {
      padding: '0.6rem 1.2rem',
      borderRadius: '12px',
      border: 'none',
      cursor: 'pointer',
      fontSize: '0.9rem',
      fontWeight: 600,
      transition: 'all 0.3s',
      background: 'linear-gradient(135deg, #B8704F 0%, #D4956C 100%)',
      color: '#fff',
    },
    card: {
      background: '#fff',
      borderRadius: '20px',
      padding: '1.5rem 2rem',
      marginBottom: '1rem',
      boxShadow: '0 4px 20px rgba(184, 112, 79, 0.08)',
      border: '1px solid rgba(184, 112, 79, 0.06)',
      display: 'flex',
      alignItems: 'center',
      gap: '1.5rem',
      transition: 'all 0.3s',
      cursor: 'pointer',
    },
    newBtn: {
      background: 'linear-gradient(135deg, #B8704F 0%, #D4956C 100%)',
      color: '#fff',
      border: 'none',
      borderRadius: '16px',
      padding: '1rem 2rem',
      fontSize: '1rem',
      fontWeight: 600,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      boxShadow: '0 4px 15px rgba(184, 112, 79, 0.25)',
      transition: 'all 0.3s',
    },
  };

  if (isLoading) return <ListItemSkeleton count={5} />;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 style={styles.title}>Mes rendez-vous</h1>
          <p style={styles.subtitle}>
            {appointments.length} rendez-vous au total
          </p>
        </div>
        <button
          onClick={() => navigate('/client/book-appointment')}
          style={styles.newBtn}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          <Plus size={20} />
          Nouveau RDV
        </button>
      </div>

      {/* Filters */}
      <div style={styles.filterBar}>
        {[
          { key: 'all', label: 'Tous' },
          { key: 'upcoming', label: 'À venir' },
          { key: 'past', label: 'Passés' },
          { key: 'CANCELLED', label: 'Annulés' },
        ].map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            style={filter === f.key ? styles.filterBtnActive : styles.filterBtn}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Appointments list */}
      {filtered.length === 0 ? (
        <div style={{
          background: '#fff',
          borderRadius: '24px',
          padding: '3rem',
          textAlign: 'center',
          boxShadow: '0 4px 20px rgba(184, 112, 79, 0.08)',
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📅</div>
          <h3 style={{ color: '#3E2723', marginBottom: '0.5rem' }}>Aucun rendez-vous</h3>
          <p style={{ color: '#A1887F' }}>
            {filter === 'all'
              ? 'Vous n\'avez pas encore de rendez-vous'
              : 'Aucun rendez-vous dans cette catégorie'}
          </p>
        </div>
      ) : (
        filtered.map(appointment => {
          const status = statusConfig[appointment.status] || statusConfig.PENDING;
          const StatusIcon = status.icon;
          const apptDate = new Date(appointment.date);
          const isPast = apptDate < new Date();

          return (
            <div
              key={appointment.id}
              style={{
                ...styles.card,
                opacity: isPast && appointment.status !== 'COMPLETED' ? 0.7 : 1,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateX(8px)';
                e.currentTarget.style.boxShadow = '0 8px 30px rgba(184, 112, 79, 0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateX(0)';
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(184, 112, 79, 0.08)';
              }}
            >
              {/* Date box */}
              <div style={{
                background: 'linear-gradient(135deg, #FFF8F0 0%, #F5E6D3 100%)',
                borderRadius: '16px',
                padding: '1rem',
                textAlign: 'center',
                minWidth: '80px',
              }}>
                <div style={{ fontSize: '0.8rem', color: '#A1887F', textTransform: 'uppercase' }}>
                  {apptDate.toLocaleDateString('fr-FR', { weekday: 'short' })}
                </div>
                <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#B8704F' }}>
                  {apptDate.getDate()}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#A1887F' }}>
                  {apptDate.toLocaleDateString('fr-FR', { month: 'short' })}
                </div>
              </div>

              {/* Animal emoji */}
              <div style={{ fontSize: '2.5rem' }}>
                {speciesEmoji[appointment.animal?.species] || '🐾'}
              </div>

              {/* Details */}
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                  <span style={{ fontWeight: 700, fontSize: '1.1rem', color: '#3E2723' }}>
                    {appointment.animal?.name || 'Animal'}
                  </span>
                  <span style={{
                    background: status.bg,
                    color: status.color,
                    padding: '0.25rem 0.75rem',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.3rem',
                  }}>
                    <StatusIcon size={14} />
                    {status.label}
                  </span>
                </div>
                <div style={{ color: '#6D4C41', fontSize: '0.9rem', marginBottom: '0.25rem' }}>
                  {typeLabels[appointment.type] || appointment.type}
                  {appointment.reason && ` - ${appointment.reason}`}
                </div>
                <div style={{ color: '#A1887F', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Clock size={14} />
                  {apptDate.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  {' - '}
                  {appointment.duration || 30} min
                  {appointment.veterinarian && ` | Dr. ${appointment.veterinarian.lastName}`}
                </div>
              </div>

              <ChevronRight size={20} color="#A1887F" />
            </div>
          );
        })
      )}
    </div>
  );
};

export default ClientAppointments;
