/**
 * Asset Loader Module
 * Handles loading, type detection, and normalization of various asset types
 */

// IPFS Gateway configuration
const IPFS_GATEWAYS = [
  'https://ipfs.io/ipfs/',
  'https://gateway.pinata.cloud/ipfs/',
  'https://cloudflare-ipfs.com/ipfs/',
  'https://dweb.link/ipfs/'
];

let currentGatewayIndex = 0;

/**
 * Convert IPFS URI to HTTP gateway URL
 */
export function resolveIpfsUri(uri, gatewayIndex = 0) {
  if (!uri) return null;
  
  if (uri.startsWith('ipfs://')) {
    const cid = uri.replace('ipfs://', '');
    return `${IPFS_GATEWAYS[gatewayIndex % IPFS_GATEWAYS.length]}${cid}`;
  }
  
  if (uri.startsWith('ar://')) {
    return `https://arweave.net/${uri.replace('ar://', '')}`;
  }
  
  return uri;
}

/**
 * Detect asset type from file or URL
 */
export function detectAssetType(file, mimeType) {
  const mime = mimeType || file?.type || '';
  const name = (file?.name || '').toLowerCase();
  
  // Check by MIME type first
  if (mime.startsWith('image/gif')) return 'gif';
  if (mime.startsWith('image/')) return 'image';
  if (mime.startsWith('video/')) return 'video';
  if (mime.startsWith('audio/')) return 'audio';
  if (mime.includes('gltf') || mime.includes('glb') || mime === 'model/gltf-binary' || mime === 'model/gltf+json') return 'model';
  
  // Check by file extension
  if (name.endsWith('.gif')) return 'gif';
  if (name.endsWith('.glb') || name.endsWith('.gltf')) return 'model';
  if (name.endsWith('.mp4') || name.endsWith('.webm') || name.endsWith('.mov')) return 'video';
  if (name.endsWith('.mp3') || name.endsWith('.wav') || name.endsWith('.ogg') || name.endsWith('.flac')) return 'audio';
  if (name.endsWith('.png') || name.endsWith('.jpg') || name.endsWith('.jpeg') || name.endsWith('.webp') || name.endsWith('.svg')) return 'image';
  
  return 'unknown';
}

/**
 * Generate a unique asset ID
 */
export function generateAssetId() {
  return `asset_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Load asset from File object
 */
export async function loadAssetFromFile(file, onProgress) {
  return new Promise((resolve, reject) => {
    const type = detectAssetType(file);
    const id = generateAssetId();
    
    // Create blob URL for local preview
    const src = URL.createObjectURL(file);
    
    // Generate preview for certain types
    let preview = null;
    
    if (type === 'image' || type === 'gif') {
      preview = src;
    } else if (type === 'video') {
      // Video poster will be generated separately
      preview = null;
    }
    
    const asset = {
      id,
      type,
      src,
      mime: file.type,
      name: file.name,
      size: file.size,
      file,
      preview,
      metadata: null,
      createdAt: new Date().toISOString()
    };
    
    // Simulate progress for local files
    if (onProgress) {
      onProgress({ loaded: file.size, total: file.size, percent: 100 });
    }
    
    resolve(asset);
  });
}

/**
 * Load asset from URL
 */
export async function loadAssetFromUrl(url, onProgress) {
  const resolvedUrl = resolveIpfsUri(url);
  
  try {
    const response = await fetch(resolvedUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch asset: ${response.status}`);
    }
    
    const contentType = response.headers.get('content-type') || '';
    const contentLength = parseInt(response.headers.get('content-length') || '0', 10);
    
    // For progress tracking
    const reader = response.body?.getReader();
    let receivedLength = 0;
    const chunks = [];
    
    if (reader) {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        chunks.push(value);
        receivedLength += value.length;
        
        if (onProgress && contentLength) {
          onProgress({
            loaded: receivedLength,
            total: contentLength,
            percent: Math.round((receivedLength / contentLength) * 100)
          });
        }
      }
    }
    
    const blob = new Blob(chunks, { type: contentType });
    const type = detectAssetType({ name: url }, contentType);
    const src = URL.createObjectURL(blob);
    
    return {
      id: generateAssetId(),
      type,
      src,
      originalUrl: url,
      mime: contentType,
      name: url.split('/').pop() || 'asset',
      size: blob.size,
      preview: type === 'image' || type === 'gif' ? src : null,
      metadata: null,
      createdAt: new Date().toISOString()
    };
  } catch (error) {
    // Try next IPFS gateway if current fails
    if (url.startsWith('ipfs://') && currentGatewayIndex < IPFS_GATEWAYS.length - 1) {
      currentGatewayIndex++;
      return loadAssetFromUrl(url, onProgress);
    }
    throw error;
  }
}

