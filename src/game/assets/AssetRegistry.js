import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

/**
 * AssetRegistry — the single source of truth for every world asset reference.
 *
 * Adapted from the reference repo's pattern of preloading item GLBs from a
 * central `items` map (SocketManager → useGLTF.preload). SKRTLIFE generalizes
 * that into a typed registry spanning every asset category the world can
 * reference: avatars, buildings, storefronts, street assets, furniture,
 * vehicles, props, clothing, animations, interactive objects.
 *
 * Phase One ships primitive `builtIn` assets (no external files) so the world
 * runs with zero asset dependencies; the registry is already shaped to accept
 * GLB URLs, so the donor-engine asset drop (next phase) is a DATA change
 * (register an entry with `modelUrl`), not an engine rewrite.
 */
export const AssetCategory = {
  AVATAR: 'avatars',
  BUILDING: 'buildings',
  STOREFRONT: 'storefronts',
  STREET: 'street',
  PROP: 'props',
  FURNITURE: 'furniture',
  VEHICLE: 'vehicles',
  CLOTHING: 'clothing',
  ANIMATION: 'animations',
  INTERACTIVE: 'interactiveObjects',
  // Phase F district categories — swappable via AssetRegistry (modelUrl: null
  // now; drop a GLB URL here later to replace the built-in procedural geometry).
  ENVIRONMENT: 'environment',
  ARCHITECTURE: 'architecture',
  STORE: 'store',
  DRIPSYNC: 'dripsync',
  GARAGE: 'garage',
  EVENT: 'event',
  BRANDING: 'branding',
};

const _registry = {};
Object.values(AssetCategory).forEach((c) => { _registry[c] = {}; });

const _loader = new GLTFLoader();
const _gltfCache = new Map();

export function registerAsset(category, entry) {
  if (!_registry[category]) _registry[category] = {};
  _registry[category][entry.id] = { category, ...entry };
  return entry;
}

export function getAsset(category, id) {
  return _registry[category]?.[id] || null;
}

export function listAssets(category) {
  return Object.values(_registry[category] || {});
}

/** Load (and cache) a GLB by URL. Returns { scene, animations }. */
export function loadGLB(url) {
  if (_gltfCache.has(url)) return Promise.resolve(_gltfCache.get(url));
  const p = _loader.loadAsync(url).then((gltf) => {
    const value = { scene: gltf.scene, animations: gltf.animations || [] };
    _gltfCache.set(url, value);
    return value;
  });
  _gltfCache.set(url, p);
  return p;
}

/** Preload a list of GLB urls; resolves when all are cached. */
export function preloadGLBs(urls = []) {
  return Promise.all(urls.filter(Boolean).map((u) => loadGLB(u)));
}

/** Drop every cached GLB. Call on World unmount: GameEngine._disposeScene
 *  disposes the cached scenes' geometries/materials, so a remount MUST NOT
 *  reuse the (now-disposed) cache — it would render a broken avatar.
 *  After clearing, the next load re-fetches fresh GLBs. */
export function clearGLBCache() {
  _gltfCache.clear();
}

/* ── Phase One built-in registrations (primitive, no files) ────────────── */
registerAsset(AssetCategory.AVATAR, { id: 'placeholder_resident', label: 'Resident Placeholder', builtIn: true, source: 'skrtlife:placeholder' });

/* ── Phase F district registrations (procedural placeholders; modelUrl: null
     so any entry can later be swapped for a production GLB without touching
     WorldManager build code — the geometry is keyed by these ids). ───────── */
