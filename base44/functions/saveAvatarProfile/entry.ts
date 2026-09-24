import { contractHandler } from '../../shared/apiContract.js';
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.44';

/**
 * saveAvatarProfile — the AUTHORITATIVE server-side save for the canonical
 * DripSync avatar profile (User.avatar_config, schema_version 2).
 *
 * Trust model:
 *   - Identity is derived from base44.auth.me() — never from the request body.
 *   - The client sends the DESIRED appearance/equipment state.
 *   - The server decides whether that state is LEGAL:
 *       1. normalize incoming config (v2 or legacy v1) → canonical v2
 *       2. for each equipped catalog item, verify the Wearable exists AND
 *          the authenticated user owns it (AssetOwnership) OR it is an
 *          explicit default/free Wearable (is_default === true).
 *       3. reject unauthorized equipped ids with 403 (do not silently strip).
 *       4. persist the sanitized v2 config via auth.updateMe.
 *
 *   User.avatar_config  = how I look   (this function writes it)
 *   AssetOwnership       = what I own   (read-only here; granted by stripeWebhook)
 *   Wearable             = what the item is
 *
 * Upload-source equipped items (user-provided GLB URLs) are allowed without an
 * ownership record — they are the user's own uploaded files, not catalog
 * entitlements. URL-based DRM of catalog GLBs is not enforceable client-side;
 * the ownership LEDGER remains the source of truth for entitlements/progression.
 */

import { validateAvatarConfig } from '../../shared/avatarValidation.js';

// Canonical avatar sanitization (normalizeAvatarConfig + helpers) now lives
// in base44/shared/avatarConfigServer.js, shared with saveDefaultAvatar. The
// inline duplicate was removed in Phase E to centralize server-side avatar
// normalization and avoid three-way duplication.

Deno.serve(contractHandler(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json().catch(() => null);
    if (!body) return Response.json({ error: 'Invalid request body' }, { status: 400 });

    // ── 1. Normalize incoming config → canonical v2 ──────────────────────
    let desired;
    try { desired = validateAvatarConfig(body.avatar_config || body); } catch (error) { return Response.json({ error: error.message }, { status: 400 }); }
    if (!desired) return Response.json({ error: 'Invalid avatar config' }, { status: 400 });

    // ── 2. Collect catalog wearable_ids that need ownership verification ──
    const catalogIds = desired.equipped
      .filter(e => e.source === 'catalog' && e.wearable_id)
      .map(e => e.wearable_id);
    const catalogSet = new Set(catalogIds);

    if (catalogSet.size === 0) {
      // No catalog entitlements to verify — persist directly.
      desired.updated_at = new Date().toISOString();
      await base44.asServiceRole.entities.User.update(user.id, { avatar_config: desired });
      return Response.json({ success: true, avatar_config: desired });
    }

    // ── 3. Load the user's ownership ledger (AssetOwnership) ─────────────
    // RLS restricts reads to the authenticated user's own records (or admin).
    const ownerships = await base44.entities.AssetOwnership.filter({ user_id: user.id });
    const ownedIds = new Set((ownerships || []).map(o => o.wearable_id).filter(Boolean));

    // ── 4. Validate each catalog equipped id against ownership / default ─
    // Fetch each requested Wearable (small N — equipped set is tiny). Wearable
    // read is public (rls.read: {}).
    const unauthorized = [];
    const wearableCache = {};
    await Promise.all([...catalogSet].map(async (wid) => {
      try {
        const w = await base44.entities.Wearable.get(wid);
        if (w) wearableCache[wid] = w;
      } catch (_) { /* missing — treated as unauthorized below */ }
    }));

    for (const wid of catalogSet) {
      const w = wearableCache[wid];
      const isOwned = ownedIds.has(wid);
      const isDefault = !!(w && w.is_default === true);
      // A wearable the server cannot resolve is unauthorized (invalid catalog ref).
      if (!w || (!isOwned && !isDefault)) unauthorized.push(wid);
    }

    if (unauthorized.length > 0) {
      return Response.json({
        error: 'Equipped wearables not owned by this account',
        unauthorized_wearable_ids: unauthorized,
      }, { status: 403 });
    }

    // ── 5. Persist the sanitized canonical v2 config ────────────────────
    desired.updated_at = new Date().toISOString();
    await base44.asServiceRole.entities.User.update(user.id, { avatar_config: desired });
    return Response.json({ success: true, avatar_config: desired });
  } catch (error) {
    // Preserve provider auth status for the shared, redacted error contract.
    throw error;
  }
}));
