export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSeconds: number;
}

export class SlidingWindowLimiter {
  private readonly hits = new Map<string, number[]>();

  constructor(
    private readonly limit: number,
    private readonly windowMs: number,
    private readonly now: () => number = Date.now,
  ) {}

  consume(key: string): RateLimitResult {
    const now = this.now();
    const cutoff = now - this.windowMs;
    const active = (this.hits.get(key) ?? []).filter((time) => time > cutoff);
    if (active.length >= this.limit) {
      this.hits.set(key, active);
      return {
        allowed: false,
        remaining: 0,
        retryAfterSeconds: Math.max(1, Math.ceil((active[0] + this.windowMs - now) / 1000)),
      };
    }
    active.push(now);
    this.hits.set(key, active);
    return {
      allowed: true,
      remaining: this.limit - active.length,
      retryAfterSeconds: 0,
    };
  }

  clear(): void {
    this.hits.clear();
  }
}
