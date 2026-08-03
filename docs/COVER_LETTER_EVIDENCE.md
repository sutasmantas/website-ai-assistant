# Website assistant cover-letter evidence

Use only the claims below. This is a private working portfolio artifact, not a
client deployment or a named SaaS integration.

## Embeddable website assistant

Permitted claim:

> I built a one-script website assistant that embeds an adopted Deep Chat
> component, passes bounded current-page context, and streams answers through
> an Atlas-compatible retrieval contract.

Evidence:

- `public/assistant-widget.js` injects the launcher/iframe, extracts at most
  6,000 context characters, and validates the iframe origin/source;
- `app/widget/widget.tsx` uses pinned `deep-chat-react` and its custom streaming
  handler rather than a home-grown chat surface;
- `app/lib/retrieval.ts` adapts the request to Atlas `POST /api/query/stream`;
- `tests/retrieval.test.ts` proves deterministic and proxied stream contracts;
- `tests/rendered-html.test.mjs` proves the sample page, embed hook, adopted
  component boundary, and handoff render in the production build.

## Grounded answer and unavailable behavior

Permitted claim:

> The widget displays streamed answers with source references and explicitly
> declines when the available website evidence cannot answer the question.

Evidence:

- deterministic sources use the Atlas source shape and answers carry `[1]`;
- no-match returns no source and an explicit human-contact offer;
- Atlas `retracted` and `error` events are not silently displayed as valid;
- focused cases are in `tests/retrieval.test.ts`.

## Lead capture and workflow handoff

Permitted claim:

> I added an explicit-consent human handoff that emits a versioned lead event
> to a generic webhook with a stable idempotency key and visible retry errors.

Evidence:

- `app/lib/contracts.ts` validates consent, email, payload, URL, and size bounds;
- `app/lib/handoff.ts` emits `website_assistant.handoff_requested`, sends
  `Idempotency-Key`, treats 409 as already accepted, and distinguishes retryable
  429/5xx/network failures from terminal rejection;
- `tests/handoff.test.ts` proves deterministic, webhook, idempotency, failure,
  and rate-limit behavior;
- live local `POST /api/handoff` returns HTTP 202 without credentials.

## Abuse and failure behavior

Permitted claim:

> Public inputs are bounded, chat and handoff calls are rate-limited per runtime
> instance, retrieval failures expose a human path, and webhook failures remain
> retryable instead of being reported as successful.

Evidence:

- `app/lib/contracts.ts`, `app/lib/rate-limit.ts`, and both API routes;
- `tests/contracts.test.ts`, `tests/retrieval.test.ts`, and
  `tests/handoff.test.ts`.

## Do not claim

- a production website, client result, conversion improvement, traffic volume,
  retrieval accuracy, or model-quality measurement;
- a named CRM, ecommerce, helpdesk, chat, or automation platform integration;
- that this repository owns a second RAG backend or duplicates Atlas indexing;
- distributed rate limiting, durable webhook retry/audit, SSRF protection,
  authentication, tenant isolation, compliance, analytics, or retention;
- that the optional Atlas or webhook paths were exercised against a deployed
  external service; they are contract-tested with controlled fakes.

## Reproduction

```powershell
npm ci
npm run lint
npm test
npm run dev
```

At `http://localhost:3000`, open **Ask Switchback**, ask `How long does
shipping take?`, then try an unsupported question and the contact form.
