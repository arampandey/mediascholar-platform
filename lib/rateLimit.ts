// Best-effort in-memory limiter. On serverless each instance keeps its own
// counters, so this slows brute-force attempts rather than guaranteeing a cap.
const hits = new Map<string, { count: number; resetAt: number }>();

export function rateLimited(key: string, max = 8, windowMs = 15 * 60 * 1000): boolean {
  const now = Date.now();
  const entry = hits.get(key);
  if (!entry || entry.resetAt < now) {
    hits.set(key, { count: 1, resetAt: now + windowMs });
    if (hits.size > 5000) for (const [k, v] of hits) if (v.resetAt < now) hits.delete(k);
    return false;
  }
  entry.count++;
  return entry.count > max;
}
