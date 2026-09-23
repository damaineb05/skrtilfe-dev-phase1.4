import { base44 } from '@/api/base44Client';

/**
 * GameStateAdapter — the ONLY adapter layer between the Three.js game client
 * and the SKRTLIFE backend. Game code never touches base44 directly; it calls
 * this adapter. Reuses existing VirtualCurrency (wallet = SKRT) and creates
 * the minimal game-scoped records (PlayerProfile / WorldState /
 * MissionProgress). Authenticated SKRTLIFE user id is the master key.
 */
export default class GameStateAdapter {
  constructor(user) {
    this.user = user;
    this.uid = user.id;
    this.email = user.email;
  }

  static DEFAULT_SPAWN = { x: 0, y: 0, z: 0 };
  static DEFAULT_ROTATION = 0; // face south (-Z) toward the plaza monument
  static WORLD_ID = 'block_001';

  async getInitialState() {
    const [profile, wallet] = await Promise.all([
      this._getOrCreateProfile(),
      this._getOrCreateWallet(),
    ]);
    const mission = await this.getActiveMission();
    const missionProgress = await this.getMissionProgress(mission.mission_id);
    return { profile, wallet, mission, missionProgress };
  }

  async _getOrCreateProfile() {
    const list = await base44.entities.PlayerProfile.filter({ user_id: this.uid }, '-created_date', 1);
    if (list.length) return list[0];
    const handle = (this.user.full_name || 'resident').toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 18) || 'resident';
    return base44.entities.PlayerProfile.create({
      user_id: this.uid,
      username: handle,
      display_name: this.user.full_name || 'Resident',
      level: 1,
      xp: 0,
      reputation: 0,
      current_world: GameStateAdapter.WORLD_ID,
      spawn_point: GameStateAdapter.DEFAULT_SPAWN,
      last_position: GameStateAdapter.DEFAULT_SPAWN,
      last_rotation: GameStateAdapter.DEFAULT_ROTATION,
    });
  }

  async _getOrCreateWallet() {
    const list = await base44.entities.VirtualCurrency.filter({ user_email: this.email }, '-created_date', 1);
    if (list.length) return list[0];
    return base44.entities.VirtualCurrency.create({
      user_email: this.email,
      balance: 100,
      lifetime_earned: 0,
      lifetime_spent: 0,
    });
  }

  async _getOrCreateWorldState() {
    const list = await base44.entities.WorldState.filter({ user_id: this.uid, world_id: GameStateAdapter.WORLD_ID }, '-created_date', 1);
    if (list.length) return list[0];
    return base44.entities.WorldState.create({
      user_id: this.uid,
      world_id: GameStateAdapter.WORLD_ID,
      position: GameStateAdapter.DEFAULT_SPAWN,
      rotation: 0,
      unlocked_locations: [],
      discovered_locations: [],
      owned_properties: [],
      last_saved_at: new Date().toISOString(),
    });
  }

  async getActiveMission() {
    const list = await base44.entities.Mission.filter({ mission_id: 'go_to_store' }, '-created_date', 1);
    if (list.length) return list[0];
    // fallback definition if the catalog seed is absent
    return {
      mission_id: 'go_to_store',
      title: 'Go to the SKRTLIFE Store',
      description: 'Walk from your apartment to the SKRTLIFE store and claim the first drop.',
      reward_skrt: 500,
      reward_xp: 100,
    };
  }

  async getMissionProgress(missionId) {
    const list = await base44.entities.MissionProgress.filter({ user_id: this.uid, mission_id: missionId }, '-created_date', 1);
    return list[0] || null;
  }

  async completeMission(missionId, mission) {
    const existing = await this.getMissionProgress(missionId);
    if (existing && existing.status === 'completed') {
      return { alreadyCompleted: true };
    }
    const reward = (mission && mission.reward_skrt) || 500;
    const xp = (mission && mission.reward_xp) || 100;

    if (existing) {
      await base44.entities.MissionProgress.update(existing.id, {
        status: 'completed',
        progress: 100,
        completed_at: new Date().toISOString(),
      });
    } else {
      await base44.entities.MissionProgress.create({
        user_id: this.uid,
        mission_id: missionId,
        status: 'completed',
        progress: 100,
        started_at: new Date().toISOString(),
        completed_at: new Date().toISOString(),
      });
    }

    const wallet = await this._getOrCreateWallet();
    const newBalance = (wallet.balance || 0) + reward;
    const updatedWallet = await base44.entities.VirtualCurrency.update(wallet.id, {
      balance: newBalance,
      lifetime_earned: (wallet.lifetime_earned || 0) + reward,
    });

    const profile = await this._getOrCreateProfile();
    const newXp = (profile.xp || 0) + xp;
    const newLevel = Math.max(profile.level || 1, Math.floor(newXp / 100) + 1);
    const updatedProfile = await base44.entities.PlayerProfile.update(profile.id, {
      xp: newXp,
      level: newLevel,
    });

    return { alreadyCompleted: false, wallet: updatedWallet, profile: updatedProfile, reward, xp };
  }

  async savePosition(pos, rotation) {
    const profile = await this._getOrCreateProfile();
    await base44.entities.PlayerProfile.update(profile.id, {
      last_position: { x: pos.x, y: pos.y, z: pos.z },
      last_rotation: rotation || 0,
      last_played_at: new Date().toISOString(),
      current_world: GameStateAdapter.WORLD_ID,
    });
    const ws = await this._getOrCreateWorldState();
    await base44.entities.WorldState.update(ws.id, {
      position: { x: pos.x, y: pos.y, z: pos.z },
      rotation: rotation || 0,
      last_saved_at: new Date().toISOString(),
    });
  }

  /** Return the user's discovered-location ids for this world (for the directory). */
  async getDiscovered() {
    const ws = await this._getOrCreateWorldState();
    return ws.discovered_locations || [];
  }

  async discoverLocation(name) {
    const ws = await this._getOrCreateWorldState();
    const disc = ws.discovered_locations || [];
    if (disc.includes(name)) return { newlyDiscovered: false, discovered: disc };
    const updated = [...disc, name];
    await base44.entities.WorldState.update(ws.id, { discovered_locations: updated });
    return { newlyDiscovered: true, discovered: updated };
  }
}