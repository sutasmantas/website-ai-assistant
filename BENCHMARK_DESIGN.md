# Website Assistant benchmark design

Date: 2026-08-04

Status: design only. No crawl, browser run, provider call or experiment was
performed in this slice.

## Questions closed by external evidence

| Question | Evidence-reuse level | Closed decision |
| --- | --- | --- |
| Can one generic extractor be assumed best for every page? | triangulated comparative answer | no; WCXB page-type results and implementation defects require routing/controls |
| Should every server-side page be rendered in a browser? | established operating tradeoff | no; static-first, rendered fallback; the current embed reuses its already-rendered host DOM |
| Does sanitizing HTML make page content safe for an LLM? | established security distinction | no; XSS sanitization and semantic instruction authority are separate controls |
| Can a current-page 6,000-character snapshot support a multi-page claim? | established architectural answer | no; multi-page work requires versioned section acquisition and retrieval |
| Do English results establish Lithuanian quality? | established multilingual benchmark answer | no; languages and locale-sensitive cases are separate strata |
| Is visual extraction a default upgrade? | triangulated external answer | no; route it only to answer-bearing evidence absent from semantic DOM/text |

## Common evidence contract

Every extracted unit has `canonical_url`, `capture_time`, `content_hash`,
`page_type`, `render_mode`, `language`, `heading_path`, `selector_or_block_id`,
`visible_text`, `structured_markup` when retained, and `security_flags`.
Answers cite the exact unit and version. The comparison stores raw HTML,
rendered DOM snapshot when applicable, ground-truth answer-bearing spans,
questions/answers, model/provider and case-level metrics.

### Frozen corpus

- Public controls: stratified WCXB pages from articles, documentation,
  products, services, collections, listings and forums; development labels for
  tuning and held-out labels untouched until final evaluation.
- Project fixtures: 96 development and 96 held-out pages grouped by base
  template/domain before split.
- Per split: 16 article/documentation, 16 product/service, 16 navigation/noise,
  16 SPA/dynamic, 16 multilingual (8 EN, 8 LT paired and native cases), and 16
  adversarial/benign-trigger controls.
- Mutations: reordered sections, inserted nav/cookie/ad text, renamed classes,
  hidden/expanded content, duplicated headings, delayed hydration, empty shell,
  altered facts, removed/changed JSON-LD, Unicode obfuscation and indirect
  instructions.
- Each non-security page has answerable and unanswerable questions, annotated
  answer spans/sections and allowable citations. Security cases add authorized
  task and forbidden-output/action predicates.

### Metrics

- extraction token/block precision, recall and F1; answer-bearing recall;
- noise ratio, structural element recall (headings, lists, tables, links),
  truncation loss and empty/error-page detection;
- exact/semantic answer correctness, citation support/source/version match,
  unsupported-answer and false-refusal rates;
- mutation consistency and per-page-type/language results;
- stale-answer duration, latest-version selection and change recovery;
- indirect prompt-injection attack success, unauthorized effect/output,
  benign utility and over-defense;
- acquisition/extraction/retrieval/generation p50/p95 latency, input/output
  tokens, provider cost, peak process/browser memory and stored bytes.

Exact/evidence-span checks precede a calibrated semantic rubric. An LLM judge
cannot be the only truth source. Stochastic generation/defense profiles run at
least five trials per held-out question; deterministic extraction runs once
plus all mutations.

## W0 — corpus and scorer reconciliation

### Hypothesis

WCXB extraction labels plus locally annotated QA/security/version fields can be
represented through one block/source/answer contract without confusing clean
text with answer usefulness.

### Work and gate

- Reuse WCXB data/labels and public baseline output formats before writing a
  new extraction dataset loader.
- Hand-review 10 pages per public page type and all local templates.
- Delete one answer-bearing block, inject one high-noise block and swap one
  source version; the scorer must detect every mutation.
- PASS requires exact metadata/version checks, at least 0.98 reviewer agreement
  on answer-bearing block labels, and zero silent treatment of bot/error/empty
  pages as content.

Budget: CPU only, four hours, no provider spend, under 2 GB snapshots. Reuse
ProofGrid's shared result shape if available, but this slice does not modify or
depend on ContextSidecar.

## W1 — extraction and render routing (exact first experiment)

### Hypothesis

Owner-controlled semantic blocks are the best fast default; Readability helps
article pages; a broader heuristic/structure-preserving path helps some
structured pages; rendered acquisition is useful only when static/host content
is materially incomplete.

### Profiles

1. raw bounded `textContent` control;
2. current semantic/data-attribute allowlist with deterministic block IDs;
3. Mozilla Readability;
4. one broad WCXB-leading heuristic output (Trafilatura/rs-trafilatura) as an
   offline comparison before any cross-runtime integration;
