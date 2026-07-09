"use client";

// PROSPECT BOARD — the crew works, dials settle, cards fill in, hottest first.

import Link from "next/link";
import {
  CrewStrip,
  DotTrace,
  GravityWell,
  HeatBar,
  ScoreRing,
  StateChip,
  usePolledState,
  warmthScore,
} from "@/components/ui";

export default function Board() {
  const state = usePolledState();
  if (!state) return <p className="label">connecting…</p>;

  const hot = state.prospects
    .filter((p) => p.state !== "low_orbit")
    .sort((a, b) => b.heat - a.heat);
  const quiet = state.prospects.filter((p) => p.state === "low_orbit");

  const intentDensity = hot.length
    ? hot.reduce((a, p) => a + p.heat, 0) / hot.length / 100
    : 0;
  const coverage = state.prospects.length
    ? hot.filter((p) => p.topics.length > 0).length / (hot.length || 1)
    : 0;
  const warmRate = hot.length
    ? hot.filter((p) => p.state === "warm" || p.state === "in_conversation").length / hot.length
    : 0;
  const warmth = warmthScore(state.prospects);

  return (
    <div className="gap-6 lg:grid lg:grid-cols-[1fr_300px]">
      <div className="space-y-7">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-[26px] font-semibold tracking-tight">buyer mapping</h1>
            {state.input.product_summary && (
              <p className="label mt-1 max-w-2xl normal-case">
                {state.input.product_summary}
              </p>
            )}
          </div>
          <p className="mono label shrink-0 whitespace-nowrap pl-4">
            {hot.length} hot · {quiet.length} low-orbit
            {state.mock && " · demo"}
          </p>
        </div>

        <CrewStrip crew={state.crew} />

        {!state.run_done && state.log.length > 0 && (
          <p
            key={state.log[state.log.length - 1].msg}
            className="log-in mono text-[12px] text-[var(--muted)]"
          >
            <span className="text-[var(--accent)]">
              {state.log[state.log.length - 1].agent}
            </span>{" "}
            · {state.log[state.log.length - 1].msg}
          </p>
        )}

        <div className="grid grid-cols-3 gap-2">
          <GravityWell
            value={intentDensity}
            label="intent density"
            display={intentDensity.toFixed(3)}
          />
          <GravityWell
            value={coverage}
            label="orbit coverage"
            display={coverage >= 1 ? "full" : `${Math.round(coverage * 100)}%`}
          />
          <GravityWell
            value={warmRate}
            label="warm rate"
            display={`${Math.round(warmRate * 100)}%`}
          />
        </div>

        {hot.length === 0 && (
          <div className="card p-10 text-center">
            <p className="label">the crew is resolving your buyers…</p>
          </div>
        )}

        <div className="grid gap-2.5 md:grid-cols-2">
          {hot.map((p, i) => (
            <Link
              key={p.id}
              href={`/prospect/${p.id}`}
              className={`card rise block p-4 ${
                p.state === "warm" || p.state === "in_conversation" ? "warm-edge" : ""
              }`}
              style={{ animationDelay: `${i * 80}ms` }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <DotTrace p={p} />
                  <div>
                    <p className="text-[15px] font-semibold tracking-tight">
                      {p.prospect.name}
                    </p>
                    <p className="label mt-0.5">
                      {p.prospect.title} @ {p.prospect.company}
                    </p>
                  </div>
                </div>
                <ScoreRing score={p.gravity_score} />
              </div>
              <div className="mt-3.5 flex items-center justify-between">
                <HeatBar heat={p.heat} />
                <StateChip state={p.state} />
              </div>
              {p.topics.length > 0 && (
                <p className="mt-3 truncate text-[12px] text-[var(--muted)]">
                  {p.topics.map((t) => t.topic).join(" · ")}
                </p>
              )}
              {p.signals.length > 0 && (
                <p className="link-green mt-1.5 text-[12px]">
                  → {p.signals[0].detail}
                </p>
              )}
            </Link>
          ))}
        </div>

        {quiet.length > 0 && (
          <div>
            <p className="label mb-2">
              low-orbit — quiet on socials → email-first path, sillage-timed
            </p>
            <div className="grid gap-2 md:grid-cols-2">
              {quiet.map((p) => (
                <div key={p.id} className="card flex items-center justify-between p-3.5 opacity-70">
                  <div>
                    <span className="text-[13px] font-medium">{p.prospect.name}</span>
                    <span className="label ml-2">
                      {p.prospect.title} @ {p.prospect.company}
                    </span>
                  </div>
                  <span className="mono text-[11.5px] text-[var(--muted)]">
                    {p.contact.emails[0] ?? "resolving…"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* the statement piece */}
      <aside className="gradient-warm mt-8 flex min-h-[420px] flex-col justify-end p-6 lg:mt-0 lg:min-h-full">
        <div className="relative z-10">
          <h2 className="text-[26px] font-bold tracking-tight">warmth score</h2>
          <p className="mt-1.5 max-w-[220px] text-[12.5px] leading-relaxed text-white/85">
            current pipeline readiness across all mapped accounts
          </p>
          <p className="mono mt-5 text-[30px] font-medium">
            {warmth.toFixed(1)} <span className="text-white/70">/ 100</span>
          </p>
          <div className="mt-5 flex items-center justify-between gap-3 whitespace-nowrap border-t border-white/25 pt-3.5">
            <span className="mono text-[10.5px] text-white/80">
              last sync {new Date().toLocaleTimeString([], { hour12: false })}
            </span>
            <span className="flex shrink-0 gap-3.5">
              <Link href="/plan" className="text-[11.5px] font-medium text-white hover:opacity-75">
                plan
              </Link>
              <Link href="/warm" className="text-[11.5px] font-medium text-white hover:opacity-75">
                warm queue
              </Link>
            </span>
          </div>
        </div>
      </aside>
    </div>
  );
}
