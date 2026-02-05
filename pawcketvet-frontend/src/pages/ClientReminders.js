import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { remindersAPI, ownersAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';
import {
  Bell, Shield, Calendar, AlertTriangle, CheckCircle, Clock, ChevronRight
} from 'lucide-react';

const ClientReminders = () => {
  const navigate = useNavigate();

  const { data: remindersData, isLoading: loadingReminders } = useQuery({
    queryKey: ['my-reminders'],
    queryFn: () => remindersAPI.getMy().then(res => res.data),
  });

  const { data: profileData, isLoading: loadingProfile } = useQuery({
    queryKey: ['my-profile'],
    queryFn: () => ownersAPI.getMyProfile().then(res => res.data),
  });

  const reminders = remindersData?.reminders || [];
  const upcomingVaccinations = remindersData?.upcomingVaccinations || [];
  const animals = profileData?.owner?.animals || [];

  const isLoading = loadingReminders || loadingProfile;

  // Build upcoming appointments from animals data
  const upcomingAppointments = animals.flatMap(animal =>
    (animal.appointments || [])
      .filter(a => new Date(a.date) > new Date() && ['PENDING', 'CONFIRMED'].includes(a.status))
      .map(a => ({
        ...a,
        animalName: animal.name,
        animalSpecies: animal.species,
      }))
  ).sort((a, b) => new Date(a.date) - new Date(b.date));

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
    section: { marginBottom: '2.5rem' },
    sectionTitle: {
      fontFamily: "'Fraunces', serif",
      fontSize: '1.5rem',
      color: '#3E2723',
      marginBottom: '1rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
    },
    card: {
      background: '#fff',
      borderRadius: '18px',
      padding: '1.25rem 1.5rem',
      marginBottom: '0.75rem',
      boxShadow: '0 2px 15px rgba(184, 112, 79, 0.06)',
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      transition: 'all 0.3s',
    },
    urgentCard: {
      background: 'linear-gradient(135deg, #fef2f2 0%, #fff 100%)',
      borderRadius: '18px',
      padding: '1.25rem 1.5rem',
      marginBottom: '0.75rem',
      boxShadow: '0 2px 15px rgba(220, 38, 38, 0.08)',
      border: '2px solid rgba(220, 38, 38, 0.15)',
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      transition: 'all 0.3s',
      cursor: 'pointer',
    },
    badge: {
      padding: '0.3rem 0.75rem',
      borderRadius: '8px',
      fontSize: '0.8rem',
      fontWeight: 600,
    },
    emptyState: {
      background: '#fff',
      borderRadius: '20px',
      padding: '2.5rem',
      textAlign: 'center',
      boxShadow: '0 4px 20px rgba(184, 112, 79, 0.08)',
    },
  };

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔔</div>
        <div style={{ color: '#B8704F', fontSize: '1.1rem' }}>Chargement des rappels...</div>
      </div>
    );
  }

  const getDaysUntil = (date) => {
    const diff = Math.ceil((new Date(date) - new Date()) / (1000 * 60 * 60 * 24));
    if (diff === 0) return "Aujourd'hui";
    if (diff === 1) return 'Demain';
    if (diff < 0) return `Il y a ${Math.abs(diff)} jour${Math.abs(diff) > 1 ? 's' : ''}`;
    if (diff < 7) return `Dans ${diff} jour${diff > 1 ? 's' : ''}`;
    if (diff < 30) return `Dans ${Math.floor(diff / 7)} semaine${Math.floor(diff / 7) > 1 ? 's' : ''}`;
    return `Dans ${Math.floor(diff / 30)} mois`;
  };

  const totalReminders = upcomingVaccinations.length + upcomingAppointments.length + reminders.length;

  return (
    <div>
      <h1 style={styles.title}>Rappels & Alertes</h1>
      <p style={styles.subtitle}>
        {totalReminders} rappel{totalReminders !== 1 ? 's' : ''} actif{totalReminders !== 1 ? 's' : ''}
      </p>

      {/* Vaccinations section */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>
          <Shield size={24} color="#059669" />
          Vaccinations a venir
        </h2>

        {upcomingVaccinations.length === 0 ? (
          <div style={styles.emptyState}>
            <CheckCircle size={40} color="#059669" style={{ marginBottom: '0.5rem' }} />
            <p style={{ color: '#059669', fontWeight: 600 }}>Tous les vaccins sont a jour !</p>
          </div>
        ) : (
          upcomingVaccinations.map((vacc, idx) => {
            const daysUntil = Math.ceil((new Date(vacc.scheduledFor) - new Date()) / (1000 * 60 * 60 * 24));
            const isUrgent = daysUntil <= 7;

            return (
              <div
                key={idx}
                style={isUrgent ? styles.urgentCard : styles.card}
                onClick={() => navigate('/client/book-appointment')}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateX(4px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateX(0)';
                }}
              >
                <div style={{
                  width: '45px', height: '45px', borderRadius: '12px',
                  background: isUrgent ? '#fef2f2' : '#dcfce7',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  {isUrgent
                    ? <AlertTriangle size={22} color="#dc2626" />
                    : <Shield size={22} color="#059669" />}
                </div>

                <div style={{ fontSize: '1.8rem' }}>
                  {speciesEmoji[vacc.animalSpecies] || '🐾'}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, color: '#3E2723', marginBottom: '0.2rem' }}>
                    {vacc.vaccineName} - {vacc.animalName}
                  </div>
                  <div style={{ color: '#A1887F', fontSize: '0.85rem' }}>
                    {new Date(vacc.scheduledFor).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </div>
                </div>

                <span style={{
                  ...styles.badge,
                  background: isUrgent ? '#fef2f2' : '#dcfce7',
                  color: isUrgent ? '#dc2626' : '#059669',
                }}>
                  {getDaysUntil(vacc.scheduledFor)}
                </span>

                <ChevronRight size={18} color="#A1887F" />
              </div>
            );
          })
        )}
      </div>

      {/* Appointments section */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>
          <Calendar size={24} color="#2563eb" />
          Prochains rendez-vous
        </h2>

        {upcomingAppointments.length === 0 ? (
          <div style={styles.emptyState}>
            <Calendar size={40} color="#A1887F" style={{ marginBottom: '0.5rem' }} />
            <p style={{ color: '#A1887F' }}>Aucun rendez-vous a venir</p>
            <button
              onClick={() => navigate('/client/book-appointment')}
              style={{
                marginTop: '1rem',
                background: 'linear-gradient(135deg, #B8704F 0%, #D4956C 100%)',
                color: '#fff',
                border: 'none',
                borderRadius: '12px',
                padding: '0.75rem 1.5rem',
                fontSize: '0.9rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Prendre rendez-vous
            </button>
          </div>
        ) : (
          upcomingAppointments.map(appt => (
            <div
              key={appt.id}
              style={styles.card}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateX(4px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateX(0)'}
            >
              <div style={{
                width: '45px', height: '45px', borderRadius: '12px',
                background: '#dbeafe',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <Calendar size={22} color="#2563eb" />
              </div>

              <div style={{ fontSize: '1.8rem' }}>
                {speciesEmoji[appt.animalSpecies] || '🐾'}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, color: '#3E2723', marginBottom: '0.2rem' }}>
                  {appt.animalName} - {appt.type}
                </div>
                <div style={{ color: '#A1887F', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Clock size={14} />
                  {new Date(appt.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                  {' a '}
                  {new Date(appt.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>

              <span style={{
                ...styles.badge,
                background: '#dbeafe',
                color: '#2563eb',
              }}>
                {getDaysUntil(appt.date)}
              </span>
            </div>
          ))
        )}
      </div>

      {/* General reminders */}
      {reminders.length > 0 && (
        <div style={styles.section}>
          <h2 style={styles.sectionTitle}>
            <Bell size={24} color="#B8704F" />
            Autres rappels
          </h2>
          {reminders.map(reminder => (
            <div key={reminder.id} style={styles.card}>
              <div style={{
                width: '45px', height: '45px', borderRadius: '12px',
                background: '#FFF8F0',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <Bell size={22} color="#B8704F" />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, color: '#3E2723', marginBottom: '0.2rem' }}>
                  {reminder.subject || reminder.type}
                </div>
                <div style={{ color: '#6D4C41', fontSize: '0.9rem' }}>
                  {reminder.message}
                </div>
                <div style={{ color: '#A1887F', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                  {new Date(reminder.scheduledFor).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                </div>
              </div>
              <span style={{
                ...styles.badge,
                background: '#FFF8F0',
                color: '#B8704F',
              }}>
                {getDaysUntil(reminder.scheduledFor)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ClientReminders;
