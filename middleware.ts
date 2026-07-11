import { NextRequest, NextResponse } from "next/server";

// Waitlist mode: on the PUBLIC deployment the landing is the whole site.
// App pages redirect home, and the spend-capable API routes (live pipeline,
// scans, drafts — they call paid providers) return 403 so a stray curl
// can't burn credits. /api/waitlist and /api/state stay open. Dev keeps
// the full app so the team can work.
export function middleware(req: NextRequest) {
  if (process.env.NODE_ENV !== "production") return NextResponse.next();
  if (req.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.json(
      { error: "waitlist mode — the app opens soon" },
      { status: 403 }
    );
  }
  return NextResponse.redirect(new URL("/", req.url));
}

export const config = {
  matcher: [
    "/board",
    "/plan",
    "/warm",
    "/brain",
    "/prospect/:path*",
    "/api/run",
    "/api/radar",
    "/api/scout",
    "/api/plan/:path*",
    "/api/replan",
    "/api/revise",
    "/api/pitch",
    "/api/warm",
    "/api/brain",
    "/api/sites",
  ],
};
