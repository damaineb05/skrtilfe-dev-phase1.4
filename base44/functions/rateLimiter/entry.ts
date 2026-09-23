// Rate limiter middleware for backend functions
// Usage: import { checkRateLimit } from './rateLimiter.js';

const rateLimitStore = new Map();

export async function checkRateLimit(identifier, maxRequests = 10, windowMs = 60000) {
  const now = Date.now();
  const key = identifier;
  
  if (!rateLimitStore.has(key)) {
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + windowMs
    });
    return { allowed: true, remaining: maxRequests - 1 };
  }
  
  const record = rateLimitStore.get(key);
  
  // Reset if window expired
  if (now > record.resetTime) {
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now + windowMs
    });
    return { allowed: true, remaining: maxRequests - 1 };
  }
  
  // Increment count
  record.count++;
  
  if (record.count > maxRequests) {
    return { 
      allowed: false, 
      remaining: 0,
      resetTime: record.resetTime
    };
  }
  
  return { 
    allowed: true, 
    remaining: maxRequests - record.count 
  };
}

// Cleanup old entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitStore.entries()) {
    if (now > record.resetTime) {
      rateLimitStore.delete(key);
    }
  }
}, 300000); // Every 5 minutes

export function rateLimitResponse(resetTime) {
  return Response.json(
    { 
      error: 'Rate limit exceeded',
      message: 'Too many requests. Please try again later.',
      resetAt: new Date(resetTime).toISOString()
    },
    { 
      status: 429,
      headers: {
        'Retry-After': Math.ceil((resetTime - Date.now()) / 1000).toString()
      }
    }
  );
}