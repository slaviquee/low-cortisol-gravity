"use client";

// LANDING — problem → solution → one input → how it works (on a loop).

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  GravityHero,
  HeatBar,
  LogStream,
  TempSwatch,
} from "@/components/ui";
import { FIXTURE_TARGETS, FIXTURE_WEBSITE } from "@/data/fixtures";
import { LogLine } from "@/lib/types";

/* ── how it works — five abstract beats, explicitly a loop ── */

function Chip({ children, delay = 0, tone }: { children: React.ReactNode; delay?: number; tone?: string }) {
  return (
    <span
      className="card-paper rise px-2.5 py-1 text-[11.5px]"
      style={{ animationDelay: `${delay}ms`, color: tone }}
    >
      {children}
    </span>
  );
}

function Line({ children, delay = 0, green }: { children: React.ReactNode; delay?: number; green?: boolean }) {
  return (
    <p
      className={`rise mt-2.5 text-[12.5px] leading-relaxed ${green ? "font-medium text-[var(--accent)]" : "text-[var(--muted)]"}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {children}
    </p>
  );
}

function SceneCompany() {
  return (
    <div>
      <p className="mono label rise">01 · it reads your company</p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        <Chip delay={120}>website → narrative</Chip>
        <Chip delay={280}>your posts → tone of voice</Chip>
        <Chip delay={440}>numbers-first · no fluff</Chip>
      </div>
      <Line delay={620}>
        <span className="link-green">→</span> everything it ever writes sounds
        like you — enforced, not hoped
      </Line>
    </div>
  );
}

function SceneCrm() {
  return (
    <div>
      <p className="mono label rise">02 · it mines your pipe + signals</p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        <Chip delay={120}>open deals → accelerate</Chip>
        <Chip delay={280}>closed-lost → re-warm</Chip>
        <Chip delay={440}>won → lookalikes</Chip>
      </div>
      <Line delay={620}>
        <span className="link-green">→</span> intent signals rank who matters
        now, and name the decision makers
      </Line>
    </div>
  );
}

function SceneTaste() {
  const rows = [
    { role: "vp sales", taste: "rewards tactical charts · hates spam", heat: 89 },
    { role: "cro", taste: "contrarian, numbers-first", heat: 71 },
    { role: "head of revops", taste: "diagrams · workflow breakdowns", heat: 64 },
  ];
  return (
    <div>
      <p className="mono label rise">03 · it builds a taste profile per buyer</p>
      <div className="mt-3 space-y-2">
        {rows.map((r, i) => (
          <div key={r.role} className="rise flex items-center gap-2.5" style={{ animationDelay: `${150 + i * 220}ms` }}>
            <TempSwatch t={r.heat / 100} />
            <span className="mono w-28 shrink-0 text-[11px]">{r.role}</span>
            <span className="min-w-0 truncate text-[12px] text-[var(--muted)]">{r.taste}</span>
          </div>
        ))}
      </div>
      <Line delay={840}>
        <span className="link-green">→</span> every claim carries evidence —
        posts, comments, follows, even podcast transcripts
      </Line>
    </div>
  );
}

function ScenePlan() {
  return (
    <div>
      <p className="mono label rise">04 · it generates gravity, in your voice</p>
      <div className="mt-3 space-y-1.5">
        {[
          ["→ post", "the chart their feeds reward", "eval 100"],
          ["→ comment", "inside the threads they already read", ""],
          ["→ connect", "third touch, never the first", ""],
        ].map(([t, d, e], i) => (
          <p key={i} className="rise text-[12.5px]" style={{ animationDelay: `${150 + i * 200}ms` }}>
            <span className="link-green">{t}</span>{" "}
            <span className="text-[var(--muted)]">{d}</span>
            {e && <span className="mono ml-2 text-[10.5px] text-[var(--accent)]">{e}</span>}
          </p>
        ))}
      </div>
      <Line delay={780}>
        <span className="link-green">→</span> you stay in control: edit any
        draft, your note becomes a permanent rule
      </Line>
    </div>
  );
}

function SceneLoop() {
  return (
    <div>
      <p className="mono label rise">05 · the loop — better every iteration</p>
      <div className="rise mt-3 flex items-center gap-2" style={{ animationDelay: "150ms" }}>
        <HeatBar heat={54} />
        <span className="mono text-[11px] text-[var(--muted)]">pipeline warming</span>
      </div>
      <p className="rise mono mt-3 text-[11.5px] text-[var(--muted)]" style={{ animationDelay: "400ms" }}>
        propose → execute → measure → regenerate ↻
      </p>
      <Line delay={650}>
        engaged buyers go warm → contact bought just-in-time → tailored pitch
        ready before the call
      </Line>
      <Line delay={950} green>
        → plan v2 doubles down on what the data says worked. every time.
      </Line>
    </div>
  );
}

const SCENES = [SceneCompany, SceneCrm, SceneTaste, ScenePlan, SceneLoop];

function DemoStage() {
  const [scene, setScene] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setScene((s) => (s + 1) % SCENES.length), 3800);
    return () => clearInterval(id);
  }, []);
  const Scene = SCENES[scene];
  return (
    <div className="card relative min-h-[228px] overflow-hidden p-5">
      <div className="flex items-center justify-between">
        <p className="label">how it works · on a loop</p>
        <div className="flex gap-1.5">
          {SCENES.map((_, i) => (
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
        <Scene />
      </div>
    </div>
  );
}

/* ── partners ── */

function Partners() {
  const names = ["Anthropic", "Sillage", "FullEnrich", "Gamma", "Gradium"];
  return (
    <div className="mt-10 text-center">
      <p className="label" style={{ fontSize: 10.5 }}>
        built with
      </p>
      <div className="mt-2.5 flex flex-wrap items-baseline justify-center gap-x-7 gap-y-2">
        {names.map((n) => (
          <span
            key={n}
            className="text-[13px] font-semibold tracking-tight text-[var(--muted)] transition-colors hover:text-[var(--ink)]"
          >
            {n}
          </span>
        ))}
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
    <div className="rise mx-auto max-w-xl pt-4">
      <GravityHero />

      <p className="mono mt-6 text-center text-[12px] leading-relaxed text-[var(--muted)]">
        cold outreach is dying — every inbox is the same
        <br />
        ai-written &quot;personalization&quot;, and reply rates show it.
      </p>

      <h1 className="mt-4 text-center text-[38px] font-semibold leading-[1.08] tracking-[-0.03em]">
        Make your buyers discover you
        <br />
        before the first contact.
      </h1>

      <div className="mt-8 flex gap-2">
        <input
          className="input"
          placeholder={`your website — ${FIXTURE_WEBSITE}`}
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          onBlur={() => website && scout()}
          onKeyDown={(e) => e.key === "Enter" && build()}
        />
        <button className="btn shrink-0 px-5" onClick={build}>
          <span className="arr">→</span> build gravity
        </button>
      </div>

      {(summary || scouting) && (
        <div className="rise card-paper mt-3 p-3.5">
          <p className="link-green text-[12px]">
            <span className="arr">→</span> scout
          </p>
          <p className="mt-1 text-[13px] leading-relaxed">
            {scouting ? "reading the site…" : `"${summary}"`}
          </p>
        </div>
      )}

      <details className="group mt-3">
        <summary className="label cursor-pointer list-none text-center transition-colors hover:text-[var(--ink)]">
          + targets · hubspot pipe · your socials
        </summary>
        <div className="rise mt-3 space-y-3">
          <textarea
            className="input h-14 resize-none"
            placeholder={`target accounts — ${FIXTURE_TARGETS.slice(0, 3).join(", ")}, …`}
            value={targets}
            onChange={(e) => setTargets(e.target.value)}
          />
          <input
            className="input"
            placeholder="your socials for tone of voice — linkedin.com/in/you · @you"
            value={ownHandles}
            onChange={(e) => setOwnHandles(e.target.value)}
          />
        </div>
      </details>

      <div className="mt-8">
        <DemoStage />
      </div>
      <p className="label mt-3 text-center" style={{ fontSize: 11 }}>
        no keys? runs on the cached demo world — nothing waits on a third party
      </p>

      <Partners />
    </div>
  );
}
