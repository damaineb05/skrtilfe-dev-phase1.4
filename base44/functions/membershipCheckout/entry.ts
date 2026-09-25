import { contractHandler } from '../../shared/apiContract.js';
import { configurationErrorResponse } from '../../shared/serverConfiguration.js';
import { createSafeCheckoutSession } from '../../shared/checkoutSafety.js';
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.48';
import Stripe from 'npm:stripe@14';

// ── Authoritative DripSync+ price (server-side) ───────────────────────────
// This MUST match the client display config in src/lib/membershipPlans.js
// (DRIPSYNC_PLUS.price). To make pricing fully configurable via Stripe, create
// a DripSync+ product/price in the Stripe dashboard and replace price_data
// below with that price id (passing { price: <price_id> } in line_items).
const DRIPSYNC_PLUS_AMOUNT_CENTS = 299; // $2.99
const DRIPSYNC_PLUS_INTERVAL = 'month';

/**
 * membershipCheckout — DripSync+ digital-membership checkout.
 *
 * Mirrors genesisCheckout's trusted pattern: identity is derived exclusively
 * from auth.me() (client email/userId ignored), the Stripe session carries
 * metadata.product_type = 'dripsync_plus', and the EXISTING stripeWebhook is
 * the sole authority that sets user.dripsync_plus_holder on verified payment.
 * No client path grants membership.
 */
Deno.serve(contractHandler(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Authentication required' }, { status: 401 });
    }

    const body = await req.json();
    const { successUrl, cancelUrl } = body;

    const email = user.email;
    const userId = user.id;
    if (!email) {
      return Response.json({ error: 'Authenticated account has no email on file' }, { status: 400 });
    }

    const lineItem = {
      price_data: {
        currency: 'usd',
        product_data: {
          name: 'SKRTLIFE DripSync+ (Monthly)',
          description: 'DripSync+ membership — expand your digital identity across the SKRTLIFE Digital Society.',
          metadata: { product_type: 'dripsync_plus' },
        },
        unit_amount: DRIPSYNC_PLUS_AMOUNT_CENTS,
        recurring: { interval: DRIPSYNC_PLUS_INTERVAL },
      },
      quantity: 1,
    };

    const session = await createSafeCheckoutSession(Stripe, name => Deno.env.get(name), {
      payment_method_types: ['card'],
      line_items: [lineItem],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: email,
      metadata: {
        base44_app_id: Deno.env.get('BASE44_APP_ID'),
        product_type: 'dripsync_plus',
        user_email: email,
        user_id: userId,
      },
    });

    return Response.json({ url: session.url });
  } catch (error) {
    const configurationFailure = configurationErrorResponse(error);
    if (configurationFailure) return configurationFailure;
    console.error('membershipCheckout error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}));