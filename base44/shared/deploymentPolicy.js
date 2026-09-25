// Trusted server configuration, separate from browser origins and request payloads.
// Add a separately reviewed deployment entry for a future production runtime.
// Unknown deployments fail closed; this development app can never fall back to live.
export const SERVER_DEPLOYMENTS = Object.freeze({
  '6ab3d55363a10359643b4447': Object.freeze({
    environment: 'development',
    stripeMode: 'test',
    applicationOrigin: 'https://skrtlifedevphase14-643b4447.base44.app',
  }),
});

export function deploymentError(message) {
  return Object.assign(new Error(message), { code: 'DEPLOYMENT_CONFIGURATION_INVALID', status: 503 });
}

export function resolveDeployment(deploymentId, deployments = SERVER_DEPLOYMENTS) {
  const config = Object.hasOwn(deployments, deploymentId || '') ? deployments[deploymentId] : null;
  if (!config) throw deploymentError('No trusted application deployment is configured');
  if (!((config.environment === 'development' && config.stripeMode === 'test') ||
        (config.environment === 'production' && config.stripeMode === 'live'))) {
    throw deploymentError('Application environment and payment mode do not match');
  }
  const url = new URL(config.applicationOrigin);
  if (url.protocol !== 'https:' || url.username || url.password || url.origin !== config.applicationOrigin) {
    throw deploymentError('Application origin must be an exact HTTPS origin');
  }
  return config;
}

export function validateCheckoutRedirect(value, config) {
  const reject = () => Object.assign(new Error('Checkout redirects must use the configured application origin'), {
    status: 400, code: 'CHECKOUT_REDIRECT_INVALID',
  });
  if (typeof value !== 'string' || value.length > 4096 || /[\s\\]/.test(value)) throw reject();
  let url;
  try { url = new URL(value); } catch { throw reject(); }
  if (url.protocol !== 'https:' || url.username || url.password || url.origin !== config.applicationOrigin) throw reject();
  return url.href;
}