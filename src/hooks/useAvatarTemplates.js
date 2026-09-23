import { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';

/**
 * useAvatarTemplates — the public community avatar-template catalog.
 *
 * Fetches DripSyncAsset records the owner has published (is_public_template=true,
 * type='avatar'). These are READ-ONLY by everyone except the owner/admin: the
 * DefaultAvatarPicker loads one into the editor as a COPY-ON-SELECT instance, so
 * the selecting user customizes + saves their own avatar_config — the original
 * template is never mutated by anyone but its owner.
 *
 * Privacy: only avatar data (avatarUrl, gender, customization, wearables,
 * thumbnail, template_name) is surfaced in the catalog UI. The owner's account
 * identity (user_id / created_by_id) is never displayed.
 */
export function useAvatarTemplates(enabled = true) {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchTemplates = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    setError(null);
    try {
      const result = await base44.entities.DripSyncAsset.filter(
        { is_public_template: true, type: 'avatar' },
        '-updated_date',
        50
      );
      setTemplates(Array.isArray(result) ? result : []);
    } catch (e) {
      console.warn('[useAvatarTemplates] fetch failed', e);
      setError(e);
      setTemplates([]);
    } finally {
      setLoading(false);
    }
  }, [enabled]);

  useEffect(() => {
    if (enabled) fetchTemplates();
  }, [enabled, fetchTemplates]);

  return { templates, loading, error, retry: fetchTemplates };
}