// One seam for every model call. Spend-aware order:
//   1. direct Anthropic SDK when an API key exists (one HTTPS call —
//      cheap and fast; a managed-agent subprocess costs many turns)
//   2. managed crew agents (Agent SDK) — the no-API-key path, riding a
//      Claude subscription login
//   3. null → caller uses fixtures (mock never blocks)

import { generateText, hasClaude, MODEL_DEEP, MODEL_FAST } from "./claude";
import { CREW, managedText, type CrewName } from "./managed";

export async function think(
  agent: CrewName,
  task: string,
  opts?: { deep?: boolean }
): Promise<string | null> {
  if (process.env.GRAVITY_MOCK) return null;

  if (hasClaude()) {
    const direct = await generateText({
      system: CREW[agent].prompt,
      prompt: task,
      model: opts?.deep ? MODEL_DEEP : MODEL_FAST,
      maxTokens: opts?.deep ? 1500 : 400,
    });
    if (direct) return direct;
  }

  return managedText(agent, task);
}
