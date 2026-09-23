import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import GameEngine from './core/GameEngine';
import CameraRig from './core/CameraRig';
import InputManager from './core/InputManager';
import AvatarManager from './player/AvatarManager';
import PlayerController from './player/PlayerController';
import WorldManager from './world/WorldManager';
import InteractionManager from './interaction/InteractionManager';
import NPCManager from './npc/NPCManager';
import VehicleManager from './vehicle/VehicleManager';
import SaveManager from './save/SaveManager';
import GameStateAdapter from './save/GameStateAdapter';
import { buildWorldAvatarSpec, avatarConfigFingerprint } from './player/WorldAvatarAdapter';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import WorldHUD from './ui/WorldHUD';
import WorldMenu from './ui/WorldMenu';
import WorldBoot from './ui/WorldBoot';
import StoreOverlay from './ui/StoreOverlay';
import DripSyncTabletOverlay from './ui/DripSyncTabletOverlay';
import TouchControls from './ui/TouchControls';
import WorldDevHud from './ui/WorldDevHud';
import WorldDirectory from './ui/WorldDirectory';
import WorldProductDisplay from './commerce/WorldProductDisplay';
import PresenceLayer from './multiplayer/PresenceLayer';
import { InteractionType, INTERACTION_META } from './interactions/InteractionTypes';
import { ACTIVE_ZONE, clearGLBCache } from './assets/AssetRegistry';
import ContextualHint from '@/components/ui/ContextualHint';
import { isHintSeen } from '@/lib/contextualHints';

/**
 * SkrtWorld — the React shell that mounts the Three.js game engine, wires
 * every subsystem, bridges gameplay events to the SKRTLIFE backend through
 * GameStateAdapter, and renders the immersive HUD + ESC menu. Authenticated
 * SKRTLIFE user identity flows down from useAuth — there is no second login.
 */
