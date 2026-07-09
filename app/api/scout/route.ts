import { NextResponse } from "next/server";
import { distillWebsite } from "@/agent/tools/website";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const { website } = await req.json().catch(() => ({ website: "" }));
  const summary = await distillWebsite(website || "");
  return NextResponse.json({ summary });
}
