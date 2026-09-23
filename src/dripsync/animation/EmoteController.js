/**
 * EmoteController
 * ─────────────────────────────────────────────────────────────
 * Focused emote orchestration helper.
 * Validates emote requests, delegates to AnimationController,
 * and provides a clean extension point for categories/cooldowns.
 *
 * Phase 1: lightweight. No cooldown enforcement yet.
 * Future phases: add cooldowns, categories, queue logic here.
 */

class EmoteController {
  /**
   * @param {{
   *   animationController: import('./AnimationController').default,
   *   animationLibrary:    import('./AnimationLibrary').default,
   * }}
   */
  constructor({ animationController, animationLibrary }) {
    if (!animationController) throw new Error('EmoteController: animationController is required.');
    if (!animationLibrary)    throw new Error('EmoteController: animationLibrary is required.');

    this._animationController = animationController;
    this._library             = animationLibrary;
    this._destroyed           = false;
  }

  // ── Public API ────────────────────────────────────────────────

  /**
   * Request emote playback by id.
   * Validates availability before delegating.
   *
   * @param {string} emoteId
   * @returns {{ ok: boolean, reason?: string, emoteId?: string }}
   */
  play(emoteId) {
    if (this._destroyed) return { ok: false, reason: 'DESTROYED' };

    if (!emoteId || typeof emoteId !== 'string') {
      return { ok: false, reason: 'INVALID_EMOTE_ID', emoteId };
    }

    const clip = this._library.resolveEmote(emoteId);
    if (!clip) {
      return { ok: false, reason: 'EMOTE_NOT_REGISTERED', emoteId };
    }

    return this._animationController.playEmote(emoteId);
  }

  /**
   * Return all registered emote ids for UI display.
   * @returns {string[]}
   */
  getAvailableEmotes() {
    return this._library.getAvailableEmotes();
  }

  /**
   * Check if an emote id is available.
   * @param {string} emoteId
   * @returns {boolean}
   */
  isAvailable(emoteId) {
    return Boolean(this._library.resolveEmote(emoteId));
  }

  /**
   * Tear down references.
   */
  destroy() {
    this._destroyed           = true;
    this._animationController = null;
    this._library             = null;
  }
}

export default EmoteController;