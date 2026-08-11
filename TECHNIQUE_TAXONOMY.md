# Website Assistant technique taxonomy

Date: 2026-08-04

Status: systematic research dossier; no implementation is authorized here.
Conclusions use `established`, `provisional`, `contested`, or `unknown`.

## Decision boundary

Website Assistant is an embedded, cited site-information assistant with an
explicit unavailable/human-handoff path. The paid outcome is a correct answer
from authorized current site evidence, not autonomous browsing. General web
search, transactions, arbitrary navigation, website generation and a second
private-document RAG platform are outside this dossier.

The current baseline uses a one-script iframe embed and adopted Deep Chat UI.
The host passes at most 6,000 characters selected by
`[data-assistant-context]` (or a bounded page fallback), and the service either
uses a deterministic fixture or streams through Atlas. It supports citations,
late retraction, explicit no-match, rate limits and consented idempotent
handoff. It has not measured extraction, answer or security behavior across
page types, SPAs, languages, changes or adversarial content.

## Problem decomposition

| Layer | Independent decision | Serious families | Current boundary |
| --- | --- | --- | --- |
| Embed/isolation | attach UI without taking over the host | iframe script; web component; framework component | iframe launcher plus Deep Chat |
| Acquisition | obtain what a visitor can currently see | static fetch; host DOM snapshot; headless rendered browser; screenshot/vision | host-provided current-page text |
| Content extraction | retain answer-bearing content and discard boilerplate | raw text; semantic/data-attribute allowlist; JSON-LD; Readability; general heuristic extractor; HTML-aware/neural extractor; accessibility tree | explicit allowlist/fallback text, 6,000-character truncation |
| Structure preservation | retain headings, lists, tables and provenance | flat text; Markdown; cleaned/pruned HTML/DOM blocks; visual layout | flat text plus page URL/title |
| Scope | decide how many pages are evidence | current section/page; page-section index; sitemap/crawl; hyperlink/DOM/entity graph | current page only |
| Dynamic behavior | decide when JavaScript rendering is required | static-first detection; always render; route to browser on shell/content delta | host browser has rendered the page; no server-side route |
| Retrieval | select evidence within/between pages | lexical/filter; dense/hybrid; section retrieval; graph traversal | deterministic overlap or Atlas hybrid |
| Freshness | bind an answer to the site version | live per-request snapshot; content hash/version; scheduled crawl; mutation/change invalidation | current browser snapshot but synthetic fixed source version |
| Language | preserve query/evidence language and locale | direct multilingual; translate-retrieve/answer; per-language routes | Unicode tokenization; no EN/LT evaluation |
| Untrusted-content security | prevent page text from gaining instruction authority | data/instruction separation; normalization; sanitizer; least privilege; task/output checks; attack detector | prompt says page is untrusted; no adversarial benchmark |
| Answer/verification | produce cited answer or decline | extractive; single-pass grounded; claim/citation checks; no-answer gate | deterministic/external stream, citation/unavailable/retraction |
| Handoff | transfer unsupported/high-touch requests | inline contact; webhook/CRM event; live chat | consented generic idempotent webhook |
| Evaluation | measure extraction, answers, freshness, security and UX separately | content F1; QA/citation; mutation; stale-answer; utility/ASR; latency | focused contract/build tests only |

## Technique families and operating regions

### Semantic allowlists and structured data — `established local control`

Explicit `main`, landmark, content attributes, stable section selectors and
JSON-LD are the cheapest high-precision path when the site owner controls the
markup. They should remain the mandatory control because a generic extractor
can delete product/service sections or retain navigation. Selectors require
mutation tests and a fallback; JSON-LD can be incomplete or differ from visible
content.

### Mozilla Readability and general heuristic extraction — `established family`, `page-type dependent`

Readability is a focused article/main-content extractor. WCXB shows that
extractors converge on articles but diverge sharply on products, collections,
listings, forums and service pages; Readability is not a universal website
assistant parser. Trafilatura/rs-trafilatura are stronger broad benchmark
controls but add a Python/Rust integration surface to this TypeScript project.
Promote an extractor by page type and answer-bearing recall, not overall F1.

### Cleaned/pruned HTML (HtmlRAG) — `provisional`

HtmlRAG shows that cleaned structure-preserving HTML can outperform flattened
text on six QA datasets, but adds cleaning, compression and model-based block
pruning. Its research implementation is not an automatic dependency. The
first comparison should test whether deterministic semantic blocks preserve
enough structure before adding neural pruning.

### Static versus rendered-browser extraction — `established routing need`

Static HTML is cheaper and safer to scale. JavaScript-heavy pages can arrive as
empty shells, so Playwright-class rendering is a distinct profile. Because the
current embed already runs in the visitor's rendered browser, same-page
extraction should use the host DOM rather than launch another browser. A server
crawler needs a static-first shell/content-delta detector and a bounded
rendered fallback.

### Accessibility-tree and visual/screenshot evidence — `provisional specialized profiles`

Accessibility trees compress roles, labels and state but inherit missing or
misleading semantics. Visual evidence can recover layout-only/image-only facts,
while WebMMU and web-agent benchmarks show grounding and multilingual gaps.
Neither belongs in the default current-page FAQ path. Test them only when the
answer is not present in cleaned semantic DOM/text.

### Page-section indexing and multi-page site retrieval — `established need`, `unknown winner`

Once answers span pages, 6,000 current-page characters are insufficient.
Section-level source blocks, sitemap/crawl acquisition and Atlas retrieval form
the simple control. Hyperlink/DOM/entity graphs such as PolyUQuest are eligible
only for cross-page or multi-hop questions that beat flat section retrieval.
Reuse Crawlee for acquisition and Atlas for indexing/retrieval; do not build a
second crawler/RAG stack from scratch.

