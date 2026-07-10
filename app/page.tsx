"use client";

// LANDING — problem → solution → waitlist → how it works (on a loop).

import { useEffect, useState } from "react";
import { GravityHero, TempSwatch } from "@/components/ui";

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
      <p className="mono label rise">01 · it learns your company</p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        <Chip delay={120}>website → what you sell, to whom</Chip>
        <Chip delay={280}>your posts → how you actually sound</Chip>
      </div>
      <Line delay={480}>
        this grounds every move after — not just what it writes,
      </Line>
      <Line delay={700}>
        <span className="link-green">→</span> but what it recommends: post or
        comment, to whom, and when
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
    { role: "vp sales", taste: "tactical charts, as carousels · hates spam", heat: 89 },
    { role: "cro", taste: "contrarian short text, numbers-first", heat: 71 },
    { role: "head of revops", taste: "workflow breakdowns · carousels + video", heat: 64 },
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
        <span className="link-green">→</span> profiles cluster into taste
        cohorts: chart skeptics (2) · systems thinkers (1)
      </Line>
    </div>
  );
}

function ScenePlan() {
  return (
    <div>
      <p className="mono label rise">04 · it generates gravity, per cohort</p>
      <div className="mt-3 space-y-1.5">
        {[
          ["→ post", "a carousel chart, for the chart skeptics", "eval 100"],
          ["→ comment", "in the threads systems thinkers read", ""],
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
        one post serves a whole cohort — and it&apos;s written in your voice.
        edit any draft; your note becomes a standing rule
      </Line>
    </div>
  );
}

function SceneLoop() {
  const perf = [
    { name: "chart skeptics", eng: 3, warm: 2, w: 100 },
    { name: "systems thinkers", eng: 1, warm: 0, w: 33 },
  ];
  return (
    <div>
      <p className="mono label rise">05 · it learns what converts, per cohort</p>
      <div className="mt-3 space-y-2">
        {perf.map((c, i) => (
          <div key={c.name} className="rise" style={{ animationDelay: `${150 + i * 220}ms` }}>
            <div className="flex items-baseline justify-between">
              <span className="mono text-[11.5px]">{c.name}</span>
              <span className="mono text-[10.5px] text-[var(--muted)]">
                {c.eng} engagement{c.eng === 1 ? "" : "s"} · {c.warm} warm
              </span>
            </div>
            <div className="mt-1 h-[3px] w-full overflow-hidden rounded-full bg-[var(--card-deep)]">
              <div className="h-full rounded-full" style={{ width: `${c.w}%`, background: "var(--accent)" }} />
            </div>
          </div>
        ))}
      </div>
      <p className="rise mono mt-3 text-[11.5px] text-[var(--muted)]" style={{ animationDelay: "620ms" }}>
        propose → execute → measure → regenerate ↻
      </p>
      <Line delay={850}>
        cohorts update too: a buyer who never reacts gets re-seated until
        they find their place
      </Line>
      <Line delay={1100} green>
        → next week&apos;s plan shifts effort to the cohorts that convert
      </Line>
    </div>
  );
}

const SCENES = [SceneCompany, SceneCrm, SceneTaste, ScenePlan, SceneLoop];

function DemoStage() {
  const [scene, setScene] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setScene((s) => (s + 1) % SCENES.length), 6500);
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

function WaitlistForm() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [joined, setJoined] = useState<{ position: number; already: boolean } | null>(null);

  async function join() {
    const value = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value)) {
      setError("that doesn't look like an email — one more try?");
      return;
    }
    setError("");
    setBusy(true);
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email: value }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error ?? "failed");
      setJoined({ position: data.position, already: Boolean(data.already) });
    } catch {
      setError("couldn't reach the waitlist — give it another try in a moment.");
    } finally {
      setBusy(false);
    }
  }

  if (joined) {
    return (
      <div className="pop card-paper mt-8 p-4 text-center">
        <p className="mono text-[13px] font-medium text-[var(--accent)]">
          {joined.already ? "✓ you're already in orbit" : "✓ you're in orbit"}
        </p>
        <p className="mono mt-1.5 text-[12px] text-[var(--muted)]">
          {joined.already
            ? `still holding your place — #${joined.position} in line.`
            : `#${joined.position} in line. we'll open the doors to the first orbits soon.`}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="mt-8 flex gap-2">
        <input
          className="input"
          type="email"
          placeholder="you@company.com"
          autoComplete="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (error) setError("");
          }}
          onKeyDown={(e) => e.key === "Enter" && !busy && join()}
        />
        <button className="btn shrink-0 px-5" disabled={busy} onClick={join}>
          <span className="arr">→</span> {busy ? "joining…" : "join the waitlist"}
        </button>
      </div>
      {error ? (
        <p className="rise mono mt-3 text-center text-[12px]" style={{ color: "#b3532f" }}>
          {error}
        </p>
      ) : (
        <p className="label mt-3 text-center" style={{ fontSize: 11.5 }}>
          early access · rolling invites · no spam, one email when doors open
        </p>
      )}
    </>
  );
}

export default function Landing() {
  return (
    <div className="rise mx-auto max-w-xl pt-4">
      <div className="relative">
        <div
          aria-hidden
          className="gradient-warm pointer-events-none left-1/2 top-1/2 h-36 w-80 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-25 blur-2xl"
          style={{ position: "absolute" }}
        />
        <GravityHero />
      </div>

      <h1 className="serif mt-6 text-center text-[46px] leading-[1.05]">
        Make your buyers <em>discover you</em>
        <br />
        before the first contact.
      </h1>

      <WaitlistForm />

      <p className="mono mt-9 text-center text-[12px] leading-relaxed text-[var(--ink)]">
        cold outreach is dying — every inbox is the same
        <br />
        ai-written &quot;personalization&quot;, and reply rates show it.
        <br />
        <span className="font-medium">here&apos;s what gravity does instead:</span>
      </p>

      <div className="mt-6">
        <DemoStage />
      </div>

      <Partners />
    </div>
  );
}
