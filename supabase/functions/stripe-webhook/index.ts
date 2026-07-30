// Confirms escrow deposits when Stripe reports a completed checkout, and keeps
// the freelancer Premium subscription state in sync.
// Deploy: supabase functions deploy stripe-webhook --no-verify-jwt
// (Stripe calls this directly and doesn't send a Supabase auth JWT, so JWT
// verification must stay disabled for this function specifically.)
// Secrets required: STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET
// Register the endpoint in the Stripe dashboard for these events, pointing at
// https://<project-ref>.supabase.co/functions/v1/stripe-webhook :
//   - checkout.session.completed        (escrow deposits, product sales)
//   - customer.subscription.created
//   - customer.subscription.updated
//   - customer.subscription.deleted     (Premium subscription lifecycle)

import Stripe from 'npm:stripe@17';
import { createClient } from 'jsr:@supabase/supabase-js@2';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '');
const cryptoProvider = Stripe.createSubtleCryptoProvider();
const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') ?? '';

Deno.serve(async (req) => {
  const signature = req.headers.get('Stripe-Signature');
  const body = await req.text();

  let event;
  try {
    event = await stripe.webhooks.constructEventAsync(body, signature ?? '', webhookSecret, undefined, cryptoProvider);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  const serviceClient = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  );

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const escrowTransactionId = session.metadata?.escrow_transaction_id;
    const isDigitalProduct = session.metadata?.type === 'digital_product';

    if (isDigitalProduct) {
      const { error: purchaseError } = await serviceClient
        .from('purchases')
        .insert({
          client_id: session.metadata.client_id,
          product_id: session.metadata.product_id,
          stripe_payment_id: session.payment_intent,
          status: 'completed'
        });
      if (purchaseError) {
         console.error('Error inserting purchase:', purchaseError);
      }
    } else if (escrowTransactionId) {
      // The `.eq('status', 'pending')` guard makes this idempotent — a
      // retried webhook delivery won't re-trigger the job status update.
      const { data: escrow } = await serviceClient
        .from('escrow_transactions')
        .update({
          status: 'deposited',
          stripe_payment_id: session.payment_intent,
        })
        .eq('id', escrowTransactionId)
        .eq('status', 'pending')
        .select()
        .single();

      if (escrow) {
        await serviceClient
          .from('jobs')
          .update({ status: 'in_progress' })
          .eq('id', escrow.job_id);
      }
    }
  } else if (
    event.type === 'customer.subscription.created' ||
    event.type === 'customer.subscription.updated' ||
    event.type === 'customer.subscription.deleted'
  ) {
    const subscription = event.data.object;

    // On ne traite que l'abonnement Premium (ignore d'éventuels autres produits).
    if (subscription.metadata?.type === 'premium_subscription') {
      // Retrouve le profil via l'id utilisateur en metadata, sinon via le customer.
      const userId = subscription.metadata?.supabase_user_id;
      const active = subscription.status === 'active' || subscription.status === 'trialing';

      const periodEnd = subscription.current_period_end
        ? new Date(subscription.current_period_end * 1000).toISOString()
        : null;

      const updates = {
        is_premium: active,
        premium_status: subscription.status,
        stripe_subscription_id: subscription.id,
        premium_current_period_end: periodEnd,
      };

      let query = serviceClient.from('profiles').update(updates);
      query = userId
        ? query.eq('id', userId)
        : query.eq('stripe_customer_id', subscription.customer);

      const { error: subError } = await query;
      if (subError) {
        console.error('Error updating premium status:', subError);
      }
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    headers: { 'Content-Type': 'application/json' },
  });
});
