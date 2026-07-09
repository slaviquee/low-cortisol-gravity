// Sillage — intent signals + named people. Primary integration is their MCP
// (OAuth, connected from Claude Code / any MCP client at the venue):
//   claude mcp add --transport http sillage https://api.getsillage.com/api/mcp/v2
// This wrapper is the sk_live_ REST fallback for the app runtime; without a
// key it returns fixture signals so the pipeline never blocks.

import { fixtureProspects } from "@/data/fixtures";
import { Signal } from "@/lib/types";

const BASE = "https://api.getsillage.com/api/v2";

export async function signalsForTargets(
  targets: string[]
): Promise<Record<string, Signal[]> | null> {
  const key = process.env.SILLAGE_API_KEY;
  if (!key) return null;
  try {
    // Shape confirmed against their public docs at the venue; the MCP tool
    // names are stable: upsert_persona, add_top_accounts, launch_signal_run,
    // list_signals, get_company_mapping.
    const res = await fetch(`${BASE}/signals?accounts=${targets.join(",")}`, {
      headers: { authorization: `Bearer ${key}` },
      signal: AbortSignal.timeout(20_000),
    });
    if (!res.ok) throw new Error(`${res.status}`);
    return (await res.json()) as Record<string, Signal[]>;
  } catch (err) {
    console.error("[sillage]", err);
    return null;
  }
}

export function fixtureSignals(): Record<string, Signal[]> {
  const out: Record<string, Signal[]> = {};
  for (const p of fixtureProspects()) out[p.id] = p.signals;
  return out;
}
