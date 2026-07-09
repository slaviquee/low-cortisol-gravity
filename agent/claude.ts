// Thin Claude helper. Real calls when ANTHROPIC_API_KEY is set; callers
// fall back to fixtures otherwise (mock mode — the demo never blocks).

import Anthropic from "@anthropic-ai/sdk";

export const MODEL_FAST = "claude-sonnet-5"; // parallel prospect modelers
export const MODEL_DEEP = "claude-opus-4-8"; // gravity-map synthesis + content

let client: Anthropic | null = null;

export function claude(): Anthropic | null {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  if (!client) client = new Anthropic();
  return client;
}

export function hasClaude(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

// Force-JSON generation via a single required tool call — validated shape,
// no fence-stripping. Returns null in mock mode or on failure.
export async function generateJSON<T>(opts: {
  model?: string;
  system: string;
  prompt: string;
  schema: Record<string, unknown>; // JSON Schema for the output object
  maxTokens?: number;
}): Promise<T | null> {
  const c = claude();
  if (!c) return null;
  try {
    const res = await c.messages.create({
      model: opts.model ?? MODEL_FAST,
      max_tokens: opts.maxTokens ?? 4096,
      system: opts.system,
      messages: [{ role: "user", content: opts.prompt }],
      tools: [
        {
          name: "emit",
          description: "Emit the structured result.",
          input_schema: opts.schema as Anthropic.Tool["input_schema"],
        },
      ],
      tool_choice: { type: "tool", name: "emit" },
    });
    const tool = res.content.find((b) => b.type === "tool_use");
    return tool && tool.type === "tool_use" ? (tool.input as T) : null;
  } catch (err) {
    console.error("[claude] generateJSON failed:", err);
    return null;
  }
}

export async function generateText(opts: {
  model?: string;
  system: string;
  prompt: string;
  maxTokens?: number;
}): Promise<string | null> {
  const c = claude();
  if (!c) return null;
  try {
    const res = await c.messages.create({
      model: opts.model ?? MODEL_DEEP,
      max_tokens: opts.maxTokens ?? 2048,
      system: opts.system,
      messages: [{ role: "user", content: opts.prompt }],
    });
    const block = res.content.find((b) => b.type === "text");
    return block && block.type === "text" ? block.text : null;
  } catch (err) {
    console.error("[claude] generateText failed:", err);
    return null;
  }
}
