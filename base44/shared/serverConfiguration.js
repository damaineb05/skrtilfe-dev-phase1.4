/** Server-only configuration checks. Values are never included in errors. */
export function requireServerConfiguration(readEnvironment, name) {
  const value = readEnvironment(name);
  if (typeof value !== 'string' || !value.trim()) {
    const error = new Error(`Server configuration missing: ${name}`);
    error.code = 'SERVER_CONFIGURATION_MISSING';
    throw error;
  }
  return value;
}

/** Preserve other errors; classify only missing config or Stripe authentication. */
export function configurationErrorResponse(error) {
  if (error?.code === 'SERVER_CONFIGURATION_MISSING') {
    return Response.json({ error: error.message, code: error.code }, { status: 503 });
  }
  if (error?.type === 'StripeAuthenticationError' ||
      ['api_key_expired', 'invalid_api_key'].includes(error?.code)) {
    return Response.json({
      error: 'Payment provider authentication failed. Verify STRIPE_SECRET_KEY in the server environment.',
      code: 'PAYMENT_PROVIDER_AUTH_FAILED',
    }, { status: 503 });
  }
  return null;
}
