"use client";

// Shared pieces in the instrument-editorial language: dials in dotted
// ellipses, status dots, mono numbers, one warm gradient statement piece.

import { useCallback, useEffect, useRef, useState } from "react";
import { AppState, BuyerWorldModel, CrewStatus, ProspectState } from "@/lib/types";

export const STATE_COLOR: Record<ProspectState, string> = {
  cold: "var(--faint)",
  low_orbit: "var(--faint)",
  modeled: "var(--charcoal)",
  engaged: "var(--yellow)",
  warm: "var(--accent)",
  in_conversation: "var(--accent)",
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
      /* dev hiccup — next tick catches up */
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
  return (
    <span className="flex items-center gap-1.5 text-[12px] text-[var(--muted)]">
      <span className="dot" style={{ background: STATE_COLOR[state] }} />
      {STATE_LABEL[state]}
    </span>
  );
}

// Three-dot pipeline trace per prospect: modeled → engaged → warm.
export function DotTrace({ p }: { p: BuyerWorldModel }) {
  const modeled = p.topics.length > 0;
  const reactions = p.engagement_events.length;
  const warm = p.state === "warm" || p.state === "in_conversation";
  const dots = [
    modeled ? "var(--accent)" : "var(--faint)",
    warm || reactions > 1
      ? "var(--accent)"
      : reactions === 1
        ? "var(--yellow)"
        : "var(--faint)",
    warm ? "var(--accent)" : "var(--faint)",
  ];
  return (
    <span className="flex flex-col gap-1">
      {dots.map((c, i) => (
        <span key={i} className="dot" style={{ background: c }} />
      ))}
    </span>
  );
}

// The reference's instrument dial: charcoal disk + needle in a dotted ellipse.
export function Dial({
  value, // 0..1 → needle position
  label,
  display,
  live = false,
}: {
  value: number;
  label: string;
  display: string;
  live?: boolean;
}) {
  const angle = -110 + Math.max(0, Math.min(1, value)) * 220;
  return (
    <div className="flex flex-col items-center rise">
      <svg width="150" height="104" viewBox="0 0 150 104">
        <ellipse
          cx="75"
          cy="52"
          rx="72"
          ry="48"
          fill="none"
          stroke="var(--faint)"
          strokeWidth="1"
          strokeDasharray="2 5"
        />
        <circle cx="75" cy="52" r="30" fill="var(--charcoal)" />
        <g
          className={live ? "needle-live" : undefined}
          style={
            live
              ? { transformOrigin: "75px 52px" }
              : {
                  transform: `rotate(${angle}deg)`,
                  transformOrigin: "75px 52px",
                  transition: "transform 800ms cubic-bezier(.2,.7,.2,1)",
                }
          }
        >
          <line
            x1="75"
            y1="52"
            x2="75"
            y2="29"
            stroke="#f6f6f3"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </g>
      </svg>
      <p className="label mt-2">{label}</p>
      <p className="mono mt-0.5 text-[15px] font-medium">{display}</p>
    </div>
  );
}

export function ScoreRing({ score, size = 44 }: { score: number; size?: number }) {
  const r = (size - 6) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.min(score, 100) / 100;
  return (
    <svg width={size} height={size} className="shrink-0 -rotate-90">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--card-deep)" strokeWidth="3.5" />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="var(--accent)"
        strokeWidth="3.5"
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
        fill="var(--ink)"
        fontSize="12.5"
        fontWeight="600"
        fontFamily="var(--font-mono)"
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
      <span className="label">heat</span>
      <div className="h-[3px] w-16 overflow-hidden rounded-full bg-[var(--card-deep)]">
        <div
          className="h-full rounded-full"
          style={{
            width: `${heat}%`,
            background: "linear-gradient(90deg, #ffd166, #ff8f7d)",
            transition: "width 600ms",
          }}
        />
      </div>
      <span className="mono text-[12.5px] font-medium">{heat}</span>
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
        <div key={c.agent} className="card px-3.5 py-3">
          <div className="flex items-center gap-2">
            <span
              className={`dot ${c.status === "running" ? "pulse" : ""}`}
              style={{
                background:
                  c.status === "done"
                    ? "var(--accent)"
                    : c.status === "running"
                      ? "var(--yellow)"
                      : "var(--faint)",
              }}
            />
            <span className="text-[12.5px] font-semibold lowercase">{c.agent}</span>
          </div>
          <p className="label mt-1 leading-snug" style={{ fontSize: 11 }}>
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
      className="btn btn-ghost"
      style={ok ? { color: "var(--accent)" } : undefined}
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
    <span className="inline-flex flex-wrap gap-2.5">
      {urls.map((u, i) => (
        <a key={i} href={u} target="_blank" rel="noreferrer" className="link-green text-[11.5px]">
          → evidence {i + 1}
        </a>
      ))}
    </span>
  );
}

// Pipeline readiness across all mapped accounts — the gradient panel number.
export function warmthScore(prospects: BuyerWorldModel[]): number {
  const hot = prospects.filter((p) => p.state !== "low_orbit");
  if (!hot.length) return 0;
  const per = hot.map(
    (p) => 0.6 * p.heat + 0.4 * Math.min(p.gravity_score * 2, 100)
  );
  return Math.round((per.reduce((a, b) => a + b, 0) / hot.length) * 10) / 10;
}