registerAsset(AssetCategory.ENVIRONMENT, { id: 'district_ground', label: 'District Ground + Road', builtIn: true, modelUrl: null });
registerAsset(AssetCategory.ARCHITECTURE, { id: 'skrtlife_monument', label: 'SKRTLIFE Monument', builtIn: true, modelUrl: null });
registerAsset(AssetCategory.ARCHITECTURE, { id: 'skyline_backdrop', label: 'Skyline Backdrop', builtIn: true, modelUrl: null });
registerAsset(AssetCategory.STORE, { id: 'skrtlife_flagship', label: 'SKRTLIFE Flagship', builtIn: true, modelUrl: null });
registerAsset(AssetCategory.STORE, { id: 'five_lines_gallery', label: 'Five Lines Gallery', builtIn: true, modelUrl: null });
registerAsset(AssetCategory.DRIPSYNC, { id: 'dripsync_lab', label: 'DripSync Lab', builtIn: true, modelUrl: null });
registerAsset(AssetCategory.DRIPSYNC, { id: 'dripsync_mirror', label: 'DripSync Mirror Terminal', builtIn: true, modelUrl: null });
registerAsset(AssetCategory.GARAGE, { id: 'skrtlife_garage', label: 'SKRTLIFE Garage', builtIn: true, modelUrl: null });
registerAsset(AssetCategory.GARAGE, { id: 'display_vehicle', label: 'Display Vehicle', builtIn: true, modelUrl: null });
registerAsset(AssetCategory.EVENT, { id: 'event_stage', label: 'Event / Drop Stage', builtIn: true, modelUrl: null });
registerAsset(AssetCategory.BRANDING, { id: 'five_lines_mark', label: 'Five Lines Mark', builtIn: true, modelUrl: null });
registerAsset(AssetCategory.STREET, { id: 'streetlamp_amber', label: 'Amber Streetlamp', builtIn: true, modelUrl: null });
registerAsset(AssetCategory.STREET, { id: 'bollard', label: 'Bollard', builtIn: true, modelUrl: null });
registerAsset(AssetCategory.STREET, { id: 'jersey_barrier', label: 'Jersey Barrier', builtIn: true, modelUrl: null });
registerAsset(AssetCategory.STREET, { id: 'bench', label: 'Plaza Bench', builtIn: true, modelUrl: null });
registerAsset(AssetCategory.STREET, { id: 'trash_can', label: 'Trash Can', builtIn: true, modelUrl: null });
registerAsset(AssetCategory.STREET, { id: 'scaffold', label: 'Scaffolding', builtIn: true, modelUrl: null });
registerAsset(AssetCategory.STREET, { id: 'chain_link', label: 'Chain-link Fence', builtIn: true, modelUrl: null });
registerAsset(AssetCategory.STREET, { id: 'poster_drop', label: 'Drop Poster', builtIn: true, modelUrl: null });
registerAsset(AssetCategory.PROP, { id: 'product_pedestal', label: 'Product Pedestal', builtIn: true, modelUrl: null });
registerAsset(AssetCategory.PROP, { id: 'directory_kiosk', label: 'Directory Kiosk', builtIn: true, modelUrl: null });
registerAsset(AssetCategory.INTERACTIVE, { id: 'dripsync_tablet', label: 'DripSync Tablet', builtIn: true });
registerAsset(AssetCategory.VEHICLE, { id: 'placeholder_ride', label: 'Placeholder Ride', builtIn: true });

/**
 * ZONES / CHUNKS — streaming extension point.
 *
 * The directive calls for zone/chunk loading so SKRTLIFE can grow without
 * loading an entire future city at startup. A zone descriptor lists the asset
 * refs it needs; a future WorldLoader will mount only the zone the player
 * occupies and stream neighbours on demand. Phase One runs a single zone
 * (block_001) fully in memory; the registry is ready for chunked streaming
 * without forcing it now.
 */
export const ZONES = [
  {
    id: 'block_001',
    worldId: 'block_001',
    label: 'SKRTLIFE District',
    streaming: 'inMemory',
    assets: [
      'environment:district_ground',
      'architecture:skrtlife_monument',
      'architecture:skyline_backdrop',
      'store:skrtlife_flagship',
      'store:five_lines_gallery',
      'dripsync:dripsync_lab',
      'dripsync:dripsync_mirror',
      'garage:skrtlife_garage',
      'garage:display_vehicle',
      'event:event_stage',
      'branding:five_lines_mark',
      'street:streetlamp_amber',
      'street:bollard',
      'street:jersey_barrier',
      'street:bench',
      'street:trash_can',
      'street:scaffold',
      'street:chain_link',
      'street:poster_drop',
      'props:product_pedestal',
      'props:directory_kiosk',
      'interactiveObjects:dripsync_tablet',
      'vehicles:placeholder_ride',
    ],
  },
];

export const ACTIVE_ZONE = ZONES[0];