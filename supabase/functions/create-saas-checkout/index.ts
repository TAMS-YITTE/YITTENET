// Crée une session Stripe Checkout pour l'achat d'un des produits SaaS de
// l'écosystème Yitte listés sur /solutions.
//
// Distincte de create-subscription-checkout, qui ne gère que l'abonnement
// Premium d'un freelance de la marketplace (price_id unique côté serveur,
// écriture dans profiles). Ici le price_id vient du client et le produit vit
// sur son propre sous-domaine : aucune donnée YITTE n'est modifiée.
//
// Deploy: supabase functions deploy create-saas-checkout
// Secrets requis: STRIPE_SECRET_KEY, SITE_URL

import Stripe from 'npm:stripe@17';
import { corsHeaders } from '../_shared/cors.ts';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '');

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { priceId, productId, productName, mode, successUrl, cancelUrl } = await req.json();

    // Le price_id vient du client (variable VITE_STRIPE_PRICE_*) : on refuse
    // tout ce qui ne ressemble pas à un identifiant de prix Stripe plutôt que
    // de laisser l'API Stripe renvoyer une erreur opaque.
    if (typeof priceId !== 'string' || !priceId.startsWith('price_')) {
      return json({ error: 'priceId invalide ou manquant.' }, 400);
    }

    // 'payment' pour les produits one-shot (ex: finproject), 'subscription' sinon.
    const checkoutMode = mode === 'payment' ? 'payment' : 'subscription';

    const siteUrl = Deno.env.get('SITE_URL') ?? 'http://localhost:5173';

    const metadata: Record<string, string> = {
      type: 'saas_product',
      product_id: typeof productId === 'string' ? productId : '',
      product_name: typeof productName === 'string' ? productName : '',
    };

    const session = await stripe.checkout.sessions.create({
      mode: checkoutMode,
      line_items: [{ price: priceId, quantity: 1 }],
      metadata,
      // Dupliquée sur la subscription pour retrouver le produit dans les
      // événements customer.subscription.* du webhook.
      ...(checkoutMode === 'subscription' ? { subscription_data: { metadata } } : {}),
      success_url: typeof successUrl === 'string' && successUrl
        ? successUrl
        : `${siteUrl}/solutions?checkout=success`,
      cancel_url: typeof cancelUrl === 'string' && cancelUrl
        ? cancelUrl
        : `${siteUrl}/solutions?checkout=cancelled`,
    });

    return json({ url: session.url });
  } catch (err) {
    console.error('create-saas-checkout error:', err);
    return json({ error: err.message }, 500);
  }
});
