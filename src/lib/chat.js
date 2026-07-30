import { supabase } from './supabase';

// Récupère la conversation (job, freelance) si elle existe, sinon la crée.
// Retourne { data, error } avec data = la ligne conversation.
export async function getOrCreateConversation({ jobId, clientId, freelancerId }) {
  // 1. Existe déjà ?
  const { data: existing, error: findError } = await supabase
    .from('conversations')
    .select('*')
    .eq('job_id', jobId)
    .eq('freelancer_id', freelancerId)
    .maybeSingle();

  if (findError) return { data: null, error: findError };
  if (existing) return { data: existing, error: null };

  // 2. Sinon on la crée
  const { data: created, error: createError } = await supabase
    .from('conversations')
    .insert({ job_id: jobId, client_id: clientId, freelancer_id: freelancerId })
    .select()
    .single();

  return { data: created, error: createError };
}

// Liste des conversations de l'utilisateur courant, triées par dernier message.
// Jointures sur le job (titre) et sur les deux profils (nom) pour l'affichage.
export async function fetchConversations() {
  return supabase
    .from('conversations')
    .select(`
      *,
      job:jobs(id, title),
      client:profiles!conversations_client_id_fkey(id, full_name),
      freelancer:profiles!conversations_freelancer_id_fkey(id, full_name)
    `)
    .order('last_message_at', { ascending: false });
}

// Messages d'une conversation, du plus ancien au plus récent.
export async function fetchMessages(conversationId) {
  return supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true });
}

export async function sendMessage({ conversationId, senderId, content }) {
  return supabase
    .from('messages')
    .insert({ conversation_id: conversationId, sender_id: senderId, content })
    .select()
    .single();
}

// Marque comme lus les messages reçus (non envoyés par soi) d'une conversation.
export async function markMessagesRead({ conversationId, userId }) {
  return supabase
    .from('messages')
    .update({ read_at: new Date().toISOString() })
    .eq('conversation_id', conversationId)
    .neq('sender_id', userId)
    .is('read_at', null);
}

// Abonnement temps réel : appelle onNewMessage(message) à chaque insert.
// Retourne le channel — pensez à supabase.removeChannel(channel) au cleanup.
export function subscribeToMessages(conversationId, onNewMessage) {
  const channel = supabase
    .channel(`messages:${conversationId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`,
      },
      (payload) => onNewMessage(payload.new)
    )
    .subscribe();

  return channel;
}
