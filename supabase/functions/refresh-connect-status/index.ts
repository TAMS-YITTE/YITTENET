import Stripe from 'npm:stripe@17';
import { createClient } from 'jsr:@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '');

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const authClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } } }
    );

    const { data: { user } } = await authClient.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const serviceClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const { data: profile } = await serviceClient
      .from('profiles')
      .select('stripe_account_id, role')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'freelancer' || !profile.stripe_account_id) {
      return new Response(JSON.stringify({ error: 'No stripe account configured' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const account = await stripe.accounts.retrieve(profile.stripe_account_id);

    const chargesEnabled = account.charges_enabled;
    const payoutsEnabled = account.payouts_enabled;

    await serviceClient
      .from('profiles')
      .update({
        stripe_charges_enabled: chargesEnabled,
        stripe_payouts_enabled: payoutsEnabled
      })
      .eq('id', user.id);

    return new Response(JSON.stringify({ charges_enabled: chargesEnabled, payouts_enabled: payoutsEnabled }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('refresh-connect-status error:', err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
