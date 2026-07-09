"use client";

// WARM QUEUE — the loop closes: engagement → JIT enrichment → the touch.

import { useState } from "react";
import { CopyBtn, usePolledState } from "@/components/ui";

export default function Warm() {
  const state = usePolledState(1000);
  const [scanning, setScanning] = useState(false);
  const [lastScan, setLastScan] = useState("");

  if (!state) return <p className="label">connecting…</p>;

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

  async function markSent(id: string) {
    await fetch("/api/warm", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id, sent: true }),
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl">Warm queue</h1>
          <p className="label mt-1">
            1 comment or 2 reactions from a target → warm → the email is no
            longer cold
          </p>
        </div>
        <button className="btn" onClick={scan} disabled={scanning}>
          {scanning ? "scanning…" : "◉ scan engagement"}
        </button>
      </div>

      {lastScan && (
        <p className="rise text-xs" style={{ color: "var(--green)" }}>
          radar · {lastScan}
        </p>
      )}

      {state.warm.length === 0 && (
        <div className="panel p-8 text-center">
          <p className="label">
            no warm prospects yet — publish the plan, then scan engagement
          </p>
        </div>
      )}

      <div className="space-y-3">
        {state.warm.map((w) => (
          <div
            key={w.id}
            className={`panel rise p-4 ${w.sent ? "opacity-45" : "warm-glow"}`}
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-[15px] font-semibold">
                  {w.name}
                  {w.serendipity && (
                    <span
                      className="chip ml-2"
                      style={{ borderColor: "var(--violet)", color: "var(--violet)" }}
                    >
                      serendipity — never prospected
                    </span>
                  )}
                </p>
                <p className="label mt-0.5 normal-case tracking-normal">
                  {w.title}
                </p>
              </div>
              <div className="text-right">
                {w.enriching ? (
                  <p className="pulse text-xs" style={{ color: "var(--amber)" }}>
                    fullenrich · verifying contact…
                  </p>
                ) : (
                  <p className="text-xs" style={{ color: "var(--green)" }}>
                    ✉ {w.email || "—"}
                    {w.phone && <> · ☎ {w.phone}</>}
                  </p>
                )}
              </div>
            </div>

            <p className="mt-3 border-l-2 border-[var(--green)] pl-3 text-[13px] italic text-[#c6d3d8]">
              {w.event.kind === "comment"
                ? `“${w.event.quote}”`
                : "reacted to your post"}
            </p>

            {!w.enriching && w.email_draft && (
              <>
                <pre className="draft mt-3">{w.email_draft}</pre>
                {w.connect_note && (
                  <p className="mt-2 text-xs text-[var(--muted)]">
                    <span style={{ color: "var(--cyan)" }}>⊕ connect note · </span>
                    {w.connect_note}
                  </p>
                )}
                <div className="mt-3 flex gap-2">
                  <CopyBtn text={w.email_draft} label="copy email" />
                  {w.connect_note && (
                    <CopyBtn text={w.connect_note} label="copy note" />
                  )}
                  {!w.sent && (
                    <button className="btn" onClick={() => markSent(w.id)}>
                      mark sent →
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      {state.log.length > 0 && (
        <div className="panel p-4">
          <p className="label mb-2">radar log</p>
          <ul className="space-y-1">
            {[...state.log].reverse().slice(0, 8).map((l, i) => (
              <li key={i} className="text-[11px] text-[var(--muted)]">
                <span className="text-[var(--dim)]">
                  {l.at.slice(11, 19)}
                </span>{" "}
                <span style={{ color: "var(--cyan)" }}>{l.agent}</span> ·{" "}
                {l.msg}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
