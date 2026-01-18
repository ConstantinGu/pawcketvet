import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { appointmentsAPI, animalsAPI } from '../services/api';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Calendar, Clock, ChevronRight, CheckCircle, ArrowLeft } from 'lucide-react';

const ClientBookAppointment = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const preSelectedAnimalId = searchParams.get('animalId');

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    animalId: preSelectedAnimalId || '',
    type: 'CONSULTATION',
    date: '',
    timeSlot: '',
    reason: '',
    notes: '',
  });

  const { data: animalsData } = useQuery({
    queryKey: ['my-animals'],
    queryFn: () => animalsAPI.getAll().then(res => res.data),
  });

  const createMutation = useMutation({
    mutationFn: (data) => {
      const datetime = new Date(`${data.date}T${data.timeSlot}`);
      return appointmentsAPI.create({
        ...data,
        date: datetime.toISOString(),
        duration: 30,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['my-appointments']);
      toast.success('✅ Rendez-vous confirmé !');
      navigate('/client/dashboard');
    },
    onError: () => {
      toast.error('❌ Erreur lors de la réservation');
    },
  });

  const availableSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00',
  ];

  const consultationTypes = [
    { value: 'CONSULTATION', label: '🩺 Consultation générale', description: 'Examen de routine ou problème de santé' },
    { value: 'VACCINATION', label: '💉 Vaccination', description: 'Rappel de vaccins' },
    { value: 'FOLLOWUP', label: '🔄 Suivi', description: 'Contrôle après traitement' },
    { value: 'EMERGENCY', label: '🚨 Urgence', description: 'Situation urgente (appeler directement)' },
  ];

  const handleSubmit = () => {
    if (!formData.animalId || !formData.date || !formData.timeSlot) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }
    createMutation.mutate(formData);
  };

  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #FFF8F0 0%, #F5E6D3 100%)',
      padding: '2rem',
    },
    content: {
      maxWidth: '800px',
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
    title: {
      fontFamily: "'Fraunces', serif",
      fontSize: '3rem',
      marginBottom: '1rem',
      background: 'linear-gradient(135deg, #B8704F 0%, #D4956C 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      fontWeight: 700,
    },
    stepIndicator: {
      display: 'flex',
      justifyContent: 'center',
      gap: '1rem',
      marginBottom: '3rem',
    },
    step: {
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
    },
    stepCircle: {
      width: '50px',
      height: '50px',
      borderRadius: '50%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: 700,
      fontSize: '1.2rem',
      transition: 'all 0.3s',
    },
    card: {
      background: '#fff',
      borderRadius: '28px',
      padding: '3rem',
      boxShadow: '0 8px 40px rgba(184, 112, 79, 0.12)',
      border: '2px solid rgba(184, 112, 79, 0.08)',
      marginBottom: '2rem',
    },
    optionCard: {
      background: 'linear-gradient(135deg, #fff 0%, #FFF8F0 100%)',
      borderRadius: '20px',
      padding: '2rem',
      marginBottom: '1rem',
      border: '2px solid rgba(184, 112, 79, 0.1)',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
    },
    button: {
      background: 'linear-gradient(135deg, #B8704F 0%, #D4956C 100%)',
      color: '#fff',
      border: 'none',
      borderRadius: '16px',
      padding: '1.25rem 2.5rem',
      fontSize: '1.1rem',
      fontWeight: 600,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      transition: 'all 0.3s ease',
      boxShadow: '0 4px 15px rgba(184, 112, 79, 0.25)',
      justifyContent: 'center',
      width: '100%',
    },
    timeSlot: {
      background: '#fff',
      border: '2px solid #F5E6D3',
      borderRadius: '12px',
      padding: '1rem',
      textAlign: 'center',
      cursor: 'pointer',
      transition: 'all 0.3s',
      fontWeight: 600,
      fontSize: '1rem',
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.content}>
        <button onClick={() => navigate('/client/dashboard')} style={styles.backButton}>
          <ArrowLeft size={20} />
          Retour au tableau de bord
        </button>

        <h1 style={styles.title}>📅 Prendre rendez-vous</h1>
        <p style={{ fontSize: '1.2rem', color: '#6D4C41', marginBottom: '3rem' }}>
          Réservez facilement une consultation en ligne
        </p>

        {/* Indicateur d'étapes */}
        <div style={styles.stepIndicator}>
          {[1, 2, 3].map((s) => (
            <div key={s} style={styles.step}>
              <div
                style={{
                  ...styles.stepCircle,
                  background: step >= s
                    ? 'linear-gradient(135deg, #B8704F 0%, #D4956C 100%)'
                    : '#F5E6D3',
                  color: step >= s ? '#fff' : '#A1887F',
                }}
              >
                {step > s ? <CheckCircle size={24} /> : s}
              </div>
              {s < 3 && (
                <ChevronRight
                  size={20}
                  color={step > s ? '#B8704F' : '#A1887F'}
                />
              )}
            </div>
          ))}
        </div>

        {/* Étape 1 : Choisir l'animal */}
        {step === 1 && (
          <div style={styles.card}>
            <h2 style={{ fontSize: '2rem', marginBottom: '2rem', color: '#3E2723' }}>
              Pour quel compagnon ?
            </h2>
            
            {animalsData?.animals?.map((animal) => (
              <div
                key={animal.id}
                style={{
                  ...styles.optionCard,
                  border: formData.animalId === animal.id
                    ? '3px solid #B8704F'
                    : '2px solid rgba(184, 112, 79, 0.1)',
                  background: formData.animalId === animal.id
                    ? 'linear-gradient(135deg, #B8704F15 0%, #D4956C10 100%)'
                    : 'linear-gradient(135deg, #fff 0%, #FFF8F0 100%)',
                }}
                onClick={() => setFormData({ ...formData, animalId: animal.id })}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateX(8px)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateX(0)'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                  <div style={{ fontSize: '3.5rem' }}>
                    {animal.species === 'DOG' ? '🐕' : '🐈'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '1.6rem', fontWeight: 700, color: '#3E2723', marginBottom: '0.25rem' }}>
                      {animal.name}
                    </div>
                    <div style={{ color: '#A1887F', fontSize: '1.05rem' }}>
                      {animal.species === 'DOG' ? 'Chien' : 'Chat'} • {animal.breed || 'Race mixte'}
                    </div>
                  </div>
                  {formData.animalId === animal.id && (
                    <CheckCircle size={32} color="#B8704F" />
                  )}
                </div>
              </div>
            ))}

            <button
              onClick={() => setStep(2)}
              disabled={!formData.animalId}
              style={{
                ...styles.button,
                marginTop: '2rem',
                opacity: !formData.animalId ? 0.5 : 1,
                cursor: !formData.animalId ? 'not-allowed' : 'pointer',
              }}
            >
              Continuer
              <ChevronRight size={20} />
            </button>
          </div>
        )}

        {/* Étape 2 : Type & Date */}
        {step === 2 && (
          <div style={styles.card}>
            <h2 style={{ fontSize: '2rem', marginBottom: '2rem', color: '#3E2723' }}>
              Type de consultation
            </h2>

            {consultationTypes.map((type) => (
              <div
                key={type.value}
                style={{
                  ...styles.optionCard,
                  border: formData.type === type.value
                    ? '3px solid #B8704F'
                    : '2px solid rgba(184, 112, 79, 0.1)',
                  background: formData.type === type.value
                    ? 'linear-gradient(135deg, #B8704F15 0%, #D4956C10 100%)'
                    : 'linear-gradient(135deg, #fff 0%, #FFF8F0 100%)',
                }}
                onClick={() => setFormData({ ...formData, type: type.value })}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#3E2723', marginBottom: '0.25rem' }}>
                      {type.label}
                    </div>
                    <div style={{ color: '#A1887F', fontSize: '1rem' }}>
                      {type.description}
                    </div>
                  </div>
                  {formData.type === type.value && (
                    <CheckCircle size={28} color="#B8704F" />
                  )}
                </div>
              </div>
            ))}

            <div style={{ marginTop: '2.5rem', marginBottom: '2rem' }}>
              <label style={{ display: 'block', fontSize: '1.4rem', fontWeight: 700, color: '#3E2723', marginBottom: '1rem' }}>
                📅 Choisir une date
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
                style={{
                  width: '100%',
                  padding: '1.25rem',
                  borderRadius: '12px',
                  border: '2px solid #F5E6D3',
                  fontSize: '1.1rem',
                  fontWeight: 600,
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={() => setStep(1)}
                style={{
                  ...styles.button,
                  background: '#F5E6D3',
                  color: '#3E2723',
                  boxShadow: 'none',
                }}
              >
                <ArrowLeft size={20} />
                Retour
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!formData.date}
                style={{
                  ...styles.button,
                  opacity: !formData.date ? 0.5 : 1,
                  cursor: !formData.date ? 'not-allowed' : 'pointer',
                }}
              >
                Continuer
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        )}

        {/* Étape 3 : Heure & Confirmation */}
        {step === 3 && (
          <div style={styles.card}>
            <h2 style={{ fontSize: '2rem', marginBottom: '2rem', color: '#3E2723' }}>
              ⏰ Choisir un créneau
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2.5rem' }}>
              {availableSlots.map((slot) => (
                <div
                  key={slot}
                  style={{
                    ...styles.timeSlot,
                    border: formData.timeSlot === slot
                      ? '3px solid #B8704F'
                      : '2px solid #F5E6D3',
                    background: formData.timeSlot === slot
                      ? 'linear-gradient(135deg, #B8704F 0%, #D4956C 100%)'
                      : '#fff',
                    color: formData.timeSlot === slot ? '#fff' : '#3E2723',
                  }}
                  onClick={() => setFormData({ ...formData, timeSlot: slot })}
                >
                  <Clock size={18} style={{ marginRight: '0.5rem', display: 'inline' }} />
                  {slot}
                </div>
              ))}
            </div>

            <div style={{ marginBottom: '2rem' }}>
              <label style={{ display: 'block', fontSize: '1.2rem', fontWeight: 700, color: '#3E2723', marginBottom: '1rem' }}>
                💬 Motif de la consultation (optionnel)
              </label>
              <textarea
                value={formData.reason}
                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                placeholder="Décrivez brièvement la raison de votre visite..."
                rows={4}
                style={{
                  width: '100%',
                  padding: '1.25rem',
                  borderRadius: '12px',
                  border: '2px solid #F5E6D3',
                  fontSize: '1rem',
                  fontFamily: 'inherit',
                  resize: 'vertical',
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '1rem' }}>
              <button
                onClick={() => setStep(2)}
                style={{
                  ...styles.button,
                  background: '#F5E6D3',
                  color: '#3E2723',
                  boxShadow: 'none',
                }}
              >
                <ArrowLeft size={20} />
                Retour
              </button>
              <button
                onClick={handleSubmit}
                disabled={!formData.timeSlot || createMutation.isPending}
                style={{
                  ...styles.button,
                  background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                  opacity: !formData.timeSlot || createMutation.isPending ? 0.5 : 1,
                  cursor: !formData.timeSlot || createMutation.isPending ? 'not-allowed' : 'pointer',
                }}
              >
                <CheckCircle size={20} />
                {createMutation.isPending ? 'Confirmation...' : 'Confirmer le RDV'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientBookAppointment;
