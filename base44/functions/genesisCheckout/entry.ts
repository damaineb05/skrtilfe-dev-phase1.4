import { contractHandler } from '../../shared/apiContract.js';
import { requireServerConfiguration, configurationErrorResponse } from '../../shared/serverConfiguration.js';
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import Stripe from 'npm:stripe@14';

Deno.serve(contractHandler(async (req) => {
  console.log('=== Genesis Checkout Started ===');
  try {
    const base44 = createClientFromRequest(req);

    // ── Require an authenticated session ───────────────────────────────
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await req.json();
    const { successUrl, cancelUrl, plan } = body;

    // Identity is derived exclusively from the authenticated session.
    // Client-supplied email / userId are ignored.
    const email = user.email;
    const userId = user.id;
    if (!email) {
      return Response.json({ error: 'Authenticated account has no email on file' }, { status: 400 });
    }

    const isMonthly = plan === 'monthly';

    const lineItem = isMonthly ? {
      price_data: {
        currency: 'usd',
        product_data: {
          name: 'SKRTLIFE Genesis Pass (Monthly)',
          description: 'Monthly membership to SKRTLIFE Digital Society. Full DripSync access, exclusive drops, virtual realms, and Physical × Digital bundles.',
          images: ['https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68bc2773ba0ba8d2da222a27/f35117ac3_about-us.png'],
          metadata: { product_type: 'genesis_pass' }
        },
        unit_amount: 2492, // $24.92/mo ($299/12 rounded)
        recurring: { interval: 'month' },
      },
      quantity: 1
    } : {
      price_data: {
        currency: 'usd',
        product_data: {
          name: 'SKRTLIFE Genesis Pass',
          description: 'Lifetime membership to SKRTLIFE Digital Society. Full DripSync access, exclusive drops, virtual realms, and Physical × Digital bundles.',
          images: ['https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/68bc2773ba0ba8d2da222a27/f35117ac3_about-us.png'],
          metadata: { product_type: 'genesis_pass' }
        },
        unit_amount: 29900, // $299.00
      },
      quantity: 1
    };

    const stripeClient = new Stripe(requireServerConfiguration(name => Deno.env.get(name), 'STRIPE_SECRET_KEY'));
    const session = await stripeClient.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [lineItem],
      mode: isMonthly ? 'subscription' : 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: email,
      metadata: {
        base44_app_id: Deno.env.get('BASE44_APP_ID'),
        product_type: 'genesis_pass',
        user_email: email,
        user_id: userId,
      }
    });

    console.log('Genesis checkout session created:', session.id);
    return Response.json({ url: session.url });
  } catch (error) {
    const configurationFailure = configurationErrorResponse(error);
    if (configurationFailure) return configurationFailure;
    console.error('Genesis checkout error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}));