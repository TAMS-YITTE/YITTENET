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
      .select('stripe_account_id, role, full_name')
      .eq('id', user.id)
      .single();

    if (!profile || profile.role !== 'freelancer') {
      return new Response(JSON.stringify({ error: 'Only freelancers can configure payouts' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    let accountId = profile.stripe_account_id;

    if (!accountId) {
      // Create new Connect account
      const account = await stripe.accounts.create({
        type: 'express',
        country: 'FR',
        business_type: 'individual',
        capabilities: { transfers: { requested: true } },
      });
      accountId = account.id;

      await serviceClient
        .from('profiles')
        .update({ stripe_account_id: accountId })
        .eq('id', user.id);
    }

    const siteUrl = Deno.env.get('SITE_URL') ?? 'http://localhost:5173';

    // Generate onboarding link
    const accountLink = await stripe.accountLinks.create({
      account: accountId,
      refresh_url: `${siteUrl}/dashboard`,
      return_url: `${siteUrl}/dashboard?stripe_onboarding=success`,
      type: 'account_onboarding',
    });

    return new Response(JSON.stringify({ url: accountLink.url }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('create-connect-account error:', err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
