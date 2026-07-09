import { NextResponse } from "next/server";
import { listSites, switchSite } from "@/lib/sites";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ sites: await listSites() });
}

// Switch the active site: { slug } → loads that site's snapshot into state.
export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const slug = typeof body.slug === "string" ? body.slug : "";
  if (!slug) {
    return NextResponse.json(
      { ok: false, error: "slug required" },
      { status: 400 }
    );
  }
  const result = await switchSite(slug);
  return NextResponse.json(result, { status: result.ok ? 200 : 404 });
}
