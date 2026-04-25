import { describe, it, expect } from "vitest";
import { scrubSentryEvent } from "./sentry-scrub";
import type { ErrorEvent } from "@sentry/nextjs";

function ev(overrides: Partial<ErrorEvent>): ErrorEvent {
  return {
    type: undefined,
    message: undefined,
    ...overrides,
  } as ErrorEvent;
}

describe("scrubSentryEvent — PII redaction", () => {
  it("redacts emails din message", () => {
    const result = scrubSentryEvent(
      ev({ message: "Failed to send to john.doe@example.com user" }),
    );
    expect(result?.message).toBe("Failed to send to [email] user");
  });

  it("redacts Romanian phone numbers (+40, 0040, fără prefix)", () => {
    const result = scrubSentryEvent(
      ev({ message: "Phone: +40 723 456 789" }),
    );
    expect(result?.message).toContain("[phone]");
    expect(result?.message).not.toContain("723");
  });

  it("redacts sesizare codes (6 char uppercase)", () => {
    const result = scrubSentryEvent(
      ev({ message: "Sesizare ABC123 not found" }),
    );
    expect(result?.message).toContain("[code]");
    expect(result?.message).not.toContain("ABC123");
  });

  it("redacts emails from exception values", () => {
    const result = scrubSentryEvent(
      ev({
        exception: {
          values: [{ type: "Error", value: "User not found: bob@civia.ro" }],
        },
      }),
    );
    expect(result?.exception?.values?.[0]?.value).toBe(
      "User not found: [email]",
    );
  });

  it("redacts emails din breadcrumb messages + data", () => {
    const result = scrubSentryEvent(
      ev({
        breadcrumbs: [
          {
            type: "default",
            timestamp: 0,
            message: "Login attempt for alice@test.ro",
            data: { user: "alice@test.ro", action: "login" },
          },
        ],
      }),
    );
    expect(result?.breadcrumbs?.[0]?.message).toContain("[email]");
    expect((result?.breadcrumbs?.[0]?.data as { user?: string })?.user).toBe(
      "[email]",
    );
  });

  it("redacts request body string", () => {
    const result = scrubSentryEvent(
      ev({
        request: {
          data: '{"email":"a@b.ro","sesizare":"ABC123"}',
        },
      }),
    );
    expect(result?.request?.data).not.toContain("a@b.ro");
    expect(result?.request?.data).not.toContain("ABC123");
  });

  it("redacts request body object recursively", () => {
    const result = scrubSentryEvent(
      ev({
        request: {
          data: { email: "test@test.ro", phone: "+40 723 123 456" },
        },
      }),
    );
    const data = result?.request?.data as { email?: string; phone?: string };
    expect(data?.email).toBe("[email]");
    expect(data?.phone).toBe("[phone]");
  });

  it("doesn't crash on empty event", () => {
    const result = scrubSentryEvent(ev({}));
    expect(result).toBeTruthy();
  });

  it("preserves non-PII content", () => {
    const result = scrubSentryEvent(
      ev({ message: "TypeError: Cannot read property 'x' of undefined" }),
    );
    expect(result?.message).toBe(
      "TypeError: Cannot read property 'x' of undefined",
    );
  });
});
