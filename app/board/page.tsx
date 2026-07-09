"use client";

// PIPELINE — one screen, left to right: map buyers → generate gravity →
// track engagement. What's happening, where things stand, what you do next.

import Link from "next/link";
import { useState } from "react";
import {
  CopyBtn,
  CrewStrip,
  DotTrace,
  Stat,
  TempLegend,
  TempSwatch,
  postTemp,
  prospectTemp,
  usePolledState,
  warmthScore,
} from "@/components/ui";

function ColHeader({
  n,
  title,
  href,
  hrefLabel,
}: {
  n: string;
  title: string;
  href?: string;
  hrefLabel?: string;
}) {
  return (
    <div className="mb-1 flex items-baseline justify-between">
      <p className="label">
        <span className="mono mr-2 text-[10.5px] text-[var(--faint)]">{n}</span>
        {title}
      </p>
      {href && (
        <Link href={href} className="link-green text-[11.5px]">
          <span className="arr">→</span> {hrefLabel}
        </Link>
      )}
    </div>
  );
}

const Hairline = () => <div className="h-px bg-[var(--card-deep)]" />;

export default function Pipeline() {
  const state = usePolledState(1000);
  const [scanning, setScanning] = useState(false);

  if (!state) return <p className="label">connecting…</p>;

  const hot = state.prospects
    .filter((p) => p.state !== "low_orbit")
    .sort((a, b) => prospectTemp(b) - prospectTemp(a));
  const quiet = state.prospects.filter((p) => p.state === "low_orbit");

  const intentDensity = hot.length
    ? hot.reduce((a, p) => a + p.heat, 0) / hot.length / 100
    : 0;
  const planDone = state.plan.filter((p) => p.done).length;
  const planProgress = state.plan.length ? planDone / state.plan.length : 0;
  const warmRate = hot.length
    ? hot.filter((p) => p.state === "warm" || p.state === "in_conversation")
        .length / hot.length
    : 0;
  const warmth = warmthScore(state.prospects);
  const w = Math.min(1, warmth / 100);
  const meetings = state.warm.filter((x) => x.meeting).length;
  const meetingConv = hot.length ? meetings / hot.length : 0;

  const nextActions = state.plan.filter((p) => !p.done).slice(0, 5);
  const lastLogs = [...state.log].reverse().slice(0, 3);

  async function toggle(id: string, done: boolean) {
    await fetch("/api/plan", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id, done }),
    });
  }

  async function markSent(id: string) {
    await fetch("/api/warm", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id, sent: true }),
    });
  }

  async function scan() {
    setScanning(true);
    try {
      await fetch("/api/radar", { method: "POST" });
    } finally {
      setScanning(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-[24px] font-semibold tracking-tight">pipeline</h1>
          {state.input.product_summary && (
            <p className="label mt-1 max-w-2xl normal-case">
              {state.input.product_summary}
            </p>
          )}
        </div>
        {!state.run_done && state.log.length > 0 ? (
          <p
            key={state.log[state.log.length - 1].msg}
            className="log-in mono max-w-xs text-right text-[11.5px] text-[var(--muted)]"
          >
            <span className="text-[var(--accent)]">
              {state.log[state.log.length - 1].agent}
            </span>{" "}
            · {state.log[state.log.length - 1].msg}
          </p>
        ) : (
          <p className="mono label shrink-0 whitespace-nowrap">
            {hot.length} hot · {quiet.length} low-orbit{state.mock && " · demo"}
          </p>
        )}
      </div>

      <CrewStrip crew={state.crew} />

      <div className="gap-7 space-y-8 lg:grid lg:grid-cols-[1.1fr_1.25fr_1.15fr_250px] lg:space-y-0">
        {/* ── 01 · map buyers ─────────────────────────────── */}
        <section className="min-w-0">
          <ColHeader n="01" title="map buyers" />
          <Stat
            value={intentDensity}
            label="intent density"
            display={intentDensity.toFixed(3)}
          />
          <Hairline />
          {hot.map((p) => (
            <Link
              key={p.id}
              href={`/prospect/${p.id}`}
              className="group flex items-center gap-3 border-b border-[var(--card-deep)] py-3 transition-colors hover:bg-[var(--card)]/60"
            >
              <TempSwatch
                t={prospectTemp(p)}
                title={`buyer temperature ${Math.round(prospectTemp(p) * 100)}`}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13.5px] font-semibold tracking-tight">
                  {p.prospect.name}
                </p>
                <p className="label truncate" style={{ fontSize: 11.5 }}>
                  {p.prospect.title} @ {p.prospect.company}
                </p>
              </div>
              <span className="mono text-[12px]">{p.gravity_score}</span>
              <DotTrace p={p} />
            </Link>
          ))}
          {quiet.map((p) => (
            <div
              key={p.id}
              className="flex items-center gap-3 border-b border-[var(--card-deep)] py-3 opacity-50"
            >
              <TempSwatch t={0.05} title="low-orbit — quiet on socials" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px]">{p.prospect.name}</p>
                <p className="label truncate" style={{ fontSize: 11 }}>
                  low-orbit · email-first
                </p>
              </div>
              <span className="mono truncate text-[10.5px] text-[var(--muted)]">
                {p.contact.emails[0] ?? "…"}
              </span>
            </div>
          ))}
        </section>

        {/* ── 02 · generate gravity ───────────────────────── */}
        <section className="min-w-0">
          <ColHeader n="02" title="generate gravity" href="/plan" hrefLabel="full plan" />
          <Stat
            value={planProgress}
            label="plan executed"
            display={`${planDone}/${state.plan.length || "—"}`}
          />
          <Hairline />
          {state.plan.length === 0 && (
            <p className="label pulse py-4">strategist is drafting…</p>
          )}
          {nextActions.map((item) => (
            <div key={item.id} className="border-b border-[var(--card-deep)] py-3">
              <div className="flex items-center justify-between gap-2">
                <p className="min-w-0 truncate text-[13px]">
                  <span className="link-green">→ {item.type}</span>{" "}
                  <span className="font-medium">{item.title}</span>
                </p>
                {item.type === "post" && (
                  <TempSwatch
                    t={postTemp(state, item.id)}
                    title="engagement this post earned"
                  />
                )}
              </div>
              <p className="label mt-0.5 truncate" style={{ fontSize: 11 }}>
                {item.why}
              </p>
              <div className="mt-2 flex gap-1.5">
                {item.draft && <CopyBtn small text={item.draft} />}
                {item.link && (
                  <a
                    className="btn btn-ghost"
                    style={{ padding: "4px 10px", fontSize: 11.5 }}
                    href={item.link}
                    target="_blank"
                    rel="noreferrer"
                  >
                    open ↗
                  </a>
                )}
                <button
                  className="btn"
                  style={{ padding: "4px 10px", fontSize: 11.5 }}
                  onClick={() => toggle(item.id, true)}
                >
                  done ✓
                </button>
              </div>
            </div>
          ))}
          {state.plan.length > 0 && nextActions.length === 0 && (
            <p className="label py-4">
              all done — radar is watching. next week&apos;s plan tunes itself.
            </p>
          )}
        </section>

        {/* ── 03 · track engagement ───────────────────────── */}
        <section className="min-w-0">
          <ColHeader n="03" title="track engagement" href="/warm" hrefLabel="warm queue" />
          <Stat
            value={warmRate}
            label="warm rate"
            display={`${Math.round(warmRate * 100)}%`}
          />
          <Hairline />
          <button
            className="btn btn-ghost my-3 w-full justify-center"
            style={{ padding: "6px 12px", fontSize: 12 }}
            onClick={scan}
            disabled={scanning}
          >
            {scanning ? "scanning…" : "◉ scan engagement"}
          </button>
          {state.warm.length === 0 && (
            <p className="label py-2" style={{ fontSize: 11.5 }}>
              no engagement yet — execute the plan, then scan
            </p>
          )}
          {state.warm.slice(0, 4).map((w) => (
            <div key={w.id} className={`border-b border-[var(--card-deep)] py-3 ${w.sent ? "opacity-45" : ""}`}>
              <div className="flex items-center justify-between gap-2">
                <p className="min-w-0 truncate text-[13px] font-medium">
                  {w.name}
                  {w.serendipity && (
                    <span className="link-green ml-1.5 text-[10px]">serendipity</span>
                  )}
                </p>
                <TempSwatch t={w.event.kind === "comment" ? 1 : 0.75} title="engagement temperature" />
              </div>
              <p className="label mt-0.5 truncate italic" style={{ fontSize: 11.5 }}>
                {w.event.kind === "comment" ? `“${w.event.quote}”` : "reacted to your post"}
              </p>
              {w.enriching ? (
                <p className="pulse mono mt-1 text-[10.5px] text-[var(--muted)]">
                  fullenrich · verifying contact…
                </p>
              ) : (
                <p className="mono mt-1 truncate text-[10.5px] text-[var(--muted)]">
                  ✉ {w.email}
                </p>
              )}
              {!w.enriching && (
                <div className="mt-2 flex gap-1.5">
                  <CopyBtn small text={w.email_draft} label="copy email" />
                  {!w.sent && (
                    <button
                      className="btn"
                      style={{ padding: "4px 10px", fontSize: 11.5 }}
                      onClick={() => markSent(w.id)}
                    >
                      sent →
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
          {lastLogs.length > 0 && (
            <div className="mt-3 space-y-1">
              {lastLogs.map((l, i) => (
                <p key={`${l.at}-${i}`} className="mono truncate text-[10.5px] text-[var(--faint)]">
                  {l.at.slice(11, 19)} <span className="text-[var(--accent)]">{l.agent}</span> · {l.msg}
                </p>
              ))}
            </div>
          )}
        </section>

        {/* ── the temperature of the whole pipeline ───────── */}
        <aside
          className="gradient-warm flex min-h-[380px] flex-col justify-end p-5 lg:min-h-full"
          style={{
            filter: `saturate(${0.5 + 0.5 * w}) hue-rotate(${-(1 - w) * 22}deg)`,
            transition: "filter 1.2s ease",
          }}
        >
          <div className="relative z-10">
            <h2 className="text-[22px] font-bold tracking-tight">warmth score</h2>
            <p className="mt-1 text-[11.5px] leading-relaxed text-white/85">
              every buyer&apos;s temperature, averaged — the panel itself runs
              colder or hotter with it
            </p>
            <p className="mono mt-4 text-[27px] font-medium">
              {warmth.toFixed(1)} <span className="text-white/70">/ 100</span>
            </p>
            <p className="mono mt-1.5 text-[11px] text-white/85">
              {meetings} meeting{meetings === 1 ? "" : "s"} · prospect→meeting{" "}
              {Math.round(meetingConv * 100)}%
            </p>
            <div className="mt-4">
              <TempLegend marker={w} light />
            </div>
            <div className="mt-3 flex items-center justify-between gap-3 whitespace-nowrap border-t border-white/25 pt-3">
              <span className="mono text-[10px] text-white/80">
                sync {new Date().toLocaleTimeString([], { hour12: false })}
              </span>
              <Link href="/warm" className="text-[11.5px] font-medium text-white hover:opacity-75">
                warm queue
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
