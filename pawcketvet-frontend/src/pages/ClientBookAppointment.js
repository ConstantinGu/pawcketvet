import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { appointmentsAPI, animalsAPI } from '../services/api';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Calendar, Clock, ChevronRight, CheckCircle, ArrowLeft, FileText } from 'lucide-react';

const speciesEmoji = { DOG: '🐕', CAT: '🐈', RABBIT: '🐇', BIRD: '🐦', RODENT: '🐹', REPTILE: '🦎', OTHER: '🐾' };
const speciesLabel = { DOG: 'Chien', CAT: 'Chat', RABBIT: 'Lapin', BIRD: 'Oiseau', RODENT: 'Rongeur', REPTILE: 'Reptile', OTHER: 'Autre' };

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
        duration: data.type === 'EMERGENCY' ? 60 : 30,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['my-appointments']);
      toast.success('Rendez-vous confirme !');
      navigate('/client/appointments');
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || 'Erreur lors de la reservation');
    },
  });

  const availableSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00',
  ];

  const consultationTypes = [
    { value: 'CONSULTATION', label: 'Consultation generale', icon: '🩺', description: 'Examen de routine ou probleme de sante', duration: '30 min' },
    { value: 'VACCINATION', label: 'Vaccination', icon: '💉', description: 'Rappel ou primo-vaccination', duration: '20 min' },
    { value: 'FOLLOWUP', label: 'Suivi', icon: '🔄', description: 'Controle apres traitement', duration: '20 min' },
    { value: 'EMERGENCY', label: 'Urgence', icon: '🚨', description: 'Situation urgente', duration: '60 min' },
  ];

  const handleSubmit = () => {
    if (!formData.animalId || !formData.date || !formData.timeSlot) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }
    createMutation.mutate(formData);
  };

  const selectedAnimal = (animalsData?.animals || []).find(a => a.id === formData.animalId);
  const selectedType = consultationTypes.find(t => t.value === formData.type);

  const stepLabels = ['Animal', 'Type', 'Creneau', 'Confirmation'];

  const styles = {
    content: { maxWidth: '800px', margin: '0 auto' },
    card: {
      background: '#fff',
      borderRadius: '24px',
      padding: '2.5rem',
      boxShadow: '0 8px 40px rgba(184, 112, 79, 0.12)',
      border: '2px solid rgba(184, 112, 79, 0.08)',
      marginBottom: '2rem',
    },
    optionCard: {
      background: 'linear-gradient(135deg, #fff 0%, #FFF8F0 100%)',
      borderRadius: '16px',
      padding: '1.5rem',
      marginBottom: '0.75rem',
      border: '2px solid rgba(184, 112, 79, 0.1)',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    },
    button: {
      background: 'linear-gradient(135deg, #B8704F 0%, #D4956C 100%)',
      color: '#fff',
      border: 'none',
      borderRadius: '14px',
      padding: '1rem 2rem',
      fontSize: '1rem',
      fontWeight: 600,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      transition: 'all 0.3s ease',
      boxShadow: '0 4px 15px rgba(184, 112, 79, 0.25)',
      justifyContent: 'center',
      width: '100%',
    },
    timeSlot: {
      background: '#fff',
      border: '2px solid #F5E6D3',
      borderRadius: '12px',
      padding: '0.875rem',
      textAlign: 'center',
      cursor: 'pointer',
      transition: 'all 0.2s',
      fontWeight: 600,
      fontSize: '0.95rem',
    },
  };

  return (
    <div style={styles.content}>
      <button
        onClick={() => navigate('/client/dashboard')}
        style={{ background: 'transparent', border: 'none', color: '#B8704F', fontSize: '1rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', padding: '0.5rem 0' }}
      >
        <ArrowLeft size={20} /> Retour
      </button>

      <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: '2.5rem', marginBottom: '0.5rem', color: '#3E2723', fontWeight: 700 }}>
        Prendre rendez-vous
      </h1>
      <p style={{ fontSize: '1.05rem', color: '#A1887F', marginBottom: '2rem' }}>
        Reservez facilement une consultation en ligne
      </p>

      {/* Step indicator */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginBottom: '2.5rem', alignItems: 'center' }}>
        {stepLabels.map((label, i) => {
          const s = i + 1;
          const isActive = step >= s;
          const isDone = step > s;
          return (
            <React.Fragment key={s}>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.35rem' }}>
                <div style={{
                  width: '40px', height: '40px', borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, fontSize: '0.95rem', transition: 'all 0.3s',
                  background: isActive ? 'linear-gradient(135deg, #B8704F 0%, #D4956C 100%)' : '#F5E6D3',
                  color: isActive ? '#fff' : '#A1887F',
                }}>
                  {isDone ? <CheckCircle size={20} /> : s}
                </div>
                <span style={{ fontSize: '0.75rem', color: isActive ? '#B8704F' : '#A1887F', fontWeight: 600 }}>
                  {label}
                </span>
              </div>
              {s < 4 && (
                <div style={{
                  width: '40px', height: '2px', marginBottom: '1.25rem',
                  background: step > s ? '#B8704F' : '#F5E6D3',
                  borderRadius: '1px',
                }} />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Step 1: Animal selection */}
      {step === 1 && (
        <div style={styles.card}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: '#3E2723' }}>
            Pour quel compagnon ?
          </h2>
          {(animalsData?.animals || []).map((animal) => (
            <div
              key={animal.id}
              style={{
                ...styles.optionCard,
                border: formData.animalId === animal.id ? '3px solid #B8704F' : '2px solid rgba(184, 112, 79, 0.1)',
                background: formData.animalId === animal.id ? '#FFF8F0' : '#fff',
              }}
              onClick={() => setFormData({ ...formData, animalId: animal.id })}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ fontSize: '2.5rem' }}>
                  {speciesEmoji[animal.species] || '🐾'}
                </span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#3E2723' }}>{animal.name}</div>
                  <div style={{ color: '#A1887F', fontSize: '0.95rem' }}>
                    {speciesLabel[animal.species] || animal.species} {animal.breed ? `- ${animal.breed}` : ''}
                  </div>
                </div>
                {formData.animalId === animal.id && <CheckCircle size={24} color="#B8704F" />}
              </div>
            </div>
          ))}
          <button
            onClick={() => setStep(2)}
            disabled={!formData.animalId}
            style={{ ...styles.button, marginTop: '1.5rem', opacity: !formData.animalId ? 0.5 : 1 }}
          >
            Continuer <ChevronRight size={18} />
          </button>
        </div>
      )}

      {/* Step 2: Consultation type */}
      {step === 2 && (
        <div style={styles.card}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: '#3E2723' }}>
            Type de consultation
          </h2>
          {consultationTypes.map((type) => (
            <div
              key={type.value}
              style={{
                ...styles.optionCard,
                border: formData.type === type.value ? '3px solid #B8704F' : '2px solid rgba(184, 112, 79, 0.1)',
                background: formData.type === type.value ? '#FFF8F0' : '#fff',
              }}
              onClick={() => setFormData({ ...formData, type: type.value })}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ fontSize: '1.8rem' }}>{type.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#3E2723' }}>{type.label}</div>
                  <div style={{ color: '#A1887F', fontSize: '0.9rem' }}>{type.description}</div>
                </div>
                <span style={{ fontSize: '0.8rem', color: '#B8704F', fontWeight: 600, background: '#FFF8F0', padding: '0.25rem 0.5rem', borderRadius: '6px' }}>
                  {type.duration}
                </span>
                {formData.type === type.value && <CheckCircle size={24} color="#B8704F" />}
              </div>
            </div>
          ))}
          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
            <button onClick={() => setStep(1)} style={{ ...styles.button, background: '#F5E6D3', color: '#3E2723', boxShadow: 'none', flex: '0 0 auto', width: 'auto', padding: '1rem 1.5rem' }}>
              <ArrowLeft size={18} /> Retour
            </button>
            <button onClick={() => setStep(3)} style={styles.button}>
              Continuer <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Date & Time */}
      {step === 3 && (
        <div style={styles.card}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: '#3E2723' }}>
            Choisir une date et un creneau
          </h2>

          <div style={{ marginBottom: '2rem' }}>
            <label style={{ display: 'block', fontSize: '1rem', fontWeight: 700, color: '#3E2723', marginBottom: '0.75rem' }}>
              Date
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              min={new Date().toISOString().split('T')[0]}
              style={{
                width: '100%', padding: '1rem', borderRadius: '12px',
                border: '2px solid #F5E6D3', fontSize: '1rem', fontWeight: 600, boxSizing: 'border-box',
              }}
            />
          </div>

          {formData.date && (
            <>
              <label style={{ display: 'block', fontSize: '1rem', fontWeight: 700, color: '#3E2723', marginBottom: '0.75rem' }}>
                Creneau horaire
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.75rem', marginBottom: '2rem' }}>
                {availableSlots.map((slot) => (
                  <div
                    key={slot}
                    style={{
                      ...styles.timeSlot,
                      border: formData.timeSlot === slot ? '2px solid #B8704F' : '2px solid #F5E6D3',
                      background: formData.timeSlot === slot ? 'linear-gradient(135deg, #B8704F 0%, #D4956C 100%)' : '#fff',
                      color: formData.timeSlot === slot ? '#fff' : '#3E2723',
                    }}
                    onClick={() => setFormData({ ...formData, timeSlot: slot })}
                  >
                    {slot}
                  </div>
                ))}
              </div>
            </>
          )}

          <div style={{ marginBottom: '1.5rem' }}>
            <label style={{ display: 'block', fontSize: '1rem', fontWeight: 700, color: '#3E2723', marginBottom: '0.75rem' }}>
              Motif (optionnel)
            </label>
            <textarea
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              placeholder="Decrivez brievement la raison de votre visite..."
              rows={3}
              style={{
                width: '100%', padding: '1rem', borderRadius: '12px',
                border: '2px solid #F5E6D3', fontSize: '0.95rem', fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button onClick={() => setStep(2)} style={{ ...styles.button, background: '#F5E6D3', color: '#3E2723', boxShadow: 'none', flex: '0 0 auto', width: 'auto', padding: '1rem 1.5rem' }}>
              <ArrowLeft size={18} /> Retour
            </button>
            <button
              onClick={() => setStep(4)}
              disabled={!formData.date || !formData.timeSlot}
              style={{ ...styles.button, opacity: (!formData.date || !formData.timeSlot) ? 0.5 : 1 }}
            >
              Continuer <ChevronRight size={18} />
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Confirmation */}
      {step === 4 && (
        <div style={styles.card}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: '#3E2723', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText size={22} color="#B8704F" /> Recapitulatif
          </h2>

          <div style={{ background: '#FFF8F0', borderRadius: '16px', padding: '1.5rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: '#A1887F', fontWeight: 600, textTransform: 'uppercase' }}>Animal</span>
                <p style={{ fontWeight: 700, color: '#3E2723', fontSize: '1.1rem', margin: '0.25rem 0 0' }}>
                  {speciesEmoji[selectedAnimal?.species] || '🐾'} {selectedAnimal?.name || '-'}
                </p>
                <span style={{ color: '#6D4C41', fontSize: '0.85rem' }}>
                  {speciesLabel[selectedAnimal?.species] || ''} {selectedAnimal?.breed ? `- ${selectedAnimal.breed}` : ''}
                </span>
              </div>
              <div>
                <span style={{ fontSize: '0.8rem', color: '#A1887F', fontWeight: 600, textTransform: 'uppercase' }}>Type</span>
                <p style={{ fontWeight: 700, color: '#3E2723', fontSize: '1.1rem', margin: '0.25rem 0 0' }}>
                  {selectedType?.icon} {selectedType?.label || '-'}
                </p>
                <span style={{ color: '#6D4C41', fontSize: '0.85rem' }}>{selectedType?.duration}</span>
              </div>
              <div>
                <span style={{ fontSize: '0.8rem', color: '#A1887F', fontWeight: 600, textTransform: 'uppercase' }}>Date</span>
                <p style={{ fontWeight: 700, color: '#3E2723', fontSize: '1.1rem', margin: '0.25rem 0 0' }}>
                  {formData.date ? new Date(formData.date + 'T00:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : '-'}
                </p>
              </div>
              <div>
                <span style={{ fontSize: '0.8rem', color: '#A1887F', fontWeight: 600, textTransform: 'uppercase' }}>Heure</span>
                <p style={{ fontWeight: 700, color: '#3E2723', fontSize: '1.1rem', margin: '0.25rem 0 0' }}>
                  {formData.timeSlot || '-'}
                </p>
              </div>
            </div>
            {formData.reason && (
              <div style={{ marginTop: '1rem', borderTop: '1px solid rgba(184,112,79,0.15)', paddingTop: '1rem' }}>
                <span style={{ fontSize: '0.8rem', color: '#A1887F', fontWeight: 600, textTransform: 'uppercase' }}>Motif</span>
                <p style={{ color: '#3E2723', fontSize: '0.95rem', margin: '0.25rem 0 0' }}>{formData.reason}</p>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button onClick={() => setStep(3)} style={{ ...styles.button, background: '#F5E6D3', color: '#3E2723', boxShadow: 'none', flex: '0 0 auto', width: 'auto', padding: '1rem 1.5rem' }}>
              <ArrowLeft size={18} /> Modifier
            </button>
            <button
              onClick={handleSubmit}
              disabled={createMutation.isPending}
              style={{
                ...styles.button,
                background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                boxShadow: '0 4px 15px rgba(5, 150, 105, 0.25)',
                opacity: createMutation.isPending ? 0.7 : 1,
              }}
            >
              <CheckCircle size={18} />
              {createMutation.isPending ? 'Confirmation...' : 'Confirmer le rendez-vous'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientBookAppointment;
