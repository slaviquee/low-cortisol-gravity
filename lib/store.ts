// Hackathon-grade persistence: one JSON file under data/runtime/.
// Survives dev-server reloads, trivially inspectable, zero deps.

import { promises as fs } from "fs";
import path from "path";
import { AppState, emptyState } from "./types";

const DIR = path.join(process.cwd(), "data", "runtime");
const FILE = path.join(DIR, "state.json");

let cache: AppState | null = null;
let writeQueue: Promise<void> = Promise.resolve();

export async function getState(): Promise<AppState> {
  if (cache) return cache;
  try {
    const raw = await fs.readFile(FILE, "utf8");
    cache = JSON.parse(raw) as AppState;
  } catch {
    cache = emptyState();
  }
  return cache;
}

export async function setState(next: AppState): Promise<void> {
  cache = next;
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
