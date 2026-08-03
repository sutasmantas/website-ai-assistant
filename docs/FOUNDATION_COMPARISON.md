# Website assistant foundation comparison

Date: 2026-08-01

The portfolio gate requires a real GitHub foundation that supplies central
behavior. The Sites/vinext scaffold supplies runtime plumbing only and is not
counted as the reusable foundation. This is private working evidence; the
comparison ranks technical fit and adaptation time only, not license.

## Decision

Adopt **Deep Chat 2.5.0** from
`https://github.com/OvidijusParsiunas/deep-chat` at tag/commit
`2.5.0` / `83172c549d5766f37da45b522fb1de0d2ae46132`.

The application pins `deep-chat-react==2.5.0` and uses its working embeddable
chat component, streaming custom-handler lifecycle, message rendering, input,
stop behavior, and Shadow-DOM isolation. The project adds the narrow Atlas SSE
translation, bounded page-context bridge, and human-handoff form; it does not
reimplement a chat surface from scratch.

## Compared candidates

| Candidate | Pin/current state checked | MRE fit | Decision |
| --- | --- | --- | --- |
| Deep Chat | tag `2.5.0`, commit `83172c5`; npm `2.5.0` | framework-agnostic embed, React wrapper, custom API handler, streaming lifecycle, mature input/message behavior | **Adopt** |
| FlowiseChatEmbed | tag `flowise-embed@3.1.3`, commit `e3294d5` | strong popup/full-page widget, but core requests are coupled to Flowise host and chatflow IDs | Reject: would add a second orchestration backend instead of composing Atlas and Relay |
| assistant-ui | current repository reviewed 2026-08-01 | excellent React streaming/accessibility primitives and custom runtimes, but it is an in-app composition system rather than a drop-in cross-site embed | Reject: more assembly and framework coupling for this narrow widget |
| Typebot | current repository/release family reviewed 2026-08-01 | mature native embeds, lead inputs, workflows, and analytics | Reject: requires adopting a large chatbot-builder/runtime rather than adapting Atlas SSE |
| Chatwoot | current repository/release family reviewed 2026-08-01 | mature website/live-agent widget and support inbox | Reject: full support platform is far beyond MRE and would duplicate Relay ownership |
| n8n Embedded Chat Interface | current repository reviewed 2026-08-01 | real native web component and simple embed | Reject: transport is tied to n8n webhook request/response shapes and lacks the required Atlas citation stream |

Primary repository evidence:

- Deep Chat: <https://github.com/OvidijusParsiunas/deep-chat>
- FlowiseChatEmbed: <https://github.com/FlowiseAI/FlowiseChatEmbed>
- assistant-ui: <https://github.com/assistant-ui/assistant-ui>
- Typebot: <https://github.com/baptisteArno/typebot.io>
- Chatwoot: <https://github.com/chatwoot/chatwoot>
- n8n Embedded Chat Interface:
  <https://github.com/symbiosika/n8n-embedded-chat-interface>

## Reuse boundary

- Deep Chat owns the browser chat component and its handler/stream lifecycle.
- Atlas remains the retrieval/generation owner through `POST /api/query/stream`.
- The website assistant only adapts bounded page context to that wire contract.
- Human handoff emits the same generic JSON plus idempotency semantics exercised
  by Relay; destination policy, durable retry, and audit remain Relay concerns.
- No provider key is exposed to the browser.

## Visual identity frozen before implementation

This project is a consumer cycling storefront, not another operations console:

- off-white paper, saturated cobalt, and safety-orange palette;
- oversized uppercase retail headline and hard-edged cards;
- single editorial storefront page plus a floating assistant;
- no dark sidebar, dashboard grid, research canvas, evidence rail, or case queue.

This structural direction distinguishes it from Atlas and Relay now, while
decorative imagery, animation, and showcase polish remain deferred.
