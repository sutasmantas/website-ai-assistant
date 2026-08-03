import { InputError, parseChatInput } from "../../lib/contracts";
import { SlidingWindowLimiter } from "../../lib/rate-limit";
import { queryRetrieval, RetrievalUnavailableError } from "../../lib/retrieval";

const limiter = new SlidingWindowLimiter(8, 60_000);

export async function POST(request: Request): Promise<Response> {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return Response.json({ detail: "Request body must be valid JSON." }, { status: 400 });
  }
  try {
    const input = parseChatInput(raw);
    const rate = limiter.consume(input.session_id);
    if (!rate.allowed) {
      return Response.json(
        { detail: "Too many questions. Please wait before trying again." },
        { status: 429, headers: { "Retry-After": String(rate.retryAfterSeconds) } },
      );
    }
    return await queryRetrieval(input, process.env);
  } catch (error) {
    if (error instanceof InputError) {
      return Response.json({ detail: error.message }, { status: 422 });
    }
    if (error instanceof RetrievalUnavailableError) {
      return Response.json({ detail: error.message, can_handoff: true }, { status: 503 });
    }
    throw error;
  }
}
