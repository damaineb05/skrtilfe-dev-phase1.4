/**
 * Ready Player Me utility functions - Robust & Future-Proof
 * Handles both v1/v2 exports, proxy fallbacks, and evolving RPM fields
 * Now works without backend proxy (Base44 compatible)
 */

/**
 * Extract avatarId from various sources
 * @param {object} avatarConfig - User's avatar configuration object
 * @param {string} avatarSource - Direct avatar URL
 * @returns {string|undefined} Avatar ID or undefined if not found
 */
export function extractAvatarId(avatarConfig, avatarSource) {
  // 1. Check config first
  if (avatarConfig?.avatarId) return avatarConfig.avatarId;
  
  // 2. Parse from URL
  const url = avatarSource || avatarConfig?.avatarUrl || '';
  
  // Match patterns:
  // - https://models.readyplayer.me/<id>.glb
  // - /<id>.glb (at least 10 chars)
  const match = 
    url.match(/models\.readyplayer\.me\/([^/?]+)\.glb/i) ||
    url.match(/\/([a-z0-9]{10,})\.glb/i);
  
  return match?.[1];
}

/**
 * Fetch public avatar metadata from RPM models CDN
 * @param {string} avatarId - Ready Player Me avatar ID
 * @returns {Promise<object>} Avatar metadata JSON
 */
export async function fetchModelsMeta(avatarId) {
  try {
    const res = await fetch(
      `https://models.readyplayer.me/${avatarId}.json`, 
      { cache: 'no-store' }
    );
    
    if (!res.ok) {
      throw new Error(`Failed to fetch RPM models JSON: ${res.status}`);
    }
    
    return await res.json();
  } catch (error) {
    console.warn('[RPM] Failed to fetch public metadata:', error.message);
    return null;
  }
}

/**
 * Normalize color value from various RPM formats
 * @param {object} asset - Equipped asset object
 * @returns {string|null} Hex color string or null
 */
export function extractAssetColor(asset) {
  // Try multiple possible locations for color data
  const colorValue = 
    asset?.color || 
    asset?.parameters?.color || 
    asset?.material?.baseColor ||
    asset?.material?.parameters?.color ||
    asset?.baseColor ||
    null;
  
  // Normalize to hex if needed
  if (colorValue) {
    if (typeof colorValue === 'string' && colorValue.startsWith('#')) {
      return colorValue;
    }
    // If it's an RGB object, convert to hex
    if (typeof colorValue === 'object' && 'r' in colorValue) {
      const r = Math.round((colorValue.r ?? 0) * 255);
      const g = Math.round((colorValue.g ?? 0) * 255);
      const b = Math.round((colorValue.b ?? 0) * 255);
      return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }
  }
  
  return null;
}

/**
 * Find asset by type/category/slot using flexible regex
 * @param {Array} assets - Array of equipped assets
 * @param {RegExp} pattern - Regex pattern to match
 * @returns {object|null} First matching asset or null
 */
export function findAsset(assets, pattern) {
  if (!Array.isArray(assets)) return null;
  
  return assets.find(a => {
    const searchString = [
      a?.type, 
      a?.category, 
      a?.slot, 
      a?.name,
      a?.assetType,
      a?.id
    ].filter(Boolean).join(' ');
    
    return pattern.test(searchString);
  }) ?? null;
}

/**
 * Normalize equipped asset data from various RPM response formats
 * Handles both v1 and v2 API responses, plus future unknown fields
 * @param {object} rawAsset - Raw asset from RPM API
 * @returns {object} Normalized asset
 */
export function normalizeEquippedAsset(rawAsset) {
  if (!rawAsset) return null;
  
  const pick = (...vals) => vals.find(v => v !== undefined && v !== null);
  
  const normalized = {
    id: pick(rawAsset?.id, rawAsset?.assetId, rawAsset?.guid, rawAsset?.identifier) ?? null,
    name: pick(rawAsset?.name, rawAsset?.title, rawAsset?.label) ?? 'Unknown',
    type: pick(rawAsset?.type, rawAsset?.category, rawAsset?.slot, rawAsset?.assetType) ?? 'unknown',
    slot: pick(rawAsset?.slot, rawAsset?.category, rawAsset?.type) ?? 'unknown',
    color: extractAssetColor(rawAsset),
    material: rawAsset?.material ?? {},
    // Store raw asset for logging/debugging
    _raw: rawAsset
  };
  
  return normalized;
}

/**
 * Fetch equipped assets from a proxy endpoint (DISABLED for Base44)
 * Always returns null since Base44 apps don't have backend proxy
 * 
 * @param {string} avatarId - RPM avatar ID
 * @param {string} proxyUrl - Backend proxy URL (ignored)
 * @returns {Promise<null>} Always returns null
 */
export async function fetchEquippedAssets(avatarId, proxyUrl = '/api/rpm/avatar') {
  // Base44 apps don't have custom backend, so proxy won't work
  console.log('[RPM] Proxy disabled - Base44 frontend-only mode');
  return null;
}

/**
 * Derive hair and eye colors from equipped assets using soft regex matching
 * @param {Array} equippedAssets - Normalized equipped assets
 * @returns {object} Object with hair and eyes properties
 */
