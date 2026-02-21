import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clinicAPI } from '../services/api';
import toast from 'react-hot-toast';
import { Save, Building2, MapPin, Phone, Mail, Globe, Clock } from 'lucide-react';

const daysOfWeek = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];

const ClinicSettingsPage = () => {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState(null);

  const { data: clinic, isLoading } = useQuery({
    queryKey: ['clinic'],
    queryFn: () => clinicAPI.getMyClinic().then(r => r.data),
    onSuccess: (data) => {
      if (!formData) {
        setFormData({
          name: data.name || '',
          address: data.address || '',
          city: data.city || '',
          postalCode: data.postalCode || '',
          country: data.country || 'France',
          phone: data.phone || '',
          email: data.email || '',
          website: data.website || '',
          description: data.description || '',
          openingHours: data.openingHours || daysOfWeek.reduce((acc, day) => ({
            ...acc,
            [day]: { open: '08:30', close: '18:30', closed: day === 'Dimanche' },
          }), {}),
        });
      }
    },
  });

  // Initialize formData when clinic data arrives
  if (clinic && !formData) {
    setFormData({
      name: clinic.name || '',
      address: clinic.address || '',
      city: clinic.city || '',
      postalCode: clinic.postalCode || '',
      country: clinic.country || 'France',
      phone: clinic.phone || '',
      email: clinic.email || '',
      website: clinic.website || '',
      description: clinic.description || '',
      openingHours: clinic.openingHours || daysOfWeek.reduce((acc, day) => ({
        ...acc,
        [day]: { open: '08:30', close: '18:30', closed: day === 'Dimanche' },
      }), {}),
    });
  }

  const updateMutation = useMutation({
    mutationFn: (data) => clinicAPI.update(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['clinic']);
      toast.success('Informations mises à jour');
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Erreur lors de la sauvegarde'),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  const updateHours = (day, field, value) => {
    setFormData({
      ...formData,
      openingHours: {
        ...formData.openingHours,
        [day]: { ...formData.openingHours[day], [field]: value },
      },
    });
  };

  const styles = {
    button: { background: 'linear-gradient(135deg, #B8704F 0%, #D4956C 100%)', color: '#fff', border: 'none', borderRadius: '12px', padding: '0.875rem 1.75rem', fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' },
    input: { width: '100%', padding: '0.875rem 1.25rem', borderRadius: '12px', border: '2px solid #F5E6D3', fontSize: '0.95rem', boxSizing: 'border-box' },
    label: { display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#3E2723', fontSize: '0.9rem' },
    section: { background: '#fff', borderRadius: '16px', padding: '2rem', boxShadow: '0 2px 12px rgba(184,112,79,0.06)', border: '1px solid rgba(184,112,79,0.08)', marginBottom: '1.5rem' },
    sectionTitle: { fontFamily: "'Fraunces', serif", fontSize: '1.3rem', color: '#3E2723', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' },
  };

  if (isLoading || !formData) {
    return <div style={{ textAlign: 'center', padding: '3rem', color: '#78716C' }}>Chargement...</div>;
  }

  return (
    <>
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: '2.5rem', marginBottom: '0.5rem', color: '#3E2723', fontWeight: 700 }}>
            Paramètres de la clinique
          </h1>
          <p style={{ color: '#78716C', fontSize: '1.05rem' }}>
            Gérez les informations de votre établissement
          </p>
        </div>
      </div>

      {/* Stats */}
      {clinic?._count && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          {[
            { label: 'Patients', value: clinic._count.animals, color: '#B8704F' },
            { label: 'RDV', value: clinic._count.appointments, color: '#4CAF50' },
            { label: 'Stock', value: clinic._count.inventory, color: '#2196F3' },
            { label: 'Factures', value: clinic._count.invoices, color: '#FF9800' },
            { label: 'Avis', value: clinic._count.reviews, color: '#9C27B0' },
          ].map(s => (
            <div key={s.label} style={{ background: '#fff', borderRadius: '14px', padding: '1rem', textAlign: 'center', boxShadow: '0 2px 12px rgba(184,112,79,0.06)', border: '1px solid rgba(184,112,79,0.08)' }}>
              <p style={{ fontSize: '1.5rem', fontWeight: 700, color: s.color }}>{s.value}</p>
              <p style={{ color: '#6D4C41', fontSize: '0.85rem', fontWeight: 600 }}>{s.label}</p>
            </div>
          ))}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* General Info */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}><Building2 size={22} color="#B8704F" /> Informations générales</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={styles.label}>Nom de la clinique</label>
              <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} style={styles.input} />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={styles.label}>Description</label>
              <textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} rows={3} style={{ ...styles.input, resize: 'vertical' }} placeholder="Présentez votre clinique..." />
            </div>
          </div>
        </div>

        {/* Contact */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}><Phone size={22} color="#B8704F" /> Contact</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div>
              <label style={styles.label}>Téléphone</label>
              <input type="tel" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} style={styles.input} />
            </div>
            <div>
              <label style={styles.label}>Email</label>
              <input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} style={styles.input} />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={styles.label}>Site web</label>
              <input type="url" value={formData.website} onChange={e => setFormData({ ...formData, website: e.target.value })} style={styles.input} placeholder="https://www.votreclinique.fr" />
            </div>
          </div>
        </div>

        {/* Address */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}><MapPin size={22} color="#B8704F" /> Adresse</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={styles.label}>Adresse</label>
              <input type="text" value={formData.address} onChange={e => setFormData({ ...formData, address: e.target.value })} style={styles.input} />
            </div>
            <div>
              <label style={styles.label}>Ville</label>
              <input type="text" value={formData.city} onChange={e => setFormData({ ...formData, city: e.target.value })} style={styles.input} />
            </div>
            <div>
              <label style={styles.label}>Code postal</label>
              <input type="text" value={formData.postalCode} onChange={e => setFormData({ ...formData, postalCode: e.target.value })} style={styles.input} />
            </div>
          </div>
        </div>

        {/* Opening Hours */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}><Clock size={22} color="#B8704F" /> Horaires d'ouverture</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {daysOfWeek.map(day => {
              const hours = formData.openingHours?.[day] || { open: '08:30', close: '18:30', closed: false };
              return (
                <div key={day} style={{ display: 'grid', gridTemplateColumns: '120px auto 1fr 20px 1fr', gap: '0.75rem', alignItems: 'center', padding: '0.5rem 0' }}>
                  <span style={{ fontWeight: 600, color: '#3E2723', fontSize: '0.9rem' }}>{day}</span>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.85rem', color: '#78716C' }}>
                    <input type="checkbox" checked={!hours.closed}
                      onChange={e => updateHours(day, 'closed', !e.target.checked)}
                      style={{ width: '16px', height: '16px', accentColor: '#B8704F' }} />
                    Ouvert
                  </label>
                  {!hours.closed ? (
                    <>
                      <input type="time" value={hours.open} onChange={e => updateHours(day, 'open', e.target.value)}
                        style={{ ...styles.input, padding: '0.5rem 0.75rem' }} />
                      <span style={{ textAlign: 'center', color: '#78716C' }}>-</span>
                      <input type="time" value={hours.close} onChange={e => updateHours(day, 'close', e.target.value)}
                        style={{ ...styles.input, padding: '0.5rem 0.75rem' }} />
                    </>
                  ) : (
                    <span style={{ gridColumn: 'span 3', color: '#E53935', fontSize: '0.9rem', fontWeight: 600 }}>Fermé</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Staff members */}
        {clinic?.users?.length > 0 && (
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Membres de l'équipe ({clinic.users.length})</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
              {clinic.users.map(u => (
                <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem', background: '#FFF8F0', borderRadius: '12px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#B8704F20', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: '#B8704F', fontSize: '0.85rem' }}>
                    {u.firstName[0]}{u.lastName[0]}
                  </div>
                  <div>
                    <p style={{ fontWeight: 600, color: '#3E2723', fontSize: '0.9rem' }}>{u.firstName} {u.lastName}</p>
                    <p style={{ color: '#78716C', fontSize: '0.8rem' }}>
                      {{ ADMIN: 'Admin', VETERINARIAN: 'Vétérinaire', ASSISTANT: 'Assistant(e)' }[u.role] || u.role}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Save */}
        <button type="submit" disabled={updateMutation.isPending} style={{ ...styles.button, width: '100%', justifyContent: 'center', padding: '1rem' }}>
          <Save size={18} /> {updateMutation.isPending ? 'Sauvegarde...' : 'Enregistrer les modifications'}
        </button>
      </form>
    </>
  );
};

export default ClinicSettingsPage;
