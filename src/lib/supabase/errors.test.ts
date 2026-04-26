import { describe, it, expect } from "vitest";
import { humanizeSupabaseError } from "./errors";

describe("humanizeSupabaseError — Postgres error code mapping", () => {
  it("maps 42501 (RLS) to 403 with permission message", () => {
    const r = humanizeSupabaseError({ code: "42501", message: "permission denied" });
    expect(r.status).toBe(403);
    expect(r.message).toMatch(/permisiunea/i);
  });

  it("matches 'row-level security' substring even without code", () => {
    const r = humanizeSupabaseError({ message: "new row violates row-level security policy" });
    expect(r.status).toBe(403);
  });

  it("maps 23505 (unique violation) to 409", () => {
    const r = humanizeSupabaseError({ code: "23505" });
    expect(r.status).toBe(409);
    expect(r.message).toMatch(/duplicat/i);
  });

  it("maps 23503 (FK violation) to 400", () => {
    const r = humanizeSupabaseError({ code: "23503" });
    expect(r.status).toBe(400);
    expect(r.message).toMatch(/referință/i);
  });

  it("maps 23514 (check violation) to 400", () => {
    const r = humanizeSupabaseError({ code: "23514" });
    expect(r.status).toBe(400);
    expect(r.message).toMatch(/constrânger/i);
  });

  it("maps 23502 with 'sector' detail → sector-specific message", () => {
    const r = humanizeSupabaseError({
      code: "23502",
      details: "null value in column \"sector\" violates not-null constraint",
    });
    expect(r.message).toMatch(/Sectorul/i);
    expect(r.status).toBe(400);
  });

  it("maps 23502 with 'titlu' detail → title-specific message", () => {
    const r = humanizeSupabaseError({
      code: "23502",
      details: 'null value in column "titlu" violates not-null constraint',
    });
    expect(r.message).toMatch(/Titlul/i);
    expect(r.status).toBe(400);
  });

  it("maps 23502 generic → generic 'field missing' message", () => {
    const r = humanizeSupabaseError({ code: "23502", message: "not-null violation on tip" });
    expect(r.message).toMatch(/câmp obligatoriu/i);
    expect(r.status).toBe(400);
  });

  it("maps PGRST301 (JWT) to 401", () => {
    const r = humanizeSupabaseError({ code: "PGRST301" });
    expect(r.status).toBe(401);
    expect(r.message).toMatch(/Sesiune expirată/i);
  });

  it("matches 'JWT' substring without code → 401", () => {
    const r = humanizeSupabaseError({ message: "JWT expired" });
    expect(r.status).toBe(401);
  });

  it("maps PGRST116 (no rows) to 404", () => {
    const r = humanizeSupabaseError({ code: "PGRST116" });
    expect(r.status).toBe(404);
  });

  it("falls back to 500 with raw message for unknown codes", () => {
    const r = humanizeSupabaseError({ code: "99999", message: "some weird error" });
    expect(r.status).toBe(500);
    expect(r.message).toBe("some weird error");
  });

  it("falls back to 500 with generic message when no message available", () => {
    const r = humanizeSupabaseError({ code: "99999" });
    expect(r.status).toBe(500);
    expect(r.message).toBe("Eroare neașteptată");
  });

  it("handles null/undefined input safely", () => {
    expect(humanizeSupabaseError(null).status).toBe(500);
    expect(humanizeSupabaseError(undefined).status).toBe(500);
  });

  it("handles non-object input", () => {
    expect(humanizeSupabaseError("a string error").status).toBe(500);
    expect(humanizeSupabaseError(42).status).toBe(500);
  });
});
