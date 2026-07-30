// Crée une session Stripe Checkout en mode "subscription" pour l'abonnement
// Premium d'un freelance (badge Vérifié + boost annuaire).
//
// Deploy: supabase functions deploy create-subscription-checkout
// Secrets requis: STRIPE_SECRET_KEY, STRIPE_PREMIUM_PRICE_ID, SITE_URL
// (STRIPE_PREMIUM_PRICE_ID = l'ID du prix récurrent créé dans le dashboard Stripe,
//  ex: price_123..., 49€/mois.)

import Stripe from 'npm:stripe@17';
import { createClient } from 'jsr:@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '');

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const priceId = Deno.env.get('STRIPE_PREMIUM_PRICE_ID');
    if (!priceId) {
      return new Response(JSON.stringify({ error: 'Premium price not configured' }), {
        status: 503,
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

    // Service role pour lire/écrire les champs premium (protégés côté RLS/trigger).
    const serviceClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: profile } = await serviceClient
      .from('profiles')
      .select('role, is_premium, stripe_customer_id')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'freelancer') {
      return new Response(JSON.stringify({ error: 'Seuls les freelances peuvent souscrire au Premium.' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    if (profile.is_premium) {
      return new Response(JSON.stringify({ error: 'Vous êtes déjà abonné Premium.' }), {
        status: 409,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Réutilise le client Stripe existant, sinon en crée un et le mémorise.
    let customerId = profile.stripe_customer_id;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        metadata: { supabase_user_id: user.id },
      });
      customerId = customer.id;
      await serviceClient
        .from('profiles')
        .update({ stripe_customer_id: customerId })
        .eq('id', user.id);
    }

    const siteUrl = Deno.env.get('SITE_URL') ?? 'http://localhost:5173';

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      // metadata dupliquée sur la subscription pour la retrouver dans les
      // événements customer.subscription.* du webhook.
      metadata: { type: 'premium_subscription', supabase_user_id: user.id },
      subscription_data: {
        metadata: { type: 'premium_subscription', supabase_user_id: user.id },
      },
      success_url: `${siteUrl}/dashboard?premium=success`,
      cancel_url: `${siteUrl}/premium?checkout=cancelled`,
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('create-subscription-checkout error:', err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
