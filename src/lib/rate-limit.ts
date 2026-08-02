const rateLimitStore = new Map<string, { count: number; expiresAt: number }>();

export function checkRateLimit(ip: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const record = rateLimitStore.get(ip);

  if (!record) {
    rateLimitStore.set(ip, { count: 1, expiresAt: now + windowMs });
    return true; // Allowed
  }

  if (now > record.expiresAt) {
    // Reset window
    rateLimitStore.set(ip, { count: 1, expiresAt: now + windowMs });
    return true; // Allowed
  }

  if (record.count >= limit) {
    return false; // Rate limited
  }

  record.count += 1;
  return true; // Allowed
}
