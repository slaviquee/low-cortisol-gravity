// Sillage — intent signals + named people, wired the way THEIR docs say.
//
// Two documented integration paths (getsillage.com/docs):
//  1. MCP (docs/mcp/install): https://api.getsillage.com/api/mcp/v2 —
//     Streamable HTTP + OAuth 2.1 browser login. Interactive clients only;
//     "the SDK doesn't handle OAuth flows automatically" (Agent SDK docs),
//     and Sillage documents no static-token header. So the managed crew can
//     use it inside Claude Code at the venue (`claude mcp add --transport
//     http sillage <url>`), gated here behind SILLAGE_MCP=1.
//  2. REST (docs/api) — the documented headless path, sk_live_ bearer key.
//     Real endpoint paths below, verbatim from the docs. Their skills pack
//     (`npx skills add sillage-labs/skills`) calls this pairing out for
//     non-MCP environments (the `sillage-api` skill).
//
// Signals/agents/watchlists REST paths are NOT on the public docs page —
// they live in the MCP tools and the OpenAPI spec
// (https://api.getsillage.com/api/v1/docs). We keep signals graceful-null
// until confirmed against that spec.

import { fixtureProspects } from "@/data/fixtures";
import { Signal } from "@/lib/types";
import { FoundPerson } from "./fullenrich";

const BASE = "https://api.getsillage.com";

export const SILLAGE_MCP_URL = "https://api.getsillage.com/api/mcp/v2";

function headers() {
  return {
    "content-type": "application/json",
    authorization: `Bearer ${process.env.SILLAGE_API_KEY}`,
  };
}

// PUT /api/v2/persona — "Set or replace your ideal customer profile"
// POST /api/v2/top-account-list/accounts — "additive" account list add
export async function pushPersonaAndAccounts(
  persona: string,
  accounts: string[]
): Promise<boolean> {
  const key = process.env.SILLAGE_API_KEY;
  if (!key || accounts.length === 0) return false;
  try {
    await fetch(`${BASE}/api/v2/persona`, {
      method: "PUT",
      headers: headers(),
      body: JSON.stringify({ description: persona }),
      signal: AbortSignal.timeout(20_000),
    });
    const res = await fetch(`${BASE}/api/v2/top-account-list/accounts`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({ accounts: accounts.slice(0, 20) }),
      signal: AbortSignal.timeout(20_000),
    });
    return res.ok;
  } catch (err) {
    console.error("[sillage:setup]", err);
    return false;
  }
}

// Decision makers via company mappings:
//   POST /api/v2/enrich-company-mapping  (kick off / refresh a mapping)
//   GET  /api/v2/company-mappings        (paginated list)
//   GET  /api/v2/company-mappings/{id}   (mapping incl. people profiles)
export async function getCompanyMapping(
  account: string
): Promise<FoundPerson[] | null> {
  const key = process.env.SILLAGE_API_KEY;
  if (!key) return null;
  try {
    // fire-and-forget kick; mapping may be async server-side
    fetch(`${BASE}/api/v2/enrich-company-mapping`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({ domain: account }),
      signal: AbortSignal.timeout(15_000),
    }).catch(() => {});

    const list = await fetch(
      `${BASE}/api/v2/company-mappings?page=1&page_size=50`,
      { headers: headers(), signal: AbortSignal.timeout(20_000) }
    );
    if (!list.ok) throw new Error(`${list.status}`);
    const data = await list.json();
    const mappings = data.company_mappings ?? data.mappings ?? data.results ?? data.items ?? [];
    const wanted = account.toLowerCase().replace(/^www\./, "");
    const match = mappings.find((m: Record<string, unknown>) => {
      const hay = JSON.stringify(m).toLowerCase();
      return hay.includes(wanted);
    });
    if (!match) return null;

    let people = (match.people ?? match.profiles ?? []) as Record<string, string>[];
    const id = (match.id ?? match.mapping_id) as string | undefined;
    if (!people.length && id) {
      const one = await fetch(`${BASE}/api/v2/company-mappings/${id}`, {
        headers: headers(),
        signal: AbortSignal.timeout(20_000),
      });
      if (one.ok) {
        const detail = await one.json();
        people = detail.people ?? detail.profiles ?? detail.mapping?.people ?? [];
      }
    }
    return people
      .map((p) => ({
        name: p.full_name ?? p.name ?? "",
        title: p.title ?? p.job_title ?? "",
        company: p.company ?? p.company_name ?? account,
        linkedin_url: p.linkedin_url ?? p.linkedin ?? "",
      }))
      .filter((p) => p.name && p.company)
      .slice(0, 3); // demo cap — 3 decision makers per account is plenty
  } catch (err) {
    console.error("[sillage:mapping]", err);
    return null;
  }
}

// Signals: REST paths not publicly documented — MCP tools
// (sillage_v2_list_signals) or the OpenAPI spec are the sources. Until
// confirmed against https://api.getsillage.com/api/v1/docs we return null
// and the pipeline falls back to fixture signals. No guessed endpoints.
export async function signalsForTargets(
  _targets: string[]
): Promise<Record<string, Signal[]> | null> {
  return null;
}

export function fixtureSignals(): Record<string, Signal[]> {
  const out: Record<string, Signal[]> = {};
  for (const p of fixtureProspects()) out[p.id] = p.signals;
  return out;
}
