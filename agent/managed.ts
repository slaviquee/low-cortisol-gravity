// The crew as Claude MANAGED AGENTS via the Agent SDK (options.agents).
// The SDK bundles the Claude Code runtime: it authenticates with
// ANTHROPIC_API_KEY *or* a Claude subscription login (stored OAuth /
// CLAUDE_CODE_OAUTH_TOKEN from `claude setup-token`) — so the demo can run
// on the team's subscription with zero API key. Node runtime only (spawns a
// subprocess); API routes set maxDuration accordingly.

import { existsSync } from "fs";
import { homedir } from "os";
import path from "path";
import {
  query,
  type AgentDefinition,
} from "@anthropic-ai/claude-agent-sdk";
import {
  GRAVITY_MAP_SYSTEM,
  ICP_CHECK_SYSTEM,
  OUTREACH_SYSTEM,
  PLAN_SYSTEM,
  SCOUT_SYSTEM,
  WORLD_MODEL_SYSTEM,
} from "./prompts";

export const CREW: Record<string, AgentDefinition> = {
  scout: {
    description:
      "Reads a company website and distills the product narrative + ICP hypothesis. Use for any website-analysis task.",
    prompt: SCOUT_SYSTEM,
    tools: ["WebFetch"],
    model: "sonnet",
  },
  listener: {
    description:
      "Builds a Buyer World Model from a prospect's scraped public social footprint (posts, comments, reactions, follows). Use whenever raw social data needs modeling.",
    prompt: WORLD_MODEL_SYSTEM,
    tools: [],
    model: "sonnet",
  },
  strategist: {
    description:
      "Synthesizes the Gravity Map across world models and drafts the weekly gravity plan (posts, comments, micro-actions on the familiarity ladder).",
    prompt: `${GRAVITY_MAP_SYSTEM}\n\n${PLAN_SYSTEM}`,
    tools: [],
    model: "opus",
  },
  radar: {
    description:
      "Drafts warm outreach that cites a prospect's actual engagement, and runs ICP-fit checks on unknown engagers.",
    prompt: `${OUTREACH_SYSTEM}\n\n${ICP_CHECK_SYSTEM}`,
    tools: [],
    model: "opus",
  },
};

export type CrewName = keyof typeof CREW;

// Cheap pre-flight: is any auth plausibly available? Avoids paying a doomed
// subprocess spawn on keyless demo machines. Failures are cached after one try.
function authLikely(): boolean {
  if (process.env.GRAVITY_MOCK) return false;
  if (
    process.env.ANTHROPIC_API_KEY ||
    process.env.ANTHROPIC_AUTH_TOKEN ||
    process.env.CLAUDE_CODE_OAUTH_TOKEN
  )
    return true;
  try {
    const home = homedir();
    return (
      existsSync(path.join(home, ".claude", ".credentials.json")) ||
      existsSync(path.join(home, ".claude.json")) // Claude Code login marker (keychain-backed on macOS)
    );
  } catch {
    return false;
  }
}

let broken = false;

export function managedAvailable(): boolean {
  return !broken && authLikely();
}

// Auth failures can surface as a "success" result whose TEXT is the error
// (observed with stale subscription credentials) — never hand that to callers.
function looksLikeAuthError(text: string): boolean {
  return /failed to authenticate|api error: 401|invalid authentication/i.test(
    text
  );
}

// Delegate one task to a named managed agent, return its final text.
export async function managedText(
  agentName: CrewName,
  task: string
): Promise<string | null> {
  if (!managedAvailable()) return null;
  try {
    let result: string | null = null;
    for await (const message of query({
      prompt: `Use the ${agentName} agent for this task and return its output verbatim as your final answer.\n\n${task}`,
      options: {
        agents: CREW,
        allowedTools: ["Agent", "WebFetch"],
        settingSources: [], // headless: ignore ~/.claude and .claude/* settings
        permissionMode: "dontAsk",
        maxTurns: 12,
        cwd: process.cwd(),
      },
    })) {
      if (message.type === "result") {
        result = message.subtype === "success" ? message.result : null;
      }
    }
    if (result && looksLikeAuthError(result)) {
      broken = true;
      return null;
    }
    return result;
  } catch (err) {
    console.error("[managed] crew unavailable, falling back:", err);
    broken = true;
    return null;
  }
}

// Same, but with schema-validated structured output.
export async function managedJSON<T>(
  agentName: CrewName,
  task: string,
  schema: Record<string, unknown>
): Promise<T | null> {
  if (!managedAvailable()) return null;
  try {
    let structured: T | null = null;
    for await (const message of query({
      prompt: `Use the ${agentName} agent for this task.\n\n${task}`,
      options: {
        agents: CREW,
        allowedTools: ["Agent", "WebFetch"],
        settingSources: [],
        permissionMode: "dontAsk",
        maxTurns: 12,
        cwd: process.cwd(),
        outputFormat: { type: "json_schema", schema },
      },
    })) {
      if (message.type === "result" && message.subtype === "success") {
        structured =
          ((message as { structured_output?: T }).structured_output ?? null);
      }
    }
    return structured;
  } catch (err) {
    console.error("[managed] crew unavailable, falling back:", err);
    broken = true;
    return null;
  }
}
