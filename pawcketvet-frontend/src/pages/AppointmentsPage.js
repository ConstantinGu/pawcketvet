import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { appointmentsAPI, animalsAPI } from '../services/api';
import toast from 'react-hot-toast';
import { Calendar, Clock, Plus, X, Save, Edit2, Trash2, CheckCircle } from 'lucide-react';

const AppointmentsPage = () => {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
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
      toast.success('Rendez-vous créé !');
      closeModal();
    },
    onError: () => toast.error('Erreur lors de la création'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => appointmentsAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['appointments']);
      toast.success('Rendez-vous modifié !');
      closeModal();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => appointmentsAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['appointments']);
      toast.success('Rendez-vous annulé !');
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => appointmentsAPI.updateStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries(['appointments']);
      toast.success('Statut mis à jour !');
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

  const handleSubmit = (e) => {
    e.preventDefault();
    const datetime = new Date(`${formData.date}T${formData.time}`);
    
    const data = {
      ...formData,
      date: datetime.toISOString(),
    };

    if (selectedAppointment) {
      updateMutation.mutate({ id: selectedAppointment.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      PENDING: '#d97706',
      CONFIRMED: '#B8704F',
      COMPLETED: '#059669',
      CANCELLED: '#dc2626',
      NOSHOW: '#64748b',
    };
    return colors[status] || '#78716C';
  };

  const getStatusLabel = (status) => {
    const labels = {
      PENDING: 'En attente',
      CONFIRMED: 'Confirmé',
      COMPLETED: 'Terminé',
      CANCELLED: 'Annulé',
      NOSHOW: 'Absent',
    };
    return labels[status] || status;
  };

  const styles = {
    header: {
      marginBottom: '2rem',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    title: {
      fontFamily: "'Fraunces', serif",
      fontSize: '2.5rem',
      marginBottom: '0.5rem',
      color: '#3E2723',
      fontWeight: 700,
    },
    dateSelector: {
      display: 'flex',
      gap: '1rem',
      alignItems: 'center',
      marginBottom: '2rem',
    },
    input: {
      padding: '0.875rem 1.25rem',
      borderRadius: '12px',
      border: '2px solid #F5E6D3',
      fontSize: '0.95rem',
    },
    button: {
      background: 'linear-gradient(135deg, #B8704F 0%, #D4956C 100%)',
      color: '#fff',
      border: 'none',
      borderRadius: '12px',
      padding: '0.875rem 1.75rem',
      fontSize: '0.95rem',
      fontWeight: 600,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
    },
    appointmentCard: {
      background: '#fff',
      borderRadius: '16px',
      padding: '1.5rem',
      marginBottom: '1rem',
      boxShadow: '0 2px 15px rgba(184, 112, 79, 0.06)',
      border: '1px solid rgba(184, 112, 79, 0.08)',
    },
    modal: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(45, 63, 47, 0.8)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    },
    modalContent: {
      background: '#fff',
      borderRadius: '24px',
      padding: '2.5rem',
      maxWidth: '600px',
      width: '90%',
      maxHeight: '90vh',
      overflow: 'auto',
    },
  };

  return (
    <>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>Rendez-vous</h1>
          <p style={{ color: '#78716C', fontSize: '1.05rem' }}>
            Gérez l'agenda de votre clinique
          </p>
        </div>
        <button onClick={() => openModal()} style={styles.button}>
          <Plus size={18} />
          Nouveau RDV
        </button>
      </div>

      <div style={styles.dateSelector}>
        <Calendar size={20} color="#B8704F" />
        <input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          style={styles.input}
        />
        <span style={{ color: '#6D4C41' }}>
          {appointmentsData?.count || 0} rendez-vous
        </span>
      </div>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#78716C' }}>
          Chargement...
        </div>
      ) : appointmentsData?.appointments?.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#78716C' }}>
          Aucun rendez-vous pour cette date
        </div>
      ) : (
        appointmentsData?.appointments?.map((apt) => (
          <div key={apt.id} style={{
            ...styles.appointmentCard,
            borderLeft: apt.isUrgent ? '4px solid #dc2626' : '4px solid #B8704F',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                  <Clock size={18} color="#B8704F" />
                  <span style={{ fontWeight: 600, fontSize: '1.1rem' }}>
                    {new Date(apt.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span style={{
                    background: getStatusColor(apt.status),
                    color: '#fff',
                    padding: '0.25rem 0.75rem',
                    borderRadius: '20px',
                    fontSize: '0.85rem',
                  }}>
                    {getStatusLabel(apt.status)}
                  </span>
                  {apt.isUrgent && (
                    <span style={{
                      background: '#dc2626',
                      color: '#fff',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '20px',
                      fontSize: '0.85rem',
                    }}>
                      URGENT
                    </span>
                  )}
                </div>
                <div style={{ marginBottom: '0.5rem' }}>
                  <strong style={{ fontSize: '1.1rem' }}>{apt.animal.name}</strong>
                  <span style={{ color: '#78716C', marginLeft: '0.5rem' }}>
                    • {apt.animal.owner.firstName} {apt.animal.owner.lastName}
                  </span>
                </div>
                <div style={{ color: '#6D4C41', fontSize: '0.9rem' }}>
                  {apt.type} • {apt.duration} min
                  {apt.reason && <> • {apt.reason}</>}
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-start' }}>
                {apt.status === 'PENDING' && (
                  <button
                    onClick={() => updateStatusMutation.mutate({ id: apt.id, status: 'CONFIRMED' })}
                    style={{
                      ...styles.button,
                      padding: '0.5rem',
                      background: '#059669',
                    }}
                    title="Confirmer"
                  >
                    <CheckCircle size={18} />
                  </button>
                )}
                <button
                  onClick={() => openModal(apt)}
                  style={{
                    ...styles.button,
                    padding: '0.5rem',
                  }}
                >
                  <Edit2 size={18} />
                </button>
                <button
                  onClick={() => {
                    if (window.confirm('Annuler ce rendez-vous ?')) {
                      deleteMutation.mutate(apt.id);
                    }
                  }}
                  style={{
                    ...styles.button,
                    background: '#dc2626',
                    padding: '0.5rem',
                  }}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          </div>
        ))
      )}

      {showModal && (
        <div style={styles.modal} onClick={closeModal}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
              <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: '1.8rem' }}>
                {selectedAppointment ? 'Modifier le RDV' : 'Nouveau RDV'}
              </h2>
              <button onClick={closeModal} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Patient *</label>
                <select
                  value={formData.animalId}
                  onChange={(e) => setFormData({ ...formData, animalId: e.target.value })}
                  required
                  style={{ ...styles.input, width: '100%' }}
                >
                  <option value="">Sélectionner un patient</option>
                  {animalsData?.animals?.map((animal) => (
                    <option key={animal.id} value={animal.id}>
                      {animal.name} - {animal.owner.firstName} {animal.owner.lastName}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Date *</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                    style={styles.input}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Heure *</label>
                  <input
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    required
                    style={styles.input}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Type *</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    style={styles.input}
                  >
                    <option value="CONSULTATION">Consultation</option>
                    <option value="VACCINATION">Vaccination</option>
                    <option value="SURGERY">Chirurgie</option>
                    <option value="FOLLOWUP">Suivi</option>
                    <option value="EMERGENCY">Urgence</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Durée (min)</label>
                  <input
                    type="number"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                    style={styles.input}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Motif</label>
                <input
                  type="text"
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  style={{ ...styles.input, width: '100%' }}
                />
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={formData.isUrgent}
                    onChange={(e) => setFormData({ ...formData, isUrgent: e.target.checked })}
                  />
                  <span style={{ fontWeight: 600 }}>Rendez-vous urgent</span>
                </label>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <button type="submit" style={{ ...styles.button, flex: 1, justifyContent: 'center' }}>
                  <Save size={18} />
                  {selectedAppointment ? 'Modifier' : 'Créer'}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  style={{
                    ...styles.button,
                    background: '#e8ede6',
                    color: '#3E2723',
                    boxShadow: 'none',
                  }}
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default AppointmentsPage;
