/**
 * SaveManager — debounced persistence of the player's world position.
 * Autosaves every N seconds and exposes saveNow() for event-driven writes
 * (mission complete, entering/leaving the world). Avoids per-frame writes.
 */
export default class SaveManager {
  constructor({ adapter, player, interval = 12 }) {
    this.adapter = adapter;
    this.player = player;
    this.interval = interval;
    this._t = 0;
    this._saving = false;
  }

  update(dt) {
    this._t += dt;
    if (this._t >= this.interval) {
      this._t = 0;
      this._flush();
    }
  }

  async saveNow() { await this._flush(); }

  async _flush() {
    if (!this.player) return;
    if (this._saving) return;
    this._saving = true;
    try {
      await this.adapter.savePosition(this.player.position, this.player.rotation);
    } catch (e) {
      console.warn('[SaveManager] flush failed', e);
    } finally {
      this._saving = false;
    }
  }
}