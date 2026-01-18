import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Calendar, MessageCircle, Package, Users, Activity } from 'lucide-react';

const DashboardPage = () => {
  const { user } = useAuth();

  const styles = {
    card: {
      background: 'linear-gradient(135deg, #fff 0%, #FFF8F0 100%)',
      borderRadius: '16px',
      padding: '1.5rem',
      boxShadow: '0 2px 15px rgba(184, 112, 79, 0.06)',
      transition: 'all 0.3s',
      border: '1px solid rgba(184, 112, 79, 0.08)',
      marginBottom: '1.5rem',
    },
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ 
          fontFamily: "'Fraunces', serif", 
          fontSize: '2.5rem', 
          marginBottom: '0.5rem',
          color: '#3E2723',
          fontWeight: 700,
        }}>
          Bienvenue, {user?.firstName} ! 👋
        </h1>
        <p style={{ color: '#A1887F', fontSize: '1.05rem' }}>
          Voici un aperçu de votre clinique • {new Date().toLocaleDateString('fr-FR', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </div>

      {/* Stats Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: '1.5rem',
        marginBottom: '2rem' 
      }}>
        {[
          { label: 'RDV aujourd\'hui', value: '0', icon: Calendar, color: '#B8704F' },
          { label: 'Patients actifs', value: '0', icon: Users, color: '#2563eb' },
          { label: 'Messages', value: '0', icon: MessageCircle, color: '#059669' },
          { label: 'Stock faible', value: '0', icon: Package, color: '#dc2626' },
        ].map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} style={{
              ...styles.card,
              borderLeft: `4px solid ${stat.color}`,
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ color: '#A1887F', fontSize: '0.85rem', marginBottom: '0.5rem' }}>
                    {stat.label}
                  </div>
                  <div style={{ fontSize: '2rem', fontWeight: 700, color: stat.color }}>
                    {stat.value}
                  </div>
                </div>
                <div style={{
                  background: `${stat.color}20`,
                  padding: '1rem',
                  borderRadius: '14px',
                  color: stat.color,
                }}>
                  <Icon size={24} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Info Card */}
      <div style={{
        ...styles.card,
        background: 'linear-gradient(135deg, #B8704F15 0%, #D4956C05 100%)',
        borderLeft: '4px solid #B8704F',
      }}>
        <h2 style={{ fontSize: '1.3rem', marginBottom: '1rem', color: '#3E2723' }}>
          🎉 Backend connecté avec succès !
        </h2>
        <p style={{ color: '#6D4C41', lineHeight: 1.6, marginBottom: '1rem' }}>
          Votre backend est opérationnel et connecté. L'authentification fonctionne parfaitement !
        </p>
        <p style={{ color: '#6D4C41', lineHeight: 1.6 }}>
          <strong>Prochaines étapes :</strong> Nous allons maintenant implémenter les fonctionnalités 
          pour gérer les patients, rendez-vous, stock, et factures.
        </p>
      </div>

      {/* Clinique Info */}
      {user?.clinic && (
        <div style={styles.card}>
          <h3 style={{ fontSize: '1.2rem', marginBottom: '1rem', color: '#3E2723' }}>
            📍 Votre clinique
          </h3>
          <div style={{ color: '#6D4C41' }}>
            <p><strong>{user.clinic.name}</strong></p>
            <p>{user.clinic.address}</p>
            <p>{user.clinic.city}, {user.clinic.postalCode}</p>
            <p>📞 {user.clinic.phone}</p>
            <p>📧 {user.clinic.email}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
