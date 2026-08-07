const buckets = globalThis.__studiiRateLimits || new Map();
globalThis.__studiiRateLimits = buckets;

export function getClientId(request) {
  const forwarded = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim();
  return forwarded || request.headers.get('x-real-ip') || 'local';
}

export function enforceRateLimit(request, { limit, windowMs, scope }) {
  const now = Date.now();
  const key = `${scope}:${getClientId(request)}`;
  const existing = buckets.get(key);
  if (!existing || existing.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return null;
  }
  existing.count += 1;
  if (existing.count > limit) {
    const retryAfter = Math.max(1, Math.ceil((existing.resetAt - now) / 1000));
    return new Response(JSON.stringify({ error: 'Too many requests. Please wait and try again.' }), {
      status: 429,
      headers: { 'Content-Type': 'application/json', 'Retry-After': `${retryAfter}` },
    });
  }
  return null;
}

export function rejectCrossSite(request) {
  if (request.headers.get('sec-fetch-site') === 'cross-site') {
    return new Response(JSON.stringify({ error: 'Cross-site requests are not allowed.' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  return null;
}

export function rejectLargeBody(request, maxBytes) {
  const length = Number(request.headers.get('content-length') || 0);
  if (length > maxBytes) {
    return new Response(JSON.stringify({ error: 'Request is too large.' }), {
      status: 413,
      headers: { 'Content-Type': 'application/json' },
    });
  }
  return null;
}
