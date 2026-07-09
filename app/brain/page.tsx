"use client";

// COMPANY BRAIN — everything Gravity has learned, and why it decided what
// it decided. Minimal but comprehensive: the data behind every decision.

import { useEffect, useState } from "react";
import { TempSwatch } from "@/components/ui";
import { CompanyBrain } from "@/lib/brain";

const VERDICT_T: Record<string, number> = { hot: 1, warm: 0.6, cold: 0.15, unposted: 0.05 };

export default function Brain() {
  const [brain, setBrain] = useState<CompanyBrain | null>(null);

  useEffect(() => {
    const tick = async () => {
      try {
        setBrain(await fetch("/api/brain", { cache: "no-store" }).then((r) => r.json()));
      } catch {}
    };
    tick();
    const id = setInterval(tick, 2000);
    return () => clearInterval(id);
  }, []);

  if (!brain) return <p className="label">connecting…</p>;
  const c = brain.company;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-[26px] font-semibold tracking-tight">company brain</h1>
        <p className="mono label mt-1">
          every decision carries its data · persists across runs
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <section className="card rise p-5">
          <p className="label mb-3">who we are</p>
          <p className="text-[13.5px] leading-relaxed">{c.narrative || "—"}</p>
          <p className="label mt-3">icp</p>
          <p className="mt-1 text-[12.5px] text-[var(--muted)]">{c.icp || "—"}</p>
          <p className="label mt-3">tone of voice · learned from our own posts</p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {c.tone_of_voice.length ? (
              c.tone_of_voice.map((t) => (
                <span key={t} className="card-paper px-2.5 py-1 text-[11.5px]">
                  {t}
                </span>
              ))
            ) : (
              <span className="label">run the pipeline first</span>
            )}
          </div>
        </section>

        <section className="card rise p-5">
          <p className="label mb-3">decisions · with their reasons</p>
          <ul className="space-y-3">
            {brain.decisions.length === 0 && <li className="label">none yet</li>}
            {[...brain.decisions].reverse().map((d, i) => (
              <li key={i} className="border-b border-[var(--card-deep)] pb-2.5 last:border-0">
                <p className="text-[13px] font-medium">{d.decision}</p>
                <p className="mt-0.5 text-[12px] text-[var(--muted)]">
                  <span className="text-[var(--accent)]">because · </span>
                  {d.because}
                </p>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="card rise p-5">
        <p className="label mb-3">content performance · what the data says works</p>
        {brain.content_performance.length === 0 && (
          <p className="label">no engagement measured yet — publish, then scan</p>
        )}
        <div className="space-y-2">
          {brain.content_performance.map((p) => (
            <div key={p.post_id} className="flex items-center gap-3 border-b border-[var(--card-deep)] py-2 last:border-0">
              <TempSwatch t={VERDICT_T[p.verdict] ?? 0.1} title={p.verdict} />
              <p className="min-w-0 flex-1 truncate text-[13px]">{p.title}</p>
              <span className="mono text-[11.5px] text-[var(--muted)]">
                {p.engagements} eng · {p.comments} comments · {p.verdict}
              </span>
            </div>
          ))}
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <section className="card rise p-5">
          <p className="label mb-3">learnings</p>
          <ul className="space-y-1.5">
            {brain.learnings.length === 0 && <li className="label">—</li>}
            {[...brain.learnings].reverse().slice(0, 10).map((l, i) => (
              <li key={i} className="mono text-[11.5px] leading-relaxed text-[var(--muted)]">
                <span className="text-[var(--faint)]">{l.at.slice(11, 16)}</span>{" "}
                <span className="text-[var(--accent)]">{l.source}</span> · {l.insight}
              </li>
            ))}
          </ul>
        </section>

        <section className="card rise p-5">
          <p className="label mb-3">your steering notes · always respected</p>
          <ul className="space-y-1.5">
            {brain.user_notes.length === 0 && (
              <li className="label">revise any draft on the plan — notes land here</li>
            )}
            {[...brain.user_notes].reverse().map((n, i) => (
              <li key={i} className="text-[12.5px]">
                <span className="link-green">→</span> {n.note}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
