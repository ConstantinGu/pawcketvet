import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ownersAPI, animalsAPI } from '../services/api';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Heart, Calendar, ChevronRight, Activity, Shield, Weight, Plus, X, Save
} from 'lucide-react';
import PawcketVetLogo from '../components/PawcketVetLogo';
import { CardGridSkeleton } from '../components/LoadingSkeleton';

const speciesEmoji = { DOG: '🐕', CAT: '🐈', RABBIT: '🐇', BIRD: '🐦', RODENT: '🐹', REPTILE: '🦎', OTHER: '🐾' };
const speciesLabel = { DOG: 'Chien', CAT: 'Chat', RABBIT: 'Lapin', BIRD: 'Oiseau', RODENT: 'Rongeur', REPTILE: 'Reptile', OTHER: 'Autre' };

const ClientMyPets = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showAddModal, setShowAddModal] = useState(false);
  const [newAnimal, setNewAnimal] = useState({
    name: '', species: 'DOG', breed: '', gender: 'MALE', birthDate: '', weight: '', color: '',
  });

  const { data, isLoading } = useQuery({
    queryKey: ['my-profile'],
    queryFn: () => ownersAPI.getMyProfile().then(res => res.data),
  });

  const animals = data?.owner?.animals || [];

  const createMutation = useMutation({
    mutationFn: (data) => animalsAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['my-profile']);
      queryClient.invalidateQueries(['my-animals']);
      toast.success('Animal ajouté avec succès !');
      setShowAddModal(false);
      setNewAnimal({ name: '', species: 'DOG', breed: '', gender: 'MALE', birthDate: '', weight: '', color: '' });
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Erreur lors de l\'ajout'),
  });

  const handleCreateAnimal = (e) => {
    e.preventDefault();
    if (!newAnimal.name) { toast.error('Le nom est requis'); return; }
    createMutation.mutate({
      ...newAnimal,
      weight: newAnimal.weight ? parseFloat(newAnimal.weight) : undefined,
      birthDate: newAnimal.birthDate || undefined,
    });
  };

  const getAge = (birthDate) => {
    if (!birthDate) return 'N/A';
    const years = Math.floor((new Date() - new Date(birthDate)) / (365.25 * 24 * 60 * 60 * 1000));
    if (years < 1) {
      const months = Math.floor((new Date() - new Date(birthDate)) / (30.44 * 24 * 60 * 60 * 1000));
      return `${months} mois`;
    }
    return `${years} an${years > 1 ? 's' : ''}`;
  };

  const styles = {
    title: {
      fontFamily: "'Fraunces', serif", fontSize: '2.5rem', marginBottom: '0.5rem',
      color: '#3E2723', fontWeight: 700,
    },
    grid: {
      display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '1.5rem',
    },
    card: {
      background: '#fff', borderRadius: '24px', padding: '2rem',
      boxShadow: '0 4px 24px rgba(184, 112, 79, 0.08)',
      border: '1px solid rgba(184, 112, 79, 0.06)',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      cursor: 'pointer', position: 'relative', overflow: 'hidden',
    },
    actionBtn: {
      background: 'linear-gradient(135deg, #B8704F 0%, #D4956C 100%)',
      color: '#fff', border: 'none', borderRadius: '14px', padding: '0.85rem 1.5rem',
      fontSize: '0.92rem', fontWeight: 600, cursor: 'pointer',
      display: 'flex', alignItems: 'center', gap: '0.5rem',
      width: '100%', justifyContent: 'center', transition: 'all 0.2s',
      boxShadow: '0 4px 15px rgba(184, 112, 79, 0.2)',
    },
    input: {
      width: '100%', padding: '0.875rem 1rem', borderRadius: '12px',
      border: '2px solid #F5E6D3', fontSize: '0.95rem', fontFamily: 'inherit',
      boxSizing: 'border-box', background: '#FAFAF9', outline: 'none',
    },
    label: {
      display: 'block', fontSize: '0.88rem', fontWeight: 600,
      color: '#3E2723', marginBottom: '0.5rem',
    },
  };

  if (isLoading) return <CardGridSkeleton count={4} />;

  return (
    <div style={{ animation: 'fadeIn 0.4s ease' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 style={styles.title}>
            <Heart size={28} style={{ verticalAlign: 'middle', marginRight: '0.5rem', color: '#B8704F' }} />
            Mes compagnons
          </h1>
          <p style={{ color: '#A1887F', fontSize: '1.05rem' }}>
            {animals.length} animal{animals.length !== 1 ? 'aux' : ''} enregistré{animals.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          style={styles.actionBtn}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.03)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        >
          <Plus size={18} /> Ajouter un animal
        </button>
      </div>

      {animals.length === 0 ? (
        <div style={{
          background: '#fff', borderRadius: '24px', padding: '4rem',
          textAlign: 'center', boxShadow: '0 4px 20px rgba(184, 112, 79, 0.08)',
        }}>
          <PawcketVetLogo size={80} style={{ marginBottom: '1.5rem', opacity: 0.6 }} />
          <h2 style={{ fontSize: '1.5rem', color: '#3E2723', marginBottom: '0.75rem' }}>
            Aucun animal enregistré
          </h2>
          <p style={{ color: '#A1887F', marginBottom: '2rem', maxWidth: '400px', margin: '0 auto 2rem' }}>
            Ajoutez votre premier compagnon pour accéder à son carnet de santé et prendre rendez-vous
          </p>
          <button onClick={() => setShowAddModal(true)} style={{ ...styles.actionBtn, width: 'auto', display: 'inline-flex', padding: '1rem 2rem' }}>
            <Plus size={18} /> Ajouter mon premier animal
          </button>
        </div>
      ) : (
        <div style={styles.grid}>
          {animals.map((animal) => {
            const upcomingVaccinations = animal.vaccinations?.filter(
              v => v.nextDueDate && new Date(v.nextDueDate) > new Date()
            ) || [];
            const overdueVaccinations = animal.vaccinations?.filter(
              v => v.nextDueDate && new Date(v.nextDueDate) < new Date()
            ) || [];
            const lastConsultation = animal.consultations?.[0];

            return (
              <div
                key={animal.id}
                style={styles.card}
                onClick={() => navigate(`/client/animal/${animal.id}`)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-4px)';
                  e.currentTarget.style.boxShadow = '0 12px 40px rgba(184, 112, 79, 0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 24px rgba(184, 112, 79, 0.08)';
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ fontSize: '3.5rem' }}>{speciesEmoji[animal.species] || '🐾'}</div>
                    <div>
                      <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: '1.6rem', color: '#3E2723', fontWeight: 700, marginBottom: '0.15rem' }}>
                        {animal.name}
                      </h2>
                      <p style={{ color: '#A1887F', fontSize: '0.92rem' }}>
                        {speciesLabel[animal.species] || animal.species}
                        {animal.breed ? ` - ${animal.breed}` : ''}
                        {animal.gender ? ` - ${animal.gender === 'MALE' ? 'Mâle' : 'Femelle'}` : ''}
                      </p>
                    </div>
                  </div>
                  <ChevronRight size={22} color="#B8704F" />
                </div>

                {/* Stats row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
                  <div style={{ background: '#FFF8F0', borderRadius: '12px', padding: '0.75rem', textAlign: 'center' }}>
                    <div style={{ color: '#A1887F', fontSize: '0.75rem', marginBottom: '0.15rem' }}>Âge</div>
                    <div style={{ color: '#3E2723', fontSize: '1rem', fontWeight: 600 }}>{getAge(animal.birthDate)}</div>
                  </div>
                  <div style={{ background: '#FFF8F0', borderRadius: '12px', padding: '0.75rem', textAlign: 'center' }}>
                    <div style={{ color: '#A1887F', fontSize: '0.75rem', marginBottom: '0.15rem' }}>Poids</div>
                    <div style={{ color: '#3E2723', fontSize: '1rem', fontWeight: 600 }}>{animal.weight ? `${animal.weight} kg` : 'N/A'}</div>
                  </div>
                  <div style={{ background: '#FFF8F0', borderRadius: '12px', padding: '0.75rem', textAlign: 'center' }}>
                    <div style={{ color: '#A1887F', fontSize: '0.75rem', marginBottom: '0.15rem' }}>Visites</div>
                    <div style={{ color: '#3E2723', fontSize: '1rem', fontWeight: 600 }}>{animal.consultations?.length || 0}</div>
                  </div>
                </div>

                {/* Vaccination badges */}
                {(overdueVaccinations.length > 0 || upcomingVaccinations.length > 0) && (
                  <div style={{ marginBottom: '0.75rem', display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                    {overdueVaccinations.map(v => (
                      <span key={v.id} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', background: '#FEF2F2', color: '#DC2626', padding: '0.3rem 0.6rem', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 600 }}>
                        <Shield size={12} /> {v.name} - En retard
                      </span>
                    ))}
                    {upcomingVaccinations.slice(0, 2).map(v => (
                      <span key={v.id} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', background: '#ECFDF5', color: '#059669', padding: '0.3rem 0.6rem', borderRadius: '6px', fontSize: '0.78rem', fontWeight: 600 }}>
                        <Shield size={12} /> {v.name}
                      </span>
                    ))}
                  </div>
                )}

                {/* Allergies / conditions */}
                {(animal.allergies || animal.chronicConditions) && (
                  <div style={{ background: '#FFFBEB', borderRadius: '10px', padding: '0.6rem 0.85rem', marginBottom: '0.75rem', fontSize: '0.82rem', color: '#92400E' }}>
                    {animal.allergies && <div>Allergies : {animal.allergies}</div>}
                    {animal.chronicConditions && <div>Conditions : {animal.chronicConditions}</div>}
                  </div>
                )}

                {/* Last consultation */}
                {lastConsultation && (
                  <div style={{ background: '#F0FDF4', borderRadius: '10px', padding: '0.6rem 0.85rem', marginBottom: '1rem', fontSize: '0.82rem', color: '#166534' }}>
                    <Activity size={13} style={{ verticalAlign: 'middle', marginRight: '0.3rem' }} />
                    Dernière visite : {new Date(lastConsultation.date).toLocaleDateString('fr-FR')}
                    {lastConsultation.veterinarian && ` - Dr. ${lastConsultation.veterinarian.lastName}`}
                  </div>
                )}

                <button
                  onClick={(e) => { e.stopPropagation(); navigate(`/client/book-appointment?animalId=${animal.id}`); }}
                  style={styles.actionBtn}
                >
                  <Calendar size={16} /> Prendre RDV pour {animal.name}
                </button>
              </div>
            );
          })}

          {/* Add animal card */}
          <div
            style={{
              ...styles.card,
              border: '2px dashed rgba(184, 112, 79, 0.2)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
              minHeight: '300px', background: 'linear-gradient(135deg, #FFF8F0 0%, #fff 100%)',
            }}
            onClick={() => setShowAddModal(true)}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#B8704F'; e.currentTarget.style.transform = 'translateY(-4px)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(184, 112, 79, 0.2)'; e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            <div style={{
              width: '64px', height: '64px', borderRadius: '16px',
              background: 'linear-gradient(135deg, #B8704F 0%, #D4956C 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              marginBottom: '1rem',
            }}>
              <Plus size={28} color="#fff" />
            </div>
            <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#3E2723', marginBottom: '0.25rem' }}>
              Ajouter un compagnon
            </div>
            <div style={{ color: '#A1887F', fontSize: '0.88rem' }}>
              Enregistrez un nouvel animal
            </div>
          </div>
        </div>
      )}

      {/* Add Animal Modal */}
      {showAddModal && (
        <div
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(45,63,47,0.8)', display: 'flex',
            alignItems: 'center', justifyContent: 'center', zIndex: 1000,
          }}
          onClick={() => setShowAddModal(false)}
        >
          <div
            style={{
              background: '#fff', borderRadius: '24px', padding: '2.5rem',
              maxWidth: '600px', width: '90%', maxHeight: '90vh', overflow: 'auto',
              animation: 'scaleIn 0.2s ease-out',
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: '1.6rem', color: '#3E2723', fontWeight: 700 }}>
                Nouveau compagnon
              </h2>
              <button onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#A1887F' }}>
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleCreateAnimal}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={styles.label}>Nom *</label>
                  <input type="text" value={newAnimal.name} onChange={e => setNewAnimal(p => ({ ...p, name: e.target.value }))} placeholder="Ex: Luna, Max..." style={styles.input} required />
                </div>
                <div>
                  <label style={styles.label}>Espèce *</label>
                  <select value={newAnimal.species} onChange={e => setNewAnimal(p => ({ ...p, species: e.target.value }))} style={styles.input}>
                    {Object.entries(speciesLabel).map(([k, v]) => <option key={k} value={k}>{speciesEmoji[k]} {v}</option>)}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={styles.label}>Race</label>
                  <input type="text" value={newAnimal.breed} onChange={e => setNewAnimal(p => ({ ...p, breed: e.target.value }))} placeholder="Ex: Labrador..." style={styles.input} />
                </div>
                <div>
                  <label style={styles.label}>Sexe</label>
                  <select value={newAnimal.gender} onChange={e => setNewAnimal(p => ({ ...p, gender: e.target.value }))} style={styles.input}>
                    <option value="MALE">Mâle</option>
                    <option value="FEMALE">Femelle</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <label style={styles.label}>Date de naissance</label>
                  <input type="date" value={newAnimal.birthDate} onChange={e => setNewAnimal(p => ({ ...p, birthDate: e.target.value }))} style={styles.input} />
                </div>
                <div>
                  <label style={styles.label}>Poids (kg)</label>
                  <input type="number" value={newAnimal.weight} step="0.1" onChange={e => setNewAnimal(p => ({ ...p, weight: e.target.value }))} placeholder="8.5" style={styles.input} />
                </div>
                <div>
                  <label style={styles.label}>Couleur</label>
                  <input type="text" value={newAnimal.color} onChange={e => setNewAnimal(p => ({ ...p, color: e.target.value }))} placeholder="Noir et blanc" style={styles.input} />
                </div>
              </div>

              <button type="submit" disabled={createMutation.isPending} style={{ ...styles.actionBtn, opacity: createMutation.isPending ? 0.7 : 1 }}>
                <Save size={18} />
                {createMutation.isPending ? 'Enregistrement...' : 'Enregistrer mon compagnon'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientMyPets;
