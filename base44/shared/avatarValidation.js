import { assertAssetUrl, assertSafeTree, invalid, isRecord } from './apiContract.js';
import { normalizeAvatarConfig } from './avatarConfigServer.js';
const APPEARANCE_FIELDS = new Set(('skinTone eyeColor hairColor height isVisible currentAction hairStyleId hairAssetUrl skinFinish skinOverlay overlayStrength headScale shoulderWidth limbScale facialHairStyleId facialHairColor facialHairDensity eyebrowColor eyebrowThickness irisHue irisSaturation irisBrightness pupilSize scleraTint scleraTintStrength limbalRingIntensity eyeGloss topColor bottomColor shoeColor meshOverrides morphTargets').split(' '));
const TOP_FIELDS = new Set('schema_version revision avatar customization equipped custom_animations environment current_realm updated_at'.split(' '));
function keys(value, allowed) { if (!isRecord(value) || Object.keys(value).some(k => !allowed.has(k))) throw invalid('Unexpected avatar fields'); }
export function validateAvatarConfig(raw, options = {}) {
  if (!isRecord(raw) || new TextEncoder().encode(JSON.stringify(raw)).length > 262144) throw invalid('Avatar config exceeds 256 KiB or is not an object');
  assertSafeTree(raw);
  if (raw.revision !== undefined && (!Number.isSafeInteger(raw.revision) || raw.revision < 0)) throw invalid('Invalid avatar revision');
  if (raw.schema_version !== undefined && raw.schema_version !== 2) throw invalid('Unsupported avatar version');
  if (raw.schema_version === 2) keys(raw, TOP_FIELDS);
  if (raw.customization && (!isRecord(raw.customization) || ('isVisible' in raw.customization && typeof raw.customization.isVisible !== 'boolean'))) throw invalid('Invalid customization');
  const cfg = normalizeAvatarConfig(raw);
  if (!cfg?.avatar?.model_url) throw invalid('An avatar model is required');
  assertAssetUrl(cfg.avatar.model_url, options);
  if (raw.avatar) {
    keys(raw.avatar, new Set(['id','model_url','url','source','gender']));
    if (raw.avatar.id != null && (typeof raw.avatar.id !== 'string' || raw.avatar.id.length > 256)) throw invalid('Invalid avatar ID');
  }
  if (raw.avatar?.gender && !['feminine','masculine','neutral'].includes(raw.avatar.gender)) throw invalid('Invalid avatar gender');
  if (cfg.avatar.source && !['rpm','upload','default','look','system','readyplayerme','streamoji'].includes(cfg.avatar.source)) throw invalid('Invalid avatar source');
  keys(cfg.customization, APPEARANCE_FIELDS);
  for (const [key, value] of Object.entries(cfg.customization)) {
    if (['meshOverrides','morphTargets'].includes(key)) continue;
    if (key === 'hairAssetUrl' && value != null) assertAssetUrl(value, options);
    else if (key === 'isVisible' && typeof value !== 'boolean') throw invalid('Invalid visibility');
    else if (typeof value === 'number' && (value < 0 || value > (key === 'irisHue' ? 360 : 10))) throw invalid('Appearance value out of range');
    else if (value != null && !['string','number','boolean'].includes(typeof value)) throw invalid('Invalid appearance value');
    const numeric = ['height','overlayStrength','headScale','shoulderWidth','limbScale','facialHairDensity','eyebrowThickness','irisHue','irisSaturation','irisBrightness','pupilSize','scleraTintStrength','limbalRingIntensity','eyeGloss'];
    if (numeric.includes(key) && typeof value !== 'number') throw invalid('Appearance attribute must be numeric');
    if (!numeric.includes(key) && key !== 'isVisible' && value != null && typeof value !== 'string') throw invalid('Appearance attribute must be text');
  }
  const mesh = cfg.customization.meshOverrides || {};
  if (!isRecord(mesh) || Object.keys(mesh).length > 256) throw invalid('Invalid mesh overrides');
  for (const patch of Object.values(mesh)) {
    keys(patch, new Set(['visible','color','opacity','roughness','metalness']));
    if ('visible' in patch && typeof patch.visible !== 'boolean') throw invalid('Invalid mesh visibility');
    if ('color' in patch && !/^#[\da-f]{6}$/i.test(patch.color)) throw invalid('Invalid material color');
    for (const key of ['opacity','roughness','metalness']) if (key in patch && (typeof patch[key] !== 'number' || patch[key] < 0 || patch[key] > 1)) throw invalid('Invalid material value');
  }
  const morphs = cfg.customization.morphTargets || {};
  if (!isRecord(morphs) || Object.keys(morphs).length > 1024 || Object.values(morphs).some(v => typeof v !== 'number' || v < 0 || v > 1)) throw invalid('Invalid morph targets');
  const equipped = raw.equipped ?? raw.wearables ?? [];
  if (!Array.isArray(equipped) || equipped.length > 64 || cfg.equipped.length !== equipped.length) throw invalid('Invalid equipped items');
  if (raw.schema_version === 2) for (const e of equipped) {
    keys(e, new Set(['source','wearable_id','model_url','name','position','rotation','scale','slot','bone','color']));
    if (!['catalog','upload'].includes(e.source)) throw invalid('Invalid equipped source');
    if (e.wearable_id != null && typeof e.wearable_id !== 'string') throw invalid('Invalid wearable ID');
    if (e.scale !== undefined && typeof e.scale !== 'number') throw invalid('Invalid scale');
  }
  for (const e of cfg.equipped) {
    if (e.model_url) assertAssetUrl(e.model_url, options);
    if (e.wearable_id && !/^[\w-]{1,128}$/.test(e.wearable_id)) throw invalid('Invalid wearable ID');
    for (const k of ['position','rotation']) if (e[k] && (e[k].length !== 3 || e[k].some(n => !Number.isFinite(n) || Math.abs(n) > 100))) throw invalid('Invalid transform');
    if (e.scale !== undefined && (e.scale <= 0 || e.scale > 20)) throw invalid('Invalid scale');
  }
  const animations = raw.custom_animations ?? raw.customAnimations ?? [];
  if (!Array.isArray(animations) || animations.length > 64 || animations.length !== cfg.custom_animations.length) throw invalid('Invalid animations');
  cfg.custom_animations.forEach(a => assertAssetUrl(a.url, options));
  return cfg;
}