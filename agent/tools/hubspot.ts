// HubSpot (sponsor) — the CRM as input. Scout mines the existing pipe:
// open deals to accelerate, closed-lost to re-warm, closed-won to clone
// as lookalikes. Private-app token; null without it (mock uses fixtures).

const BASE = "https://api.hubapi.com";

export interface CrmPipe {
  open: string[];
  closed_lost: string[];
  won: string[];
}

export async function fetchPipe(): Promise<CrmPipe | null> {
  const token = process.env.HUBSPOT_TOKEN;
  if (!token) return null;
  try {
    const res = await fetch(
      `${BASE}/crm/v3/objects/deals?limit=100&properties=dealname,dealstage&associations=companies`,
      {
        headers: { authorization: `Bearer ${token}` },
        signal: AbortSignal.timeout(15_000),
      }
    );
    if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
    const data = await res.json();
    const pipe: CrmPipe = { open: [], closed_lost: [], won: [] };
    for (const d of data.results ?? []) {
      const stage = String(d.properties?.dealstage ?? "").toLowerCase();
      const name = d.properties?.dealname ?? "";
      if (!name) continue;
      if (stage.includes("closedlost")) pipe.closed_lost.push(name);
      else if (stage.includes("closedwon")) pipe.won.push(name);
      else pipe.open.push(name);
    }
    return pipe;
  } catch (err) {
    console.error("[hubspot]", err);
    return null;
  }
}
