import { InputError, parseHandoffInput } from "../../lib/contracts";
import { deliverHandoff, HandoffUnavailableError } from "../../lib/handoff";
import { SlidingWindowLimiter } from "../../lib/rate-limit";

const limiter = new SlidingWindowLimiter(3, 10 * 60_000);

export async function POST(request: Request): Promise<Response> {
  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return Response.json({ detail: "Request body must be valid JSON." }, { status: 400 });
  }
  try {
    const input = parseHandoffInput(raw);
    const rate = limiter.consume(input.session_id);
    if (!rate.allowed) {
      return Response.json(
        { detail: "Too many handoff requests. Please wait before trying again." },
        { status: 429, headers: { "Retry-After": String(rate.retryAfterSeconds) } },
      );
    }
    return Response.json(await deliverHandoff(input, process.env), { status: 202 });
  } catch (error) {
    if (error instanceof InputError) {
      return Response.json({ detail: error.message }, { status: 422 });
    }
    if (error instanceof HandoffUnavailableError) {
      const status = error.classification === "rejected" ? 502 : 503;
      return Response.json({ detail: error.message, retryable: status === 503 }, { status });
    }
    throw error;
  }
}
