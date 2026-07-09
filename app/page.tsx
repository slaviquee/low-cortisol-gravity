"use client";

// START — paste your website, watch Scout read it, build gravity.

import { useRouter } from "next/navigation";
import { useState } from "react";
import { FIXTURE_TARGETS, FIXTURE_WEBSITE } from "@/data/fixtures";

function OrbitMark() {
  return (
    <div className="relative mx-auto h-44 w-44">
      {[
        { size: 176, cls: "orbit-slow", dot: "var(--dim)" },
        { size: 124, cls: "orbit-mid", dot: "var(--cyan)" },
        { size: 72, cls: "orbit-fast", dot: "var(--amber)" },
      ].map((o, i) => (
        <div
          key={i}
          className={`absolute rounded-full border border-[var(--line-bright)] ${o.cls}`}
          style={{
            width: o.size,
            height: o.size,
            left: `calc(50% - ${o.size / 2}px)`,
            top: `calc(50% - ${o.size / 2}px)`,
          }}
        >
          <span
            className="absolute h-2 w-2 rounded-full"
            style={{ background: o.dot, top: -4, left: "50%" }}
          />
        </div>
      ))}
      <span
        className="absolute h-3 w-3 rounded-full"
        style={{
          background: "var(--green)",
          left: "calc(50% - 6px)",
          top: "calc(50% - 6px)",
          boxShadow: "0 0 18px 2px rgba(61,220,151,.45)",
        }}
      />
    </div>
  );
}

export default function Start() {
  const router = useRouter();
  const [website, setWebsite] = useState("");
  const [targets, setTargets] = useState("");
  const [summary, setSummary] = useState("");
  const [scouting, setScouting] = useState(false);
  const [launching, setLaunching] = useState(false);

  async function scout() {
    setScouting(true);
    try {
      const res = await fetch("/api/scout", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ website: website || FIXTURE_WEBSITE }),
      });
      const data = await res.json();
      setSummary(data.summary);
    } finally {
      setScouting(false);
    }
  }

  async function build() {
    setLaunching(true);
    await fetch("/api/run", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        website: website || FIXTURE_WEBSITE,
        targets: targets
          .split(/[\n,]/)
          .map((t) => t.trim())
          .filter(Boolean),
      }),
    });
    router.push("/board");
  }

  return (
    <div className="rise mx-auto max-w-xl pt-6">
      <OrbitMark />
      <h1 className="font-display mt-8 text-center text-4xl leading-tight">
        Your buyers discover <em>you</em>
        <br />
        before you discover them.
      </h1>
      <p className="label mt-3 text-center">
        attention → familiarity → trust → conversation → pipeline
      </p>

      <div className="panel mt-10 space-y-4 p-5">
        <div>
          <label className="label">your website</label>
          <input
            className="input mt-1.5"
            placeholder={FIXTURE_WEBSITE}
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
            onBlur={() => website && scout()}
          />
        </div>
        <div>
          <label className="label">target accounts · optional</label>
          <textarea
            className="input mt-1.5 h-20 resize-none"
            placeholder={FIXTURE_TARGETS.join(", ")}
            value={targets}
            onChange={(e) => setTargets(e.target.value)}
          />
        </div>

        {(summary || scouting) && (
          <div className="rise border-l-2 border-[var(--cyan)] pl-3">
            <p className="label" style={{ color: "var(--cyan)" }}>
              scout
            </p>
            <p className="mt-1 text-[13px] leading-relaxed text-[#c6d3d8]">
              {scouting ? "reading the site…" : `"${summary}"`}
            </p>
          </div>
        )}

        <button
          className="btn btn-primary w-full justify-center py-3 text-sm"
          onClick={build}
          disabled={launching}
        >
          {launching ? "launching the crew…" : "⚡ build gravity"}
        </button>
        <p className="label text-center normal-case tracking-normal">
          no keys? runs on the cached demo world — nothing here waits on a
          third party
        </p>
      </div>
    </div>
  );
}
