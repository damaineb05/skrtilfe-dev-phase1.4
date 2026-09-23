/**
 * DEPRECATED — Use hasGenesisAccess() from lib/useCanonicalGenesisAccess instead.
 *
 * This hook is kept only for DB lookups (GenesisPass entity / pass details).
 * For permission checks, use the canonical utility.
 *
 * useGenesisPass — Central hook for Genesis Pass ownership checks.
 *
 * Source of truth: GenesisPass entity (DB).
 * Supplemental: user.role === 'admin' or user.genesis_holder flag.
 * Wallet-based NFT check is optional/additive.
 *
 * Usage:
 *   const { hasGenesis, pass, isLoading } = useGenesisPass(user);
 */
import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

export function useGenesisPass(user) {
  const [pass, setPass] = useState(null);
  const [hasGenesis, setHasGenesis] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setHasGenesis(false);
      setPass(null);
      setIsLoading(false);
      return;
    }

    // Admins always have access
    if (user.role === 'admin') {
      setHasGenesis(true);
      setPass({ tier: 'genesis_888', is_active: true, _adminGrant: true });
      setIsLoading(false);
      return;
    }

    // Check DB for active pass
    base44.entities.GenesisPass.filter({ user_id: user.id, is_active: true })
      .then(passes => {
        const active = passes?.[0] || null;
        setPass(active);
        // Also allow the legacy genesis_holder flag
        setHasGenesis(!!active || user.genesis_holder === true);
      })
      .catch(() => {
        // Fall back to flag-only check
        setHasGenesis(user.genesis_holder === true);
        setPass(null);
      })
      .finally(() => setIsLoading(false));
  }, [user?.id, user?.role, user?.genesis_holder]);

  return { hasGenesis, pass, isLoading };
}

/**
 * Standalone async check — for use outside React components.
 * Returns { hasGenesis, pass }
 */
export async function checkGenesisPass(userId, userRole, genesisHolderFlag) {
  if (userRole === 'admin') return { hasGenesis: true, pass: { _adminGrant: true } };
  try {
    const passes = await base44.entities.GenesisPass.filter({ user_id: userId, is_active: true });
    const pass = passes?.[0] || null;
    return { hasGenesis: !!pass || genesisHolderFlag === true, pass };
  } catch {
    return { hasGenesis: genesisHolderFlag === true, pass: null };
  }
}