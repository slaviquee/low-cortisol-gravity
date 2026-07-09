import { NextResponse } from "next/server";
import { getState } from "@/lib/store";
import { ensureSeeded } from "@/lib/sites";

export const dynamic = "force-dynamic";

export async function GET() {
  // First boot / post-restart: materialize the demo roster and default the
  // active board to buildgravity. Idempotent + never clobbers a real run.
  await ensureSeeded();
  return NextResponse.json(await getState());
}
