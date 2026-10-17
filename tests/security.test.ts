import test from 'node:test';
import assert from 'node:assert/strict';
import { isSafePublicUrl, checkRateLimit, RATE_LIMIT_PRESETS } from '../src/lib/rate-limit.ts';
import { sanitizeBasicServer } from '../src/lib/blog-utils.ts';

test('Security: isSafePublicUrl SSRF Protection', async (t) => {
  await t.test('allows valid public HTTP and HTTPS URLs', () => {
    assert.equal(isSafePublicUrl('https://images.unsplash.com/photo-12345'), true);
    assert.equal(isSafePublicUrl('http://example.com/document.pdf'), true);
    assert.equal(isSafePublicUrl('https://github.com/my-org/repo'), true);
  });

  await t.test('blocks non-HTTP/HTTPS protocols', () => {
    assert.equal(isSafePublicUrl('ftp://example.com/file'), false);
    assert.equal(isSafePublicUrl('file:///etc/passwd'), false);
    assert.equal(isSafePublicUrl('javascript:alert(1)'), false);
    assert.equal(isSafePublicUrl('data:text/html,<h1>XSS</h1>'), false);
  });

  await t.test('blocks localhost and loopback addresses', () => {
    assert.equal(isSafePublicUrl('http://localhost:3000/api'), false);
    assert.equal(isSafePublicUrl('http://127.0.0.1:8080'), false);
    assert.equal(isSafePublicUrl('http://127.0.0.2'), false);
    assert.equal(isSafePublicUrl('http://[::1]'), false);
  });

  await t.test('blocks AWS / cloud metadata service', () => {
    assert.equal(isSafePublicUrl('http://169.254.169.254/latest/meta-data'), false);
  });

  await t.test('blocks private RFC 1918 IPv4 ranges', () => {
    assert.equal(isSafePublicUrl('http://10.0.0.1/admin'), false);
    assert.equal(isSafePublicUrl('http://10.255.255.255'), false);
    assert.equal(isSafePublicUrl('http://192.168.1.1/router'), false);
    assert.equal(isSafePublicUrl('http://172.16.0.1/internal'), false);
    assert.equal(isSafePublicUrl('http://172.24.1.1'), false);
    assert.equal(isSafePublicUrl('http://172.31.255.255'), false);
  });

  await t.test('allows public IPs outside private ranges', () => {
    assert.equal(isSafePublicUrl('http://8.8.8.8/dns'), true);
    assert.equal(isSafePublicUrl('http://1.1.1.1'), true);
    assert.equal(isSafePublicUrl('http://172.15.0.1'), true);
    assert.equal(isSafePublicUrl('http://172.32.0.1'), true);
  });

  await t.test('blocks malformed and empty URLs', () => {
    assert.equal(isSafePublicUrl(''), false);
    assert.equal(isSafePublicUrl('not a url'), false);
    assert.equal(isSafePublicUrl('//relative/path'), false);
  });
});

test('Security: checkRateLimit in-memory sliding window', async (t) => {
  await t.test('allows requests within limit and rejects above limit', () => {
    const key = `test-limit-${Date.now()}`;
    const limit = 3;
    const windowMs = 5000;

    assert.equal(checkRateLimit(key, limit, windowMs), true);
    assert.equal(checkRateLimit(key, limit, windowMs), true);
    assert.equal(checkRateLimit(key, limit, windowMs), true);
    // 4th request exceeds limit
    assert.equal(checkRateLimit(key, limit, windowMs), false);
  });

  await t.test('isolates limits across different keys', () => {
    const keyA = `user-a-${Date.now()}`;
    const keyB = `user-b-${Date.now()}`;
    const limit = 2;
    const windowMs = 5000;

    assert.equal(checkRateLimit(keyA, limit, windowMs), true);
    assert.equal(checkRateLimit(keyA, limit, windowMs), true);
    assert.equal(checkRateLimit(keyA, limit, windowMs), false);

    // keyB should still be permitted
    assert.equal(checkRateLimit(keyB, limit, windowMs), true);
  });

  await t.test('presets have expected configurations', () => {
    assert.equal(RATE_LIMIT_PRESETS.TRANSLATION.limit, 5);
    assert.equal(RATE_LIMIT_PRESETS.TRANSLATION.windowMs, 10 * 60 * 1000);

    assert.equal(RATE_LIMIT_PRESETS.VIEW_TRACKING.limit, 15);
    assert.equal(RATE_LIMIT_PRESETS.VIEW_TRACKING.windowMs, 60 * 1000);

    assert.equal(RATE_LIMIT_PRESETS.FORM_SUBMIT.limit, 5);
    assert.equal(RATE_LIMIT_PRESETS.UPLOAD.limit, 10);
  });
});

test('Security: sanitizeBasicServer SSR HTML protection', async (t) => {
  await t.test('strips <script> tags and embedded code', () => {
    const dirty = '<p>Normal text</p><script>alert("xss")</script><span>Safe</span>';
    const clean = sanitizeBasicServer(dirty);
    assert.equal(clean.includes('<script>'), false);
    assert.equal(clean.includes('alert("xss")'), false);
    assert.equal(clean.includes('<p>Normal text</p>'), true);
    assert.equal(clean.includes('<span>Safe</span>'), true);
  });

  await t.test('strips inline on* event handlers', () => {
    const dirty = '<img src="avatar.png" onload="malicious()" onerror="stealCookies()" />';
    const clean = sanitizeBasicServer(dirty);
    assert.equal(clean.includes('onload'), false);
    assert.equal(clean.includes('onerror'), false);
    assert.equal(clean.includes('malicious'), false);
  });

  await t.test('disarms javascript: protocol links', () => {
    const dirty = '<a href="javascript:alert(1)">Click me</a>';
    const clean = sanitizeBasicServer(dirty);
    assert.equal(clean.includes('javascript:'), false);
    assert.equal(clean.includes('blocked:alert(1)'), true);
  });

  await t.test('handles empty or blank string gracefully', () => {
    assert.equal(sanitizeBasicServer(''), '');
  });
});
