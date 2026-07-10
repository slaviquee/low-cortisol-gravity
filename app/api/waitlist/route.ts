import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import { tmpdir } from "os";
import path from "path";

export const dynamic = "force-dynamic";

// Waitlist entries live next to the app state — on Railway that's the
// persistent volume, so signups survive deploys.
const DIR = process.env.VERCEL
  ? path.join(tmpdir(), "gravity-runtime")
  : path.join(process.cwd(), "data", "runtime");
const FILE = path.join(DIR, "waitlist.json");

interface Entry {
  email: string;
  at: string;
}

// Same write-queue pattern as lib/store.ts: serialize read-modify-write
// cycles so concurrent signups can't drop each other.
const g = globalThis as unknown as { __gravityWaitlistQueue?: Promise<unknown> };
g.__gravityWaitlistQueue ??= Promise.resolve();
function enqueue<T>(task: () => Promise<T>): Promise<T> {
  const run = () => task();
  const p = (g.__gravityWaitlistQueue as Promise<unknown>).then(run, run);
  g.__gravityWaitlistQueue = p.catch(() => {});
  return p;
}

async function readAll(): Promise<Entry[]> {
  try {
    return JSON.parse(await fs.readFile(FILE, "utf8")) as Entry[];
  } catch {
    return [];
  }
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const email = String(body.email ?? "")
    .trim()
    .toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email) || email.length > 254) {
    return NextResponse.json(
      { ok: false, error: "that doesn't look like an email" },
      { status: 400 }
    );
  }
  const result = await enqueue(async () => {
    await fs.mkdir(DIR, { recursive: true });
    const all = await readAll();
    const existing = all.findIndex((e) => e.email === email);
    if (existing !== -1) {
      return { already: true, position: existing + 1 };
    }
    all.push({ email, at: new Date().toISOString() });
    await fs.writeFile(FILE, JSON.stringify(all, null, 2));
    return { already: false, position: all.length };
  });
  return NextResponse.json({ ok: true, ...result });
}
