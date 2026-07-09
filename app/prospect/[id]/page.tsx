"use client";

// WORLD MODEL — everything we know, every claim with its evidence.

import Link from "next/link";
import { use } from "react";
import {
  Evidence,
  HeatBar,
  MediaBar,
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
        unknown prospect — <Link href="/board" className="link-green">→ back to board</Link>
      </p>
    );

  return (
    <div className="rise space-y-5">
      <Link href="/board" className="link-green">
        ← board
      </Link>

      <div className="card flex flex-wrap items-center justify-between gap-4 p-5">
        <div className="flex items-center gap-4">
          <ScoreRing score={p.gravity_score} size={56} />
          <div>
            <h1 className="text-[24px] font-semibold tracking-tight">
              {p.prospect.name}
            </h1>
            <p className="label mt-0.5">
              {p.prospect.title} @ {p.prospect.company} ·{" "}
              <a href={p.prospect.linkedin_url} className="link-green" target="_blank" rel="noreferrer">
                linkedin
              </a>
              {p.prospect.x_handle && (
                <span className="mono"> · {p.prospect.x_handle}</span>
              )}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          {(() => {
            const cohort = state.cohorts.find((c) => c.members.includes(p.id));
            if (!cohort) return null;
            const reseated = cohort.recent_moves?.includes(p.id);
            return (
              <span className="card-paper px-2.5 py-1 text-[11px] text-[var(--muted)]">
                cohort · {cohort.name}
                {reseated && <span className="text-[var(--accent)]"> · ↩ re-seated</span>}
              </span>
            );
          })()}
          <HeatBar heat={p.heat} />
          <StateChip state={p.state} />
        </div>
      </div>

      {/* the dossier — what this person actually responds to, at a glance */}
      {p.topics.length > 0 && (
        <section className="card rise p-5">
          <p className="label mb-3">
            taste profile — what {p.prospect.name.split(" ")[0]} actually responds to
          </p>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <p className="mono text-[10.5px] text-[var(--accent)]">rewards</p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {p.formats.map((f) => (
                  <span key={f} className="card-paper px-2.5 py-1 text-[11.5px]">
                    {f.replaceAll("_", " ")}
                  </span>
                ))}
              </div>
              {p.media.length > 0 && (
                <div className="mt-2.5 max-w-[210px]">
                  <MediaBar mix={p.media} />
                </div>
              )}
            </div>
            <div>
              <p className="mono text-[10.5px] text-[var(--yellow)]">punishes</p>
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {p.topics
                  .filter((t) => /hostil|hate|against|complain|spam|worse/i.test(t.stance))
                  .map((t) => (
                    <span key={t.topic} className="card-paper px-2.5 py-1 text-[11.5px]">
                      {t.topic}
                    </span>
                  ))}
                <span className="card-paper px-2.5 py-1 text-[11.5px]">
                  anything that smells automated
                </span>
              </div>
            </div>
            <div>
              <p className="mono text-[10.5px] text-[var(--muted)]">attention lives in</p>
              <p className="mt-1.5 text-[12.5px] leading-relaxed text-[var(--muted)]">
                {p.influencers.map((i) => i.name).join(" · ") || "—"}
              </p>
              <p className="mono mt-1.5 text-[11px] text-[var(--muted)]">
                {p.behavior} · heat {p.heat}
              </p>
            </div>
          </div>
        </section>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <section className="card p-4.5 p-5">
          <p className="label mb-3.5">topics & stances</p>
          {p.topics.length === 0 && <p className="label">listener still reading…</p>}
          <ul className="space-y-4">
            {p.topics.map((t, i) => (
              <li key={i} className="card-paper p-3.5">
                <p className="text-[13.5px] font-semibold">{t.topic}</p>
                <p className="mt-1 text-[12.5px] leading-relaxed text-[var(--muted)]">
                  {t.stance}
                </p>
                <div className="mt-1.5">
                  <Evidence urls={t.evidence} />
                </div>
              </li>
            ))}
          </ul>
        </section>

        <div className="space-y-4">
          <section className="card p-5">
            <p className="label mb-3.5">their orbit — influencers</p>
            <ul className="space-y-3.5">
              {p.influencers.map((inf, i) => (
                <li key={i}>
                  <p className="text-[13.5px] font-semibold">{inf.name}</p>
                  <p className="mt-0.5 text-[12.5px] text-[var(--muted)]">{inf.why}</p>
                  <Evidence urls={inf.evidence} />
                </li>
              ))}
              {p.influencers.length === 0 && <p className="label">—</p>}
            </ul>
          </section>

          <section className="card p-5">
            <p className="label mb-3">rewards · behavior · signals</p>
            <div className="flex flex-wrap gap-1.5">
              {p.formats.map((f) => (
                <span key={f} className="card-paper px-2.5 py-1 text-[11.5px]">
                  {f.replaceAll("_", " ")}
                </span>
              ))}
              <span className="card-paper px-2.5 py-1 text-[11.5px] font-medium text-[var(--accent)]">
                {p.behavior}
              </span>
            </div>
            <ul className="mt-3.5 space-y-1.5">
              {p.signals.map((s, i) => (
                <li key={i} className="text-[12.5px]">
                  <span className="link-green">→ {s.detail}</span>
                  <span className="label mono ml-2" style={{ fontSize: 10.5 }}>
                    sillage · {s.type}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section className="card-dark p-5">
            <p className="text-[12.5px] text-white/60">contact — bought just-in-time</p>
            {p.contact.emails.length ? (
              <p className="mono mt-2 text-[13px]">
                ✉ {p.contact.emails[0]}
                {p.contact.phones[0] && <> · ☎ {p.contact.phones[0]}</>}
              </p>
            ) : (
              <p className="mt-2 text-[12.5px] text-white/50">
                not purchased yet — fires at the warm trigger
              </p>
            )}
          </section>
        </div>
      </div>

      {p.engagement_events.length > 0 && (
        <section className="card p-5">
          <p className="label mb-3">engagement with your content</p>
          <ul className="space-y-2">
            {p.engagement_events.map((e, i) => (
              <li key={i} className="text-[12.5px]">
                <span className="font-medium text-[var(--accent)]">
                  {e.kind === "comment" ? "💬" : "▲"} {e.kind}
                </span>{" "}
                on <span className="mono">{e.post_id}</span>
                {e.quote && <span className="text-[var(--muted)]"> — “{e.quote}”</span>}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
