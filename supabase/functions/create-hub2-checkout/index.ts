import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { escrowTransactionId } = await req.json();

    if (!escrowTransactionId) {
      throw new Error("escrowTransactionId is required");
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Fetch escrow details
    const { data: escrow, error: escrowError } = await supabaseClient
      .from('escrow_transactions')
      .select('amount')
      .eq('id', escrowTransactionId)
      .single();

    if (escrowError || !escrow) {
      throw new Error("Escrow transaction not found");
    }

    // Call Hub2 API (Simulated for this implementation since we need real keys)
    // Normally we'd do a fetch() to Hub2 payment endpoint here
    const mockPaymentUrl = `${req.headers.get('origin')}/dashboard?payment=success&provider=hub2`;

    // Update escrow with a simulated hub2 intent id
    await supabaseClient
      .from('escrow_transactions')
      .update({ stripe_checkout_session_id: `hub2_${Date.now()}`, status: 'deposited' })
      .eq('id', escrowTransactionId);

    return new Response(
      JSON.stringify({ url: mockPaymentUrl }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});
