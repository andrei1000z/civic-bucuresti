import { describe, it, expect } from "vitest";
import { extractPlate, normalizePlate, buildParkingLegalText, buildBolarziRequest } from "./parking";

describe("normalizePlate", () => {
  it("uppercases and collapses whitespace", () => {
    expect(normalizePlate(" b 123  abc ")).toBe("B 123 ABC");
  });
  it("strips punctuation Tesseract emits on plate borders", () => {
    expect(normalizePlate("B-123.ABC")).toBe("B 123 ABC");
  });
});

describe("extractPlate", () => {
  it("pulls a classic Bucharest plate out of noisy OCR output", () => {
    expect(extractPlate("PLATE B 123 ABC - random trash")).toBe("B 123 ABC");
  });
  it("handles county plates (CJ, CL, IS etc)", () => {
    expect(extractPlate("something CJ 01 ABC")).toBe("CJ 01 ABC");
  });
  it("returns null when nothing plausible is present", () => {
    expect(extractPlate("just plain words here")).toBeNull();
  });
  it("accepts the dashed format some counties still use", () => {
    expect(extractPlate("IS-17-ABC")).toBe("IS 17 ABC");
  });
});

describe("buildParkingLegalText", () => {
  const base = {
    authorityName: "Poliția Locală Sector 3",
    authorName: "Ion Popescu",
    authorAddress: "Strada Mihail Sadoveanu 12, București",
    plate: "B 123 ABC",
    jurisdiction: "trotuar" as const,
    locatie: "Strada Maria Rosetti 25, Sector 2",
    lat: 44.43,
    lng: 26.1,
    observedAt: new Date("2026-04-22T10:30:00"),
    photoCount: 3,
  };
  it("includes the OUG 195/2002 citation and the plate wrapped in the bold marker", () => {
    const text = buildParkingLegalText(base);
    expect(text).toMatch(/OUG 195\/2002/);
    expect(text).toMatch(/\[\[BOLD]]B 123 ABC\[\[\/BOLD]]/);
  });
  it("mentions that the driver left the vehicle (staționare not oprire)", () => {
    const text = buildParkingLegalText(base);
    expect(text).toMatch(/staționare, nu oprire/);
  });
  it("demands identification of the driver per art. 39", () => {
    const text = buildParkingLegalText(base);
    expect(text).toMatch(/art\. 39 din OUG 195\/2002/);
  });
  it("swaps the 'jurisdiction' noun between trotuar and bandă", () => {
    const tr = buildParkingLegalText({ ...base, jurisdiction: "trotuar" });
    const bd = buildParkingLegalText({ ...base, jurisdiction: "banda" });
    expect(tr).toMatch(/staționa neregulamentar pe trotuar/);
    expect(bd).toMatch(/staționa neregulamentar pe banda de circulație/);
  });
  it("falls back to GPS coords when locatie is empty", () => {
    const text = buildParkingLegalText({ ...base, locatie: "" });
    expect(text).toMatch(/coordonatele GPS 44\.43000, 26\.10000/);
  });
});

describe("buildBolarziRequest", () => {
  it("cites the prior report codes and the count", () => {
    const text = buildBolarziRequest({
      authorName: "Maria Ionescu",
      authorAddress: "Calea Victoriei 45, București",
      locatie: "Strada Lipscani 10",
      priorReportCount: 5,
      priorReportCodes: ["ABC123", "DEF456", "GHI789"],
    });
    expect(text).toMatch(/ASPMB|Administrația Străzilor/);
    expect(text).toMatch(/5 sesizări/);
    expect(text).toMatch(/ABC123, DEF456, GHI789/);
  });
});
