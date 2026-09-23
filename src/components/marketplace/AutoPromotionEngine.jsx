import { base44 } from '@/api/base44Client';

/**
 * Auto-promotion engine for Genesis Pass holder uploads
 * Automatically promotes NFTs uploaded by Genesis holders across the ecosystem
 */

export async function promoteGenesisNFT(nftId, creatorEmail) {
  try {
    // Check if creator has Genesis Pass
    const creators = await base44.entities.User.filter({ email: creatorEmail });
    const creator = creators[0];
    
    if (!creator?.has_genesis_pass) {
      console.log('Creator is not a Genesis holder - standard promotion applied');
      return;
    }

    // Update NFT with premium promotion
    await base44.entities.NFT.update(nftId, {
      uploaded_by_genesis_holder: true,
      promotion_tier: 'premium',
      is_featured: true,
      quality_verified: creator.is_verified_creator || false
    });

    console.log(`✅ Genesis auto-promotion applied to NFT ${nftId}`);

    // Send notifications to followers (implement when notification system exists)
    // await notifyFollowers(creatorEmail, nftId);

    return { success: true, tier: 'premium' };
  } catch (error) {
    console.error('Auto-promotion failed:', error);
    return { success: false, error: error.message };
  }
}

export async function calculateEngagementScore(nftId) {
  try {
    const nft = await base44.entities.NFT.filter({ id: nftId });
    if (!nft || nft.length === 0) return 0;

    const item = nft[0];
    
    // Weighted engagement calculation
    const viewWeight = 0.3;
    const favoriteWeight = 0.5;
    const salesWeight = 0.2;

    const viewScore = Math.min((item.view_count || 0) / 100, 1) * 100 * viewWeight;
    const favoriteScore = Math.min((item.favorite_count || 0) / 50, 1) * 100 * favoriteWeight;
    const salesScore = item.last_sale_price > 0 ? 100 * salesWeight : 0;

    const totalScore = viewScore + favoriteScore + salesScore;

    // Update the score
    await base44.entities.NFT.update(nftId, {
      engagement_score: totalScore
    });

    return totalScore;
  } catch (error) {
    console.error('Failed to calculate engagement:', error);
    return 0;
  }
}

export async function grantEarlyAccess(nftId, hoursEarly = 24) {
  try {
    const earlyAccessUntil = new Date(Date.now() + hoursEarly * 60 * 60 * 1000);
    
    await base44.entities.NFT.update(nftId, {
      early_access_until: earlyAccessUntil.toISOString()
    });

    console.log(`✅ Early access granted until ${earlyAccessUntil}`);
    return { success: true, until: earlyAccessUntil };
  } catch (error) {
    console.error('Failed to grant early access:', error);
    return { success: false };
  }
}

export async function applyGenesisDiscount(nftId, discountPercent = 10) {
  try {
    await base44.entities.NFT.update(nftId, {
      genesis_discount_percent: discountPercent
    });

    console.log(`✅ ${discountPercent}% Genesis discount applied`);
    return { success: true };
  } catch (error) {
    console.error('Failed to apply discount:', error);
    return { success: false };
  }
}

export async function trackNFTView(nftId) {
  try {
    const nft = await base44.entities.NFT.filter({ id: nftId });
    if (nft && nft.length > 0) {
      await base44.entities.NFT.update(nftId, {
        view_count: (nft[0].view_count || 0) + 1
      });
      
      // Recalculate engagement
      await calculateEngagementScore(nftId);
    }
  } catch (error) {
    console.error('Failed to track view:', error);
  }
}

export default {
  promoteGenesisNFT,
  calculateEngagementScore,
  grantEarlyAccess,
  applyGenesisDiscount,
  trackNFTView
};