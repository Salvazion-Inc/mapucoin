import assert from "node:assert/strict";
import { test } from "node:test";
import { aiJson, aiTxt, robotsTxt } from "../lib/discoverability";

test("mapucoin robots opens place pages and closes the app", () => {
  const body = robotsTxt();
  const agents = body.match(/^User-agent: /gm) || [];
  const signals =
    body.match(/^Content-Signal: search=yes, ai-input=yes, ai-train=yes$/gm) || [];
  assert.equal(signals.length, agents.length);
  assert.ok(agents.length > 20);
  for (const token of [
    "Googlebot",
    "OAI-SearchBot",
    "ChatGPT-User",
    "GPTBot",
    "Claude-SearchBot",
    "PerplexityBot",
    "Google-Extended",
  ]) {
    assert.match(body, new RegExp(`^User-agent: ${token}$`, "m"));
  }
  assert.equal(body.includes("\nDisallow: /\n"), false);
  assert.match(body, /^Disallow: \/api\/$/m);
  assert.match(body, /^Disallow: \/app\/$/m);
  assert.equal(body.includes("Disallow: /destinos"), false);
  assert.equal(body.includes("Disallow: /capsulas"), false);
  assert.match(body, /^Sitemap: https:\/\/mapucoin\.com\/sitemap\.xml$/m);
});

test("mapucoin ai policy allows citation of public pages", () => {
  const text = aiTxt();
  assert.match(text, /^Training: conditional$/m);
  assert.match(text, /^Indexing: allow$/m);
  assert.match(text, /^Training-Deny: \/app\/\*$/m);
  assert.match(text, /Chile por paisaje/);
  const json = JSON.parse(aiJson()) as {
    policies: { indexing: string; training: string };
    site: { url: string };
  };
  assert.equal(json.site.url, "https://mapucoin.com");
  assert.equal(json.policies.indexing, "allow");
  assert.equal(json.policies.training, "conditional");
});
