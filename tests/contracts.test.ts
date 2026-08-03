import { describe, expect, it } from "vitest";
import { InputError, parseChatInput, parseHandoffInput } from "../app/lib/contracts";
import { extractLatestQuestion } from "../app/lib/deep-chat";

const page = {
  url: "https://shop.example/products/trail-bike",
  title: "Trail bike",
  text: "Delivery takes 2–4 business days.",
};

describe("public input contracts", () => {
  it("accepts bounded page context and extracts the latest Deep Chat user message", () => {
    expect(parseChatInput({ question: "When does it arrive?", session_id: "session_123", page_context: page }))
      .toEqual({ question: "When does it arrive?", session_id: "session_123", page_context: page });
    expect(extractLatestQuestion({ messages: [
      { role: "user", text: "first" },
      { role: "assistant", text: "answer" },
      { role: "user", text: "  latest question  " },
    ] })).toBe("latest question");
  });

  it("rejects oversized page text and invalid URLs", () => {
    expect(() => parseChatInput({
      question: "Valid question",
      session_id: "session_123",
      page_context: { ...page, text: "x".repeat(6001) },
    })).toThrow(InputError);
    expect(() => parseChatInput({
      question: "Valid question",
      session_id: "session_123",
      page_context: { ...page, url: "file:///secret" },
    })).toThrow("HTTP or HTTPS");
  });

  it("requires explicit consent and a valid email for handoff", () => {
    const base = {
      session_id: "session_123",
      name: "Ada Rider",
      email: "ada@example.com",
      message: "Please call me about sizing.",
      page_context: page,
    };
    expect(() => parseHandoffInput({ ...base, consent: false })).toThrow("consent");
    expect(() => parseHandoffInput({ ...base, email: "not-an-email", consent: true })).toThrow("email");
    expect(parseHandoffInput({ ...base, consent: true }).consent).toBe(true);
  });
});
