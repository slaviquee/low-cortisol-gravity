// read_website — Scout's input. Always real (plain fetch), fixture fallback.

import { FIXTURE_SUMMARY } from "@/data/fixtures";
import { think } from "../brain";

export async function distillWebsite(url: string): Promise<string> {
  const normalized = url.startsWith("http") ? url : `https://${url}`;
  let text = "";
  try {
    const res = await fetch(normalized, {
      headers: { "user-agent": "GravityScout/0.1 (+hackathon demo)" },
      signal: AbortSignal.timeout(4000),
    });
    const html = await res.text();
    text = html
      .replace(/<script[\s\S]*?<\/script>/gi, " ")
      .replace(/<style[\s\S]*?<\/style>/gi, " ")
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .slice(0, 12000);
  } catch {
    // offline / bad URL → fixture summary keeps the demo moving
    return FIXTURE_SUMMARY;
  }

  const distilled = await think(
    "scout",
    `Website ${normalized} content:\n\n${text}\n\nReturn ONLY the one-sentence product narrative ("X sells Y to Z"), nothing else.`
  );
  return distilled?.trim() || FIXTURE_SUMMARY;
}
