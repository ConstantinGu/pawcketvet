import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ownersAPI } from '../services/api';
import { ListItemSkeleton } from '../components/LoadingSkeleton';
import toast from 'react-hot-toast';
import {
  CreditCard, Download, CheckCircle, Clock, AlertCircle, XCircle,
  Euro, TrendingUp, Filter, ExternalLink, ChevronDown, ChevronUp, FileText
} from 'lucide-react';

const ClientPayments = () => {
  const [filterStatus, setFilterStatus] = useState('all');
  const [expandedInvoice, setExpandedInvoice] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['my-profile'],
    queryFn: () => ownersAPI.getMyProfile().then(res => res.data),
  });

  const invoices = data?.owner?.invoices || [];

  const filtered = filterStatus === 'all'
    ? invoices
    : invoices.filter(inv => inv.status === filterStatus);

  const statusConfig = {
    DRAFT: { label: 'Brouillon', color: '#6b7280', bg: '#f3f4f6', icon: Clock },
    PENDING: { label: 'En attente', color: '#f59e0b', bg: '#fef3c7', icon: Clock },
    PAID: { label: 'Payé', color: '#16a34a', bg: '#dcfce7', icon: CheckCircle },
    PARTIAL: { label: 'Partiel', color: '#2563eb', bg: '#dbeafe', icon: AlertCircle },
    OVERDUE: { label: 'En retard', color: '#dc2626', bg: '#fef2f2', icon: AlertCircle },
    CANCELLED: { label: 'Annulé', color: '#9333ea', bg: '#f3e8ff', icon: XCircle },
  };

  // Stats
  const totalPaid = invoices.filter(i => i.status === 'PAID').reduce((sum, i) => sum + i.total, 0);
  const totalPending = invoices.filter(i => ['PENDING', 'PARTIAL', 'OVERDUE'].includes(i.status)).reduce((sum, i) => sum + (i.total - i.paidAmount), 0);
  const totalInvoices = invoices.length;

  const styles = {
    title: {
      fontFamily: "'Fraunces', serif",
      fontSize: '2.5rem',
      marginBottom: '0.5rem',
      background: 'linear-gradient(135deg, #B8704F 0%, #D4956C 100%)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      fontWeight: 700,
    },
    subtitle: { color: '#78716C', fontSize: '1.1rem', marginBottom: '2rem' },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '1.5rem',
      marginBottom: '2rem',
    },
    statCard: {
      background: '#fff',
      borderRadius: '20px',
      padding: '1.5rem',
      boxShadow: '0 4px 20px rgba(184, 112, 79, 0.08)',
    },
    filterBar: {
      display: 'flex',
      gap: '0.5rem',
      marginBottom: '2rem',
      flexWrap: 'wrap',
      alignItems: 'center',
    },
    filterBtn: {
      padding: '0.6rem 1.2rem',
      borderRadius: '12px',
      border: '2px solid rgba(184, 112, 79, 0.15)',
      cursor: 'pointer',
      fontSize: '0.85rem',
      fontWeight: 500,
      background: '#fff',
      color: '#3E2723',
      transition: 'all 0.3s',
    },
    filterBtnActive: {
      padding: '0.6rem 1.2rem',
      borderRadius: '12px',
      border: 'none',
      cursor: 'pointer',
      fontSize: '0.85rem',
      fontWeight: 600,
      background: 'linear-gradient(135deg, #B8704F 0%, #D4956C 100%)',
      color: '#fff',
      transition: 'all 0.3s',
    },
    card: {
      background: '#fff',
      borderRadius: '18px',
      padding: '1.25rem 1.5rem',
      marginBottom: '0.75rem',
      boxShadow: '0 2px 15px rgba(184, 112, 79, 0.06)',
      display: 'flex',
      alignItems: 'center',
      gap: '1rem',
      transition: 'all 0.3s',
      cursor: 'pointer',
    },
  };

  if (isLoading) return <ListItemSkeleton count={4} />;

  return (
    <div>
      <h1 style={styles.title}>Paiements & Factures</h1>
      <p style={styles.subtitle}>
        Gérez vos factures et suivez vos paiements
      </p>

      {/* Stats */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '12px',
              background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <CheckCircle size={20} color="#16a34a" />
            </div>
            <span style={{ color: '#78716C', fontSize: '0.9rem' }}>Total payé</span>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#16a34a' }}>
            {totalPaid.toFixed(2)} &euro;
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '12px',
              background: '#fef3c7', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Clock size={20} color="#f59e0b" />
            </div>
            <span style={{ color: '#78716C', fontSize: '0.9rem' }}>En attente</span>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#f59e0b' }}>
            {totalPending.toFixed(2)} &euro;
          </div>
        </div>

        <div style={styles.statCard}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <div style={{
              width: '40px', height: '40px', borderRadius: '12px',
              background: '#FFF8F0', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <TrendingUp size={20} color="#B8704F" />
            </div>
            <span style={{ color: '#78716C', fontSize: '0.9rem' }}>Total factures</span>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#3E2723' }}>
            {totalInvoices}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div style={styles.filterBar}>
        <Filter size={16} color="#78716C" />
        {[
          { key: 'all', label: 'Toutes' },
          { key: 'PENDING', label: 'En attente' },
          { key: 'PAID', label: 'Payées' },
          { key: 'OVERDUE', label: 'En retard' },
        ].map(f => (
          <button
            key={f.key}
            onClick={() => setFilterStatus(f.key)}
            style={filterStatus === f.key ? styles.filterBtnActive : styles.filterBtn}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Invoices list */}
      {filtered.length === 0 ? (
        <div style={{
          background: '#fff',
          borderRadius: '24px',
          padding: '3rem',
          textAlign: 'center',
          boxShadow: '0 4px 20px rgba(184, 112, 79, 0.08)',
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>💳</div>
          <h3 style={{ color: '#3E2723', marginBottom: '0.5rem' }}>Aucune facture</h3>
          <p style={{ color: '#78716C' }}>
            {filterStatus === 'all' ? 'Vos factures apparaîtront ici' : 'Aucune facture dans cette catégorie'}
          </p>
        </div>
      ) : (
        filtered.map(invoice => {
          const status = statusConfig[invoice.status] || statusConfig.PENDING;
          const StatusIcon = status.icon;
          const isExpanded = expandedInvoice === invoice.id;
          const canPay = ['PENDING', 'PARTIAL', 'OVERDUE'].includes(invoice.status);
          const remaining = invoice.total - (invoice.paidAmount || 0);

          return (
            <div key={invoice.id} style={{ marginBottom: '0.75rem' }}>
              <div
                style={styles.card}
                onClick={() => setExpandedInvoice(isExpanded ? null : invoice.id)}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateX(4px)';
                  e.currentTarget.style.boxShadow = '0 6px 25px rgba(184, 112, 79, 0.12)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateX(0)';
                  e.currentTarget.style.boxShadow = '0 2px 15px rgba(184, 112, 79, 0.06)';
                }}
              >
                <div style={{
                  width: '45px', height: '45px', borderRadius: '12px',
                  background: status.bg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <StatusIcon size={22} color={status.color} />
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.2rem' }}>
                    <span style={{ fontWeight: 600, color: '#3E2723', fontSize: '0.95rem' }}>
                      Facture {invoice.number}
                    </span>
                    <span style={{
                      background: status.bg,
                      color: status.color,
                      padding: '0.2rem 0.6rem',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                    }}>
                      {status.label}
                    </span>
                  </div>
                  <div style={{ color: '#78716C', fontSize: '0.85rem' }}>
                    {new Date(invoice.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    {invoice.dueDate && ` | Échéance : ${new Date(invoice.dueDate).toLocaleDateString('fr-FR')}`}
                    {invoice.animal && ` | ${invoice.animal.name}`}
                  </div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 700, fontSize: '1.2rem', color: '#3E2723' }}>
                    {invoice.total.toFixed(2)} &euro;
                  </div>
                  {invoice.paidAmount > 0 && invoice.paidAmount < invoice.total && (
                    <div style={{ color: '#059669', fontSize: '0.8rem' }}>
                      Payé : {invoice.paidAmount.toFixed(2)} &euro;
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toast.success('Téléchargement de la facture en cours...');
                      // Generate a simple text receipt for download
                      const content = [
                        `FACTURE ${invoice.number}`,
                        `Date : ${new Date(invoice.date).toLocaleDateString('fr-FR')}`,
                        invoice.dueDate ? `Échéance : ${new Date(invoice.dueDate).toLocaleDateString('fr-FR')}` : '',
                        `Statut : ${status.label}`,
                        ``,
                        `Total : ${invoice.total.toFixed(2)} €`,
                        invoice.paidAmount ? `Payé : ${invoice.paidAmount.toFixed(2)} €` : '',
                        canPay ? `Reste à payer : ${remaining.toFixed(2)} €` : '',
                        ``,
                        `PawcketVet - Facture générée automatiquement`,
                      ].filter(Boolean).join('\n');
                      const blob = new Blob([content], { type: 'text/plain' });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement('a');
                      a.href = url;
                      a.download = `facture-${invoice.number}.txt`;
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                    title="Télécharger la facture"
                    style={{
                      background: 'rgba(184, 112, 79, 0.08)',
                      border: 'none',
                      borderRadius: '10px',
                      padding: '0.5rem',
                      cursor: 'pointer',
                    }}
                  >
                    <Download size={18} color="#B8704F" />
                  </button>
                  {isExpanded ? <ChevronUp size={18} color="#78716C" /> : <ChevronDown size={18} color="#78716C" />}
                </div>
              </div>

              {/* Expanded detail */}
              {isExpanded && (
                <div style={{
                  background: '#FAFAF9',
                  borderRadius: '0 0 18px 18px',
                  padding: '1.25rem 1.5rem',
                  marginTop: '-0.5rem',
                  border: '1px solid rgba(184, 112, 79, 0.08)',
                  borderTop: 'none',
                }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                    <div>
                      <div style={{ fontSize: '0.8rem', color: '#78716C', marginBottom: '0.25rem' }}>Numéro</div>
                      <div style={{ fontWeight: 600, color: '#3E2723' }}>{invoice.number}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.8rem', color: '#78716C', marginBottom: '0.25rem' }}>Date d'émission</div>
                      <div style={{ fontWeight: 600, color: '#3E2723' }}>
                        {new Date(invoice.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </div>
                    </div>
                    {invoice.dueDate && (
                      <div>
                        <div style={{ fontSize: '0.8rem', color: '#78716C', marginBottom: '0.25rem' }}>Échéance</div>
                        <div style={{ fontWeight: 600, color: invoice.status === 'OVERDUE' ? '#dc2626' : '#3E2723' }}>
                          {new Date(invoice.dueDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </div>
                      </div>
                    )}
                    <div>
                      <div style={{ fontSize: '0.8rem', color: '#78716C', marginBottom: '0.25rem' }}>Montant total</div>
                      <div style={{ fontWeight: 700, color: '#3E2723', fontSize: '1.1rem' }}>
                        {invoice.total.toFixed(2)} €
                      </div>
                    </div>
                  </div>

                  {/* Items if available */}
                  {invoice.items && invoice.items.length > 0 && (
                    <div style={{ marginBottom: '1rem' }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: '#3E2723', marginBottom: '0.5rem' }}>
                        Détail des prestations
                      </div>
                      {invoice.items.map((item, idx) => (
                        <div key={idx} style={{
                          display: 'flex', justifyContent: 'space-between',
                          padding: '0.5rem 0',
                          borderBottom: idx < invoice.items.length - 1 ? '1px solid #E7E5E4' : 'none',
                          fontSize: '0.9rem',
                        }}>
                          <span style={{ color: '#57534E' }}>{item.description || item.name}</span>
                          <span style={{ fontWeight: 600, color: '#3E2723' }}>{(item.amount || item.price || 0).toFixed(2)} €</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Payment button */}
                  {canPay && (
                    <button
                      onClick={() => toast('Le paiement en ligne sera bientôt disponible. Contactez la clinique pour régler cette facture.', { icon: '💳', duration: 5000 })}
                      style={{
                        width: '100%',
                        background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '14px',
                        padding: '0.9rem',
                        fontSize: '0.95rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        boxShadow: '0 4px 15px rgba(5, 150, 105, 0.25)',
                        transition: 'all 0.2s',
                      }}
                      onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.02)'}
                      onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                    >
                      <CreditCard size={18} />
                      Payer {remaining.toFixed(2)} € — Contacter la clinique
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );
};

export default ClientPayments;
