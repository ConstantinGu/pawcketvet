import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { animalsAPI, consultationsAPI, vaccinationsAPI, prescriptionsAPI, certificatesAPI } from '../services/api';
import toast from 'react-hot-toast';
import {
  ArrowLeft, Heart, Syringe, FileText, Pill, Award,
  Calendar, Weight, Activity, AlertTriangle, Plus, X, Save, Trash2, Edit2, Eye
} from 'lucide-react';

const certTypeLabel = { HEALTH: 'Santé', VACCINATION: 'Vaccination', TRAVEL: 'Voyage', INSURANCE: 'Assurance', BREEDING: 'Élevage', OTHER: 'Autre' };

const PatientDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('overview');
  const [showVaccModal, setShowVaccModal] = useState(false);
  const [showConsultModal, setShowConsultModal] = useState(false);
  const [showCertModal, setShowCertModal] = useState(false);
  const [vaccForm, setVaccForm] = useState({ name: '', date: '', nextDueDate: '', batchNumber: '', veterinarian: '', notes: '' });
  const [consultForm, setConsultForm] = useState({ reason: '', symptoms: '', diagnosis: '', treatment: '', notes: '', temperature: '', heartRate: '', weight: '' });
  const [certForm, setCertForm] = useState({ type: 'HEALTH', expiryDate: '', content: { observations: '', conclusions: '' } });

  const { data: animal, isLoading } = useQuery({
    queryKey: ['animal', id],
    queryFn: () => animalsAPI.getById(id).then(res => res.data),
  });

  const { data: vaccinations } = useQuery({
    queryKey: ['vaccinations', id],
    queryFn: () => vaccinationsAPI.getByAnimal(id).then(res => res.data),
    enabled: !!id,
  });

  const { data: consultations } = useQuery({
    queryKey: ['consultations', id],
    queryFn: () => consultationsAPI.getAll({ animalId: id }).then(res => res.data),
    enabled: !!id,
  });

  const { data: prescriptions } = useQuery({
    queryKey: ['prescriptions', id],
    queryFn: () => prescriptionsAPI.getAll({ animalId: id }).then(res => res.data),
    enabled: !!id,
  });

  const { data: certificates } = useQuery({
    queryKey: ['certificates', id],
    queryFn: () => certificatesAPI.getAll({ animalId: id }).then(res => res.data),
    enabled: !!id,
  });

  const createVaccMutation = useMutation({
    mutationFn: (data) => vaccinationsAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['vaccinations', id]);
      toast.success('Vaccination ajoutée !');
      setShowVaccModal(false);
      setVaccForm({ name: '', date: '', nextDueDate: '', batchNumber: '', veterinarian: '', notes: '' });
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Erreur'),
  });

  const createConsultMutation = useMutation({
    mutationFn: (data) => consultationsAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['consultations', id]);
      toast.success('Consultation créée !');
      setShowConsultModal(false);
      setConsultForm({ reason: '', symptoms: '', diagnosis: '', treatment: '', notes: '', temperature: '', heartRate: '', weight: '' });
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Erreur'),
  });

  const createCertMutation = useMutation({
    mutationFn: (data) => certificatesAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['certificates', id]);
      toast.success('Certificat créé !');
      setShowCertModal(false);
      setCertForm({ type: 'HEALTH', expiryDate: '', content: { observations: '', conclusions: '' } });
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Erreur lors de la création'),
  });

  const getAge = (birthDate) => {
    if (!birthDate) return 'Inconnu';
    const diff = Date.now() - new Date(birthDate).getTime();
    const years = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
    const months = Math.floor((diff % (1000 * 60 * 60 * 24 * 365.25)) / (1000 * 60 * 60 * 24 * 30.44));
    if (years === 0) return `${months} mois`;
    return `${years} an${years > 1 ? 's' : ''} ${months > 0 ? `${months} mois` : ''}`;
  };

  const speciesEmoji = { DOG: '🐕', CAT: '🐈', RABBIT: '🐇', BIRD: '🐦', RODENT: '🐹', REPTILE: '🦎', OTHER: '🐾' };
  const speciesLabel = { DOG: 'Chien', CAT: 'Chat', RABBIT: 'Lapin', BIRD: 'Oiseau', RODENT: 'Rongeur', REPTILE: 'Reptile', OTHER: 'Autre' };

  const tabs = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: Heart },
    { id: 'consultations', label: 'Consultations', icon: FileText },
    { id: 'vaccinations', label: 'Vaccinations', icon: Syringe },
    { id: 'prescriptions', label: 'Prescriptions', icon: Pill },
    { id: 'certificates', label: 'Certificats', icon: Award },
  ];

  const s = {
    container: { padding: 0 },
    backBtn: { display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: 'none', cursor: 'pointer', color: '#B8704F', fontWeight: 600, fontSize: '0.95rem', marginBottom: '1.5rem' },
    heroCard: { background: 'linear-gradient(135deg, #FFF8F0 0%, #F5E6D3 100%)', borderRadius: '20px', padding: '2rem', marginBottom: '2rem', display: 'flex', gap: '2rem', alignItems: 'center' },
    emoji: { fontSize: '4rem', background: '#fff', borderRadius: '20px', width: '100px', height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 15px rgba(184,112,79,0.1)' },
    heroInfo: { flex: 1 },
    name: { fontFamily: "'Fraunces', serif", fontSize: '2.2rem', color: '#3E2723', fontWeight: 700, marginBottom: '0.25rem' },
    metaRow: { display: 'flex', gap: '1.5rem', flexWrap: 'wrap', marginTop: '0.75rem' },
    metaBadge: { display: 'flex', alignItems: 'center', gap: '0.4rem', background: '#fff', padding: '0.5rem 1rem', borderRadius: '10px', fontSize: '0.85rem', color: '#6D4C41' },
    alertBanner: { background: '#FFF3CD', borderRadius: '12px', padding: '1rem 1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem', border: '1px solid #FFE082' },
    tabBar: { display: 'flex', gap: '0.5rem', marginBottom: '2rem', borderBottom: '2px solid #F5E6D3', paddingBottom: '0' },
    tab: (active) => ({ padding: '0.75rem 1.5rem', background: 'none', border: 'none', borderBottom: active ? '3px solid #B8704F' : '3px solid transparent', color: active ? '#B8704F' : '#A1887F', fontWeight: active ? 700 : 500, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', marginBottom: '-2px' }),
    ownerCard: { background: '#fff', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 2px 15px rgba(184,112,79,0.06)', border: '1px solid rgba(184,112,79,0.08)' },
    sectionTitle: { fontFamily: "'Fraunces', serif", fontSize: '1.3rem', color: '#3E2723', marginBottom: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    addBtn: { background: 'linear-gradient(135deg, #B8704F 0%, #D4956C 100%)', color: '#fff', border: 'none', borderRadius: '10px', padding: '0.5rem 1rem', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.4rem' },
    listCard: { background: '#fff', borderRadius: '14px', padding: '1.25rem', marginBottom: '0.75rem', boxShadow: '0 1px 8px rgba(184,112,79,0.05)', border: '1px solid rgba(184,112,79,0.08)' },
    emptyState: { textAlign: 'center', padding: '3rem', color: '#A1887F', fontSize: '0.95rem' },
    modal: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(45,63,47,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 },
    modalContent: { background: '#fff', borderRadius: '24px', padding: '2.5rem', maxWidth: '700px', width: '90%', maxHeight: '90vh', overflow: 'auto' },
    formGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' },
    label: { display: 'block', marginBottom: '0.4rem', fontWeight: 600, color: '#3E2723', fontSize: '0.85rem' },
    input: { width: '100%', padding: '0.75rem 1rem', borderRadius: '10px', border: '2px solid #F5E6D3', fontSize: '0.9rem', boxSizing: 'border-box' },
    badge: (color) => ({ padding: '0.25rem 0.75rem', borderRadius: '8px', fontSize: '0.75rem', fontWeight: 600, background: color === 'green' ? '#E8F5E9' : color === 'blue' ? '#E3F2FD' : color === 'orange' ? '#FFF3E0' : '#F3E5F5', color: color === 'green' ? '#2E7D32' : color === 'blue' ? '#1565C0' : color === 'orange' ? '#E65100' : '#7B1FA2' }),
    statsRow: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' },
    statCard: { background: '#fff', borderRadius: '14px', padding: '1.25rem', textAlign: 'center', boxShadow: '0 2px 10px rgba(184,112,79,0.06)', border: '1px solid rgba(184,112,79,0.08)' },
    statNumber: { fontSize: '1.8rem', fontWeight: 700, color: '#B8704F' },
    statLabel: { fontSize: '0.8rem', color: '#A1887F', marginTop: '0.25rem' },
  };

  if (isLoading) return (
    <div style={{ textAlign: 'center', padding: '4rem' }}>
      <div style={{ fontSize: '3rem', marginBottom: '1rem', animation: 'scaleIn 0.5s ease' }}>🐾</div>
      <div style={{ color: '#B8704F', fontSize: '1.1rem', fontWeight: 500 }}>Chargement du dossier...</div>
      <div style={{ width: '48px', height: '4px', background: 'linear-gradient(90deg, #F5E6D3 25%, #B8704F 50%, #F5E6D3 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.2s infinite', borderRadius: '2px', margin: '1rem auto 0' }} />
    </div>
  );
  if (!animal) return <div style={{ textAlign: 'center', padding: '3rem', color: '#dc2626' }}>Patient non trouvé</div>;

  const vaccList = Array.isArray(vaccinations) ? vaccinations : vaccinations?.vaccinations || [];
  const consultList = Array.isArray(consultations) ? consultations : consultations?.consultations || [];
  const prescList = Array.isArray(prescriptions) ? prescriptions : prescriptions?.prescriptions || [];
  const certList = Array.isArray(certificates) ? certificates : certificates?.certificates || [];

  return (
    <div style={s.container}>
      <button onClick={() => navigate('/patients')} style={s.backBtn}>
        <ArrowLeft size={18} /> Retour aux patients
      </button>

      {/* Hero Card */}
      <div style={s.heroCard}>
        <div style={s.emoji}>{speciesEmoji[animal.species] || '🐾'}</div>
        <div style={s.heroInfo}>
          <h1 style={s.name}>{animal.name}</h1>
          <p style={{ color: '#8D6E63', fontSize: '1rem' }}>
            {speciesLabel[animal.species]} {animal.breed ? `• ${animal.breed}` : ''} {animal.gender === 'MALE' ? '• Mâle' : animal.gender === 'FEMALE' ? '• Femelle' : ''}
          </p>
          <div style={s.metaRow}>
            <div style={s.metaBadge}><Calendar size={14} color="#B8704F" /> {getAge(animal.birthDate)}</div>
            {animal.weight && <div style={s.metaBadge}><Weight size={14} color="#B8704F" /> {animal.weight} kg</div>}
            {animal.microchip && <div style={s.metaBadge}><Activity size={14} color="#B8704F" /> N°{animal.microchip}</div>}
            {animal.color && <div style={s.metaBadge}>{animal.color}</div>}
          </div>
        </div>
      </div>

      {/* Alerts */}
      {(animal.allergies || animal.chronicConditions) && (
        <div style={s.alertBanner}>
          <AlertTriangle size={20} color="#F57F17" />
          <div>
            {animal.allergies && <div><strong>Allergies:</strong> {animal.allergies}</div>}
            {animal.chronicConditions && <div><strong>Conditions chroniques:</strong> {animal.chronicConditions}</div>}
          </div>
        </div>
      )}

      {/* Stats */}
      <div style={s.statsRow}>
        <div style={s.statCard}>
          <div style={s.statNumber}>{consultList.length}</div>
          <div style={s.statLabel}>Consultations</div>
        </div>
        <div style={s.statCard}>
          <div style={s.statNumber}>{vaccList.length}</div>
          <div style={s.statLabel}>Vaccinations</div>
        </div>
        <div style={s.statCard}>
          <div style={s.statNumber}>{prescList.length}</div>
          <div style={s.statLabel}>Prescriptions</div>
        </div>
        <div style={s.statCard}>
          <div style={s.statNumber}>{certList.length}</div>
          <div style={s.statLabel}>Certificats</div>
        </div>
      </div>

      {/* Tab bar */}
      <div style={s.tabBar}>
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={s.tab(activeTab === tab.id)}>
            <tab.icon size={16} /> {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div style={s.ownerCard}>
            <h3 style={{ ...s.sectionTitle, justifyContent: 'flex-start' }}>Propriétaire</h3>
            {animal.owner ? (
              <>
                <p style={{ fontSize: '1.1rem', fontWeight: 600, color: '#3E2723', marginBottom: '0.5rem' }}>
                  {animal.owner.firstName} {animal.owner.lastName}
                </p>
                <p style={{ color: '#8D6E63', marginBottom: '0.25rem' }}>{animal.owner.email}</p>
                <p style={{ color: '#8D6E63', marginBottom: '0.25rem' }}>{animal.owner.phone}</p>
                {animal.owner.address && <p style={{ color: '#8D6E63' }}>{animal.owner.address}, {animal.owner.city} {animal.owner.postalCode}</p>}
              </>
            ) : (
              <p style={{ color: '#A1887F' }}>Aucun propriétaire</p>
            )}
          </div>
          <div style={s.ownerCard}>
            <h3 style={{ ...s.sectionTitle, justifyContent: 'flex-start' }}>Notes</h3>
            <p style={{ color: '#6D4C41', lineHeight: 1.6 }}>{animal.notes || 'Aucune note'}</p>
          </div>
          <div style={{ ...s.ownerCard, gridColumn: '1 / -1' }}>
            <h3 style={{ ...s.sectionTitle, justifyContent: 'flex-start' }}>Dernières activités</h3>
            {[...consultList.slice(0, 3).map(c => ({ ...c, _type: 'consult' })), ...vaccList.slice(0, 3).map(v => ({ ...v, _type: 'vacc' }))]
              .sort((a, b) => new Date(b.date || b.createdAt) - new Date(a.date || a.createdAt))
              .slice(0, 5)
              .map((item, i) => (
                <div key={i} style={{ ...s.listCard, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    {item._type === 'consult' ? <FileText size={18} color="#1565C0" /> : <Syringe size={18} color="#2E7D32" />}
                    <div>
                      <div style={{ fontWeight: 600, color: '#3E2723' }}>
                        {item._type === 'consult' ? item.reason : item.name}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: '#A1887F' }}>
                        {new Date(item.date || item.createdAt).toLocaleDateString('fr-FR')}
                      </div>
                    </div>
                  </div>
                  <span style={s.badge(item._type === 'consult' ? 'blue' : 'green')}>
                    {item._type === 'consult' ? 'Consultation' : 'Vaccination'}
                  </span>
                </div>
              ))}
            {consultList.length === 0 && vaccList.length === 0 && (
              <p style={s.emptyState}>Aucune activité récente</p>
            )}
          </div>
        </div>
      )}

      {/* Consultations Tab */}
      {activeTab === 'consultations' && (
        <div>
          <div style={s.sectionTitle}>
            <span>Historique des consultations</span>
            <button onClick={() => setShowConsultModal(true)} style={s.addBtn}><Plus size={16} /> Nouvelle consultation</button>
          </div>
          {consultList.length === 0 ? (
            <p style={s.emptyState}>Aucune consultation enregistrée</p>
          ) : consultList.map((c) => (
            <div key={c.id} style={s.listCard}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <div>
                  <div style={{ fontWeight: 700, color: '#3E2723', fontSize: '1.05rem' }}>{c.reason}</div>
                  <div style={{ fontSize: '0.8rem', color: '#A1887F' }}>{new Date(c.date).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</div>
                </div>
                {c.diagnosis && <span style={s.badge('blue')}>Diagnostiqué</span>}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                {c.symptoms && <div><span style={{ fontWeight: 600, fontSize: '0.8rem', color: '#8D6E63' }}>Symptômes:</span><p style={{ color: '#6D4C41', fontSize: '0.9rem' }}>{c.symptoms}</p></div>}
                {c.diagnosis && <div><span style={{ fontWeight: 600, fontSize: '0.8rem', color: '#8D6E63' }}>Diagnostic:</span><p style={{ color: '#6D4C41', fontSize: '0.9rem' }}>{c.diagnosis}</p></div>}
                {c.treatment && <div><span style={{ fontWeight: 600, fontSize: '0.8rem', color: '#8D6E63' }}>Traitement:</span><p style={{ color: '#6D4C41', fontSize: '0.9rem' }}>{c.treatment}</p></div>}
                {c.notes && <div><span style={{ fontWeight: 600, fontSize: '0.8rem', color: '#8D6E63' }}>Notes:</span><p style={{ color: '#6D4C41', fontSize: '0.9rem' }}>{c.notes}</p></div>}
              </div>
              {(c.temperature || c.heartRate || c.weight) && (
                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.75rem', padding: '0.75rem', background: '#FFF8F0', borderRadius: '10px' }}>
                  {c.temperature && <span style={{ fontSize: '0.85rem', color: '#6D4C41' }}>Temp: {c.temperature}°C</span>}
                  {c.heartRate && <span style={{ fontSize: '0.85rem', color: '#6D4C41' }}>FC: {c.heartRate} bpm</span>}
                  {c.weight && <span style={{ fontSize: '0.85rem', color: '#6D4C41' }}>Poids: {c.weight} kg</span>}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Vaccinations Tab */}
      {activeTab === 'vaccinations' && (
        <div>
          <div style={s.sectionTitle}>
            <span>Carnet de vaccination</span>
            <button onClick={() => setShowVaccModal(true)} style={s.addBtn}><Plus size={16} /> Ajouter vaccination</button>
          </div>
          {vaccList.length === 0 ? (
            <p style={s.emptyState}>Aucune vaccination enregistrée</p>
          ) : vaccList.map((v) => (
            <div key={v.id} style={s.listCard}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#E8F5E9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Syringe size={18} color="#2E7D32" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, color: '#3E2723' }}>{v.name}</div>
                    <div style={{ fontSize: '0.8rem', color: '#A1887F' }}>
                      {new Date(v.date).toLocaleDateString('fr-FR')}
                      {v.batchNumber && ` • Lot: ${v.batchNumber}`}
                    </div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  {v.nextDueDate && (
                    <div>
                      <span style={new Date(v.nextDueDate) < new Date() ? s.badge('orange') : s.badge('green')}>
                        {new Date(v.nextDueDate) < new Date() ? 'Rappel échu' : `Prochain: ${new Date(v.nextDueDate).toLocaleDateString('fr-FR')}`}
                      </span>
                    </div>
                  )}
                  {v.veterinarian && <div style={{ fontSize: '0.75rem', color: '#A1887F', marginTop: '0.25rem' }}>Dr. {v.veterinarian}</div>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Prescriptions Tab */}
      {activeTab === 'prescriptions' && (
        <div>
          <div style={s.sectionTitle}>
            <span>Prescriptions</span>
          </div>
          {prescList.length === 0 ? (
            <p style={s.emptyState}>Aucune prescription enregistrée</p>
          ) : prescList.map((p) => (
            <div key={p.id} style={s.listCard}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#F3E5F5', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Pill size={18} color="#7B1FA2" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, color: '#3E2723' }}>{p.medication?.name || 'Médicament'}</div>
                    <div style={{ fontSize: '0.85rem', color: '#6D4C41' }}>{p.dosage} • {p.frequency} • {p.duration}</div>
                    {p.instructions && <div style={{ fontSize: '0.8rem', color: '#A1887F', marginTop: '0.25rem' }}>{p.instructions}</div>}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.8rem', color: '#A1887F' }}>
                    Du {new Date(p.startDate).toLocaleDateString('fr-FR')}
                    {p.endDate && ` au ${new Date(p.endDate).toLocaleDateString('fr-FR')}`}
                  </div>
                  {p.endDate && new Date(p.endDate) > new Date() && <span style={s.badge('green')}>En cours</span>}
                  {p.endDate && new Date(p.endDate) <= new Date() && <span style={s.badge('orange')}>Terminé</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Certificates Tab */}
      {activeTab === 'certificates' && (
        <div>
          <div style={s.sectionTitle}>
            <span>Certificats</span>
            <button onClick={() => setShowCertModal(true)} style={s.addBtn}><Plus size={16} /> Nouveau certificat</button>
          </div>
          {certList.length === 0 ? (
            <p style={s.emptyState}>Aucun certificat</p>
          ) : certList.map((c) => (
            <div key={c.id} style={s.listCard}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#E3F2FD', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Award size={18} color="#1565C0" />
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, color: '#3E2723' }}>
                      {c.type === 'HEALTH' ? 'Certificat de santé' : c.type === 'VACCINATION' ? 'Certificat de vaccination' : c.type === 'TRAVEL' ? 'Certificat de voyage' : c.type}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#A1887F' }}>
                      Émis le {new Date(c.issueDate).toLocaleDateString('fr-FR')}
                      {c.expiryDate && ` • Expire: ${new Date(c.expiryDate).toLocaleDateString('fr-FR')}`}
                    </div>
                  </div>
                </div>
                {c.expiryDate && (
                  <span style={new Date(c.expiryDate) < new Date() ? s.badge('orange') : s.badge('green')}>
                    {new Date(c.expiryDate) < new Date() ? 'Expiré' : 'Valide'}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Vaccination Modal */}
      {showVaccModal && (
        <div style={s.modal} onClick={() => setShowVaccModal(false)}>
          <div style={s.modalContent} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: '1.5rem', color: '#3E2723' }}>Ajouter une vaccination</h2>
              <button onClick={() => setShowVaccModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#A1887F' }}><X size={22} /></button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); createVaccMutation.mutate({ ...vaccForm, animalId: id }); }}>
              <div style={s.formGrid}>
                <div><label style={s.label}>Nom du vaccin *</label><input value={vaccForm.name} onChange={e => setVaccForm({ ...vaccForm, name: e.target.value })} required style={s.input} /></div>
                <div><label style={s.label}>Date *</label><input type="date" value={vaccForm.date} onChange={e => setVaccForm({ ...vaccForm, date: e.target.value })} required style={s.input} /></div>
                <div><label style={s.label}>Prochain rappel</label><input type="date" value={vaccForm.nextDueDate} onChange={e => setVaccForm({ ...vaccForm, nextDueDate: e.target.value })} style={s.input} /></div>
                <div><label style={s.label}>N° de lot</label><input value={vaccForm.batchNumber} onChange={e => setVaccForm({ ...vaccForm, batchNumber: e.target.value })} style={s.input} /></div>
                <div><label style={s.label}>Vétérinaire</label><input value={vaccForm.veterinarian} onChange={e => setVaccForm({ ...vaccForm, veterinarian: e.target.value })} style={s.input} /></div>
                <div><label style={s.label}>Notes</label><input value={vaccForm.notes} onChange={e => setVaccForm({ ...vaccForm, notes: e.target.value })} style={s.input} /></div>
              </div>
              <button type="submit" disabled={createVaccMutation.isPending} style={{ ...s.addBtn, marginTop: '1.5rem', padding: '0.75rem 2rem', fontSize: '0.95rem' }}>
                <Save size={16} /> Enregistrer
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Certificate Modal */}
      {showCertModal && (
        <div style={s.modal} onClick={() => setShowCertModal(false)}>
          <div style={s.modalContent} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: '1.5rem', color: '#3E2723' }}>Nouveau certificat</h2>
              <button onClick={() => setShowCertModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#A1887F' }}><X size={22} /></button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); createCertMutation.mutate({ ...certForm, animalId: id, expiryDate: certForm.expiryDate || undefined }); }}>
              <div style={s.formGrid}>
                <div>
                  <label style={s.label}>Type *</label>
                  <select value={certForm.type} onChange={e => setCertForm({ ...certForm, type: e.target.value })} style={s.input}>
                    {Object.entries(certTypeLabel).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
                <div>
                  <label style={s.label}>Date d'expiration</label>
                  <input type="date" value={certForm.expiryDate} onChange={e => setCertForm({ ...certForm, expiryDate: e.target.value })} style={s.input} />
                </div>
              </div>
              <div style={{ marginTop: '1rem' }}>
                <label style={s.label}>Observations</label>
                <textarea value={certForm.content.observations} onChange={e => setCertForm({ ...certForm, content: { ...certForm.content, observations: e.target.value } })} rows={3} style={{ ...s.input, resize: 'vertical' }} />
              </div>
              <div style={{ marginTop: '1rem' }}>
                <label style={s.label}>Conclusions</label>
                <textarea value={certForm.content.conclusions} onChange={e => setCertForm({ ...certForm, content: { ...certForm.content, conclusions: e.target.value } })} rows={3} style={{ ...s.input, resize: 'vertical' }} />
              </div>
              <button type="submit" disabled={createCertMutation.isPending} style={{ ...s.addBtn, marginTop: '1.5rem', padding: '0.75rem 2rem', fontSize: '0.95rem' }}>
                <Save size={16} /> {createCertMutation.isPending ? 'Création...' : 'Créer le certificat'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Consultation Modal */}
      {showConsultModal && (
        <div style={s.modal} onClick={() => setShowConsultModal(false)}>
          <div style={s.modalContent} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: '1.5rem', color: '#3E2723' }}>Nouvelle consultation</h2>
              <button onClick={() => setShowConsultModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#A1887F' }}><X size={22} /></button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); createConsultMutation.mutate({ ...consultForm, animalId: id, temperature: consultForm.temperature ? parseFloat(consultForm.temperature) : undefined, heartRate: consultForm.heartRate ? parseInt(consultForm.heartRate) : undefined, weight: consultForm.weight ? parseFloat(consultForm.weight) : undefined }); }}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={s.label}>Motif de consultation *</label>
                <input value={consultForm.reason} onChange={e => setConsultForm({ ...consultForm, reason: e.target.value })} required style={s.input} />
              </div>
              <div style={s.formGrid}>
                <div><label style={s.label}>Symptômes</label><textarea value={consultForm.symptoms} onChange={e => setConsultForm({ ...consultForm, symptoms: e.target.value })} style={{ ...s.input, minHeight: '80px', resize: 'vertical' }} /></div>
                <div><label style={s.label}>Diagnostic</label><textarea value={consultForm.diagnosis} onChange={e => setConsultForm({ ...consultForm, diagnosis: e.target.value })} style={{ ...s.input, minHeight: '80px', resize: 'vertical' }} /></div>
                <div><label style={s.label}>Traitement</label><textarea value={consultForm.treatment} onChange={e => setConsultForm({ ...consultForm, treatment: e.target.value })} style={{ ...s.input, minHeight: '80px', resize: 'vertical' }} /></div>
                <div><label style={s.label}>Notes</label><textarea value={consultForm.notes} onChange={e => setConsultForm({ ...consultForm, notes: e.target.value })} style={{ ...s.input, minHeight: '80px', resize: 'vertical' }} /></div>
              </div>
              <div style={{ ...s.formGrid, gridTemplateColumns: '1fr 1fr 1fr', marginTop: '1rem' }}>
                <div><label style={s.label}>Température (°C)</label><input type="number" step="0.1" value={consultForm.temperature} onChange={e => setConsultForm({ ...consultForm, temperature: e.target.value })} style={s.input} /></div>
                <div><label style={s.label}>Fréq. cardiaque</label><input type="number" value={consultForm.heartRate} onChange={e => setConsultForm({ ...consultForm, heartRate: e.target.value })} style={s.input} /></div>
                <div><label style={s.label}>Poids (kg)</label><input type="number" step="0.1" value={consultForm.weight} onChange={e => setConsultForm({ ...consultForm, weight: e.target.value })} style={s.input} /></div>
              </div>
              <button type="submit" disabled={createConsultMutation.isPending} style={{ ...s.addBtn, marginTop: '1.5rem', padding: '0.75rem 2rem', fontSize: '0.95rem' }}>
                <Save size={16} /> Enregistrer la consultation
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientDetailPage;
