"use client";

// WARM QUEUE — the loop closes: engagement → JIT enrichment → the touch.

import { useState } from "react";
import { CopyBtn, meshStyle, usePolledState, warmthScore } from "@/components/ui";

export default function Warm() {
  const state = usePolledState(1000);
  const [scanning, setScanning] = useState(false);
  const [lastScan, setLastScan] = useState("");

  if (!state) return <p className="label">connecting…</p>;
  const warmth = warmthScore(state.prospects);

  async function scan() {
    setScanning(true);
    try {
      const res = await fetch("/api/radar", { method: "POST" });
      const data = await res.json();
      setLastScan(data.result);
    } finally {
      setScanning(false);
    }
  }

  async function patch(id: string, body: Record<string, boolean>) {
    await fetch("/api/warm", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id, ...body }),
    });
  }

  async function pitch(id: string) {
    await fetch("/api/pitch", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id }),
    });
  }

  return (
    <div className="space-y-5">
      <div
        className="gradient-warm rise p-6"
        style={meshStyle(Math.min(1, warmth / 100))}
      >
        <div className="relative z-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="serif text-[30px] italic">track engagement</h1>
            <p className="mt-1 text-[12.5px] text-white/85">
              1 comment or 2 reactions from a target → warm → the email is no longer cold
            </p>
          </div>
          <div className="flex items-center gap-5">
            <p className="mono text-[22px] font-medium">
              {warmth.toFixed(1)} <span className="text-white/70">/ 100</span>
            </p>
            <button className="btn btn-onGradient" onClick={scan} disabled={scanning}>
              {scanning ? "scanning…" : "→ scan engagement"}
            </button>
          </div>
        </div>
      </div>

      {lastScan && (
        <p className="rise link-green text-[12.5px]">→ radar · {lastScan}</p>
      )}

      {state.warm.length === 0 && (
        <div className="card p-10 text-center">
          <p className="label">
            no warm prospects yet — publish the plan, then scan engagement
          </p>
        </div>
      )}

      <div className="space-y-3">
        {state.warm.map((w) => (
          <div
            key={w.id}
            className={`card rise p-5 ${w.sent ? "opacity-45" : ""}`}
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="flex items-center gap-2.5 text-[15px] font-semibold tracking-tight">
                  {w.name}
                  {w.serendipity && (
                    <span className="card-paper px-2.5 py-0.5 text-[10.5px] font-medium text-[var(--accent)]">
                      serendipity — never prospected
                    </span>
                  )}
                </p>
                <p className="label mt-0.5">{w.title}</p>
              </div>
              <div className="text-right">
                {w.enriching ? (
                  <p className="pulse mono text-[12px] text-[var(--muted)]">
                    fullenrich · verifying contact…
                  </p>
                ) : (
                  <p className="mono text-[12px]">
                    ✉ {w.email || "—"}
                    {w.phone && <> · ☎ {w.phone}</>}
                  </p>
                )}
              </div>
            </div>

            <p className="mt-3.5 border-l-2 border-[var(--accent)] pl-3 text-[13.5px] italic text-[#4a4a45]">
              {w.event.kind === "comment" ? `“${w.event.quote}”` : "reacted to your post"}
            </p>

            {!w.enriching && w.email_draft && (
              <>
                <pre className="draft mt-3.5">{w.email_draft}</pre>
                {w.connect_note && (
                  <p className="mt-2.5 text-[12px] text-[var(--muted)]">
                    <span className="link-green">→ connect note · </span>
                    {w.connect_note}
                  </p>
                )}
                {w.pitch_brief && (
                  <div className="card-paper mt-3 p-3.5">
                    <p className="link-green mb-1.5 text-[11.5px]">
                      → pitch brief · tailored to {w.name.split(" ")[0]}
                    </p>
                    <pre className="whitespace-pre-wrap font-[family-name:var(--font-mono)] text-[12px] leading-relaxed text-[#33332f]">
                      {w.pitch_brief}
                    </pre>
                  </div>
                )}
                <div className="mt-3.5 flex flex-wrap gap-2">
                  <CopyBtn text={w.email_draft} label="copy email" />
                  {w.connect_note && <CopyBtn text={w.connect_note} label="copy note" />}
                  {!w.pitch_brief ? (
                    <button className="btn btn-ghost" onClick={() => pitch(w.id)}>
                      → pitch brief
                    </button>
                  ) : (
                    <>
                      <CopyBtn text={w.pitch_brief} label="copy brief" />
                      <a
                        className="btn btn-ghost"
                        href="https://gamma.app/create"
                        target="_blank"
                        rel="noreferrer"
                      >
                        gamma deck ↗
                      </a>
                    </>
                  )}
                  {!w.sent && (
                    <button className="btn" onClick={() => patch(w.id, { sent: true })}>
                      mark sent →
                    </button>
                  )}
                  {w.sent && !w.meeting && (
                    <button className="btn" onClick={() => patch(w.id, { meeting: true })}>
                      meeting booked ✓
                    </button>
                  )}
                  {w.meeting && (
                    <span className="flex items-center gap-1.5 text-[12px] font-medium text-[var(--accent)]">
                      <span className="dot" style={{ background: "var(--accent)" }} />
                      meeting booked
                    </span>
                  )}
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {state.log.length > 0 && (
        <div className="card p-5">
          <p className="label mb-2.5">radar log</p>
          <ul className="space-y-1.5">
            {[...state.log].reverse().slice(0, 8).map((l, i) => (
              <li key={i} className="mono text-[11.5px] text-[var(--muted)]">
                <span className="text-[var(--faint)]">{l.at.slice(11, 19)}</span>{" "}
                <span className="text-[var(--accent)]">{l.agent}</span> · {l.msg}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
