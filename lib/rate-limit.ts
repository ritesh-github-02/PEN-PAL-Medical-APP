/**
 * In-memory sliding-window rate limiter.
 *
 * Keys on `key` (e.g. IP address + action name).  Thread-safe for a single
 * Node.js process — safe for dev and single-instance serverless functions.
 * For multi-replica deployments add Redis as the backing store.
 */

interface BucketEntry {
  /** Timestamps (ms) of recent hits within the window */
  hits: number[];
}

const WINDOW_MS = 60_000; // 1 minute

/** Implementation-specific backing store (private) */
const _buckets = new Map<string, BucketEntry>();

/**
 * Check whether `key` has exceeded `maxHits` in the last `windowMs`.
 *
 * @returns  `allowed` — true if the request is within limits
 *           `retryAfterSeconds` — seconds to wait if blocked (0 if allowed)
 */
export function checkRateLimit(
  key: string,
  maxHits: number = 10,
  windowMs: number = WINDOW_MS,
): { allowed: boolean; retryAfterSeconds: number } {
  const now = Date.now();
  let entry = _buckets.get(key);

  if (!entry) {
    entry = { hits: [] };
    _buckets.set(key, entry);
  }

  // Expire old hits
  entry.hits = entry.hits.filter((ts) => now - ts < windowMs);

  const recentHits = entry.hits.length;

  if (recentHits >= maxHits) {
    const oldest = entry.hits[0];
    const retryMs = oldest + windowMs - now;
    return { allowed: false, retryAfterSeconds: Math.max(0, Math.ceil(retryMs / 1000)) };
  }

  entry.hits.push(now);
  return { allowed: true, retryAfterSeconds: 0 };
}

/**
 * Reset the limit for a given key (useful in tests).
 */
export function resetRateLimit(key: string): void {
  _buckets.delete(key);
}

/**
 * Periodic cleanup of stale buckets to prevent unbounded memory growth.
 * Call this from a timer (e.g. setInterval every 5 minutes in development).
 */
export function pruneRateLimits(olderThanMs: number = WINDOW_MS * 6): void {
  const now = Date.now();
  const expiredKeys: string[] = [];
  _buckets.forEach((entry, key) => {
    entry.hits = entry.hits.filter((ts) => now - ts < olderThanMs);
    if (entry.hits.length === 0) expiredKeys.push(key);
  });
  expiredKeys.forEach((k) => _buckets.delete(k));
}
