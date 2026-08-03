import type { HandoffInput } from "./contracts";

export interface HandoffEnvironment {
  HANDOFF_WEBHOOK_URL?: string;
}

export interface HandoffResult {
  status: "accepted" | "already_accepted";
  mode: "deterministic" | "webhook";
  idempotency_key: string;
}

export class HandoffUnavailableError extends Error {
  constructor(
    readonly classification: "rate_limit" | "server_error" | "network_error" | "rejected",
    message: string,
  ) {
    super(message);
    this.name = "HandoffUnavailableError";
  }
}

async function stableKey(input: HandoffInput): Promise<string> {
  const canonical = [
    input.session_id,
    input.email.toLocaleLowerCase(),
    input.message,
    input.page_context.url,
  ].join("\u001f");
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(canonical));
  return `website-handoff-${[...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("")}`;
}

export async function deliverHandoff(
  input: HandoffInput,
  environment: HandoffEnvironment,
  fetcher: typeof fetch = fetch,
): Promise<HandoffResult> {
  const idempotencyKey = await stableKey(input);
  if (!environment.HANDOFF_WEBHOOK_URL) {
    return {
      status: "accepted",
      mode: "deterministic",
      idempotency_key: idempotencyKey,
    };
  }

  let response: Response;
  try {
    response = await fetcher(environment.HANDOFF_WEBHOOK_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Idempotency-Key": idempotencyKey,
      },
      body: JSON.stringify({
        event: "website_assistant.handoff_requested",
        version: 1,
        lead: {
          name: input.name,
          email: input.email,
          message: input.message,
          consent: input.consent,
        },
        source: input.page_context,
        session_id: input.session_id,
      }),
    });
  } catch (error) {
    throw new HandoffUnavailableError(
      "network_error",
      `The handoff service could not be reached: ${error instanceof Error ? error.message : "network error"}`,
    );
  }
  if (response.status === 409) {
    return { status: "already_accepted", mode: "webhook", idempotency_key: idempotencyKey };
  }
  if (response.status === 429) {
    throw new HandoffUnavailableError("rate_limit", "The handoff service is busy. Please retry.");
  }
  if (response.status >= 500) {
    throw new HandoffUnavailableError("server_error", "The handoff service is unavailable. Please retry.");
  }
  if (!response.ok) {
    throw new HandoffUnavailableError("rejected", "The handoff request was rejected.");
  }
  return { status: "accepted", mode: "webhook", idempotency_key: idempotencyKey };
}
