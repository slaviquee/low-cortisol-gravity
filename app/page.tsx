"use client";

// LANDING — the pitch, a self-playing demo, the input, and the moment it
// starts thinking.

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  GravityHero,
  HeatBar,
  LogStream,
  ScoreRing,
  StateChip,
  TempSwatch,
} from "@/components/ui";
import { FIXTURE_TARGETS, FIXTURE_WEBSITE } from "@/data/fixtures";
import { LogLine } from "@/lib/types";

const STEPS = [
  { n: "01", label: "map buyers", d: "signals name who matters, world models learn their taste" },
  { n: "02", label: "generate gravity", d: "posts, comments and micro-actions inside their feeds" },
  { n: "03", label: "track engagement", d: "they engage → warm → the first touch is never cold" },
];

/* ── the auto-playing product demo — real UI atoms, three beats ── */

function Chip({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <span
      className="card-paper rise px-2.5 py-1 text-[11.5px]"
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </span>
  );
}

function SceneProfile() {
  return (
    <div>
      <p className="mono label rise">01 · taste profile — Jane K. · vp sales</p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        <Chip delay={100}>rewards tactical charts</Chip>
        <Chip delay={260}>numbers-first</Chip>
        <Chip delay={420}>publicly hates spam</Chip>
        <Chip delay={580}>commenter</Chip>
      </div>
      <p className="rise mt-3.5 text-[12.5px] text-[var(--muted)]" style={{ animationDelay: "740ms" }}>
        <span className="link-green">→</span> attention lives in J. Founder&apos;s
        comments + Mara Vidal&apos;s benchmarks
      </p>
      <div className="rise mt-3.5" style={{ animationDelay: "900ms" }}>
        <HeatBar heat={89} />
      </div>
    </div>
  );
}

function ScenePost() {
  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="mono label rise">02 · the post her feed rewards</p>
        <span className="mono rise text-[10.5px] text-[var(--accent)]" style={{ animationDelay: "1100ms" }}>
          eval 100 · her format · your voice
        </span>
      </div>
      <div className="card-paper mt-3 p-3.5">
        {[
          "3 reasons SDR productivity collapsed",
          "after everyone adopted generic AI:",
          "",
          "1. reply rates fell 40%",
          "2. saved time went to MORE volume",
          "3. QA disappeared. chart below —",
        ].map((l, i) => (
          <p key={i} className="rise mono text-[11.5px] leading-relaxed" style={{ animationDelay: `${150 + i * 130}ms` }}>
            {l || " "}
          </p>
        ))}
      </div>
    </div>
  );
}

function SceneLoop() {
  return (
    <div>
      <p className="mono label rise">03 · the loop closes</p>
      <p className="rise mt-3 border-l-2 border-[var(--accent)] pl-3 text-[12.5px] italic" style={{ animationDelay: "180ms" }}>
        “This. Exactly this. The QA gap is exactly what we&apos;re fighting.”
      </p>
      <div className="rise mt-3.5 flex items-center gap-3" style={{ animationDelay: "500ms" }}>
        <ScoreRing score={52} size={38} />
        <StateChip state="warm" />
        <TempSwatch t={0.95} />
      </div>
      <p className="rise mono mt-3 text-[11.5px] text-[var(--muted)]" style={{ animationDelay: "820ms" }}>
        ✉ jane.kowalski@aquila-systems.com · draft cites her comment
      </p>
      <p className="rise mt-2 text-[12px] font-medium text-[var(--accent)]" style={{ animationDelay: "1050ms" }}>
        → the email is no longer cold
      </p>
    </div>
  );
}

function DemoStage() {
  const [scene, setScene] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setScene((s) => (s + 1) % 3), 3600);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="card relative min-h-[280px] overflow-hidden p-5">
      <div className="flex items-center justify-between">
        <p className="label">gravity, in 11 seconds</p>
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <button
              key={i}
              aria-label={`scene ${i + 1}`}
              className="dot"
              onClick={() => setScene(i)}
              style={{
                background: i === scene ? "var(--charcoal)" : "var(--faint)",
                cursor: "pointer",
              }}
            />
          ))}
        </div>
      </div>
      <div key={scene} className="mt-4">
        {scene === 0 && <SceneProfile />}
        {scene === 1 && <ScenePost />}
        {scene === 2 && <SceneLoop />}
      </div>
    </div>
  );
}

/* ── the page ── */

export default function Landing() {
  const router = useRouter();
  const [website, setWebsite] = useState("");
  const [targets, setTargets] = useState("");
  const [ownHandles, setOwnHandles] = useState("");
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
        own_handles: ownHandles,
        targets: targets
          .split(/[\n,]/)
          .map((t) => t.trim())
          .filter(Boolean),
      }),
    });
  }

  useEffect(() => {
    if (phase !== "thinking") return;
    const poll = setInterval(async () => {
      try {
        const s = await fetch("/api/state", { cache: "no-store" }).then((r) => r.json());
        setLog(s.log ?? []);
      } catch {}
    }, 550);
    timers.current.push(setTimeout(() => router.push("/board"), 5200));
    return () => {
      clearInterval(poll);
      timers.current.forEach(clearTimeout);
    };
  }, [phase, router]);

  if (phase === "thinking") {
    return (
      <div className="rise mx-auto max-w-2xl pt-6">
        <GravityHero />
        <div className="mx-auto mt-8 max-w-md">
          <p className="mono text-center text-[13px]">building your buyers&apos; world…</p>
          <div className="card mt-5 min-h-[132px] p-5">
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
      </div>
    );
  }

  return (
    <div className="rise mx-auto max-w-4xl pt-4">
      <GravityHero />

      <h1 className="mt-6 text-center text-[40px] font-semibold leading-[1.08] tracking-[-0.03em]">
        Make your buyers discover you
        <br />
        before the first contact.
      </h1>
      <p className="label mx-auto mt-4 max-w-lg text-center text-[13.5px] leading-relaxed">
        gravity learns each buyer&apos;s taste, earns their attention inside
        their feed, and reaches out only once they&apos;ve engaged — so the
        first touch is never cold.
      </p>

      <div className="mx-auto mt-9 grid max-w-2xl gap-4 sm:grid-cols-3">
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

      <div className="mt-9 grid gap-5 lg:grid-cols-2">
        <div className="card space-y-4 p-5">
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
            <label className="label">target accounts · hubspot pipe · optional</label>
            <textarea
              className="input mt-1.5 h-14 resize-none"
              placeholder={FIXTURE_TARGETS.slice(0, 3).join(", ") + ", …"}
              value={targets}
              onChange={(e) => setTargets(e.target.value)}
            />
          </div>
          <div>
            <label className="label">your socials · tone of voice · optional</label>
            <input
              className="input mt-1.5"
              placeholder="linkedin.com/in/you · @you"
              value={ownHandles}
              onChange={(e) => setOwnHandles(e.target.value)}
            />
          </div>

          {(summary || scouting) && (
            <div className="rise card-paper p-3.5">
              <p className="link-green text-[12px]">
                <span className="arr">→</span> scout
              </p>
              <p className="mt-1 text-[13px] leading-relaxed">
                {scouting ? "reading the site…" : `"${summary}"`}
              </p>
            </div>
          )}

          <button className="btn w-full justify-center py-3 text-[13.5px]" onClick={build}>
            <span className="arr">→</span> build gravity
          </button>
          <p className="label text-center" style={{ fontSize: 11 }}>
            no keys? runs on the cached demo world — nothing waits on a third party
          </p>
        </div>

        <DemoStage />
      </div>
    </div>
  );
}
