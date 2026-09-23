/**
 * deviceTier — conservative quality tier for the World renderer.
 * A single coarse-pointer check (phones/tablets) selects a lower pixel ratio
 * and shadow resolution. There is ONE World; this only tunes renderer settings,
 * never geometry or content (per Phase F.5 §17: "Do not maintain separate Worlds").
 */
export function isMobileDevice() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia?.('(pointer: coarse)')?.matches ?? false;
}

export const QUALITY = isMobileDevice() ? 'mobile' : 'desktop';

export const PIXEL_RATIO_CAP = QUALITY === 'mobile' ? 1.5 : 2;
export const SHADOW_MAP_SIZE = QUALITY === 'mobile' ? 1024 : 2048;