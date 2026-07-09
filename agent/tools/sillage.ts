// Sillage — intent signals + named people, wired per their docs AND
// verified live against the workspace (sk_live_ key valid; setup complete).
//
// Sources: the installed skills pack (.claude/skills/sillage-api — full
// REST reference incl. signals) + getsillage.com/docs. Base /api/v2 only.
// Envelopes: single = {data:{...}}; lists = {data:[...], meta}; signals
// use cursor pagination and 404 on an empty feed (guard is load-bearing).
// MCP (OAuth 2.1, interactive) attaches to managed agents via SILLAGE_MCP=1.

import { fixtureProspects } from "@/data/fixtures";
import { Signal } from "@/lib/types";
import { FoundPerson } from "./fullenrich";

const BASE = "https://api.getsillage.com/api/v2";

export const SILLAGE_MCP_URL = "https://api.getsillage.com/api/mcp/v2";

function headers() {
  return {
    "content-type": "application/json",
    authorization: `Bearer ${process.env.SILLAGE_API_KEY}`,
  };
}

// PUT /persona is replace-whole → GET, merge, PUT (free text belongs in
// additional_info). Accounts POST takes [{domain}] objects and is 202-async.
export async function pushPersonaAndAccounts(
  persona: string,
  accounts: string[]
): Promise<boolean> {
  const key = process.env.SILLAGE_API_KEY;
  if (!key || accounts.length === 0) return false;
  try {
    const cur = await (
      await fetch(`${BASE}/persona`, {
        headers: headers(),
        signal: AbortSignal.timeout(15_000),
      })
    ).json();
    await fetch(`${BASE}/persona`, {
      method: "PUT",
      headers: headers(),
      body: JSON.stringify({ ...(cur.data ?? {}), additional_info: persona }),
      signal: AbortSignal.timeout(15_000),
    });
    const res = await fetch(`${BASE}/top-account-list/accounts`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({
        accounts: accounts.slice(0, 20).map((domain) => ({ domain })),
      }),
      signal: AbortSignal.timeout(20_000),
    });
    return res.ok; // 202 — ingestion continues server-side
  } catch (err) {
    console.error("[sillage:setup]", err);
    return false;
  }
}

// Decision makers: kick POST /enrich-company-mapping (202, async server-
// side), then read the mappings list (rows carry NO profiles) and fetch
// the matching mapping's detail for its profiles[].
export async function getCompanyMapping(
  account: string
): Promise<FoundPerson[] | null> {
  const key = process.env.SILLAGE_API_KEY;
  if (!key) return null;
  try {
    fetch(`${BASE}/enrich-company-mapping`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({ domain: account }),
      signal: AbortSignal.timeout(15_000),
    }).catch(() => {}); // 403 = feature off; mapping readable next run

    const list = await fetch(`${BASE}/company-mappings?page=1&page_size=50`, {
      headers: headers(),
      signal: AbortSignal.timeout(20_000),
    });
    if (!list.ok) throw new Error(`${list.status}`);
    const listBody = await list.json();
    const wanted = account.toLowerCase().replace(/^www\./, "");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const match = (listBody.data ?? []).find((m: any) =>
      JSON.stringify(m).toLowerCase().includes(wanted)
    );
    if (!match?.id) return null;

    const detail = await (
      await fetch(`${BASE}/company-mappings/${match.id}`, {
        headers: headers(),
        signal: AbortSignal.timeout(20_000),
      })
    ).json();
    const profiles = detail.data?.profiles ?? detail.profiles ?? [];
    return (
      profiles
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((p: any) => ({
          name: p.name ?? "",
          title: p.position ?? "",
          company: account,
          linkedin_url: p.linkedin_url ?? "",
        }))
        .filter((p: FoundPerson) => p.name)
        .slice(0, 3) // demo cap
    );
  } catch (err) {
    console.error("[sillage:mapping]", err);
    return null;
  }
}

// Signals (documented in the skills pack; verified live):
//   POST /workspace/signal-runs {agent_id}  → launch (fire-and-forget here:
//     runs take minutes; results land for the NEXT pipeline pass)
//   GET  /workspace/signals?company_domain=a.com,b.com&limit=100 (cursor)
//   404 on empty feed / unresolved domains — that guard is load-bearing.
export async function signalsForTargets(
  targets: string[]
): Promise<Record<string, Signal[]> | null> {
  const key = process.env.SILLAGE_API_KEY;
  if (!key || targets.length === 0) return null;
  try {
    // launch runs for enabled agents — don't block the pipeline on them
    fetch(`${BASE}/agents?page_size=25`, {
      headers: headers(),
      signal: AbortSignal.timeout(15_000),
    })
      .then(async (r) => {
        if (!r.ok) return;
        const body = await r.json();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        for (const a of (body.data ?? []).filter((a: any) => a.enabled)) {
          fetch(`${BASE}/workspace/signal-runs`, {
            method: "POST",
            headers: headers(),
            body: JSON.stringify({ agent_id: a.id }),
            signal: AbortSignal.timeout(15_000),
          }).catch(() => {});
        }
      })
      .catch(() => {});

    // read whatever signals already exist for these domains
    const out: Record<string, Signal[]> = {};
    let cursor = "";
    do {
      const q = `company_domain=${encodeURIComponent(targets.slice(0, 100).join(","))}&limit=100${cursor ? `&cursor=${cursor}` : ""}`;
      const res = await fetch(`${BASE}/workspace/signals?${q}`, {
        headers: headers(),
        signal: AbortSignal.timeout(20_000),
      });
      if (res.status === 404) return Object.keys(out).length ? out : null;
      if (!res.ok) throw new Error(`${res.status}`);
      const page = await res.json();
      for (const s of page.data ?? []) {
        const t = String(s.signal_type ?? s.type ?? "");
        const type: Signal["type"] =
          t.includes("job_update") || t.includes("job_change")
            ? "job_change"
            : t.includes("job_posting") || t.includes("hiring")
              ? "hiring"
              : t.includes("competitor")
                ? "competitor"
                : t.includes("champion") || t.includes("influencer")
                  ? "champion"
                  : "keyword";
        const domain = String(
          s.company?.domain ?? s.company_domain ?? ""
        ).toLowerCase();
        (out[domain] ??= []).push({
          type,
          detail:
            s.summary ?? s.title ?? JSON.stringify(s.data ?? {}).slice(0, 200),
          source: "sillage",
        });
      }
      cursor = page.meta?.next_cursor ?? "";
      if (!page.meta?.has_more) break;
    } while (cursor);
    return Object.keys(out).length ? out : null;
  } catch (err) {
    console.error("[sillage:signals]", err);
    return null;
  }
}

export function fixtureSignals(): Record<string, Signal[]> {
  const out: Record<string, Signal[]> = {};
  for (const p of fixtureProspects()) out[p.id] = p.signals;
  return out;
}