export default function SkrtWorld() {
  const mountRef = useRef(null);
  const engineRef = useRef(null);
  const ctxRef = useRef(null);
  const alreadyCompleteRef = useRef(false);
  const claimDropRef = useRef(null);
  const claimingRef = useRef(false);
  const lastAvatarFpRef = useRef('');

  const [hud, setHud] = useState({ username: 'resident', skrtBalance: 0, mission: null, prompt: null, toast: null });
  const [boot, setBoot] = useState({ loading: true, error: null });
  const [discovered, setDiscovered] = useState([]);
  // Unified game/UI mode — single source of truth for what the World is doing.
  // 'playing' → movement + mouse look + pointer lock allowed.
  // 'store' | 'dripsync' | 'menu' → input paused, pointer lock released, UI receives pointer/keyboard.
  const [mode, setMode] = useState('playing');
  const [featuredProduct, setFeaturedProduct] = useState(null);
  const [fiveLinesProduct, setFiveLinesProduct] = useState(null);
  const [storeZone, setStoreZone] = useState('flagship');
  const [inputMgr, setInputMgr] = useState(null);
  const [dripSyncedTrigger, setDripSyncedTrigger] = useState(false);
  const [isTouch] = useState(() => typeof window !== 'undefined' && (window.matchMedia?.('(pointer: coarse)').matches ?? false));

  const { user, isLoadingAuth, updateUser } = useAuth();
  const navigate = useNavigate();

  const toast = useCallback((t) => setHud((h) => ({ ...h, toast: { ...t, id: Date.now() } })), []);
  const dismissToast = useCallback(() => setHud((h) => (h.toast ? { ...h, toast: null } : h)), []);

  // auto-dismiss toasts
  useEffect(() => {
    if (!hud.toast) return;
    const t = setTimeout(dismissToast, 3600);
    return () => clearTimeout(t);
  }, [hud.toast, dismissToast]);

  useEffect(() => {
    if (isLoadingAuth || !user) return;
    let dead = false;

    (async () => {
      let engine;
      try {
        engine = new GameEngine(mountRef.current);
        engineRef.current = engine;

        const input = new InputManager(engine.renderer.domElement);
        setInputMgr(input);
        const camera = new CameraRig(engine.camera, input);
        const world = new WorldManager(engine.scene);
        camera.setColliders(world.colliders); // §7: keep the camera out of walls
        const avatar = new AvatarManager(engine.scene);
        const npc = new NPCManager(engine.scene);
        const vehicle = new VehicleManager(engine.scene);
        const adapter = new GameStateAdapter(user);

        const { profile, wallet, mission, missionProgress } = await adapter.getInitialState();
        alreadyCompleteRef.current = missionProgress?.status === 'completed';

        // §15: load discovered locations for the district directory
        try { const d = await adapter.getDiscovered(); if (!dead) setDiscovered(d); } catch (e) {}

        // Identity comes from User.avatar_config (canonical), NOT PlayerProfile.
        // PlayerProfile owns only position/level/xp; the avatar's face/body/clothing
        // are the exact same config the full DripSync editor saved.
        const avatarSpec = await buildWorldAvatarSpec(user);
        const avatarResult = await avatar.loadFromConfig(avatarSpec);
        lastAvatarFpRef.current = avatarConfigFingerprint(user);
        const worn = avatarResult.wearablesApplied || 0;
        const srcLabel = avatarResult.source === 'avatar'
          ? `avatar loaded${worn ? ` · ${worn} worn` : ''}`
          : 'placeholder avatar equipped';

        const player = new PlayerController({ avatar, input, camera, world });
        const hasSaved = profile.last_position && typeof profile.last_position.x === 'number';
        const spawn = hasSaved ? profile.last_position : (profile.spawn_point || GameStateAdapter.DEFAULT_SPAWN);
        player.spawnAt(spawn, profile.last_rotation ?? GameStateAdapter.DEFAULT_ROTATION);

        const interaction = new InteractionManager({ world, player });
        interaction.onChange = (cur) =>
          setHud((h) => ({ ...h, prompt: cur ? { label: cur.label, id: cur.id, key: INTERACTION_META[cur.type]?.promptKey || 'E' } : null }));

        const save = new SaveManager({ adapter, player });

        // commerce connection — featured Product record rendered in the 3D store
        const productDisplay = new WorldProductDisplay({ scene: engine.scene, anchor: world.storeInteriorAnchor });
        const featured = await productDisplay.loadFeatured();
        if (!dead && featured) setFeaturedProduct(featured);
        engine.addSystem({ update: (dt) => productDisplay.update(dt) });

        // Five Lines gallery display — a second pedestal showing a premium /
        // limited product (same Product DB, no second catalog). Falls back to
        // any active product if no Limited/Collab or Genesis stock exists yet.
        const fiveLinesDisplay = new WorldProductDisplay({ scene: engine.scene, anchor: world.fiveLinesInteriorAnchor });
        let flList = [];
        try { flList = await base44.entities.Product.filter({ status: 'active', collection: 'Limited/Collab' }, '-created_date', 3); } catch (e) {}
        if (!flList.length) { try { flList = await base44.entities.Product.filter({ status: 'active', collection: 'Genesis' }, '-created_date', 3); } catch (e) {} }
        if (!flList.length) { try { flList = await base44.entities.Product.filter({ status: 'active' }, '-created_date', 3); } catch (e) {} }
        const flProduct = flList[0] || null;
        if (flProduct) fiveLinesDisplay.setProduct(flProduct);
        if (!dead && flProduct) setFiveLinesProduct(flProduct);
        engine.addSystem({ update: (dt) => fiveLinesDisplay.update(dt) });

        // multiplayer presence — designed in, activated later (PresenceLayer stub)
        const presence = new PresenceLayer();
        presence.join(ACTIVE_ZONE.worldId, { id: user.id, name: profile.display_name }).catch(() => {});

        // §15: mark a district location discovered and refresh the directory state
        const markDiscovered = async (id) => {
          if (!id) return;
          try { const res = await adapter.discoverLocation(id); if (res?.discovered) setDiscovered(res.discovered); } catch (e) {}
        };

        const claimDrop = async () => {
          if (alreadyCompleteRef.current) {
            toast({ title: 'SKRTLIFE Store', body: 'First drop already claimed. New stock coming soon.', tone: 'info' });
            return;
          }
          // prevent the double-tap race that could double-credit the wallet
          if (claimingRef.current) return;
          claimingRef.current = true;
          try {
            const res = await adapter.completeMission(mission.mission_id, mission);
            if (!res.alreadyCompleted) {
              alreadyCompleteRef.current = true;
              setHud((h) => ({
                ...h,
                skrtBalance: res.wallet.balance,
                mission: { ...h.mission, status: 'completed' },
              }));
              toast({ title: 'Mission Complete', body: `+${res.reward} SKRT · +${res.xp} XP`, tone: 'reward' });
              await save.saveNow();
            }
            await markDiscovered('flagship');
          } finally {
            claimingRef.current = false;
          }
        };

        const handleVehicle = () => {
          const ctx = ctxRef.current;
          if (!ctx) return;
          if (!ctx.vehicle.occupied) {
            ctx.vehicle.enter(ctx.player.avatar.root);
            toast({ title: 'Vehicle', body: 'Placeholder ride entered (press F or E to exit).', tone: 'info' });
          } else {
            // exit returns the exit position; apply it to the CONTROLLER so the
            // next frame's avatar.root copy keeps it (root-only sets snap back).
            const exitPos = ctx.vehicle.exit(ctx.player.avatar.root);
            if (exitPos) ctx.player.position.set(exitPos.x, exitPos.y, exitPos.z);
            toast({ title: 'Vehicle', body: 'Exited vehicle.', tone: 'info' });
          }
        };

        // Typed interaction dispatch — one handler per InteractionType
        const interactionHandlers = {
          [InteractionType.ENTER_STORE]: (cur) => {
            // Zone-aware: set only the zone here; the render derives the product
            // fresh (avoiding a stale-closure capture of the product state).
            const zone = cur?.zone === 'five_lines' ? 'five_lines' : 'flagship';
            setStoreZone(zone);
            markDiscovered(zone);
            setMode('store');
          },
          [InteractionType.OPEN_DRIPSYNC]: () => { markDiscovered('dripsync'); setMode('dripsync'); },
          [InteractionType.OPEN_DIRECTORY]: () => setMode('directory'),
          [InteractionType.ENTER_EVENT]: () => {
            toast({ title: 'Event Space', body: 'Drops, shows & community events load here. Stay tuned.', tone: 'info' });
            markDiscovered('event');
          },
          [InteractionType.TALK_TO_NPC]: () => {
            toast({ title: 'Skrt Local', body: '"Welcome to the District. Flagship\'s open — fresh drops inside. Five Lines is the quiet one, west."', tone: 'npc' });
          },
          [InteractionType.ENTER_VEHICLE]: () => { handleVehicle(); markDiscovered('garage'); },
        };

        player.onInteract = () => {
          const cur = interaction.current;
          if (!cur) return;
          const fn = interactionHandlers[cur.type];
          if (fn) fn(cur);
        };
        player.onVehicle = () => {
          const ctx = ctxRef.current;
          const cur = ctx?.interaction.current;
          if (cur && cur.type === InteractionType.ENTER_VEHICLE) handleVehicle();
        };

        engine.addSystem(input);
        engine.addSystem(camera);
        engine.addSystem(player);
        engine.addSystem(avatar);
        engine.addSystem(interaction);
        engine.addSystem({ update: (dt) => npc.update(dt) });
        engine.addSystem({ update: (dt) => vehicle.update(dt) });
        engine.addSystem({ update: () => world.update() }); // pulse accent rings
        engine.addSystem(save);

        claimDropRef.current = claimDrop;
        ctxRef.current = { adapter, player, interaction, vehicle, mission, avatar, input, camera, world, npc, save, productDisplay, fiveLinesDisplay, presence, engine };

        setHud((h) => ({
          ...h,
          username: profile.display_name || profile.username || 'Resident',
          skrtBalance: wallet.balance || 0,
          mission: { ...mission, status: alreadyCompleteRef.current ? 'completed' : 'active' },
        }));

        if (!dead) {
          setBoot({ loading: false, error: null });
          toast({ title: 'SKRTLIFE World', body: `Welcome to ${ACTIVE_ZONE.label}, ${profile.display_name || 'Resident'} — ${srcLabel}.`, tone: 'info' });
          engine.start();
        }
      } catch (e) {
        console.error('[SkrtWorld] boot failed', e);
        if (!dead) setBoot({ loading: false, error: (e && e.message) || String(e) });
      }
    })();

    return () => {
      dead = true;
      const ctx = ctxRef.current;
      if (ctx && ctx.save) {
        ctx.save.saveNow().catch(() => {});
      }
      if (ctx && ctx.presence) ctx.presence.leave().catch(() => {});
      if (ctx && ctx.productDisplay) ctx.productDisplay.dispose();
      if (ctx && ctx.fiveLinesDisplay) ctx.fiveLinesDisplay.dispose();
      engineRef.current?.dispose();
      engineRef.current = null;
      ctxRef.current = null;
      // §2: the engine disposed the cached GLB geometries; clear the AssetRegistry
      // cache so a future World remount re-fetches fresh GLBs (not disposed ones).
      clearGLBCache();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, isLoadingAuth]);

  // Hot-refresh — when the in-world DripSync overlay saves a new outfit, the
  // canonical avatar_config changes (AuthContext updateUser). We rebuild the
  // player visual WITHOUT touching position/camera/collision: AvatarManager
  // reuses the same `avatar.root` group (PlayerController owns the transform),
  // CameraRig targets the controller position, and collision is gameplay-owned.
  // The World is paused (mode==='dripsync') while the overlay is open, so no
  // movement races the reload.
  useEffect(() => {
    if (isLoadingAuth || !user) return;
    const ctx = ctxRef.current;
    if (!ctx?.avatar) return; // boot not finished yet — boot effect handles the first load
    const fp = avatarConfigFingerprint(user);
    if (!fp || fp === lastAvatarFpRef.current) return;
    lastAvatarFpRef.current = fp;
    (async () => {
      try {
        const spec = await buildWorldAvatarSpec(user);
        await ctx.avatar.loadFromConfig(spec);
        // Defensive: re-assert the controller's transform onto the (reused) root.
        ctx.player.avatar.root.position.copy(ctx.player.position);
        ctx.player.avatar.root.rotation.y = ctx.player.rotation;
        // First live change → one-time "DRIP SYNCED" confirm; thereafter the
        // existing lightweight toast (priority: contextual hint > ordinary toast).
        if (isHintSeen(user?.id, 'drip_synced')) {
          toast({ title: 'DripSync', body: 'Identity updated in-world.', tone: 'info' });
        } else {
          setDripSyncedTrigger(true);
        }
      } catch (e) {
        console.warn('[SkrtWorld] avatar hot-refresh failed', e);
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.avatar_config, isLoadingAuth]);

  // ESC — one surface at a time. From PLAYING it opens the menu; from any UI
  // mode it returns to PLAYING. (The browser separately releases pointer lock
  // on ESC when locked; this handler covers the post-unlock / panel cases.)
  useEffect(() => {
    const onKey = (e) => {
      if (e.code !== 'Escape') return;
      setMode((m) => (m === 'playing' ? 'menu' : 'playing'));
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  // Pause world input while any UI mode is active. `mode` is the single source
  // of truth: it drives input.enabled, releases pointer lock, and clears any
  // held keys / orphaned touches so the avatar doesn't drift.
  useEffect(() => {
    const ctx = ctxRef.current;
    const playing = mode === 'playing';
    if (ctx && ctx.input) {
      ctx.input.enabled = playing;
      if (!playing) ctx.input.clearKeys();
    }
    if (!playing && document.pointerLockElement) document.exitPointerLock?.();
  }, [mode]);

  const handleMenuAction = (action) => {
    setMode('playing');
    switch (action) {
      case 'resume': return;
      case 'dripsync': setMode('dripsync'); return;
      case 'profile': navigate('/MyAccount'); return;
      case 'shop': setStoreZone('flagship'); setMode('store'); return;
      case 'community': navigate('/Community'); return;
      case 'inventory':
        toast({ title: 'Inventory', body: 'Closet sync with DripSync comes online next.', tone: 'info' });
        return;
      case 'missions':
        toast({
          title: 'Missions',
          body: alreadyCompleteRef.current ? 'First drop claimed. Watch for new objectives.' : 'Reach the SKRTLIFE store and claim your first drop.',
          tone: 'info',
        });
        return;
      case 'settings':
        toast({ title: 'Settings', body: 'Phase One build — controls: WASD, Shift, Space, E, F, ESC.', tone: 'info' });
        return;
      case 'directory': navigate('/'); return;
      default: return;
    }
  };

  // Derived fresh each render — the store overlay shows the product for the
  // zone the player actually entered (flagship or Five Lines), never a stale value.
  const activeStoreProduct = storeZone === 'five_lines' ? fiveLinesProduct : featuredProduct;
  const openStoreOnSite = () => {
    const p = activeStoreProduct;
    if (p?.id) navigate(`/ProductDetail?id=${p.id}`);
    else navigate('/Shop');
  };
  // DripSync is now an in-world OS overlay (no route navigation) — see DripSyncTabletOverlay.

  const reload = () => window.location.reload();

  if (isLoadingAuth) return <WorldBoot loading />;
  if (!user) return <WorldBoot loading={false} error="You must be signed in to enter SKRTLIFE World." onLogin={() => base44.auth.redirectToLogin('/world')} />;

  // The mount container is ALWAYS rendered once a user is present, so the boot
  // effect can attach the Three.js engine to mountRef on its first run. The
  // WorldBoot loader / error gate render as overlays on top of it.
  return (
    <div style={{ position: 'fixed', inset: 0, background: '#070709', overflow: 'hidden', userSelect: 'none', touchAction: 'none' }}>
      <div ref={mountRef} style={{ position: 'absolute', inset: 0 }} />

      {boot.loading && <WorldBoot loading />}
      {boot.error && <WorldBoot loading={false} error={boot.error} onLogin={reload} />}

      {!boot.loading && !boot.error && (
        <>
          <WorldHUD {...hud} onMenu={() => setMode('menu')} />
          <WorldMenu
            open={mode === 'menu'}
            onClose={() => setMode('playing')}
            onAction={handleMenuAction}
            username={hud.username}
            skrtBalance={hud.skrtBalance}
          />
          <StoreOverlay
            open={mode === 'store'}
            product={activeStoreProduct}
            zoneLabel={storeZone === 'five_lines' ? 'Five Lines' : 'Flagship'}
            showClaim={storeZone !== 'five_lines'}
            missionDone={alreadyCompleteRef.current}
            onClaim={() => claimDropRef.current?.()}
            onViewOnSite={openStoreOnSite}
            onClose={() => setMode('playing')}
          />
          <WorldDirectory
            open={mode === 'directory'}
            discovered={discovered}
            onClose={() => setMode('playing')}
          />
          <DripSyncTabletOverlay
            open={mode === 'dripsync'}
            user={user}
            ctxRef={ctxRef}
            updateUser={updateUser}
            onToast={toast}
            onClose={() => setMode('playing')}
          />
          {inputMgr && <TouchControls input={inputMgr} enabled={mode === 'playing'} canInteract={!!hud.prompt} />}
          <WorldDevHud ctxRef={ctxRef} mode={mode} zoneLabel={ACTIVE_ZONE.label} isTouch={isTouch} />
          <ContextualHint
            hintId={isTouch ? 'world_controls_mobile' : 'world_controls_desktop'}
            userId={user?.id}
            trigger={mode === 'playing'}
            title="CONTROLS"
            body={isTouch
              ? 'Left — move · Right — look · E — interact · ↑ — jump'
              : 'Click — capture · WASD — move · Drag — look · Shift — run · E — interact · ESC — menu'}
            ctaLabel="GOT IT"
            position="bottom"
            z={30}
            autoMs={11000}
          />

          {/* One-time contextual hints (post-onboarding ecosystem guidance) */}
          <ContextualHint
            hintId="world_entry"
            userId={user?.id}
            trigger={true}
            title="YOU'RE IN"
            body="Your DripSync identity travels with you across the SKRTLIFE World."
            ctaLabel="GOT IT"
            position="bottom"
            z={30}
            autoMs={9000}
          />
          <ContextualHint
            hintId="drip_synced"
            userId={user?.id}
            trigger={dripSyncedTrigger}
            title="DRIP SYNCED"
            body="Your identity has been updated."
            position="top"
            z={50}
            dismissible={false}
            autoMs={2600}
            markSeenOnShow
            exclusive={false}
          />
        </>
      )}
    </div>
  );
}