// Hackathon-grade persistence: one JSON file under data/runtime/.
// IMPORTANT: in Next dev each API route bundles its own module instance,
// so module-level caches diverge across routes. The FILE is the single
// source of truth — always read from disk, keep only a write queue.

import { promises as fs } from "fs";
import path from "path";
import { AppState, emptyState } from "./types";

const DIR = path.join(process.cwd(), "data", "runtime");
const FILE = path.join(DIR, "state.json");

let writeQueue: Promise<void> = Promise.resolve();

export async function getState(): Promise<AppState> {
  try {
    const raw = await fs.readFile(FILE, "utf8");
    return JSON.parse(raw) as AppState;
  } catch {
    return emptyState();
  }
}

export async function setState(next: AppState): Promise<void> {
  writeQueue = writeQueue.then(async () => {
    await fs.mkdir(DIR, { recursive: true });
    await fs.writeFile(FILE, JSON.stringify(next, null, 2));
  });
  await writeQueue;
}

export async function updateState(
  fn: (s: AppState) => AppState | void
): Promise<AppState> {
  const s = await getState();
  const result = fn(s);
  const next = (result ?? s) as AppState;
  await setState(next);
  return next;
}

export async function resetState(): Promise<AppState> {
  const s = emptyState();
  await setState(s);
  return s;
}
