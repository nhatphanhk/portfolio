import { PrismaClient } from '@/generated/prisma/client';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function getNormalizedDbUrl(rawUrl: string): string {
  try {
    const parsed = new URL(rawUrl);
    const sslmode = parsed.searchParams.get('sslmode');
    if (sslmode === 'require' && !parsed.searchParams.has('uselibpqcompat')) {
      parsed.searchParams.set('uselibpqcompat', 'true');
      return parsed.toString();
    }
  } catch {
    // Fallback if URL parsing fails
  }
  return rawUrl;
}

function createPrismaClient(): PrismaClient {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error('DATABASE_URL environment variable is not set');
  }
  const pool = new Pool({
    connectionString: getNormalizedDbUrl(url),
    max: process.env.NODE_ENV === 'production' ? 2 : 5,
    idleTimeoutMillis: 15000,
    connectionTimeoutMillis: 5000,
  });
  const adapter = new PrismaPg(pool);
  return new PrismaClient({
    adapter,
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'error', 'warn']
        : ['error'],
  });
}

function getClient(): PrismaClient {
  if (!globalForPrisma.prisma) {
    globalForPrisma.prisma = createPrismaClient();
  }
  return globalForPrisma.prisma;
}

// Lazy Proxy: client is only created on first actual database call,
// not at module import time — safe for static build without DATABASE_URL.
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop: string | symbol) {
    const client = getClient();
    const value = (client as unknown as Record<string | symbol, unknown>)[prop];
    return typeof value === 'function' ? (value as Function).bind(client) : value;
  },
});
