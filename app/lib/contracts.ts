export interface PageContext {
  url: string;
  title: string;
  text: string;
}

export interface ChatInput {
  question: string;
  session_id: string;
  page_context: PageContext;
}

export interface HandoffInput {
  session_id: string;
  name: string;
  email: string;
  message: string;
  consent: true;
  page_context: Pick<PageContext, "url" | "title">;
}

export class InputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InputError";
  }
}

function object(value: unknown, label: string): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new InputError(`${label} must be an object.`);
  }
  return value as Record<string, unknown>;
}

function text(
  value: unknown,
  label: string,
  { min = 0, max }: { min?: number; max: number },
): string {
  if (typeof value !== "string") throw new InputError(`${label} must be text.`);
  const normalized = value.trim();
  if (normalized.length < min) throw new InputError(`${label} is too short.`);
  if (normalized.length > max) throw new InputError(`${label} is too long.`);
  return normalized;
}

function sessionId(value: unknown): string {
  const id = text(value, "session_id", { min: 8, max: 100 });
  if (!/^[A-Za-z0-9_-]+$/.test(id)) {
    throw new InputError("session_id contains unsupported characters.");
  }
  return id;
}

function pageContext(value: unknown, includeText: boolean): PageContext {
  const page = object(value, "page_context");
  const url = text(page.url, "page_context.url", { min: 1, max: 2048 });
  try {
    const parsed = new URL(url);
    if (!['http:', 'https:'].includes(parsed.protocol)) throw new Error("bad protocol");
  } catch {
    throw new InputError("page_context.url must be an HTTP or HTTPS URL.");
  }
  return {
    url,
    title: text(page.title, "page_context.title", { min: 1, max: 200 }),
    text: includeText
      ? text(page.text, "page_context.text", { max: 6000 })
      : "",
  };
}

export function parseChatInput(value: unknown): ChatInput {
  const payload = object(value, "request");
  return {
    question: text(payload.question, "question", { min: 3, max: 600 }),
    session_id: sessionId(payload.session_id),
    page_context: pageContext(payload.page_context, true),
  };
}

export function parseHandoffInput(value: unknown): HandoffInput {
  const payload = object(value, "request");
  const email = text(payload.email, "email", { min: 3, max: 254 });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new InputError("email is invalid.");
  }
  if (payload.consent !== true) {
    throw new InputError("consent is required before sending contact details.");
  }
  const page = pageContext(payload.page_context, false);
  return {
    session_id: sessionId(payload.session_id),
    name: text(payload.name, "name", { min: 2, max: 100 }),
    email,
    message: text(payload.message, "message", { min: 3, max: 1000 }),
    consent: true,
    page_context: { url: page.url, title: page.title },
  };
}
