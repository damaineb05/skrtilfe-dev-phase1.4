/**
 * InteractionManager — each frame finds the nearest interactable zone near
 * the player and notifies the shell when it changes. The shell resolves the
 * 'interact' action against this.current (store / npc / vehicle).
 */
export default class InteractionManager {
  constructor({ world, player }) {
    this.world = world;
    this.player = player;
    this.current = null;
    this.onChange = null;
  }

  update() {
    const n = this.world.nearestInteractable(this.player.position, 3.2);
    const id = n ? n.id : null;
    if (id !== (this.current ? this.current.id : null)) {
      this.current = n;
      if (this.onChange) this.onChange(this.current);
    }
  }
}