import { describe, it, expect } from "vitest";
import { classifyCategory, cleanText } from "./rss";

describe("classifyCategory", () => {
  it("routes transport keywords (RO) correctly", () => {
    expect(classifyCategory("Metroul M2 oprit din cauza unei pene")).toBe("transport");
    expect(classifyCategory("STB anunță un nou abonament unic")).toBe("transport");
    expect(classifyCategory("Trafic infernal pe centura Bucureștiului")).toBe("transport");
  });

  it("routes urbanism keywords correctly", () => {
    expect(classifyCategory("Noul PUG al Cluj-Napocii dezbătut public")).toBe("urbanism");
    expect(classifyCategory("Construcții imobiliare ilegale în cartier")).toBe("urbanism");
  });

  it("routes mediu (environment) keywords correctly", () => {
    expect(classifyCategory("Calitatea aerului peste limita admisă")).toBe("mediu");
    expect(classifyCategory("Salubritate haotică în parcul central")).toBe("mediu");
  });

  it("routes siguranta keywords correctly", () => {
    expect(classifyCategory("Accident grav pe DN1 — patru victime")).toBe("siguranta");
    expect(classifyCategory("Poliția anchetează un furt din parcare")).toBe("siguranta");
  });

  it("routes administratie keywords correctly", () => {
    expect(classifyCategory("Consiliul General aprobă bugetul pe 2026")).toBe("administratie");
    expect(classifyCategory("Primăria emite o nouă hotărâre")).toBe("administratie");
  });

  it("routes eveniment keywords correctly", () => {
    expect(classifyCategory("Festival de muzică în weekend la Cluj")).toBe("eveniment");
    expect(classifyCategory("Protest la Universitate față de noua lege")).toBe("eveniment");
  });

  it("falls back to administratie for unknown topics", () => {
    expect(classifyCategory("xyz qrs random text fără cuvinte cheie")).toBe("administratie");
  });

  it("is case-insensitive", () => {
    expect(classifyCategory("METROU M2 OPRIT")).toBe("transport");
  });

  it("handles diacritics", () => {
    expect(classifyCategory("Salubritate și mediu — raport anual")).toBe("mediu");
  });
});

describe("cleanText", () => {
  it("strips HTML tags", () => {
    expect(cleanText("<p>Hello <b>world</b></p>")).toBe("Hello world");
  });

  it("decodes HTML entities", () => {
    expect(cleanText("a &amp; b &lt; c &gt; d")).toBe("a & b < c > d");
    expect(cleanText("&quot;Salut&quot; &#039;Bună&#039;")).toBe("\"Salut\" 'Bună'");
  });

  it("decodes numeric entities", () => {
    expect(cleanText("&#65;&#66;&#67;")).toBe("ABC");
    expect(cleanText("&#x41;&#x42;")).toBe("AB");
  });

  it("normalizes &nbsp; to space", () => {
    expect(cleanText("Hello&nbsp;world")).toBe("Hello world");
  });

  it("trims whitespace", () => {
    expect(cleanText("   hello   ")).toBe("hello");
  });

  it("handles empty / undefined input", () => {
    expect(cleanText("")).toBe("");
    expect(cleanText(undefined)).toBe("");
  });

  it("preserves Romanian diacritics inside content", () => {
    expect(cleanText("<p>Cetățean păcălit</p>")).toBe("Cetățean păcălit");
  });

  it("handles nested tags + entities together", () => {
    expect(cleanText("<div>Hello &amp; <span>welcome</span>!</div>")).toBe("Hello & welcome!");
  });
});
