# Website Assistant GitHub implementation audit

Date: 2026-08-04

Purpose: reuse maintained acquisition, extraction, security and UI components
before writing substantial custom logic. Adoption is based on fit, maintenance and integration cost.

## Current seams

- `public/assistant-widget.js` owns host-page selection, bounding, iframe
  origin/source checks and embed initialization.
- `app/lib/retrieval.ts` owns deterministic/Atlas answer streaming.
- `app/widget/widget.tsx` owns Deep Chat adaptation, citation display,
  retraction and handoff UI.
- `app/lib/handoff.ts` and `app/lib/contracts.ts` own consented handoff and
  bounded input contracts.

Keep those seams. Reuse external projects for page extraction/render/crawl;
reuse Atlas for indexing/retrieval. Do not create a second RAG or browser stack.

## Repository comparison

| Repository and inspected pin | Health on 2026-08-04 | Reusable component | Current defects inspected | Decision |
| --- | --- | --- | --- | --- |
| [mozilla/readability](https://github.com/mozilla/readability) `ab4027a` | active; 308 open issues | small JS main-content parser usable in the host/browser | #1019 omitted transcript, #1020 site failure, #1021 omitted Fandom facts | candidate article profile and benchmark control; never universal fallback without page-type tests |
| [microsoft/playwright](https://github.com/microsoft/playwright) `d5d5b0f` | active same day; 163 open issues | bounded Chromium rendering, DOM/content/screenshot capture | #42109 Windows close hang; #42125 focus race | adopt only for server-side SPA fallback and rendered fixtures; current same-page embed should reuse the visitor DOM |
| [apify/crawlee](https://github.com/apify/crawlee) `2de4841` | active same day; 158 open issues | sitemap/request queue, static/browser crawlers, retries and storage | #3961 lock timeout extension; #3946 v4 extract exports | preferred future crawl substrate; pin stable API and put URL/trust/scope policy around it |
| [adbar/trafilatura](https://github.com/adbar/trafilatura) `c1bc953` | active; 65 open issues | broad extraction benchmark/control with structure/metadata | #896 short pages lose Markdown; #849 inline code duplication | use dataset/control before accepting cross-runtime dependency; a service-side profile is possible only if it wins |
| [plageon/HtmlRAG](https://github.com/plageon/HtmlRAG) `93de4a6` | last code 2025-06; 3 open issues | HTML cleaning, block tree and pruning reference | #19 rerank script fails; no release history observed | copy/refit the bounded structural algorithm only after deterministic block tests; do not import the research stack wholesale |
| [OvidijusParsiunas/deep-chat](https://github.com/OvidijusParsiunas/deep-chat) upstream `4861419`; project adoption `83172c5`/2.5.0 | active; 36 open issues | chat web component/React UI and custom stream handler | #509 parallel tool streaming loop | retain current adopted UI; extraction and tool policy stay outside it; upgrade only with build/stream regression |
| [cure53/DOMPurify](https://github.com/cure53/DOMPurify) `1c29e65` | active; one open issue | sanitize untrusted HTML before rendering | no current open functional defect returned | reuse if external HTML is ever rendered; explicitly not a semantic prompt-injection defense |
| [murrough-foley/web-content-extraction-benchmark](https://huggingface.co/datasets/murrough-foley/web-content-extraction-benchmark) dataset snapshot dated 2026-05 | 2,008 pages/1,613 domains; held-out split | page HTML, ground truth, page-type labels and baseline comparison | new benchmark; assisted annotation pipeline and transfer need review | reuse a stratified subset plus held-out labels; keep local site fixtures |

## Reuse map before custom logic

| Need | First source to reuse | Thin project-owned adapter |
| --- | --- | --- |
| article/main-content candidate | Mozilla Readability | return normalized blocks with selector/heading/source provenance |
| broad extraction comparison | WCXB labels and Trafilatura outputs | common token/block recall/noise scorer; no production dependency required |
| dynamic SPA content | Playwright | static-first route, bounded navigation/time/resource policy, rendered DOM capture |
| sitemap/multi-page acquisition | Crawlee | allowed origins/routes, canonicalization, content hashes and Atlas ingest records |
| structure-preserving HTML | HtmlRAG block-tree idea | deterministic clean/block/prune adapter before any learned reranker |
| retrieval/citations | existing Atlas API | map page section/version/hash into current source schema |
| chat UI | existing pinned Deep Chat | keep stream/retraction/handoff adapter and regression tests |
| XSS/unsafe rendered markup | DOMPurify | sanitize only the fragment that will be rendered; still run semantic security tests |

## Explicit non-adoptions

- Do not combine Readability, Trafilatura and HtmlRAG in production before a
  page-type comparison identifies a unique operating region.
- Do not write a crawler, browser driver, content queue or RAG index from
  scratch; Crawlee, Playwright and Atlas already expose the relevant seams.
- Do not launch Playwright for the current page when the embed can receive the
  visitor's already-rendered, authorized DOM snapshot.
- Do not call DOMPurify a prompt-injection defense. It addresses unsafe markup,
  not semantic instructions in valid text.
- Do not add visual/screenshot models unless a held-out answer genuinely
  depends on information absent from semantic DOM/text.
- Do not treat a single overall extraction F1 as permission to delete product,
  listing, service or multilingual content.

## Minimal integration checks

1. Preserve canonical URL, heading/selector, capture time and content hash for
   every extracted block.
2. Pass an article, product/service, navigation-heavy, short, table/list and
   rendered-SPA success case plus a bot/error/empty-shell failure case.
3. Assert relevant-content recall and noise separately; a clean empty result is
   not success.
4. Prove page content cannot change tool permissions, handoff consent or the
   system task, and report benign false refusals.
5. Keep unavailable/retraction behavior when extraction/retrieval fails.
6. Disable every optional extractor/render/crawl profile without breaking the
   current-page control.

