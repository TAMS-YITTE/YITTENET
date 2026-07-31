import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { Send, User } from 'lucide-react';

const Messages = () => {
  const { user } = useAuth();
  const { conversationId } = useParams();
  const [conversations, setConversations] = useState([]);
  const [activeConv, setActiveConv] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (user) {
      fetchConversations();
    }
  }, [user]);

  // Load messages when a conversation is selected
  useEffect(() => {
    if (activeConv) {
      fetchMessages(activeConv.id);
      
      // Subscribe to real-time new messages
      const channel = supabase
        .channel(`messages:${activeConv.id}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'messages',
            filter: `conversation_id=eq.${activeConv.id}`
          },
          (payload) => {
            setMessages((current) => [...current, payload.new]);
            scrollToBottom();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [activeConv]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversations = async () => {
    try {
      // Fetch all conversations where user is either client or freelancer
      const { data, error } = await supabase
        .from('conversations')
        .select(`
          *,
          client:client_id(id, full_name, role),
          freelancer:freelancer_id(id, full_name, role)
        `)
        .or(`client_id.eq.${user.id},freelancer_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setConversations(data || []);
      
      if (data && data.length > 0 && !activeConv) {
        if (conversationId) {
          const found = data.find(c => c.id === conversationId);
          setActiveConv(found || data[0]);
        } else {
          setActiveConv(data[0]);
        }
      }
    } catch (err) {
      console.error('Erreur conversations:', err);
    }
  };

  const fetchMessages = async (convId) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', convId)
        .order('created_at', { ascending: true });
        
      if (error) throw error;
      setMessages(data || []);
    } catch (err) {
      console.error('Erreur messages:', err);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConv) return;

    try {
      const { error } = await supabase
        .from('messages')
        .insert({
          conversation_id: activeConv.id,
          sender_id: user.id,
          content: newMessage
        });

      if (error) throw error;
      setNewMessage('');
    } catch (err) {
      console.error('Erreur envoi message:', err);
    }
  };

  if (!user) return <div className="container" style={{ padding: '4rem 0', textAlign: 'center' }}>Veuillez vous connecter.</div>;

  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '2rem', height: 'calc(100vh - 80px)' }}>
      <div style={{ display: 'flex', height: '100%', border: '1px solid var(--border-color)', borderRadius: '12px', overflow: 'hidden', backgroundColor: 'var(--bg-card)' }}>
        
        {/* Left Col: Conversations List */}
        <div style={{ width: '300px', borderRight: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', fontWeight: 'bold' }}>
            Mes Conversations
          </div>
          <div style={{ overflowY: 'auto', flex: 1 }}>
            {conversations.length === 0 ? (
              <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                Aucune conversation
              </div>
            ) : (
              conversations.map(conv => {
                // Determine the "other" person
                const otherPerson = conv.client_id === user.id ? conv.freelancer : conv.client;
                const isActive = activeConv?.id === conv.id;
                
                return (
                  <div 
                    key={conv.id}
                    onClick={() => setActiveConv(conv)}
                    style={{
                      padding: '1rem',
                      borderBottom: '1px solid var(--border-color)',
                      cursor: 'pointer',
                      backgroundColor: isActive ? 'rgba(59, 130, 246, 0.1)' : 'transparent',
                      borderLeft: isActive ? '3px solid var(--primary)' : '3px solid transparent',
                      transition: 'background 0.2s'
                    }}
                  >
                    <div style={{ fontWeight: '600' }}>{otherPerson?.full_name}</div>
                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{otherPerson?.role}</div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Col: Chat Area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', backgroundColor: '#f9fafb' }}>
          {activeConv ? (
            <>
              {/* Chat Header */}
              <div style={{ padding: '1rem', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-card)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <User size={20} color="var(--primary)" />
                <span style={{ fontWeight: 'bold' }}>
                  {activeConv.client_id === user.id ? activeConv.freelancer?.full_name : activeConv.client?.full_name}
                </span>
              </div>

              {/* Messages Area */}
              <div style={{ flex: 1, overflowY: 'auto', padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {messages.map(msg => {
                  const isMe = msg.sender_id === user.id;
                  return (
                    <div key={msg.id} style={{
                      alignSelf: isMe ? 'flex-end' : 'flex-start',
                      maxWidth: '70%',
                      padding: '0.8rem 1rem',
                      borderRadius: '12px',
                      backgroundColor: isMe ? 'var(--primary)' : 'var(--bg-card)',
                      color: isMe ? 'white' : 'var(--text-main)',
                      border: isMe ? 'none' : '1px solid var(--border-color)',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                    }}>
                      <div style={{ whiteSpace: 'pre-wrap', lineHeight: '1.4' }}>{msg.content}</div>
                      <div style={{ fontSize: '0.7rem', opacity: 0.7, marginTop: '0.4rem', textAlign: isMe ? 'right' : 'left' }}>
                        {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div style={{ padding: '1rem', backgroundColor: 'var(--bg-card)', borderTop: '1px solid var(--border-color)' }}>
                <form onSubmit={sendMessage} style={{ display: 'flex', gap: '0.5rem' }}>
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Écrivez un message..."
                    style={{ flex: 1, padding: '0.8rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}
                  />
                  <button type="submit" className="btn btn-primary" style={{ padding: '0 1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Send size={18} />
                  </button>
                </form>
              </div>
            </>
          ) : (
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
              Sélectionnez une conversation pour commencer à discuter
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default Messages;
