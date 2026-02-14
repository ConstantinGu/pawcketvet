import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ownersAPI } from '../services/api';
import {
  FileText, Download, Search, Shield, Stethoscope, Receipt, Filter
} from 'lucide-react';

const ClientDocuments = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  const { data, isLoading } = useQuery({
    queryKey: ['my-profile'],
    queryFn: () => ownersAPI.getMyProfile().then(res => res.data),
  });

  const animals = data?.owner?.animals || [];
  const invoices = data?.owner?.invoices || [];

  // Build documents list from various sources
  const documents = [];

  // Certificates
  animals.forEach(animal => {
    (animal.certificates || []).forEach(cert => {
      documents.push({
        id: cert.id,
        type: 'certificate',
        title: `Certificat ${cert.type === 'HEALTH' ? 'de sante' : cert.type === 'VACCINATION' ? 'vaccinal' : cert.type === 'TRAVEL' ? 'de voyage' : cert.type.toLowerCase()}`,
        animal: animal.name,
        date: cert.issueDate,
        icon: Shield,
        color: '#059669',
        bg: '#dcfce7',
      });
    });
  });

  // Consultation reports
  animals.forEach(animal => {
    (animal.consultations || []).forEach(consult => {
      documents.push({
        id: consult.id,
        type: 'consultation',
        title: `Compte-rendu consultation`,
        animal: animal.name,
        date: consult.date,
        description: consult.diagnosis || consult.reason,
        vet: consult.veterinarian ? `Dr. ${consult.veterinarian.lastName}` : null,
        icon: Stethoscope,
        color: '#2563eb',
        bg: '#dbeafe',
      });
    });
  });

  // Invoices
  invoices.forEach(inv => {
    documents.push({
      id: inv.id,
      type: 'invoice',
      title: `Facture ${inv.number}`,
      date: inv.date,
      amount: inv.total,
      status: inv.status,
      icon: Receipt,
      color: '#B8704F',
      bg: '#FFF8F0',
    });
  });

  // Sort by date
  documents.sort((a, b) => new Date(b.date) - new Date(a.date));

  // Filter
  const filtered = documents.filter(doc => {
    const matchesSearch = !searchTerm ||
      doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (doc.animal && doc.animal.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = filterType === 'all' || doc.type === filterType;
    return matchesSearch && matchesType;
  });

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
    searchBar: {
      display: 'flex',
      gap: '1rem',
      marginBottom: '2rem',
      flexWrap: 'wrap',
    },
    searchInput: {
      flex: 1,
      minWidth: '250px',
      padding: '0.85rem 1rem 0.85rem 2.5rem',
      borderRadius: '14px',
      border: '2px solid rgba(184, 112, 79, 0.15)',
      fontSize: '0.95rem',
      outline: 'none',
      fontFamily: 'inherit',
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
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📄</div>
        <div style={{ color: '#B8704F', fontSize: '1.1rem' }}>Chargement des documents...</div>
      </div>
    );
  }

  return (
    <div>
      <h1 style={styles.title}>Mes documents</h1>
      <p style={styles.subtitle}>
        {documents.length} document{documents.length !== 1 ? 's' : ''} disponible{documents.length !== 1 ? 's' : ''}
      </p>

      {/* Search & Filter */}
      <div style={styles.searchBar}>
        <div style={{ position: 'relative', flex: 1, minWidth: '250px' }}>
          <Search size={18} style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: '#A1887F' }} />
          <input
            type="text"
            placeholder="Rechercher un document..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <Filter size={16} color="#A1887F" />
          {[
            { key: 'all', label: 'Tous' },
            { key: 'certificate', label: 'Certificats' },
            { key: 'consultation', label: 'Consultations' },
            { key: 'invoice', label: 'Factures' },
          ].map(f => (
            <button
              key={f.key}
              onClick={() => setFilterType(f.key)}
              style={filterType === f.key ? styles.filterBtnActive : styles.filterBtn}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Documents list */}
      {filtered.length === 0 ? (
        <div style={{
          background: '#fff',
          borderRadius: '24px',
          padding: '3rem',
          textAlign: 'center',
          boxShadow: '0 4px 20px rgba(184, 112, 79, 0.08)',
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📄</div>
          <h3 style={{ color: '#3E2723', marginBottom: '0.5rem' }}>Aucun document</h3>
          <p style={{ color: '#A1887F' }}>
            {searchTerm ? 'Aucun resultat pour cette recherche' : 'Vos documents apparaitront ici'}
          </p>
        </div>
      ) : (
        filtered.map(doc => {
          const Icon = doc.icon;
          return (
            <div
              key={`${doc.type}-${doc.id}`}
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
                width: '45px',
                height: '45px',
                borderRadius: '12px',
                background: doc.bg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                <Icon size={22} color={doc.color} />
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, color: '#3E2723', fontSize: '0.95rem', marginBottom: '0.2rem' }}>
                  {doc.title}
                </div>
                <div style={{ color: '#A1887F', fontSize: '0.85rem' }}>
                  {doc.animal && `${doc.animal} | `}
                  {new Date(doc.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                  {doc.vet && ` | ${doc.vet}`}
                  {doc.amount !== undefined && ` | ${doc.amount.toFixed(2)} EUR`}
                </div>
                {doc.description && (
                  <div style={{ color: '#6D4C41', fontSize: '0.85rem', marginTop: '0.2rem' }}>
                    {doc.description}
                  </div>
                )}
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  // Future: download functionality
                }}
                style={{
                  background: 'rgba(184, 112, 79, 0.08)',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '0.5rem',
                  cursor: 'pointer',
                  transition: 'all 0.3s',
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

export default ClientDocuments;
