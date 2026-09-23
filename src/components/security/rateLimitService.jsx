/**
 * Rate Limiting Service - Client-side rate limiting
 */

class RateLimitService {
  constructor() {
    this.requests = new Map();
  }

  isRateLimited(key, maxRequests = 10, windowMs = 60000) {
    const now = Date.now();
    const windowStart = now - windowMs;
    let timestamps = (this.requests.get(key) || []).filter(t => t > windowStart);

    if (timestamps.length >= maxRequests) {
      return { limited: true, retryAfter: Math.ceil((timestamps[0] - windowStart) / 1000), remaining: 0 };
    }

    timestamps.push(now);
    this.requests.set(key, timestamps);
    return { limited: false, remaining: maxRequests - timestamps.length, retryAfter: 0 };
  }

  static LIMITS = {
    API_GENERAL: { max: 100, window: 60000 },
    API_SENSITIVE: { max: 10, window: 60000 },
    WALLET_CONNECT: { max: 5, window: 300000 },
    TRANSACTION: { max: 10, window: 60000 },
    LOGIN: { max: 5, window: 300000 },
    POST_CREATE: { max: 10, window: 3600000 },
    NFT_MINT: { max: 5, window: 3600000 },
    LISTING_CREATE: { max: 20, window: 3600000 },
    BUY: { max: 10, window: 60000 },
  };

  checkLimit(key, limitType) {
    const config = RateLimitService.LIMITS[limitType];
    if (!config) return { limited: false };
    return this.isRateLimited(key, config.max, config.window);
  }

  clearLimit(key) {
    this.requests.delete(key);
  }

  cleanup() {
    const now = Date.now();
    const maxWindow = 3600000;
    for (const [key, timestamps] of this.requests.entries()) {
      const recent = timestamps.filter(t => t > now - maxWindow);
      if (recent.length === 0) this.requests.delete(key);
      else this.requests.set(key, recent);
    }
  }
}

export const rateLimitService = new RateLimitService();
setInterval(() => rateLimitService.cleanup(), 300000);

export const useRateLimit = (user) => {
  const getUserKey = (action) => `${user?.email || 'anon'}:${action}`;
  return {
    checkLimit: (limitType) => rateLimitService.checkLimit(getUserKey(limitType), limitType),
    canPerformAction: (limitType) => !rateLimitService.checkLimit(getUserKey(limitType), limitType).limited,
    getRemainingAttempts: (limitType) => rateLimitService.checkLimit(getUserKey(limitType), limitType).remaining || 0
  };
};