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
 * Extracts the client IP from request headers.
 *
 * Order matters: `x-vercel-forwarded-for` / `x-forwarded-for` are set by the Vercel edge and
 * cannot be forged by the client, whereas `cf-connecting-ip` is only trustworthy behind
 * Cloudflare (which this deployment is not), so it is consulted last. Returns 'unknown' when
 * no header is present so callers never store a fake loopback address.
 */
export function getClientIp(req: Request): string {
  const headers = req.headers;
  const candidates = [
    headers.get('x-vercel-forwarded-for'),
    headers.get('x-forwarded-for'),
    headers.get('x-real-ip'),
    headers.get('cf-connecting-ip'),
  ];
  for (const value of candidates) {
    const first = value?.split(',')[0]?.trim();
    if (first) return first;
  }
  return 'unknown';
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
  /** Site-wide page-view beacon (/api/track): 60 requests per minute */
  PAGE_VIEW: { limit: 60, windowMs: 60 * 1000 },
  /** File upload: 10 requests per 5 minutes */
  UPLOAD: { limit: 10, windowMs: 5 * 60 * 1000 },
  /** Credentials sign-in attempts: 10 per 15 minutes */
  LOGIN: { limit: 10, windowMs: 15 * 60 * 1000 },
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
      hostname.endsWith('.localhost') ||
      hostname.startsWith('0.') || // 0.0.0.0/8 ("this" network)
      hostname.startsWith('127.') || // Loopback 127.0.0.0/8
      hostname === '::1' ||
      hostname === '[::1]' ||
      hostname.startsWith('[::ffff:') || // IPv4-mapped IPv6
      hostname.startsWith('[fc') || // IPv6 unique-local fc00::/7
      hostname.startsWith('[fd') ||
      hostname.startsWith('[fe80') || // IPv6 link-local
      hostname.startsWith('10.') ||
      hostname.startsWith('192.168.') ||
      hostname.startsWith('169.254.') || // Cloud metadata (AWS, GCP, Azure)
      hostname.endsWith('.internal') ||
      hostname.endsWith('.local') ||
      hostname.endsWith('.nip.io') ||
      hostname.endsWith('.sslip.io')
    ) {
      return false;
    }

    // Carrier-grade NAT 100.64.0.0/10
    const octets = hostname.split('.');
    if (octets.length === 4 && octets[0] === '100') {
      const second = parseInt(octets[1], 10);
      if (!isNaN(second) && second >= 64 && second <= 127) return false;
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

