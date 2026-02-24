import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { certificatesAPI, animalsAPI } from '../services/api';
import toast from 'react-hot-toast';
import { ListItemSkeleton } from '../components/LoadingSkeleton';
import { Search, Plus, X, Trash2, Save, Shield } from 'lucide-react';

const certTypeLabel = { HEALTH: 'Santé', VACCINATION: 'Vaccination', TRAVEL: 'Voyage', INSURANCE: 'Assurance', BREEDING: 'Élevage', OTHER: 'Autre' };
const certTypeColor = { HEALTH: '#4CAF50', VACCINATION: '#2196F3', TRAVEL: '#FF9800', INSURANCE: '#9C27B0', BREEDING: '#E91E63', OTHER: '#607D8B' };

const CertificatesPage = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('ALL');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    type: 'HEALTH',
    animalId: '',
    expiryDate: '',
    content: { observations: '', conclusions: '', restrictions: '' },
  });

  const { data: certificates, isLoading } = useQuery({
    queryKey: ['certificates', searchTerm],
    queryFn: () => certificatesAPI.getAll({ search: searchTerm }).then(r => r.data),
  });

  const { data: animalsData } = useQuery({
    queryKey: ['animals'],
    queryFn: () => animalsAPI.getAll().then(r => r.data),
  });

  const createMutation = useMutation({
    mutationFn: (data) => certificatesAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['certificates']);
      toast.success('Certificat créé avec succès !');
      setShowModal(false);
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Erreur lors de la création'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => certificatesAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['certificates']);
      toast.success('Certificat supprimé');
    },
    onError: () => toast.error('Erreur lors de la suppression'),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createMutation.mutate({
      ...formData,
      expiryDate: formData.expiryDate || undefined,
    });
  };

  const filtered = certificates?.filter(c => filterType === 'ALL' || c.type === filterType) || [];

  const styles = {
    button: { background: 'linear-gradient(135deg, #B8704F 0%, #D4956C 100%)', color: '#fff', border: 'none', borderRadius: '12px', padding: '0.875rem 1.75rem', fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' },
    input: { width: '100%', padding: '0.875rem 1.25rem', borderRadius: '12px', border: '2px solid #F5E6D3', fontSize: '0.95rem', boxSizing: 'border-box' },
    label: { display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#3E2723', fontSize: '0.9rem' },
  };

  return (
    <>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: '2.5rem', marginBottom: '0.5rem', color: '#3E2723', fontWeight: 700 }}>Certificats</h1>
        <p style={{ color: '#78716C', fontSize: '1.05rem' }}>Gérez les certificats vétérinaires</p>
      </div>

      {/* Toolbar */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: '200px' }}>
          <Search size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#78716C' }} />
          <input type="text" placeholder="Rechercher..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ ...styles.input, paddingLeft: '3rem' }} />
        </div>
        <select value={filterType} onChange={e => setFilterType(e.target.value)} style={{ ...styles.input, width: 'auto', minWidth: '150px' }}>
          <option value="ALL">Tous les types</option>
          {Object.entries(certTypeLabel).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <button onClick={() => setShowModal(true)} style={styles.button}>
          <Plus size={18} /> Nouveau certificat
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {Object.entries(certTypeLabel).map(([key, label]) => {
          const count = certificates?.filter(c => c.type === key).length || 0;
          return (
            <div key={key} onClick={() => setFilterType(filterType === key ? 'ALL' : key)} style={{ background: filterType === key ? `${certTypeColor[key]}15` : '#fff', borderRadius: '14px', padding: '1rem', boxShadow: '0 2px 12px rgba(184,112,79,0.06)', border: `2px solid ${filterType === key ? certTypeColor[key] : 'rgba(184,112,79,0.08)'}`, cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s' }}>
              <p style={{ fontSize: '1.5rem', fontWeight: 700, color: certTypeColor[key] }}>{count}</p>
              <p style={{ color: '#6D4C41', fontSize: '0.85rem', fontWeight: 600 }}>{label}</p>
            </div>
          );
        })}
      </div>

      {/* List */}
      {isLoading ? (
        <ListItemSkeleton count={4} />
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#78716C' }}>Aucun certificat trouvé</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filtered.map(cert => {
            const expired = cert.expiryDate && new Date(cert.expiryDate) < new Date();
            return (
              <div key={cert.id} style={{ background: '#fff', borderRadius: '16px', padding: '1.25rem 1.5rem', boxShadow: '0 2px 12px rgba(184,112,79,0.06)', border: '1px solid rgba(184,112,79,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: `${certTypeColor[cert.type]}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Shield size={24} color={certTypeColor[cert.type]} />
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                      <span style={{ fontWeight: 600, color: '#3E2723', fontSize: '1.05rem' }}>Certificat {certTypeLabel[cert.type]}</span>
                      {expired && <span style={{ background: '#FFEBEE', color: '#E53935', borderRadius: '6px', padding: '0.1rem 0.5rem', fontSize: '0.75rem', fontWeight: 600 }}>EXPIRÉ</span>}
                    </div>
                    <p style={{ color: '#78716C', fontSize: '0.9rem' }}>
                      {cert.animal?.name} - {cert.animal?.owner?.firstName} {cert.animal?.owner?.lastName}
                    </p>
                    <p style={{ color: '#78716C', fontSize: '0.85rem' }}>
                      Émis le {new Date(cert.issueDate).toLocaleDateString('fr-FR')}
                      {cert.veterinarian && ` par Dr. ${cert.veterinarian.lastName}`}
                      {cert.expiryDate && ` | Expire le ${new Date(cert.expiryDate).toLocaleDateString('fr-FR')}`}
                    </p>
                  </div>
                </div>
                <button onClick={() => { if (window.confirm('Supprimer ce certificat ?')) deleteMutation.mutate(cert.id); }} style={{ background: '#FFEBEE', border: 'none', borderRadius: '10px', padding: '0.6rem', cursor: 'pointer' }}>
                  <Trash2 size={18} color="#E53935" />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(45,63,47,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setShowModal(false)}>
          <div style={{ background: '#fff', borderRadius: '24px', padding: '2.5rem', maxWidth: '600px', width: '90%', maxHeight: '90vh', overflow: 'auto' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
              <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: '1.8rem', color: '#3E2723' }}>Nouveau certificat</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#78716C' }}><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={styles.label}>Type *</label>
                <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })} style={styles.input}>
                  {Object.entries(certTypeLabel).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={styles.label}>Animal *</label>
                <select value={formData.animalId} onChange={e => setFormData({ ...formData, animalId: e.target.value })} required style={styles.input}>
                  <option value="">Sélectionner un animal</option>
                  {animalsData?.animals?.map(a => <option key={a.id} value={a.id}>{a.name} - {a.owner?.firstName} {a.owner?.lastName}</option>)}
                </select>
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={styles.label}>Date d'expiration</label>
                <input type="date" value={formData.expiryDate} onChange={e => setFormData({ ...formData, expiryDate: e.target.value })} style={styles.input} />
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={styles.label}>Observations</label>
                <textarea value={formData.content.observations} onChange={e => setFormData({ ...formData, content: { ...formData.content, observations: e.target.value } })} rows={3} style={{ ...styles.input, resize: 'vertical' }} />
              </div>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={styles.label}>Conclusions</label>
                <textarea value={formData.content.conclusions} onChange={e => setFormData({ ...formData, content: { ...formData.content, conclusions: e.target.value } })} rows={3} style={{ ...styles.input, resize: 'vertical' }} />
              </div>
              <button type="submit" disabled={createMutation.isPending} style={{ ...styles.button, width: '100%', justifyContent: 'center' }}>
                <Save size={18} /> {createMutation.isPending ? 'Création...' : 'Créer le certificat'}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default CertificatesPage;
