import { describe, it, expect } from "vitest";
import { getAuthoritiesFor } from "./authorities";

describe("getAuthoritiesFor — parcare jurisdiction split", () => {
  it("routes 'trotuar' parking to local police (PL sector + PL Bucharest)", () => {
    const r = getAuthoritiesFor("parcare", "S3", "B", "Strada Matei Voievod 12, Sector 3", {
      jurisdiction: "trotuar",
    });
    const emails = r.primary.map((a) => a.email);
    expect(emails).toContain("office@plmb.ro");
    expect(emails).toContain("secretariat.dgpl@primarie3.ro"); // PL S3
    expect(emails.some((e) => e.includes("brigada") || e.includes("bpr@b."))).toBe(false);
  });

  it("routes 'banda' parking to Brigada Rutieră in primary, PL Bucharest second", () => {
    const r = getAuthoritiesFor("parcare", "S3", "B", "Bd Magheru", {
      jurisdiction: "banda",
    });
    const emails = r.primary.map((a) => a.email);
    expect(emails[0]).toBe("bpr@b.politiaromana.ro");
    expect(emails).toContain("office@plmb.ro");
  });
});

describe("getAuthoritiesFor — Sector 5 override", () => {
  it("replaces every Sector 5 address with primarie@sector5.ro on parking sesizări", () => {
    const r = getAuthoritiesFor("parcare", "S5", "B", "Calea 13 Septembrie", {
      jurisdiction: "trotuar",
    });
    const emails = r.primary.map((a) => a.email);
    expect(emails).toContain("primarie@sector5.ro");
    // None of the known-dead S5 addresses should still be in the list.
    expect(emails).not.toContain("sesizari@sector5.ro");
    expect(emails).not.toContain("office@politialocalasector5.ro");
  });

  it("keeps non-S5 addresses (PL Bucharest, Brigada Rutieră) after the S5 override", () => {
    const r = getAuthoritiesFor("parcare", "S5", "B", "Calea 13 Septembrie", {
      jurisdiction: "banda",
    });
    const emails = r.primary.map((a) => a.email);
    expect(emails).toContain("primarie@sector5.ro");
    expect(emails).toContain("bpr@b.politiaromana.ro");
    expect(emails).toContain("office@plmb.ro");
  });

  it("detects Sector 5 from location text when sector flag is missing", () => {
    const r = getAuthoritiesFor("parcare", null, "B", "Strada Ana Ipătescu, Sector 5", {
      jurisdiction: "trotuar",
    });
    expect(r.primary.map((a) => a.email)).toContain("primarie@sector5.ro");
  });

  it("does NOT rewrite other sectors when Sector 5 is not involved", () => {
    const r = getAuthoritiesFor("parcare", "S3", "B", "Strada Mihai Bravu", {
      jurisdiction: "trotuar",
    });
    expect(r.primary.map((a) => a.email)).not.toContain("primarie@sector5.ro");
  });
});
