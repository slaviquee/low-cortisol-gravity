import type { Metadata } from "next";
import { Geist, IBM_Plex_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const sans = Geist({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-sans",
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "gravity — buyer-orbit gtm agent",
  description:
    "Build enough relevance that your buyers discover you before you discover them.",
};

const NAV = [
  { href: "/board", label: "map buyers" },
  { href: "/plan", label: "generate gravity" },
  { href: "/warm", label: "track engagement" },
];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable}`}>
      <body>
        <header>
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5">
            <Link href="/" className="flex items-center gap-2.5">
              <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden>
                <circle cx="12" cy="12" r="7" fill="var(--charcoal)" />
                <circle r="1.7" fill="var(--ink)">
                  <animateMotion
                    dur="7s"
                    repeatCount="indefinite"
                    path="M 22.5 12 A 10.5 10.5 0 1 1 1.5 12 A 10.5 10.5 0 1 1 22.5 12"
                  />
                </circle>
              </svg>
              <span className="text-[17px] font-bold tracking-tight">
                gravity
              </span>
              <span className="label ml-1 hidden sm:inline">
                buyer-orbit gtm agent
              </span>
            </Link>
            <nav className="flex items-center gap-6">
              {NAV.map((n) => (
                <Link key={n.href} href={n.href} className="group flex items-center gap-1.5 text-[13px]">
                  <span className="arr text-[var(--accent)]">→</span>
                  <span className="text-[var(--ink)] transition-opacity group-hover:opacity-60">
                    {n.label}
                  </span>
                </Link>
              ))}
            </nav>
          </div>
        </header>
        <main className="mx-auto max-w-6xl px-6 py-6">{children}</main>
        <footer className="mx-auto flex max-w-6xl items-center justify-between px-6 pb-8 pt-4">
          <p className="mono text-[11px] text-[var(--faint)]">v0.1.0</p>
          <p className="label">claude · sillage · fullenrich — agentic gtm hackathon, paris</p>
        </footer>
      </body>
    </html>
  );
}
