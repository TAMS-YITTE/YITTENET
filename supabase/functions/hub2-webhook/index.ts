import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Hub2 Webhook handler for Mobile Money payments
serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response('Method not allowed', { status: 405 });
  }

  try {
    const payload = await req.json();
    // Verify Hub2 signature here in a real implementation

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Hub2 payload usually contains reference/status
    const { reference, status } = payload;

    if (status === 'successful' || status === 'completed') {
      // Find the escrow transaction
      const { data: escrow } = await supabaseClient
        .from('escrow_transactions')
        .select('id, job_id, client_id, freelancer_id')
        .eq('stripe_checkout_session_id', reference) // We use this column to store external ref
        .single();

      if (escrow) {
        // Update escrow status
        await supabaseClient
          .from('escrow_transactions')
          .update({ status: 'deposited' })
          .eq('id', escrow.id);

        // Update job status
        await supabaseClient
          .from('jobs')
          .update({
            status: 'in_progress',
            freelancer_id: escrow.freelancer_id
          })
          .eq('id', escrow.job_id);
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }
});
