"use client";

// Shared pieces in the gravity language: black masses, dotted orbits with
// live orbiting bodies, captured-arc gauges, mono numbers, warm mesh.

import { useCallback, useEffect, useState } from "react";
import { useRef } from "react";
import { AppState, BuyerWorldModel, CrewStatus, LogLine, ProspectState } from "@/lib/types";

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

// Elliptical orbit path for animateMotion.
function orbitPath(cx: number, cy: number, rx: number, ry: number) {
  return `M ${cx + rx} ${cy} A ${rx} ${ry} 0 1 1 ${cx - rx} ${cy} A ${rx} ${ry} 0 1 1 ${cx + rx} ${cy}`;
}

// A gravity well: black mass, dotted orbit with live bodies, and the value
// as a captured arc around the mass — matter pulled in, not a clock.
export function GravityWell({
  value, // 0..1 → how much of the orbit is captured
  label,
  display,
}: {
  value: number;
  label: string;
  display: string;
}) {
  const v = Math.max(0.02, Math.min(1, value));
  const arcR = 34;
  const c = 2 * Math.PI * arcR;
  return (
    <div className="rise flex flex-col items-center">
      <svg width="160" height="112" viewBox="0 0 160 112">
        <ellipse
          cx="80"
          cy="56"
          rx="73"
          ry="47"
          fill="none"
          stroke="var(--faint)"
          strokeWidth="1"
          strokeDasharray="2 5"
        />
        {/* captured arc — the gauge */}
        <circle
          cx="80"
          cy="56"
          r={arcR}
          fill="none"
          stroke="var(--accent)"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - v)}
          transform="rotate(-90 80 56)"
          style={{ transition: "stroke-dashoffset 900ms cubic-bezier(.2,.7,.2,1)" }}
        />
        {/* the mass */}
        <circle cx="80" cy="56" r="26" fill="var(--charcoal)" />
        {/* orbiting bodies */}
        <circle r="2.6" fill="var(--ink)">
          <animateMotion
            dur="9s"
            repeatCount="indefinite"
            path={orbitPath(80, 56, 73, 47)}
          />
        </circle>
        <circle r="1.9" fill="#e8a13d">
          <animateMotion
            dur="15s"
            begin="-6s"
            repeatCount="indefinite"
            path={orbitPath(80, 56, 73, 47)}
          />
        </circle>
      </svg>
      <p className="label mt-1.5">{label}</p>
      <p className="mono mt-0.5 text-[15px] font-medium">{display}</p>
    </div>
  );
}

// Landing hero: a heavier mass, two orbits, three bodies at different periods.
export function GravityHero() {
  return (
    <svg
      width="300"
      height="190"
      viewBox="0 0 300 190"
      className="mx-auto block"
      aria-hidden
    >
      <ellipse cx="150" cy="95" rx="142" ry="82" fill="none" stroke="var(--faint)" strokeWidth="1" strokeDasharray="2 6" />
      <ellipse cx="150" cy="95" rx="96" ry="54" fill="none" stroke="var(--faint)" strokeWidth="1" strokeDasharray="2 5" />
      <circle cx="150" cy="95" r="36" fill="var(--charcoal)" />
      <circle cx="150" cy="95" r="46" fill="none" stroke="rgba(27,27,25,.14)" strokeWidth="1" />
      <circle r="3.2" fill="var(--ink)">
        <animateMotion dur="11s" repeatCount="indefinite" path={orbitPath(150, 95, 142, 82)} />
      </circle>
      <circle r="2.4" fill="#e8a13d">
        <animateMotion dur="7.5s" begin="-3s" repeatCount="indefinite" path={orbitPath(150, 95, 96, 54)} />
      </circle>
      <circle r="2.2" fill="var(--accent)">
        <animateMotion
          dur="17s"
          begin="-9s"
          repeatCount="indefinite"
          path={orbitPath(150, 95, 142, 82)}
          keyPoints="1;0"
          keyTimes="0;1"
          calcMode="linear"
        />
      </circle>
    </svg>
  );
}

// Score as a mass with a captured arc — white number inside the black body.
export function ScoreRing({ score, size = 44 }: { score: number; size?: number }) {
  const r = (size - 6) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.min(score, 100) / 100;
  return (
    <svg width={size} height={size} className="shrink-0">
      <circle cx={size / 2} cy={size / 2} r={r - 6} fill="var(--charcoal)" />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="var(--card-deep)"
        strokeWidth="2.5"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="var(--accent)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeDasharray={c}
        strokeDashoffset={c * (1 - pct)}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
        style={{ transition: "stroke-dashoffset 700ms cubic-bezier(.2,.7,.2,1)" }}
      />
      <text
        x="50%"
        y="52%"
        textAnchor="middle"
        dominantBaseline="central"
        fill="#f6f6f3"
        fontSize={size > 50 ? 13 : 11.5}
        fontWeight="600"
        fontFamily="var(--font-mono)"
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
          <p key={c.note} className="label log-in mt-1 leading-snug" style={{ fontSize: 11 }}>
            {c.status === "idle" ? CREW_META[c.agent] : c.note}
          </p>
        </div>
      ))}
    </div>
  );
}

// The thinking feed — what the crew is doing, line by line.
export function LogStream({ log, max = 5 }: { log: LogLine[]; max?: number }) {
  const lines = log.slice(-max);
  return (
    <div className="space-y-1.5">
      {lines.map((l, i) => (
        <p
          key={`${l.at}-${i}`}
          className="log-in mono text-[12px] text-[var(--muted)]"
          style={{ opacity: 0.45 + (0.55 * (i + 1)) / lines.length }}
        >
          <span className="text-[var(--accent)]">{l.agent}</span> · {l.msg}
        </p>
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
          <span className="arr">→</span> evidence {i + 1}
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
