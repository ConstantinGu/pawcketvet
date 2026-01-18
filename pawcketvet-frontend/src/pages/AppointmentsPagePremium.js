import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { appointmentsAPI, animalsAPI, consultationsAPI } from '../services/api';
import toast from 'react-hot-toast';
import { 
  Calendar, Clock, Plus, X, Save, Edit2, Trash2, CheckCircle, 
  PlayCircle, FileText, Stethoscope, Syringe, Pill, Weight, AlertCircle 
} from 'lucide-react';

const AppointmentsPagePremium = () => {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [showConsultationModal, setShowConsultationModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [consultationStep, setConsultationStep] = useState(1);
  const [consultationData, setConsultationData] = useState({
    symptoms: '',
    temperature: '',
    weight: '',
    heartRate: '',
    diagnosis: '',
    treatment: '',
    prescriptions: [],
    notes: '',
    nextAppointment: '',
  });

  const [formData, setFormData] = useState({
    animalId: '',
    date: '',
    time: '',
    duration: 30,
    type: 'CONSULTATION',
    reason: '',
    notes: '',
    isUrgent: false,
  });

  const { data: appointmentsData, isLoading } = useQuery({
    queryKey: ['appointments', selectedDate],
    queryFn: () => appointmentsAPI.getAll({ date: selectedDate }).then(res => res.data),
  });

  const { data: animalsData } = useQuery({
    queryKey: ['animals'],
    queryFn: () => animalsAPI.getAll().then(res => res.data),
  });

  const createMutation = useMutation({
    mutationFn: (data) => appointmentsAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['appointments']);
      toast.success('✅ Rendez-vous créé !');
      closeModal();
    },
  });

  const openModal = (appointment = null) => {
    if (appointment) {
      const date = new Date(appointment.date);
      setSelectedAppointment(appointment);
      setFormData({
        animalId: appointment.animal.id,
        date: date.toISOString().split('T')[0],
        time: date.toTimeString().slice(0, 5),
        duration: appointment.duration,
        type: appointment.type,
        reason: appointment.reason || '',
        notes: appointment.notes || '',
        isUrgent: appointment.isUrgent,
      });
    } else {
      setSelectedAppointment(null);
      setFormData({
        animalId: '',
        date: selectedDate,
        time: '09:00',
        duration: 30,
        type: 'CONSULTATION',
        reason: '',
        notes: '',
        isUrgent: false,
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedAppointment(null);
  };

  const startConsultation = (appointment) => {
    setSelectedAppointment(appointment);
    setConsultationData({
      symptoms: '',
      temperature: '',
      weight: appointment.animal.weight || '',
      heartRate: '',
      diagnosis: '',
      treatment: '',
      prescriptions: [],
      notes: '',
      nextAppointment: '',
    });
    setConsultationStep(1);
    setShowConsultationModal(true);
  };

  const saveConsultation = async () => {
    try {
      // Créer la consultation
      await consultationsAPI.create({
        appointmentId: selectedAppointment.id,
        animalId: selectedAppointment.animal.id,
        ...consultationData,
      });
      
      // Mettre à jour le RDV comme terminé
      await appointmentsAPI.updateStatus(selectedAppointment.id, 'COMPLETED');
      
      queryClient.invalidateQueries(['appointments']);
      toast.success('✅ Consultation enregistrée !');
      setShowConsultationModal(false);
    } catch (error) {
      toast.error('Erreur lors de l\'enregistrement');
    }
  };

  const styles = {
    container: {
      animation: 'fadeIn 0.4s ease-in',
    },
    header: {
      marginBottom: '2.5rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
    },
    headerLeft: {
      flex: 1,
    },
    title: {
      fontFamily: "'Fraunces', serif",
      fontSize: '3rem',
      marginBottom: '0.75rem',
      color: '#3E2723',
      fontWeight: 700,
      letterSpacing: '-0.02em',
      background: 'linear-gradient(135deg, #3E2723 0%, #6D4C41 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
    },
    subtitle: {
      color: '#A1887F',
      fontSize: '1.15rem',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
    },
    dateSelector: {
      display: 'flex',
      gap: '1.5rem',
      alignItems: 'center',
      marginBottom: '2.5rem',
      padding: '1.5rem',
      background: 'linear-gradient(135deg, #FFF8F0 0%, #F5E6D3 50%)',
      borderRadius: '20px',
      boxShadow: '0 4px 20px rgba(184, 112, 79, 0.08)',
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
    },
    appointmentCard: {
      background: '#fff',
      borderRadius: '24px',
      padding: '2rem',
      marginBottom: '1.5rem',
      boxShadow: '0 4px 25px rgba(184, 112, 79, 0.08)',
      border: '2px solid rgba(184, 112, 79, 0.08)',
      transition: 'all 0.3s ease',
      position: 'relative',
      overflow: 'hidden',
    },
    urgentBadge: {
      position: 'absolute',
      top: '-8px',
      right: '20px',
      background: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
      color: '#fff',
      padding: '0.5rem 1.5rem',
      borderRadius: '0 0 16px 16px',
      fontSize: '0.85rem',
      fontWeight: 700,
      boxShadow: '0 4px 15px rgba(220, 38, 38, 0.3)',
      animation: 'pulse 2s infinite',
    },
    modal: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(45, 63, 47, 0.9)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      animation: 'fadeIn 0.3s ease',
    },
    modalContent: {
      background: '#fff',
      borderRadius: '32px',
      padding: '3rem',
      maxWidth: '900px',
      width: '95%',
      maxHeight: '95vh',
      overflow: 'auto',
      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
      animation: 'slideUp 0.4s ease',
    },
    stepIndicator: {
      display: 'flex',
      justifyContent: 'center',
      gap: '1rem',
      marginBottom: '2rem',
    },
    step: {
      width: '50px',
      height: '50px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 700,
      fontSize: '1.1rem',
      transition: 'all 0.3s',
    },
    sectionCard: {
      background: 'linear-gradient(135deg, #FFF8F0 0%, #F5E6D3 100%)',
      borderRadius: '20px',
      padding: '2rem',
      marginBottom: '2rem',
      border: '2px solid rgba(184, 112, 79, 0.1)',
    },
  };

  const ConsultationModal = () => (
    <div style={styles.modal} onClick={() => setShowConsultationModal(false)}>
      <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
          <div>
            <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: '2.2rem', marginBottom: '0.5rem' }}>
              🩺 Consultation en cours
            </h2>
            <p style={{ color: '#A1887F', fontSize: '1.1rem' }}>
              {selectedAppointment?.animal.name} • {selectedAppointment?.animal.owner.firstName} {selectedAppointment?.animal.owner.lastName}
            </p>
          </div>
          <button onClick={() => setShowConsultationModal(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
            <X size={28} color="#A1887F" />
          </button>
        </div>

        {/* Indicateur d'étapes */}
        <div style={styles.stepIndicator}>
          {[1, 2, 3, 4].map((step) => (
            <div
              key={step}
              style={{
                ...styles.step,
                background: consultationStep >= step 
                  ? 'linear-gradient(135deg, #B8704F 0%, #D4956C 100%)'
                  : '#F5E6D3',
                color: consultationStep >= step ? '#fff' : '#A1887F',
              }}
            >
              {step}
            </div>
          ))}
        </div>

        {/* Étape 1 : Examen physique */}
        {consultationStep === 1 && (
          <div style={styles.sectionCard}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Stethoscope size={24} color="#B8704F" />
              Examen physique
            </h3>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#3E2723' }}>
                  🌡️ Température (°C)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={consultationData.temperature}
                  onChange={(e) => setConsultationData({ ...consultationData, temperature: e.target.value })}
                  placeholder="38.5"
                  style={{
                    width: '100%',
                    padding: '1rem 1.25rem',
                    borderRadius: '12px',
                    border: '2px solid #F5E6D3',
                    fontSize: '1rem',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#3E2723' }}>
                  ⚖️ Poids (kg)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={consultationData.weight}
                  onChange={(e) => setConsultationData({ ...consultationData, weight: e.target.value })}
                  placeholder="25.5"
                  style={{
                    width: '100%',
                    padding: '1rem 1.25rem',
                    borderRadius: '12px',
                    border: '2px solid #F5E6D3',
                    fontSize: '1rem',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#3E2723' }}>
                  ❤️ Fréquence cardiaque (bpm)
                </label>
                <input
                  type="number"
                  value={consultationData.heartRate}
                  onChange={(e) => setConsultationData({ ...consultationData, heartRate: e.target.value })}
                  placeholder="80"
                  style={{
                    width: '100%',
                    padding: '1rem 1.25rem',
                    borderRadius: '12px',
                    border: '2px solid #F5E6D3',
                    fontSize: '1rem',
                  }}
                />
              </div>
            </div>

            <div style={{ marginTop: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#3E2723' }}>
                📋 Symptômes observés
              </label>
              <textarea
                value={consultationData.symptoms}
                onChange={(e) => setConsultationData({ ...consultationData, symptoms: e.target.value })}
                placeholder="Décrire les symptômes..."
                rows={4}
                style={{
                  width: '100%',
                  padding: '1rem 1.25rem',
                  borderRadius: '12px',
                  border: '2px solid #F5E6D3',
                  fontSize: '1rem',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                }}
              />
            </div>

            <button
              onClick={() => setConsultationStep(2)}
              style={{
                ...styles.button,
                width: '100%',
                justifyContent: 'center',
                marginTop: '2rem',
                fontSize: '1.1rem',
              }}
            >
              Suivant : Diagnostic
            </button>
          </div>
        )}

        {/* Étape 2 : Diagnostic */}
        {consultationStep === 2 && (
          <div style={styles.sectionCard}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <FileText size={24} color="#B8704F" />
              Diagnostic
            </h3>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#3E2723' }}>
                🔍 Diagnostic principal
              </label>
              <textarea
                value={consultationData.diagnosis}
                onChange={(e) => setConsultationData({ ...consultationData, diagnosis: e.target.value })}
                placeholder="Diagnostic détaillé..."
                rows={5}
                style={{
                  width: '100%',
                  padding: '1rem 1.25rem',
                  borderRadius: '12px',
                  border: '2px solid #F5E6D3',
                  fontSize: '1rem',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
              <button
                onClick={() => setConsultationStep(1)}
                style={{
                  ...styles.button,
                  flex: 1,
                  justifyContent: 'center',
                  background: '#F5E6D3',
                  color: '#3E2723',
                  boxShadow: 'none',
                }}
              >
                Retour
              </button>
              <button
                onClick={() => setConsultationStep(3)}
                style={{
                  ...styles.button,
                  flex: 1,
                  justifyContent: 'center',
                }}
              >
                Suivant : Traitement
              </button>
            </div>
          </div>
        )}

        {/* Étape 3 : Traitement */}
        {consultationStep === 3 && (
          <div style={styles.sectionCard}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Pill size={24} color="#B8704F" />
              Traitement & Prescriptions
            </h3>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#3E2723' }}>
                💊 Plan de traitement
              </label>
              <textarea
                value={consultationData.treatment}
                onChange={(e) => setConsultationData({ ...consultationData, treatment: e.target.value })}
                placeholder="Décrire le traitement recommandé..."
                rows={4}
                style={{
                  width: '100%',
                  padding: '1rem 1.25rem',
                  borderRadius: '12px',
                  border: '2px solid #F5E6D3',
                  fontSize: '1rem',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
              <button
                onClick={() => setConsultationStep(2)}
                style={{
                  ...styles.button,
                  flex: 1,
                  justifyContent: 'center',
                  background: '#F5E6D3',
                  color: '#3E2723',
                  boxShadow: 'none',
                }}
              >
                Retour
              </button>
              <button
                onClick={() => setConsultationStep(4)}
                style={{
                  ...styles.button,
                  flex: 1,
                  justifyContent: 'center',
                }}
              >
                Suivant : Finaliser
              </button>
            </div>
          </div>
        )}

        {/* Étape 4 : Finalisation */}
        {consultationStep === 4 && (
          <div style={styles.sectionCard}>
            <h3 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <CheckCircle size={24} color="#B8704F" />
              Finalisation & Suivi
            </h3>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#3E2723' }}>
                📝 Notes complémentaires
              </label>
              <textarea
                value={consultationData.notes}
                onChange={(e) => setConsultationData({ ...consultationData, notes: e.target.value })}
                placeholder="Notes additionnelles..."
                rows={3}
                style={{
                  width: '100%',
                  padding: '1rem 1.25rem',
                  borderRadius: '12px',
                  border: '2px solid #F5E6D3',
                  fontSize: '1rem',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#3E2723' }}>
                📅 Prochain rendez-vous (optionnel)
              </label>
              <input
                type="date"
                value={consultationData.nextAppointment}
                onChange={(e) => setConsultationData({ ...consultationData, nextAppointment: e.target.value })}
                style={{
                  width: '100%',
                  padding: '1rem 1.25rem',
                  borderRadius: '12px',
                  border: '2px solid #F5E6D3',
                  fontSize: '1rem',
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
              <button
                onClick={() => setConsultationStep(3)}
                style={{
                  ...styles.button,
                  flex: 1,
                  justifyContent: 'center',
                  background: '#F5E6D3',
                  color: '#3E2723',
                  boxShadow: 'none',
                }}
              >
                Retour
              </button>
              <button
                onClick={saveConsultation}
                style={{
                  ...styles.button,
                  flex: 2,
                  justifyContent: 'center',
                  background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                  fontSize: '1.1rem',
                }}
              >
                <CheckCircle size={20} />
                Enregistrer la consultation
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div style={styles.headerLeft}>
          <h1 style={styles.title}>📅 Rendez-vous</h1>
          <p style={styles.subtitle}>
            <Clock size={20} />
            Gérez votre agenda en toute simplicité
          </p>
        </div>
        <button onClick={() => setShowModal(true)} style={styles.button}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <Plus size={20} />
          Nouveau rendez-vous
        </button>
      </div>

      <div style={styles.dateSelector}>
        <Calendar size={24} color="#B8704F" />
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          style={{
            padding: '0.875rem 1.5rem',
            borderRadius: '12px',
            border: '2px solid rgba(184, 112, 79, 0.2)',
            fontSize: '1rem',
            fontWeight: 600,
            background: '#fff',
          }}
        />
        <div style={{
          padding: '0.875rem 1.5rem',
          background: 'linear-gradient(135deg, #B8704F 0%, #D4956C 100%)',
          color: '#fff',
          borderRadius: '12px',
          fontWeight: 600,
        }}>
          {appointmentsData?.count || 0} rendez-vous
        </div>
      </div>

      {appointmentsData?.appointments?.map((apt) => (
        <div
          key={apt.id}
          style={{
            ...styles.appointmentCard,
            borderLeft: apt.isUrgent ? '6px solid #dc2626' : '6px solid #B8704F',
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          {apt.isUrgent && <div style={styles.urgentBadge}>🚨 URGENT</div>}
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem' }}>
                <div style={{
                  background: 'linear-gradient(135deg, #B8704F 0%, #D4956C 100%)',
                  color: '#fff',
                  padding: '0.75rem 1.5rem',
                  borderRadius: '16px',
                  fontWeight: 700,
                  fontSize: '1.3rem',
                }}>
                  {new Date(apt.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                </div>
                <div style={{ fontSize: '2rem' }}>
                  {apt.animal.species === 'DOG' ? '🐕' : '🐈'}
                </div>
                <div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#3E2723' }}>
                    {apt.animal.name}
                  </div>
                  <div style={{ color: '#A1887F' }}>
                    {apt.animal.owner.firstName} {apt.animal.owner.lastName}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
                <div style={{
                  background: '#FFF8F0',
                  padding: '0.5rem 1rem',
                  borderRadius: '12px',
                  fontSize: '0.95rem',
                  color: '#6D4C41',
                }}>
                  📋 {apt.type}
                </div>
                <div style={{
                  background: '#FFF8F0',
                  padding: '0.5rem 1rem',
                  borderRadius: '12px',
                  fontSize: '0.95rem',
                  color: '#6D4C41',
                }}>
                  ⏱️ {apt.duration} min
                </div>
                {apt.reason && (
                  <div style={{
                    background: '#FFF8F0',
                    padding: '0.5rem 1rem',
                    borderRadius: '12px',
                    fontSize: '0.95rem',
                    color: '#6D4C41',
                  }}>
                    💭 {apt.reason}
                  </div>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              {apt.status === 'PENDING' || apt.status === 'CONFIRMED' ? (
                <button
                  onClick={() => startConsultation(apt)}
                  style={{
                    ...styles.button,
                    background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                    padding: '0.875rem 1.5rem',
                  }}
                >
                  <PlayCircle size={20} />
                  Démarrer consultation
                </button>
              ) : (
                <div style={{
                  background: '#059669',
                  color: '#fff',
                  padding: '0.875rem 1.5rem',
                  borderRadius: '12px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}>
                  <CheckCircle size={18} />
                  Terminé
                </div>
              )}
            </div>
          </div>
        </div>
      ))}

      {showConsultationModal && <ConsultationModal />}

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(30px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
      `}</style>
    </div>
  );
};

export default AppointmentsPagePremium;
