// The Company Brain — minimal but comprehensive memory that OUTLIVES runs
// (state.json resets per run; brain.json persists). Every agent writes what
// it learns; every generation reads the digest. Decisions carry their
// reasons: better decisions with every piece of data.

import { promises as fs } from "fs";
import { tmpdir } from "os";
import path from "path";

// ponytail: tmp storage is enough for Vercel demos; use durable storage if state must survive cold starts.
const DIR = process.env.VERCEL
  ? path.join(tmpdir(), "gravity-runtime")
  : path.join(process.cwd(), "data", "runtime");
const FILE = path.join(DIR, "brain.json");

export interface Learning {
  at: string;
  source: string; // which agent learned it
  insight: string;
  evidence?: string;
}

export interface ContentPerf {
  post_id: string;
  title: string;
  format: string;
  engagements: number;
  comments: number;
  verdict: "hot" | "warm" | "cold" | "unposted";
}

export interface Decision {
  at: string;
  decision: string;
  because: string;
}

export interface UserNote {
  at: string;
  note: string;
  applied_to: string;
}

export interface CompanyBrain {
  company: {
    website: string;
    narrative: string;
    icp: string;
    tone_of_voice: string[]; // learned from YOUR own posts
    updated_at: string;
  };
  learnings: Learning[];
  content_performance: ContentPerf[];
  user_notes: UserNote[];
  decisions: Decision[];
}

export function emptyBrain(): CompanyBrain {
  return {
    company: { website: "", narrative: "", icp: "", tone_of_voice: [], updated_at: "" },
    learnings: [],
    content_performance: [],
    user_notes: [],
    decisions: [],
  };
}

// Shared, error-isolated write queue on globalThis — same reasoning as
// lib/store.ts: route bundles must serialize through one chain, and one
// failed write must not poison the rest.
const g = globalThis as unknown as { __gravityBrainQueue?: Promise<unknown> };
g.__gravityBrainQueue ??= Promise.resolve();

function enqueue<T>(task: () => Promise<T>): Promise<T> {
  const run = () => task();
  const p = (g.__gravityBrainQueue as Promise<unknown>).then(run, run);
  g.__gravityBrainQueue = p.catch(() => {});
  return p;
}

export async function getBrain(): Promise<CompanyBrain> {
  try {
    return JSON.parse(await fs.readFile(FILE, "utf8")) as CompanyBrain;
  } catch {
    return emptyBrain();
  }
}

export function updateBrain(
  fn: (b: CompanyBrain) => CompanyBrain | void
): Promise<CompanyBrain> {
  return enqueue(async () => {
    const b = await getBrain();
    const next = (fn(b) ?? b) as CompanyBrain;
    await fs.mkdir(DIR, { recursive: true });
    await fs.writeFile(FILE, JSON.stringify(next, null, 2));
    return next;
  });
}

export function learn(
  b: CompanyBrain,
  source: string,
  insight: string,
  evidence?: string
) {
  b.learnings.push({ at: new Date().toISOString(), source, insight, evidence });
  if (b.learnings.length > 60) b.learnings.splice(0, b.learnings.length - 60);
}

export function decide(b: CompanyBrain, decision: string, because: string) {
  b.decisions.push({ at: new Date().toISOString(), decision, because });
}

export function bumpContent(
  b: CompanyBrain,
  post_id: string,
  title: string,
  format: string,
  kind: "reaction" | "comment"
) {
  let c = b.content_performance.find((x) => x.post_id === post_id);
  if (!c) {
    c = { post_id, title, format, engagements: 0, comments: 0, verdict: "cold" };
    b.content_performance.push(c);
  }
  c.engagements++;
  if (kind === "comment") c.comments++;
  c.verdict = c.comments >= 2 || c.engagements >= 3 ? "hot" : c.engagements >= 1 ? "warm" : "cold";
}

// Compact digest injected into every generation prompt.
export function brainDigest(b: CompanyBrain): string {
  const hot = b.content_performance
    .filter((c) => c.verdict !== "cold")
    .map((c) => `${c.title} (${c.format}): ${c.engagements} eng / ${c.comments} comments`)
    .slice(-4);
  return [
    `PRODUCT: ${b.company.narrative || "—"}`,
    `ICP: ${b.company.icp || "—"}`,
    `TONE OF VOICE (learned from our own posts): ${b.company.tone_of_voice.join("; ") || "—"}`,
    hot.length ? `CONTENT THAT WORKS: ${hot.join(" · ")}` : "",
    b.user_notes.length
      ? `USER NOTES (always respect): ${b.user_notes.slice(-4).map((n) => n.note).join(" · ")}`
      : "",
    b.learnings.length
      ? `RECENT LEARNINGS: ${b.learnings.slice(-4).map((l) => l.insight).join(" · ")}`
      : "",
  ]
    .filter(Boolean)
    .join("\n");
}
