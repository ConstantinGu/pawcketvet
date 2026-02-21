import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { appointmentsAPI, animalsAPI } from '../services/api';
import { useNavigate, useSearchParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Calendar, Clock, ChevronRight, CheckCircle, ArrowLeft, FileText,
  Plus, PawPrint, Info, AlertCircle, X
} from 'lucide-react';
import PawcketVetLogo from '../components/PawcketVetLogo';

const speciesEmoji = { DOG: '🐕', CAT: '🐈', RABBIT: '🐇', BIRD: '🐦', RODENT: '🐹', REPTILE: '🦎', OTHER: '🐾' };
const speciesLabel = { DOG: 'Chien', CAT: 'Chat', RABBIT: 'Lapin', BIRD: 'Oiseau', RODENT: 'Rongeur', REPTILE: 'Reptile', OTHER: 'Autre' };

const ClientBookAppointment = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [searchParams] = useSearchParams();
  const preSelectedAnimalId = searchParams.get('animalId');

  const [step, setStep] = useState(1);
  // animalMode: 'existing' | 'new' | 'unregistered'
  const [animalMode, setAnimalMode] = useState(preSelectedAnimalId ? 'existing' : null);
  const [formData, setFormData] = useState({
    animalId: preSelectedAnimalId || '',
    type: 'CONSULTATION',
    date: '',
    timeSlot: '',
    reason: '',
    notes: '',
  });

  // New animal form (for registering a new animal)
  const [newAnimalData, setNewAnimalData] = useState({
    name: '', species: 'DOG', breed: '', gender: 'MALE', birthDate: '', weight: '', color: '',
  });

  // Unregistered animal info (just basic info sent in notes)
  const [unregisteredAnimal, setUnregisteredAnimal] = useState({
    name: '', species: 'DOG', breed: '', approximateAge: '', description: '',
  });

  const { data: animalsData } = useQuery({
    queryKey: ['my-animals'],
    queryFn: () => animalsAPI.getAll().then(res => res.data),
  });

  const animals = animalsData?.animals || [];

  const createAnimalMutation = useMutation({
    mutationFn: (data) => animalsAPI.create(data),
    onSuccess: (res) => {
      queryClient.invalidateQueries(['my-animals']);
      const newAnimal = res.data?.animal || res.data;
      setFormData(prev => ({ ...prev, animalId: newAnimal.id }));
      toast.success(`${newAnimal.name} a été ajouté !`);
      setStep(2);
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Erreur lors de l\'ajout de l\'animal'),
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
      toast.success('Rendez-vous confirmé !');
      navigate('/client/appointments');
    },
    onError: (err) => {
      toast.error(err.response?.data?.error || 'Erreur lors de la réservation');
    },
  });

  const availableSlots = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00',
  ];

  const consultationTypes = [
    { value: 'CONSULTATION', label: 'Consultation générale', icon: '🩺', description: 'Examen de routine ou problème de santé', duration: '30 min' },
    { value: 'VACCINATION', label: 'Vaccination', icon: '💉', description: 'Rappel ou primo-vaccination', duration: '20 min' },
    { value: 'FOLLOWUP', label: 'Suivi', icon: '🔄', description: 'Contrôle après traitement', duration: '20 min' },
    { value: 'GROOMING', label: 'Toilettage', icon: '✂️', description: 'Soins esthétiques et hygiène', duration: '45 min' },
    { value: 'EMERGENCY', label: 'Urgence', icon: '🚨', description: 'Situation urgente nécessitant une prise en charge rapide', duration: '60 min' },
  ];

  const handleCreateAnimal = () => {
    if (!newAnimalData.name) {
      toast.error('Le nom de l\'animal est requis');
      return;
    }
    createAnimalMutation.mutate({
      ...newAnimalData,
      weight: newAnimalData.weight ? parseFloat(newAnimalData.weight) : undefined,
      birthDate: newAnimalData.birthDate || undefined,
    });
  };

  const handleUnregisteredContinue = () => {
    if (!unregisteredAnimal.name) {
      toast.error('Veuillez indiquer le nom de l\'animal');
      return;
    }
    // For unregistered animals, we'll store the info in the notes field
    const animalInfo = `[Animal non enregistré] ${unregisteredAnimal.name} - ${speciesLabel[unregisteredAnimal.species] || unregisteredAnimal.species}${unregisteredAnimal.breed ? ` (${unregisteredAnimal.breed})` : ''}${unregisteredAnimal.approximateAge ? `, ~${unregisteredAnimal.approximateAge}` : ''}${unregisteredAnimal.description ? ` - ${unregisteredAnimal.description}` : ''}`;
    setFormData(prev => ({
      ...prev,
      notes: animalInfo + (prev.notes ? `\n${prev.notes}` : ''),
    }));
    setStep(2);
  };

  const handleSubmit = () => {
    if (animalMode !== 'unregistered' && !formData.animalId) {
      toast.error('Veuillez sélectionner un animal');
      return;
    }
    if (!formData.date || !formData.timeSlot) {
      toast.error('Veuillez choisir une date et un créneau');
      return;
    }
    const submitData = { ...formData };
    if (animalMode === 'unregistered') {
      // If there are animals, use the first one as fallback for API requirement
      // Otherwise the backend should handle null animalId
      if (animals.length > 0 && !submitData.animalId) {
        submitData.animalId = animals[0].id;
      }
    }
    createMutation.mutate(submitData);
  };

  const selectedAnimal = animals.find(a => a.id === formData.animalId);
  const selectedType = consultationTypes.find(t => t.value === formData.type);

  const stepLabels = ['Animal', 'Type', 'Créneau', 'Confirmation'];

  const styles = {
    content: { maxWidth: '800px', margin: '0 auto' },
    card: {
      background: '#fff', borderRadius: '24px', padding: '2.5rem',
      boxShadow: '0 8px 40px rgba(184, 112, 79, 0.12)',
      border: '2px solid rgba(184, 112, 79, 0.08)', marginBottom: '2rem',
    },
    optionCard: {
      background: 'linear-gradient(135deg, #fff 0%, #FFF8F0 100%)',
      borderRadius: '16px', padding: '1.5rem', marginBottom: '0.75rem',
      border: '2px solid rgba(184, 112, 79, 0.1)', cursor: 'pointer',
      transition: 'all 0.2s ease',
    },
    button: {
      background: 'linear-gradient(135deg, #B8704F 0%, #D4956C 100%)',
      color: '#fff', border: 'none', borderRadius: '14px', padding: '1rem 2rem',
      fontSize: '1rem', fontWeight: 600, cursor: 'pointer',
      display: 'flex', alignItems: 'center', gap: '0.5rem',
      transition: 'all 0.3s ease',
      boxShadow: '0 4px 15px rgba(184, 112, 79, 0.25)',
      justifyContent: 'center', width: '100%',
    },
    secondaryButton: {
      background: '#F5E6D3', color: '#3E2723', border: 'none', borderRadius: '14px',
      padding: '1rem 1.5rem', fontSize: '1rem', fontWeight: 600, cursor: 'pointer',
      display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: 'none',
      flex: '0 0 auto', width: 'auto',
    },
    timeSlot: {
      background: '#fff', border: '2px solid #F5E6D3', borderRadius: '12px',
      padding: '0.875rem', textAlign: 'center', cursor: 'pointer',
      transition: 'all 0.2s', fontWeight: 600, fontSize: '0.95rem',
    },
    input: {
      width: '100%', padding: '0.875rem 1rem', borderRadius: '12px',
      border: '2px solid #F5E6D3', fontSize: '0.95rem', fontFamily: 'inherit',
      boxSizing: 'border-box', background: '#FAFAF9', outline: 'none',
      transition: 'border-color 0.2s',
    },
    label: {
      display: 'block', fontSize: '0.88rem', fontWeight: 600,
      color: '#3E2723', marginBottom: '0.5rem',
    },
    modeCard: (active) => ({
      background: active ? '#FFF8F0' : '#fff',
      borderRadius: '16px', padding: '1.25rem',
      border: active ? '2px solid #B8704F' : '2px solid #E7E5E4',
      cursor: 'pointer', transition: 'all 0.2s ease', flex: 1,
      textAlign: 'center',
    }),
  };

  return (
    <div style={styles.content}>
      <button
        onClick={() => navigate(-1)}
        style={{ background: 'transparent', border: 'none', color: '#B8704F', fontSize: '1rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', padding: '0.5rem 0' }}
      >
        <ArrowLeft size={20} /> Retour
      </button>

      <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: '2.5rem', marginBottom: '0.5rem', color: '#3E2723', fontWeight: 700 }}>
        Prendre rendez-vous
      </h1>
      <p style={{ fontSize: '1.05rem', color: '#78716C', marginBottom: '2rem' }}>
        Réservez facilement une consultation en ligne
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
                  color: isActive ? '#fff' : '#78716C',
                }}>
                  {isDone ? <CheckCircle size={20} /> : s}
                </div>
                <span style={{ fontSize: '0.75rem', color: isActive ? '#B8704F' : '#78716C', fontWeight: 600 }}>
                  {label}
                </span>
              </div>
              {s < 4 && (
                <div style={{
                  width: '40px', height: '2px', marginBottom: '1.25rem',
                  background: step > s ? '#B8704F' : '#F5E6D3', borderRadius: '1px',
                }} />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Step 1: Animal selection */}
      {step === 1 && (
        <div style={styles.card}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: '#3E2723', fontFamily: "'Fraunces', serif" }}>
            Pour quel compagnon ?
          </h2>

          {/* Animal mode selection */}
          {!animalMode && (
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={styles.modeCard(false)} onClick={() => setAnimalMode('existing')}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🐾</div>
                <div style={{ fontWeight: 700, color: '#3E2723', fontSize: '1rem', marginBottom: '0.25rem' }}>
                  Animal existant
                </div>
                <div style={{ color: '#78716C', fontSize: '0.85rem' }}>
                  Choisir parmi vos animaux enregistrés
                </div>
              </div>
              <div style={styles.modeCard(false)} onClick={() => setAnimalMode('new')}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}><Plus size={32} color="#B8704F" /></div>
                <div style={{ fontWeight: 700, color: '#3E2723', fontSize: '1rem', marginBottom: '0.25rem' }}>
                  Nouvel animal
                </div>
                <div style={{ color: '#78716C', fontSize: '0.85rem' }}>
                  Enregistrer un nouveau compagnon
                </div>
              </div>
              <div style={styles.modeCard(false)} onClick={() => setAnimalMode('unregistered')}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}><Info size={32} color="#B8704F" /></div>
                <div style={{ fontWeight: 700, color: '#3E2723', fontSize: '1rem', marginBottom: '0.25rem' }}>
                  Sans dossier
                </div>
                <div style={{ color: '#78716C', fontSize: '0.85rem' }}>
                  Première visite, pas encore enregistré
                </div>
              </div>
            </div>
          )}

          {/* Mode: Existing animal */}
          {animalMode === 'existing' && (
            <>
              {!preSelectedAnimalId && (
                <button
                  onClick={() => { setAnimalMode(null); setFormData(prev => ({ ...prev, animalId: '' })); }}
                  style={{ background: 'none', border: 'none', color: '#B8704F', fontSize: '0.88rem', fontWeight: 600, cursor: 'pointer', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                >
                  <ArrowLeft size={16} /> Changer de mode
                </button>
              )}

              {animals.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '2rem', color: '#78716C' }}>
                  <PawcketVetLogo size={56} style={{ marginBottom: '1rem', opacity: 0.5 }} />
                  <p style={{ fontSize: '1.05rem', marginBottom: '1rem' }}>Aucun animal enregistré</p>
                  <p style={{ fontSize: '0.9rem', marginBottom: '1.5rem' }}>Ajoutez un animal ou continuez sans dossier</p>
                  <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                    <button onClick={() => setAnimalMode('new')} style={{ ...styles.button, width: 'auto', padding: '0.75rem 1.5rem' }}>
                      <Plus size={18} /> Ajouter un animal
                    </button>
                    <button onClick={() => setAnimalMode('unregistered')} style={{ ...styles.secondaryButton }}>
                      Continuer sans dossier
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  {animals.map((animal) => (
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
                          <div style={{ color: '#78716C', fontSize: '0.95rem' }}>
                            {speciesLabel[animal.species] || animal.species} {animal.breed ? `- ${animal.breed}` : ''}
                          </div>
                        </div>
                        {formData.animalId === animal.id && <CheckCircle size={24} color="#B8704F" />}
                      </div>
                    </div>
                  ))}

                  {/* Quick link to add new */}
                  <div
                    style={{
                      ...styles.optionCard,
                      border: '2px dashed rgba(184, 112, 79, 0.2)',
                      background: 'transparent',
                      textAlign: 'center',
                    }}
                    onClick={() => setAnimalMode('new')}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: '#B8704F' }}>
                      <Plus size={20} />
                      <span style={{ fontWeight: 600, fontSize: '1rem' }}>Ajouter un nouveau compagnon</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setStep(2)}
                    disabled={!formData.animalId}
                    style={{ ...styles.button, marginTop: '1.5rem', opacity: !formData.animalId ? 0.5 : 1 }}
                  >
                    Continuer <ChevronRight size={18} />
                  </button>
                </>
              )}
            </>
          )}

          {/* Mode: New animal */}
          {animalMode === 'new' && (
            <>
              <button
                onClick={() => setAnimalMode(preSelectedAnimalId ? 'existing' : null)}
                style={{ background: 'none', border: 'none', color: '#B8704F', fontSize: '0.88rem', fontWeight: 600, cursor: 'pointer', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
              >
                <ArrowLeft size={16} /> Retour
              </button>

              <div style={{ background: '#FFF8F0', borderRadius: '14px', padding: '1rem 1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Info size={20} color="#B8704F" />
                <span style={{ fontSize: '0.9rem', color: '#6D4C41' }}>
                  Votre animal sera ajouté à votre dossier et le rendez-vous sera lié à son profil.
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={styles.label}>Nom *</label>
                  <input
                    type="text" value={newAnimalData.name}
                    onChange={e => setNewAnimalData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ex: Luna, Max..." style={styles.input}
                  />
                </div>
                <div>
                  <label style={styles.label}>Espèce *</label>
                  <select
                    value={newAnimalData.species}
                    onChange={e => setNewAnimalData(prev => ({ ...prev, species: e.target.value }))}
                    style={styles.input}
                  >
                    {Object.entries(speciesLabel).map(([k, v]) => (
                      <option key={k} value={k}>{speciesEmoji[k]} {v}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={styles.label}>Race</label>
                  <input
                    type="text" value={newAnimalData.breed}
                    onChange={e => setNewAnimalData(prev => ({ ...prev, breed: e.target.value }))}
                    placeholder="Ex: Labrador, Siamois..." style={styles.input}
                  />
                </div>
                <div>
                  <label style={styles.label}>Sexe</label>
                  <select
                    value={newAnimalData.gender}
                    onChange={e => setNewAnimalData(prev => ({ ...prev, gender: e.target.value }))}
                    style={styles.input}
                  >
                    <option value="MALE">Mâle</option>
                    <option value="FEMALE">Femelle</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <label style={styles.label}>Date de naissance</label>
                  <input
                    type="date" value={newAnimalData.birthDate}
                    onChange={e => setNewAnimalData(prev => ({ ...prev, birthDate: e.target.value }))}
                    style={styles.input}
                  />
                </div>
                <div>
                  <label style={styles.label}>Poids (kg)</label>
                  <input
                    type="number" value={newAnimalData.weight} step="0.1"
                    onChange={e => setNewAnimalData(prev => ({ ...prev, weight: e.target.value }))}
                    placeholder="Ex: 8.5" style={styles.input}
                  />
                </div>
                <div>
                  <label style={styles.label}>Couleur</label>
                  <input
                    type="text" value={newAnimalData.color}
                    onChange={e => setNewAnimalData(prev => ({ ...prev, color: e.target.value }))}
                    placeholder="Ex: Noir et blanc" style={styles.input}
                  />
                </div>
              </div>

              <button
                onClick={handleCreateAnimal}
                disabled={createAnimalMutation.isPending}
                style={{ ...styles.button, opacity: createAnimalMutation.isPending ? 0.7 : 1 }}
              >
                {createAnimalMutation.isPending ? (
                  'Enregistrement...'
                ) : (
                  <>Enregistrer et continuer <ChevronRight size={18} /></>
                )}
              </button>
            </>
          )}

          {/* Mode: Unregistered animal */}
          {animalMode === 'unregistered' && (
            <>
              <button
                onClick={() => setAnimalMode(null)}
                style={{ background: 'none', border: 'none', color: '#B8704F', fontSize: '0.88rem', fontWeight: 600, cursor: 'pointer', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}
              >
                <ArrowLeft size={16} /> Retour
              </button>

              <div style={{ background: '#FFFBEB', borderRadius: '14px', padding: '1rem 1.25rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <AlertCircle size={20} color="#D97706" style={{ flexShrink: 0, marginTop: '0.1rem' }} />
                <div style={{ fontSize: '0.88rem', color: '#92400E', lineHeight: 1.6 }}>
                  <strong>Première visite ?</strong> Renseignez quelques informations sur votre animal.
                  Un dossier complet sera créé lors de la consultation par le vétérinaire.
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={styles.label}>Nom de l'animal *</label>
                  <input
                    type="text" value={unregisteredAnimal.name}
                    onChange={e => setUnregisteredAnimal(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Ex: Luna, Max..." style={styles.input}
                  />
                </div>
                <div>
                  <label style={styles.label}>Espèce *</label>
                  <select
                    value={unregisteredAnimal.species}
                    onChange={e => setUnregisteredAnimal(prev => ({ ...prev, species: e.target.value }))}
                    style={styles.input}
                  >
                    {Object.entries(speciesLabel).map(([k, v]) => (
                      <option key={k} value={k}>{speciesEmoji[k]} {v}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={styles.label}>Race (si connue)</label>
                  <input
                    type="text" value={unregisteredAnimal.breed}
                    onChange={e => setUnregisteredAnimal(prev => ({ ...prev, breed: e.target.value }))}
                    placeholder="Ex: Labrador, croisé..." style={styles.input}
                  />
                </div>
                <div>
                  <label style={styles.label}>Âge approximatif</label>
                  <input
                    type="text" value={unregisteredAnimal.approximateAge}
                    onChange={e => setUnregisteredAnimal(prev => ({ ...prev, approximateAge: e.target.value }))}
                    placeholder="Ex: 3 ans, 6 mois..." style={styles.input}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={styles.label}>Description / Informations complémentaires</label>
                <textarea
                  value={unregisteredAnimal.description}
                  onChange={e => setUnregisteredAnimal(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Couleur, particularités, état de santé apparent..."
                  rows={3}
                  style={{ ...styles.input, resize: 'vertical', fontFamily: 'inherit' }}
                />
              </div>

              <button
                onClick={handleUnregisteredContinue}
                style={styles.button}
              >
                Continuer <ChevronRight size={18} />
              </button>
            </>
          )}
        </div>
      )}

      {/* Step 2: Consultation type */}
      {step === 2 && (
        <div style={styles.card}>
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: '#3E2723', fontFamily: "'Fraunces', serif" }}>
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
                  <div style={{ color: '#78716C', fontSize: '0.9rem' }}>{type.description}</div>
                </div>
                <span style={{ fontSize: '0.8rem', color: '#B8704F', fontWeight: 600, background: '#FFF8F0', padding: '0.25rem 0.5rem', borderRadius: '6px' }}>
                  {type.duration}
                </span>
                {formData.type === type.value && <CheckCircle size={24} color="#B8704F" />}
              </div>
            </div>
          ))}

          {formData.type === 'EMERGENCY' && (
            <div style={{ background: '#FEF2F2', borderRadius: '12px', padding: '1rem 1.25rem', marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <AlertCircle size={20} color="#DC2626" />
              <span style={{ fontSize: '0.88rem', color: '#991B1B', lineHeight: 1.5 }}>
                En cas d'urgence vitale, appelez directement la clinique ou rendez-vous aux urgences vétérinaires.
              </span>
            </div>
          )}

          <div style={{ display: 'flex', gap: '1rem', marginTop: '1.5rem' }}>
            <button onClick={() => setStep(1)} style={styles.secondaryButton}>
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
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: '#3E2723', fontFamily: "'Fraunces', serif" }}>
            Choisir une date et un créneau
          </h2>

          <div style={{ marginBottom: '2rem' }}>
            <label style={styles.label}>
              <Calendar size={16} style={{ verticalAlign: 'middle', marginRight: '0.4rem' }} />
              Date
            </label>
            <input
              type="date" value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              min={new Date().toISOString().split('T')[0]}
              style={styles.input}
            />
          </div>

          {formData.date && (
            <>
              <label style={styles.label}>
                <Clock size={16} style={{ verticalAlign: 'middle', marginRight: '0.4rem' }} />
                Créneau horaire
              </label>

              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.82rem', color: '#78716C', fontWeight: 600 }}>Matin</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '0.5rem', marginBottom: '1rem' }}>
                {availableSlots.filter(s => parseInt(s) < 12).map((slot) => (
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

              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.82rem', color: '#78716C', fontWeight: 600 }}>Après-midi</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: '0.5rem', marginBottom: '2rem' }}>
                {availableSlots.filter(s => parseInt(s) >= 12).map((slot) => (
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
            <label style={styles.label}>Motif de la visite (optionnel)</label>
            <textarea
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              placeholder="Décrivez brièvement la raison de votre visite..."
              rows={3}
              style={{ ...styles.input, resize: 'vertical', fontFamily: 'inherit' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button onClick={() => setStep(2)} style={styles.secondaryButton}>
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
          <h2 style={{ fontSize: '1.5rem', marginBottom: '1.5rem', color: '#3E2723', display: 'flex', alignItems: 'center', gap: '0.5rem', fontFamily: "'Fraunces', serif" }}>
            <FileText size={22} color="#B8704F" /> Récapitulatif
          </h2>

          <div style={{ background: '#FFF8F0', borderRadius: '16px', padding: '1.5rem', marginBottom: '1.5rem' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              <div>
                <span style={{ fontSize: '0.8rem', color: '#78716C', fontWeight: 600, textTransform: 'uppercase' }}>Animal</span>
                {animalMode === 'unregistered' ? (
                  <>
                    <p style={{ fontWeight: 700, color: '#3E2723', fontSize: '1.1rem', margin: '0.25rem 0 0' }}>
                      {speciesEmoji[unregisteredAnimal.species]} {unregisteredAnimal.name}
                    </p>
                    <span style={{ color: '#D97706', fontSize: '0.82rem', fontWeight: 600 }}>
                      Première visite (sans dossier)
                    </span>
                  </>
                ) : (
                  <>
                    <p style={{ fontWeight: 700, color: '#3E2723', fontSize: '1.1rem', margin: '0.25rem 0 0' }}>
                      {speciesEmoji[selectedAnimal?.species] || '🐾'} {selectedAnimal?.name || '-'}
                    </p>
                    <span style={{ color: '#6D4C41', fontSize: '0.85rem' }}>
                      {speciesLabel[selectedAnimal?.species] || ''} {selectedAnimal?.breed ? `- ${selectedAnimal.breed}` : ''}
                    </span>
                  </>
                )}
              </div>
              <div>
                <span style={{ fontSize: '0.8rem', color: '#78716C', fontWeight: 600, textTransform: 'uppercase' }}>Type</span>
                <p style={{ fontWeight: 700, color: '#3E2723', fontSize: '1.1rem', margin: '0.25rem 0 0' }}>
                  {selectedType?.icon} {selectedType?.label || '-'}
                </p>
                <span style={{ color: '#6D4C41', fontSize: '0.85rem' }}>{selectedType?.duration}</span>
              </div>
              <div>
                <span style={{ fontSize: '0.8rem', color: '#78716C', fontWeight: 600, textTransform: 'uppercase' }}>Date</span>
                <p style={{ fontWeight: 700, color: '#3E2723', fontSize: '1.1rem', margin: '0.25rem 0 0' }}>
                  {formData.date ? new Date(formData.date + 'T00:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : '-'}
                </p>
              </div>
              <div>
                <span style={{ fontSize: '0.8rem', color: '#78716C', fontWeight: 600, textTransform: 'uppercase' }}>Heure</span>
                <p style={{ fontWeight: 700, color: '#3E2723', fontSize: '1.1rem', margin: '0.25rem 0 0' }}>
                  {formData.timeSlot || '-'}
                </p>
              </div>
            </div>
            {formData.reason && (
              <div style={{ marginTop: '1rem', borderTop: '1px solid rgba(184,112,79,0.15)', paddingTop: '1rem' }}>
                <span style={{ fontSize: '0.8rem', color: '#78716C', fontWeight: 600, textTransform: 'uppercase' }}>Motif</span>
                <p style={{ color: '#3E2723', fontSize: '0.95rem', margin: '0.25rem 0 0' }}>{formData.reason}</p>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button onClick={() => setStep(3)} style={styles.secondaryButton}>
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
