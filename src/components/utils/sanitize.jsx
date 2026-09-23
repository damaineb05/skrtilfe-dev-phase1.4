// Input sanitization utilities

export function sanitizeString(str, maxLength = 1000) {
  if (!str || typeof str !== 'string') return '';
  
  // Remove null bytes
  str = str.replace(/\0/g, '');
  
  // Trim and limit length
  str = str.trim().substring(0, maxLength);
  
  return str;
}

export function sanitizeEmail(email) {
  if (!email || typeof email !== 'string') return '';
  
  email = sanitizeString(email, 254);
  
  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    throw new Error('Invalid email format');
  }
  
  return email.toLowerCase();
}

export function sanitizeNumber(num, min = -Infinity, max = Infinity) {
  const parsed = Number(num);
  
  if (isNaN(parsed)) {
    throw new Error('Invalid number');
  }
  
  if (parsed < min || parsed > max) {
    throw new Error(`Number must be between ${min} and ${max}`);
  }
  
  return parsed;
}

export function sanitizeHTML(html) {
  if (!html || typeof html !== 'string') return '';
  
  // Remove potentially dangerous tags and attributes
  const dangerous = [
    /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
    /<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi,
    /on\w+\s*=\s*["'][^"']*["']/gi,
    /javascript:/gi,
    /<embed\b[^>]*>/gi,
    /<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi
  ];
  
  let sanitized = html;
  dangerous.forEach(pattern => {
    sanitized = sanitized.replace(pattern, '');
  });
  
  return sanitized;
}

export function sanitizeUrl(url) {
  if (!url || typeof url !== 'string') return '';
  
  try {
    const parsed = new URL(url);
    
    // Only allow http and https protocols
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      throw new Error('Invalid URL protocol');
    }
    
    return parsed.toString();
  } catch (error) {
    throw new Error('Invalid URL format');
  }
}

export function sanitizeObject(obj, schema) {
  const sanitized = {};
  
  for (const [key, rules] of Object.entries(schema)) {
    if (!(key in obj)) {
      if (rules.required) {
        throw new Error(`Missing required field: ${key}`);
      }
      continue;
    }
    
    const value = obj[key];
    
    switch (rules.type) {
      case 'string':
        sanitized[key] = sanitizeString(value, rules.maxLength);
        break;
      case 'email':
        sanitized[key] = sanitizeEmail(value);
        break;
      case 'number':
        sanitized[key] = sanitizeNumber(value, rules.min, rules.max);
        break;
      case 'url':
        sanitized[key] = sanitizeUrl(value);
        break;
      case 'boolean':
        sanitized[key] = Boolean(value);
        break;
      default:
        sanitized[key] = value;
    }
  }
  
  return sanitized;
}