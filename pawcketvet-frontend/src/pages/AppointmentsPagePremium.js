import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { appointmentsAPI, animalsAPI } from '../services/api';
import toast from 'react-hot-toast';
import { AppointmentSkeleton } from '../components/LoadingSkeleton';
import {
  Calendar, Clock, Plus, X, Save, CheckCircle,
  PlayCircle, FileText, Stethoscope, Pill, AlertCircle,
  XCircle, ChevronLeft, ChevronRight, Ban, Syringe,
  Weight, Heart, Thermometer, TrendingUp, TrendingDown,
  Minus, Shield, Trash2, AlertTriangle
} from 'lucide-react';

const speciesEmoji = {
  DOG: '🐕', CAT: '🐈', RABBIT: '🐇', BIRD: '🐦',
  RODENT: '🐹', REPTILE: '🦎', OTHER: '🐾',
};

const typeLabels = {
  CONSULTATION: 'Consultation', VACCINATION: 'Vaccination', SURGERY: 'Chirurgie',
  FOLLOWUP: 'Suivi', EMERGENCY: 'Urgence', GROOMING: 'Toilettage', OTHER: 'Autre',
};

const statusConfig = {
  PENDING: { label: 'En attente', color: '#f59e0b', bg: '#fef3c7' },
  CONFIRMED: { label: 'Confirmé', color: '#2563eb', bg: '#dbeafe' },
  COMPLETED: { label: 'Terminé', color: '#16a34a', bg: '#dcfce7' },
  CANCELLED: { label: 'Annulé', color: '#dc2626', bg: '#fef2f2' },
  NOSHOW: { label: 'Absent', color: '#9333ea', bg: '#f3e8ff' },
};

// ========================================
// SUGGESTIONS VACCINS PAR ESPÈCE
// ========================================
const VACCINE_SUGGESTIONS = {
  DOG: [
    { name: 'CHPPiL (Pentavalent)', intervalMonths: 12, description: 'Carré, Hépatite, Parvo, Parainfluenza, Lepto' },
    { name: 'Rage', intervalMonths: 12, description: 'Obligatoire pour voyager' },
    { name: 'Leptospirose', intervalMonths: 12, description: 'Rappel annuel recommandé' },
    { name: 'Toux du chenil (Bordetella)', intervalMonths: 12, description: 'Recommandé si collectivité' },
    { name: 'Piroplasmose', intervalMonths: 6, description: 'Zones à risque tiques' },
    { name: 'Leishmaniose', intervalMonths: 12, description: 'Zones méditerranéennes' },
  ],
  CAT: [
    { name: 'Typhus (Panleucopénie)', intervalMonths: 12, description: 'Vaccin de base' },
    { name: 'Coryza (RCP)', intervalMonths: 12, description: 'Herpesvirus + Calicivirus + Panleucopénie' },
    { name: 'Leucose féline (FeLV)', intervalMonths: 12, description: 'Chat d\'extérieur' },
    { name: 'Rage', intervalMonths: 12, description: 'Obligatoire pour voyager' },
    { name: 'Chlamydiose', intervalMonths: 12, description: 'Si collectivité' },
  ],
  RABBIT: [
    { name: 'Myxomatose', intervalMonths: 6, description: 'Rappel tous les 6 mois' },
    { name: 'VHD (Maladie hémorragique)', intervalMonths: 12, description: 'VHD1 et VHD2' },
    { name: 'Myxo-VHD combiné', intervalMonths: 12, description: 'Vaccin combiné' },
  ],
  BIRD: [
    { name: 'Paramyxovirose', intervalMonths: 12, description: 'PMV - Newcastle' },
  ],
  RODENT: [],
  REPTILE: [],
  OTHER: [],
};

// Normes de température par espèce
const TEMP_NORMS = {
  DOG: { min: 38.0, max: 39.0, label: '38.0–39.0°C' },
  CAT: { min: 38.0, max: 39.2, label: '38.0–39.2°C' },
  RABBIT: { min: 38.5, max: 40.0, label: '38.5–40.0°C' },
  BIRD: { min: 40.0, max: 42.0, label: '40.0–42.0°C' },
  RODENT: { min: 37.5, max: 39.5, label: '37.5–39.5°C' },
  REPTILE: { min: 25.0, max: 35.0, label: '25.0–35.0°C (variable)' },
};

