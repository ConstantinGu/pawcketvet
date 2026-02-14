import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { animalsAPI } from '../services/api';
import toast from 'react-hot-toast';
import {
  Search, Plus, X, Edit2, Trash2, Save, Calendar,
  Phone, Mail, MapPin, Activity, Eye
} from 'lucide-react';

const PatientsPage = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedAnimal, setSelectedAnimal] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    species: 'DOG',
    breed: '',
    birthDate: '',
    gender: 'MALE',
    color: '',
    weight: '',
    microchip: '',
    allergies: '',
    chronicConditions: '',
    notes: '',
    ownerData: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      postalCode: '',
    },
  });

  // Récupérer les animaux
  const { data: animalsData, isLoading } = useQuery({
    queryKey: ['animals', searchTerm],
    queryFn: () => animalsAPI.getAll({ search: searchTerm }).then(res => res.data),
  });

  // Mutation pour créer/modifier
  const createMutation = useMutation({
    mutationFn: (data) => animalsAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['animals']);
      toast.success('Patient créé avec succès !');
      closeModal();
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Erreur lors de la création');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => animalsAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['animals']);
      toast.success('Patient modifié avec succès !');
      closeModal();
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Erreur lors de la modification');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => animalsAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['animals']);
      toast.success('Patient supprimé avec succès !');
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Erreur lors de la suppression');
    },
  });

  const openModal = (animal = null) => {
    if (animal) {
      setSelectedAnimal(animal);
      setFormData({
        name: animal.name,
        species: animal.species,
        breed: animal.breed || '',
        birthDate: animal.birthDate ? animal.birthDate.split('T')[0] : '',
        gender: animal.gender || 'MALE',
        color: animal.color || '',
        weight: animal.weight || '',
        microchip: animal.microchip || '',
        allergies: animal.allergies || '',
        chronicConditions: animal.chronicConditions || '',
        notes: animal.notes || '',
        ownerData: {
          firstName: animal.owner?.firstName || '',
          lastName: animal.owner?.lastName || '',
          email: animal.owner?.email || '',
          phone: animal.owner?.phone || '',
          address: animal.owner?.address || '',
          city: animal.owner?.city || '',
          postalCode: animal.owner?.postalCode || '',
        },
      });
    } else {
      setSelectedAnimal(null);
      setFormData({
        name: '',
        species: 'DOG',
        breed: '',
        birthDate: '',
        gender: 'MALE',
        color: '',
        weight: '',
        microchip: '',
        allergies: '',
        chronicConditions: '',
        notes: '',
        ownerData: {
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          address: '',
          city: '',
          postalCode: '',
        },
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedAnimal(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (selectedAnimal) {
      updateMutation.mutate({ id: selectedAnimal.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce patient ?')) {
      deleteMutation.mutate(id);
    }
  };

  const styles = {
    header: {
      marginBottom: '2rem',
    },
    title: {
      fontFamily: "'Fraunces', serif",
      fontSize: '2.5rem',
      marginBottom: '0.5rem',
      color: '#3E2723',
      fontWeight: 700,
    },
    searchBar: {
      display: 'flex',
      gap: '1rem',
      marginBottom: '2rem',
    },
    searchInput: {
      flex: 1,
      padding: '0.875rem 1.25rem',
      paddingLeft: '3rem',
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
    grid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
      gap: '1.5rem',
    },
    card: {
      background: '#fff',
      borderRadius: '16px',
      padding: '1.5rem',
      boxShadow: '0 2px 15px rgba(184, 112, 79, 0.06)',
      border: '1px solid rgba(184, 112, 79, 0.08)',
      cursor: 'pointer',
      transition: 'all 0.3s',
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
      maxWidth: '800px',
      width: '90%',
      maxHeight: '90vh',
      overflow: 'auto',
    },
    formGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '1.5rem',
    },
    inputGroup: {
      marginBottom: '1.5rem',
    },
    label: {
      display: 'block',
      marginBottom: '0.5rem',
      fontWeight: 600,
      color: '#3E2723',
      fontSize: '0.9rem',
    },
    input: {
      width: '100%',
      padding: '0.875rem 1.25rem',
      borderRadius: '12px',
      border: '2px solid #F5E6D3',
      fontSize: '0.95rem',
    },
  };

  return (
    <>
      <div style={styles.header}>
        <h1 style={styles.title}>Patients</h1>
        <p style={{ color: '#A1887F', fontSize: '1.05rem' }}>
          Gérez les dossiers de vos patients
        </p>
      </div>

      {/* Barre de recherche */}
      <div style={styles.searchBar}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search 
            size={20} 
            style={{ 
              position: 'absolute', 
              left: '1rem', 
              top: '50%', 
              transform: 'translateY(-50%)', 
              color: '#A1887F' 
            }} 
          />
          <input
            type="text"
            placeholder="Rechercher un patient..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
        </div>
        <button 
          onClick={() => openModal()}
          style={styles.button}
        >
          <Plus size={18} />
          Nouveau patient
        </button>
      </div>

      {/* Liste des patients */}
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#A1887F' }}>
          Chargement...
        </div>
      ) : animalsData?.animals?.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#A1887F' }}>
          Aucun patient trouvé. Créez-en un !
        </div>
      ) : (
        <div style={styles.grid}>
          {animalsData?.animals?.map((animal) => (
            <div
              key={animal.id}
              style={styles.card}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 6px 25px rgba(184, 112, 79, 0.12)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 15px rgba(184, 112, 79, 0.06)';
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.3rem', marginBottom: '0.25rem', color: '#3E2723' }}>
                    {animal.name}
                  </h3>
                  <p style={{ color: '#A1887F', fontSize: '0.9rem' }}>
                    {{ DOG: 'Chien', CAT: 'Chat', RABBIT: 'Lapin', BIRD: 'Oiseau', RODENT: 'Rongeur', REPTILE: 'Reptile' }[animal.species] || 'Autre'} • {animal.breed || 'Race non spécifiée'}
                  </p>
                </div>
                <div style={{ fontSize: '2rem' }}>
                  {{ DOG: '🐕', CAT: '🐈', RABBIT: '🐇', BIRD: '🐦', RODENT: '🐹', REPTILE: '🦎' }[animal.species] || '🐾'}
                </div>
              </div>

              <div style={{ marginBottom: '1rem', padding: '1rem', background: '#FFF8F0', borderRadius: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <Activity size={16} color="#B8704F" />
                  <span style={{ fontSize: '0.9rem', color: '#6D4C41' }}>
                    Propriétaire: {animal.owner?.firstName} {animal.owner?.lastName}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Phone size={16} color="#B8704F" />
                  <span style={{ fontSize: '0.9rem', color: '#6D4C41' }}>
                    {animal.owner?.phone}
                  </span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/patient/${animal.id}`);
                  }}
                  style={{
                    ...styles.button,
                    flex: 1,
                    justifyContent: 'center',
                    fontSize: '0.85rem',
                    padding: '0.75rem',
                    background: '#fff',
                    color: '#B8704F',
                    border: '2px solid #F5E6D3',
                  }}
                >
                  <Eye size={16} />
                  Dossier
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openModal(animal);
                  }}
                  style={{
                    ...styles.button,
                    padding: '0.75rem',
                  }}
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(animal.id);
                  }}
                  style={{
                    ...styles.button,
                    background: '#dc2626',
                    padding: '0.75rem',
                  }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div style={styles.modal} onClick={closeModal}>
          <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
              <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: '1.8rem', color: '#3E2723' }}>
                {selectedAnimal ? 'Modifier le patient' : 'Nouveau patient'}
              </h2>
              <button
                onClick={closeModal}
                style={{
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#A1887F',
                }}
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <h3 style={{ marginBottom: '1rem', color: '#3E2723' }}>Informations de l'animal</h3>
              <div style={styles.formGrid}>
                <div>
                  <label style={styles.label}>Nom *</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    style={styles.input}
                  />
                </div>

                <div>
                  <label style={styles.label}>Espèce *</label>
                  <select
                    value={formData.species}
                    onChange={(e) => setFormData({ ...formData, species: e.target.value })}
                    style={styles.input}
                  >
                    <option value="DOG">Chien</option>
                    <option value="CAT">Chat</option>
                    <option value="RABBIT">Lapin</option>
                    <option value="BIRD">Oiseau</option>
                    <option value="RODENT">Rongeur</option>
                    <option value="OTHER">Autre</option>
                  </select>
                </div>

                <div>
                  <label style={styles.label}>Race</label>
                  <input
                    type="text"
                    value={formData.breed}
                    onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
                    style={styles.input}
                  />
                </div>

                <div>
                  <label style={styles.label}>Date de naissance</label>
                  <input
                    type="date"
                    value={formData.birthDate}
                    onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                    style={styles.input}
                  />
                </div>

                <div>
                  <label style={styles.label}>Sexe</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    style={styles.input}
                  >
                    <option value="MALE">Mâle</option>
                    <option value="FEMALE">Femelle</option>
                  </select>
                </div>

                <div>
                  <label style={styles.label}>Poids (kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.weight}
                    onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                    style={styles.input}
                  />
                </div>
              </div>

              <h3 style={{ marginTop: '2rem', marginBottom: '1rem', color: '#3E2723' }}>
                Propriétaire
              </h3>
              <div style={styles.formGrid}>
                <div>
                  <label style={styles.label}>Prénom *</label>
                  <input
                    type="text"
                    value={formData.ownerData.firstName}
                    onChange={(e) => setFormData({
                      ...formData,
                      ownerData: { ...formData.ownerData, firstName: e.target.value }
                    })}
                    required={!selectedAnimal}
                    style={styles.input}
                    disabled={!!selectedAnimal}
                  />
                </div>

                <div>
                  <label style={styles.label}>Nom *</label>
                  <input
                    type="text"
                    value={formData.ownerData.lastName}
                    onChange={(e) => setFormData({
                      ...formData,
                      ownerData: { ...formData.ownerData, lastName: e.target.value }
                    })}
                    required={!selectedAnimal}
                    style={styles.input}
                    disabled={!!selectedAnimal}
                  />
                </div>

                <div>
                  <label style={styles.label}>Email *</label>
                  <input
                    type="email"
                    value={formData.ownerData.email}
                    onChange={(e) => setFormData({
                      ...formData,
                      ownerData: { ...formData.ownerData, email: e.target.value }
                    })}
                    required={!selectedAnimal}
                    style={styles.input}
                    disabled={!!selectedAnimal}
                  />
                </div>

                <div>
                  <label style={styles.label}>Téléphone *</label>
                  <input
                    type="tel"
                    value={formData.ownerData.phone}
                    onChange={(e) => setFormData({
                      ...formData,
                      ownerData: { ...formData.ownerData, phone: e.target.value }
                    })}
                    required={!selectedAnimal}
                    style={styles.input}
                    disabled={!!selectedAnimal}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  style={{
                    ...styles.button,
                    flex: 1,
                    justifyContent: 'center',
                  }}
                >
                  <Save size={18} />
                  {selectedAnimal ? 'Enregistrer' : 'Créer'}
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

export default PatientsPage;