/**
 * Main load function - handles both files and URLs
 */
export async function loadAsset(fileOrUrl, onProgress) {
  if (fileOrUrl instanceof File) {
    return loadAssetFromFile(fileOrUrl, onProgress);
  }
  
  if (typeof fileOrUrl === 'string') {
    return loadAssetFromUrl(fileOrUrl, onProgress);
  }
  
  throw new Error('Invalid input: expected File or URL string');
}

/**
 * Parse NFT metadata from JSON or URL
 */
export async function parseMetadata(jsonOrUrl) {
  let metadata;
  
  if (typeof jsonOrUrl === 'string') {
    // It's a URL - fetch it
    const resolvedUrl = resolveIpfsUri(jsonOrUrl);
    const response = await fetch(resolvedUrl);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch metadata: ${response.status}`);
    }
    
    metadata = await response.json();
  } else if (typeof jsonOrUrl === 'object') {
    metadata = jsonOrUrl;
  } else {
    throw new Error('Invalid metadata input');
  }
  
  // Normalize to common schema
  return normalizeMetadata(metadata);
}

/**
 * Normalize metadata to common NFT schema
 */
export function normalizeMetadata(raw) {
  // Handle ERC-721 / ERC-1155 / OpenSea format
  const normalized = {
    name: raw.name || raw.title || 'Untitled',
    description: raw.description || '',
    image: resolveIpfsUri(raw.image || raw.image_url || raw.imageUrl),
    animation_url: resolveIpfsUri(raw.animation_url || raw.animationUrl || raw.animation),
    external_url: raw.external_url || raw.externalUrl,
    background_color: raw.background_color || raw.backgroundColor,
    attributes: normalizeAttributes(raw.attributes || raw.properties || raw.traits || []),
    // Preserve original
    _raw: raw
  };
  
  // ERC-1155 specific
  if (raw.decimals !== undefined) {
    normalized.decimals = raw.decimals;
  }
  
  // Collection info
  if (raw.collection) {
    normalized.collection = {
      name: raw.collection.name || raw.collection,
      family: raw.collection.family
    };
  }
  
  return normalized;
}

/**
 * Normalize attributes to OpenSea format
 */
function normalizeAttributes(attrs) {
  if (!Array.isArray(attrs)) {
    // Convert object format to array
    return Object.entries(attrs).map(([key, value]) => ({
      trait_type: key,
      value: value
    }));
  }
  
  return attrs.map(attr => {
    // Already in correct format
    if (attr.trait_type !== undefined) {
      return {
        trait_type: attr.trait_type,
        value: attr.value,
        display_type: attr.display_type
      };
    }
    
    // Alternative format
    if (attr.type !== undefined) {
      return {
        trait_type: attr.type,
        value: attr.value || attr.name
      };
    }
    
    return attr;
  });
}

/**
 * Generate video poster/thumbnail
 */
export function generateVideoPoster(videoElement) {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    canvas.width = videoElement.videoWidth || 640;
    canvas.height = videoElement.videoHeight || 360;
    
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
    
    resolve(canvas.toDataURL('image/jpeg', 0.8));
  });
}

/**
 * Cleanup blob URLs when done
 */
export function revokeAssetUrl(asset) {
  if (asset?.src?.startsWith('blob:')) {
    URL.revokeObjectURL(asset.src);
  }
  if (asset?.preview?.startsWith('blob:')) {
    URL.revokeObjectURL(asset.preview);
  }
}

export default {
  loadAsset,
  loadAssetFromFile,
  loadAssetFromUrl,
  parseMetadata,
  normalizeMetadata,
  resolveIpfsUri,
  detectAssetType,
  generateVideoPoster,
  revokeAssetUrl,
  generateAssetId
};