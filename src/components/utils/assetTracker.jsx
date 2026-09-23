import { base44 } from '@/api/base44Client';

/**
 * Asset Tracker - Automatically saves uploaded/generated assets to the Asset entity
 * All images uploaded or generated in the website are automatically saved to the Asset library
 */

// Check if URL is a blob (local file) - don't track these
const isBlobUrl = (url) => url && url.startsWith('blob:');

export async function trackUploadedAsset(fileUrl, options = {}) {
  // Skip blob URLs - only track actual uploaded files
  if (isBlobUrl(fileUrl)) {
    console.log('⏭️ Skipping blob URL (not a real upload):', fileUrl.slice(0, 50));
    return null;
  }
  const {
    name = 'Uploaded Asset',
    type = 'image',
    source = 'upload',
    fileSize = null,
    mimeType = null,
    width = null,
    height = null,
    tags = [],
    folder = 'Uncategorized',
    altText = '',
    relatedEntity = null,
    relatedEntityId = null
  } = options;

  try {
    const asset = await base44.entities.Asset.create({
      url: fileUrl,
      name: name,
      type: type,
      source: source,
      file_size: fileSize,
      mime_type: mimeType,
      width: width,
      height: height,
      tags: tags,
      folder: folder,
      alt_text: altText,
      related_entity: relatedEntity,
      related_entity_id: relatedEntityId
    });

    console.log('✅ Asset tracked:', asset.id);
    return asset;
  } catch (error) {
    console.error('❌ Failed to track asset:', error);
    return null;
  }
}

export async function trackGeneratedImage(imageUrl, prompt, options = {}) {
  // Skip blob URLs
  if (isBlobUrl(imageUrl)) {
    console.log('⏭️ Skipping blob URL for AI image');
    return null;
  }

  const {
    name = 'AI Generated Image',
    tags = ['ai-generated'],
    folder = 'AI Generated',
    relatedEntity = null,
    relatedEntityId = null
  } = options;

  try {
    const asset = await base44.entities.Asset.create({
      url: imageUrl,
      name: name,
      type: 'image',
      source: 'ai_generated',
      prompt: prompt,
      tags: tags,
      folder: folder,
      related_entity: relatedEntity,
      related_entity_id: relatedEntityId
    });

    console.log('✅ AI generated asset tracked:', asset.id);
    return asset;
  } catch (error) {
    console.error('❌ Failed to track AI asset:', error);
    return null;
  }
}

export async function trackProductAsset(fileUrl, productId, productTitle, options = {}) {
  return trackUploadedAsset(fileUrl, {
    name: `${productTitle} - Asset`,
    source: 'product',
    folder: 'Products',
    tags: ['product'],
    relatedEntity: 'Product',
    relatedEntityId: productId,
    ...options
  });
}

export async function trackBlogAsset(fileUrl, postId, postTitle, options = {}) {
  return trackUploadedAsset(fileUrl, {
    name: `${postTitle} - Image`,
    source: 'blog',
    folder: 'Blog',
    tags: ['blog'],
    relatedEntity: 'BlogPost',
    relatedEntityId: postId,
    ...options
  });
}

export async function trackAvatarAsset(fileUrl, options = {}) {
  return trackUploadedAsset(fileUrl, {
    name: 'Avatar Asset',
    source: 'avatar',
    folder: 'Avatars',
    tags: ['avatar', '3d'],
    type: '3d_model',
    ...options
  });
}

// Wrapper for Core.UploadFile that auto-tracks
export async function uploadAndTrack(file, options = {}) {
  try {
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    
    const asset = await trackUploadedAsset(file_url, {
      name: file.name || 'Uploaded File',
      mimeType: file.type,
      fileSize: file.size,
      ...options
    });

    return { file_url, asset };
  } catch (error) {
    console.error('❌ Upload and track failed:', error);
    throw error;
  }
}

// Wrapper for Core.GenerateImage that auto-tracks
export async function generateAndTrack(prompt, options = {}) {
  try {
    const { url } = await base44.integrations.Core.GenerateImage({ prompt });
    
    const asset = await trackGeneratedImage(url, prompt, options);

    return { url, asset };
  } catch (error) {
    console.error('❌ Generate and track failed:', error);
    throw error;
  }
}

// Track external/existing image URLs
export async function trackExternalImage(imageUrl, options = {}) {
  // Skip blob URLs and empty URLs
  if (!imageUrl || isBlobUrl(imageUrl)) {
    return null;
  }

  const {
    name = 'External Image',
    folder = 'External',
    tags = ['external'],
    relatedEntity = null,
    relatedEntityId = null
  } = options;

  try {
    // Check if already tracked to avoid duplicates
    const existing = await base44.entities.Asset.filter({ url: imageUrl });
    if (existing.length > 0) {
      console.log('⏭️ Asset already tracked:', imageUrl.slice(0, 50));
      return existing[0];
    }

    const asset = await base44.entities.Asset.create({
      url: imageUrl,
      name: name,
      type: 'image',
      source: 'external',
      tags: tags,
      folder: folder,
      related_entity: relatedEntity,
      related_entity_id: relatedEntityId
    });

    console.log('✅ External image tracked:', asset.id);
    return asset;
  } catch (error) {
    console.error('❌ Failed to track external image:', error);
    return null;
  }
}