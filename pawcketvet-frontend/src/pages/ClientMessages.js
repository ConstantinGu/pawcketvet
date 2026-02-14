import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { messagesAPI } from '../services/api';
import toast from 'react-hot-toast';
import {
  MessageCircle, Send, Mail, MailOpen, Clock, Plus
} from 'lucide-react';

const ClientMessages = () => {
  const queryClient = useQueryClient();
  const [showCompose, setShowCompose] = useState(false);
  const [newMessage, setNewMessage] = useState({ subject: '', content: '' });

  const { data, isLoading } = useQuery({
    queryKey: ['my-messages'],
    queryFn: () => messagesAPI.getConversations().then(res => res.data),
  });

  const messages = data?.messages || [];
  const unreadCount = data?.unreadCount || 0;

  const sendMutation = useMutation({
    mutationFn: (data) => messagesAPI.send(data),
    onSuccess: () => {
      toast.success('Message envoye !');
      setShowCompose(false);
      setNewMessage({ subject: '', content: '' });
      queryClient.invalidateQueries({ queryKey: ['my-messages'] });
    },
    onError: () => toast.error('Erreur lors de l\'envoi'),
  });

  const markReadMutation = useMutation({
    mutationFn: (id) => messagesAPI.markAsRead(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['my-messages'] }),
  });

  const handleSend = () => {
    if (!newMessage.content.trim()) {
      toast.error('Veuillez ecrire un message');
      return;
    }
    sendMutation.mutate(newMessage);
  };

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
    card: {
      background: '#fff',
      borderRadius: '20px',
      padding: '1.5rem',
      marginBottom: '0.75rem',
      boxShadow: '0 4px 20px rgba(184, 112, 79, 0.08)',
      border: '1px solid rgba(184, 112, 79, 0.06)',
      cursor: 'pointer',
      transition: 'all 0.3s',
    },
    composeCard: {
      background: '#fff',
      borderRadius: '24px',
      padding: '2rem',
      marginBottom: '2rem',
      boxShadow: '0 8px 30px rgba(184, 112, 79, 0.12)',
    },
    input: {
      width: '100%',
      padding: '0.85rem 1rem',
      borderRadius: '12px',
      border: '2px solid rgba(184, 112, 79, 0.15)',
      fontSize: '0.95rem',
      outline: 'none',
      transition: 'border-color 0.3s',
      fontFamily: 'inherit',
      boxSizing: 'border-box',
    },
    textarea: {
      width: '100%',
      padding: '0.85rem 1rem',
      borderRadius: '12px',
      border: '2px solid rgba(184, 112, 79, 0.15)',
      fontSize: '0.95rem',
      outline: 'none',
      transition: 'border-color 0.3s',
      fontFamily: 'inherit',
      minHeight: '120px',
      resize: 'vertical',
      boxSizing: 'border-box',
    },
    btn: {
      background: 'linear-gradient(135deg, #B8704F 0%, #D4956C 100%)',
      color: '#fff',
      border: 'none',
      borderRadius: '14px',
      padding: '0.85rem 1.5rem',
      fontSize: '0.95rem',
      fontWeight: 600,
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '0.5rem',
      transition: 'all 0.3s',
    },
    btnOutline: {
      background: 'transparent',
      color: '#B8704F',
      border: '2px solid rgba(184, 112, 79, 0.3)',
      borderRadius: '14px',
      padding: '0.85rem 1.5rem',
      fontSize: '0.95rem',
      fontWeight: 600,
      cursor: 'pointer',
      transition: 'all 0.3s',
    },
    unreadBadge: {
      background: '#dc2626',
      color: '#fff',
      borderRadius: '50%',
      width: '24px',
      height: '24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '0.75rem',
      fontWeight: 700,
    },
  };

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💬</div>
        <div style={{ color: '#B8704F', fontSize: '1.1rem' }}>Chargement des messages...</div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 style={styles.title}>Messages</h1>
          <p style={styles.subtitle}>
            {unreadCount > 0 ? `${unreadCount} message${unreadCount > 1 ? 's' : ''} non lu${unreadCount > 1 ? 's' : ''}` : 'Tous les messages sont lus'}
          </p>
        </div>
        <button
          onClick={() => setShowCompose(!showCompose)}
          style={styles.btn}
        >
          <Plus size={20} />
          Nouveau message
        </button>
      </div>

      {/* Compose */}
      {showCompose && (
        <div style={styles.composeCard}>
          <h3 style={{ marginBottom: '1rem', color: '#3E2723', fontSize: '1.2rem' }}>
            Nouveau message a la clinique
          </h3>
          <div style={{ marginBottom: '1rem' }}>
            <input
              type="text"
              placeholder="Sujet (optionnel)"
              value={newMessage.subject}
              onChange={(e) => setNewMessage({ ...newMessage, subject: e.target.value })}
              style={styles.input}
            />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <textarea
              placeholder="Votre message..."
              value={newMessage.content}
              onChange={(e) => setNewMessage({ ...newMessage, content: e.target.value })}
              style={styles.textarea}
            />
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <button onClick={() => setShowCompose(false)} style={styles.btnOutline}>
              Annuler
            </button>
            <button onClick={handleSend} style={styles.btn} disabled={sendMutation.isPending}>
              <Send size={18} />
              {sendMutation.isPending ? 'Envoi...' : 'Envoyer'}
            </button>
          </div>
        </div>
      )}

      {/* Messages list */}
      {messages.length === 0 ? (
        <div style={{
          background: '#fff',
          borderRadius: '24px',
          padding: '3rem',
          textAlign: 'center',
          boxShadow: '0 4px 20px rgba(184, 112, 79, 0.08)',
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>💬</div>
          <h3 style={{ color: '#3E2723', marginBottom: '0.5rem' }}>Aucun message</h3>
          <p style={{ color: '#A1887F' }}>
            Envoyez votre premier message a la clinique
          </p>
        </div>
      ) : (
        messages.map(msg => (
          <div
            key={msg.id}
            style={{
              ...styles.card,
              borderLeft: msg.isRead ? '4px solid transparent' : '4px solid #B8704F',
              background: msg.isRead ? '#fff' : '#FFFAF6',
            }}
            onClick={() => {
              if (!msg.isRead && msg.senderId) {
                markReadMutation.mutate(msg.id);
              }
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateX(4px)';
              e.currentTarget.style.boxShadow = '0 6px 25px rgba(184, 112, 79, 0.12)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateX(0)';
              e.currentTarget.style.boxShadow = '0 4px 20px rgba(184, 112, 79, 0.08)';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
              <div style={{
                width: '45px',
                height: '45px',
                borderRadius: '50%',
                background: msg.senderId
                  ? 'linear-gradient(135deg, #2563eb 0%, #60a5fa 100%)'
                  : 'linear-gradient(135deg, #B8704F 0%, #D4956C 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                {msg.isRead
                  ? <MailOpen size={20} color="#fff" />
                  : <Mail size={20} color="#fff" />}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                  <span style={{ fontWeight: msg.isRead ? 500 : 700, color: '#3E2723', fontSize: '1rem' }}>
                    {msg.sender
                      ? `Dr. ${msg.sender.firstName} ${msg.sender.lastName}`
                      : 'Moi'}
                  </span>
                  <span style={{ color: '#A1887F', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                    <Clock size={12} />
                    {new Date(msg.createdAt).toLocaleDateString('fr-FR', {
                      day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                    })}
                  </span>
                </div>
                {msg.subject && (
                  <div style={{ fontWeight: 600, color: '#3E2723', fontSize: '0.95rem', marginBottom: '0.25rem' }}>
                    {msg.subject}
                  </div>
                )}
                <div style={{
                  color: '#6D4C41',
                  fontSize: '0.9rem',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  maxWidth: '500px',
                }}>
                  {msg.content}
                </div>
              </div>
              {!msg.isRead && msg.senderId && (
                <div style={styles.unreadBadge}>!</div>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default ClientMessages;
