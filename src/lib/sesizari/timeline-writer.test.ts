import { describe, expect, test, vi, beforeEach } from "vitest";
import { appendTimelineEvent } from "./timeline-writer";

/**
 * Lightweight Supabase client stand-in. We only stub the chains
 * `from(...).select(...).eq(...).order(...).limit(...).maybeSingle()`
 * (the dedup probe) and `from(...).insert(...)` (the write). Each test
 * primes the mocks for its specific scenario.
 */
function makeAdmin(opts: {
  latest: { event_type: string } | null;
  insertError?: { message: string };
}) {
  const insert = vi.fn(async () => ({ error: opts.insertError ?? null }));
  const maybeSingle = vi.fn(async () => ({ data: opts.latest, error: null }));

  const selectChain = {
    eq: vi.fn(() => selectChain),
    order: vi.fn(() => selectChain),
    limit: vi.fn(() => selectChain),
    maybeSingle,
  };
  const selectFn = vi.fn(() => selectChain);
  const fromFn = vi.fn(() => ({ select: selectFn, insert }));
  // The shape Supabase exposes is wider but we only touch these two
  // method paths, so the cast is safe for unit-test scope.
  return {
    admin: { from: fromFn } as unknown as Parameters<typeof appendTimelineEvent>[0]["admin"],
    insert,
    maybeSingle,
    fromFn,
  };
}

const SESIZARE_ID = "00000000-0000-0000-0000-000000000123";

describe("appendTimelineEvent — dedup vs. latest existing row", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("writes when there is no prior row", async () => {
    const m = makeAdmin({ latest: null });
    const out = await appendTimelineEvent({
      admin: m.admin,
      sesizareId: SESIZARE_ID,
      eventType: "actiune-autoritate",
      description: "Au amendat 22 mașini.",
    });
    expect(out).toEqual({ written: true });
    expect(m.insert).toHaveBeenCalledTimes(1);
  });

  test("skips when latest row has the same event_type AND new description is null", async () => {
    const m = makeAdmin({ latest: { event_type: "actiune-autoritate" } });
    const out = await appendTimelineEvent({
      admin: m.admin,
      sesizareId: SESIZARE_ID,
      eventType: "actiune-autoritate",
      description: null,
    });
    expect(out).toEqual({ written: false });
    expect(m.insert).not.toHaveBeenCalled();
  });

  test("skips when latest row has same event_type AND new description is generic", async () => {
    const m = makeAdmin({ latest: { event_type: "actiune-autoritate" } });
    const out = await appendTimelineEvent({
      admin: m.admin,
      sesizareId: SESIZARE_ID,
      eventType: "actiune-autoritate",
      description: "Status actualizat la: actiune-autoritate",
    });
    expect(out).toEqual({ written: false });
    expect(m.insert).not.toHaveBeenCalled();
  });

  test("skips when latest row has same event_type AND new description is empty string", async () => {
    const m = makeAdmin({ latest: { event_type: "rezolvat" } });
    const out = await appendTimelineEvent({
      admin: m.admin,
      sesizareId: SESIZARE_ID,
      eventType: "rezolvat",
      description: "   ",
    });
    expect(out).toEqual({ written: false });
    expect(m.insert).not.toHaveBeenCalled();
  });

  test("WRITES when latest row has same event_type but new description carries content", async () => {
    const m = makeAdmin({ latest: { event_type: "actiune-autoritate" } });
    const out = await appendTimelineEvent({
      admin: m.admin,
      sesizareId: SESIZARE_ID,
      eventType: "actiune-autoritate",
      description: "Au revenit pe teren și au amendat încă 7 mașini.",
    });
    expect(out).toEqual({ written: true });
    expect(m.insert).toHaveBeenCalledTimes(1);
  });

  test("WRITES when latest row has different event_type, even with generic description", async () => {
    const m = makeAdmin({ latest: { event_type: "inregistrata" } });
    const out = await appendTimelineEvent({
      admin: m.admin,
      sesizareId: SESIZARE_ID,
      eventType: "actiune-autoritate",
      description: null,
    });
    expect(out).toEqual({ written: true });
    expect(m.insert).toHaveBeenCalledTimes(1);
  });

  test("forwards createdAt override to the insert payload", async () => {
    const m = makeAdmin({ latest: null });
    const realWorldTime = "2026-04-30T16:45:00.000Z";
    await appendTimelineEvent({
      admin: m.admin,
      sesizareId: SESIZARE_ID,
      eventType: "interventie",
      description: "Au montat 8 stâlpișori.",
      createdAt: realWorldTime,
    });
    expect(m.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        sesizare_id: SESIZARE_ID,
        event_type: "interventie",
        description: "Au montat 8 stâlpișori.",
        created_at: realWorldTime,
      }),
    );
  });

  test("returns error when DB insert fails", async () => {
    const m = makeAdmin({ latest: null, insertError: { message: "constraint violation" } });
    const out = await appendTimelineEvent({
      admin: m.admin,
      sesizareId: SESIZARE_ID,
      eventType: "rezolvat",
      description: "fix",
    });
    expect(out.written).toBe(false);
    expect(out.error).toBe("constraint violation");
  });
});
