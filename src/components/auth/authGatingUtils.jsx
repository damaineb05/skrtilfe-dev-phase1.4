import { base44 } from '@/api/base44Client';

/**
 * Helper to check if user is authenticated
 */
export async function isUserAuthenticated() {
  try {
    const user = await base44.auth.me();
    return !!user;
  } catch (err) {
    return false;
  }
}

/**
 * requireAuth(actionFn, gateReason)
 * 
 * Checks authentication and either:
 * - Executes actionFn() if user is authenticated
 * - Opens AuthGateModal if not authenticated (will retry actionFn after login)
 * 
 * Usage:
 * const { requireAuth } = useAuthGate();
 * 
 * <button onClick={() => requireAuth(
 *   () => navigate('/Community'),
 *   'Sign in to join the community.'
 * )}>
 *   Join Community
 * </button>
 */
export async function requireAuth(actionFn, gateReason, openGateFn) {
  try {
    const user = await base44.auth.me();
    
    if (user) {
      // User is authenticated, execute the action
      actionFn();
    } else {
      // User is not authenticated, open the gate modal
      openGateFn(gateReason, actionFn);
    }
  } catch (err) {
    // Not authenticated, open gate
    openGateFn(gateReason, actionFn);
  }
}