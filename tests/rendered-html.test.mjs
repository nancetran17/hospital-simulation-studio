import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import test from "node:test";

const templateRoot = new URL("../", import.meta.url);

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the hospital simulation workspace", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>Hospital Simulation Studio<\/title>/i);
  assert.match(html, /Hospital Simulation Studio/);
  assert.match(html, /Space and staffing simulator/);
  assert.match(html, /Emergency department/);
  assert.match(html, /Scenario comparison/);
  assert.match(html, /Optimization mix/);
  assert.doesNotMatch(html, /codex-preview|react-loading-skeleton/i);
  assert.doesNotMatch(html, /Your site is taking shape/i);
});

test("removes starter preview code and dependency", async () => {
  const [page, layout, packageJson, css] = await Promise.all([
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../app/layout.tsx", import.meta.url), "utf8"),
    readFile(new URL("../package.json", import.meta.url), "utf8"),
    readFile(new URL("../app/globals.css", import.meta.url), "utf8"),
  ]);

  assert.match(packageJson, /"name": "hospital-simulation-studio"/);
  assert.doesNotMatch(packageJson, /react-loading-skeleton/);
  assert.match(layout, /Hospital Simulation Studio/);
  assert.match(page, /function simulate\(/);
  assert.match(page, /Space heatmap/);
  assert.match(css, /\.floorplan/);
  assert.doesNotMatch(page, /SkeletonPreview|codex-preview/);

  await assert.rejects(access(new URL("app/_sites-preview", templateRoot)));
});
