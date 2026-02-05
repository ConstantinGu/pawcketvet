import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ownersAPI } from '../services/api';
import {
  CreditCard, Download, CheckCircle, Clock, AlertCircle, XCircle,
  Euro, TrendingUp, Filter
} from 'lucide-react';

const ClientPayments = () => {
  const [filterStatus, setFilterStatus] = useState('all');

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
    PAID: { label: 'Paye', color: '#16a34a', bg: '#dcfce7', icon: CheckCircle },
    PARTIAL: { label: 'Partiel', color: '#2563eb', bg: '#dbeafe', icon: AlertCircle },
    OVERDUE: { label: 'En retard', color: '#dc2626', bg: '#fef2f2', icon: AlertCircle },
    CANCELLED: { label: 'Annule', color: '#9333ea', bg: '#f3e8ff', icon: XCircle },
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
    subtitle: { color: '#A1887F', fontSize: '1.1rem', marginBottom: '2rem' },
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

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💳</div>
        <div style={{ color: '#B8704F', fontSize: '1.1rem' }}>Chargement des paiements...</div>
      </div>
    );
  }

  return (
    <div>
      <h1 style={styles.title}>Paiements & Factures</h1>
      <p style={styles.subtitle}>
        Gerez vos factures et suivez vos paiements
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
            <span style={{ color: '#A1887F', fontSize: '0.9rem' }}>Total paye</span>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#16a34a' }}>
            {totalPaid.toFixed(2)} EUR
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
            <span style={{ color: '#A1887F', fontSize: '0.9rem' }}>En attente</span>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#f59e0b' }}>
            {totalPending.toFixed(2)} EUR
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
            <span style={{ color: '#A1887F', fontSize: '0.9rem' }}>Total factures</span>
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: '#3E2723' }}>
            {totalInvoices}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div style={styles.filterBar}>
        <Filter size={16} color="#A1887F" />
        {[
          { key: 'all', label: 'Toutes' },
          { key: 'PENDING', label: 'En attente' },
          { key: 'PAID', label: 'Payees' },
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
          <p style={{ color: '#A1887F' }}>
            {filterStatus === 'all' ? 'Vos factures apparaitront ici' : 'Aucune facture dans cette categorie'}
          </p>
        </div>
      ) : (
        filtered.map(invoice => {
          const status = statusConfig[invoice.status] || statusConfig.PENDING;
          const StatusIcon = status.icon;

          return (
            <div
              key={invoice.id}
              style={styles.card}
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
                <div style={{ color: '#A1887F', fontSize: '0.85rem' }}>
                  {new Date(invoice.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                  {invoice.dueDate && ` | Echeance: ${new Date(invoice.dueDate).toLocaleDateString('fr-FR')}`}
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 700, fontSize: '1.2rem', color: '#3E2723' }}>
                  {invoice.total.toFixed(2)} EUR
                </div>
                {invoice.paidAmount > 0 && invoice.paidAmount < invoice.total && (
                  <div style={{ color: '#059669', fontSize: '0.8rem' }}>
                    Paye: {invoice.paidAmount.toFixed(2)} EUR
                  </div>
                )}
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  // Future: download PDF
                }}
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
            </div>
          );
        })
      )}
    </div>
  );
};

export default ClientPayments;
