// Hackathon-grade persistence: one JSON file under data/runtime/.
// IMPORTANT: in Next dev each API route bundles its own module instance,
// so module-level state diverges across routes. The FILE is the single
// source of truth, and the write queue lives on globalThis so every route
// bundle in the process serializes through the same read-modify-write
// chain. Queue tasks are error-isolated: one failed write must never
// poison all subsequent writes.

import { promises as fs } from "fs";
import { tmpdir } from "os";
import path from "path";
import { AppState, emptyState } from "./types";

// ponytail: tmp storage is enough for Vercel demos; use durable storage if state must survive cold starts.
const DIR = process.env.VERCEL
  ? path.join(tmpdir(), "gravity-runtime")
  : path.join(process.cwd(), "data", "runtime");
const FILE = path.join(DIR, "state.json");

const g = globalThis as unknown as { __gravityStateQueue?: Promise<unknown> };
g.__gravityStateQueue ??= Promise.resolve();

function enqueue<T>(task: () => Promise<T>): Promise<T> {
  const run = () => task();
  const p = (g.__gravityStateQueue as Promise<unknown>).then(run, run);
  g.__gravityStateQueue = p.catch(() => {}); // isolate failures from the chain
  return p;
}

export async function getState(): Promise<AppState> {
  try {
    const raw = await fs.readFile(FILE, "utf8");
    return JSON.parse(raw) as AppState;
  } catch {
    return emptyState();
  }
}

export function setState(next: AppState): Promise<void> {
  return enqueue(async () => {
    await fs.mkdir(DIR, { recursive: true });
    await fs.writeFile(FILE, JSON.stringify(next, null, 2));
  });
}

export function updateState(
  fn: (s: AppState) => AppState | void
): Promise<AppState> {
  return enqueue(async () => {
    const s = await getState();
    const result = fn(s);
    const next = (result ?? s) as AppState;
    await fs.mkdir(DIR, { recursive: true });
    await fs.writeFile(FILE, JSON.stringify(next, null, 2));
    return next;
  });
}

export async function resetState(): Promise<AppState> {
  const s = emptyState();
  await setState(s);
  return s;
}
