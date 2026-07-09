import { NextResponse } from "next/server";
import { getBrain } from "@/lib/brain";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(await getBrain());
}
