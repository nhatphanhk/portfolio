import { NextResponse } from 'next/server';
import { getApiDocs } from '@/lib/swagger';
import { checkRateLimit, getClientIp, RATE_LIMIT_PRESETS } from '@/lib/rate-limit';

export async function GET(req: Request) {
  try {
    const ip = getClientIp(req);
    if (!checkRateLimit(`swagger:${ip}`, RATE_LIMIT_PRESETS.DOCS_SPEC.limit, RATE_LIMIT_PRESETS.DOCS_SPEC.windowMs)) {
      return NextResponse.json({ error: 'Too many requests. Please try again later.' }, { status: 429 });
    }

    const spec = await getApiDocs();
    return NextResponse.json(spec);
  } catch (_error) {
    return NextResponse.json({ error: 'Failed to generate API docs' }, { status: 500 });
  }
}

