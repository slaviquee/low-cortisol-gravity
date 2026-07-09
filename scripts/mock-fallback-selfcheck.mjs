import { spawn } from "node:child_process";
import assert from "node:assert/strict";

const port = 3217;
const base = `http://127.0.0.1:${port}`;
const env = { ...process.env, GRAVITY_MOCK: "1", PORT: String(port) };

const dev = spawn("npm", ["run", "dev", "--", "--port", String(port)], {
  env,
  stdio: ["ignore", "pipe", "pipe"],
});

async function waitForServer() {
  for (let i = 0; i < 80; i++) {
    try {
      const res = await fetch(`${base}/api/state`, { cache: "no-store" });
      if (res.ok) return;
    } catch {}
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error("server did not start");
}

async function json(path, init) {
  const res = await fetch(`${base}${path}`, {
    ...init,
    headers: { "content-type": "application/json", ...(init?.headers ?? {}) },
  });
  assert.equal(res.ok, true, `${path} ${res.status}`);
  return res.json();
}

async function pollDone() {
  for (let i = 0; i < 80; i++) {
    const state = await json("/api/state");
    if (state.run_done) return state;
    await new Promise((r) => setTimeout(r, 300));
  }
  throw new Error("pipeline did not finish");
}

try {
  await waitForServer();
  await json("/api/run", {
    method: "POST",
    body: JSON.stringify({
      website: "loopwell.io",
      targets: ["aquila-systems.com", "bluenote.io"],
    }),
  });
  await json("/api/run", {
    method: "POST",
    body: JSON.stringify({
      website: "freshgravity.io",
      targets: ["aquila-systems.com", "bluenote.io"],
    }),
  });
  let state = await pollDone();
  assert.equal(state.input.website, "freshgravity.io");
  assert.equal(state.log.some((line) => line.msg.includes("loopwell.io")), false);
  assert.equal(state.mock, true);
  assert.ok(state.prospects.some((p) => p.id === "jane-kowalski"));
  assert.ok(state.plan.some((p) => p.id === "p-tue-post"));

  await json("/api/radar", { method: "POST", body: "{}" });
  await json("/api/radar", { method: "POST", body: "{}" });
  state = await json("/api/state");
  assert.ok(state.warm.some((w) => w.serendipity));

  await Promise.all([
    json("/api/plan", {
      method: "PATCH",
      body: JSON.stringify({ id: "p-tue-post", done: true }),
    }),
    json("/api/plan", {
      method: "PATCH",
      body: JSON.stringify({ id: "p-tue-comment", done: true }),
    }),
  ]);
  state = await json("/api/state");
  assert.equal(state.plan.find((p) => p.id === "p-tue-post")?.done, true);
  assert.equal(state.plan.find((p) => p.id === "p-tue-comment")?.done, true);
  console.log("mock fallback self-check passed");
} finally {
  dev.kill("SIGTERM");
}
