// Client-triggered: releases escrowed funds once delivery is confirmed.
// Deploy: supabase functions deploy release-escrow
// (SUPABASE_URL / SUPABASE_ANON_KEY / SUPABASE_SERVICE_ROLE_KEY are injected automatically.)

import { createClient } from 'jsr:@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { jobId } = await req.json();
    if (!jobId) {
      return new Response(JSON.stringify({ error: 'jobId is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const authClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } } }
    );

    const { data: { user } } = await authClient.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: escrow, error: escrowError } = await authClient
      .from('escrow_transactions')
      .select('*')
      .eq('job_id', jobId)
      .single();

    if (escrowError || !escrow) {
      return new Response(JSON.stringify({ error: 'Escrow transaction not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (escrow.client_id !== user.id) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (escrow.status !== 'deposited') {
      return new Response(JSON.stringify({ error: `Cannot release funds from status "${escrow.status}"` }), {
        status: 409,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Service role for the write — escrow_transactions has no client UPDATE
    // policy on purpose (see the migration), so status changes only ever
    // happen through Edge Functions after the checks above.
    const serviceClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // NOTE: with a Stripe Connect destination charge (see create-checkout-session),
    // the freelancer's share was already transferred at deposit time — this only
    // reflects that the client confirmed delivery. If funds are instead held on
    // the platform balance, trigger a stripe.transfers.create(...) here before
    // marking the escrow released.
    await serviceClient
      .from('escrow_transactions')
      .update({ status: 'released' })
      .eq('id', escrow.id);

    await serviceClient
      .from('jobs')
      .update({ status: 'completed' })
      .eq('id', jobId);

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('release-escrow error:', err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
