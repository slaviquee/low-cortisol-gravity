import { NextResponse } from "next/server";
import { reviseDraft } from "@/agent/pipeline";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function POST(req: Request) {
  const { id, note } = await req.json();
  const ok = await reviseDraft(id, note ?? "");
  return NextResponse.json({ ok });
}
