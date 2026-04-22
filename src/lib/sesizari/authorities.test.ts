import { describe, it, expect } from "vitest";
import { getAuthoritiesFor, PRIMARII_SECTOR, POLITIA_LOCALA_SECTOR } from "./authorities";

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

describe("Sector 5 — dead addresses removed, working ones kept", () => {
  it("PRIMARII_SECTOR.S5 uses primarie@sector5.ro (not the dead sesizari@)", () => {
    expect(PRIMARII_SECTOR.S5?.email).toBe("primarie@sector5.ro");
    expect(PRIMARII_SECTOR.S5?.email).not.toBe("sesizari@sector5.ro");
  });

  it("POLITIA_LOCALA_SECTOR.S5 uses politialocala@sector5.ro (not the dead office@politialocalasector5.ro)", () => {
    expect(POLITIA_LOCALA_SECTOR.S5?.email).toBe("politialocala@sector5.ro");
    expect(POLITIA_LOCALA_SECTOR.S5?.email).not.toBe("office@politialocalasector5.ro");
  });
});

describe("getAuthoritiesFor — Sector 5 dead-address scrub", () => {
  it("strips the known-dead sesizari@sector5.ro + office@politialocalasector5.ro from the recipients", () => {
    const r = getAuthoritiesFor("parcare", "S5", "B", "Calea 13 Septembrie", {
      jurisdiction: "trotuar",
    });
    const emails = [...r.primary.map((a) => a.email), ...r.cc.map((a) => a.email)];
    expect(emails).not.toContain("sesizari@sector5.ro");
    expect(emails).not.toContain("office@politialocalasector5.ro");
  });

  it("keeps the NEW working S5 addresses — primarie@ + politialocala@", () => {
    const r = getAuthoritiesFor("parcare", "S5", "B", "Calea 13 Septembrie", {
      jurisdiction: "trotuar",
    });
    const emails = r.primary.map((a) => a.email);
    expect(emails).toContain("primarie@sector5.ro");
    expect(emails).toContain("politialocala@sector5.ro");
  });

  it("keeps non-S5 addresses (PL Bucharest, Brigada Rutieră) on banda route", () => {
    const r = getAuthoritiesFor("parcare", "S5", "B", "Calea 13 Septembrie", {
      jurisdiction: "banda",
    });
    const emails = r.primary.map((a) => a.email);
    expect(emails).toContain("bpr@b.politiaromana.ro");
    expect(emails).toContain("office@plmb.ro");
  });

  it("detects Sector 5 from location text when sector flag is missing", () => {
    const r = getAuthoritiesFor("parcare", null, "B", "Strada Ana Ipătescu, Sector 5", {
      jurisdiction: "trotuar",
    });
    const emails = r.primary.map((a) => a.email);
    expect(emails).toContain("primarie@sector5.ro");
    expect(emails).not.toContain("sesizari@sector5.ro");
  });

  it("does NOT rewrite other sectors when Sector 5 is not involved", () => {
    const r = getAuthoritiesFor("parcare", "S3", "B", "Strada Mihai Bravu", {
      jurisdiction: "trotuar",
    });
    expect(r.primary.map((a) => a.email)).not.toContain("primarie@sector5.ro");
  });
});
