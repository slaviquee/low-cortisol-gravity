"use client";

// GRAVITY PLAN — the week, sequenced up the familiarity ladder.

import { CopyBtn, Evidence, usePolledState } from "@/components/ui";
import { PlanActionType } from "@/lib/types";

const TYPE_STYLE: Record<PlanActionType, { color: string; icon: string }> = {
  post: { color: "var(--amber)", icon: "▣" },
  comment: { color: "var(--cyan)", icon: "💬" },
  follow: { color: "var(--muted)", icon: "＋" },
  react: { color: "var(--muted)", icon: "▲" },
  connect: { color: "var(--green)", icon: "⊕" },
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
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-3xl">Gravity plan</h1>
        <p className="label mt-1">
          react → comment → follow → connect → outreach · the familiarity
          ladder
        </p>
      </div>

      {map && (
        <div className="panel rise p-4">
          <p className="label mb-2" style={{ color: "var(--violet)" }}>
            gravity map — the conversation your icp is already having
          </p>
          <p className="text-[13px] leading-relaxed text-[#c6d3d8]">
            {map.summary}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {map.themes.map((t, i) => (
              <span key={i} className="chip" title={t.who.join(", ")}>
                {t.theme} · {t.who.length}
              </span>
            ))}
          </div>
          <p className="label mt-3 normal-case tracking-normal">
            watering holes: {map.watering_holes.join(" · ")}
          </p>
        </div>
      )}

      {state.plan.length === 0 && (
        <div className="panel p-8 text-center">
          <p className="label">strategist is still drafting…</p>
        </div>
      )}

      {DAYS.map((day) => {
        const items = state.plan.filter((p) => p.day === day);
        if (!items.length) return null;
        return (
          <div key={day}>
            <p className="label mb-2">{day}</p>
            <div className="space-y-2">
              {items.map((item, i) => {
                const t = TYPE_STYLE[item.type];
                return (
                  <div
                    key={item.id}
                    className={`panel rise p-4 ${item.done ? "opacity-45" : ""}`}
                    style={{ animationDelay: `${i * 70}ms` }}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span
                          className="chip"
                          style={{ borderColor: t.color, color: t.color }}
                        >
                          {t.icon} {item.type} · {item.channel}
                        </span>
                        <span className="text-[13px] font-semibold">
                          {item.title}
                        </span>
                        {item.variant && (
                          <span className="label">variant {item.variant}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {item.draft && <CopyBtn text={item.draft} />}
                        {item.link && (
                          <a
                            className="btn"
                            href={item.link}
                            target="_blank"
                            rel="noreferrer"
                          >
                            open ↗
                          </a>
                        )}
                        <button
                          className="btn"
                          onClick={() => toggle(item.id, !item.done)}
                        >
                          {item.done ? "undo" : "done ✓"}
                        </button>
                      </div>
                    </div>
                    {item.draft && <pre className="draft mt-3">{item.draft}</pre>}
                    <p className="mt-2.5 text-xs leading-relaxed">
                      <span style={{ color: "var(--amber)" }}>why · </span>
                      <span className="text-[var(--muted)]">{item.why} </span>
                      <Evidence urls={item.evidence} />
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
