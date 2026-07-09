"use client";

// WORLD MODEL — everything we know, every claim with its evidence.

import Link from "next/link";
import { use } from "react";
import {
  Evidence,
  HeatBar,
  ScoreRing,
  StateChip,
  usePolledState,
} from "@/components/ui";

export default function Prospect({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const state = usePolledState();
  if (!state) return <p className="label">connecting…</p>;
  const p = state.prospects.find((x) => x.id === id);
  if (!p)
    return (
      <p className="label">
        unknown prospect — <Link href="/board" className="underline">back to board</Link>
      </p>
    );

  return (
    <div className="rise space-y-6">
      <Link href="/board" className="label hover:text-[var(--amber)]">
        ← board
      </Link>

      <div className="panel flex flex-wrap items-center justify-between gap-4 p-5">
        <div className="flex items-center gap-4">
          <ScoreRing score={p.gravity_score} size={56} />
          <div>
            <h1 className="font-display text-3xl">{p.prospect.name}</h1>
            <p className="label mt-1 normal-case tracking-normal">
              {p.prospect.title} @ {p.prospect.company} ·{" "}
              <a href={p.prospect.linkedin_url} className="text-[var(--cyan)] underline decoration-dotted" target="_blank" rel="noreferrer">
                linkedin
              </a>
              {p.prospect.x_handle && <> · {p.prospect.x_handle}</>}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <HeatBar heat={p.heat} />
          <StateChip state={p.state} />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <section className="panel p-4">
          <p className="label mb-3" style={{ color: "var(--amber)" }}>
            topics & stances
          </p>
          {p.topics.length === 0 && <p className="label normal-case">listener still reading…</p>}
          <ul className="space-y-3">
            {p.topics.map((t, i) => (
              <li key={i} className="border-l-2 border-[var(--line-bright)] pl-3">
                <p className="text-[13px] font-semibold">{t.topic}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-[var(--muted)]">
                  {t.stance}
                </p>
                <Evidence urls={t.evidence} />
              </li>
            ))}
          </ul>
        </section>

        <div className="space-y-4">
          <section className="panel p-4">
            <p className="label mb-3" style={{ color: "var(--cyan)" }}>
              their orbit — influencers
            </p>
            <ul className="space-y-3">
              {p.influencers.map((inf, i) => (
                <li key={i}>
                  <p className="text-[13px] font-semibold">{inf.name}</p>
                  <p className="mt-0.5 text-xs text-[var(--muted)]">{inf.why}</p>
                  <Evidence urls={inf.evidence} />
                </li>
              ))}
              {p.influencers.length === 0 && (
                <p className="label normal-case">—</p>
              )}
            </ul>
          </section>

          <section className="panel p-4">
            <p className="label mb-3">rewards · behavior · signals</p>
            <div className="flex flex-wrap gap-2">
              {p.formats.map((f) => (
                <span key={f} className="chip" style={{ color: "var(--text)" }}>
                  {f.replaceAll("_", " ")}
                </span>
              ))}
              <span className="chip" style={{ color: "var(--cyan)", borderColor: "var(--cyan)" }}>
                {p.behavior}
              </span>
            </div>
            <ul className="mt-3 space-y-1.5">
              {p.signals.map((s, i) => (
                <li key={i} className="text-xs" style={{ color: "var(--amber)" }}>
                  ⚡ {s.detail}
                  <span className="label ml-2">sillage · {s.type}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="panel p-4">
            <p className="label mb-2" style={{ color: "var(--green)" }}>
              contact — bought just-in-time
            </p>
            {p.contact.emails.length ? (
              <p className="text-[13px]">
                ✉ {p.contact.emails[0]}
                {p.contact.phones[0] && <> · ☎ {p.contact.phones[0]}</>}
              </p>
            ) : (
              <p className="label normal-case">
                not purchased yet — fires at the warm trigger
              </p>
            )}
          </section>
        </div>
      </div>

      {p.engagement_events.length > 0 && (
        <section className="panel p-4">
          <p className="label mb-3" style={{ color: "var(--green)" }}>
            engagement with your content
          </p>
          <ul className="space-y-2">
            {p.engagement_events.map((e, i) => (
              <li key={i} className="text-xs">
                <span style={{ color: "var(--green)" }}>
                  {e.kind === "comment" ? "💬" : "▲"} {e.kind}
                </span>{" "}
                on <span className="text-[var(--cyan)]">{e.post_id}</span>
                {e.quote && <span className="text-[var(--muted)]"> — “{e.quote}”</span>}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
