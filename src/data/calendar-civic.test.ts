import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { getUpcomingEvents, CALENDAR_EVENTS } from "./calendar-civic";

describe("getUpcomingEvents — recurring auto-advance", () => {
  beforeEach(() => {
    // Pin clock to 2026-04-22 so past dates in the dataset reliably
    // trigger the recurring advance path (impozit 2026-03-31 is past,
    // should reappear as 2027-03-31).
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-22T12:00:00Z"));
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it("surfaces recurring deadlines from previous months as next-year occurrences", () => {
    const events = getUpcomingEvents(50);
    const impozit1 = events.find((e) => e.id === "tax-impozit-1");
    expect(impozit1).toBeDefined();
    // 2026-03-31 passed on this clock, expect advance to 2027-03-31
    expect(impozit1?.date).toBe("2027-03-31");
  });

  it("leaves future non-recurring events at their original date", () => {
    const events = getUpcomingEvents(50);
    const parlam = events.find((e) => e.id === "alegeri-parlamentare-2028");
    expect(parlam).toBeDefined();
    expect(parlam?.date).toBe("2028-11-01");
  });

  it("filters out past non-recurring events", () => {
    // A hypothetical: the dataset as-is has no past non-recurring
    // entries (all one-off entries are 2028+), so the filter just
    // needs to not break on them. Verify no ids like 2025-XX appear.
    const events = getUpcomingEvents(100);
    for (const e of events) {
      const end = new Date(e.endDate ?? e.date);
      expect(end.getTime()).toBeGreaterThanOrEqual(new Date("2026-04-22").getTime());
    }
  });

  it("returns events sorted ascending by date", () => {
    const events = getUpcomingEvents(20);
    for (let i = 1; i < events.length; i++) {
      const prev = events[i - 1];
      const curr = events[i];
      if (!prev || !curr) continue;
      expect(new Date(prev.date).getTime()).toBeLessThanOrEqual(new Date(curr.date).getTime());
    }
  });

  it("does not advance already-future recurring events", () => {
    const events = getUpcomingEvents(50);
    const cg = events.find((e) => e.id === "tax-impozit-2");
    expect(cg).toBeDefined();
    // 2026-09-30 is future from 2026-04-22, keep as-is
    expect(cg?.date).toBe("2026-09-30");
  });

  it("advances endDate alongside date on multi-day recurring", () => {
    // No multi-day recurring events in the dataset yet; smoke-test
    // that the advance function doesn't corrupt endDate for future
    // events that have one (PUG consultation 2026-05-01 to 06-30).
    const events = getUpcomingEvents(50);
    const pug = events.find((e) => e.id === "dezbatere-pug-2026");
    expect(pug).toBeDefined();
    expect(pug?.endDate).toBe("2026-06-30");
  });

  it("dataset has at least 12 events (sanity)", () => {
    expect(CALENDAR_EVENTS.length).toBeGreaterThanOrEqual(12);
  });
});
