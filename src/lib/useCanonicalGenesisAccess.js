/**
 * useCanonicalGenesisAccess — Unified Genesis permission utility.
 *
 * CANONICAL LOGIC:
 * hasGenesisAccess = user?.genesis_holder === true || user?.role === "admin"
 *
 * This is the single source of truth for all Genesis access checks across the app.
 * Admin users always inherit Genesis-level access.
 * Genesis holders receive advanced access.
 *
 * Usage:
 *   const { hasGenesisAccess } = useCanonicalGenesisAccess(user);
 *   if (hasGenesisAccess) // show Genesis feature
 */

/**
 * Pure function — use this in non-React contexts or from backend.
 * Returns boolean: true if user has Genesis access.
 */
export function hasGenesisAccess(user) {
  if (!user) return false;
  return user?.genesis_holder === true || user?.role === 'admin';
}

/**
 * React hook — use this in components.
 * Returns { hasGenesisAccess: boolean }
 */
export function useCanonicalGenesisAccess(user) {
  return {
    hasGenesisAccess: hasGenesisAccess(user),
  };
}