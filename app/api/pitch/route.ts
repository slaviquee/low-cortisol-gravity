import { NextResponse } from "next/server";
import { draftPitchBrief } from "@/agent/pipeline";

export const dynamic = "force-dynamic";
export const maxDuration = 300; // managed agents spawn a Claude Code subprocess

export async function POST(req: Request) {
  const { id } = await req.json();
  const brief = await draftPitchBrief(id);
  return NextResponse.json({ ok: Boolean(brief), brief });
}
