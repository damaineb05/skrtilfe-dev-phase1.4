import { requireServerConfiguration } from './serverConfiguration.js';
import { resolveDeployment, validateCheckoutRedirect } from './deploymentPolicy.js';

export function assertStripeKeyMode(key, config) {
  const requiredPrefix = config.stripeMode === 'test' ? /^(sk|rk)_test_/ : /^(sk|rk)_live_/;
  if (!requiredPrefix.test(key)) {
    throw Object.assign(new Error('Stripe credentials do not match the configured payment mode'), {
      code: 'PAYMENT_MODE_MISMATCH', status: 503,
    });
  }
}

// The Stripe constructor is injected so this policy is testable without network calls.
export async function createSafeCheckoutSession(Stripe, readEnvironment, parameters, options = {}) {
  const config = resolveDeployment(readEnvironment('BASE44_APP_ID'));
  const successUrl = validateCheckoutRedirect(parameters.success_url, config);
  const cancelUrl = validateCheckoutRedirect(parameters.cancel_url, config);
  const key = requireServerConfiguration(readEnvironment, 'STRIPE_SECRET_KEY');
  assertStripeKeyMode(key, config); // Reject live credentials BEFORE constructing a development session.
  const stripe = new Stripe(key, options);
  const session = await stripe.checkout.sessions.create({
    ...parameters, success_url: successUrl, cancel_url: cancelUrl,
    metadata: { ...parameters.metadata, deployment_environment: config.environment, payment_mode: config.stripeMode },
  });
  const expectedLiveMode = config.stripeMode === 'live';
  if (session.livemode !== expectedLiveMode) {
    // Never return an unexpected session URL; invalidate an open session as defense in depth.
    if (session.id && session.status === 'open') {
      await stripe.checkout.sessions.expire(session.id);
    }
    throw Object.assign(new Error('Stripe returned a session in an unexpected payment mode'), {
      code: 'PAYMENT_MODE_MISMATCH', status: 503,
    });
  }
  return session;
}