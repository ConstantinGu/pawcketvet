import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { invoicesAPI, animalsAPI } from '../services/api';
import toast from 'react-hot-toast';
import { CreditCard, Plus, X, Save, DollarSign } from 'lucide-react';

const InvoicesPage = () => {
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('CB');
  const [formData, setFormData] = useState({
    ownerId: '',
    items: [{ name: '', quantity: 1, price: 0 }],
    notes: '',
  });

  const { data: invoicesData, isLoading } = useQuery({
    queryKey: ['invoices'],
    queryFn: () => invoicesAPI.getAll().then(res => res.data),
  });

  const { data: animalsData } = useQuery({
    queryKey: ['animals'],
    queryFn: () => animalsAPI.getAll().then(res => res.data),
  });

  const createMutation = useMutation({
    mutationFn: (data) => invoicesAPI.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['invoices']);
      toast.success('Facture créée !');
      closeModal();
    },
  });

  const markAsPaidMutation = useMutation({
    mutationFn: ({ id, paymentMethod }) => invoicesAPI.markAsPaid(id, { paymentMethod }),
    onSuccess: () => {
      queryClient.invalidateQueries(['invoices']);
      toast.success('Paiement enregistré !');
    },
  });

  const openModal = () => {
    setFormData({
      ownerId: '',
      items: [{ name: '', quantity: 1, price: 0 }],
      notes: '',
    });
    setShowModal(true);
  };

  const closeModal = () => setShowModal(false);

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { name: '', quantity: 1, price: 0 }],
    });
  };

  const updateItem = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index][field] = value;
    setFormData({ ...formData, items: newItems });
  };

  const removeItem = (index) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    setFormData({ ...formData, items: newItems });
  };

  const calculateTotal = () => {
    const subtotal = formData.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    const tax = subtotal * 0.2;
    return { subtotal, tax, total: subtotal + tax };
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const { subtotal, tax, total } = calculateTotal();
    createMutation.mutate({
      ...formData,
      subtotal,
      tax,
      total,
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      PAID: '#059669',
      PENDING: '#d97706',
      PARTIAL: '#2563eb',
      OVERDUE: '#dc2626',
      CANCELLED: '#64748b',
    };
    return colors[status] || '#A1887F';
  };

  const getStatusLabel = (status) => {
    const labels = {
      PAID: 'Payé',
      PENDING: 'En attente',
      PARTIAL: 'Partiel',
      OVERDUE: 'En retard',
      CANCELLED: 'Annulé',
    };
    return labels[status] || status;
  };

  return (
    <>
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between' }}>
        <div>
          <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: '2.5rem', marginBottom: '0.5rem', color: '#3E2723', fontWeight: 700 }}>
            Facturation
          </h1>
          <p style={{ color: '#A1887F', fontSize: '1.05rem' }}>
            Gérez vos factures et paiements
          </p>
        </div>
        <button onClick={openModal} style={{
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
          Nouvelle facture
        </button>
      </div>

      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#A1887F' }}>Chargement...</div>
      ) : (
        <div style={{ display: 'grid', gap: '1rem' }}>
          {invoicesData?.invoices?.map((invoice) => (
            <div key={invoice.id} style={{
              background: '#fff',
              borderRadius: '16px',
              padding: '1.5rem',
              boxShadow: '0 2px 15px rgba(184, 112, 79, 0.06)',
              border: '1px solid rgba(184, 112, 79, 0.08)',
              borderLeft: `4px solid ${getStatusColor(invoice.status)}`,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.5rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>{invoice.number}</span>
                    <span style={{
                      background: getStatusColor(invoice.status),
                      color: '#fff',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '20px',
                      fontSize: '0.85rem',
                    }}>
                      {getStatusLabel(invoice.status)}
                    </span>
                  </div>
                  <div style={{ color: '#6D4C41', marginBottom: '0.5rem' }}>
                    {invoice.owner.firstName} {invoice.owner.lastName} • {new Date(invoice.date).toLocaleDateString('fr-FR')}
                  </div>
                  <div style={{ fontSize: '1.3rem', fontWeight: 700, color: '#B8704F' }}>
                    {invoice.total.toFixed(2)} €
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  {(invoice.status === 'PENDING' || invoice.status === 'OVERDUE') && (
                    <button
                      onClick={() => { setShowPaymentModal(invoice.id); setPaymentMethod('CB'); }}
                      style={{
                        background: '#059669',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '12px',
                        padding: '0.75rem 1.5rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontWeight: 600,
                      }}
                    >
                      <DollarSign size={18} />
                      Marquer payé
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(45, 63, 47, 0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={closeModal}>
          <div style={{ background: '#fff', borderRadius: '24px', padding: '2.5rem', maxWidth: '700px', width: '90%', maxHeight: '90vh', overflow: 'auto' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem' }}>
              <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: '1.8rem' }}>Nouvelle facture</h2>
              <button onClick={closeModal} style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}>
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Client *</label>
                <select
                  value={formData.ownerId}
                  onChange={(e) => setFormData({ ...formData, ownerId: e.target.value })}
                  required
                  style={{ width: '100%', padding: '0.875rem 1.25rem', borderRadius: '12px', border: '2px solid #F5E6D3' }}
                >
                  <option value="">Sélectionner un client</option>
                  {[...new Map((animalsData?.animals || []).map(a => [a.owner?.id, a.owner])).values()]
                    .filter(Boolean)
                    .map((owner) => (
                      <option key={owner.id} value={owner.id}>
                        {owner.firstName} {owner.lastName}
                      </option>
                    ))}
                </select>
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600 }}>Articles</label>
                {formData.items.map((item, index) => (
                  <div key={index} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <input
                      type="text"
                      placeholder="Description"
                      value={item.name}
                      onChange={(e) => updateItem(index, 'name', e.target.value)}
                      required
                      style={{ padding: '0.75rem', borderRadius: '8px', border: '2px solid #F5E6D3' }}
                    />
                    <input
                      type="number"
                      placeholder="Qté"
                      value={item.quantity}
                      onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value))}
                      required
                      style={{ padding: '0.75rem', borderRadius: '8px', border: '2px solid #F5E6D3' }}
                    />
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Prix"
                      value={item.price}
                      onChange={(e) => updateItem(index, 'price', parseFloat(e.target.value))}
                      required
                      style={{ padding: '0.75rem', borderRadius: '8px', border: '2px solid #F5E6D3' }}
                    />
                    {formData.items.length > 1 && (
                      <button type="button" onClick={() => removeItem(index)} style={{
                        background: '#dc2626',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '8px',
                        padding: '0.75rem',
                        cursor: 'pointer',
                      }}>
                        <X size={18} />
                      </button>
                    )}
                  </div>
                ))}
                <button type="button" onClick={addItem} style={{
                  background: '#F5E6D3',
                  color: '#3E2723',
                  border: 'none',
                  borderRadius: '8px',
                  padding: '0.75rem 1rem',
                  cursor: 'pointer',
                  marginTop: '0.5rem',
                }}>
                  + Ajouter un article
                </button>
              </div>

              <div style={{ background: '#FFF8F0', padding: '1rem', borderRadius: '12px', marginBottom: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span>Sous-total</span>
                  <span>{calculateTotal().subtotal.toFixed(2)} €</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span>TVA (20%)</span>
                  <span>{calculateTotal().tax.toFixed(2)} €</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: '1.2rem', color: '#B8704F' }}>
                  <span>Total</span>
                  <span>{calculateTotal().total.toFixed(2)} €</span>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '1rem' }}>
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
                  Créer la facture
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
      {/* Payment Modal */}
      {showPaymentModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(45, 63, 47, 0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setShowPaymentModal(null)}>
          <div style={{ background: '#fff', borderRadius: '24px', padding: '2rem', maxWidth: '400px', width: '90%' }} onClick={(e) => e.stopPropagation()}>
            <h2 style={{ fontFamily: "'Fraunces', serif", fontSize: '1.5rem', color: '#3E2723', marginBottom: '1.5rem' }}>Enregistrer le paiement</h2>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 600, color: '#3E2723', fontSize: '0.9rem' }}>
                Méthode de paiement
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem' }}>
                {[
                  { value: 'CB', label: 'Carte bancaire' },
                  { value: 'ESPECES', label: 'Espèces' },
                  { value: 'CHEQUE', label: 'Chèque' },
                ].map(m => (
                  <button key={m.value} type="button" onClick={() => setPaymentMethod(m.value)} style={{
                    background: paymentMethod === m.value ? 'linear-gradient(135deg, #B8704F 0%, #D4956C 100%)' : '#F5E6D3',
                    color: paymentMethod === m.value ? '#fff' : '#3E2723',
                    border: 'none', borderRadius: '10px', padding: '0.75rem 0.5rem', cursor: 'pointer',
                    fontWeight: 600, fontSize: '0.85rem', transition: 'all 0.2s',
                  }}>{m.label}</button>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <button onClick={() => {
                markAsPaidMutation.mutate({ id: showPaymentModal, paymentMethod });
                setShowPaymentModal(null);
              }} style={{
                flex: 1, background: '#059669', color: '#fff', border: 'none',
                borderRadius: '12px', padding: '0.875rem', cursor: 'pointer', fontWeight: 600,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
              }}>
                <DollarSign size={18} /> Confirmer le paiement
              </button>
              <button onClick={() => setShowPaymentModal(null)} style={{
                background: '#e8ede6', color: '#3E2723', border: 'none',
                borderRadius: '12px', padding: '0.875rem 1.25rem', cursor: 'pointer', fontWeight: 600,
              }}>Annuler</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default InvoicesPage;
