import { NextRequest, NextResponse } from "next/server";

// Waitlist mode (production only). The public sees the landing; app pages
// redirect home and spend-capable APIs 403 so a stray curl can't burn
// credits. Dev keeps the full app.
//
// DEMO PREVIEW: visiting any app page with ?preview=<PREVIEW_TOKEN> drops a
// short-lived cookie that unlocks the full app UI for that visitor only —
// the public still hits the waitlist. Only read/switch APIs (state, brain,
// sites) open up, so the seeded demo worlds render and the site switcher
// works; every provider-spending route (run, scan, revise, …) stays 403
// even in preview, so a leaked link still can't cost money.

const PREVIEW_COOKIE = "gv_preview";
// APIs safe to expose in preview: reads + the free seeded-world switch.
const PREVIEW_SAFE_API = /^\/api\/(brain|sites)(\/|$)/;

export function middleware(req: NextRequest) {
  if (process.env.NODE_ENV !== "production") return NextResponse.next();

  const url = req.nextUrl;
  const token = process.env.PREVIEW_TOKEN;
  const param = url.searchParams.get("preview");

  // Activate preview: ?preview=<token> → set cookie, redirect to clean URL.
  if (token && param) {
    if (param === token) {
      const clean = new URL(url);
      clean.searchParams.delete("preview");
      const res = NextResponse.redirect(clean);
      res.cookies.set(PREVIEW_COOKIE, token, {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24, // 24h — plenty for a demo, auto-expires
      });
      return res;
    }
    return NextResponse.redirect(new URL("/", url)); // wrong token → waitlist
  }

  const previewOn = Boolean(token) && req.cookies.get(PREVIEW_COOKIE)?.value === token;
  const isApi = url.pathname.startsWith("/api/");

  if (previewOn) {
    // Full app UI, but keep spend routes closed even for previewers.
    if (isApi && !PREVIEW_SAFE_API.test(url.pathname)) {
      return NextResponse.json(
        { error: "disabled in preview (no live provider calls)" },
        { status: 403 }
      );
    }
    return NextResponse.next();
  }

  // Public waitlist behavior.
  if (isApi) {
    return NextResponse.json(
      { error: "waitlist mode — the app opens soon" },
      { status: 403 }
    );
  }
  return NextResponse.redirect(new URL("/", url));
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
