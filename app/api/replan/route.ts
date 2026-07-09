import { NextResponse } from "next/server";
import { replanFromEngagement } from "@/agent/pipeline";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function POST() {
  const added = await replanFromEngagement();
  return NextResponse.json({ ok: true, added });
}
