import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render(path = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}-${path}`);
  const { default: worker } = await import(workerUrl.href);
  return worker.fetch(
    new Request(`http://localhost${path}`, { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders the distinct sample storefront and embed hook", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Switchback Cycle Co\./);
  assert.match(html, /data-assistant-context/);
  assert.match(html, /assistant-widget\.js/);
  assert.match(html, /Ask Switchback/);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton|Case workspace|Research company knowledge/i);
});

test("widget route exposes the adopted Deep Chat boundary and handoff", async () => {
  const response = await render("/widget");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /Trail desk/);
  assert.match(html, /Contact the workshop/);

  const source = await readFile(new URL("../app/widget/widget.tsx", import.meta.url), "utf8");
  assert.match(source, /import\(\"deep-chat-react\"\)/);
  assert.match(source, /stream:\s*true/);
  assert.match(source, /overwrite:\s*true/);
  assert.match(source, /HANDOFF|Contact the workshop/i);
});

test("embed script bounds page context and validates postMessage origin", async () => {
  const script = await readFile(new URL("../public/assistant-widget.js", import.meta.url), "utf8");
  assert.match(script, /data-assistant-context/);
  assert.match(script, /slice\(0, 6000\)/);
  assert.match(script, /event\.origin !== targetOrigin/);
  assert.match(script, /event\.source !== frame\.contentWindow/);
});
