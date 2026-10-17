interface RateLimitRecord {
  count: number;
  resetAt: number;
}

// In-Memory store for tracking request counts per key/IP
const rateLimitStore = new Map<string, RateLimitRecord>();

// Periodic garbage collection to prevent memory leaks in long-running processes
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000; // Run every 5 minutes
let lastCleanup = Date.now();

function cleanupExpiredRecords(now: number): void {
  if (now - lastCleanup < CLEANUP_INTERVAL_MS && rateLimitStore.size < 1000) {
    return;
  }
  lastCleanup = now;

  for (const [key, record] of rateLimitStore.entries()) {
    if (now > record.resetAt) {
      rateLimitStore.delete(key);
    }
  }
}

/**
 * Checks if a request exceeds the specified rate limit.
 *
 * @param key Unique identifier for the client (e.g. IP address, user ID, or endpoint:IP)
 * @param limit Maximum number of allowed requests within the window
 * @param windowMs Time window in milliseconds
 * @returns boolean `true` if allowed, `false` if rate limit is exceeded
 */
export function checkRateLimit(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  cleanupExpiredRecords(now);

  const record = rateLimitStore.get(key);

  if (!record || now > record.resetAt) {
    // New window
    rateLimitStore.set(key, {
      count: 1,
      resetAt: now + windowMs,
    });
    return true;
  }

  if (record.count >= limit) {
    return false; // Rate limit exceeded
  }

  record.count += 1;
  return true;
}

/**
 * Extracts client IP safely from request headers.
 * Checks Cloudflare, standard proxies, and fallbacks.
 */
export function getClientIp(req: Request): string {
  const headers = req.headers;
  const cfConnectingIp = headers.get('cf-connecting-ip');
  if (cfConnectingIp) return cfConnectingIp.trim();

  const forwardedFor = headers.get('x-forwarded-for');
  if (forwardedFor) {
    const firstIp = forwardedFor.split(',')[0]?.trim();
    if (firstIp) return firstIp;
  }

  const realIp = headers.get('x-real-ip');
  if (realIp) return realIp.trim();

  return '127.0.0.1';
}

/**
 * Predefined rate limit presets for common application endpoints
 */
export const RATE_LIMIT_PRESETS = {
  /** Contact & Visitor form submission: 5 requests per 10 minutes */
  FORM_SUBMIT: { limit: 5, windowMs: 10 * 60 * 1000 },
  /** Gemini AI resume parsing: 5 requests per 10 minutes */
  AI_PARSING: { limit: 5, windowMs: 10 * 60 * 1000 },
  /** Gemini AI content translation: 5 requests per 10 minutes */
  TRANSLATION: { limit: 5, windowMs: 10 * 60 * 1000 },
  /** Unique blog view tracking: 15 requests per minute */
  VIEW_TRACKING: { limit: 15, windowMs: 60 * 1000 },
  /** File upload: 10 requests per 5 minutes */
  UPLOAD: { limit: 10, windowMs: 5 * 60 * 1000 },
  /** Admin account setup: 3 requests per 15 minutes */
  ADMIN_SETUP: { limit: 3, windowMs: 15 * 60 * 1000 },
  /** Swagger API spec: 30 requests per minute */
  DOCS_SPEC: { limit: 30, windowMs: 60 * 1000 },
} as const;

/**
 * Validates external URLs against private, internal, or cloud metadata IP ranges to prevent SSRF.
 */
export function isSafePublicUrl(urlString: string): boolean {
  try {
    const url = new URL(urlString);
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return false;
    const hostname = url.hostname.toLowerCase();
    if (
      hostname === 'localhost' ||
      hostname === '0.0.0.0' ||
      hostname.startsWith('127.') || // Loopback 127.0.0.0/8
      hostname === '::1' ||
      hostname === '[::1]' ||
      hostname.startsWith('10.') ||
      hostname.startsWith('192.168.') ||
      hostname.startsWith('169.254.') || // Cloud metadata (AWS, GCP, Azure)
      hostname.endsWith('.internal') ||
      hostname.endsWith('.local')
    ) {
      return false;
    }

    // Check 172.16.0.0 - 172.31.255.255
    const parts = hostname.split('.');
    if (parts.length === 4 && parts[0] === '172') {
      const second = parseInt(parts[1], 10);
      if (!isNaN(second) && second >= 16 && second <= 31) {
        return false;
      }
    }

    return true;
  } catch {
    return false;
  }
}

