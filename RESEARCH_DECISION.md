# Website Assistant research decision

Date: 2026-08-04

## Outcome

Website Assistant's systematic evidence gate is `PASS`. Its experiment and
overall technique-ceiling gates remain `PARTIAL`: W0-W4 are designs, not
results.

The project remains distinct from Atlas. Website Assistant owns browser/embed,
site acquisition, page representation, untrusted-content handling, streaming
presentation and handoff. Atlas remains the optional multi-page indexing/
retrieval component. ContextSidecar was neither inspected nor used.

## Retained families

| Family | Decision | Operating region |
| --- | --- | --- |
| semantic/data-attribute blocks | core control | owner-controlled current pages |
| raw text | benchmark control | recall floor and failure diagnosis |
| Mozilla Readability | first experiment | article/documentation pages |
| broad heuristic or cleaned HTML | first experiment, dependency only if it wins | structured/noisy pages |
| Playwright rendering | specialized | static empty shell or material content delta |
| section-level source blocks | first experiment | long current pages and citation provenance |
| Crawlee + Atlas | future multi-page profile | sitemap/cross-page site knowledge |
| hyperlink/DOM/entity graph | deferred | declared cross-page/multi-hop questions |
| accessibility/visual evidence | deferred | answer absent from semantic DOM/text |
| content hash/version/change invalidation | invariant for indexed sources | freshness-sensitive site answers |
| EN/LT routed evaluation | required profile gate | multilingual site support |
| untrusted-data separation/least privilege/task checks | security experiment | every page-content path |
| citation, unavailable, retraction, consented handoff | core invariants | every answer profile |

## Rejected duplicates and premature adoption

- No second RAG/index implementation; use Atlas behind the existing contract.
- No custom crawler or browser engine; use Crawlee/Playwright when W3/W1 admits
  those profiles.
- No extractor ensemble by default. Readability, Trafilatura and HtmlRAG-style
  blocks must earn distinct page-type regions.
- No always-render policy; reuse the visitor's DOM for the current page and
  route server crawling from static to browser only on a measurable signal.
- No DOMPurify-as-prompt-defense claim; markup safety and instruction authority
  are separate.
- No visual model for evidence already present in semantic text.
- No multilingual claim from Unicode tokenization or a model card.

## External answers versus open questions

| Question | Evidence reuse | Status |
| --- | --- | --- |
| universal generic extractor | WCXB and implementation evidence | closed: none |
| render every page | cost/behavior evidence | closed: static/host first, routed render |
| sanitizer prevents semantic injection | security literature | closed: no |
| visual default | multimodal benchmarks/limits | closed: no |
| best extractor by project page type | public evidence does not match exact site mix | unresolved; W1 |
| best defense utility/ASR tradeoff | model/task/attack dependent | unresolved; W2 |
| flat versus graph multi-page retrieval | site topology/question distribution dependent | unresolved; W3 |
| EN/LT route and thresholds | no representative LT website result | unresolved; W4 |
| freshness schedule | client CMS/change/SLA dependent | unresolved; W3 |

## Exact next controlled work

1. W0: adapt WCXB and local page/QA/security/version labels to the shared
   evidence contract and prove mutation sensitivity.
2. W1: compare raw, semantic allowlist, Readability, one broad heuristic,
   deterministic structure-preserving HTML and static/rendered acquisition.
3. W2 only after W1: security/utility ablations on the retained evidence paths.
4. W3 only after the current-page decision: Crawlee acquisition plus Atlas
   flat retrieval, then graph only for multi-hop failures.
5. W4 after stable blocks: EN/LT and visual-only routing.

No work above was implemented or executed in this slice.

## Eleven systematic evidence gates

| Gate | Status | Evidence |
| --- | --- | --- |
| Problem decomposition | PASS | acquisition through evaluation split in `TECHNIQUE_TAXONOMY.md` |
| Search protocol | PASS | dated sources, rules and ten iterations |
| Survey coverage | PASS | 2026 systematic web scraping/crawling review plus current benchmark overviews |
| Benchmark coverage | PASS | WCXB, HtmlRAG, LiveWeb-IE, WebMMU, GaRAGe, freshness and injection suites |
| Existing-answer search | PASS | externally closed questions separated from W0-W4 |
| Technique-family saturation | PASS | iterations 8 and 9 added no family |
| Candidate comparison | PASS | `EVIDENCE_MATRIX.csv` records quality, cost, health, failures and fit |
| Contrary evidence | PASS | page-type failures, dynamic/static limits, multilingual gaps, stale evidence and defense utility recorded |
| Implementation evidence | PASS | exact GitHub pins, defects and reuse seams in `GITHUB_IMPLEMENTATION_AUDIT.md` |
| Portfolio fit | PASS | browser/site boundary is distinct; Atlas reused, duplicate RAG/crawler rejected |
| Review status | PASS | all conclusions labelled established/provisional/contested/unknown |

## Claim boundary

Defensible now: the existing project proves its bounded one-script embed,
Deep Chat adaptation, current-page/Atlas stream contract, citation/no-match/
retraction behavior and consented idempotent handoff; the dossier supplies a
pinned, systematic plan for page extraction, dynamic routing, site retrieval,
freshness, multilingual and adversarial evaluation.

Not defensible now: measured extraction/answer accuracy, SPA or multi-page
coverage, English/Lithuanian quality, prompt-injection prevention, live crawl,
freshness SLA, named integration, conversion lift or production scale.

