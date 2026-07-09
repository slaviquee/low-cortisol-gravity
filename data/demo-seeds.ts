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
  targets: string[];
  own_post_urls?: string[];
  mock: boolean; // true = fully fictional world
  prospects: ProspectSpec[];
  cohorts: CohortSpec[];
  gravity_map: GravityMap;
  plan: PlanSpec[];
  warm: WarmSpec[];
  logs: { agent: LogLine["agent"]; msg: string }[];
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
