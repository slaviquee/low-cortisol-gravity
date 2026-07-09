"use client";

// PROSPECT BOARD — the crew works, cards fill in, hottest first.

import Link from "next/link";
import {
  CrewStrip,
  HeatBar,
  ScoreRing,
  StateChip,
  usePolledState,
} from "@/components/ui";

export default function Board() {
  const state = usePolledState();
  if (!state) return <p className="label">connecting…</p>;

  const hot = state.prospects
    .filter((p) => p.state !== "low_orbit")
    .sort((a, b) => b.heat - a.heat);
  const quiet = state.prospects.filter((p) => p.state === "low_orbit");

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="font-display text-3xl">Prospect board</h1>
          {state.input.product_summary && (
            <p className="label mt-1 max-w-2xl normal-case tracking-normal">
              {state.input.product_summary}
            </p>
          )}
        </div>
        <p className="label">
          {hot.length} hot · {quiet.length} low-orbit
          {state.mock && " · demo world"}
        </p>
      </div>

      <CrewStrip crew={state.crew} />

      {hot.length === 0 && (
        <div className="panel p-8 text-center">
          <p className="label">the crew is resolving your buyers…</p>
        </div>
      )}

      <div className="grid gap-3 md:grid-cols-2">
        {hot.map((p, i) => (
          <Link
            key={p.id}
            href={`/prospect/${p.id}`}
            className={`panel rise block p-4 transition-transform hover:-translate-y-0.5 ${
              p.state === "warm" ? "warm-glow" : ""
            }`}
            style={{ animationDelay: `${i * 90}ms` }}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[15px] font-semibold">{p.prospect.name}</p>
                <p className="label mt-0.5 normal-case tracking-normal">
                  {p.prospect.title} @ {p.prospect.company}
                </p>
              </div>
              <ScoreRing score={p.gravity_score} />
            </div>
            <div className="mt-3 flex items-center justify-between">
              <HeatBar heat={p.heat} />
              <StateChip state={p.state} />
            </div>
            {p.topics.length > 0 && (
              <p className="mt-3 truncate text-xs text-[var(--muted)]">
                {p.topics.map((t) => t.topic).join(" · ")}
              </p>
            )}
            {p.signals.length > 0 && (
              <p className="mt-1.5 text-[11px]" style={{ color: "var(--amber)" }}>
                ⚡ {p.signals[0].detail}
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
              <div key={p.id} className="panel flex items-center justify-between p-3 opacity-60">
                <div>
                  <span className="text-[13px]">{p.prospect.name}</span>
                  <span className="label ml-2 normal-case tracking-normal">
                    {p.prospect.title} @ {p.prospect.company}
                  </span>
                </div>
                <span className="text-[11px] text-[var(--cyan)]">
                  {p.contact.emails[0] ?? "resolving email…"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
