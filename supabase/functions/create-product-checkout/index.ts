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
            unit_amount: product.price * 100,
          },
          quantity: 1,
        },
      ],
      metadata: {
        product_id: product.id,
        client_id: user.id,
        freelancer_id: product.freelancer_id,
        type: 'digital_product',
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
