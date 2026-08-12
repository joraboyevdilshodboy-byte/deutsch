type RateLimitConfig = {
  maxRequests: number;
  windowMs: number;
};

type Bucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, Bucket>();

export function getClientIp(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for") ?? "";
  const realIp = request.headers.get("x-real-ip") ?? "";
  const ip = forwardedFor.split(",")[0]?.trim() || realIp.trim() || "unknown";
  return ip || "unknown";
}

export function enforceRateLimit(key: string, config: RateLimitConfig) {
  const { maxRequests, windowMs } = config;
  const now = Date.now();
  const entry = buckets.get(key);

  if (!entry || now >= entry.resetAt) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1, retryAfterMs: 0 };
  }

  if (entry.count >= maxRequests) {
    const retryAfterMs = Math.max(1000, entry.resetAt - now);
    return { allowed: false, remaining: 0, retryAfterMs };
  }

  entry.count += 1;
  buckets.set(key, entry);
  return {
    allowed: true,
    remaining: maxRequests - entry.count,
    retryAfterMs: 0,
  };
}

export function rateLimitResponse(retryAfterMs: number) {
  return new Response(
    JSON.stringify({
      error: "Juda ko'p so'rov yubordingiz. Biroz kutib, keyin qayta urinib ko'ring.",
    }),
    {
      status: 429,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Retry-After": String(Math.max(1, Math.ceil(retryAfterMs / 1000))),
      },
    },
  );
}
