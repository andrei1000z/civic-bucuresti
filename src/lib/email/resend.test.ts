import { describe, it, expect } from "vitest";
import { emailTemplate } from "./resend";

describe("emailTemplate — XSS hardening", () => {
  it("escapes <script> in title", () => {
    const html = emailTemplate({
      title: '<script>alert("xss")</script>',
      body: "<p>safe body</p>",
    });
    expect(html).not.toContain("<script>alert");
    expect(html).toContain("&lt;script&gt;");
  });

  it("escapes <img onerror> in preheader", () => {
    const html = emailTemplate({
      title: "Sesizare",
      preheader: '<img src=x onerror="alert(1)">',
      body: "<p>body</p>",
    });
    expect(html).not.toMatch(/<img\s+src=x\s+onerror=/);
    expect(html).toContain("&lt;img");
  });

  it("escapes quotes and ampersands in kicker", () => {
    const html = emailTemplate({
      title: "T",
      kicker: 'a"b & <c>',
      body: "B",
    });
    expect(html).toContain("a&quot;b &amp; &lt;c&gt;");
  });

  it("escapes javascript: in ctaUrl", () => {
    const html = emailTemplate({
      title: "T",
      body: "B",
      ctaText: "Click",
      ctaUrl: "javascript:alert(1)",
    });
    // url-ul e încă acolo dar caracterele speciale sunt escapate;
    // browser-ul Gmail blochează javascript: oricum, dar verificăm că
    // dacă cineva pune `"><script>` ca url, nu sparge atributul.
    const evil = emailTemplate({
      title: "T",
      body: "B",
      ctaText: "Click",
      ctaUrl: '"><script>alert(1)</script>',
    });
    expect(evil).not.toContain('"><script>alert(1)</script>');
    expect(evil).toContain("&quot;");
    // sanity: javascript: e doar un string, nu un crackback
    expect(html).toContain("javascript:alert(1)");
  });

  it("preserves body HTML (intentional, callers escape user input)", () => {
    const html = emailTemplate({
      title: "T",
      body: "<table><tr><td>cell</td></tr></table>",
    });
    expect(html).toContain("<table><tr><td>cell</td></tr></table>");
  });

  it("escapes single quote (Romanian text safe)", () => {
    const html = emailTemplate({
      title: "Cetățean's voice",
      body: "B",
    });
    expect(html).toContain("Cetățean&#039;s voice");
  });

  it("handles legitimate emoji in icon without breaking", () => {
    const html = emailTemplate({
      title: "T",
      icon: "✓",
      body: "B",
    });
    expect(html).toContain("✓");
  });

  it("ctaText and ctaUrl both required to render CTA", () => {
    const noUrl = emailTemplate({ title: "T", body: "B", ctaText: "Click" });
    expect(noUrl).not.toContain("display:inline-block;background:linear-gradient");
    const noText = emailTemplate({ title: "T", body: "B", ctaUrl: "https://civia.ro" });
    expect(noText).not.toContain("display:inline-block;background:linear-gradient");
    const both = emailTemplate({ title: "T", body: "B", ctaText: "Click", ctaUrl: "https://civia.ro" });
    expect(both).toContain("display:inline-block;background:linear-gradient");
  });
});
