import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { messagesAPI, ownersAPI } from '../services/api';
import toast from 'react-hot-toast';
import {
  MessageCircle, Send, Search, User, Clock, CheckCircle,
  Mail, MailOpen, Plus, ChevronRight, RefreshCw
} from 'lucide-react';

const MessagesPage = () => {
  const queryClient = useQueryClient();
  const [selectedOwner, setSelectedOwner] = useState(null);
  const [showCompose, setShowCompose] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [composeData, setComposeData] = useState({
    recipientOwnerId: '',
    subject: '',
    content: '',
  });

  const { data: messagesData, isLoading } = useQuery({
    queryKey: ['vet-messages'],
    queryFn: () => messagesAPI.getAll().then(res => res.data),
  });

  const { data: ownersData } = useQuery({
    queryKey: ['owners-list'],
    queryFn: () => ownersAPI.getAll().then(res => res.data),
  });

  const sendMutation = useMutation({
    mutationFn: (data) => messagesAPI.send(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['vet-messages']);
      toast.success('Message envoye !');
      setShowCompose(false);
      setComposeData({ recipientOwnerId: '', subject: '', content: '' });
    },
    onError: () => toast.error('Erreur lors de l\'envoi'),
  });

  const markReadMutation = useMutation({
    mutationFn: (id) => messagesAPI.markAsRead(id),
    onSuccess: () => queryClient.invalidateQueries(['vet-messages']),
  });

  const messages = messagesData?.messages || [];
  const owners = ownersData?.owners || [];

  // Group messages by owner
  const ownerMessages = {};
  messages.forEach(msg => {
    const ownerId = msg.ownerId;
    if (!ownerId) return;
    if (!ownerMessages[ownerId]) {
      ownerMessages[ownerId] = {
        owner: msg.owner,
        messages: [],
        unreadCount: 0,
        lastMessage: null,
      };
    }
    ownerMessages[ownerId].messages.push(msg);
    if (!msg.isRead && !msg.senderId) ownerMessages[ownerId].unreadCount++;
    if (!ownerMessages[ownerId].lastMessage || new Date(msg.createdAt) > new Date(ownerMessages[ownerId].lastMessage.createdAt)) {
      ownerMessages[ownerId].lastMessage = msg;
    }
  });

  const conversations = Object.entries(ownerMessages)
    .map(([id, data]) => ({ id, ...data }))
    .sort((a, b) => new Date(b.lastMessage?.createdAt || 0) - new Date(a.lastMessage?.createdAt || 0));

  const filteredConversations = conversations.filter(conv =>
    !searchTerm ||
    `${conv.owner?.firstName} ${conv.owner?.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedConversation = selectedOwner ? ownerMessages[selectedOwner] : null;

  const handleSend = () => {
    if (!composeData.content.trim()) {
      toast.error('Veuillez saisir un message');
      return;
    }
    if (showCompose && !composeData.recipientOwnerId) {
      toast.error('Veuillez selectionner un destinataire');
      return;
    }
    sendMutation.mutate({
      recipientOwnerId: showCompose ? composeData.recipientOwnerId : selectedOwner,
      subject: composeData.subject,
      content: composeData.content,
    });
  };

  const styles = {
    title: {
      fontFamily: "'Fraunces', serif",
      fontSize: '2rem',
      marginBottom: '0.5rem',
      color: '#3E2723',
      fontWeight: 700,
    },
    container: {
      display: 'grid',
      gridTemplateColumns: '320px 1fr',
      gap: '1.5rem',
      height: 'calc(100vh - 220px)',
      minHeight: '500px',
    },
    sidebar: {
      background: '#fff',
      borderRadius: '20px',
      border: '1px solid rgba(184, 112, 79, 0.1)',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
    },
    convItem: {
      padding: '1rem 1.25rem',
      cursor: 'pointer',
      transition: 'all 0.2s',
      borderBottom: '1px solid rgba(184, 112, 79, 0.06)',
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
    },
    mainPanel: {
      background: '#fff',
      borderRadius: '20px',
      border: '1px solid rgba(184, 112, 79, 0.1)',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
    },
    messagesList: {
      flex: 1,
      overflowY: 'auto',
      padding: '1.5rem',
    },
    inputBar: {
      borderTop: '1px solid rgba(184, 112, 79, 0.1)',
      padding: '1rem 1.25rem',
      display: 'flex',
      gap: '0.75rem',
      alignItems: 'flex-end',
    },
  };

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem' }}>
        <MessageCircle size={48} color="#B8704F" style={{ margin: '0 auto 1rem' }} />
        <div style={{ color: '#B8704F' }}>Chargement des messages...</div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={styles.title}>Messagerie</h1>
          <p style={{ color: '#78716C', fontSize: '0.95rem' }}>
            {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => { setShowCompose(true); setSelectedOwner(null); }}
          style={{
            background: 'linear-gradient(135deg, #B8704F 0%, #D4956C 100%)',
            color: '#fff',
            border: 'none',
            borderRadius: '14px',
            padding: '0.75rem 1.5rem',
            fontSize: '0.9rem',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            boxShadow: '0 4px 15px rgba(184, 112, 79, 0.25)',
          }}
        >
          <Plus size={18} />
          Nouveau message
        </button>
      </div>

      <div style={styles.container}>
        {/* Sidebar - conversations */}
        <div style={styles.sidebar}>
          <div style={{ padding: '1rem', borderBottom: '1px solid rgba(184, 112, 79, 0.1)' }}>
            <div style={{ position: 'relative' }}>
              <Search size={16} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: '#78716C' }} />
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.6rem 0.75rem 0.6rem 2.25rem',
                  borderRadius: '10px',
                  border: '1px solid rgba(184, 112, 79, 0.15)',
                  fontSize: '0.85rem',
                  outline: 'none',
                  fontFamily: 'inherit',
                }}
              />
            </div>
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {filteredConversations.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#78716C', fontSize: '0.9rem' }}>
                Aucune conversation
              </div>
            ) : (
              filteredConversations.map(conv => (
                <div
                  key={conv.id}
                  style={{
                    ...styles.convItem,
                    background: selectedOwner === conv.id ? '#FFF8F0' : 'transparent',
                    borderLeft: selectedOwner === conv.id ? '3px solid #B8704F' : '3px solid transparent',
                  }}
                  onClick={() => { setSelectedOwner(conv.id); setShowCompose(false); }}
                  onMouseEnter={(e) => { if (selectedOwner !== conv.id) e.currentTarget.style.background = '#fefaf6'; }}
                  onMouseLeave={(e) => { if (selectedOwner !== conv.id) e.currentTarget.style.background = 'transparent'; }}
                >
                  <div style={{
                    width: '40px', height: '40px', borderRadius: '50%',
                    background: 'linear-gradient(135deg, #B8704F 0%, #D4956C 100%)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: '#fff', fontWeight: 700, fontSize: '0.85rem', flexShrink: 0,
                  }}>
                    {conv.owner?.firstName?.[0]}{conv.owner?.lastName?.[0]}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: conv.unreadCount > 0 ? 700 : 500, fontSize: '0.9rem', color: '#3E2723' }}>
                        {conv.owner?.firstName} {conv.owner?.lastName}
                      </span>
                      {conv.unreadCount > 0 && (
                        <span style={{
                          background: '#B8704F', color: '#fff', borderRadius: '50%',
                          width: '20px', height: '20px', display: 'flex', alignItems: 'center',
                          justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700,
                        }}>
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                    <div style={{
                      fontSize: '0.8rem', color: '#78716C', marginTop: '0.15rem',
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                    }}>
                      {conv.lastMessage?.content?.substring(0, 50) || 'Pas de message'}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Main panel */}
        <div style={styles.mainPanel}>
          {showCompose ? (
            /* Compose new message */
            <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
              <h3 style={{ fontSize: '1.2rem', color: '#3E2723', marginBottom: '1.5rem' }}>Nouveau message</h3>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#6D4C41', marginBottom: '0.4rem', fontWeight: 600 }}>Destinataire</label>
                <select
                  value={composeData.recipientOwnerId}
                  onChange={(e) => setComposeData({ ...composeData, recipientOwnerId: e.target.value })}
                  style={{
                    width: '100%', padding: '0.75rem', borderRadius: '10px',
                    border: '1px solid rgba(184, 112, 79, 0.2)', fontSize: '0.9rem', fontFamily: 'inherit',
                  }}
                >
                  <option value="">Selectionner un proprietaire...</option>
                  {owners.map(o => (
                    <option key={o.id} value={o.id}>{o.firstName} {o.lastName} - {o.email}</option>
                  ))}
                </select>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#6D4C41', marginBottom: '0.4rem', fontWeight: 600 }}>Sujet</label>
                <input
                  type="text"
                  value={composeData.subject}
                  onChange={(e) => setComposeData({ ...composeData, subject: e.target.value })}
                  placeholder="Objet du message..."
                  style={{
                    width: '100%', padding: '0.75rem', borderRadius: '10px',
                    border: '1px solid rgba(184, 112, 79, 0.2)', fontSize: '0.9rem', fontFamily: 'inherit',
                  }}
                />
              </div>
              <div style={{ flex: 1, marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', color: '#6D4C41', marginBottom: '0.4rem', fontWeight: 600 }}>Message</label>
                <textarea
                  value={composeData.content}
                  onChange={(e) => setComposeData({ ...composeData, content: e.target.value })}
                  placeholder="Votre message..."
                  style={{
                    width: '100%', height: '200px', padding: '0.75rem', borderRadius: '10px',
                    border: '1px solid rgba(184, 112, 79, 0.2)', fontSize: '0.9rem',
                    fontFamily: 'inherit', resize: 'vertical',
                  }}
                />
              </div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button
                  onClick={() => setShowCompose(false)}
                  style={{
                    padding: '0.75rem 1.5rem', borderRadius: '12px', border: '1px solid rgba(184, 112, 79, 0.2)',
                    background: '#fff', color: '#3E2723', fontSize: '0.9rem', fontWeight: 500, cursor: 'pointer',
                  }}
                >
                  Annuler
                </button>
                <button
                  onClick={handleSend}
                  disabled={sendMutation.isPending}
                  style={{
                    padding: '0.75rem 1.5rem', borderRadius: '12px', border: 'none',
                    background: 'linear-gradient(135deg, #B8704F 0%, #D4956C 100%)',
                    color: '#fff', fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: '0.5rem',
                  }}
                >
                  <Send size={16} />
                  {sendMutation.isPending ? 'Envoi...' : 'Envoyer'}
                </button>
              </div>
            </div>
          ) : selectedConversation ? (
            /* Conversation view */
            <>
              <div style={{
                padding: '1rem 1.25rem', borderBottom: '1px solid rgba(184, 112, 79, 0.1)',
                display: 'flex', alignItems: 'center', gap: '0.75rem',
              }}>
                <div style={{
                  width: '36px', height: '36px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, #B8704F 0%, #D4956C 100%)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#fff', fontWeight: 700, fontSize: '0.8rem',
                }}>
                  {selectedConversation.owner?.firstName?.[0]}{selectedConversation.owner?.lastName?.[0]}
                </div>
                <div>
                  <div style={{ fontWeight: 600, color: '#3E2723', fontSize: '0.95rem' }}>
                    {selectedConversation.owner?.firstName} {selectedConversation.owner?.lastName}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#78716C' }}>
                    {selectedConversation.owner?.email}
                  </div>
                </div>
              </div>
              <div style={styles.messagesList}>
                {selectedConversation.messages
                  .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
                  .map(msg => {
                    const isFromVet = !!msg.senderId;
                    if (!msg.isRead && !isFromVet) markReadMutation.mutate(msg.id);
                    return (
                      <div
                        key={msg.id}
                        style={{
                          display: 'flex',
                          justifyContent: isFromVet ? 'flex-end' : 'flex-start',
                          marginBottom: '0.75rem',
                        }}
                      >
                        <div style={{
                          maxWidth: '70%',
                          background: isFromVet
                            ? 'linear-gradient(135deg, #B8704F 0%, #D4956C 100%)'
                            : '#f5f0eb',
                          color: isFromVet ? '#fff' : '#3E2723',
                          padding: '0.75rem 1rem',
                          borderRadius: isFromVet ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
                        }}>
                          {msg.subject && (
                            <div style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.3rem' }}>
                              {msg.subject}
                            </div>
                          )}
                          <div style={{ fontSize: '0.9rem', lineHeight: 1.5 }}>{msg.content}</div>
                          <div style={{
                            fontSize: '0.7rem', marginTop: '0.3rem',
                            opacity: 0.7, textAlign: 'right',
                          }}>
                            {new Date(msg.createdAt).toLocaleString('fr-FR', {
                              day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
              <div style={styles.inputBar}>
                <input
                  type="text"
                  value={composeData.content}
                  onChange={(e) => setComposeData({ ...composeData, content: e.target.value })}
                  placeholder="Ecrire un message..."
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                  style={{
                    flex: 1, padding: '0.75rem', borderRadius: '12px',
                    border: '1px solid rgba(184, 112, 79, 0.2)', fontSize: '0.9rem',
                    fontFamily: 'inherit', outline: 'none',
                  }}
                />
                <button
                  onClick={handleSend}
                  disabled={sendMutation.isPending || !composeData.content.trim()}
                  style={{
                    background: 'linear-gradient(135deg, #B8704F 0%, #D4956C 100%)',
                    color: '#fff', border: 'none', borderRadius: '12px',
                    padding: '0.75rem', cursor: 'pointer',
                    opacity: !composeData.content.trim() ? 0.5 : 1,
                  }}
                >
                  <Send size={18} />
                </button>
              </div>
            </>
          ) : (
            /* No conversation selected */
            <div style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexDirection: 'column', color: '#78716C',
            }}>
              <MessageCircle size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
              <p style={{ fontSize: '1.1rem' }}>Selectionnez une conversation</p>
              <p style={{ fontSize: '0.9rem' }}>ou cliquez sur "Nouveau message"</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;
