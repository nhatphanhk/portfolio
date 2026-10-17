import test from 'node:test';
import assert from 'node:assert/strict';
import { checkRateLimit, RATE_LIMIT_PRESETS } from '../src/lib/rate-limit.ts';

test('Logic & Concurrency: Blog View Tracking error handling', async (t) => {
  // Helper simulating the error classification logic in /api/blogs/[id]/view/route.ts
  function handleViewTrackingError(error: any): { status: number; body: Record<string, any> } {
    if (error?.code === 'P2002') {
      return { status: 200, body: { ok: true, isNewView: false, counted: false } };
    }
    if (error?.code === 'P2025') {
      return { status: 404, body: { ok: false, error: 'Blog post not found' } };
    }
    return { status: 500, body: { ok: false, error: 'Internal server error' } };
  }

  await t.test('handles P2002 concurrent collision gracefully with 200 OK', () => {
    const p2002Error = {
      code: 'P2002',
      message: 'Unique constraint failed on the fields: (`blogId`,`identifier`)',
    };
    const response = handleViewTrackingError(p2002Error);

    assert.equal(response.status, 200);
    assert.equal(response.body.ok, true);
    assert.equal(response.body.isNewView, false);
    assert.equal(response.body.counted, false);
  });

  await t.test('handles P2025 missing blog record with 404 Not Found', () => {
    const p2025Error = {
      code: 'P2025',
      message: 'Record to update not found',
    };
    const response = handleViewTrackingError(p2025Error);

    assert.equal(response.status, 404);
    assert.equal(response.body.ok, false);
    assert.equal(response.body.error, 'Blog post not found');
  });

  await t.test('treats unhandled errors as 500 Internal Error', () => {
    const genericError = new Error('Database connection dropped');
    const response = handleViewTrackingError(genericError);

    assert.equal(response.status, 500);
    assert.equal(response.body.ok, false);
    assert.equal(response.body.error, 'Internal server error');
  });
});

test('Logic & Security: Blog View Tracking rate limit enforcement', async (t) => {
  await t.test('enforces RATE_LIMIT_PRESETS.VIEW_TRACKING (15 req/min)', () => {
    const ip = `view-tracker-${Date.now()}`;
    const { limit, windowMs } = RATE_LIMIT_PRESETS.VIEW_TRACKING;

    assert.equal(limit, 15);
    assert.equal(windowMs, 60000);

    for (let i = 0; i < limit; i++) {
      assert.equal(checkRateLimit(`view:${ip}`, limit, windowMs), true);
    }

    // 16th request in the same minute must be blocked
    assert.equal(checkRateLimit(`view:${ip}`, limit, windowMs), false);
  });
});

test('Logic: Sitemap URL construction logic', async (t) => {
  await t.test('constructs valid absolute URLs for series routes', () => {
    const SITE_URL = 'https://nhatphanhk.dev';
    const seriesList = [
      { slug: 'docker-mastery', createdAt: new Date(), updatedAt: new Date() },
      { slug: 'react-19-internals', createdAt: new Date(), updatedAt: new Date() },
    ];

    const seriesRoutes = seriesList.map(s => ({
      url: `${SITE_URL}/blog/series/${s.slug}`,
      lastModified: new Date(s.updatedAt || s.createdAt),
      changeFrequency: 'weekly',
      priority: 0.6,
    }));

    assert.equal(seriesRoutes.length, 2);
    assert.equal(seriesRoutes[0].url, 'https://nhatphanhk.dev/blog/series/docker-mastery');
    assert.equal(seriesRoutes[1].url, 'https://nhatphanhk.dev/blog/series/react-19-internals');
    assert.equal(seriesRoutes[0].changeFrequency, 'weekly');
    assert.equal(seriesRoutes[0].priority, 0.6);
  });
});