### Freshness and change handling — `established need`, `unknown policy`

Static snapshots do not predict live pages, and outdated evidence can distract
answers even when newer information is present. Every source needs captured-at,
content version/hash and canonical URL. Live current-page context is fresh for
that view; a multi-page index needs change detection, invalidation and an
acceptance threshold for maximum stale-answer duration.

### Multilingual answering — `established evaluation need`, `unknown route`

Multilingual and locale-sensitive benchmarks show English results do not
transfer automatically. English and Lithuanian extraction, retrieval,
answering, citation and no-answer behavior require separate strata. Direct
multilingual and translate-test routes are candidates; neither is selected by
model-card language lists.

### Untrusted-content controls — `established threat`, `unknown best defense`

Page HTML/text is data, never authority over tools, policies or system
instructions. DOMPurify mitigates unsafe markup/XSS but does not remove a
well-formed malicious sentence. Delimiting/normalizing data, least privilege,
source attribution, task/output checks and explicit human action compose;
security must report benign utility, false refusals and attack success. This
assistant currently has no page-controlled write tool, which is a valuable
blast-radius limit.

### Answer, citation, refusal, retraction and handoff — `established invariants`

Extraction quality is not answer quality. Evaluate evidence recall, answer/
citation correctness and unavailable behavior separately. Preserve source URL,
section and capture version. Late stream invalidation must retract visible text,
and handoff must require consent and stable idempotency.

## Benchmark map

| Workload | Public evidence | Limitation |
| --- | --- | --- |
| main-content extraction across page types | WCXB (2,008 pages, seven types) | new preprint and assisted annotations; extraction F1 is not QA correctness |
| article/boilerplate controls | Mozilla Readability and Trafilatura evaluations | many older sets are article-heavy or stale |
| structure-preserving Web RAG | HtmlRAG | six QA datasets do not reproduce this embed, page mutations or security |
| dynamic/live extraction | LiveWeb-IE plus local static/rendered fixtures | live sites drift and may block automation; visual framework is not a default |
| multilingual/visual website understanding | WebMMU | includes code generation and four languages, not Lithuanian site support |
| dynamic knowledge/freshness | HoH and DynaQuest | Wikipedia-based changes differ from client CMS behavior |
| grounded answer/refusal | GaRAGe | mixed web/private retrieval; judge/human-annotation transfer limits |
| indirect prompt injection | AgentDojo, Task Shield, WebInject, ST-WebAgentBench | many test autonomous actions; Website Assistant is narrower/read-mostly |
| multi-page site QA | generated public-site corpus, sitemap/crawl fixtures, PolyUQuest-style categories | no single benchmark matches client site topology and source authority |
| realistic local acceptance | frozen static/noisy/SPA/EN/LT/adversarial pages | product-specific and small; must retain public controls |

## Search protocol

- Search date: 2026-08-04.
- Sources: ACL Anthology, arXiv, official project/benchmark pages, maintained
  GitHub repositories and live issue metadata.
- Main window: 2024-2026; older extraction implementations were retained when
  still maintained and used as current controls.
- Included: systematic reviews, comparative datasets, negative results,
  security work, official docs and runnable code.
- Excluded: SEO/vendor rankings without fixtures, autonomous transactions,
  general website generation, popularity-only comparisons, and all license
  research/ranking.

### Reproducible query iterations

| Iteration | Query families | New decision-relevant family |
| ---: | --- | --- |
| 0 | `2025/2026 HTML RAG webpage extraction DOM benchmark` | raw/semantic/heuristic/structure-preserving extraction |
| 1 | `dynamic SPA rendered browser website QA benchmark` | static versus rendered routing |
| 2 | `web prompt injection untrusted content benchmark` | explicit content-authority/security boundary |
| 3 | `HtmlRAG Readability Trafilatura comparison` | page-type routing and cleaned/pruned HTML |
| 4 | `multilingual website QA dynamic freshness benchmark` | separate language and freshness profiles |
| 5 | official GitHub audit: Readability, Playwright, Crawlee, Trafilatura, HtmlRAG, Deep Chat, DOMPurify | no family; selected maintained components and defects |
| 6 | `accessibility tree screenshot visual website understanding` | accessibility and visual/layout-only profiles |
| 7 | `sitemap multi-page cross-page web RAG structure graph` | hyperlink/DOM/entity graph as specialized multi-page retrieval |
| 8 | `website assistant extraction handoff unavailable injection recent` | no new family; added benchmark/security limits |
| 9 | `systematic review web scraping/RAG static dynamic multilingual adversarial` | no new family; confirmed taxonomy and operational metrics |

Iterations 8 and 9 are consecutive expansions with no new decision-relevant
family after cross-page structure-aware retrieval was added. Saturation is
`PASS` for the dated scope.

## Primary survey and benchmark anchors

- [WCXB](https://arxiv.org/abs/2605.21097)
- [HtmlRAG](https://arxiv.org/abs/2411.02959)
- [LiveWeb-IE](https://arxiv.org/abs/2603.13773)
- [WebMMU](https://aclanthology.org/2025.emnlp-main.1276/)
- [GaRAGe](https://aclanthology.org/2025.findings-acl.875/)
- [HoH freshness benchmark](https://aclanthology.org/2025.acl-long.301/)
- [WebInject](https://aclanthology.org/2025.emnlp-main.104/)
- [Task Shield](https://aclanthology.org/2025.acl-long.1435/)
- [Systematic review of LLM scraping/crawling](https://link.springer.com/article/10.1007/s00607-026-01666-5)
- [PolyUQuest](https://arxiv.org/abs/2607.08269)

