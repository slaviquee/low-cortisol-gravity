"use client";

// Shared instrument pieces: state chips, score rings, heat bars, crew strip.

import { useCallback, useEffect, useRef, useState } from "react";
import { AppState, CrewStatus, ProspectState } from "@/lib/types";

export const STATE_COLOR: Record<ProspectState, string> = {
  cold: "var(--dim)",
  low_orbit: "var(--dim)",
  modeled: "var(--cyan)",
  engaged: "var(--amber)",
  warm: "var(--green)",
  in_conversation: "var(--violet)",
};

export const STATE_LABEL: Record<ProspectState, string> = {
  cold: "cold",
  low_orbit: "low-orbit",
  modeled: "modeled",
  engaged: "engaged",
  warm: "warm",
  in_conversation: "talking",
};

export function usePolledState(intervalMs = 1200): AppState | null {
  const [state, setState] = useState<AppState | null>(null);
  const tick = useCallback(async () => {
    try {
      const res = await fetch("/api/state", { cache: "no-store" });
      setState(await res.json());
    } catch {
      /* dev server hiccup — next tick catches up */
    }
  }, []);
  useEffect(() => {
    tick();
    const id = setInterval(tick, intervalMs);
    return () => clearInterval(id);
  }, [tick, intervalMs]);
  return state;
}

export function StateChip({ state }: { state: ProspectState }) {
  const c = STATE_COLOR[state];
  return (
    <span className="chip" style={{ borderColor: c, color: c }}>
      <span
        className="inline-block h-1.5 w-1.5 rounded-full"
        style={{ background: c }}
      />
      {STATE_LABEL[state]}
    </span>
  );
}

export function ScoreRing({ score, size = 44 }: { score: number; size?: number }) {
  const r = (size - 6) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.min(score, 100) / 100;
  return (
    <svg width={size} height={size} className="shrink-0 -rotate-90">
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="var(--line)"
        strokeWidth="3"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="var(--green)"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={c * (1 - pct)}
        style={{ transition: "stroke-dashoffset 600ms cubic-bezier(.2,.7,.2,1)" }}
      />
      <text
        x="50%"
        y="50%"
        textAnchor="middle"
        dominantBaseline="central"
        fill="var(--text)"
        fontSize="12"
        fontWeight="600"
        className="rotate-90"
        transform={`rotate(90 ${size / 2} ${size / 2})`}
      >
        {score}
      </text>
    </svg>
  );
}

export function HeatBar({ heat }: { heat: number }) {
  return (
    <div className="flex items-center gap-2" title={`heat ${heat}/100`}>
      <span className="label" style={{ color: "var(--amber)" }}>
        heat
      </span>
      <div className="h-1 w-16 overflow-hidden rounded-full bg-[var(--line)]">
        <div
          className="h-full rounded-full"
          style={{
            width: `${heat}%`,
            background: "linear-gradient(90deg, #7a5528, var(--amber))",
            transition: "width 600ms",
          }}
        />
      </div>
      <span className="text-xs" style={{ color: "var(--amber)" }}>
        {heat}
      </span>
    </div>
  );
}

const CREW_META: Record<CrewStatus["agent"], string> = {
  scout: "site → icp → sillage",
  resolver: "name buyers · heat triage",
  listener: "world models",
  strategist: "gravity map · plan",
  radar: "engagement watch",
};

export function CrewStrip({ crew }: { crew: CrewStatus[] }) {
  return (
    <div className="grid grid-cols-2 gap-2 md:grid-cols-5">
      {crew.map((c) => (
        <div key={c.agent} className="panel px-3 py-2.5">
          <div className="flex items-center gap-2">
            <span
              className={`inline-block h-2 w-2 rounded-full ${
                c.status === "running" ? "pulse" : ""
              }`}
              style={{
                background:
                  c.status === "done"
                    ? "var(--green)"
                    : c.status === "running"
                      ? "var(--amber)"
                      : "var(--dim)",
              }}
            />
            <span className="text-xs font-semibold uppercase tracking-wider">
              {c.agent}
            </span>
          </div>
          <p className="label mt-1 normal-case tracking-normal" style={{ fontSize: 10.5 }}>
            {c.status === "idle" ? CREW_META[c.agent] : c.note}
          </p>
        </div>
      ))}
    </div>
  );
}

export function CopyBtn({ text, label = "copy" }: { text: string; label?: string }) {
  const [ok, setOk] = useState(false);
  const t = useRef<ReturnType<typeof setTimeout>>(null);
  return (
    <button
      className="btn"
      style={ok ? { borderColor: "var(--green)", color: "var(--green)" } : undefined}
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setOk(true);
        if (t.current) clearTimeout(t.current);
        t.current = setTimeout(() => setOk(false), 1400);
      }}
    >
      {ok ? "copied ✓" : label}
    </button>
  );
}

export function Evidence({ urls }: { urls: string[] }) {
  if (!urls.length) return null;
  return (
    <span className="inline-flex flex-wrap gap-2">
      {urls.map((u, i) => (
        <a
          key={i}
          href={u}
          target="_blank"
          rel="noreferrer"
          className="text-[10px] tracking-wide text-[var(--cyan)] underline decoration-dotted underline-offset-2 hover:text-[var(--amber)]"
        >
          evidence {i + 1}
        </a>
      ))}
    </span>
  );
}
