import { describe, it, expect } from "vitest";
import {
  INTRERUPERI,
  getInterruptionById,
  getInterruptionsForCounty,
  getActiveInterruptions,
  toIcsVEvent,
  toIcsCalendar,
  TYPE_LABELS,
  STATUS_LABELS,
} from "./intreruperi";

describe("intreruperi — data integrity", () => {
  it("toate entries au câmpuri obligatorii", () => {
    for (const i of INTRERUPERI) {
      expect(i.id, "id missing").toBeTruthy();
      expect(i.type, `${i.id}: type missing`).toBeTruthy();
      expect(i.status, `${i.id}: status missing`).toBeTruthy();
      expect(i.provider, `${i.id}: provider missing`).toBeTruthy();
      expect(i.reason, `${i.id}: reason missing`).toBeTruthy();
      expect(i.addresses, `${i.id}: addresses missing`).toBeTruthy();
      expect(i.addresses.length, `${i.id}: addresses empty`).toBeGreaterThan(0);
      expect(i.county, `${i.id}: county missing`).toBeTruthy();
      expect(i.startAt, `${i.id}: startAt missing`).toBeTruthy();
      expect(i.endAt, `${i.id}: endAt missing`).toBeTruthy();
    }
  });

  it("toate ID-urile sunt unice", () => {
    const ids = INTRERUPERI.map((i) => i.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("startAt < endAt pentru toate entries", () => {
    for (const i of INTRERUPERI) {
      const start = new Date(i.startAt).getTime();
      const end = new Date(i.endAt).getTime();
      expect(end, `${i.id}: endAt trebuie să fie după startAt`).toBeGreaterThan(start);
    }
  });

  it("type-urile sunt din enum-ul cunoscut", () => {
    const validTypes = Object.keys(TYPE_LABELS);
    for (const i of INTRERUPERI) {
      expect(validTypes, `${i.id}: type invalid`).toContain(i.type);
    }
  });

  it("status-urile sunt din enum-ul cunoscut", () => {
    const validStatuses = Object.keys(STATUS_LABELS);
    for (const i of INTRERUPERI) {
      expect(validStatuses, `${i.id}: status invalid`).toContain(i.status);
    }
  });

  it("lat/lng (când există) sunt în România", () => {
    for (const i of INTRERUPERI) {
      if (i.lat != null) {
        expect(i.lat, `${i.id}: lat în afara RO`).toBeGreaterThanOrEqual(43.5);
        expect(i.lat, `${i.id}: lat în afara RO`).toBeLessThanOrEqual(48.3);
      }
      if (i.lng != null) {
        expect(i.lng, `${i.id}: lng în afara RO`).toBeGreaterThanOrEqual(20.2);
        expect(i.lng, `${i.id}: lng în afara RO`).toBeLessThanOrEqual(29.7);
      }
    }
  });
});

describe("intreruperi — helpers", () => {
  it("getInterruptionById găsește entry existent", () => {
    const first = INTRERUPERI[0];
    expect(first).toBeDefined();
    if (!first) return;
    const found = getInterruptionById(first.id);
    expect(found).toEqual(first);
  });

  it("getInterruptionById returnează null pentru id inexistent", () => {
    expect(getInterruptionById("inexistent-xyz-123")).toBeNull();
  });

  it("getInterruptionsForCounty filtrează corect case-insensitive", () => {
    const b = getInterruptionsForCounty("B");
    const bLower = getInterruptionsForCounty("b");
    expect(b.length).toBe(bLower.length);
    expect(b.every((i) => i.county === "B")).toBe(true);
  });

  it("getActiveInterruptions exclude cele finalizate/anulate/expirate", () => {
    const active = getActiveInterruptions();
    for (const i of active) {
      expect(i.status).not.toBe("finalizat");
      expect(i.status).not.toBe("anulat");
      expect(new Date(i.endAt).getTime()).toBeGreaterThanOrEqual(Date.now() - 1000);
    }
  });

  it("getActiveInterruptions pune in-desfasurare primele", () => {
    const active = getActiveInterruptions();
    let sawScheduled = false;
    for (const i of active) {
      if (i.status === "programat") sawScheduled = true;
      else if (i.status === "in-desfasurare") {
        expect(sawScheduled, "in-desfasurare trebuie să fie înaintea celor programate").toBe(false);
      }
    }
  });
});

describe("intreruperi — ICS export", () => {
  it("toIcsVEvent produce format VEVENT valid", () => {
    const item = INTRERUPERI[0];
    if (!item) return;
    const ics = toIcsVEvent(item);
    expect(ics).toContain("BEGIN:VEVENT");
    expect(ics).toContain("END:VEVENT");
    expect(ics).toContain(`UID:${item.id}@civia.ro`);
    expect(ics).toContain("DTSTART:");
    expect(ics).toContain("DTEND:");
    expect(ics).toContain("SUMMARY:");
  });

  it("toIcsCalendar produce VCALENDAR cu toate eventele", () => {
    const subset = INTRERUPERI.slice(0, 3);
    const ics = toIcsCalendar(subset);
    expect(ics).toMatch(/^BEGIN:VCALENDAR\r?\n/);
    expect(ics).toContain("VERSION:2.0");
    expect(ics).toContain("X-WR-TIMEZONE:Europe/Bucharest");
    expect(ics.match(/BEGIN:VEVENT/g)?.length).toBe(3);
    expect(ics.match(/END:VEVENT/g)?.length).toBe(3);
    expect(ics).toMatch(/END:VCALENDAR\r?\n?$/);
  });

  it("ICS escape-uiește corect caractere speciale", () => {
    const fake = {
      id: "test-escape",
      type: "apa" as const,
      status: "programat" as const,
      provider: "Test; Corp, Inc.\nNewline",
      reason: "Test, reason; with\nnewline",
      addresses: ["Str. Test, nr. 1\\"],
      county: "B",
      startAt: "2026-05-01T10:00:00Z",
      endAt: "2026-05-01T12:00:00Z",
    };
    const ics = toIcsVEvent(fake);
    // Commas and semicolons escaped, newlines as \n
    expect(ics).toContain("\\;");
    expect(ics).toContain("\\,");
    expect(ics).not.toMatch(/Test,\s/);
  });
});
