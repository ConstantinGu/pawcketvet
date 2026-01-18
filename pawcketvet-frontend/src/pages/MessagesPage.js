import React from 'react';
import { MessageCircle } from 'lucide-react';

const MessagesPage = () => {
  return (
    <div style={{ textAlign: 'center', padding: '4rem' }}>
      <MessageCircle size={64} color="#B8704F" style={{ margin: '0 auto 2rem' }} />
      <h1 style={{ fontFamily: "'Fraunces', serif", fontSize: '2.5rem', marginBottom: '1rem', color: '#3E2723' }}>
        Messagerie
      </h1>
      <p style={{ color: '#A1887F', fontSize: '1.1rem', marginBottom: '2rem' }}>
        Cette fonctionnalité sera disponible prochainement
      </p>
      <div style={{
        background: 'linear-gradient(135deg, #B8704F15 0%, #D4956C05 100%)',
        borderLeft: '4px solid #B8704F',
        padding: '1.5rem',
        borderRadius: '16px',
        textAlign: 'left',
        maxWidth: '600px',
        margin: '0 auto',
      }}>
        <h3 style={{ marginBottom: '1rem', color: '#3E2723' }}>À venir :</h3>
        <ul style={{ color: '#6D4C41', lineHeight: 1.8 }}>
          <li>💬 Messagerie temps réel avec les propriétaires</li>
          <li>📎 Envoi de pièces jointes</li>
          <li>🔔 Notifications instantanées</li>
          <li>📋 Historique des conversations</li>
        </ul>
      </div>
    </div>
  );
};

export default MessagesPage;
