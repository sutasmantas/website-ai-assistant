import { describe, expect, it, vi } from "vitest";
import type { ChatInput } from "../app/lib/contracts";
import { composeAtlasQuestion, queryRetrieval, RetrievalUnavailableError } from "../app/lib/retrieval";
import { parseSseBlock } from "../app/lib/sse";

function input(question: string, text = "Returns are accepted within 30 days."): ChatInput {
  return {
    question,
    session_id: "session_123",
    page_context: { url: "https://shop.example/returns", title: "Returns", text },
  };
}

async function events(response: Response) {
  return (await response.text())
    .split("\n\n")
    .map(parseSseBlock)
    .filter((event) => event !== null);
}

describe("Atlas-compatible retrieval boundary", () => {
  it("streams cited deterministic FAQ evidence without credentials", async () => {
    const result = await events(await queryRetrieval(input("Can I return an unused bike?"), {}));
    expect(result[0].event).toBe("sources");
    expect(result.at(-2)?.event).toBe("trace");
    expect(result.at(-1)?.event).toBe("done");
    expect(result.filter((event) => event.event === "delta").length).toBeGreaterThan(1);
    const sources = result[0].data.sources as Array<{ source_uri: string }>;
    expect(sources[0].source_uri).toBe("https://shop.example/returns");
    expect(result.filter((event) => event.event === "delta").map((event) => event.data.text).join(""))
      .toContain("[1]");
  });

  it("refuses unsupported questions explicitly with no fabricated source", async () => {
    const result = await events(await queryRetrieval(input("Do you repair lunar rovers?", "Returns only."), {}));
    expect((result[0].data.sources as unknown[])).toEqual([]);
    expect(result.filter((event) => event.event === "delta").map((event) => event.data.text).join(""))
      .toContain("couldn't find relevant information");
  });

  it("forwards bounded page context through the real Atlas stream contract", async () => {
    const fetcher = vi.fn(async (_url: string | URL | Request, init?: RequestInit) => {
      const payload = JSON.parse(String(init?.body)) as { question: string; retrieval_profile: string };
      expect(payload.question).toBe(composeAtlasQuestion(input("What is the return period?")));
      expect(payload.retrieval_profile).toBe("hybrid");
      expect(new Headers(init?.headers).get("X-Atlas-Tenant")).toBe("public-site");
      return new Response("event: done\ndata: {}\n\n", {
        headers: { "Content-Type": "text/event-stream" },
      });
    });
    const response = await queryRetrieval(
      input("What is the return period?"),
      { ATLAS_BASE_URL: "https://atlas.example", ATLAS_TENANT: "public-site" },
      fetcher as typeof fetch,
    );
    expect(response.headers.get("X-Assistant-Provider")).toBe("atlas");
    expect(fetcher).toHaveBeenCalledOnce();
  });

  it("turns upstream failure into an explicit handoff-capable error", async () => {
    const fetcher = vi.fn(async () => new Response("down", { status: 503 }));
    await expect(queryRetrieval(
      input("What is the return period?"),
      { ATLAS_BASE_URL: "https://atlas.example" },
      fetcher as typeof fetch,
    )).rejects.toBeInstanceOf(RetrievalUnavailableError);
  });
});