export function deriveTraitsFromAssets(equippedAssets) {
  if (!Array.isArray(equippedAssets) || equippedAssets.length === 0) {
    console.warn('[RPM] No equipped assets to derive traits from');
    return { hair: null, eyes: null };
  }
  
  // Soft-match hair with flexible patterns
  const hairPatterns = [
    /hair/i,
    /hairstyle/i,
    /head.*hair/i,
    /scalp/i
  ];
  
  let hair = null;
  for (const pattern of hairPatterns) {
    hair = findAsset(equippedAssets, pattern);
    if (hair) break;
  }
  
  // Soft-match eyes with flexible patterns
  const eyePatterns = [
    /eye/i,
    /iris/i,
    /eyeball/i,
    /pupil/i
  ];
  
  let eyes = null;
  for (const pattern of eyePatterns) {
    eyes = findAsset(equippedAssets, pattern);
    if (eyes) break;
  }
  
  const result = {
    hair: hair ? {
      color: hair.color,
      name: hair.name,
      id: hair.id
    } : null,
    eyes: eyes ? {
      color: eyes.color,
      name: eyes.name,
      id: eyes.id
    } : null,
  };
  
  console.log('[RPM] Derived traits:', result);
  return result;
}

/**
 * Complete trait hydration workflow with robust fallbacks
 * Works WITHOUT backend proxy (Base44 compatible)
 * Only uses public RPM metadata endpoint
 * 
 * @param {string} avatarId - RPM avatar ID
 * @param {object} options - Configuration options
 * @param {string} options.proxyUrl - Backend proxy URL (ignored in Base44)
 * @param {object} options.fallbacks - Fallback values for traits
 * @param {object} options.currentTraits - Current traits to preserve if fetch fails
 * @returns {Promise<object>} Complete trait data
 */
export async function hydrateAvatarTraits(avatarId, options = {}) {
  const { 
    proxyUrl = '/api/rpm/avatar', // Ignored in Base44
    fallbacks = {
      skinTone: '#FFDBAC',
      hairColor: '#8B4513',
      eyeColor: '#4A90E2',
      bodyType: 'fullbody'
    },
    currentTraits = null // Preserve current traits if fetch fails
  } = options;
  
  console.log('[RPM] Starting trait hydration for:', avatarId);
  
  let skinTone = currentTraits?.skinTone || fallbacks.skinTone;
  let hairColor = currentTraits?.hairColor || fallbacks.hairColor;
  let eyeColor = currentTraits?.eyeColor || fallbacks.eyeColor;
  let bodyType = currentTraits?.bodyType || fallbacks.bodyType;
  let outfitGender = currentTraits?.outfitGender || 'neutral';
  
  // Only try to fetch public metadata (no backend needed)
  let metadata = null;
  try {
    metadata = await fetchModelsMeta(avatarId);
    
    // Extract what we can from public metadata
    if (metadata) {
      skinTone = metadata.skinTone || metadata.skinColor || skinTone;
      bodyType = metadata.bodyType || bodyType;
      outfitGender = metadata.outfitGender || metadata.gender || outfitGender;
      
      console.log('[RPM] Public metadata hydrated:', { skinTone, bodyType, outfitGender });
    }
  } catch (metaError) {
    console.warn('[RPM] Public metadata fetch failed, using fallbacks:', metaError.message);
    // Continue with fallbacks - not critical
  }
  
  // Build final result
  const traits = {
    skinTone,
    hairColor,
    eyeColor,
    bodyType,
    outfitGender
  };
  
  const result = {
    success: true,
    traits,
    metadata: metadata || {},
    equipped: [], // No backend proxy, so no equipped assets
    sources: {
      metadata: !!metadata,
      proxy: false, // Backend proxy not available in Base44
      fallbacks: !metadata
    }
  };
  
  console.log('[RPM] Trait hydration complete (Base44 mode):', result);
  return result;
}

/**
 * Validate avatar ID format
 * @param {string} avatarId - Avatar ID to validate
 * @returns {boolean} Valid or not
 */
export function isValidAvatarId(avatarId) {
  if (!avatarId || typeof avatarId !== 'string') return false;
  
  // RPM IDs are typically 24 hex characters or longer alphanumeric
  return /^[a-z0-9]{10,}$/i.test(avatarId);
}

/**
 * Build avatar URL from ID
 * @param {string} avatarId - Avatar ID
 * @param {object} options - URL options
 * @returns {string} Full avatar URL
 */
export function buildAvatarUrl(avatarId, options = {}) {
  const {
    quality = 'medium',
    pose = 'A',
    cacheBust = false
  } = options;
  
  let url = `https://models.readyplayer.me/${avatarId}.glb`;
  
  const params = [];
  if (quality && quality !== 'medium') params.push(`quality=${quality}`);
  if (pose && pose !== 'A') params.push(`pose=${pose}`);
  if (cacheBust) params.push(`t=${Date.now()}`);
  
  if (params.length > 0) {
    url += '?' + params.join('&');
  }
  
  return url;
}