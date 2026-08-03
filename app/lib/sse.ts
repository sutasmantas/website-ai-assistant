export interface ParsedSseEvent {
  event: string;
  data: Record<string, unknown>;
}

export function encodeSse(event: string, data: Record<string, unknown>): string {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

export function parseSseBlock(block: string): ParsedSseEvent | null {
  let event = "";
  let raw = "{}";
  for (const line of block.split("\n")) {
    if (line.startsWith("event: ")) event = line.slice(7).trim();
    if (line.startsWith("data: ")) raw = line.slice(6);
  }
  if (!event) return null;
  const data: unknown = JSON.parse(raw);
  return {
    event,
    data: data && typeof data === "object" && !Array.isArray(data)
      ? data as Record<string, unknown>
      : {},
  };
}

export function sseResponse(chunks: string[], provider: string): Response {
  const encoder = new TextEncoder();
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      for (const chunk of chunks) controller.enqueue(encoder.encode(chunk));
      controller.close();
    },
  });
  return new Response(stream, {
    headers: {
      "Cache-Control": "no-store",
      "Content-Type": "text/event-stream; charset=utf-8",
      "X-Assistant-Provider": provider,
    },
  });
}
