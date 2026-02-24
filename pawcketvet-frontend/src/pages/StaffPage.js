import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersAPI } from '../services/api';
import toast from 'react-hot-toast';
import { CardGridSkeleton } from '../components/LoadingSkeleton';
import { Search, Plus, X, UserPlus, Edit2, Trash2, Save, Shield, Key } from 'lucide-react';

const roleLabel = { ADMIN: 'Administrateur', VETERINARIAN: 'Vétérinaire', ASSISTANT: 'Assistant(e)' };
const roleColor = { ADMIN: '#9C27B0', VETERINARIAN: '#2196F3', ASSISTANT: '#4CAF50' };

const StaffPage = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showPasswordModal, setShowPasswordModal] = useState(null);
  const [newPassword, setNewPassword] = useState('');
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', email: '', phone: '', role: 'VETERINARIAN', password: '',
  });

  const { data: users, isLoading } = useQuery({
    queryKey: ['users', searchTerm],
    queryFn: () => usersAPI.getAll({ search: searchTerm }).then(r => r.data),
  });

  const createMutation = useMutation({
    mutationFn: (data) => usersAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
      toast.success('Membre ajouté !');
      closeModal();
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Erreur'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => usersAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
      toast.success('Membre modifié !');
      closeModal();
    },
    onError: (err) => toast.error(err.response?.data?.error || 'Erreur'),
  });

  const deactivateMutation = useMutation({
    mutationFn: (id) => usersAPI.deactivate(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['users']);
      toast.success('Membre désactivé');
    },
  });

  const resetPasswordMutation = useMutation({
    mutationFn: ({ id, newPassword }) => usersAPI.resetPassword(id, newPassword),
    onSuccess: () => {
      toast.success('Mot de passe réinitialisé');
      setShowPasswordModal(null);
      setNewPassword('');
    },
    onError: () => toast.error('Erreur'),
  });

  const openModal = (user = null) => {
    if (user) {
      setSelectedUser(user);
      setFormData({ firstName: user.firstName, lastName: user.lastName, email: user.email, phone: user.phone || '', role: user.role, password: '' });
    } else {
      setSelectedUser(null);
      setFormData({ firstName: '', lastName: '', email: '', phone: '', role: 'VETERINARIAN', password: '' });
    }
    setShowModal(true);
  };

  const closeModal = () => { setShowModal(false); setSelectedUser(null); };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedUser) {
      const { password, ...updateData } = formData;
      updateMutation.mutate({ id: selectedUser.id, data: updateData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const staffOnly = users?.filter(u => u.role !== 'OWNER') || [];
  const filtered = staffOnly.filter(u =>
    `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const styles = {
    button: { background: 'linear-gradient(135deg, #B8704F 0%, #D4956C 100%)', color: '#fff', border: 'none', borderRadius: '12px', padding: '0.875rem 1.75rem', fontSize: '0.95rem', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' },
    input: { width: '100%', padding: '0.875rem 1.25rem', borderRadius: '12px', border: '2px solid #F5E6D3', fontSize: '0.95rem', boxSizing: 'border-box' },
    label: { display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#3E2723', fontSize: '0.9rem' },
  };

  return (
    <>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: '2.5rem', marginBottom: '0.5rem', color: '#3E2723', fontWeight: 700 }}>Équipe</h1>
        <p style={{ color: '#78716C', fontSize: '1.05rem' }}>Gérez les membres de votre clinique</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
        {['ADMIN', 'VETERINARIAN', 'ASSISTANT'].map(role => {
          const count = staffOnly.filter(u => u.role === role).length;
          return (
            <div key={role} style={{ background: '#fff', borderRadius: '16px', padding: '1.25rem', boxShadow: '0 2px 12px rgba(184,112,79,0.06)', border: '1px solid rgba(184,112,79,0.08)', textAlign: 'center' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: `${roleColor[role]}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.75rem' }}>
                <Shield size={24} color={roleColor[role]} />
              </div>
              <p style={{ fontSize: '1.8rem', fontWeight: 700, color: roleColor[role] }}>{count}</p>
              <p style={{ color: '#6D4C41', fontWeight: 600, fontSize: '0.9rem' }}>{roleLabel[role]}s</p>
            </div>
          );
        })}
      </div>

      {/* Toolbar */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={20} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: '#78716C' }} />
          <input type="text" placeholder="Rechercher un membre..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} style={{ ...styles.input, paddingLeft: '3rem' }} />
        </div>
        <button onClick={() => openModal()} style={styles.button}><UserPlus size={18} /> Ajouter</button>
      </div>

      {/* List */}
      {isLoading ? (
        <CardGridSkeleton count={4} minWidth="300px" />
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#78716C' }}>Aucun membre trouvé</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filtered.map(user => (
            <div key={user.id} style={{ background: '#fff', borderRadius: '16px', padding: '1.25rem 1.5rem', boxShadow: '0 2px 12px rgba(184,112,79,0.06)', border: '1px solid rgba(184,112,79,0.08)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', opacity: user.isActive ? 1 : 0.5 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: `${roleColor[user.role] || '#607D8B'}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: roleColor[user.role] || '#607D8B', fontSize: '1.1rem' }}>
                  {user.firstName[0]}{user.lastName[0]}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                    <span style={{ fontWeight: 600, color: '#3E2723', fontSize: '1.05rem' }}>{user.firstName} {user.lastName}</span>
                    <span style={{ background: `${roleColor[user.role]}15`, color: roleColor[user.role], borderRadius: '6px', padding: '0.1rem 0.5rem', fontSize: '0.75rem', fontWeight: 600 }}>
                      {roleLabel[user.role] || user.role}
                    </span>
                    {!user.isActive && <span style={{ background: '#FFEBEE', color: '#E53935', borderRadius: '6px', padding: '0.1rem 0.5rem', fontSize: '0.75rem', fontWeight: 600 }}>INACTIF</span>}
                  </div>
                  <p style={{ color: '#78716C', fontSize: '0.9rem' }}>{user.email}{user.phone ? ` | ${user.phone}` : ''}</p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={() => setShowPasswordModal(user.id)} style={{ background: '#E3F2FD', border: 'none', borderRadius: '10px', padding: '0.6rem', cursor: 'pointer' }} title="Réinitialiser le mot de passe">
                  <Key size={18} color="#1565C0" />
                </button>
                <button onClick={() => openModal(user)} style={{ background: '#FFF3E0', border: 'none', borderRadius: '10px', padding: '0.6rem', cursor: 'pointer' }} title="Modifier">
                  <Edit2 size={18} color="#F57C00" />
                </button>
                {user.isActive && (
                  <button onClick={() => { if (window.confirm('Désactiver ce membre ?')) deactivateMutation.mutate(user.id); }} style={{ background: '#FFEBEE', border: 'none', borderRadius: '10px', padding: '0.6rem', cursor: 'pointer' }} title="Désactiver">
                    <Trash2 size={18} color="#E53935" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(45,63,47,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={closeModal}>
          <div style={{ background: '#fff', borderRadius: '24px', padding: '2.5rem', maxWidth: '600px', width: '90%', maxHeight: '90vh', overflow: 'auto' }} onClick={e => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
              <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: '1.8rem', color: '#3E2723' }}>{selectedUser ? 'Modifier' : 'Ajouter un membre'}</h2>
              <button onClick={closeModal} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#78716C' }}><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                <div>
                  <label style={styles.label}>Prénom *</label>
                  <input type="text" value={formData.firstName} onChange={e => setFormData({ ...formData, firstName: e.target.value })} required style={styles.input} />
                </div>
                <div>
                  <label style={styles.label}>Nom *</label>
                  <input type="text" value={formData.lastName} onChange={e => setFormData({ ...formData, lastName: e.target.value })} required style={styles.input} />
                </div>
                <div>
                  <label style={styles.label}>Email *</label>
                  <input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} required style={styles.input} />
                </div>
                <div>
                  <label style={styles.label}>Téléphone</label>
                  <input type="tel" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} style={styles.input} />
                </div>
                <div>
                  <label style={styles.label}>Rôle *</label>
                  <select value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })} style={styles.input}>
                    <option value="VETERINARIAN">Vétérinaire</option>
                    <option value="ASSISTANT">Assistant(e)</option>
                    <option value="ADMIN">Administrateur</option>
                  </select>
                </div>
                {!selectedUser && (
                  <div>
                    <label style={styles.label}>Mot de passe *</label>
                    <input type="password" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} required={!selectedUser} style={styles.input} minLength={6} />
                  </div>
                )}
              </div>
              <button type="submit" disabled={createMutation.isPending || updateMutation.isPending} style={{ ...styles.button, width: '100%', justifyContent: 'center', marginTop: '1.5rem' }}>
                <Save size={18} /> {selectedUser ? 'Enregistrer' : 'Créer'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Password Reset Modal */}
      {showPasswordModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(45,63,47,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setShowPasswordModal(null)}>
          <div style={{ background: '#fff', borderRadius: '24px', padding: '2rem', maxWidth: '400px', width: '90%' }} onClick={e => e.stopPropagation()}>
            <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: '1.5rem', color: '#3E2723', marginBottom: '1.5rem' }}>Réinitialiser le mot de passe</h2>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={styles.label}>Nouveau mot de passe *</label>
              <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} style={styles.input} minLength={6} />
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button onClick={() => { if (newPassword.length >= 6) resetPasswordMutation.mutate({ id: showPasswordModal, newPassword }); else toast.error('6 caractères minimum'); }} disabled={resetPasswordMutation.isPending} style={{ ...styles.button, flex: 1, justifyContent: 'center' }}>
                <Key size={18} /> Réinitialiser
              </button>
              <button onClick={() => setShowPasswordModal(null)} style={{ ...styles.button, background: '#e8ede6', color: '#3E2723', boxShadow: 'none' }}>Annuler</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default StaffPage;
