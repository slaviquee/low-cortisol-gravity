"use client";

// GRAVITY PLAN — the week, sequenced up the familiarity ladder.

import {
  CopyBtn,
  Evidence,
  TempSwatch,
  postTemp,
  usePolledState,
} from "@/components/ui";
import { PlanActionType } from "@/lib/types";

const TYPE_META: Record<PlanActionType, string> = {
  post: "post",
  comment: "comment",
  follow: "follow",
  react: "react",
  connect: "connect",
};

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri"] as const;

export default function Plan() {
  const state = usePolledState();
  if (!state) return <p className="label">connecting…</p>;

  async function toggle(id: string, done: boolean) {
    await fetch("/api/plan", {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ id, done }),
    });
  }

  const map = state.gravity_map;

  return (
    <div className="space-y-7">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[26px] font-semibold tracking-tight">generate gravity</h1>
          <p className="mono label mt-1">
            react → comment → follow → connect → outreach · the familiarity ladder
          </p>
        </div>
        <button
          className="btn btn-ghost"
          onClick={async () => {
            await fetch("/api/replan", { method: "POST" });
          }}
          title="Strategist re-plans from what Radar measured — the 5↔6 loop"
        >
          ↻ regenerate from engagement
        </button>
      </div>

      {map && (
        <div className="card-dark rise p-5">
          <p className="text-[12.5px] text-white/60">
            gravity map — the conversation your icp is already having
          </p>
          <p className="mt-2.5 max-w-3xl text-[13.5px] leading-relaxed text-white/90">
            {map.summary}
          </p>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {map.themes.map((t, i) => (
              <span
                key={i}
                title={t.who.join(", ")}
                className="rounded-full px-3 py-1 text-[11.5px] text-white/85"
                style={{ boxShadow: "inset 0 0 0 1px rgba(255,255,255,.28)" }}
              >
                {t.theme} · {t.who.length}
              </span>
            ))}
          </div>
          <p className="mono mt-4 text-[11px] text-white/50">
            watering holes: {map.watering_holes.join(" · ")}
          </p>
        </div>
      )}

      {state.plan.length === 0 && (
        <div className="card p-10 text-center">
          <p className="label">strategist is still drafting…</p>
        </div>
      )}

      {DAYS.map((day) => {
        const items = state.plan.filter((p) => p.day === day);
        if (!items.length) return null;
        return (
          <div key={day}>
            <p className="mono label mb-2">{day.toLowerCase()}</p>
            <div className="space-y-2.5">
              {items.map((item, i) => (
                <div
                  key={item.id}
                  className={`card rise p-4.5 p-5 ${item.done ? "opacity-45" : ""}`}
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-baseline gap-3">
                      <span className="link-green text-[12.5px]">
                        → {TYPE_META[item.type]} · {item.channel}
                      </span>
                      <span className="text-[14px] font-semibold tracking-tight">
                        {item.title}
                      </span>
                      {item.variant && (
                        <span className="mono label" style={{ fontSize: 10.5 }}>
                          variant {item.variant}
                        </span>
                      )}
                      {item.type === "post" && (
                        <TempSwatch
                          t={postTemp(state, item.id)}
                          title="engagement this post earned"
                        />
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {item.draft && <CopyBtn text={item.draft} />}
                      {item.link && (
                        <a className="btn btn-ghost" href={item.link} target="_blank" rel="noreferrer">
                          open ↗
                        </a>
                      )}
                      <button className="btn" onClick={() => toggle(item.id, !item.done)}>
                        {item.done ? "undo" : "done ✓"}
                      </button>
                    </div>
                  </div>
                  {item.draft && <pre className="draft mt-3">{item.draft}</pre>}
                  <p className="mt-2.5 text-[12px] leading-relaxed text-[var(--muted)]">
                    <span className="font-medium text-[var(--ink)]">why · </span>
                    {item.why} <Evidence urls={item.evidence} />
                  </p>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
