import type { Metadata } from "next";
import { IBM_Plex_Mono, Instrument_Serif } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
});

const display = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "Gravity — buyer-orbit GTM agent",
  description:
    "Build enough relevance that your buyers discover you before you discover them.",
};

const NAV = [
  { href: "/", label: "START" },
  { href: "/board", label: "BOARD" },
  { href: "/plan", label: "PLAN" },
  { href: "/warm", label: "WARM" },
];

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${mono.variable} ${display.variable}`}>
      <body>
        <header className="relative z-10 border-b border-[var(--line)]">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <Link href="/" className="flex items-baseline gap-3">
              <span className="font-display text-2xl italic tracking-tight">
                Gravity
              </span>
              <span className="label hidden sm:inline">
                buyer-orbit gtm agent
              </span>
            </Link>
            <nav className="flex items-center gap-6">
              {NAV.map((n) => (
                <Link
                  key={n.href}
                  href={n.href}
                  className="label transition-colors hover:text-[var(--amber)]"
                >
                  {n.label}
                </Link>
              ))}
            </nav>
          </div>
        </header>
        <main className="relative z-10 mx-auto max-w-6xl px-6 py-8">
          {children}
        </main>
        <footer className="relative z-10 mx-auto max-w-6xl px-6 pb-8">
          <p className="label">
            claude · sillage · fullenrich — agentic gtm hackathon · paris
          </p>
        </footer>
      </body>
    </html>
  );
}
