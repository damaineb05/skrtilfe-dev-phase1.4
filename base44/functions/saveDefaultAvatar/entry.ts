import { assertAssetUrl } from '../../shared/apiContract.js';
import { contractHandler } from '../../shared/apiContract.js';
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.48';
import { buildCanonicalFromAvatarUrl } from '../../shared/avatarConfigServer.js';
import { assertExpectedRevision } from '../../shared/avatarRevision.js';

/**
 * saveDefaultAvatar — sets the user's default avatar BODY as canonical v2.
 *
 * Phase E cleanup: this previously wrote a LEGACY v1 shape
 *   { schemaVersion: 1, avatarUrl, avatarId, lastSaved }
 * which broke the canonical-avatar contract. It now reuses the shared backend
 * sanitizer (base44/shared/avatarConfigServer.js) to write a v2 config that:
 *   - sets avatar.model_url / source / id from the supplied URL
 *   - PRESERVES existing equipped wearables, customization, animations,
 *     environment and realm (so choosing a default body never wipes a user's
 *     outfit)
 *   - is owned by auth.me() (identity never trusted from the body)
 *
 * Compatibility adapter: forwards to saveAvatarProfile with the caller's expectedRevision.
 * Existing equipment is preserved and revalidated by that canonical write path;
 * this function never updates User.avatar_config directly.
 */
Deno.serve(contractHandler(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { avatarUrl, gender, expectedRevision } = await req.json();
    assertExpectedRevision(expectedRevision, user.avatar_config);
    if (!avatarUrl || typeof avatarUrl !== 'string') {
      return Response.json({ error: 'Avatar URL is required' }, { status: 400 });
    }

    try { assertAssetUrl(avatarUrl); } catch (error) { return Response.json({ error: error.message }, { status: 400 }); }
    if (gender && !['feminine','masculine','neutral'].includes(gender)) return Response.json({error:'Invalid gender'}, {status:400});
    // Build canonical v2 from the bare URL, preserving existing config state.
    const canonical = buildCanonicalFromAvatarUrl(avatarUrl, {
      existingConfig: user.avatar_config,
      gender,
    });
    if (!canonical) return Response.json({ error: 'Invalid avatar URL' }, { status: 400 });

    // Compatibility adapter only: canonical writer owns validation and revision advancement.
    const result = await base44.functions.invoke('saveAvatarProfile', {
      avatar_config: canonical, expectedRevision,
    });
    return Response.json(result.data);
  } catch (error) {
    // Preserve provider auth status for the shared, redacted error contract.
    throw error;
  }
}));