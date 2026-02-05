import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { ownersAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';
import {
  Heart, Calendar, ChevronRight, Activity, Shield, Weight
} from 'lucide-react';

const ClientMyPets = () => {
  const navigate = useNavigate();

  const { data, isLoading } = useQuery({
    queryKey: ['my-profile'],
    queryFn: () => ownersAPI.getMyProfile().then(res => res.data),
  });

  const animals = data?.owner?.animals || [];

  const speciesEmoji = {
    DOG: '🐕', CAT: '🐈', RABBIT: '🐇', BIRD: '🐦', RODENT: '🐹', REPTILE: '🦎', OTHER: '🐾',
  };

  const speciesLabel = {
    DOG: 'Chien', CAT: 'Chat', RABBIT: 'Lapin', BIRD: 'Oiseau',
    RODENT: 'Rongeur', REPTILE: 'Reptile', OTHER: 'Autre',
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
    subtitle: {
      color: '#A1887F',
      fontSize: '1.1rem',
      marginBottom: '2rem',
    },
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))',
      gap: '2rem',
    },
    card: {
      background: '#fff',
      borderRadius: '28px',
      padding: '2.5rem',
      boxShadow: '0 8px 40px rgba(184, 112, 79, 0.1)',
      border: '2px solid rgba(184, 112, 79, 0.08)',
      transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
      cursor: 'pointer',
      position: 'relative',
      overflow: 'hidden',
    },
    emoji: {
      fontSize: '5rem',
      marginBottom: '1rem',
    },
    petName: {
      fontFamily: "'Fraunces', serif",
      fontSize: '2rem',
      color: '#3E2723',
      fontWeight: 700,
      marginBottom: '0.25rem',
    },
    petInfo: {
      color: '#A1887F',
      fontSize: '1rem',
      marginBottom: '1.5rem',
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr 1fr',
      gap: '1rem',
      marginBottom: '1.5rem',
    },
    statBox: {
      background: 'linear-gradient(135deg, #FFF8F0 0%, #fff 100%)',
      borderRadius: '16px',
      padding: '1rem',
      textAlign: 'center',
    },
    statLabel: {
      color: '#A1887F',
      fontSize: '0.8rem',
      marginBottom: '0.25rem',
    },
    statValue: {
      color: '#3E2723',
      fontSize: '1.1rem',
      fontWeight: 600,
    },
    actionBtn: {
      background: 'linear-gradient(135deg, #B8704F 0%, #D4956C 100%)',
      color: '#fff',
      border: 'none',
      borderRadius: '16px',
      padding: '1rem 1.5rem',
      fontSize: '0.95rem',
      fontWeight: 600,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      width: '100%',
      justifyContent: 'center',
      transition: 'all 0.3s',
      boxShadow: '0 4px 15px rgba(184, 112, 79, 0.25)',
    },
    vaccinBadge: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.4rem',
      background: '#dcfce7',
      color: '#16a34a',
      padding: '0.4rem 0.8rem',
      borderRadius: '8px',
      fontSize: '0.8rem',
      fontWeight: 600,
      marginRight: '0.5rem',
      marginBottom: '0.5rem',
    },
    vaccinBadgeExpired: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.4rem',
      background: '#fef2f2',
      color: '#dc2626',
      padding: '0.4rem 0.8rem',
      borderRadius: '8px',
      fontSize: '0.8rem',
      fontWeight: 600,
      marginRight: '0.5rem',
      marginBottom: '0.5rem',
    },
  };

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🐾</div>
        <div style={{ color: '#B8704F', fontSize: '1.1rem' }}>Chargement de vos compagnons...</div>
      </div>
    );
  }

  const getAge = (birthDate) => {
    if (!birthDate) return 'N/A';
    const years = Math.floor((new Date() - new Date(birthDate)) / (365.25 * 24 * 60 * 60 * 1000));
    if (years < 1) {
      const months = Math.floor((new Date() - new Date(birthDate)) / (30.44 * 24 * 60 * 60 * 1000));
      return `${months} mois`;
    }
    return `${years} an${years > 1 ? 's' : ''}`;
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={styles.title}>
          <Heart size={32} style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} />
          Mes compagnons
        </h1>
        <p style={styles.subtitle}>
          {animals.length} animal{animals.length !== 1 ? 'aux' : ''} enregistre{animals.length !== 1 ? 's' : ''}
        </p>
      </div>

      {animals.length === 0 ? (
        <div style={{
          background: '#fff',
          borderRadius: '28px',
          padding: '4rem',
          textAlign: 'center',
          boxShadow: '0 4px 20px rgba(184, 112, 79, 0.08)',
        }}>
          <div style={{ fontSize: '5rem', marginBottom: '1rem' }}>🐾</div>
          <h2 style={{ fontSize: '1.5rem', color: '#3E2723', marginBottom: '0.5rem' }}>
            Aucun animal enregistre
          </h2>
          <p style={{ color: '#A1887F' }}>
            Contactez votre veterinaire pour ajouter vos compagnons
          </p>
        </div>
      ) : (
        <div style={styles.grid}>
          {animals.map((animal) => {
            const lastConsultation = animal.consultations?.[0];
            const lastVaccination = animal.vaccinations?.[0];
            const upcomingVaccinations = animal.vaccinations?.filter(
              v => v.nextDueDate && new Date(v.nextDueDate) > new Date()
            ) || [];
            const overdueVaccinations = animal.vaccinations?.filter(
              v => v.nextDueDate && new Date(v.nextDueDate) < new Date()
            ) || [];

            return (
              <div
                key={animal.id}
                style={styles.card}
                onClick={() => navigate(`/client/animal/${animal.id}`)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-8px)';
                  e.currentTarget.style.boxShadow = '0 16px 50px rgba(184, 112, 79, 0.2)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 8px 40px rgba(184, 112, 79, 0.1)';
                }}
              >
                {/* Decorative blob */}
                <div style={{
                  position: 'absolute', top: -40, right: -40,
                  width: 120, height: 120,
                  background: 'rgba(184, 112, 79, 0.05)',
                  borderRadius: '50%', filter: 'blur(30px)',
                }} />

                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <div>
                    <div style={styles.emoji}>{speciesEmoji[animal.species] || '🐾'}</div>
                    <h2 style={styles.petName}>{animal.name}</h2>
                    <p style={styles.petInfo}>
                      {speciesLabel[animal.species] || animal.species}
                      {animal.breed ? ` - ${animal.breed}` : ''}
                      {animal.gender ? ` - ${animal.gender === 'MALE' ? 'Male' : 'Femelle'}` : ''}
                    </p>
                  </div>
                  <ChevronRight size={24} color="#B8704F" />
                </div>

                {/* Stats */}
                <div style={styles.statsGrid}>
                  <div style={styles.statBox}>
                    <div style={styles.statLabel}>Age</div>
                    <div style={styles.statValue}>{getAge(animal.birthDate)}</div>
                  </div>
                  <div style={styles.statBox}>
                    <div style={styles.statLabel}>Poids</div>
                    <div style={styles.statValue}>
                      {animal.weight ? `${animal.weight} kg` : 'N/A'}
                    </div>
                  </div>
                  <div style={styles.statBox}>
                    <div style={styles.statLabel}>Consultations</div>
                    <div style={styles.statValue}>
                      {animal.consultations?.length || 0}
                    </div>
                  </div>
                </div>

                {/* Vaccination badges */}
                {(upcomingVaccinations.length > 0 || overdueVaccinations.length > 0) && (
                  <div style={{ marginBottom: '1rem' }}>
                    {overdueVaccinations.map(v => (
                      <span key={v.id} style={styles.vaccinBadgeExpired}>
                        <Shield size={14} /> {v.name} - En retard
                      </span>
                    ))}
                    {upcomingVaccinations.slice(0, 2).map(v => (
                      <span key={v.id} style={styles.vaccinBadge}>
                        <Shield size={14} /> {v.name}
                      </span>
                    ))}
                  </div>
                )}

                {/* Medical info */}
                {(animal.allergies || animal.chronicConditions) && (
                  <div style={{
                    background: '#fef3c7',
                    borderRadius: '12px',
                    padding: '0.75rem 1rem',
                    marginBottom: '1rem',
                    fontSize: '0.85rem',
                    color: '#92400e',
                  }}>
                    {animal.allergies && <div>Allergies: {animal.allergies}</div>}
                    {animal.chronicConditions && <div>Conditions: {animal.chronicConditions}</div>}
                  </div>
                )}

                {/* Last consultation */}
                {lastConsultation && (
                  <div style={{
                    background: '#f0fdf4',
                    borderRadius: '12px',
                    padding: '0.75rem 1rem',
                    marginBottom: '1.5rem',
                    fontSize: '0.85rem',
                    color: '#166534',
                  }}>
                    <Activity size={14} style={{ verticalAlign: 'middle', marginRight: '0.4rem' }} />
                    Derniere consultation: {new Date(lastConsultation.date).toLocaleDateString('fr-FR')}
                    {lastConsultation.veterinarian && ` - Dr. ${lastConsultation.veterinarian.lastName}`}
                  </div>
                )}

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/client/book-appointment?animalId=${animal.id}`);
                  }}
                  style={styles.actionBtn}
                  onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
                  onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                  <Calendar size={18} />
                  Prendre un RDV pour {animal.name}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ClientMyPets;
