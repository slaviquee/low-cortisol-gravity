import { NextRequest, NextResponse } from "next/server";

// Waitlist mode: the landing is the whole site for now. App pages stay in
// the tree (one matcher edit brings them back) but redirect home.
export function middleware(req: NextRequest) {
  return NextResponse.redirect(new URL("/", req.url));
}

export const config = {
  matcher: ["/board", "/plan", "/warm", "/brain", "/prospect/:path*"],
};
