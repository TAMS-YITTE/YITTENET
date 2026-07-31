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