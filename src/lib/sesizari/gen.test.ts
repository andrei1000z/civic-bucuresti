import { describe, it, expect } from "vitest";
import { detectGen, subsemnatulForm, domiciliatForm } from "./gen";

describe("detectGen — Romanian name gender detection", () => {
  it("detects masculine names from whitelist", () => {
    expect(detectGen("Ion Popescu")).toBe("masculin");
    expect(detectGen("Andrei Tiberiu")).toBe("masculin");
    expect(detectGen("Mihai Ionescu")).toBe("masculin");
    expect(detectGen("Ștefan Cel Mare")).toBe("masculin");
  });

  it("detects feminine names from whitelist", () => {
    expect(detectGen("Maria Popescu")).toBe("feminin");
    expect(detectGen("Ana Maria")).toBe("feminin");
    expect(detectGen("Elena Ionescu")).toBe("feminin");
    expect(detectGen("Mihaela Tudose")).toBe("feminin");
  });

  it("handles 'Last First' Romanian convention (last name first)", () => {
    expect(detectGen("Popescu Ion")).toBe("masculin");
    expect(detectGen("Popescu Maria")).toBe("feminin");
  });

  it("strips diacritics for lookup", () => {
    expect(detectGen("Stefan Cel Mare")).toBe("masculin"); // no diacritics
    expect(detectGen("Calin Ion")).toBe("masculin"); // călin → calin
    expect(detectGen("Catalina Popescu")).toBe("feminin"); // cătălina → catalina
  });

  it("uses heuristic fallback for names not in whitelist (-a ending)", () => {
    expect(detectGen("Aniela Necunoscuta")).toBe("feminin");
    expect(detectGen("Ileana Inventata")).toBe("feminin");
  });

  it("excludes male '-a' names from heuristic (Mircea, Luca, Toma)", () => {
    expect(detectGen("Mircea Necunoscut")).toBe("masculin");
    expect(detectGen("Luca Necunoscut")).toBe("masculin");
    expect(detectGen("Toma Necunoscut")).toBe("masculin");
  });

  it("falls back to masculine when nothing matches", () => {
    // Heuristic backstop — assumes masculine for ambiguous names.
    expect(detectGen("Xyz Qrs")).toBe("masculin");
  });

  it("handles empty / whitespace input", () => {
    expect(detectGen("")).toBe("masculin");
    expect(detectGen("  ")).toBe("masculin");
  });

  it("ignores short particles (< 3 chars) when looking up", () => {
    // "de" or "Sf" shouldn't match anything; falls back on real name parts.
    expect(detectGen("De Maria")).toBe("feminin");
    expect(detectGen("Sf Andrei")).toBe("masculin");
  });

  it("is case-insensitive", () => {
    expect(detectGen("ION POPESCU")).toBe("masculin");
    expect(detectGen("maria popescu")).toBe("feminin");
  });
});

describe("subsemnatulForm + domiciliatForm — formal letter gender agreement", () => {
  it("masculine forms", () => {
    expect(subsemnatulForm("masculin")).toBe("Subsemnatul");
    expect(domiciliatForm("masculin")).toBe("domiciliat");
  });

  it("feminine forms", () => {
    expect(subsemnatulForm("feminin")).toBe("Subsemnata");
    expect(domiciliatForm("feminin")).toBe("domiciliată");
  });
});
