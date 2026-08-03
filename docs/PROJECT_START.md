# Website assistant project start record

Completed from `portfolio_demos/NEW_PROJECT_FOUNDATION_AND_IDENTITY_TEMPLATE.md`
on 2026-08-01 before the first commit on the implementation branch.

## 1. Restart boundary

- repository: `portfolio_demos/website_assistant`
- baseline branch and commit: `main` / `dcb1e37888f9f844595471635e676e1c1c30fd5a`
- implementation branch: `agent/website-assistant-mre`
- assigned worktree: `portfolio_demos/worktrees/website_assistant_mre`
- owner/session: primary portfolio agent
- read-only: Atlas, Relay, ContextSidecar, and every other worktree
- exact next action: complete and verify the website-assistant MRE only

## 2. Client outcome and non-duplication

- outcome: add a grounded, embeddable assistant with lead handoff to an
  existing website;
- closest evidence: Atlas retrieval and Relay generic webhook workflow;
- genuinely new: cross-site embed, bounded current-page context, consumer chat
  interaction, unavailable-answer-to-lead path;
- coverage decision: this creates a direct website-chatbot artifact without
  copying a second retrieval backend.

## 3. GitHub foundation comparison

Private working project: license was not used as a research or ranking factor.

| Candidate | Repository | Central reusable behavior | Adaptation cost/risk | Decision |
| --- | --- | --- | --- | --- |
| Deep Chat | `OvidijusParsiunas/deep-chat` | drop-in chat component, custom handler, stream lifecycle, input/messages/stop | narrow Atlas adapter | **Adopt** |
| assistant-ui | `assistant-ui/assistant-ui` | strong streaming React primitives and runtimes | must assemble UI and cross-site embed | reject |
| FlowiseChatEmbed | `FlowiseAI/FlowiseChatEmbed` | popup/full-page embed | coupled to Flowise host/chatflow | reject |
| Typebot | `baptisteArno/typebot.io` | embeds, lead inputs, workflows | large builder/runtime replaces composition boundary | reject |
| Chatwoot | `chatwoot/chatwoot` | mature live-support widget/inbox | full support platform duplicates Relay ownership | reject |
| n8n Embedded Chat Interface | `symbiosika/n8n-embedded-chat-interface` | native web component | coupled to n8n request/response shape | reject |

Selected foundation:

- repository: `https://github.com/OvidijusParsiunas/deep-chat`
- pin: tag `2.5.0`, commit `83172c549d5766f37da45b522fb1de0d2ae46132`
- reused: `deep-chat-react` component and its custom streaming-handler lifecycle;
- preservation: exact package/tag/commit and upstream identity are recorded in
  the project docs;
- benefit: avoids reimplementing chat rendering, input, stop, scrolling, and
  Shadow-DOM isolation.

## 4. Distinct visual direction

- compared: Atlas answer canvas and Relay case-workspace screenshots;
- metaphor: bold independent cycling storefront;
- layout: editorial landing page plus compact floating assistant;
- palette: off-white, saturated cobalt, safety orange, black;
- typography: oversized uppercase retail headline and plain utility body;
- interaction: one injected launcher and focused chat, not dashboard navigation;
- avoided: dark sidebar, three-column operations grid, evidence rail, queue,
  research canvas, purple/teal product identity.

## 5. MRE acceptance contract

The authoritative live statuses are in `docs/EXECUTION_CHECKPOINT.md`. Required
evidence: embed, bounded context, cited Atlas-compatible stream, explicit
not-found, consented idempotent handoff, abuse/provider failure paths,
credential-free demo, focused tests, quickstart, and claim boundaries.

## 6. Verification and handback

- static: `npm run lint`
- focused tests: `npx vitest run --config vitest.config.ts`
- build/rendered routes: `npm run build` then
  `node --test tests/rendered-html.test.mjs`
- full gate: `npm test`
- final commit, clean state, residual boundaries, and exact next action: record
  in `docs/EXECUTION_CHECKPOINT.md` after all gates pass
