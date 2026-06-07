import { Redis } from "@upstash/redis";

let redis: Redis | null = null;

function getRedis(): Redis {
  if (!redis) {
    redis = new Redis({
      url: process.env.UPSTASH_REDIS_REST_URL!,
      token: process.env.UPSTASH_REDIS_REST_TOKEN!,
    });
  }
  return redis;
}

export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    const r = getRedis();
    return await r.get<T>(key);
  } catch {
    return null;
  }
}

export async function cacheSet(key: string, value: unknown, ttlSeconds: number) {
  try {
    const r = getRedis();
    await r.set(key, value, { ex: ttlSeconds });
  } catch {
    // silent — cache is best-effort
  }
}

export async function cacheIncr(key: string, ttlSeconds: number): Promise<number> {
  try {
    const r = getRedis();
    const count = await r.incr(key);
    if (count === 1) await r.expire(key, ttlSeconds);
    return count;
  } catch {
    // Redis unavailable — allow the request (don't block users when cache is down)
    return 0;
  }
}
