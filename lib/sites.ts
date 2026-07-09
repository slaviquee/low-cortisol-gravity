// Multi-site snapshots. The active run stays in data/runtime/state.json —
// the pipeline's single source of truth stays untouched. Each website's
// latest world is archived under data/runtime/sites/<slug>.json, so running
// a second website no longer clobbers the first. Switching = archive the
// active world → load the chosen snapshot into state.json. The pipeline's
// run-id guard (updateRunState checks run_started_at) drops writes from a
// run that is no longer active, so switching mid-run is safe; switching
// back restores the snapshot and future writes resume.

import { promises as fs } from "fs";
import { tmpdir } from "os";
import path from "path";
import { AppState } from "./types";
import { getState, setState } from "./store";
import { updateBrain } from "./brain";
import { buildWorld, buildBrain } from "@/data/demo-seeds";
import { MOCK_COMPANIES } from "@/data/demo-companies";
import { REAL_COMPANIES } from "@/data/demo-companies-real";

const ALL_SPECS = [...REAL_COMPANIES, ...MOCK_COMPANIES];

// Mirrors the DIR logic in lib/store.ts (kept local to avoid touching it).
const DIR = process.env.VERCEL
  ? path.join(tmpdir(), "gravity-runtime")
  : path.join(process.cwd(), "data", "runtime");
const SITES_DIR = path.join(DIR, "sites");

const RUN_STALE_MS = 15 * 60_000; // a "running" flag older than this is a dead run

export interface SiteMeta {
  slug: string;
  website: string;
  active: boolean;
  running: boolean;
  run_done: boolean;
  prospects: number;
  updated_at: string | null;
}

export function siteSlug(website: string): string {
  const host = website
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .split(/[/?#]/)[0];
  return host.replace(/[^a-z0-9.-]/g, "_") || "site";
}

function isRunning(s: AppState): boolean {
  if (s.run_done || !s.run_started_at) return false;
  const started = Date.parse(s.run_started_at);
  return Number.isFinite(started) && Date.now() - started < RUN_STALE_MS;
}

function toMeta(
  slug: string,
  s: AppState,
  active: boolean,
  updatedAt: string | null
): SiteMeta {
  return {
    slug,
    website: s.input.website || slug,
    active,
    running: isRunning(s),
    run_done: s.run_done,
    prospects: s.prospects?.length ?? 0,
    updated_at: updatedAt,
  };
}

async function archive(state: AppState): Promise<void> {
  const website = state.input.website?.trim();
  if (!website) return; // pristine state — nothing worth keeping
  await fs.mkdir(SITES_DIR, { recursive: true });
  await fs.writeFile(
    path.join(SITES_DIR, `${siteSlug(website)}.json`),
    JSON.stringify(state, null, 2)
  );
}

// Snapshot the currently active site (no-op when state is pristine).
// Called by /api/run before it resets state for a new website.
export async function archiveActiveState(): Promise<void> {
  await archive(await getState());
}

// ── Demo seeding ────────────────────────────────────────────────────
// On first boot (or after a container restart wipes the ephemeral disk),
// materialize the demo roster — 3 real-data worlds + 3 mocked — into the
// sites dir so the switcher is always populated, and default the active
// board to buildgravity. A marker file makes this idempotent, and it only
// touches state when it's pristine, so a real run is never clobbered.
let seedChecked = false;
const DEFAULT_ACTIVE = "buildgravity.co";

export async function ensureSeeded(): Promise<void> {
  if (seedChecked) return;
  seedChecked = true;
  try {
    await fs.mkdir(SITES_DIR, { recursive: true });
    const marker = path.join(SITES_DIR, ".seeded");
    try {
      await fs.access(marker);
      return; // already seeded this container
    } catch {
      /* not seeded yet */
    }
    await Promise.all(
      ALL_SPECS.flatMap((spec) => {
        const s = siteSlug(spec.website);
        return [
          fs.writeFile(
            path.join(SITES_DIR, `${s}.json`),
            JSON.stringify(buildWorld(spec), null, 2)
          ),
          fs.writeFile(
            path.join(SITES_DIR, `${s}.brain.json`),
            JSON.stringify(buildBrain(spec), null, 2)
          ),
        ];
      })
    );
    const active = await getState();
    if (!active.input.website) {
      const hero =
        ALL_SPECS.find((s) => s.website === DEFAULT_ACTIVE) ?? ALL_SPECS[0];
      if (hero) {
        await setState(buildWorld(hero));
        const b = buildBrain(hero);
        await updateBrain(() => b);
      }
    }
    await fs.writeFile(marker, new Date().toISOString());
  } catch (err) {
    console.error("[seed]", err);
  }
}

export async function listSites(): Promise<SiteMeta[]> {
  await ensureSeeded();
  const active = await getState();
  const activeSlug = active.input.website
    ? siteSlug(active.input.website)
    : null;

  const map = new Map<string, SiteMeta>();
  let files: string[] = [];
  try {
    files = await fs.readdir(SITES_DIR);
  } catch {
    // no archive dir yet
  }
  for (const f of files) {
    if (!f.endsWith(".json")) continue;
    const slug = f.slice(0, -".json".length);
    try {
      const [raw, stat] = await Promise.all([
        fs.readFile(path.join(SITES_DIR, f), "utf8"),
        fs.stat(path.join(SITES_DIR, f)),
      ]);
      const s = JSON.parse(raw) as AppState;
      map.set(slug, toMeta(slug, s, false, stat.mtime.toISOString()));
    } catch {
      // unreadable snapshot — skip it
    }
  }
  // The live state wins over its own (possibly stale) archive entry.
  if (activeSlug) {
    map.set(
      activeSlug,
      toMeta(activeSlug, active, true, active.run_started_at ?? null)
    );
  }
  return [...map.values()].sort((a, b) =>
    (b.updated_at ?? "").localeCompare(a.updated_at ?? "")
  );
}

export async function switchSite(
  slug: string
): Promise<{ ok: true } | { ok: false; error: string }> {
  const active = await getState();
  const activeSlug = active.input.website
    ? siteSlug(active.input.website)
    : null;
  if (slug === activeSlug) return { ok: true };

  let snapshot: AppState;
  try {
    const raw = await fs.readFile(
      path.join(SITES_DIR, `${slug}.json`),
      "utf8"
    );
    snapshot = JSON.parse(raw) as AppState;
  } catch {
    return { ok: false, error: `no saved run for "${slug}"` };
  }

  await archive(active); // keep the current site switchable-back
  await setState(snapshot);
  // swap the brain to match the site (falls back to keeping the current
  // brain if this site has no snapshot — e.g. a real user run).
  try {
    const brainRaw = await fs.readFile(
      path.join(SITES_DIR, `${slug}.brain.json`),
      "utf8"
    );
    const b = JSON.parse(brainRaw);
    await updateBrain(() => b);
  } catch {
    /* no brain snapshot for this slug — leave the current brain */
  }
  return { ok: true };
}
