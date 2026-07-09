import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { DEMO_RADAR_COOKIE, demoState } from "@/lib/demo-state";
import { getState } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET() {
  if (process.env.VERCEL) {
    const scans = Number((await cookies()).get(DEMO_RADAR_COOKIE)?.value ?? 0);
    return NextResponse.json(demoState(Number.isFinite(scans) ? scans : 0));
  }
  return NextResponse.json(await getState());
}
