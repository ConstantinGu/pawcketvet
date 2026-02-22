import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { animalsAPI, appointmentsAPI, ownersAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { DashboardSkeleton } from '../components/LoadingSkeleton';
import {
  Calendar, FileText, MessageCircle, Bell, Heart,
  Activity, AlertCircle, ChevronRight, Clock, AlertTriangle, Phone, PlusCircle
} from 'lucide-react';

const speciesEmoji = {
  DOG: '🐕', CAT: '🐈', RABBIT: '🐇', BIRD: '🐦',
  RODENT: '🐹', REPTILE: '🦎', OTHER: '🐾',
};

const ClientDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const { data: animalsData, isLoading } = useQuery({
    queryKey: ['my-animals'],
    queryFn: () => animalsAPI.getAll().then(res => res.data),
  });

  const { data: appointmentsData, isLoading: apptLoading } = useQuery({
    queryKey: ['my-appointments'],
    queryFn: () => appointmentsAPI.getAll().then(res => res.data),
  });

  const { data: profileData } = useQuery({
    queryKey: ['my-profile'],
    queryFn: () => ownersAPI.getMyProfile().then(res => res.data),
  });

  const overdueInvoices = (profileData?.owner?.invoices || []).filter(i => i.status === 'OVERDUE');
  const pendingTotal = (profileData?.owner?.invoices || [])
    .filter(i => ['PENDING', 'PARTIAL', 'OVERDUE'].includes(i.status))
    .reduce((sum, i) => sum + (i.total - (i.paidAmount || 0)), 0);

  const styles = {
    container: {
      animation: 'fadeIn 0.5s ease',
    },
    header: {
      maxWidth: '1200px',
      margin: '0 auto 3rem',
      textAlign: 'center',
    },
    welcomeTitle: {
      fontFamily: "'Fraunces', serif",
      fontSize: '3.5rem',
      marginBottom: '1rem',
      background: 'linear-gradient(135deg, #B8704F 0%, #D4956C 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      fontWeight: 700,
      letterSpacing: '-0.02em',
    },
    subtitle: {
      fontSize: '1.3rem',
      color: '#6D4C41',
      marginBottom: '0.5rem',
    },
    clinicBadge: {
      display: 'inline-block',
      background: 'linear-gradient(135deg, #B8704F 0%, #D4956C 100%)',
      color: '#fff',
      padding: '0.75rem 2rem',
      borderRadius: '50px',
      fontSize: '1.1rem',
      fontWeight: 600,
      boxShadow: '0 4px 20px rgba(184, 112, 79, 0.3)',
    },
    grid: {
      maxWidth: '1200px',
      margin: '0 auto',
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
      gap: '2rem',
    },
    card: {
      background: '#fff',
      borderRadius: '28px',
      padding: '2.5rem',
      boxShadow: '0 8px 40px rgba(184, 112, 79, 0.12)',
      border: '2px solid rgba(184, 112, 79, 0.08)',
      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      cursor: 'pointer',
      position: 'relative',
      overflow: 'hidden',
    },
    cardHeader: {
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      marginBottom: '2rem',
    },
    iconCircle: {
      width: '70px',
      height: '70px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #B8704F 0%, #D4956C 100%)',
      boxShadow: '0 8px 25px rgba(184, 112, 79, 0.25)',
    },
    cardTitle: {
      fontFamily: "'Fraunces', serif",
      fontSize: '1.8rem',
      color: '#3E2723',
      fontWeight: 700,
    },
    animalCard: {
      background: 'linear-gradient(135deg, #fff 0%, #FFF8F0 100%)',
      borderRadius: '24px',
      padding: '2rem',
      marginBottom: '1.5rem',
      border: '2px solid rgba(184, 112, 79, 0.1)',
      transition: 'all 0.3s ease',
    },
    button: {
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
      gap: '0.75rem',
      transition: 'all 0.3s ease',
      boxShadow: '0 4px 15px rgba(184, 112, 79, 0.25)',
      width: '100%',
      justifyContent: 'center',
    },
    alertBanner: {
      background: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
      color: '#fff',
      padding: '1.5rem 2rem',
      borderRadius: '20px',
      marginBottom: '2rem',
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      boxShadow: '0 4px 20px rgba(220, 38, 38, 0.25)',
      animation: 'slideDown 0.5s ease',
    },
  };

  const quickActions = [
    {
      icon: Calendar,
      title: 'Prendre rendez-vous',
      description: 'Réservez une consultation en ligne',
      color: '#B8704F',
      action: () => navigate('/client/book-appointment'),
    },
    {
      icon: FileText,
      title: 'Mes documents',
      description: 'Certificats, ordonnances, factures',
      color: '#2563eb',
      action: () => navigate('/client/documents'),
    },
    {
      icon: MessageCircle,
      title: 'Contacter la clinique',
      description: 'Posez vos questions directement',
      color: '#059669',
      action: () => navigate('/client/messages'),
    },
    {
      icon: Bell,
      title: 'Rappels & Alertes',
      description: 'Vaccins, vermifuges, contrôles',
      color: '#d97706',
      action: () => navigate('/client/reminders'),
    },
  ];

  const animals = animalsData?.animals || [];
  const appointments = appointmentsData?.appointments || [];
  const nextAppointment = appointments.find(a => new Date(a.date) > new Date() && a.status !== 'CANCELLED');

  // Compute urgent vaccination reminders dynamically
  const urgentVaccinations = animals.flatMap(animal =>
    (animal.vaccinations || [])
      .filter(v => v.nextDueDate && new Date(v.nextDueDate) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000))
      .map(v => ({ ...v, animalName: animal.name, animalId: animal.id }))
  );

  if (isLoading && apptLoading) return <DashboardSkeleton />;

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <h1 style={styles.welcomeTitle}>
          Bonjour {user?.firstName} !
        </h1>
        <p style={styles.subtitle}>
          Bienvenue dans votre espace santé pour vos compagnons
        </p>
      </div>

      {/* Vaccination alerts */}
      {urgentVaccinations.length > 0 && (
        <div style={{ maxWidth: '1200px', margin: '0 auto 2rem' }}>
          <div style={styles.alertBanner}>
            <AlertCircle size={28} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.25rem' }}>
                Rappel vaccination
              </div>
              <div style={{ fontSize: '0.95rem' }}>
                {urgentVaccinations[0].animalName} a besoin de son rappel de {urgentVaccinations[0].name}
                {urgentVaccinations[0].nextDueDate && ` avant le ${new Date(urgentVaccinations[0].nextDueDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })}`}
                {urgentVaccinations.length > 1 && ` (+${urgentVaccinations.length - 1} autre${urgentVaccinations.length > 2 ? 's' : ''})`}
              </div>
            </div>
            <button
              onClick={() => navigate(`/client/book-appointment?animalId=${urgentVaccinations[0].animalId}`)}
              style={{
                ...styles.button,
                background: '#fff',
                color: '#dc2626',
                width: 'auto',
                boxShadow: '0 4px 15px rgba(255, 255, 255, 0.3)',
              }}
            >
              Prendre RDV
            </button>
          </div>
        </div>
      )}

      {/* Overdue invoices alert */}
      {overdueInvoices.length > 0 && (
        <div style={{ maxWidth: '1200px', margin: '0 auto 2rem' }}>
          <div
            onClick={() => navigate('/client/payments')}
            style={{
              background: 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)',
              color: '#fff',
              padding: '1.25rem 2rem',
              borderRadius: '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '1rem',
              cursor: 'pointer',
              boxShadow: '0 4px 20px rgba(245, 158, 11, 0.25)',
            }}
          >
            <AlertCircle size={24} />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: '1rem' }}>
                {overdueInvoices.length} facture{overdueInvoices.length > 1 ? 's' : ''} en retard
              </div>
              <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>
                Montant total dû : {pendingTotal.toFixed(2)} € — Cliquez pour voir vos factures
              </div>
            </div>
            <ChevronRight size={20} />
          </div>
        </div>
      )}

      {/* SOS Urgence - always visible */}
      <div style={{ maxWidth: '1200px', margin: '0 auto 2rem' }}>
        <div
          onClick={() => navigate('/client/sos')}
          style={{
            background: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
            color: '#fff',
            padding: '1.25rem 2rem',
            borderRadius: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            cursor: 'pointer',
            boxShadow: '0 4px 20px rgba(220, 38, 38, 0.25)',
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 30px rgba(220, 38, 38, 0.35)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(220, 38, 38, 0.25)'; }}
        >
          <div style={{
            width: '50px', height: '50px', borderRadius: '50%',
            background: 'rgba(255,255,255,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <AlertTriangle size={26} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: '1.15rem', marginBottom: '0.15rem' }}>
              SOS Urgence Vétérinaire
            </div>
            <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>
              Évaluez le niveau d'urgence ou appelez les urgences vétérinaires
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <a
              href="tel:3115"
              onClick={e => e.stopPropagation()}
              style={{
                background: '#fff',
                color: '#dc2626',
                border: 'none',
                borderRadius: '12px',
                padding: '0.6rem 1.25rem',
                fontWeight: 700,
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                textDecoration: 'none',
                whiteSpace: 'nowrap',
              }}
            >
              <Phone size={16} /> 3115
            </a>
            <ChevronRight size={22} />
          </div>
        </div>
      </div>

      {/* Prochain RDV */}
      {nextAppointment && (
        <div style={{ maxWidth: '1200px', margin: '0 auto 2rem' }}>
          <div style={{
            background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
            color: '#fff',
            padding: '2rem',
            borderRadius: '24px',
            boxShadow: '0 8px 30px rgba(5, 150, 105, 0.25)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
              <Calendar size={32} />
              <div>
                <div style={{ fontSize: '1.3rem', fontWeight: 700 }}>
                  Prochain rendez-vous
                </div>
                <div style={{ fontSize: '0.95rem', opacity: 0.9 }}>
                  Vous avez un RDV prévu bientôt
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '1.5rem', fontWeight: 600 }}>
                  {new Date(nextAppointment.date).toLocaleDateString('fr-FR', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                  })}
                </div>
                <div style={{ fontSize: '1.2rem', opacity: 0.9 }}>
                  à {new Date(nextAppointment.date).toLocaleTimeString('fr-FR', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '1.8rem', marginBottom: '0.25rem' }}>
                  {speciesEmoji[nextAppointment.animal?.species] || '🐾'}
                </div>
                <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>
                  {nextAppointment.animal.name}
                </div>
                <div style={{ fontSize: '0.9rem', opacity: 0.9 }}>
                  {nextAppointment.type}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mes compagnons */}
      <div style={{ maxWidth: '1200px', margin: '0 auto 3rem' }}>
        <h2 style={{
          fontFamily: "'Fraunces', serif",
          fontSize: '2.5rem',
          marginBottom: '1.5rem',
          color: '#3E2723',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
        }}>
          <Heart size={32} color="#B8704F" />
          Mes compagnons
        </h2>
        
        {animals.length === 0 && (
          <div
            onClick={() => navigate('/client/my-pets')}
            style={{
              background: 'linear-gradient(135deg, #fff 0%, #FFF8F0 100%)',
              borderRadius: '24px',
              padding: '3rem 2rem',
              textAlign: 'center',
              border: '3px dashed rgba(184, 112, 79, 0.25)',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              marginBottom: '1.5rem',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = '#B8704F';
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 8px 30px rgba(184, 112, 79, 0.15)';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'rgba(184, 112, 79, 0.25)';
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          >
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🐾</div>
            <h3 style={{
              fontFamily: "'Fraunces', serif",
              fontSize: '1.5rem',
              color: '#3E2723',
              marginBottom: '0.75rem',
            }}>
              Ajoutez votre premier compagnon !
            </h3>
            <p style={{ color: '#78716C', fontSize: '1rem', marginBottom: '1.5rem', maxWidth: '400px', margin: '0 auto 1.5rem' }}>
              Commencez par enregistrer vos animaux pour accéder au carnet de santé, prendre des rendez-vous et bien plus.
            </p>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              background: 'linear-gradient(135deg, #B8704F 0%, #D4956C 100%)',
              color: '#fff',
              padding: '0.85rem 2rem',
              borderRadius: '14px',
              fontWeight: 600,
              fontSize: '1rem',
              boxShadow: '0 4px 15px rgba(184, 112, 79, 0.25)',
            }}>
              <PlusCircle size={20} />
              Ajouter un animal
            </div>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {animalsData?.animals?.map((animal) => (
            <div
              key={animal.id}
              style={styles.animalCard}
              onClick={() => navigate(`/client/animal/${animal.id}`)}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px)';
                e.currentTarget.style.boxShadow = '0 12px 40px rgba(184, 112, 79, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1.5rem' }}>
                <div style={{ fontSize: '4rem' }}>
                  {{ DOG: '🐕', CAT: '🐈', RABBIT: '🐇', BIRD: '🐦', RODENT: '🐹', REPTILE: '🦎' }[animal.species] || '🐾'}
                </div>
                <div style={{ flex: 1 }}>
                  <h3 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#3E2723', marginBottom: '0.25rem' }}>
                    {animal.name}
                  </h3>
                  <div style={{ color: '#78716C', fontSize: '1rem' }}>
                    {{ DOG: 'Chien', CAT: 'Chat', RABBIT: 'Lapin', BIRD: 'Oiseau', RODENT: 'Rongeur', REPTILE: 'Reptile' }[animal.species] || 'Autre'} • {animal.breed || 'Race mixte'}
                  </div>
                </div>
                <ChevronRight size={24} color="#B8704F" />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div style={{
                  background: '#fff',
                  padding: '1rem',
                  borderRadius: '12px',
                  textAlign: 'center',
                }}>
                  <div style={{ color: '#78716C', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                    Âge
                  </div>
                  <div style={{ color: '#3E2723', fontSize: '1.2rem', fontWeight: 600 }}>
                    {animal.birthDate
                      ? (() => {
                          const years = Math.floor((new Date() - new Date(animal.birthDate)) / (365.25 * 24 * 60 * 60 * 1000));
                          if (years < 1) {
                            const months = Math.floor((new Date() - new Date(animal.birthDate)) / (30.44 * 24 * 60 * 60 * 1000));
                            return `${months} mois`;
                          }
                          return `${years} an${years > 1 ? 's' : ''}`;
                        })()
                      : 'N/A'}
                  </div>
                </div>
                <div style={{
                  background: '#fff',
                  padding: '1rem',
                  borderRadius: '12px',
                  textAlign: 'center',
                }}>
                  <div style={{ color: '#78716C', fontSize: '0.85rem', marginBottom: '0.25rem' }}>
                    Poids
                  </div>
                  <div style={{ color: '#3E2723', fontSize: '1.2rem', fontWeight: 600 }}>
                    {animal.weight ? `${animal.weight} kg` : 'N/A'}
                  </div>
                </div>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/client/book-appointment?animalId=${animal.id}`);
                }}
                style={{
                  ...styles.button,
                  marginTop: '1.5rem',
                  fontSize: '0.95rem',
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                <Calendar size={18} />
                Prendre un RDV pour {animal.name}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Actions rapides */}
      <div style={styles.grid}>
        {quickActions.map((action, index) => {
          const Icon = action.icon;
          return (
            <div
              key={index}
              style={styles.card}
              onClick={action.action}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
                e.currentTarget.style.boxShadow = '0 12px 50px rgba(184, 112, 79, 0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
                e.currentTarget.style.boxShadow = '0 8px 40px rgba(184, 112, 79, 0.12)';
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  top: -50,
                  right: -50,
                  width: 150,
                  height: 150,
                  background: `${action.color}10`,
                  borderRadius: '50%',
                  filter: 'blur(40px)',
                }}
              />
              
              <div style={styles.cardHeader}>
                <div style={{ ...styles.iconCircle, background: action.color }}>
                  <Icon size={32} color="#fff" />
                </div>
              </div>

              <h3 style={styles.cardTitle}>{action.title}</h3>
              <p style={{ color: '#78716C', fontSize: '1.05rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                {action.description}
              </p>

              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                color: action.color,
                fontWeight: 600,
                fontSize: '1rem',
              }}>
                Accéder
                <ChevronRight size={20} />
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};

export default ClientDashboard;
