import { NextResponse } from "next/server";
import { runPipeline } from "@/agent/pipeline";
import { resetState, updateState } from "@/lib/store";
import { archiveActiveState } from "@/lib/sites";
import { FIXTURE_TARGETS, FIXTURE_WEBSITE } from "@/data/fixtures";

export const dynamic = "force-dynamic";
export const maxDuration = 300; // managed agents spawn a Claude Code subprocess

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const websiteRaw: string = body.website?.trim() || "";
  const website: string = websiteRaw || FIXTURE_WEBSITE;
  // Fixture targets belong to the fixture/mock world only. A LIVE run with
  // an empty targets box passes [] through — the resolver derives real
  // target accounts from the ICP instead of searching fictional domains.
  const live = websiteRaw && !process.env.GRAVITY_MOCK;
  const targets: string[] =
    Array.isArray(body.targets) && body.targets.length
      ? body.targets
      : live
        ? []
        : FIXTURE_TARGETS;

  const ownHandles: string = body.own_handles?.trim() || "";
  const runId = new Date().toISOString();

  await archiveActiveState(); // keep the previous site's world switchable
  await resetState();
  await updateState((s) => {
    s.input.website = website;
    s.input.targets = targets;
    s.input.own_handles = ownHandles;
    s.run_started_at = runId;
  });

  if (process.env.VERCEL) {
    // Vercel: awaited, and the pipeline forces the fast fixture world there.
    await runPipeline(website, targets, ownHandles, runId).catch((e) =>
      console.error("[pipeline]", e)
    );
  } else {
    // Fire and forget locally — the UI polls /api/state and watches the crew work.
    void runPipeline(website, targets, ownHandles, runId).catch((e) =>
      console.error("[pipeline]", e)
    );
  }

  return NextResponse.json({ ok: true });
}
