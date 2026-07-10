import { NextRequest, NextResponse } from "next/server";

// Waitlist mode: on the PUBLIC deployment the landing is the whole site —
// app pages redirect home. Dev keeps the full app so the team can work.
export function middleware(req: NextRequest) {
  if (process.env.NODE_ENV !== "production") return NextResponse.next();
  return NextResponse.redirect(new URL("/", req.url));
}

export const config = {
  matcher: ["/board", "/plan", "/warm", "/brain", "/prospect/:path*"],
};
