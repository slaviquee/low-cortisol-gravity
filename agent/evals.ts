// EVALS — the quality gate in the create→measure loop. Every draft is
// scored against the rubric before it ships: their format, our voice,
// evidence-backed, zero slop. Fails get revised and re-scored (the loop).
// Real mode: a Claude judge; mock: deterministic heuristics — same rubric.

import { CompanyBrain } from "@/lib/brain";
import { PlanItem } from "@/lib/types";

export interface EvalResult {
  score: number; // 0–100, ship at ≥80
  notes: string[];
}

const SLOP: [RegExp, string][] = [
  [/game-?chang(er|ing)/i, "slop: 'game-changer'"],
  [/revolutioniz\w+/i, "slop: 'revolutionize'"],
  [/\bleverag\w+/i, "slop: 'leverage'"],
  [/\bunlock(s|ing|ed)?\b/i, "slop: 'unlock'"],
  [/\bseamless\w*/i, "slop: 'seamless'"],
  [/\bsupercharg\w+/i, "slop: 'supercharge'"],
  [/\belevate your\b/i, "slop: 'elevate your'"],
  [/excited to (share|announce)/i, "slop: 'excited to share'"],
  [/hope this (email )?finds you/i, "slop: 'hope this finds you'"],
  [/let'?s dive in/i, "slop: 'let's dive in'"],
  [/it'?s not just [^.]+, it'?s/i, "slop: 'not just X, it's Y'"],
  [/in today's (fast|digital|competitive|world|landscape)/i, "slop: 'in today's…' opener"],
  [/delve/i, "slop: 'delve'"],
  [/🚀|✨|💯|🔥/u, "slop: hype emoji"],
];

export function evalDraft(item: PlanItem, brain: CompanyBrain): EvalResult {
  const notes: string[] = [];
  let score = 100;
  const d = item.draft ?? "";
  if (!d) return { score: 100, notes: ["no draft — action item"] };

  for (const [re, note] of SLOP) {
    if (re.test(d)) {
      score -= 30;
      notes.push(note);
    }
  }
  if (item.type === "post" && !/\d/.test(d)) {
    score -= 20;
    notes.push("no numbers — our voice is numbers-first");
  }
  if (d.length > 900) {
    score -= 10;
    notes.push("too long for the feed");
  }
  if (!item.evidence?.length) {
    score -= 15;
    notes.push("no evidence behind the 'why'");
  }
  if (
    brain.company.tone_of_voice.some((t) => /no emoji/i.test(t)) &&
    /\p{Extended_Pictographic}/u.test(d)
  ) {
    score -= 15;
    notes.push("emoji — off our tone profile");
  }
  if (notes.length === 0)
    notes.push("their format ✓", "our voice ✓", "evidence-backed ✓");
  return { score: Math.max(0, score), notes };
}

// One bounded revision attempt — strip what the eval flagged.
// Real mode: think('strategist', …) rewrites properly; this is the
// deterministic fallback so the loop always closes.
export function mechanicalRevise(draft: string): string {
  return draft
    .replace(/\bthe game-?changing\b/gi, "the")
    .replace(/\bgame-?changing\b/gi, "")
    .replace(/\ba game-?changer\b/gi, "a real shift")
    .replace(/revolutioniz(e|es|ing)/gi, (_m, g: string) =>
      g.toLowerCase() === "ing" ? "reworking" : g.toLowerCase() === "es" ? "reworks" : "rework"
    )
    .replace(/[🚀✨💯]/gu, "")
    .replace(/ {2,}/g, " ")
    .trim();
}

export const SHIP_THRESHOLD = 80;
