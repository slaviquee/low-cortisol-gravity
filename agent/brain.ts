// One seam for every model call, tried in order:
//   1. managed crew agents (Agent SDK — API key OR Claude subscription login)
//   2. direct Anthropic SDK (API key)
//   3. null → caller uses fixtures (mock never blocks)

import { generateText, hasClaude, MODEL_DEEP, MODEL_FAST } from "./claude";
import { CREW, managedText, type CrewName } from "./managed";

export async function think(
  agent: CrewName,
  task: string,
  opts?: { deep?: boolean }
): Promise<string | null> {
  const viaManaged = await managedText(agent, task);
  if (viaManaged) return viaManaged;

  if (!hasClaude() || process.env.GRAVITY_MOCK) return null;
  return generateText({
    system: CREW[agent].prompt,
    prompt: task,
    model: opts?.deep ? MODEL_DEEP : MODEL_FAST,
    maxTokens: opts?.deep ? 1500 : 400,
  });
}
