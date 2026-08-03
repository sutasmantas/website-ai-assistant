import { describe, expect, it, vi } from "vitest";
import type { HandoffInput } from "../app/lib/contracts";
import { deliverHandoff, HandoffUnavailableError } from "../app/lib/handoff";
import { SlidingWindowLimiter } from "../app/lib/rate-limit";

const handoff: HandoffInput = {
  session_id: "session_123",
  name: "Ada Rider",
  email: "ada@example.com",
  message: "Please call me about sizing.",
  consent: true,
  page_context: { url: "https://shop.example/bikes", title: "Bikes" },
};

describe("human handoff", () => {
  it("uses the same stable idempotency key in deterministic mode", async () => {
    const first = await deliverHandoff(handoff, {});
    const second = await deliverHandoff(handoff, {});
    expect(first.mode).toBe("deterministic");
    expect(first.idempotency_key).toBe(second.idempotency_key);
  });

  it("posts a consented structured lead to a generic webhook", async () => {
    const fetcher = vi.fn(async (_url: string | URL | Request, init?: RequestInit) => {
      const payload = JSON.parse(String(init?.body)) as { event: string; lead: { consent: boolean } };
      expect(payload.event).toBe("website_assistant.handoff_requested");
      expect(payload.lead.consent).toBe(true);
      expect(new Headers(init?.headers).get("Idempotency-Key")).toMatch(/^website-handoff-/);
      return Response.json({ accepted: true });
    });
    const result = await deliverHandoff(
      handoff,
      { HANDOFF_WEBHOOK_URL: "https://relay-target.example/handoff" },
      fetcher as typeof fetch,
    );
    expect(result).toMatchObject({ status: "accepted", mode: "webhook" });
  });

  it.each([429, 503])("classifies retryable webhook HTTP %s failures", async (status) => {
    const fetcher = vi.fn(async () => new Response("failed", { status }));
    await expect(deliverHandoff(
      handoff,
      { HANDOFF_WEBHOOK_URL: "https://relay-target.example/handoff" },
      fetcher as typeof fetch,
    )).rejects.toBeInstanceOf(HandoffUnavailableError);
  });

  it("enforces a deterministic sliding-window limit", () => {
    let now = 1_000;
    const limiter = new SlidingWindowLimiter(2, 1_000, () => now);
    expect(limiter.consume("visitor").allowed).toBe(true);
    expect(limiter.consume("visitor").allowed).toBe(true);
    expect(limiter.consume("visitor")).toMatchObject({ allowed: false, retryAfterSeconds: 1 });
    now = 2_001;
    expect(limiter.consume("visitor").allowed).toBe(true);
  });
});
