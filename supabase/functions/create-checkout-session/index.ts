// Creates a Stripe Checkout Session for an escrow deposit.
// Deploy: supabase functions deploy create-checkout-session
// Secrets required: STRIPE_SECRET_KEY, SITE_URL
// (SUPABASE_URL / SUPABASE_ANON_KEY / SUPABASE_SERVICE_ROLE_KEY are injected automatically.)

import Stripe from 'npm:stripe@17';
import { createClient } from 'jsr:@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '');

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { escrowTransactionId } = await req.json();
    if (!escrowTransactionId) {
      return new Response(JSON.stringify({ error: 'escrowTransactionId is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Bound to the caller's JWT — RLS ensures this only succeeds if the caller
    // actually owns this escrow transaction.
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
      .select('*, jobs(title)')
      .eq('id', escrowTransactionId)
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

    if (escrow.status !== 'pending') {
      return new Response(JSON.stringify({ error: `Escrow already ${escrow.status}` }), {
        status: 409,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Service role only to read the freelancer's Connect account id and to
    // write the checkout session id back — escrow_transactions has no client
    // UPDATE policy on purpose (see the migration).
    const serviceClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: freelancerProfile } = await serviceClient
      .from('profiles')
      .select('stripe_account_id, is_premium')
      .eq('id', escrow.freelancer_id)
      .single();

    const siteUrl = Deno.env.get('SITE_URL') ?? 'http://localhost:5173';
    const amountInCents = Math.round(Number(escrow.amount) * 100);

    const sessionParams = {
      mode: 'payment',
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'eur',
          unit_amount: amountInCents,
          product_data: { name: escrow.jobs?.title || 'Mission YITTE' },
        },
        quantity: 1,
      }],
      metadata: { escrow_transaction_id: escrow.id },
      success_url: `${siteUrl}/dashboard?payment=success`,
      cancel_url: `${siteUrl}/dashboard?payment=cancelled`,
    };

    const commissionRate = freelancerProfile?.is_premium ? 0.05 : 0.10;
    const platformFeeCents = Math.round(amountInCents * commissionRate);
    
    sessionParams.payment_intent_data = {
      transfer_group: `job_${escrow.job_id}`
    };

    const session = await stripe.checkout.sessions.create(sessionParams);

    await serviceClient
      .from('escrow_transactions')
      .update({ 
        stripe_checkout_session_id: session.id,
        commission_rate: commissionRate,
        platform_fee: platformFeeCents
      })
      .eq('id', escrow.id);

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('create-checkout-session error:', err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
