# Website Assistant expertise notes

**Verification:** [claim-to-artifact map and rerun commands](https://sutasmantas.github.io/evidence/#switchback) · [machine-readable receipt](https://sutasmantas.github.io/evidence/receipt.json)

Date: 2026-08-04

No local technique comparison was run. These notes distinguish externally
closed decisions from the W0-W4 questions that remain open.

## Choose extraction mode from page behavior

### Client trigger

- Deliverable: website chatbot, site RAG, content ingestion, FAQ assistant or
  support widget across articles, product/service pages and SPAs.
- Measured proposal frequency: not quantified in this slice.
- Reusable project: Website Assistant's bounded host context, Atlas stream and
  unavailable/citation path.

### Failure symptom or unanswered choice

A generic “clean page text” step can keep navigation, remove the product fact
the visitor asked about, or receive an empty application shell before
JavaScript renders.

### Competing options

| Option | Why plausible | Main cost/failure risk |
| --- | --- | --- |
| raw text | maximum recall, no dependency | noise/truncation hides evidence |
| semantic allowlist | precise on controlled markup | selector drift and missing fallback |
| Readability/general extractor | generic boilerplate removal | page-type-specific omissions |
| rendered browser | observes SPA content | latency, memory, nondeterminism/security |

### Controlled comparison

- Evidence-reuse level: external answer closes routing need; local winner is
  unresolved.
- Sources: WCXB covers seven page types and finds large structured-page gaps;
  Readability/Trafilatura implementations expose current omission defects;
  LiveWeb-IE and the 2026 scraping review cover dynamic/live behavior.
- Contrary evidence: article results overstate product/service performance;
  always rendering wastes resources; the current embed already sees rendered
  host DOM.
- Local design: W1 fixes page types, mutations, answer-bearing recall, noise,
  answer/citation, latency and memory.
- Outside comparison: arbitrary authenticated browsing and transactions.

### Result

No universal extractor is established. Semantic owner markup is the current
control; article extraction and rendered acquisition are routed candidates.

### Decision rule

Use explicit semantic blocks on controlled pages. Test Readability for
article-like pages. Route to browser rendering only when static/host evidence
is empty or materially incomplete. Admit a broader/HTML-aware extractor only
for a measured structured-page win.

### Delivery control

Acceptance must include article, product/service, navigation-heavy, short,
table/list and SPA cases, plus answer-bearing recall and bot/error-page
detection—not only clean-looking output.

### Reuse boundary

- Reusable: page-type labels, adapters for Readability/Playwright, block/source
  contract and W1 scorer.
- Client-specific: CMS markup, SPA behavior, crawl permissions, latency and
  answer-bearing sections.
- Unsupported: one extractor works best across all websites or this project has
  measured live-site accuracy.

### Proposal-safe insight

I route website extraction by page behavior: owner-controlled semantic blocks
for the fast path, article extraction where it preserves the needed content,
and browser rendering only when the static page is an incomplete shell.

### Evidence

- Code: `public/assistant-widget.js`, `app/lib/retrieval.ts`.
- Tests: `tests/retrieval.test.ts`, `tests/rendered-html.test.mjs`.
- Research/design: `TECHNIQUE_TAXONOMY.md`, W1 in `BENCHMARK_DESIGN.md`.
- Reproduction: existing commands in `docs/EXECUTION_CHECKPOINT.md`; W1 has no
  result command yet.

### Interview follow-up

- Likely question: Why not run Readability or Playwright on every page?
- Short answer: Readability is article-oriented and can drop structured pages;
  Playwright recovers dynamic content but adds browser cost. Route on observed
  content shape and completeness.
- Deeper evidence: WCXB page-type rows and GitHub defect audit.

### Central index disposition

- Added card: yes.
- Card heading: **Route website extraction by page behavior**.

## Treat external content as data, not authority

### Client trigger

- Deliverable: assistant reads websites, tickets, documents, email or API text
  and can answer, hand off or invoke tools.
- Reusable projects: Website Assistant's untrusted context marker and bounded
  handoff; Relay's server-side tool policy and approval.

### Failure symptom or unanswered choice

Valid page text can impersonate instructions to redirect the model, reveal
protected context or trigger an action. Removing scripts/tags does not remove a
semantic instruction.

### Competing options

| Option | Why plausible | Main cost/failure risk |
| --- | --- | --- |
| warning/delimiters | cheap data separation | model may still comply |
| DOM sanitizer | necessary for rendered HTML/XSS | semantic attacks survive |
| detector/task-output checks | can catch redirection | model dependence/false refusal |
| least privilege and approval | bounds executed impact | requires exact application policy/human latency |

### Controlled comparison

- Evidence-reuse level: established threat and architectural boundary;
  provisional defense winner.
- Sources: AgentDojo, WebInject, Task Shield, IPIGuard and web-agent injection
  demonstrations.
- Contrary evidence: attacks differ across HTML, accessibility and visual
  channels; defenses trade utility for ASR and do not establish prevention.
- Local design: W2 includes benign trigger words, indirect attacks, attempted
  versus executed effects and false refusal.
- Outside comparison: XSS alone and unrestricted autonomous web transactions.

### Result

External content is untrusted data. Sanitization has a narrow markup role; tool
permissions, consent and task authority remain outside the page/model. The best
semantic defense is unresolved until W2.

### Decision rule

Normalize and delimit evidence, retain source attribution, expose minimum
capabilities, validate task/output and keep writes behind application policy.
Promote a detector only with benign utility and attack-success evidence.

### Delivery control

Run matched benign/adversarial cases and hard-fail any unauthorized executed
effect or protected-content disclosure. Report over-defense separately.

### Reuse boundary

- Reusable: untrusted-source labels, attack categories, W2 scorer and Relay
  policy/approval pattern.
- Client-specific: trusted origins, protected data, allowed tools, consent and
  false-refusal tolerance.
- Unsupported: the current warning, DOMPurify or any single defense makes the
  assistant prompt-injection-proof.

### Proposal-safe insight

I treat text from pages and tools as evidence, never as authority to change the
task or permissions. Security acceptance measures blocked attacks and the
legitimate answers a defense incorrectly refuses.

### Evidence

- Code: `app/lib/retrieval.ts`, `app/lib/contracts.ts`,
  `app/lib/handoff.ts`.
- Tests: `tests/retrieval.test.ts`, `tests/handoff.test.ts`.
- Research/design: W2 in `BENCHMARK_DESIGN.md` and security rows in
  `EVIDENCE_MATRIX.csv`.

### Interview follow-up

- Likely question: Isn't sanitizing the page enough?
- Short answer: sanitization removes unsafe markup, not an ordinary sentence
  asking the model to misuse an allowed action; permissions and task checks
  must be enforced separately.
- Deeper evidence: Task Shield/AgentDojo boundary and W2 design.

### Central index disposition

- Added card: yes.
- Card heading: **Treat external content as data, not authority**.
- This single card also carries Relay's matching tool-output decision to avoid
  duplicate proposal retrieval paths.

## Bind every indexed answer to a freshness boundary

### Client trigger

- Deliverable: website answers about prices, availability, policies, schedules
  or other facts that change.
- Reusable project: Atlas-compatible source metadata and Website Assistant
  citations/retraction.

### Failure symptom or unanswered choice

An answer can cite a real page and still be wrong because the indexed snapshot
is older than the site or because old and new facts are both in context.

### Competing options

| Option | Why plausible | Main cost/failure risk |
| --- | --- | --- |
| live current-page snapshot | fresh for visitor view | only one page; personalized/transient DOM |
| scheduled crawl | predictable cost | bounded stale window |
| immediate change invalidation | lower lag | CMS/webhook integration and noisy mutations |
| answer-time live verification | strongest freshness check | latency, availability and access limits |

### Controlled comparison

- Evidence-reuse level: established need; policy unresolved.
- Sources: HoH shows outdated evidence can mislead even beside current
  evidence; DynaQuest and LiveWeb-IE show static snapshots do not establish live
  performance.
- Contrary evidence: immediate reindexing does not guarantee the generator
  selects the newest evidence; DOM changes can be cosmetic/personalized.
- Local design: W3 records versions, applies controlled changes and measures
  stale-answer duration/recovery.

### Result

Source version/hash/capture time and a maximum stale-answer policy are required
for indexed site answers. The client-specific refresh route remains unknown.

### Decision rule

Use the live host snapshot for current-page questions. For indexed pages,
persist canonical URL, hash/version and capture time; select refresh or
answer-time validation from change frequency and acceptable staleness.

### Delivery control

Change a known fact after indexing and require the answer/citation to switch
within the agreed window; surface unavailable/stale state instead of silently
mixing versions.

### Reuse boundary

- Reusable: versioned block/source schema and W3 change fixture.
- Client-specific: CMS signals, update frequency, cache/crawl budget,
  personalization and acceptable stale duration.
- Unsupported: the current project has a measured freshness SLA.

### Proposal-safe insight

For changing website facts I bind citations to a captured version and test how
long an old answer survives after the page changes. “Has a citation” and “is
current” are separate acceptance conditions.

### Evidence

- Code: `app/lib/retrieval.ts` source contract.
- Research/design: W3 in `BENCHMARK_DESIGN.md`.
- Local result: none yet.

### Interview follow-up

- Likely question: Why isn't immediate reindexing enough?
- Short answer: old and new evidence can coexist and the generator can still
  select the old fact, so latest-version selection and answer recovery must be
  tested end to end.
- Deeper evidence: HoH and W3 stale-answer metric.

### Central index disposition

- Added card: yes.
- Card heading: **Test citation freshness separately from citation presence**.

## Reuse crawling and retrieval instead of building another site-RAG stack

### Client trigger

- Deliverable: expand a current-page widget to answer across a whole website.
- Reusable components: Crawlee acquisition patterns and Atlas section/source
  retrieval contract.

### Failure symptom or unanswered choice

Expanding scope can accidentally create a second crawler, queue, canonicalizer,
index and retriever inside the widget, multiplying failure and freshness paths.

### Competing options

| Option | Why plausible | Main cost/failure risk |
| --- | --- | --- |
| custom crawl/index | full local control | integration hell and duplicate infrastructure |
| Crawlee + Atlas flat sections | maintained components, existing citations | adapters, scope/trust/version policy still needed |
| site graph retrieval | cross-page structural reasoning | build/update/query complexity |

### Controlled comparison

- Evidence-reuse level: established component-reuse decision; retrieval winner
  unresolved.
- Sources: maintained Crawlee/Playwright implementations, Atlas contract and
  PolyUQuest-style structure-aware evidence.
- Contrary evidence: graph gains are site/question specific; public crawler
  behavior does not define allowed origins or authoritative pages.
- Local design: W3 compares current-page, flat/source-order and graph profiles
  on one acquired/versioned corpus.

### Result

The acquisition/index boundaries are closed: reuse maintained components. Flat
versus graph retrieval remains an experiment for the site's question mix.

### Decision rule

Use Crawlee for allowed-origin acquisition, store versioned section blocks,
and send them through Atlas. Add graph traversal only for declared multi-hop or
topology failures that beat flat retrieval.

### Delivery control

Before model evaluation, prove canonicalization, duplicate handling, crawl
scope, redirects, error pages, content versions and deletion/update behavior.

### Reuse boundary

- Reusable: adapters, block schema and crawl/retrieval test shapes.
- Client-specific: allowed/authenticated pages, canonical URLs, crawl budget,
  authority and change SLA.
- Unsupported: current Website Assistant already crawls or answers across a
  full site.

### Proposal-safe insight

When a widget grows from one page to a whole site, I reuse a maintained crawler
and the existing retrieval service, then spend custom work on source scope,
versioning and acceptance cases instead of rebuilding infrastructure.

### Evidence

- Current seam: `app/lib/retrieval.ts`.
- Audit: `GITHUB_IMPLEMENTATION_AUDIT.md`.
- Future design: W3 in `BENCHMARK_DESIGN.md`.

### Interview follow-up

- Likely question: Why not put crawling directly in the Next.js app?
- Short answer: acquisition has queue, retry, canonicalization, browser and
  scope concerns; a crawler component plus Atlas keeps the widget focused on
  the browser/answer/handoff boundary.
- Deeper evidence: component reuse map and W3 profiles.

### Central index disposition

- Added card: no.
- Reason: duplicate of the central integration decision **Verify an adapter at
  the wire before claiming the integration** plus Atlas retrieval-topology
  card; this note preserves the site-specific composition boundary.

## Use visual page evidence only when semantic content is insufficient

### Client trigger

- Deliverable: answer from diagrams, image-only text, spatial layout or visual
  state on a website.
- Reusable components: Playwright screenshot/DOM capture and Atlas visual
  routing research.

### Failure symptom or unanswered choice

Screenshot models add cost and new grounding/injection failure modes even when
the exact answer already exists in accessible HTML.

### Competing options

| Option | Why plausible | Main cost/failure risk |
| --- | --- | --- |
| semantic DOM/text | cheap, traceable and accessible | misses visual-only facts |
| accessibility tree | compact roles/state | missing ARIA and visual relations |
| screenshot/VLM | sees layout and imagery | model cost, brittle grounding, visual attacks |

### Controlled comparison

- Evidence-reuse level: triangulated external routing answer; local fit
  unresolved.
- Sources: WebMMU, LiveWeb-IE, accessibility representation research and visual
  web-agent security work.
- Contrary evidence: strong basic extraction does not imply complex grounding;
  accessibility/visual channels can be attacked and omit different facts.
- Local design: W4 includes only cases labelled semantic-sufficient versus
  genuinely visual-only.

### Result

Visual evidence is a legitimate specialized profile, not the default Website
Assistant path.

### Decision rule

Use semantic DOM/text first. Test accessibility or screenshot evidence only
when the answer-bearing fact is absent or its meaning depends on visual state.

### Delivery control

Require per-modality evidence/citation correctness and a no-regression result
on text-sufficient cases within the latency/cost budget.

### Reuse boundary

- Reusable: modality labels and Playwright capture seam.
- Client-specific: visual content, accessibility quality, model/provider,
  latency and privacy.
- Unsupported: current project supports visual website QA.

### Proposal-safe insight

I add screenshot understanding only for questions whose evidence is genuinely
visual. Ordinary page facts stay on the faster, more traceable semantic path.

### Evidence

- Research: visual rows in `TECHNIQUE_TAXONOMY.md` and
  `EVIDENCE_MATRIX.csv`.
- Future design: W4 in `BENCHMARK_DESIGN.md`.

### Interview follow-up

- Likely question: Why not use a multimodal model everywhere?
- Short answer: it adds cost and grounding risk without benefit when semantic
  HTML already contains the fact; route it by an observed representation gap.
- Deeper evidence: WebMMU limits and W4 labels.

### Central index disposition

- Added card: no.
- Reason: duplicate of Atlas's existing visual-retrieval routing evidence and
  too narrow for a separate proposal retrieval path.

