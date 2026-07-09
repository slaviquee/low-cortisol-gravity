import { NextResponse } from "next/server";
import { runPipeline } from "@/agent/pipeline";
import { resetState, updateState } from "@/lib/store";
import { FIXTURE_TARGETS, FIXTURE_WEBSITE } from "@/data/fixtures";

export const dynamic = "force-dynamic";
export const maxDuration = 300; // managed agents spawn a Claude Code subprocess

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const website: string = body.website?.trim() || FIXTURE_WEBSITE;
  const targets: string[] =
    Array.isArray(body.targets) && body.targets.length
      ? body.targets
      : FIXTURE_TARGETS;

  const ownHandles: string = body.own_handles?.trim() || "";

  await resetState();
  await updateState((s) => {
    s.input.website = website;
    s.input.targets = targets;
    s.input.own_handles = ownHandles;
    s.run_started_at = new Date().toISOString();
  });

  // Fire and forget — the UI polls /api/state and watches the crew work.
  void runPipeline(website, targets, ownHandles);

  return NextResponse.json({ ok: true });
}
