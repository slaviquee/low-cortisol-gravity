// read_website — Scout's input. Always real (plain fetch), fixture fallback.

import { FIXTURE_SUMMARY } from "@/data/fixtures";
import { generateText } from "../claude";
import { SCOUT_SYSTEM } from "../prompts";

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

  const distilled = await generateText({
    system: SCOUT_SYSTEM,
    prompt: `Website ${normalized} content:\n\n${text}\n\nReturn ONLY the one-sentence product narrative ("X sells Y to Z"), nothing else.`,
    maxTokens: 200,
  });
  return distilled?.trim() || FIXTURE_SUMMARY;
}