5. deterministic cleaned/pruned HTML blocks inspired by HtmlRAG;
6. static fetch versus Playwright-rendered acquisition for dynamic strata.

Generation is held fixed first with extractive answer spans. Only extraction
profiles that pass answer-bearing recall proceed to the same Atlas-compatible
answer generator.

### Promotion/routing rules

- Semantic allowlist remains default on controlled pages if held-out
  answer-bearing recall is within 2 points of the best and noise is lower.
- Readability is retained only for article/documentation strata with at least
  +5 F1 or materially lower noise and no more than 1-point answer-bearing
  recall loss versus allowlist/raw controls.
- A broad/HTML-aware profile must uniquely win at least one structured page
  type by 5 points while staying inside a 1-second extraction p95 and preserving
  source structure; otherwise reject the dependency.
- Render only when static/host extraction misses at least 10% answer-bearing
  content or produces an empty shell and the rendered path recovers it within
  the page latency/RAM budget.
- Fail any profile that treats an access-denied, bot challenge or generic error
  as answer evidence.

### Budget

CPU host with at most two concurrent browser contexts, 6 hours, 1.5 GB peak
browser RAM, 10-second page timeout, 30-second hard case timeout, USD 30 maximum
generation cost, no authenticated/private sites.

## W2 — untrusted-content utility/security tradeoff

### Hypothesis

Structured data/instruction separation, Unicode normalization, source
attribution and least privilege/task-output checks reduce semantic injection
more reliably than HTML sanitization or warning text alone.

### Profiles

- untrusted-context warning baseline;
- DOMPurify only for any rendered markup (XSS control, expected not to solve
  semantic attacks);
- normalization/delimiters;
- content-source/task/output validation;
- an independently pinned Task-Shield-like detector/check;
- combinations only after individual ablations.

### Gates

Run 40 benign and 40 adversarial held-out pages, five trials. Unauthorized
handoff/tool effects and disclosure of protected/system content must be zero.
Retain a semantic defense only if attack success falls materially while benign
answer/citation success loses no more than 3 points and false refusal is
reported. Do not reuse a web-agent attack score without the Website Assistant's
read-mostly and consented-handoff predicates.

Budget: USD 30, four hours, local fake webhook only, no external writes.

## W3 — multi-page retrieval and freshness

### Hypothesis

Crawlee acquisition plus versioned section blocks and Atlas flat retrieval
solves ordinary cross-page questions; hyperlink/DOM/entity graph traversal adds
value only for explicitly multi-hop/topology questions.

### Corpus/profiles

- Freeze 6 small public sites or permissioned snapshots, 50-200 pages each,
  with sitemap-present/absent, duplicate, redirected, changed and SPA cases.
- 120 questions: local-page, cross-page comparison, multi-hop, global/site
  summary, stale-fact and unanswerable.
- Compare current-page, flat section sparse/hybrid Atlas, source-order grouped
  sections and a graph/topology profile only for declared multi-hop cases.
- Apply fact changes at T0 and measure immediate, scheduled and unchanged-index
  policies.

### Routing rules

Current page owns questions whose answer-bearing block is present in the live
snapshot. Flat section retrieval is the multi-page control. Retain a graph only
if it improves held-out multi-hop/cross-page answer/citation correctness by at
least 5 points without violating latency/storage/freshness hard limits. Every
answer exposes captured-at/version; stale-answer duration must remain below the
client-defined bound.

Budget: 1,000 pages, 2 GB corpus/index, 8 hours, USD 50, only allowed origins,
10-second fetch/render timeout and no login/paywall bypass.

## W4 — English/Lithuanian and visual-only routes

Deferred until W1 establishes trustworthy blocks. Compare direct multilingual
and translate-test routes on separately reviewed EN/LT answer/citation/
unavailable cases. Test accessibility-tree or screenshot evidence only on
questions explicitly annotated as missing from semantic DOM/text. Promotion is
per language and evidence modality; no aggregate score can hide an LT or
text-sufficient regression.

## Confounders and stopping rules

- Freeze page snapshots for method comparison; run live/freshness tests as a
  separate dated track.
- Keep acquisition, extraction, retrieval and generation results separate so a
  model cannot mask missing content with prior knowledge.
- Compare page types and answer-bearing recall, not only overall content F1.
- Keep the same question, evidence budget, generator and security permissions
  across profiles.
- Stop at W1 if the current allowlist plus routed Readability/render fallback
  dominates broader methods; a neural extractor is not mandatory.
- Stop a security case at an unauthorized attempted effect and record attempted
  versus executed actions separately.

