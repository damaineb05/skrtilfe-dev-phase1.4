import { createClientFromRequest } from 'npm:@base44/sdk@0.8.48';
import { buildCanonicalFromAvatarUrl } from '../../shared/avatarConfigServer.js';

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
 * NOTE: This path writes the avatar BODY only. Equipped catalog wearables are
 * still ownership-enforced at equip time by saveAvatarProfile. A default-body
 * write does NOT grant or validate ownership — it carries whatever equipped
 * set the user already had. This is safe: equipping was already validated when
 * those items were equipped via saveAvatarProfile.
 */
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { avatarUrl, gender } = await req.json();
    if (!avatarUrl || typeof avatarUrl !== 'string') {
      return Response.json({ error: 'Avatar URL is required' }, { status: 400 });
    }

    // Build canonical v2 from the bare URL, preserving existing config state.
    const canonical = buildCanonicalFromAvatarUrl(avatarUrl, {
      existingConfig: user.avatar_config,
      gender,
    });
    if (!canonical) return Response.json({ error: 'Invalid avatar URL' }, { status: 400 });

    await base44.auth.updateMe({ avatar_config: canonical });

    return Response.json({ success: true, avatar_config: canonical });
  } catch (error) {
    console.error('saveDefaultAvatar error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});