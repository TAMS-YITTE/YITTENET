import Stripe from 'npm:stripe@17';
import { createClient } from 'jsr:@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '');

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization') ?? '' } } }
    )

    const { data: { user } } = await supabaseClient.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    const { productId } = await req.json()

    const { data: product, error: productError } = await supabaseClient
      .from('digital_products')
      .select('*')
      .eq('id', productId)
      .single()

    if (productError || !product) throw new Error('Product not found')

    const serviceClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { data: sellerProfile } = await serviceClient
      .from('profiles')
      .select('stripe_account_id, stripe_payouts_enabled, is_premium')
      .eq('id', product.freelancer_id)
      .single()

    if (!sellerProfile?.stripe_account_id || !sellerProfile?.stripe_payouts_enabled) {
      throw new Error('Le vendeur n\'a pas configuré ses paiements Stripe.')
    }

    const commissionRate = sellerProfile.is_premium ? 0.05 : 0.10;
    const amountInCents = product.price * 100;
    const platformFeeCents = Math.round(amountInCents * commissionRate);

    const siteUrl = Deno.env.get('SITE_URL') || 'http://localhost:5173'

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'eur',
            product_data: {
              name: product.title,
              description: `Achat sur YITTE Boutique`,
            },
            unit_amount: amountInCents,
          },
          quantity: 1,
        },
      ],
      payment_intent_data: {
        application_fee_amount: platformFeeCents,
        transfer_data: {
          destination: sellerProfile.stripe_account_id,
        },
      },
      metadata: {
        product_id: product.id,
        client_id: user.id,
        freelancer_id: product.freelancer_id,
        type: 'digital_product',
        platform_fee: platformFeeCents.toString(),
      },
      success_url: `${siteUrl}/product/${product.id}?success=true`,
      cancel_url: `${siteUrl}/product/${product.id}?canceled=true`,
    })

    return new Response(
      JSON.stringify({ sessionId: session.id, url: session.url }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})
