import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { animalsAPI, consultationsAPI } from '../services/api';
import { 
  ArrowLeft, Calendar, FileText, Activity, Weight, 
  Heart, Syringe, Pill, TrendingUp, AlertCircle 
} from 'lucide-react';

const ClientAnimalDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const { data: animalData } = useQuery({
    queryKey: ['animal', id],
    queryFn: () => animalsAPI.getById(id).then(res => res.data),
  });

  const { data: consultationsData } = useQuery({
    queryKey: ['consultations', id],
    queryFn: () => consultationsAPI.getAll({ animalId: id }).then(res => res.data),
  });

  const animal = animalData?.animal;
  const consultations = consultationsData?.consultations || [];

  if (!animal) {
    return <div>Chargement...</div>;
  }

  const styles = {
    container: {
    },
    content: {
      maxWidth: '1200px',
      margin: '0 auto',
    },
    backButton: {
      background: 'transparent',
      border: 'none',
      color: '#B8704F',
      fontSize: '1rem',
      fontWeight: 600,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      marginBottom: '2rem',
      padding: '0.75rem',
    },
    header: {
      background: '#fff',
      borderRadius: '28px',
      padding: '3rem',
      boxShadow: '0 8px 40px rgba(184, 112, 79, 0.12)',
      marginBottom: '2rem',
    },
    animalName: {
      fontFamily: "'Fraunces', serif",
      fontSize: '3.5rem',
      marginBottom: '0.5rem',
      background: 'linear-gradient(135deg, #B8704F 0%, #D4956C 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      fontWeight: 700,
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '1.5rem',
      marginBottom: '2rem',
    },
    statCard: {
      background: 'linear-gradient(135deg, #fff 0%, #FFF8F0 100%)',
      borderRadius: '20px',
      padding: '1.5rem',
      textAlign: 'center',
      border: '2px solid rgba(184, 112, 79, 0.1)',
    },
    card: {
      background: '#fff',
      borderRadius: '28px',
      padding: '2.5rem',
      boxShadow: '0 8px 40px rgba(184, 112, 79, 0.12)',
      marginBottom: '2rem',
    },
    sectionTitle: {
      fontFamily: "'Fraunces', serif",
      fontSize: '2rem',
      marginBottom: '1.5rem',
      color: '#3E2723',
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
    },
    consultationCard: {
      background: 'linear-gradient(135deg, #FFF8F0 0%, #F5E6D3 100%)',
      borderRadius: '20px',
      padding: '2rem',
      marginBottom: '1.5rem',
      border: '2px solid rgba(184, 112, 79, 0.1)',
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
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.5rem',
      boxShadow: '0 4px 15px rgba(184, 112, 79, 0.25)',
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <button onClick={() => navigate('/client/my-pets')} style={styles.backButton}>
          <ArrowLeft size={20} />
          Retour aux animaux
        </button>

        {/* Header avec infos animal */}
        <div style={styles.header}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginBottom: '2rem' }}>
            <div style={{ fontSize: '6rem' }}>
              {animal.species === 'DOG' ? '🐕' : '🐈'}
            </div>
            <div style={{ flex: 1 }}>
              <h1 style={styles.animalName}>{animal.name}</h1>
              <div style={{ fontSize: '1.3rem', color: '#78716C', marginBottom: '1rem' }}>
                {animal.species === 'DOG' ? 'Chien' : 'Chat'} • {animal.breed || 'Race mixte'}
              </div>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <div style={{
                  background: '#FFF8F0',
                  padding: '0.5rem 1rem',
                  borderRadius: '12px',
                  fontSize: '0.95rem',
                  color: '#6D4C41',
                }}>
                  🎂 {animal.birthDate 
                    ? `${Math.floor((new Date() - new Date(animal.birthDate)) / (365 * 24 * 60 * 60 * 1000))} ans`
                    : 'Âge non renseigné'}
                </div>
                <div style={{
                  background: '#FFF8F0',
                  padding: '0.5rem 1rem',
                  borderRadius: '12px',
                  fontSize: '0.95rem',
                  color: '#6D4C41',
                }}>
                  {animal.gender === 'MALE' ? '♂️ Mâle' : '♀️ Femelle'}
                </div>
                {animal.microchip && (
                  <div style={{
                    background: '#FFF8F0',
                    padding: '0.5rem 1rem',
                    borderRadius: '12px',
                    fontSize: '0.95rem',
                    color: '#6D4C41',
                  }}>
                    🔖 Pucé
                  </div>
                )}
              </div>
            </div>
            <button
              onClick={() => navigate(`/client/book-appointment?animalId=${animal.id}`)}
              style={styles.button}
            >
              <Calendar size={20} />
              Prendre RDV
            </button>
          </div>

          {/* Stats */}
          <div style={styles.statsGrid}>
            <div style={styles.statCard}>
              <Weight size={28} color="#B8704F" style={{ marginBottom: '0.5rem' }} />
              <div style={{ fontSize: '2rem', fontWeight: 700, color: '#3E2723', marginBottom: '0.25rem' }}>
                {animal.weight || 'N/A'} kg
              </div>
              <div style={{ color: '#78716C', fontSize: '0.9rem' }}>Poids actuel</div>
            </div>

            <div style={styles.statCard}>
              <Activity size={28} color="#B8704F" style={{ marginBottom: '0.5rem' }} />
              <div style={{ fontSize: '2rem', fontWeight: 700, color: '#3E2723', marginBottom: '0.25rem' }}>
                {consultations.length}
              </div>
              <div style={{ color: '#78716C', fontSize: '0.9rem' }}>Consultations</div>
            </div>

            <div style={styles.statCard}>
              <Heart size={28} color="#B8704F" style={{ marginBottom: '0.5rem' }} />
              <div style={{ fontSize: '2rem', fontWeight: 700, color: '#3E2723', marginBottom: '0.25rem' }}>
                ✓
              </div>
              <div style={{ color: '#78716C', fontSize: '0.9rem' }}>En bonne santé</div>
            </div>
          </div>
        </div>

        {/* Historique consultations */}
        <div style={styles.card}>
          <h2 style={styles.sectionTitle}>
            <FileText size={28} color="#B8704F" />
            Historique médical
          </h2>

          {consultations.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem', color: '#78716C' }}>
              <Activity size={48} color="#78716C" style={{ marginBottom: '1rem' }} />
              <p style={{ fontSize: '1.1rem' }}>Aucune consultation enregistrée pour le moment</p>
            </div>
          ) : (
            consultations.map((consultation) => (
              <div key={consultation.id} style={styles.consultationCard}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                  <div>
                    <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#3E2723', marginBottom: '0.5rem' }}>
                      {new Date(consultation.date).toLocaleDateString('fr-FR', {
                        weekday: 'long',
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </div>
                    <div style={{ color: '#78716C', fontSize: '1rem' }}>
                      Dr. {consultation.veterinarian.firstName} {consultation.veterinarian.lastName}
                    </div>
                  </div>
                  <div style={{
                    background: '#B8704F',
                    color: '#fff',
                    padding: '0.5rem 1rem',
                    borderRadius: '12px',
                    fontSize: '0.9rem',
                    fontWeight: 600,
                  }}>
                    {consultation.appointment?.type || 'Consultation'}
                  </div>
                </div>

                {consultation.symptoms && (
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ fontWeight: 600, color: '#6D4C41', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Activity size={18} />
                      Symptômes
                    </div>
                    <div style={{ color: '#3E2723', lineHeight: 1.6 }}>{consultation.symptoms}</div>
                  </div>
                )}

                {consultation.diagnosis && (
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ fontWeight: 600, color: '#6D4C41', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <FileText size={18} />
                      Diagnostic
                    </div>
                    <div style={{ color: '#3E2723', lineHeight: 1.6 }}>{consultation.diagnosis}</div>
                  </div>
                )}

                {consultation.treatment && (
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ fontWeight: 600, color: '#6D4C41', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Pill size={18} />
                      Traitement
                    </div>
                    <div style={{ color: '#3E2723', lineHeight: 1.6 }}>{consultation.treatment}</div>
                  </div>
                )}

                {consultation.weight && (
                  <div style={{
                    background: '#fff',
                    padding: '1rem',
                    borderRadius: '12px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    marginTop: '1rem',
                  }}>
                    <Weight size={18} color="#B8704F" />
                    <span style={{ fontWeight: 600, color: '#3E2723' }}>
                      Poids: {consultation.weight} kg
                    </span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Infos complémentaires */}
        {(animal.allergies || animal.chronicConditions) && (
          <div style={styles.card}>
            <h2 style={styles.sectionTitle}>
              <AlertCircle size={28} color="#d97706" />
              Informations importantes
            </h2>

            {animal.allergies && (
              <div style={{ marginBottom: '1.5rem' }}>
                <div style={{ fontWeight: 600, fontSize: '1.1rem', color: '#3E2723', marginBottom: '0.5rem' }}>
                  ⚠️ Allergies
                </div>
                <div style={{ color: '#6D4C41', lineHeight: 1.6, fontSize: '1.05rem' }}>
                  {animal.allergies}
                </div>
              </div>
            )}

            {animal.chronicConditions && (
              <div>
                <div style={{ fontWeight: 600, fontSize: '1.1rem', color: '#3E2723', marginBottom: '0.5rem' }}>
                  💊 Conditions chroniques
                </div>
                <div style={{ color: '#6D4C41', lineHeight: 1.6, fontSize: '1.05rem' }}>
                  {animal.chronicConditions}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientAnimalDetail;
