/**
 * PresenceLayer — multiplayer presence extension point for SKRTLIFE WORLD.
 *
 * Adapted from the reference repo's SocketManager + server/index.js
 * (socket.io with A* pathfinding, rooms, character broadcast, chat, dance).
 * Base44 has no persistent websocket server available in this app's plan, so
 * multiplayer is DESIGNED IN but NOT ACTIVATED for Phase One — the directive
 * explicitly makes a reliable single-player world foundation the first
 * objective and defers mass multiplayer.
 *
 * This stub defines the interface the world engine will call when a presence
 * backend (Colyseus / Base44 realtime / socket.io) is connected later:
 *
 *   join(worldId, profile)          — announce entry into a world zone
 *   leave()                         — announce exit
 *   sendTransform(pos, rot, state)   — broadcast local motion (~10hz)
 *   onRemote(handler)               — peer arrived/updated: { id, position, rotation, state, avatarUrl }
 *   onRemoteLeft(handler)           — peer left: { id }
 *
 * A future RemoteAvatarManager will spawn/despawn peer avatars from these
 * events. No code depends on a live socket today, so the single-player world
 * boots and runs exactly the same with or without a backend connected.
 */
export default class PresenceLayer {
  constructor() {
    this._remote = null;
    this._left = null;
    this.connected = false;
  }

  async join(/* worldId, profile */) { this.connected = true; }
  async leave() { this.connected = false; }
  sendTransform(/* pos, rot, state */) {}

  onRemote(handler) { this._remote = handler; }
  onRemoteLeft(handler) { this._left = handler; }
}