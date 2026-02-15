import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { appointmentsAPI, animalsAPI, consultationsAPI } from '../services/api';
import toast from 'react-hot-toast';
import { AppointmentSkeleton } from '../components/LoadingSkeleton';
import {
  Calendar, Clock, Plus, X, Save, CheckCircle,
  PlayCircle, FileText, Stethoscope, Pill, AlertCircle,
  XCircle, ChevronLeft, ChevronRight, Ban
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

const AppointmentsPagePremium = () => {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [showConsultationModal, setShowConsultationModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [consultationStep, setConsultationStep] = useState(1);
  const [consultationData, setConsultationData] = useState({
    symptoms: '', temperature: '', weight: '', heartRate: '',
    diagnosis: '', treatment: '', notes: '', nextAppointment: '',
  });

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
      symptoms: '', temperature: '', weight: appointment.animal.weight || '',
      heartRate: '', diagnosis: '', treatment: '', notes: '', nextAppointment: '',
    });
    setConsultationStep(1);
    setShowConsultationModal(true);
  };

  const saveConsultation = async () => {
    try {
      await consultationsAPI.create({
        appointmentId: selectedAppointment.id,
        animalId: selectedAppointment.animal.id,
        ...consultationData,
      });
      await appointmentsAPI.updateStatus(selectedAppointment.id, 'COMPLETED');
      queryClient.invalidateQueries(['appointments']);
      toast.success('Consultation enregistrée !');
      setShowConsultationModal(false);
    } catch (error) {
      toast.error('Erreur lors de l\'enregistrement');
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
    subtitle: { color: '#A1887F', fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '0.5rem' },
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
          <p style={{ color: '#A1887F', marginBottom: '1.5rem' }}>
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
                <X size={24} color="#A1887F" />
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
                    <AlertCircle size={18} color={formData.isUrgent ? '#dc2626' : '#A1887F'} />
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

      {/* ====== CONSULTATION MODAL ====== */}
      {showConsultationModal && (
        <div style={styles.modal} onClick={() => setShowConsultationModal(false)}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
              <div>
                <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: '1.8rem', marginBottom: '0.25rem', color: '#3E2723' }}>
                  Consultation en cours
                </h2>
                <p style={{ color: '#A1887F', fontSize: '1rem' }}>
                  {speciesEmoji[selectedAppointment?.animal?.species] || '🐾'} {selectedAppointment?.animal?.name} — {selectedAppointment?.animal?.owner?.firstName} {selectedAppointment?.animal?.owner?.lastName}
                </p>
              </div>
              <button onClick={() => setShowConsultationModal(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
                <X size={24} color="#A1887F" />
              </button>
            </div>

            {/* Step indicator */}
            <div style={styles.stepIndicator}>
              {[
                { n: 1, label: 'Examen' },
                { n: 2, label: 'Diagnostic' },
                { n: 3, label: 'Traitement' },
                { n: 4, label: 'Finaliser' },
              ].map(({ n, label }) => (
                <div key={n} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.3rem' }}>
                  <div style={{
                    ...styles.step,
                    background: consultationStep >= n
                      ? 'linear-gradient(135deg, #B8704F 0%, #D4956C 100%)'
                      : '#F5E6D3',
                    color: consultationStep >= n ? '#fff' : '#A1887F',
                  }}>
                    {n}
                  </div>
                  <span style={{ fontSize: '0.7rem', color: consultationStep >= n ? '#B8704F' : '#A1887F', fontWeight: 600 }}>{label}</span>
                </div>
              ))}
            </div>

            {/* Step 1: Examen physique */}
            {consultationStep === 1 && (
              <div style={styles.sectionCard}>
                <h3 style={{ fontSize: '1.3rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#3E2723' }}>
                  <Stethoscope size={22} color="#B8704F" />
                  Examen physique
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.25rem' }}>
                  <div>
                    <label style={styles.labelStyle}>Température (°C)</label>
                    <input type="number" step="0.1" value={consultationData.temperature}
                      onChange={(e) => setConsultationData({ ...consultationData, temperature: e.target.value })}
                      placeholder="38.5" style={styles.inputStyle} />
                  </div>
                  <div>
                    <label style={styles.labelStyle}>Poids (kg)</label>
                    <input type="number" step="0.1" value={consultationData.weight}
                      onChange={(e) => setConsultationData({ ...consultationData, weight: e.target.value })}
                      placeholder="25.5" style={styles.inputStyle} />
                  </div>
                  <div>
                    <label style={styles.labelStyle}>Fréq. cardiaque (bpm)</label>
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

            {/* Step 2: Diagnostic */}
            {consultationStep === 2 && (
              <div style={styles.sectionCard}>
                <h3 style={{ fontSize: '1.3rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#3E2723' }}>
                  <FileText size={22} color="#B8704F" />
                  Diagnostic
                </h3>
                <div>
                  <label style={styles.labelStyle}>Diagnostic principal</label>
                  <textarea value={consultationData.diagnosis}
                    onChange={(e) => setConsultationData({ ...consultationData, diagnosis: e.target.value })}
                    placeholder="Diagnostic détaillé..."
                    rows={5} style={{ ...styles.inputStyle, resize: 'vertical' }} />
                </div>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                  <button onClick={() => setConsultationStep(1)} style={{
                    ...styles.button, flex: 1, justifyContent: 'center',
                    background: '#F5E6D3', color: '#3E2723', boxShadow: 'none',
                  }}>Retour</button>
                  <button onClick={() => setConsultationStep(3)} style={{
                    ...styles.button, flex: 1, justifyContent: 'center',
                  }}>Suivant : Traitement</button>
                </div>
              </div>
            )}

            {/* Step 3: Traitement */}
            {consultationStep === 3 && (
              <div style={styles.sectionCard}>
                <h3 style={{ fontSize: '1.3rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#3E2723' }}>
                  <Pill size={22} color="#B8704F" />
                  Traitement & Prescriptions
                </h3>
                <div>
                  <label style={styles.labelStyle}>Plan de traitement</label>
                  <textarea value={consultationData.treatment}
                    onChange={(e) => setConsultationData({ ...consultationData, treatment: e.target.value })}
                    placeholder="Décrire le traitement recommandé..."
                    rows={4} style={{ ...styles.inputStyle, resize: 'vertical' }} />
                </div>
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

            {/* Step 4: Finalisation */}
            {consultationStep === 4 && (
              <div style={styles.sectionCard}>
                <h3 style={{ fontSize: '1.3rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#3E2723' }}>
                  <CheckCircle size={22} color="#B8704F" />
                  Finalisation & Suivi
                </h3>

                {/* Summary */}
                <div style={{
                  background: '#fff', borderRadius: '12px', padding: '1.25rem',
                  marginBottom: '1.25rem', border: '1px solid rgba(184, 112, 79, 0.1)',
                }}>
                  <h4 style={{ fontSize: '0.9rem', color: '#A1887F', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Résumé</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.9rem' }}>
                    {consultationData.temperature && <div><strong style={{ color: '#8D6E63' }}>Temp:</strong> <span style={{ color: '#3E2723' }}>{consultationData.temperature}°C</span></div>}
                    {consultationData.weight && <div><strong style={{ color: '#8D6E63' }}>Poids:</strong> <span style={{ color: '#3E2723' }}>{consultationData.weight} kg</span></div>}
                    {consultationData.heartRate && <div><strong style={{ color: '#8D6E63' }}>FC:</strong> <span style={{ color: '#3E2723' }}>{consultationData.heartRate} bpm</span></div>}
                    {consultationData.symptoms && <div style={{ gridColumn: '1 / -1' }}><strong style={{ color: '#8D6E63' }}>Symptômes:</strong> <span style={{ color: '#3E2723' }}>{consultationData.symptoms}</span></div>}
                    {consultationData.diagnosis && <div style={{ gridColumn: '1 / -1' }}><strong style={{ color: '#8D6E63' }}>Diagnostic:</strong> <span style={{ color: '#3E2723' }}>{consultationData.diagnosis}</span></div>}
                    {consultationData.treatment && <div style={{ gridColumn: '1 / -1' }}><strong style={{ color: '#8D6E63' }}>Traitement:</strong> <span style={{ color: '#3E2723' }}>{consultationData.treatment}</span></div>}
                  </div>
                </div>

                <div style={{ marginBottom: '1.25rem' }}>
                  <label style={styles.labelStyle}>Notes complémentaires</label>
                  <textarea value={consultationData.notes}
                    onChange={(e) => setConsultationData({ ...consultationData, notes: e.target.value })}
                    placeholder="Notes additionnelles..."
                    rows={3} style={{ ...styles.inputStyle, resize: 'vertical' }} />
                </div>
                <div>
                  <label style={styles.labelStyle}>Prochain rendez-vous (optionnel)</label>
                  <input type="date" value={consultationData.nextAppointment}
                    onChange={(e) => setConsultationData({ ...consultationData, nextAppointment: e.target.value })}
                    style={styles.inputStyle} />
                </div>
                <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
                  <button onClick={() => setConsultationStep(3)} style={{
                    ...styles.button, flex: 1, justifyContent: 'center',
                    background: '#F5E6D3', color: '#3E2723', boxShadow: 'none',
                  }}>Retour</button>
                  <button onClick={saveConsultation} style={{
                    ...styles.button, flex: 2, justifyContent: 'center',
                    background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                    boxShadow: '0 4px 15px rgba(5, 150, 105, 0.25)',
                  }}>
                    <CheckCircle size={18} />
                    Enregistrer la consultation
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
