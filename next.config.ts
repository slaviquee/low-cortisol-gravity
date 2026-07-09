import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.resolve(__dirname),
  // Two `next dev` instances on one .next dir corrupt each other's webpack
  // cache. Set NEXT_DIST_DIR to give a second local server its own build
  // dir; unset (prod, Railway, default dev) keeps the standard .next.
  distDir: process.env.NEXT_DIST_DIR || ".next",
};

export default nextConfig;
