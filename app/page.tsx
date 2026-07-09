"use client";

// START — paste your website, watch Scout read it, build gravity.

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Dial } from "@/components/ui";
import { FIXTURE_TARGETS, FIXTURE_WEBSITE } from "@/data/fixtures";

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
    <div className="rise mx-auto max-w-xl pt-8">
      <Dial value={0.5} label="buyer familiarity" display="waiting for input" live />

      <h1 className="mt-8 text-center text-[38px] font-semibold leading-[1.12] tracking-tight">
        Your buyers discover you
        <br />
        before you discover them.
      </h1>
      <p className="mono label mt-4 text-center">
        attention → familiarity → trust → conversation → pipeline
      </p>

      <div className="card mt-10 space-y-4 p-5">
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
          <div className="rise card-paper p-3.5">
            <p className="link-green text-[12px]">→ scout</p>
            <p className="mt-1 text-[13.5px] leading-relaxed">
              {scouting ? "reading the site…" : `"${summary}"`}
            </p>
          </div>
        )}

        <button
          className="btn w-full justify-center py-3 text-[13.5px]"
          onClick={build}
          disabled={launching}
        >
          {launching ? "launching the crew…" : "→ build gravity"}
        </button>
        <p className="label text-center" style={{ fontSize: 11.5 }}>
          no keys? runs on the cached demo world — nothing here waits on a
          third party
        </p>
      </div>
    </div>
  );
}
