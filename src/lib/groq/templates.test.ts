import { describe, it, expect } from "vitest";
import { getTemplate, TEMPLATES } from "./templates";
import { SESIZARE_TIPURI } from "@/lib/constants";

describe("getTemplate", () => {
  it("returns the template for a known tip", () => {
    const t = getTemplate("groapa");
    expect(t.problema_ghid).toContain("groapă");
    expect(t.propunere).toContain("plombarea");
    expect(t.urgenta).toBe("urgentă");
  });

  it("falls back to 'altele' template for unknown tip", () => {
    const t = getTemplate("xyz-not-a-real-tip");
    expect(t).toEqual(TEMPLATES.altele);
  });

  it("falls back to 'altele' for empty / nullish input", () => {
    expect(getTemplate("")).toEqual(TEMPLATES.altele);
    expect(getTemplate(undefined as unknown as string)).toEqual(TEMPLATES.altele);
  });
});

describe("TEMPLATES — data integrity", () => {
  it("every template has problema_ghid and propunere", () => {
    for (const [tip, tmpl] of Object.entries(TEMPLATES)) {
      expect(tmpl.problema_ghid, `${tip}: problema_ghid lipsă`).toBeTruthy();
      expect(tmpl.propunere, `${tip}: propunere lipsă`).toBeTruthy();
      expect(tmpl.problema_ghid.length, `${tip}: problema_ghid prea scurtă`).toBeGreaterThan(20);
      expect(tmpl.propunere.length, `${tip}: propunere prea scurtă`).toBeGreaterThan(20);
    }
  });

  it("'altele' fallback exists (used by getTemplate fallback)", () => {
    expect(TEMPLATES.altele).toBeDefined();
  });

  it("urgenta values are from the valid enum when present", () => {
    const valid = ["normală", "urgentă", "critică"];
    for (const [tip, tmpl] of Object.entries(TEMPLATES)) {
      if (tmpl.urgenta != null) {
        expect(valid, `${tip}: urgenta invalid`).toContain(tmpl.urgenta);
      }
    }
  });

  it("every SESIZARE_TIPURI value has a matching template", () => {
    // Critical: a sesizare type without a template would silently fall back
    // to 'altele', producing a generic letter instead of one specific to the
    // problem class. This test catches that drift early.
    for (const tipMeta of SESIZARE_TIPURI) {
      expect(
        TEMPLATES[tipMeta.value],
        `Lipsă template pentru tipul "${tipMeta.value}" (${tipMeta.label})`,
      ).toBeDefined();
    }
  });

  it("templates reference Romanian-specific institutions/laws when relevant", () => {
    // Some templates name STB/Metrorex/HCGMB/ASAU explicitly; if these go
    // missing wholesale, something has gone wrong with the file.
    const allText = Object.values(TEMPLATES)
      .map((t) => `${t.problema_ghid} ${t.propunere}`)
      .join(" ");
    expect(allText).toMatch(/STB|Metrorex|HCGMB|ASAU|Poliți[ae]/);
  });
});