const AppointmentsPagePremium = () => {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [showConsultationModal, setShowConsultationModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [consultationStep, setConsultationStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);
  const [consultationData, setConsultationData] = useState({
    symptoms: '', temperature: '', weight: '', heartRate: '',
    diagnosis: '', treatment: '', notes: '', nextAppointment: '',
  });
  // Vaccinations ajoutées pendant la consultation
  const [consultationVaccinations, setConsultationVaccinations] = useState([]);

  const [formData, setFormData] = useState({
    animalId: '', date: '', time: '09:00', duration: 30,
    type: 'CONSULTATION', reason: '', notes: '', isUrgent: false,
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
      toast.success('Rendez-vous créé !');
      closeModal();
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Erreur lors de la création'),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => appointmentsAPI.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries(['appointments']);
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Erreur'),
  });

  const openModal = () => {
    setFormData({
      animalId: '', date: selectedDate, time: '09:00', duration: 30,
      type: 'CONSULTATION', reason: '', notes: '', isUrgent: false,
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedAppointment(null);
  };

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    const dateTime = `${formData.date}T${formData.time}:00`;
    createMutation.mutate({
      ...formData,
      date: dateTime,
    });
  };

  const confirmAppointment = (apt) => {
    updateStatusMutation.mutate({ id: apt.id, status: 'CONFIRMED' }, {
      onSuccess: () => toast.success(`RDV de ${apt.animal.name} confirmé`),
    });
  };

  const cancelAppointment = (apt) => {
    if (window.confirm(`Annuler le RDV de ${apt.animal.name} ?`)) {
      updateStatusMutation.mutate({ id: apt.id, status: 'CANCELLED' }, {
        onSuccess: () => toast.success('RDV annulé'),
      });
    }
  };

  const startConsultation = (appointment) => {
    setSelectedAppointment(appointment);
    setConsultationData({
      symptoms: '', temperature: '',
      weight: appointment.animal?.weight || '',
      heartRate: '', diagnosis: '', treatment: '', notes: '',
      nextAppointment: '',
    });
    setConsultationVaccinations([]);
    setConsultationStep(1);
    setIsSaving(false);
    setShowConsultationModal(true);
  };

  // Ajouter un vaccin au formulaire
  const addVaccination = (suggestion = null) => {
    const today = new Date();
    let nextDue = '';
    if (suggestion?.intervalMonths) {
      const d = new Date(today);
      d.setMonth(d.getMonth() + suggestion.intervalMonths);
      nextDue = d.toISOString().split('T')[0];
    }
    setConsultationVaccinations(prev => [...prev, {
      id: Date.now(),
      name: suggestion?.name || '',
      batchNumber: '',
      nextDueDate: nextDue,
      notes: '',
    }]);
  };

  const updateVaccination = (id, field, value) => {
    setConsultationVaccinations(prev =>
      prev.map(v => v.id === id ? { ...v, [field]: value } : v)
    );
  };

  const removeVaccination = (id) => {
    setConsultationVaccinations(prev => prev.filter(v => v.id !== id));
  };

  // Poids précédent et delta
  const previousWeight = selectedAppointment?.animal?.weight;
  const currentWeight = consultationData.weight ? parseFloat(consultationData.weight) : null;
  const weightDelta = (previousWeight && currentWeight) ? (currentWeight - previousWeight).toFixed(1) : null;

  // Température dans les normes ?
  const species = selectedAppointment?.animal?.species;
  const tempNorm = species ? TEMP_NORMS[species] : null;
  const currentTemp = consultationData.temperature ? parseFloat(consultationData.temperature) : null;
  const tempOutOfRange = tempNorm && currentTemp && (currentTemp < tempNorm.min || currentTemp > tempNorm.max);

  // Suggestions de vaccins pour cette espèce
  const vaccineSuggestions = useMemo(() => {
    if (!species) return [];
    return VACCINE_SUGGESTIONS[species] || [];
  }, [species]);

  // SMART SAVE — un seul appel backend
  const saveConsultation = async () => {
    setIsSaving(true);
    try {
      await appointmentsAPI.completeWithConsultation(selectedAppointment.id, {
        ...consultationData,
        vaccinations: consultationVaccinations.filter(v => v.name.trim()),
      });
      queryClient.invalidateQueries(['appointments']);
      queryClient.invalidateQueries(['my-animals']);
      queryClient.invalidateQueries(['vacc-book']);
      queryClient.invalidateQueries(['consult-book']);
      toast.success(
        consultationVaccinations.length > 0
          ? `Consultation + ${consultationVaccinations.length} vaccin(s) enregistrés ! Carnet de santé mis à jour.`
          : 'Consultation enregistrée ! Carnet de santé mis à jour.'
      );
      setShowConsultationModal(false);
    } catch (error) {
      toast.error(error.response?.data?.error || 'Erreur lors de l\'enregistrement');
    } finally {
      setIsSaving(false);
    }
  };

  // Navigate dates
  const changeDate = (delta) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + delta);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const goToToday = () => setSelectedDate(new Date().toISOString().split('T')[0]);

  const isToday = selectedDate === new Date().toISOString().split('T')[0];
  const appointments = appointmentsData?.appointments || [];
  const pending = appointments.filter(a => a.status === 'PENDING').length;
  const confirmed = appointments.filter(a => a.status === 'CONFIRMED').length;
  const completed = appointments.filter(a => a.status === 'COMPLETED').length;

  const styles = {
    container: { animation: 'fadeIn 0.4s ease-in' },
    header: { marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
    title: {
      fontFamily: "'Fraunces', serif", fontSize: '2.5rem', marginBottom: '0.5rem',
      color: '#3E2723', fontWeight: 700,
    },
    subtitle: { color: '#78716C', fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '0.5rem' },
    dateSelector: {
      display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '2rem',
      padding: '1.25rem 1.5rem', background: '#fff', borderRadius: '18px',
      boxShadow: '0 2px 15px rgba(184, 112, 79, 0.06)', border: '1px solid rgba(184, 112, 79, 0.08)',
    },
    navBtn: {
      background: '#FFF8F0', border: 'none', borderRadius: '10px', padding: '0.6rem',
      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
      transition: 'all 0.2s',
    },
    button: {
      background: 'linear-gradient(135deg, #B8704F 0%, #D4956C 100%)', color: '#fff',
      border: 'none', borderRadius: '14px', padding: '0.875rem 1.75rem', fontSize: '0.95rem',
      fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem',
      transition: 'all 0.3s', boxShadow: '0 4px 15px rgba(184, 112, 79, 0.2)',
    },
    appointmentCard: {
      background: '#fff', borderRadius: '20px', padding: '1.5rem 2rem', marginBottom: '1rem',
      boxShadow: '0 2px 15px rgba(184, 112, 79, 0.06)', border: '1px solid rgba(184, 112, 79, 0.08)',
      transition: 'all 0.3s', position: 'relative',
    },
    urgentBadge: {
      position: 'absolute', top: '-1px', right: '20px',
      background: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)', color: '#fff',
      padding: '0.35rem 1rem', borderRadius: '0 0 10px 10px', fontSize: '0.75rem',
      fontWeight: 700, boxShadow: '0 4px 12px rgba(220, 38, 38, 0.25)',
    },
    modal: {
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(62, 39, 35, 0.6)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, animation: 'fadeIn 0.2s ease',
    },
    modalContent: {
      background: '#fff', borderRadius: '24px', padding: '2.5rem',
      maxWidth: '900px', width: '95%', maxHeight: '92vh', overflow: 'auto',
      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
    },
    sectionCard: {
      background: 'linear-gradient(135deg, #FFF8F0 0%, #F5E6D3 100%)',
      borderRadius: '18px', padding: '2rem', marginBottom: '1.5rem',
      border: '1px solid rgba(184, 112, 79, 0.1)',
    },
    stepIndicator: { display: 'flex', justifyContent: 'center', gap: '0.75rem', marginBottom: '2rem' },
    step: {
      width: '44px', height: '44px', borderRadius: '50%', display: 'flex',
      alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '1rem',
      transition: 'all 0.3s',
    },
    inputStyle: {
      width: '100%', padding: '0.875rem 1.25rem', borderRadius: '12px',
      border: '2px solid #F5E6D3', fontSize: '0.95rem', boxSizing: 'border-box',
      fontFamily: 'inherit', transition: 'border-color 0.2s',
    },
    labelStyle: { display: 'block', marginBottom: '0.4rem', fontWeight: 600, color: '#3E2723', fontSize: '0.9rem' },
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Rendez-vous</h1>
          <p style={styles.subtitle}>
            <Clock size={18} />
            Gérez votre agenda en toute simplicité
          </p>
        </div>
        <button onClick={openModal} style={styles.button}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <Plus size={20} /> Nouveau rendez-vous
        </button>
      </div>

      {/* Date navigation */}
      <div style={styles.dateSelector}>
        <button onClick={() => changeDate(-1)} style={styles.navBtn}
          onMouseEnter={(e) => e.currentTarget.style.background = '#F5E6D3'}
          onMouseLeave={(e) => e.currentTarget.style.background = '#FFF8F0'}
        >
          <ChevronLeft size={20} color="#B8704F" />
        </button>
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          style={{
            padding: '0.75rem 1.25rem', borderRadius: '12px',
            border: '2px solid #F5E6D3', fontSize: '0.95rem', fontWeight: 600,
          }}
        />
        <button onClick={() => changeDate(1)} style={styles.navBtn}
          onMouseEnter={(e) => e.currentTarget.style.background = '#F5E6D3'}
          onMouseLeave={(e) => e.currentTarget.style.background = '#FFF8F0'}
        >
          <ChevronRight size={20} color="#B8704F" />
        </button>
        {!isToday && (
          <button onClick={goToToday} style={{
            ...styles.navBtn, padding: '0.6rem 1rem', fontSize: '0.85rem',
            fontWeight: 600, color: '#B8704F', gap: '0.3rem', display: 'flex',
          }}>
            Aujourd'hui
          </button>
        )}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.75rem' }}>
          {pending > 0 && (
            <span style={{ background: '#fef3c7', color: '#d97706', padding: '0.4rem 0.8rem', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 600 }}>
              {pending} en attente
            </span>
          )}
          {confirmed > 0 && (
            <span style={{ background: '#dbeafe', color: '#2563eb', padding: '0.4rem 0.8rem', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 600 }}>
              {confirmed} confirmé{confirmed > 1 ? 's' : ''}
            </span>
          )}
          {completed > 0 && (
            <span style={{ background: '#dcfce7', color: '#16a34a', padding: '0.4rem 0.8rem', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 600 }}>
              {completed} terminé{completed > 1 ? 's' : ''}
            </span>
          )}
          <span style={{
            background: 'linear-gradient(135deg, #B8704F 0%, #D4956C 100%)',
            color: '#fff', padding: '0.4rem 0.8rem', borderRadius: '10px',
            fontSize: '0.85rem', fontWeight: 600,
          }}>
            {appointments.length} total
          </span>
        </div>
      </div>

      {/* Appointments list */}
      {isLoading ? (
        <AppointmentSkeleton count={3} />
      ) : appointments.length === 0 ? (
        <div style={{
          background: '#fff', borderRadius: '24px', padding: '4rem 2rem',
          textAlign: 'center', boxShadow: '0 2px 15px rgba(184, 112, 79, 0.06)',
          border: '1px solid rgba(184, 112, 79, 0.08)',
        }}>
          <Calendar size={48} color="#D4956C" style={{ marginBottom: '1rem', opacity: 0.5 }} />
          <h3 style={{ color: '#3E2723', fontSize: '1.3rem', marginBottom: '0.5rem' }}>
            Aucun rendez-vous
          </h3>
          <p style={{ color: '#78716C', marginBottom: '1.5rem' }}>
            Pas de rendez-vous prévu pour le {new Date(selectedDate).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
          <button onClick={openModal} style={{ ...styles.button, margin: '0 auto' }}>
            <Plus size={18} /> Créer un rendez-vous
          </button>
        </div>
      ) : (
        appointments.map((apt) => {
          const status = statusConfig[apt.status] || statusConfig.PENDING;
          return (
            <div
              key={apt.id}
              style={{
                ...styles.appointmentCard,
                borderLeft: apt.isUrgent ? '5px solid #dc2626' : `5px solid ${status.color}`,
                opacity: apt.status === 'CANCELLED' ? 0.6 : 1,
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              {apt.isUrgent && <div style={styles.urgentBadge}>URGENT</div>}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                  {/* Time badge */}
                  <div style={{
                    background: `${status.color}12`, padding: '0.6rem 1.2rem',
                    borderRadius: '12px', fontWeight: 700, fontSize: '1.1rem',
                    color: status.color, minWidth: '70px', textAlign: 'center',
                  }}>
                    {new Date(apt.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </div>

                  {/* Animal emoji */}
                  <div style={{ fontSize: '2rem' }}>
                    {speciesEmoji[apt.animal?.species] || '🐾'}
                  </div>

                  {/* Info */}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.3rem' }}>
                      <span style={{ fontWeight: 700, fontSize: '1.15rem', color: '#3E2723' }}>
                        {apt.animal?.name}
                      </span>
                      <span style={{
                        background: status.bg, color: status.color,
                        padding: '0.15rem 0.6rem', borderRadius: '6px',
                        fontSize: '0.75rem', fontWeight: 600,
                      }}>
                        {status.label}
                      </span>
                    </div>
                    <div style={{ color: '#8D6E63', fontSize: '0.9rem' }}>
                      {apt.animal?.owner?.firstName} {apt.animal?.owner?.lastName}
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.4rem', flexWrap: 'wrap' }}>
                      <span style={{ background: '#FFF8F0', padding: '0.25rem 0.6rem', borderRadius: '8px', fontSize: '0.8rem', color: '#6D4C41' }}>
                        {typeLabels[apt.type] || apt.type}
                      </span>
                      <span style={{ background: '#FFF8F0', padding: '0.25rem 0.6rem', borderRadius: '8px', fontSize: '0.8rem', color: '#6D4C41' }}>
                        {apt.duration} min
                      </span>
                      {apt.reason && (
                        <span style={{ background: '#FFF8F0', padding: '0.25rem 0.6rem', borderRadius: '8px', fontSize: '0.8rem', color: '#6D4C41' }}>
                          {apt.reason}
                        </span>
                      )}
                      {apt.veterinarian && (
                        <span style={{ background: '#FFF8F0', padding: '0.25rem 0.6rem', borderRadius: '8px', fontSize: '0.8rem', color: '#6D4C41' }}>
                          Dr. {apt.veterinarian.lastName}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '0.5rem', flexShrink: 0 }}>
                  {apt.status === 'PENDING' && (
                    <>
                      <button onClick={() => confirmAppointment(apt)} style={{
                        background: '#dbeafe', border: 'none', borderRadius: '10px',
                        padding: '0.6rem 1rem', cursor: 'pointer', display: 'flex',
                        alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem',
                        fontWeight: 600, color: '#2563eb', transition: 'all 0.2s',
                      }}
                        onMouseEnter={e => e.currentTarget.style.background = '#bfdbfe'}
                        onMouseLeave={e => e.currentTarget.style.background = '#dbeafe'}
                      >
                        <CheckCircle size={16} /> Confirmer
                      </button>
                      <button onClick={() => cancelAppointment(apt)} style={{
                        background: '#fef2f2', border: 'none', borderRadius: '10px',
                        padding: '0.6rem', cursor: 'pointer', transition: 'all 0.2s',
                      }}
                        onMouseEnter={e => e.currentTarget.style.background = '#fecaca'}
                        onMouseLeave={e => e.currentTarget.style.background = '#fef2f2'}
                        title="Annuler"
                      >
                        <Ban size={16} color="#dc2626" />
                      </button>
                    </>
                  )}
                  {(apt.status === 'CONFIRMED' || apt.status === 'PENDING') && apt.status !== 'CANCELLED' && (
                    <button onClick={() => startConsultation(apt)} style={{
                      background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                      color: '#fff', border: 'none', borderRadius: '10px',
                      padding: '0.6rem 1.2rem', cursor: 'pointer', display: 'flex',
                      alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem',
                      fontWeight: 600, transition: 'all 0.2s',
                      boxShadow: '0 2px 8px rgba(5, 150, 105, 0.2)',
                    }}
                      onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-1px)'}
                      onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
                    >
                      <PlayCircle size={16} /> Consultation
                    </button>
                  )}
                  {apt.status === 'CONFIRMED' && (
                    <button onClick={() => cancelAppointment(apt)} style={{
                      background: '#fef2f2', border: 'none', borderRadius: '10px',
                      padding: '0.6rem', cursor: 'pointer',
                    }} title="Annuler">
                      <Ban size={16} color="#dc2626" />
                    </button>
                  )}
                  {apt.status === 'COMPLETED' && (
                    <div style={{
                      background: '#dcfce7', color: '#16a34a',
                      padding: '0.6rem 1rem', borderRadius: '10px',
                      fontWeight: 600, fontSize: '0.85rem',
                      display: 'flex', alignItems: 'center', gap: '0.4rem',
                    }}>
                      <CheckCircle size={16} /> Terminé
                    </div>
                  )}
                  {apt.status === 'CANCELLED' && (
                    <div style={{
                      background: '#fef2f2', color: '#dc2626',
                      padding: '0.6rem 1rem', borderRadius: '10px',
                      fontWeight: 600, fontSize: '0.85rem',
                      display: 'flex', alignItems: 'center', gap: '0.4rem',
                    }}>
                      <XCircle size={16} /> Annulé
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })
      )}

      {/* ====== APPOINTMENT CREATION MODAL ====== */}
      {showModal && (
        <div style={styles.modal} onClick={closeModal}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
              <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: '1.8rem', color: '#3E2723' }}>
                Nouveau rendez-vous
              </h2>
              <button onClick={closeModal} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
                <X size={24} color="#78716C" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                {/* Animal */}
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={styles.labelStyle}>Patient *</label>
                  <select
                    value={formData.animalId}
                    onChange={(e) => setFormData({ ...formData, animalId: e.target.value })}
                    required
                    style={styles.inputStyle}
                  >
                    <option value="">Sélectionner un animal...</option>
                    {animalsData?.animals?.map(a => (
                      <option key={a.id} value={a.id}>
                        {speciesEmoji[a.species] || '🐾'} {a.name} — {a.owner?.firstName} {a.owner?.lastName}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date */}
                <div>
                  <label style={styles.labelStyle}>Date *</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                    style={styles.inputStyle}
                  />
                </div>

                {/* Time */}
                <div>
                  <label style={styles.labelStyle}>Heure *</label>
                  <input
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    required
                    style={styles.inputStyle}
                    min="08:00"
                    max="19:00"
                    step="900"
                  />
                </div>

                {/* Type */}
                <div>
                  <label style={styles.labelStyle}>Type *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    style={styles.inputStyle}
                  >
                    {Object.entries(typeLabels).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                </div>

                {/* Duration */}
                <div>
                  <label style={styles.labelStyle}>Durée</label>
                  <select
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                    style={styles.inputStyle}
                  >
                    <option value={15}>15 min</option>
                    <option value={30}>30 min</option>
                    <option value={45}>45 min</option>
                    <option value={60}>1 heure</option>
                    <option value={90}>1h30</option>
                    <option value={120}>2 heures</option>
                  </select>
                </div>

                {/* Reason */}
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={styles.labelStyle}>Motif</label>
                  <input
                    type="text"
                    value={formData.reason}
                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                    placeholder="Motif du rendez-vous..."
                    style={styles.inputStyle}
                  />
                </div>

                {/* Notes */}
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={styles.labelStyle}>Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Notes supplémentaires..."
                    rows={3}
                    style={{ ...styles.inputStyle, resize: 'vertical' }}
                  />
                </div>

                {/* Urgent toggle */}
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={{
                    display: 'flex', alignItems: 'center', gap: '0.75rem',
                    cursor: 'pointer', padding: '0.75rem 1rem',
                    background: formData.isUrgent ? '#fef2f2' : '#FFF8F0',
                    borderRadius: '12px', transition: 'all 0.2s',
                    border: formData.isUrgent ? '2px solid #fecaca' : '2px solid transparent',
                  }}>
                    <input
                      type="checkbox"
                      checked={formData.isUrgent}
                      onChange={(e) => setFormData({ ...formData, isUrgent: e.target.checked })}
                      style={{ width: '18px', height: '18px', accentColor: '#dc2626' }}
                    />
                    <AlertCircle size={18} color={formData.isUrgent ? '#dc2626' : '#78716C'} />
                    <span style={{ fontWeight: 600, color: formData.isUrgent ? '#dc2626' : '#3E2723' }}>
                      Rendez-vous urgent
                    </span>
                  </label>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  style={{ ...styles.button, flex: 1, justifyContent: 'center' }}
                >
                  <Save size={18} />
                  {createMutation.isPending ? 'Création...' : 'Créer le rendez-vous'}
                </button>
                <button type="button" onClick={closeModal} style={{
                  ...styles.button, background: '#F5E6D3', color: '#3E2723',
                  boxShadow: 'none',
                }}>
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ====== SMART CONSULTATION MODAL ====== */}
      {showConsultationModal && selectedAppointment && (
        <div style={styles.modal} onClick={() => !isSaving && setShowConsultationModal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            {/* Header avec infos animal */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div>
                <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: '1.8rem', marginBottom: '0.25rem', color: '#3E2723' }}>
                  Consultation en cours
                </h2>
                <p style={{ color: '#78716C', fontSize: '1rem' }}>
                  {speciesEmoji[selectedAppointment?.animal?.species] || '🐾'} {selectedAppointment?.animal?.name} — {selectedAppointment?.animal?.owner?.firstName} {selectedAppointment?.animal?.owner?.lastName}
                  {selectedAppointment?.reason && <span style={{ color: '#B8704F' }}> — {selectedAppointment.reason}</span>}
                </p>
              </div>
              <button onClick={() => !isSaving && setShowConsultationModal(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
                <X size={24} color="#78716C" />
              </button>
            </div>

            {/* Alertes santé — allergies, conditions chroniques */}
            {(selectedAppointment?.animal?.allergies || selectedAppointment?.animal?.chronicConditions) && (
              <div style={{
                background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '12px',
                padding: '0.85rem 1rem', marginBottom: '1.25rem',
                display: 'flex', alignItems: 'flex-start', gap: '0.6rem',
              }}>
                <AlertTriangle size={18} color="#DC2626" style={{ flexShrink: 0, marginTop: '0.1rem' }} />
                <div style={{ fontSize: '0.88rem' }}>
                  {selectedAppointment.animal.allergies && (
                    <div style={{ color: '#991B1B', marginBottom: '0.2rem' }}>
                      <strong>ALLERGIES :</strong> {selectedAppointment.animal.allergies}
                    </div>
                  )}
                  {selectedAppointment.animal.chronicConditions && (
                    <div style={{ color: '#92400E' }}>
                      <strong>CONDITIONS :</strong> {selectedAppointment.animal.chronicConditions}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step indicator */}
            <div style={styles.stepIndicator}>
              {[
                { n: 1, icon: Stethoscope, label: 'Examen' },
                { n: 2, icon: FileText, label: 'Diagnostic' },
                { n: 3, icon: Syringe, label: 'Vaccins' },
                { n: 4, icon: CheckCircle, label: 'Finaliser' },
              ].map(({ n, icon: Icon, label }) => (
                <div key={n} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem', cursor: 'pointer' }}
                  onClick={() => setConsultationStep(n)}
                >
                  <div style={{
                    ...styles.step,
                    background: consultationStep >= n
                      ? 'linear-gradient(135deg, #B8704F 0%, #D4956C 100%)'
                      : '#F5E6D3',
                    color: consultationStep >= n ? '#fff' : '#78716C',
                  }}>
                    <Icon size={18} />
                  </div>
                  <span style={{ fontSize: '0.7rem', color: consultationStep >= n ? '#B8704F' : '#78716C', fontWeight: 600 }}>{label}</span>
                </div>
              ))}
            </div>

            {/* ===== Step 1: Examen physique — enrichi ===== */}
            {consultationStep === 1 && (
              <div style={styles.sectionCard}>
                <h3 style={{ fontSize: '1.3rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#3E2723' }}>
                  <Stethoscope size={22} color="#B8704F" />
                  Examen physique
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.25rem' }}>
                  {/* Température avec norme */}
                  <div>
                    <label style={styles.labelStyle}>
                      <Thermometer size={14} style={{ verticalAlign: 'middle', marginRight: '0.3rem' }} />
                      Température (°C)
                    </label>
                    <input type="number" step="0.1" value={consultationData.temperature}
                      onChange={(e) => setConsultationData({ ...consultationData, temperature: e.target.value })}
                      placeholder={tempNorm ? tempNorm.label : '38.5'}
                      style={{
                        ...styles.inputStyle,
                        borderColor: tempOutOfRange ? '#DC2626' : undefined,
                        background: tempOutOfRange ? '#FEF2F2' : undefined,
                      }} />
                    {tempNorm && (
                      <div style={{ fontSize: '0.72rem', color: tempOutOfRange ? '#DC2626' : '#78716C', marginTop: '0.25rem', fontWeight: tempOutOfRange ? 600 : 400 }}>
                        {tempOutOfRange ? `Hors norme ! (${tempNorm.label})` : `Norme : ${tempNorm.label}`}
                      </div>
                    )}
                  </div>

                  {/* Poids avec delta */}
                  <div>
                    <label style={styles.labelStyle}>
                      <Weight size={14} style={{ verticalAlign: 'middle', marginRight: '0.3rem' }} />
                      Poids (kg)
                    </label>
                    <input type="number" step="0.1" value={consultationData.weight}
                      onChange={(e) => setConsultationData({ ...consultationData, weight: e.target.value })}
                      placeholder={previousWeight ? `Dernier : ${previousWeight} kg` : ''}
                      style={styles.inputStyle} />
                    {weightDelta !== null && parseFloat(weightDelta) !== 0 && (
                      <div style={{
                        fontSize: '0.78rem', marginTop: '0.25rem', fontWeight: 600,
                        display: 'flex', alignItems: 'center', gap: '0.25rem',
                        color: parseFloat(weightDelta) > 0 ? '#059669' : '#DC2626',
                      }}>
                        {parseFloat(weightDelta) > 0
                          ? <><TrendingUp size={13} /> +{weightDelta} kg depuis la dernière visite</>
                          : <><TrendingDown size={13} /> {weightDelta} kg depuis la dernière visite</>
                        }
                      </div>
                    )}
                    {weightDelta !== null && parseFloat(weightDelta) === 0 && (
                      <div style={{ fontSize: '0.72rem', color: '#78716C', marginTop: '0.25rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Minus size={13} /> Poids stable
                      </div>
                    )}
                  </div>

                  {/* Fréquence cardiaque */}
                  <div>
                    <label style={styles.labelStyle}>
                      <Heart size={14} style={{ verticalAlign: 'middle', marginRight: '0.3rem' }} />
                      Fréq. cardiaque (bpm)
                    </label>
                    <input type="number" value={consultationData.heartRate}
                      onChange={(e) => setConsultationData({ ...consultationData, heartRate: e.target.value })}
                      placeholder="80" style={styles.inputStyle} />
                  </div>
                </div>

                <div style={{ marginTop: '1.25rem' }}>
                  <label style={styles.labelStyle}>Symptômes observés</label>
                  <textarea value={consultationData.symptoms}
                    onChange={(e) => setConsultationData({ ...consultationData, symptoms: e.target.value })}
                    placeholder="Décrire les symptômes observés lors de l'examen..."
                    rows={4} style={{ ...styles.inputStyle, resize: 'vertical' }} />
                </div>

                <button onClick={() => setConsultationStep(2)} style={{
                  ...styles.button, width: '100%', justifyContent: 'center', marginTop: '1.5rem',
                }}>
                  Suivant : Diagnostic
                </button>
              </div>
            )}

            {/* ===== Step 2: Diagnostic + Traitement (combinés) ===== */}
            {consultationStep === 2 && (
              <div style={styles.sectionCard}>
                <h3 style={{ fontSize: '1.3rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#3E2723' }}>
                  <FileText size={22} color="#B8704F" />
                  Diagnostic & Traitement
                </h3>
                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={styles.labelStyle}>Diagnostic</label>
                  <textarea value={consultationData.diagnosis}
                    onChange={(e) => setConsultationData({ ...consultationData, diagnosis: e.target.value })}
                    placeholder="Diagnostic détaillé..."
                    rows={4} style={{ ...styles.inputStyle, resize: 'vertical' }} />
                </div>
                <div>
                  <label style={styles.labelStyle}>
                    <Pill size={14} style={{ verticalAlign: 'middle', marginRight: '0.3rem' }} />
                    Plan de traitement
                  </label>
                  <textarea value={consultationData.treatment}
                    onChange={(e) => setConsultationData({ ...consultationData, treatment: e.target.value })}
                    placeholder="Décrire le traitement recommandé, posologie..."
                    rows={4} style={{ ...styles.inputStyle, resize: 'vertical' }} />
                </div>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                  <button onClick={() => setConsultationStep(1)} style={{
                    ...styles.button, flex: 1, justifyContent: 'center',
                    background: '#F5E6D3', color: '#3E2723', boxShadow: 'none',
                  }}>Retour</button>
                  <button onClick={() => setConsultationStep(3)} style={{
                    ...styles.button, flex: 1, justifyContent: 'center',
                  }}>Suivant : Vaccins</button>
                </div>
              </div>
            )}

            {/* ===== Step 3: VACCINATIONS — Nouveau ! ===== */}
            {consultationStep === 3 && (
              <div style={styles.sectionCard}>
                <h3 style={{ fontSize: '1.3rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#3E2723' }}>
                  <Syringe size={22} color="#B8704F" />
                  Vaccinations
                </h3>
                <p style={{ color: '#78716C', fontSize: '0.88rem', marginBottom: '1.25rem' }}>
                  Ajoutez les vaccins administrés pendant cette consultation. Ils seront automatiquement inscrits dans le carnet de santé.
                </p>

                {/* Suggestions rapides par espèce */}
                {vaccineSuggestions.length > 0 && (
                  <div style={{ marginBottom: '1.25rem' }}>
                    <label style={{ ...styles.labelStyle, fontSize: '0.82rem', color: '#78716C' }}>
                      Vaccins courants ({speciesEmoji[species]} {species === 'DOG' ? 'Chien' : species === 'CAT' ? 'Chat' : species === 'RABBIT' ? 'Lapin' : 'Animal'}) :
                    </label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                      {vaccineSuggestions.map((sugg, i) => {
                        const alreadyAdded = consultationVaccinations.some(v => v.name === sugg.name);
                        return (
                          <button
                            key={i}
                            onClick={() => !alreadyAdded && addVaccination(sugg)}
                            disabled={alreadyAdded}
                            style={{
                              background: alreadyAdded ? '#ECFDF5' : '#fff',
                              border: alreadyAdded ? '1.5px solid #059669' : '1.5px solid #E7E5E4',
                              borderRadius: '8px', padding: '0.4rem 0.75rem',
                              fontSize: '0.82rem', cursor: alreadyAdded ? 'default' : 'pointer',
                              color: alreadyAdded ? '#059669' : '#3E2723',
                              fontWeight: 500, transition: 'all 0.15s',
                              display: 'flex', alignItems: 'center', gap: '0.3rem',
                            }}
                            title={sugg.description}
                          >
                            {alreadyAdded ? <CheckCircle size={13} /> : <Plus size={13} />}
                            {sugg.name}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Vaccinations ajoutées */}
                {consultationVaccinations.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.25rem' }}>
                    {consultationVaccinations.map((vacc) => (
                      <div key={vacc.id} style={{
                        background: '#fff', borderRadius: '12px', padding: '1rem',
                        border: '1px solid rgba(184, 112, 79, 0.1)',
                        position: 'relative',
                      }}>
                        <button
                          onClick={() => removeVaccination(vacc.id)}
                          style={{
                            position: 'absolute', top: '0.5rem', right: '0.5rem',
                            background: '#FEF2F2', border: 'none', borderRadius: '6px',
                            padding: '0.3rem', cursor: 'pointer',
                          }}
                        >
                          <Trash2 size={14} color="#DC2626" />
                        </button>

                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                          <div>
                            <label style={{ ...styles.labelStyle, fontSize: '0.82rem' }}>Nom du vaccin *</label>
                            <input type="text" value={vacc.name}
                              onChange={(e) => updateVaccination(vacc.id, 'name', e.target.value)}
                              placeholder="Nom du vaccin"
                              style={{ ...styles.inputStyle, padding: '0.65rem 0.85rem', fontSize: '0.88rem' }} />
                          </div>
                          <div>
                            <label style={{ ...styles.labelStyle, fontSize: '0.82rem' }}>N° de lot</label>
                            <input type="text" value={vacc.batchNumber}
                              onChange={(e) => updateVaccination(vacc.id, 'batchNumber', e.target.value)}
                              placeholder="N° lot"
                              style={{ ...styles.inputStyle, padding: '0.65rem 0.85rem', fontSize: '0.88rem' }} />
                          </div>
                          <div>
                            <label style={{ ...styles.labelStyle, fontSize: '0.82rem' }}>
                              <Shield size={12} style={{ verticalAlign: 'middle', marginRight: '0.2rem' }} />
                              Prochain rappel
                            </label>
                            <input type="date" value={vacc.nextDueDate}
                              onChange={(e) => updateVaccination(vacc.id, 'nextDueDate', e.target.value)}
                              style={{ ...styles.inputStyle, padding: '0.65rem 0.85rem', fontSize: '0.88rem' }} />
                            {vacc.nextDueDate && (
                              <div style={{ fontSize: '0.72rem', color: '#059669', marginTop: '0.2rem' }}>
                                Rappel le {new Date(vacc.nextDueDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                              </div>
                            )}
                          </div>
                          <div>
                            <label style={{ ...styles.labelStyle, fontSize: '0.82rem' }}>Notes</label>
                            <input type="text" value={vacc.notes}
                              onChange={(e) => updateVaccination(vacc.id, 'notes', e.target.value)}
                              placeholder="Notes (optionnel)"
                              style={{ ...styles.inputStyle, padding: '0.65rem 0.85rem', fontSize: '0.88rem' }} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Bouton ajouter manuellement */}
                <button onClick={() => addVaccination()} style={{
                  background: '#fff', border: '2px dashed #E7E5E4', borderRadius: '12px',
                  padding: '0.85rem', width: '100%', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                  fontSize: '0.88rem', color: '#78716C', fontWeight: 600, transition: 'all 0.15s',
                }}>
                  <Plus size={16} /> Ajouter un vaccin manuellement
                </button>

                {consultationVaccinations.length === 0 && (
                  <p style={{ fontSize: '0.82rem', color: '#A8A29E', textAlign: 'center', marginTop: '0.75rem' }}>
                    Aucun vaccin ? Pas de souci, passez directement à la finalisation.
                  </p>
                )}

                <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                  <button onClick={() => setConsultationStep(2)} style={{
                    ...styles.button, flex: 1, justifyContent: 'center',
                    background: '#F5E6D3', color: '#3E2723', boxShadow: 'none',
                  }}>Retour</button>
                  <button onClick={() => setConsultationStep(4)} style={{
                    ...styles.button, flex: 1, justifyContent: 'center',
                  }}>Suivant : Finaliser</button>
                </div>
              </div>
            )}

            {/* ===== Step 4: Finalisation — résumé complet ===== */}
            {consultationStep === 4 && (
              <div style={styles.sectionCard}>
                <h3 style={{ fontSize: '1.3rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#3E2723' }}>
                  <CheckCircle size={22} color="#B8704F" />
                  Résumé & Enregistrement
                </h3>

                {/* Résumé complet */}
                <div style={{
                  background: '#fff', borderRadius: '12px', padding: '1.25rem',
                  marginBottom: '1.25rem', border: '1px solid rgba(184, 112, 79, 0.1)',
                }}>
                  <h4 style={{ fontSize: '0.85rem', color: '#78716C', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    Examen & Constantes
                  </h4>
                  <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                    {consultationData.temperature && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.9rem' }}>
                        <Thermometer size={15} color={tempOutOfRange ? '#DC2626' : '#059669'} />
                        <strong>{consultationData.temperature}°C</strong>
                        {tempOutOfRange && <span style={{ color: '#DC2626', fontSize: '0.75rem', fontWeight: 600 }}>(!)</span>}
                      </div>
                    )}
                    {consultationData.weight && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.9rem' }}>
                        <Weight size={15} color="#B8704F" />
                        <strong>{consultationData.weight} kg</strong>
                        {weightDelta && parseFloat(weightDelta) !== 0 && (
                          <span style={{
                            fontSize: '0.78rem', fontWeight: 600,
                            color: parseFloat(weightDelta) > 0 ? '#059669' : '#DC2626',
                          }}>
                            ({parseFloat(weightDelta) > 0 ? '+' : ''}{weightDelta})
                          </span>
                        )}
                      </div>
                    )}
                    {consultationData.heartRate && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.9rem' }}>
                        <Heart size={15} color="#DC2626" />
                        <strong>{consultationData.heartRate} bpm</strong>
                      </div>
                    )}
                  </div>

                  {consultationData.symptoms && (
                    <div style={{ padding: '0.5rem 0.75rem', background: '#FFF8F0', borderRadius: '8px', fontSize: '0.88rem', marginBottom: '0.5rem' }}>
                      <strong style={{ color: '#B8704F' }}>Symptômes :</strong> {consultationData.symptoms}
                    </div>
                  )}
                  {consultationData.diagnosis && (
                    <div style={{ padding: '0.5rem 0.75rem', background: '#EFF6FF', borderRadius: '8px', fontSize: '0.88rem', marginBottom: '0.5rem' }}>
                      <strong style={{ color: '#2563EB' }}>Diagnostic :</strong> {consultationData.diagnosis}
                    </div>
                  )}
                  {consultationData.treatment && (
                    <div style={{ padding: '0.5rem 0.75rem', background: '#ECFDF5', borderRadius: '8px', fontSize: '0.88rem' }}>
                      <strong style={{ color: '#059669' }}>Traitement :</strong> {consultationData.treatment}
                    </div>
                  )}
                </div>

                {/* Vaccinations résumé */}
                {consultationVaccinations.length > 0 && (
                  <div style={{
                    background: '#fff', borderRadius: '12px', padding: '1rem',
                    marginBottom: '1.25rem', border: '1px solid rgba(5, 150, 105, 0.15)',
                  }}>
                    <h4 style={{ fontSize: '0.85rem', color: '#059669', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Syringe size={14} />
                      {consultationVaccinations.length} vaccination{consultationVaccinations.length > 1 ? 's' : ''} à enregistrer
                    </h4>
                    {consultationVaccinations.filter(v => v.name.trim()).map(v => (
                      <div key={v.id} style={{ fontSize: '0.88rem', padding: '0.3rem 0', color: '#3E2723', display: 'flex', justifyContent: 'space-between' }}>
                        <span><strong>{v.name}</strong>{v.batchNumber && ` — Lot ${v.batchNumber}`}</span>
                        {v.nextDueDate && <span style={{ color: '#78716C', fontSize: '0.82rem' }}>Rappel : {new Date(v.nextDueDate).toLocaleDateString('fr-FR')}</span>}
                      </div>
                    ))}
                  </div>
                )}

                {/* Notes + prochain RDV */}
                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={styles.labelStyle}>Notes complémentaires</label>
                  <textarea value={consultationData.notes}
                    onChange={(e) => setConsultationData({ ...consultationData, notes: e.target.value })}
                    placeholder="Notes additionnelles pour le carnet de santé..."
                    rows={3} style={{ ...styles.inputStyle, resize: 'vertical' }} />
                </div>
                <div style={{ marginBottom: '0.5rem' }}>
                  <label style={styles.labelStyle}>Prochain rendez-vous (optionnel)</label>
                  <input type="date" value={consultationData.nextAppointment}
                    onChange={(e) => setConsultationData({ ...consultationData, nextAppointment: e.target.value })}
                    style={styles.inputStyle} />
                </div>

                {/* Ce qui sera mis à jour */}
                <div style={{
                  background: '#F0FDF4', borderRadius: '10px', padding: '0.75rem 1rem',
                  marginTop: '1rem', marginBottom: '0.5rem',
                  fontSize: '0.82rem', color: '#166534',
                }}>
                  <strong>Carnet de santé mis à jour automatiquement :</strong>
                  <ul style={{ margin: '0.35rem 0 0 1rem', lineHeight: 1.8 }}>
                    <li>Consultation ajoutée à l'historique médical</li>
                    {consultationData.weight && <li>Poids mis à jour ({consultationData.weight} kg) + courbe de poids</li>}
                    {consultationVaccinations.length > 0 && <li>{consultationVaccinations.length} vaccination(s) ajoutée(s) avec rappels</li>}
                    <li>Rendez-vous marqué comme terminé</li>
                  </ul>
                </div>

                <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                  <button onClick={() => setConsultationStep(3)} disabled={isSaving} style={{
                    ...styles.button, flex: 1, justifyContent: 'center',
                    background: '#F5E6D3', color: '#3E2723', boxShadow: 'none',
                  }}>Retour</button>
                  <button onClick={saveConsultation} disabled={isSaving} style={{
                    ...styles.button, flex: 2, justifyContent: 'center',
                    background: isSaving
                      ? '#9CA3AF'
                      : 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                    boxShadow: '0 4px 15px rgba(5, 150, 105, 0.25)',
                    opacity: isSaving ? 0.7 : 1,
                  }}>
                    {isSaving ? (
                      <><Clock size={18} /> Enregistrement...</>
                    ) : (
                      <><CheckCircle size={18} /> Enregistrer la consultation</>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AppointmentsPagePremium;
