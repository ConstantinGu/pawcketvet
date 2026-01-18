import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { inventoryAPI } from '../services/api';
import toast from 'react-hot-toast';
import { Package, Plus, X, Save, Edit2, Trash2, AlertCircle } from 'lucide-react';

const InventoryPage = () => {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'MEDICATION',
    quantity: 0,
    minStock: 10,
    unit: 'unités',
    price: '',
    supplier: '',
    expiryDate: '',
  });

  const { data: inventoryData, isLoading } = useQuery({
    queryKey: ['inventory'],
    queryFn: () => inventoryAPI.getAll().then(res => res.data),
  });

  const createMutation = useMutation({
    mutationFn: (data) => inventoryAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['inventory']);
      toast.success('Article ajouté !');
      closeModal();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => inventoryAPI.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['inventory']);
      toast.success('Article modifié !');
      closeModal();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => inventoryAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['inventory']);
      toast.success('Article supprimé !');
    },
  });

  const openModal = (item = null) => {
    if (item) {
      setSelectedItem(item);
      setFormData({
        name: item.name,
        category: item.category,
        quantity: item.quantity,
        minStock: item.minStock,
        unit: item.unit,
        price: item.price || '',
        supplier: item.supplier || '',
        expiryDate: item.expiryDate ? item.expiryDate.split('T')[0] : '',
      });
    } else {
      setSelectedItem(null);
      setFormData({
        name: '',
        category: 'MEDICATION',
        quantity: 0,
        minStock: 10,
        unit: 'unités',
        price: '',
        supplier: '',
        expiryDate: '',
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedItem(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedItem) {
      updateMutation.mutate({ id: selectedItem.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      ok: '#059669',
      low: '#d97706',
      critical: '#dc2626',
    };
    return colors[status] || '#A1887F';
  };

  const getStatusLabel = (status) => {
    const labels = {
      ok: 'Stock OK',
      low: 'Stock faible',
      critical: 'Stock critique',
    };
    return labels[status] || status;
  };

  const getCategoryLabel = (category) => {
    const labels = {
      MEDICATION: 'Médicament',
      VACCINE: 'Vaccin',
      EQUIPMENT: 'Équipement',
      FOOD: 'Alimentation',
      SUPPLY: 'Fourniture',
      OTHER: 'Autre',
    };
    return labels[category] || category;
  };

  return (
    <>
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: '2.5rem', marginBottom: '0.5rem', color: '#3E2723', fontWeight: 700 }}>
            Stock & Inventaire
          </h1>
          <p style={{ color: '#A1887F', fontSize: '1.05rem' }}>
            Gérez votre inventaire médical
          </p>
        </div>
        <button onClick={() => openModal()} style={{
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
        }}>
          <Plus size={18} />
          Nouvel article
        </button>
      </div>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#A1887F' }}>Chargement...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '1.5rem' }}>
          {inventoryData?.items?.map((item) => {
            const percentage = (item.quantity / (item.minStock * 2)) * 100;
            return (
              <div key={item.id} style={{
                background: '#fff',
                borderRadius: '16px',
                padding: '1.5rem',
                boxShadow: '0 2px 15px rgba(184, 112, 79, 0.06)',
                border: '1px solid rgba(184, 112, 79, 0.08)',
                borderLeft: `4px solid ${getStatusColor(item.status)}`,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem', color: '#3E2723' }}>{item.name}</h3>
                    <span style={{ fontSize: '0.85rem', color: '#A1887F', background: '#FFF8F0', padding: '0.25rem 0.75rem', borderRadius: '12px' }}>
                      {getCategoryLabel(item.category)}
                    </span>
                  </div>
                  <Package size={24} color="#B8704F" />
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ color: '#6D4C41', fontSize: '0.9rem' }}>Quantité</span>
                    <span style={{ fontWeight: 600, color: getStatusColor(item.status) }}>
                      {item.quantity} {item.unit}
                    </span>
                  </div>
                  <div style={{ background: '#F5E6D3', height: '8px', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ background: getStatusColor(item.status), height: '100%', width: `${Math.min(percentage, 100)}%`, transition: 'width 0.3s' }} />
                  </div>
                  <span style={{ fontSize: '0.8rem', color: '#A1887F' }}>
                    Min: {item.minStock} {item.unit}
                  </span>
                </div>

                {item.status !== 'ok' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem', background: `${getStatusColor(item.status)}15`, borderRadius: '12px', marginBottom: '1rem' }}>
                    <AlertCircle size={16} color={getStatusColor(item.status)} />
                    <span style={{ fontSize: '0.85rem', color: getStatusColor(item.status), fontWeight: 600 }}>
                      {getStatusLabel(item.status)}
                    </span>
                  </div>
                )}

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button onClick={() => openModal(item)} style={{
                    flex: 1,
                    background: 'linear-gradient(135deg, #B8704F 0%, #D4956C 100%)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '0.75rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    justifyContent: 'center',
                  }}>
                    <Edit2 size={16} />
                    Modifier
                  </button>
                  <button onClick={() => {
                    if (window.confirm('Supprimer cet article ?')) deleteMutation.mutate(item.id);
                  }} style={{
                    background: '#dc2626',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '12px',
                    padding: '0.75rem',
                    cursor: 'pointer',
                  }}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(45, 63, 47, 0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={closeModal}>
          <div style={{ background: '#fff', borderRadius: '24px', padding: '2.5rem', maxWidth: '600px', width: '90%', maxHeight: '90vh', overflow: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
              <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: '1.8rem' }}>
                {selectedItem ? 'Modifier l\'article' : 'Nouvel article'}
              </h2>
              <button onClick={closeModal} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Nom *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  style={{ width: '100%', padding: '0.875rem 1.25rem', borderRadius: '12px', border: '2px solid #F5E6D3' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Catégorie *</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    style={{ width: '100%', padding: '0.875rem 1.25rem', borderRadius: '12px', border: '2px solid #F5E6D3' }}
                  >
                    <option value="MEDICATION">Médicament</option>
                    <option value="VACCINE">Vaccin</option>
                    <option value="EQUIPMENT">Équipement</option>
                    <option value="FOOD">Alimentation</option>
                    <option value="SUPPLY">Fourniture</option>
                    <option value="OTHER">Autre</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Unité</label>
                  <input
                    type="text"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    style={{ width: '100%', padding: '0.875rem 1.25rem', borderRadius: '12px', border: '2px solid #F5E6D3' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Quantité *</label>
                  <input
                    type="number"
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) })}
                    required
                    style={{ width: '100%', padding: '0.875rem 1.25rem', borderRadius: '12px', border: '2px solid #F5E6D3' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Stock min *</label>
                  <input
                    type="number"
                    value={formData.minStock}
                    onChange={(e) => setFormData({ ...formData, minStock: parseInt(e.target.value) })}
                    required
                    style={{ width: '100%', padding: '0.875rem 1.25rem', borderRadius: '12px', border: '2px solid #F5E6D3' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
                <button type="submit" style={{
                  flex: 1,
                  background: 'linear-gradient(135deg, #B8704F 0%, #D4956C 100%)',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '1rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  justifyContent: 'center',
                  fontWeight: 600,
                }}>
                  <Save size={18} />
                  {selectedItem ? 'Modifier' : 'Créer'}
                </button>
                <button type="button" onClick={closeModal} style={{
                  background: '#e8ede6',
                  color: '#3E2723',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '1rem 1.5rem',
                  cursor: 'pointer',
                }}>
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

export default InventoryPage;
