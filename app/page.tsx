"use client";

// LANDING — the pitch, the input, and the moment it starts thinking.

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { GravityHero, LogStream } from "@/components/ui";
import { FIXTURE_TARGETS, FIXTURE_WEBSITE } from "@/data/fixtures";
import { LogLine } from "@/lib/types";

const STEPS = [
  { n: "01", label: "map buyers", d: "signals name who matters, world models learn what they reward" },
  { n: "02", label: "generate gravity", d: "posts, comments and micro-actions inside their feeds" },
  { n: "03", label: "track engagement", d: "they engage → warm → the email is no longer cold" },
];

export default function Landing() {
  const router = useRouter();
  const [website, setWebsite] = useState("");
  const [targets, setTargets] = useState("");
  const [summary, setSummary] = useState("");
  const [scouting, setScouting] = useState(false);
  const [phase, setPhase] = useState<"form" | "thinking">("form");
  const [log, setLog] = useState<LogLine[]>([]);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  async function scout() {
    setScouting(true);
    try {
      const res = await fetch("/api/scout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ website: website || FIXTURE_WEBSITE }),
      });
      const data = await res.json();
      setSummary(data.summary);
    } finally {
      setScouting(false);
    }
  }

  async function build() {
    setPhase("thinking");
    await fetch("/api/run", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        website: website || FIXTURE_WEBSITE,
        targets: targets
          .split(/[\n,]/)
          .map((t) => t.trim())
          .filter(Boolean),
      }),
    });
  }

  // While thinking: stream the crew's log, then glide to the board.
  useEffect(() => {
    if (phase !== "thinking") return;
    const poll = setInterval(async () => {
      try {
        const s = await fetch("/api/state", { cache: "no-store" }).then((r) =>
          r.json()
        );
        setLog(s.log ?? []);
      } catch {}
    }, 550);
    timers.current.push(setTimeout(() => router.push("/board"), 5200));
    return () => {
      clearInterval(poll);
      timers.current.forEach(clearTimeout);
    };
  }, [phase, router]);

  return (
    <div className="rise mx-auto max-w-2xl pt-6">
      <GravityHero />

      {phase === "form" ? (
        <>
          <h1 className="mt-8 text-center text-[42px] font-semibold leading-[1.08] tracking-[-0.03em]">
            Your buyers discover you
            <br />
            before you discover them.
          </h1>
          <p className="label mt-4 text-center text-[14px]">
            gravity builds a world model of every buyer, then earns their
            attention — before any outreach.
          </p>

          <div className="mx-auto mt-10 grid max-w-xl gap-4 sm:grid-cols-3">
            {STEPS.map((s, i) => (
              <div key={s.n} className="rise" style={{ animationDelay: `${200 + i * 120}ms` }}>
                <p className="mono text-[11px] text-[var(--faint)]">{s.n}</p>
                <p className="mt-1 flex items-center gap-1.5 text-[13px] font-semibold">
                  <span className="arr text-[var(--accent)]">→</span> {s.label}
                </p>
                <p className="label mt-1 leading-snug" style={{ fontSize: 11.5 }}>
                  {s.d}
                </p>
              </div>
            ))}
          </div>

          <div className="card mx-auto mt-10 max-w-xl space-y-4 p-5">
            <div>
              <label className="label">your website</label>
              <input
                className="input mt-1.5"
                placeholder={FIXTURE_WEBSITE}
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                onBlur={() => website && scout()}
              />
            </div>
            <div>
              <label className="label">target accounts · optional</label>
              <textarea
                className="input mt-1.5 h-16 resize-none"
                placeholder={FIXTURE_TARGETS.join(", ")}
                value={targets}
                onChange={(e) => setTargets(e.target.value)}
              />
            </div>

            {(summary || scouting) && (
              <div className="rise card-paper p-3.5">
                <p className="link-green text-[12px]">
                  <span className="arr">→</span> scout
                </p>
                <p className="mt-1 text-[13.5px] leading-relaxed">
                  {scouting ? "reading the site…" : `"${summary}"`}
                </p>
              </div>
            )}

            <button className="btn w-full justify-center py-3 text-[13.5px]" onClick={build}>
              <span className="arr">→</span> build gravity
            </button>
            <p className="label text-center" style={{ fontSize: 11.5 }}>
              no keys? runs on the cached demo world — nothing waits on a third party
            </p>
          </div>
        </>
      ) : (
        <div className="rise mx-auto mt-8 max-w-md">
          <p className="mono text-center text-[13px] text-[var(--ink)]">
            building your buyers&apos; world…
          </p>
          <div className="card mt-5 min-h-[132px] p-4.5 p-5">
            {log.length === 0 ? (
              <p className="label pulse">the crew is waking up…</p>
            ) : (
              <LogStream log={log} max={5} />
            )}
          </div>
          <p className="label mt-3 text-center" style={{ fontSize: 11.5 }}>
            scout → resolver → listener → strategist → radar
          </p>
        </div>
      )}
    </div>
  );
}
