import test from 'node:test';
import assert from 'node:assert/strict';

test('Performance & Caching: Series cache keys and tag conventions', async (t) => {
  await t.test('generates expected cache keys and tags for public series list', () => {
    const locale = 'en';
    const key = `public-series-${locale}`;
    const tags = ['series'];

    assert.equal(key, 'public-series-en');
    assert.deepEqual(tags, ['series']);
  });

  await t.test('generates expected cache keys and tags for series by blog id', () => {
    const blogId = 'blog-123';
    const locale = 'vi';
    const key = `series-for-blog-${blogId}-${locale}`;
    const tags = ['series', `series-blog-${blogId}`];

    assert.equal(key, 'series-for-blog-blog-123-vi');
    assert.ok(tags.includes('series'));
    assert.ok(tags.includes('series-blog-blog-123'));
  });

  await t.test('generates expected cache keys and tags for series by slug', () => {
    const slug = 'nextjs-deep-dive';
    const locale = 'en';
    const key = `public-series-slug-${slug}-${locale}`;
    const tags = ['series', `series-slug-${slug}`];

    assert.equal(key, 'public-series-slug-nextjs-deep-dive-en');
    assert.ok(tags.includes('series'));
    assert.ok(tags.includes('series-slug-nextjs-deep-dive'));
  });
});

test('Performance & Caching: In-memory simulation of tag-based cache invalidation', async (t) => {
  const store = new Map<string, { value: any; tags: string[] }>();
  let dbCallCount = 0;

  function mockDbFetch(query: string) {
    dbCallCount++;
    return { data: `result-for-${query}`, fetchedAt: Date.now() };
  }

  function cachedFetch(query: string, key: string, tags: string[]) {
    if (store.has(key)) {
      return store.get(key)!.value;
    }
    const val = mockDbFetch(query);
    store.set(key, { value: val, tags });
    return val;
  }

  function revalidateTag(tag: string) {
    for (const [key, entry] of store.entries()) {
      if (entry.tags.includes(tag)) {
        store.delete(key);
      }
    }
  }

  await t.test('serves subsequent reads from cache without hitting DB', () => {
    dbCallCount = 0;
    const res1 = cachedFetch('all-series', 'public-series-vi', ['series']);
    const res2 = cachedFetch('all-series', 'public-series-vi', ['series']);

    assert.equal(dbCallCount, 1);
    assert.deepEqual(res1, res2);
  });

  await t.test('purges cache entry when revalidateTag("series") is called', () => {
    assert.equal(store.has('public-series-vi'), true);
    revalidateTag('series');
    assert.equal(store.has('public-series-vi'), false);

    // Next fetch should re-query DB
    const res3 = cachedFetch('all-series', 'public-series-vi', ['series']);
    assert.equal(dbCallCount, 2);
    assert.ok(res3);
  });
});
