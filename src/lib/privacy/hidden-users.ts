// Privacy toggle: "hide my name on public sesizări".
// Stored in Upstash Redis as a SET of user IDs that opted in. No DB
// migration needed — works the moment this file ships. In-memory
// fallback keeps dev mode functional without Upstash.

import { Redis } from "@upstash/redis";

const KEY = "civia:privacy:hidden-users";

const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? Redis.fromEnv()
    : null;

// In-memory fallback (dev only) — persists for the process lifetime.
const memoryFallback = new Set<string>();

export async function setHideName(userId: string, hide: boolean): Promise<void> {
  if (!userId) return;
  if (!redis) {
    if (hide) memoryFallback.add(userId);
    else memoryFallback.delete(userId);
    return;
  }
  if (hide) await redis.sadd(KEY, userId);
  else await redis.srem(KEY, userId);
}

export async function getHideName(userId: string): Promise<boolean> {
  if (!userId) return false;
  if (!redis) return memoryFallback.has(userId);
  const res = await redis.sismember(KEY, userId);
  return Number(res) === 1;
}

/**
 * Batch variant — use when anonymizing a list of sesizări so we do one
 * round-trip instead of N. Returns the subset of userIds whose owners
 * opted into the flag.
 */
export async function getHiddenUserIds(userIds: string[]): Promise<Set<string>> {
  if (userIds.length === 0) return new Set();
  if (!redis) {
    return new Set(userIds.filter((id) => memoryFallback.has(id)));
  }
  // Upstash's SMISMEMBER returns an array of 0/1 in the same order.
  const flags = (await redis.smismember(KEY, userIds)) as number[];
  const hidden = new Set<string>();
  userIds.forEach((id, i) => {
    if (flags[i] === 1) hidden.add(id);
  });
  return hidden;
}
