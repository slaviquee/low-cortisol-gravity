// Demo seed worlds — committed, deterministic AppState snapshots that
// populate the site switcher on prod so the demo always has rich worlds to
// flip through (3 real-data companies + 3 fully-mocked). A compact spec is
// expanded into a fully-typed AppState by buildWorld(); lib/sites.ts
// materializes these into the runtime sites dir on first boot.

import {
  AppState,
  BuyerWorldModel,
  Cohort,
  emptyCrew,
  GravityMap,
  LogLine,
  MediaTaste,
  PlanItem,
  ProspectState,
  Signal,
  SignalType,
  WarmCard,
} from "@/lib/types";
import { CompanyBrain } from "@/lib/brain";

function slug(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

interface ProspectSpec {
  name: string;
  title: string;
  company: string;
  linkedin?: string;
  x?: string;
  heat: number;
  state?: ProspectState;
  behavior?: "poster" | "commenter" | "lurker";
  score?: number;
  emails?: string[];
  phones?: string[];
  signals?: { type: SignalType; detail: string }[];
  topics?: { topic: string; stance: string; evidence?: string[] }[];
  formats?: string[];
  media?: MediaTaste[];
  influencers?: { name: string; why: string; evidence?: string[] }[];
  cohort?: string;
}

interface CohortSpec {
  name: string;
  taste: string;
  format: string;
  members: string[]; // prospect names
  engagements?: number;
  warm?: number;
}

interface PlanSpec {
  day: "Mon" | "Tue" | "Wed" | "Thu" | "Fri";
  type: PlanItem["type"];
  channel: "linkedin" | "x";
  title: string;
  draft: string;
  why: string;
  evidence?: string[];
  cohort?: string;
  media?: string;
  link?: string;
  variant?: "A" | "B";
  eval?: number;
  done?: boolean;
}

interface WarmSpec {
  name: string;
  title: string;
  quote?: string; // present => comment; absent => reaction
  serendipity?: boolean;
  email?: string;
  phone?: string;
  email_draft: string;
  connect_note: string;
  pitch_brief?: string;
  call_script?: string;
  sent?: boolean;
  meeting?: boolean;
}

export interface CompanySpec {
  website: string;
  product_summary: string;
  icp?: string; // one-line ICP for the brain (falls back to a generic)
  tone?: string[]; // tone-of-voice profile (real from own posts where known)
  targets: string[];
  own_post_urls?: string[];
  mock: boolean; // true = fully fictional world
  prospects: ProspectSpec[];
  cohorts: CohortSpec[];
  gravity_map: GravityMap;
  plan: PlanSpec[];
  warm: WarmSpec[];
  logs: { agent: LogLine["agent"]; msg: string }[];
  // Optional hand-authored brain extras; most of the brain is derived.
  decisions?: { decision: string; because: string }[];
  learnings?: { source: string; insight: string; evidence?: string }[];
  user_notes?: string[];
}

function pid(name: string): string {
  return slug(name);
}

export function buildWorld(spec: CompanySpec): AppState {
  const stamp = "2026-07-09T09:00:00.000Z";

  const prospects: BuyerWorldModel[] = spec.prospects.map((p) => {
    const signals: Signal[] = (p.signals ?? []).map((s) => ({
      type: s.type,
      detail: s.detail,
      source: "sillage",
    }));
    return {
      id: pid(p.name),
      prospect: {
        name: p.name,
        title: p.title,
        company: p.company,
        linkedin_url: p.linkedin ?? "",
        x_handle: p.x ?? "",
      },
      contact: { emails: p.emails ?? [], phones: p.phones ?? [] },
      signals,
      topics: (p.topics ?? []).map((t) => ({
        topic: t.topic,
        stance: t.stance,
        evidence: t.evidence ?? [],
      })),
      formats: p.formats ?? [],
      media: p.media ?? [],
      influencers: (p.influencers ?? []).map((i) => ({
        name: i.name,
        why: i.why,
        evidence: i.evidence ?? [],
      })),
      behavior: p.behavior ?? (p.heat < 25 ? "lurker" : "commenter"),
      gravity_score: p.score ?? 0,
      heat: p.heat,
      state:
        p.state ??
        (p.heat < 25 ? "low_orbit" : p.topics?.length ? "modeled" : "cold"),
      engagement_events: [],
    };
  });

  const cohorts: Cohort[] = spec.cohorts.map((c) => ({
    id: slug(c.name),
    name: c.name,
    taste: c.taste,
    format: c.format,
    members: c.members.map(pid),
    engagements: c.engagements ?? 0,
    warm: c.warm ?? 0,
  }));

  const plan: PlanItem[] = spec.plan.map((p, i) => ({
    id: `seed-${i + 1}-${slug(p.title)}`,
    day: p.day,
    type: p.type,
    channel: p.channel,
    title: p.title,
    draft: p.draft,
    why: p.why,
    evidence: p.evidence ?? [],
    link: p.link,
    variant: p.variant,
    cohort: p.cohort ? slug(p.cohort) : undefined,
    media: p.media,
    done: p.done ?? false,
    eval: p.eval ? { score: p.eval, notes: ["their format ✓", "our voice ✓", "evidence-backed ✓"] } : undefined,
  }));

  const warm: WarmCard[] = spec.warm.map((w, i) => {
    const known = prospects.find((p) => p.prospect.name === w.name);
    return {
      id: `warm-${pid(w.name)}-${i}`,
      prospectId: known?.id ?? "",
      name: w.name,
      title: w.title,
      event: {
        post_id: spec.own_post_urls?.[0] ?? "your-post",
        kind: w.quote ? "comment" : "reaction",
        at: stamp,
        quote: w.quote,
      },
      enriching: false,
      email: w.email,
      phone: w.phone,
      email_draft: w.email_draft,
      connect_note: w.connect_note,
      call_script: w.call_script,
      serendipity: w.serendipity ?? false,
      sent: w.sent ?? false,
      called: false,
      meeting: w.meeting ?? false,
      pitch_brief: w.pitch_brief,
    };
  });

  const log: LogLine[] = spec.logs.map((l, i) => ({
    at: new Date(Date.parse(stamp) + i * 1000).toISOString(),
    agent: l.agent,
    msg: l.msg,
  }));

  const crew = emptyCrew().map((c) => ({
    ...c,
    status: "done" as const,
    note:
      c.agent === "radar"
        ? `${warm.length} warm · watching your posts`
        : c.agent === "strategist"
          ? `${plan.length}-item plan · evals passed`
          : c.agent === "listener"
            ? `${prospects.filter((p) => p.topics.length).length} world models`
            : c.agent === "resolver"
              ? `${prospects.filter((p) => p.state !== "low_orbit").length} hot · ${prospects.filter((p) => p.state === "low_orbit").length} low-orbit`
              : `ICP set · ${spec.targets.length} accounts in`,
  }));

  return {
    input: {
      website: spec.website,
      product_summary: spec.product_summary,
      targets: spec.targets,
      own_post_urls: spec.own_post_urls,
    },
    crew,
    prospects,
    cohorts,
    gravity_map: spec.gravity_map,
    plan,
    warm,
    log,
    run_started_at: stamp,
    run_done: true,
    mock: spec.mock,
  };
}

// Derive a clean, well-enriched Company Brain from a spec so /brain never
// shows the stale global artifact. Most fields are derived from the world
// (narrative, ICP, content performance from posts × cohort engagement,
// decisions from cohorts); tone + a steering note are authored per company.
export function buildBrain(spec: CompanySpec): CompanyBrain {
  const stamp = "2026-07-09T09:00:00.000Z";
  const at = (i: number) => new Date(Date.parse(stamp) + i * 1000).toISOString();

  // content performance: one row per post-type plan item, scored by the
  // cohort it targeted (warm ⇒ hot, engaged ⇒ warm, else cold).
  const cohortByName = new Map(spec.cohorts.map((c) => [slug(c.name), c]));
  const content = spec.plan
    .filter((p) => p.type === "post" || p.type === "blog")
    .map((p) => {
      const c = p.cohort ? cohortByName.get(slug(p.cohort)) : undefined;
      const engagements = c?.engagements ?? 0;
      const comments = c?.warm ?? 0;
      const verdict =
        comments >= 1 ? "hot" : engagements >= 2 ? "warm" : "cold";
      return {
        post_id: `seed-${slug(p.title)}`,
        title: p.title,
        format: p.media ?? "post",
        engagements,
        comments,
        verdict: verdict as "hot" | "warm" | "cold",
      };
    });

  // decisions: the cohort-targeting call + the best-performing cohort, plus
  // any authored extras.
  const best = [...spec.cohorts]
    .filter((c) => slug(c.name) !== "quiet-execs")
    .sort((a, b) => (b.engagements ?? 0) - (a.engagements ?? 0))[0];
  const decisions = [
    {
      at: at(1),
      decision: "target content at taste cohorts, not individuals",
      because: `${spec.cohorts
        .filter((c) => slug(c.name) !== "quiet-execs")
        .map((c) => `${c.name} (${c.members.length})`)
        .join(" and ")} reward different formats — one post per cohort beats one per person`,
    },
    ...(best
      ? [
          {
            at: at(2),
            decision: `lead with the "${best.name}" cohort`,
            because: `its content earned ${best.engagements ?? 0} engagements this week — the hottest segment`,
          },
        ]
      : []),
    ...(spec.decisions ?? []).map((d, i) => ({ at: at(3 + i), ...d })),
  ];

  const learnings = [
    {
      at: at(1),
      source: "scout",
      insight: `product narrative locked: ${spec.product_summary.slice(0, 80)}…`,
    },
    ...(spec.tone?.length
      ? [{ at: at(2), source: "scout", insight: `tone of voice: ${spec.tone[0]}` }]
      : []),
    ...(best
      ? [
          {
            at: at(3),
            source: "radar",
            insight: `${best.name} is converting — ${best.format.replace(/_/g, " ")} predicts warm`,
          },
        ]
      : []),
    ...(spec.learnings ?? []).map((l, i) => ({ at: at(4 + i), ...l })),
  ];

  const user_notes = (spec.user_notes ?? []).map((note, i) => ({
    at: at(i),
    note,
    applied_to: "plan",
  }));

  return {
    company: {
      website: spec.website,
      narrative: spec.product_summary,
      icp:
        spec.icp ??
        spec.gravity_map.summary.split(".")[0] ??
        "the buyers most likely to engage before you reach out",
      tone_of_voice: spec.tone ?? [],
      updated_at: stamp,
    },
    learnings,
    content_performance: content,
    user_notes,
    decisions,
  };
}
