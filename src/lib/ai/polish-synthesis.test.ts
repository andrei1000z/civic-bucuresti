import { describe, expect, test } from "vitest";
import { polishSynthesis, polishSynthesisLine } from "./polish-synthesis";

describe("polishSynthesisLine", () => {
  test("capitalizes the first letter of a regular paragraph", () => {
    expect(polishSynthesisLine("petiția cere oprirea construcției."))
      .toBe("Petiția cere oprirea construcției.");
  });

  test("capitalizes inside a bullet (preserves the marker)", () => {
    expect(polishSynthesisLine("- oprirea proiectului imediat"))
      .toBe("- Oprirea proiectului imediat");
    expect(polishSynthesisLine("* doar 12% sunt rezolvate"))
      .toBe("* Doar 12% sunt rezolvate");
  });

  test("handles the leading bold wrapper without lowercasing the inner", () => {
    expect(polishSynthesisLine("**oprirea construcției pe Pasajul Unirii**"))
      .toBe("**Oprirea construcției pe Pasajul Unirii**");
  });

  test("Romanian diacritics are uppercased correctly (ș → Ș)", () => {
    expect(polishSynthesisLine("șoseaua are gropi adânci."))
      .toBe("Șoseaua are gropi adânci.");
    expect(polishSynthesisLine("- țăranii reclamă lipsa apei."))
      .toBe("- Țăranii reclamă lipsa apei.");
  });

  test("strips a dangling **", () => {
    expect(polishSynthesisLine("Termen: 30 zile **"))
      .toBe("Termen: 30 zile");
    // Even count stays intact.
    expect(polishSynthesisLine("Avem **două** instituții."))
      .toBe("Avem **două** instituții.");
  });

  test("normalizes section title to end with a single colon", () => {
    expect(polishSynthesisLine("Pe scurt"))
      .toBe("Pe scurt:");
    expect(polishSynthesisLine("De ce contează."))
      .toBe("De ce contează:");
    expect(polishSynthesisLine("Ce cere petiția::"))
      .toBe("Ce cere petiția:");
  });

  test("tightens whitespace before punctuation", () => {
    expect(polishSynthesisLine("Lege 544 / 2001 ,nicio amânare ."))
      .toBe("Lege 544 / 2001, nicio amânare.");
  });

  test("idempotent — a polished line passes through unchanged", () => {
    const polished = "Petiția cere **oprirea** construcției.";
    expect(polishSynthesisLine(polishSynthesisLine(polished))).toBe(polished);
  });

  test("leaves an already-correct sentence alone", () => {
    const ok = "Cetățenii cer **transparență** completă.";
    expect(polishSynthesisLine(ok)).toBe(ok);
  });
});

describe("polishSynthesis (multi-line)", () => {
  test("collapses runs of blank lines and trims edges", () => {
    const raw = "\n\nPetiția cere X.\n\n\n- oprire imediată\n\n";
    expect(polishSynthesis(raw)).toBe("Petiția cere X.\n\n- Oprire imediată");
  });

  test("polishes a realistic petitie synthesis end-to-end", () => {
    const raw = [
      "pe scurt",
      "petiția solicită oprirea construcției pe pasajul Unirii.",
      "",
      "ce cere petiția",
      "- oprirea construcției imediate",
      "- audit public al impactului",
      "",
      "de ce contează",
      "afectează 80.000 de locuitori .",
      "",
    ].join("\n");

    const out = polishSynthesis(raw);
    expect(out).toContain("Pe scurt:");
    expect(out).toContain("Ce cere petiția:");
    expect(out).toContain("De ce contează:");
    expect(out).toContain("- Oprirea construcției imediate");
    expect(out).toContain("Petiția solicită oprirea");
    expect(out).toContain("80.000 de locuitori.");
    expect(out).not.toMatch(/^\n/);
    expect(out).not.toMatch(/\n$/);
  });

  test("idempotent on the multi-line pass too", () => {
    const raw = "Lorem **ipsum** dolor.\n\n- sit amet\n- consectetur";
    expect(polishSynthesis(polishSynthesis(raw))).toBe(polishSynthesis(raw));
  });
});
