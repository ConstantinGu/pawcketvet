import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { prescriptionsAPI, animalsAPI, consultationsAPI } from '../services/api';
import toast from 'react-hot-toast';
import { ListItemSkeleton } from '../components/LoadingSkeleton';
import { Search, Plus, X, Trash2, Save, Clock, CheckCircle } from 'lucide-react';

const PrescriptionsPage = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    animalId: '', consultationId: '', medicationId: '',
    newMedicationName: '', newMedicationCategory: 'Général', newMedicationDosage: '',
    dosage: '', frequency: '', duration: '', instructions: '',
    startDate: new Date().toISOString().split('T')[0], endDate: '',
  });

  const { data: prescriptions, isLoading } = useQuery({
    queryKey: ['prescriptions', searchTerm],
    queryFn: () => prescriptionsAPI.getAll({ search: searchTerm }).then(r => r.data),
  });

  const { data: animalsData } = useQuery({
    queryKey: ['animals'],
    queryFn: () => animalsAPI.getAll().then(r => r.data),
  });

  const { data: medications } = useQuery({
    queryKey: ['medications'],
    queryFn: () => prescriptionsAPI.getMedications().then(r => r.data),
  });

  const { data: consultations } = useQuery({
    queryKey: ['consultations'],
    queryFn: () => consultationsAPI.getAll().then(r => r.data),
    enabled: showModal,
  });

  const createMutation = useMutation({
    mutationFn: async (data) => {
      let medicationId = data.medicationId;
      if (!medicationId && data.newMedicationName) {
        const medRes = await prescriptionsAPI.createMedication({
          name: data.newMedicationName,
          category: data.newMedicationCategory,
          dosage: data.newMedicationDosage,
        });
        medicationId = medRes.data.id;
      }
      return prescriptionsAPI.create({
        animalId: data.animalId, consultationId: data.consultationId, medicationId,
        dosage: data.dosage, frequency: data.frequency, duration: data.duration,
        instructions: data.instructions || undefined,
        startDate: data.startDate, endDate: data.endDate || undefined,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['prescriptions']);
      queryClient.invalidateQueries(['medications']);
      toast.success('Ordonnance créée !');
      setShowModal(false);
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Erreur'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => prescriptionsAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['prescriptions']);
      toast.success('Ordonnance supprimée');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  const now = new Date();
  const filtered = prescriptions?.filter(p => {
    if (filterStatus === 'ACTIVE') return !p.endDate || new Date(p.endDate) > now;
    if (filterStatus === 'ENDED') return p.endDate && new Date(p.endDate) <= now;
    return true;
  }) || [];

  const activeCount = prescriptions?.filter(p => !p.endDate || new Date(p.endDate) > now).length || 0;
  const endedCount = prescriptions?.filter(p => p.endDate && new Date(p.endDate) <= now).length || 0;

  const styles = {
    button: { background: 'linear-gradient(135deg, #B8704F 0%, #D4956C 100%)', color: '#fff', border: 'none', borderRadius: '12px', padding: '0.875rem 1.75rem', fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' },
    input: { width: '100%', padding: '0.875rem 1.25rem', borderRadius: '12px', border: '2px solid #F5E6D3', fontSize: '0.95rem', boxSizing: 'border-box' },
    label: { display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#3E2723', fontSize: '0.9rem' },
  };

  return (
    <>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: '2.5rem', marginBottom: '0.5rem', color: '#3E2723', fontWeight: 700 }}>Ordonnances</h1>
        <p style={{ color: '#78716C', fontSize: '1.05rem' }}>Gérez les prescriptions médicales</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { label: 'Total', value: prescriptions?.length || 0, color: '#B8704F', filter: 'ALL' },
          { label: 'Actives', value: activeCount, color: '#4CAF50', filter: 'ACTIVE' },
          { label: 'Terminées', value: endedCount, color: '#9E9E9E', filter: 'ENDED' },
        ].map(s => (
          <div key={s.filter} onClick={() => setFilterStatus(filterStatus === s.filter ? 'ALL' : s.filter)} style={{ background: filterStatus === s.filter ? `${s.color}15` : '#fff', borderRadius: '16px', padding: '1.25rem', boxShadow: '0 2px 12px rgba(184,112,79,0.06)', border: `2px solid ${filterStatus === s.filter ? s.color : 'rgba(184,112,79,0.08)'}`, cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s' }}>
            <p style={{ fontSize: '2rem', fontWeight: 700, color: s.color }}>{s.value}</p>
            <p style={{ color: '#6D4C41', fontWeight: 600 }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#78716C' }} />
          <input type="text" placeholder="Rechercher..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ ...styles.input, paddingLeft: '3rem' }} />
        </div>
        <button onClick={() => setShowModal(true)} style={styles.button}><Plus size={18} /> Nouvelle ordonnance</button>
      </div>

      {/* List */}
      {isLoading ? (
        <ListItemSkeleton count={5} />
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#78716C' }}>Aucune ordonnance trouvée</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filtered.map(p => {
            const isActive = !p.endDate || new Date(p.endDate) > now;
            return (
              <div key={p.id} style={{ background: '#fff', borderRadius: '16px', padding: '1.25rem 1.5rem', boxShadow: '0 2px 12px rgba(184,112,79,0.06)', border: '1px solid rgba(184,112,79,0.08)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: isActive ? '#E8F5E9' : '#F5F5F5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      {isActive ? <Clock size={24} color="#43A047" /> : <CheckCircle size={24} color="#9E9E9E" />}
                    </div>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                        <span style={{ fontWeight: 600, color: '#3E2723', fontSize: '1.05rem' }}>{p.medication?.name || 'Médicament'}</span>
                        <span style={{ background: isActive ? '#E8F5E9' : '#F5F5F5', color: isActive ? '#2E7D32' : '#9E9E9E', borderRadius: '6px', padding: '0.1rem 0.5rem', fontSize: '0.75rem', fontWeight: 600 }}>{isActive ? 'ACTIF' : 'TERMINÉ'}</span>
                      </div>
                      <p style={{ color: '#6D4C41', fontSize: '0.9rem' }}>
                        {p.animal?.name} - {p.animal?.owner?.firstName} {p.animal?.owner?.lastName}
                      </p>
                      <p style={{ color: '#78716C', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                        {p.dosage} | {p.frequency} | {p.duration}
                      </p>
                      {p.instructions && <p style={{ color: '#78716C', fontSize: '0.85rem', fontStyle: 'italic', marginTop: '0.25rem' }}>{p.instructions}</p>}
                      <p style={{ color: '#78716C', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                        Du {new Date(p.startDate).toLocaleDateString('fr-FR')}{p.endDate ? ` au ${new Date(p.endDate).toLocaleDateString('fr-FR')}` : ''}
                      </p>
                    </div>
                  </div>
                  <button onClick={() => { if (window.confirm('Supprimer ?')) deleteMutation.mutate(p.id); }} style={{ background: '#FFEBEE', border: 'none', borderRadius: '10px', padding: '0.6rem', cursor: 'pointer' }}>
                    <Trash2 size={18} color="#E53935" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(45,63,47,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setShowModal(false)}>
          <div style={{ background: '#fff', borderRadius: '24px', padding: '2.5rem', maxWidth: '700px', width: '90%', maxHeight: '90vh', overflow: 'auto' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
              <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: '1.8rem', color: '#3E2723' }}>Nouvelle ordonnance</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#78716C' }}><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div>
                  <label style={styles.label}>Animal *</label>
                  <select value={formData.animalId} onChange={e => setFormData({ ...formData, animalId: e.target.value })} required style={styles.input}>
                    <option value="">Sélectionner</option>
                    {animalsData?.animals?.map(a => <option key={a.id} value={a.id}>{a.name} - {a.owner?.firstName} {a.owner?.lastName}</option>)}
                  </select>
                </div>
                <div>
                  <label style={styles.label}>Consultation *</label>
                  <select value={formData.consultationId} onChange={e => setFormData({ ...formData, consultationId: e.target.value })} required style={styles.input}>
                    <option value="">Sélectionner</option>
                    {consultations?.map(c => <option key={c.id} value={c.id}>{new Date(c.date).toLocaleDateString('fr-FR')} - {c.reason}</option>)}
                  </select>
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={styles.label}>Médicament</label>
                  <select value={formData.medicationId} onChange={e => setFormData({ ...formData, medicationId: e.target.value })} style={styles.input}>
                    <option value="">Nouveau médicament...</option>
                    {medications?.map(m => <option key={m.id} value={m.id}>{m.name} ({m.category}) - {m.dosage}</option>)}
                  </select>
                </div>
                {!formData.medicationId && (
                  <>
                    <div>
                      <label style={styles.label}>Nom du médicament *</label>
                      <input type="text" value={formData.newMedicationName} onChange={e => setFormData({ ...formData, newMedicationName: e.target.value })} required={!formData.medicationId} style={styles.input} />
                    </div>
                    <div>
                      <label style={styles.label}>Catégorie</label>
                      <input type="text" value={formData.newMedicationCategory} onChange={e => setFormData({ ...formData, newMedicationCategory: e.target.value })} style={styles.input} />
                    </div>
                    <div style={{ gridColumn: '1 / -1' }}>
                      <label style={styles.label}>Dosage de référence</label>
                      <input type="text" value={formData.newMedicationDosage} onChange={e => setFormData({ ...formData, newMedicationDosage: e.target.value })} style={styles.input} placeholder="ex: 500mg comprimé" />
                    </div>
                  </>
                )}
                <div>
                  <label style={styles.label}>Posologie *</label>
                  <input type="text" value={formData.dosage} onChange={e => setFormData({ ...formData, dosage: e.target.value })} required placeholder="ex: 1 comprimé" style={styles.input} />
                </div>
                <div>
                  <label style={styles.label}>Fréquence *</label>
                  <input type="text" value={formData.frequency} onChange={e => setFormData({ ...formData, frequency: e.target.value })} required placeholder="ex: 2 fois par jour" style={styles.input} />
                </div>
                <div>
                  <label style={styles.label}>Durée *</label>
                  <input type="text" value={formData.duration} onChange={e => setFormData({ ...formData, duration: e.target.value })} required placeholder="ex: 7 jours" style={styles.input} />
                </div>
                <div>
                  <label style={styles.label}>Date de début</label>
                  <input type="date" value={formData.startDate} onChange={e => setFormData({ ...formData, startDate: e.target.value })} style={styles.input} />
                </div>
                <div>
                  <label style={styles.label}>Date de fin</label>
                  <input type="date" value={formData.endDate} onChange={e => setFormData({ ...formData, endDate: e.target.value })} style={styles.input} />
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <label style={styles.label}>Instructions</label>
                  <textarea value={formData.instructions} onChange={e => setFormData({ ...formData, instructions: e.target.value })} rows={3} style={{ ...styles.input, resize: 'vertical' }} placeholder="Instructions pour le propriétaire..." />
                </div>
              </div>
              <button type="submit" disabled={createMutation.isPending} style={{ ...styles.button, width: '100%', justifyContent: 'center', marginTop: '1.5rem' }}>
                <Save size={18} /> {createMutation.isPending ? 'Création...' : 'Créer l\'ordonnance'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default PrescriptionsPage;
