import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { radarScan } from "@/agent/pipeline";
import { DEMO_RADAR_COOKIE, demoRadarResult } from "@/lib/demo-state";

export const dynamic = "force-dynamic";
export const maxDuration = 300; // managed agents spawn a Claude Code subprocess

export async function POST() {
  if (process.env.VERCEL) {
    const scans = Number((await cookies()).get(DEMO_RADAR_COOKIE)?.value ?? 0);
    const count = Number.isFinite(scans) ? scans : 0;
    const res = NextResponse.json({ result: demoRadarResult(count) });
    res.cookies.set(DEMO_RADAR_COOKIE, String(count + 1), {
      path: "/",
      sameSite: "lax",
    });
    return res;
  }
  const result = await radarScan();
  return NextResponse.json({ result });
}
