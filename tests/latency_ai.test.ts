import test from 'node:test';
import assert from 'node:assert/strict';
import { isUnrecoverableGeminiError } from '../src/lib/gemini-errors.ts';
import { checkRateLimit, RATE_LIMIT_PRESETS } from '../src/lib/rate-limit.ts';

test('Latency & AI: isUnrecoverableGeminiError classification', async (t) => {
  await t.test('flags HTTP 400, 401, 403 as unrecoverable to prevent pointless multi-model retries', () => {
    assert.equal(isUnrecoverableGeminiError(400), true);
    assert.equal(isUnrecoverableGeminiError(401), true);
    assert.equal(isUnrecoverableGeminiError(403), true);
  });

  await t.test('flags unrecoverable Gemini error statuses', () => {
    assert.equal(isUnrecoverableGeminiError(200, { error: { status: 'PERMISSION_DENIED' } }), true);
    assert.equal(isUnrecoverableGeminiError(200, { error: { status: 'UNAUTHENTICATED' } }), true);
    assert.equal(isUnrecoverableGeminiError(200, { error: { status: 'INVALID_ARGUMENT' } }), true);
  });

  await t.test('flags invalid API key and quota messages', () => {
    assert.equal(
      isUnrecoverableGeminiError(200, { error: { message: 'API key not valid. Please pass a valid API key.' } }),
      true
    );
    assert.equal(
      isUnrecoverableGeminiError(200, { message: 'Permission denied on resource' }),
      true
    );
    assert.equal(
      isUnrecoverableGeminiError(200, { error: { message: 'Quota exceeded for quota metric' } }),
      true
    );
  });

  await t.test('allows transient server or network errors to attempt candidate model fallback', () => {
    assert.equal(isUnrecoverableGeminiError(500, { error: { message: 'Internal server error' } }), false);
    assert.equal(isUnrecoverableGeminiError(503, { error: { message: 'Service unavailable' } }), false);
    assert.equal(isUnrecoverableGeminiError(504, { error: { message: 'Gateway timeout' } }), false);
    assert.equal(isUnrecoverableGeminiError(0, { message: 'Connection reset by peer' }), false);
  });
});

test('Latency & AI: Translation Rate Limiting & Fast Failure', async (t) => {
  await t.test('enforces RATE_LIMIT_PRESETS.TRANSLATION limits', () => {
    const ip = `test-translator-${Date.now()}`;
    const { limit, windowMs } = RATE_LIMIT_PRESETS.TRANSLATION;

    for (let i = 0; i < limit; i++) {
      assert.equal(checkRateLimit(`translate:${ip}`, limit, windowMs), true);
    }
    // limit + 1 must be blocked
    assert.equal(checkRateLimit(`translate:${ip}`, limit, windowMs), false);
  });

  await t.test('fail-fast guard triggers on simulated invalid API key error', () => {
    const errorPayload = {
      error: {
        code: 400,
        message: 'API key not valid. Please pass a valid API key.',
        status: 'INVALID_ARGUMENT',
      },
    };
    const shouldAbort = isUnrecoverableGeminiError(400, errorPayload);
    assert.equal(shouldAbort, true);
  });
});

