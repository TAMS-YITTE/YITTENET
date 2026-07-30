import React, { useEffect, useRef, useState } from 'react';
import { Send } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import {
  fetchMessages,
  sendMessage,
  markMessagesRead,
  subscribeToMessages,
} from '../lib/chat';

// Fenêtre de conversation temps réel.
// Props: conversation (ligne conversations, avec client/freelancer joints).
const Chat = ({ conversation }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef(null);

  const conversationId = conversation?.id;

  // Chargement initial + abonnement realtime (re-souscrit si on change de conv)
  useEffect(() => {
    if (!conversationId || !user) return;
    let active = true;

    const load = async () => {
      setLoading(true);
      const { data, error } = await fetchMessages(conversationId);
      if (active && !error) setMessages(data || []);
      setLoading(false);
      markMessagesRead({ conversationId, userId: user.id });
    };
    load();

    const channel = subscribeToMessages(conversationId, (msg) => {
      setMessages((prev) => {
        // Évite les doublons (notre propre insert déjà ajouté en optimiste)
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [...prev, msg];
      });
      if (msg.sender_id !== user.id) {
        markMessagesRead({ conversationId, userId: user.id });
      }
    });

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [conversationId, user]);

  // Auto-scroll vers le bas à chaque nouveau message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    const content = draft.trim();
    if (!content || sending) return;

    setSending(true);
    setDraft('');
    const { data, error } = await sendMessage({
      conversationId,
      senderId: user.id,
      content,
    });
    if (error) {
      setDraft(content); // on restaure en cas d'échec
      console.error('Envoi impossible:', error.message);
    } else if (data) {
      // Ajout optimiste (le realtime dédoublonnera via l'id)
      setMessages((prev) =>
        prev.some((m) => m.id === data.id) ? prev : [...prev, data]
      );
    }
    setSending(false);
  };

  // Nom de l'interlocuteur pour l'en-tête
  const other =
    user?.id === conversation?.client_id
      ? conversation?.freelancer
      : conversation?.client;

  const formatTime = (ts) =>
    new Date(ts).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* En-tête */}
      <div style={{ padding: '1rem 1.25rem', borderBottom: '1px solid var(--border-color)' }}>
        <div style={{ fontWeight: 'bold', color: 'var(--text-main)' }}>
          {other?.full_name || 'Conversation'}
        </div>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          Mission : {conversation?.job?.title || '—'}
        </div>
      </div>

      {/* Fil de messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {loading ? (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', margin: 'auto' }}>
            Chargement…
          </div>
        ) : messages.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text-muted)', margin: 'auto' }}>
            Aucun message. Démarrez la conversation !
          </div>
        ) : (
          messages.map((m) => {
            const mine = m.sender_id === user?.id;
            return (
              <div
                key={m.id}
                style={{
                  alignSelf: mine ? 'flex-end' : 'flex-start',
                  maxWidth: '75%',
                  backgroundColor: mine ? 'var(--primary)' : '#F1F5F9',
                  color: mine ? '#FFFFFF' : 'var(--text-main)',
                  padding: '0.6rem 0.9rem',
                  borderRadius: '14px',
                  borderBottomRightRadius: mine ? '4px' : '14px',
                  borderBottomLeftRadius: mine ? '14px' : '4px',
                }}
              >
                <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{m.content}</div>
                <div style={{ fontSize: '0.7rem', opacity: 0.7, marginTop: '0.25rem', textAlign: 'right' }}>
                  {formatTime(m.created_at)}
                </div>
              </div>
            );
          })
        )}
        <div ref={bottomRef} />
      </div>

      {/* Saisie */}
      <form
        onSubmit={handleSend}
        style={{ display: 'flex', gap: '0.5rem', padding: '1rem', borderTop: '1px solid var(--border-color)' }}
      >
        <input
          type="text"
          className="form-input"
          placeholder="Écrivez votre message…"
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          maxLength={4000}
          style={{ flex: 1 }}
        />
        <button type="submit" className="btn btn-primary" disabled={sending || !draft.trim()} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Send size={18} /> Envoyer
        </button>
      </form>
    </div>
  );
};

export default Chat;
