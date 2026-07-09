import { NextResponse } from "next/server";
import { radarScan } from "@/agent/pipeline";

export const dynamic = "force-dynamic";

export async function POST() {
  const result = await radarScan();
  return NextResponse.json({ result });
}
