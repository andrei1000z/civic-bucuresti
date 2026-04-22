import { describe, it, expect } from "vitest";
import { buildFormalText, buildEmailPayload } from "./mailto";

const BASE = {
  tip: "parcare",
  titlu: "T",
  locatie: "Șoseaua Pantelimon 292",
  descriere: "d",
  author_name: "Eduard Andrei Mușat",
  author_address: "Strada Novaci 12, Sector 5",
};

describe("buildFormalText — identity rewrite", () => {
  it("does not duplicate the sector when address already contains a comma", () => {
    const aiText = `Bună ziua,

Mă numesc CineVrea Altcineva, locuiesc în Strada X 5, Sector 2, București și doresc să vă aduc la cunoștință o problemă.

Mulțumesc.

Cu stimă,
CineVrea Altcineva
20 martie 2024`;
    const out = buildFormalText({ ...BASE, formal_text: aiText });
    // Exactly one "Sector 5" — not "Sector 5, Sector 5"
    const matches = out.match(/Sector 5/g) ?? [];
    expect(matches.length).toBe(1);
    expect(out).toContain("Mă numesc Eduard Andrei Mușat");
    expect(out).toContain("locuiesc în Strada Novaci 12, Sector 5");
    // Tail ("și doresc...") must survive
    expect(out).toMatch(/și\s+doresc/);
  });

  it("handles long multi-comma addresses without leaking commas", () => {
    const aiText = `Bună ziua,

Mă numesc Altcineva, locuiesc pe Str. A 1, bl. X, ap. 2, Sector 1 și doresc să vă aduc la cunoștință.

Cu stimă,
Altcineva
20 martie 2024`;
    const out = buildFormalText({
      ...BASE,
      author_address: "Bulevardul Lung nr. 44, bl. B12, sc. 2, ap. 15, Sector 3",
      formal_text: aiText,
    });
    // No trailing comma-cascade
    expect(out).not.toMatch(/Sector 1,\s*Sector 3/);
    expect(out).not.toMatch(/ap\. 2,\s*Bulevardul/);
    expect(out).toContain("locuiesc în Bulevardul Lung nr. 44, bl. B12, sc. 2, ap. 15, Sector 3");
  });

  it("rewrites legacy Subsemnatul opener into the new style", () => {
    const aiText = `Bună ziua,

Subsemnatul Altcineva, domiciliat în Str. Veche 8, Sector 4, vă adresez prezenta sesizare în temeiul OG 27/2002.

Cu respect,
Altcineva
20 martie 2024`;
    const out = buildFormalText({ ...BASE, formal_text: aiText });
    expect(out).not.toContain("Subsemnatul");
    expect(out).toContain("Mă numesc Eduard Andrei Mușat");
    expect(out).toContain("Strada Novaci 12, Sector 5");
  });

  it("keeps punctuation when opener ends with a period instead of verb", () => {
    const aiText = `Bună ziua,

Mă numesc Altcineva, locuiesc în Str. Y 9, Sector 6.

În ultima perioadă am observat parcări ilegale.

Cu stimă,
Altcineva
20 martie 2024`;
    const out = buildFormalText({ ...BASE, formal_text: aiText });
    expect(out).toContain("locuiesc în Strada Novaci 12, Sector 5.");
    expect(out).toContain("În ultima perioadă am observat");
    expect(out).not.toMatch(/Sector 5,?\s*Sector 6/);
  });
});

describe("buildEmailPayload — parcare legal template", () => {
  it("uses the OUG 195/2002 template + plate-in-subject when parking context is supplied", () => {
    const p = buildEmailPayload({
      tip: "parcare",
      titlu: "Parcare pe trotuar",
      locatie: "Strada Matei Voievod 10, Sector 2",
      sector: "S2",
      lat: 44.441,
      lng: 26.123,
      descriere: "Mașină parcată pe trotuar de o săptămână.",
      author_name: "Eduard Andrei Mușat",
      author_address: "Strada Novaci 12, Sector 5",
      imagini: ["https://x/a.jpg", "https://x/b.jpg"],
      parking: { plate: "B 123 ABC", jurisdiction: "trotuar" },
    });
    expect(p.subject).toMatch(/B 123 ABC/);
    expect(p.body).toMatch(/OUG 195\/2002/);
    expect(p.body).toMatch(/art\. 39 din OUG 195\/2002/);
    expect(p.body).toMatch(/B 123 ABC/);
    // Bold markers must be stripped from the plain-text mail body.
    expect(p.body).not.toMatch(/\[\[BOLD]]/);
  });

  it("picks Brigada Rutieră as primary when jurisdiction=banda", () => {
    const p = buildEmailPayload({
      tip: "parcare",
      titlu: "Parcare pe bandă",
      locatie: "Bd Magheru",
      sector: "S1",
      descriere: "x",
      author_name: "A",
      author_address: "B",
      parking: { plate: "B 1 AAA", jurisdiction: "banda" },
    });
    expect(p.to[0]).toBe("bpr@b.politiaromana.ro");
  });

  it("uses the user-picked observedAt (datetime-local string) in the body, to the minute", () => {
    const p = buildEmailPayload({
      tip: "parcare",
      titlu: "x",
      locatie: "Strada A 1, Sector 3",
      sector: "S3",
      descriere: "x",
      author_name: "A",
      author_address: "B",
      parking: {
        plate: "B 7 BBB",
        jurisdiction: "trotuar",
        observedAt: "2026-04-22T14:37",
      },
    });
    expect(p.body).toMatch(/22 aprilie 2026/);
    expect(p.body).toMatch(/la ora 14:37/);
  });

  it("applies Sector 5 override — strips dead S5 mailboxes, keeps PL București", () => {
    const p = buildEmailPayload({
      tip: "parcare",
      titlu: "Parcare pe trotuar S5",
      locatie: "Calea 13 Septembrie 120, Sector 5",
      sector: "S5",
      descriere: "x",
      author_name: "A",
      author_address: "B",
      parking: { plate: "B 42 ABC", jurisdiction: "trotuar" },
    });
    expect(p.to).toContain("primarie@sector5.ro");
    expect(p.to).not.toContain("sesizari@sector5.ro");
    expect(p.to).not.toContain("office@politialocalasector5.ro");
    expect(p.to).toContain("office@plmb.ro");
  });
});
