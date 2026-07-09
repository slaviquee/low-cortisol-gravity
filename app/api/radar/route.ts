import { NextResponse } from "next/server";
import { radarScan } from "@/agent/pipeline";

export const dynamic = "force-dynamic";
export const maxDuration = 300; // managed agents spawn a Claude Code subprocess

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const postUrls = Array.isArray(body.post_urls) ? body.post_urls : [];
  const result = await radarScan(postUrls);
  return NextResponse.json({ result });
}
