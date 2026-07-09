// The crew: Scout → Resolver → Listener → Strategist → Radar (SPEC §3-4).
// Runs fire-and-forget from the API route; the UI polls state and watches
// the agents work. Mock mode (no keys) walks the same stages on fixtures
// with realistic pacing — the demo never blocks on a third party.

import {
  ENGAGEMENT_SCRIPT,
  FIXTURE_GRAVITY_MAP,
  FIXTURE_ICP,
  FIXTURE_SUMMARY,
  fixtureCohorts,
  fixturePlan,
  fixturePlanV2,
  fixtureProspects,
  VOICE_PROFILE,
} from "@/data/fixtures";
import { brainDigest, bumpContent, decide, getBrain, learn, updateBrain } from "@/lib/brain";
import { getState, updateState } from "@/lib/store";
import { evalDraft, mechanicalRevise, SHIP_THRESHOLD } from "./evals";
import {
  AppState,
  BuyerWorldModel,
  Cohort,
  CrewAgent,
  EngagementEvent,
  GravityMap,
  PlanItem,
  Signal,
  WARM_TRIGGER,
  WarmCard,
} from "@/lib/types";
import { think } from "./brain";
import { generateJSON, hasClaude, MODEL_DEEP, MODEL_FAST } from "./claude";
import { managedAvailable, managedJSON } from "./managed";
import { GRAVITY_MAP_SYSTEM, PLAN_SYSTEM, WORLD_MODEL_SYSTEM } from "./prompts";
import { latestActivityDates, postEngagement, runActor } from "./tools/apify";
import { enrichContact, searchPeople, type FoundPerson } from "./tools/fullenrich";
import { findMediaAppearances, transcribe } from "./tools/gradium";
import { fetchPipe } from "./tools/hubspot";
import {
  getCompanyMapping,
  pushPersonaAndAccounts,
  signalsForTargets,
} from "./tools/sillage";
import { distillWebsite } from "./tools/website";
import { xFollowing, xSearch, xTimeline } from "./tools/x";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
const forcedMock = () => process.env.GRAVITY_MOCK === "1";

const TITLES = [
  "VP Sales",
  "CRO",
  "Chief Revenue Officer",
  "Head of Sales",
  "Head of RevOps",
  "Revenue Operations",
];

function slug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function companyFromTarget(target: string) {
  const clean = target.replace(/^https?:\/\//, "").replace(/^www\./, "").split("/")[0];
  return clean.includes(".")
    ? clean.split(".")[0].replace(/[-_]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
    : target;
}

function signalsForPerson(
  map: Record<string, Signal[]> | null,
  person: FoundPerson,
  account: string
): Signal[] {
  if (!map) return [];
  return [
    ...(map[account] ?? []),
    ...(map[person.company] ?? []),
    ...(map[person.company.toLowerCase()] ?? []),
  ];
}

function heatFromDates(dates: string[] | null) {
  // null = no data source (e.g. no APIFY_TOKEN) — assume modelable rather
  // than burying every prospect in low-orbit; [] = source worked, they
  // genuinely don't post.
  if (dates === null) return 38;
  if (!dates.length) return 18;
  const newest = dates
    .map((d) => Date.parse(d))
    .filter(Number.isFinite)
    .sort((a, b) => b - a)[0];
  if (!newest) return 35;
  const days = (Date.now() - newest) / 86_400_000;
  if (days < 7) return 82;
  if (days < 30) return 62;
  if (days < 90) return 38;
  return 18;
}

function emptyModel(
  person: FoundPerson,
  account: string,
  signals: Signal[],
  heat = 35
): BuyerWorldModel {
  return {
    id: slug(`${person.name}-${person.company || account}`),
    prospect: {
      name: person.name,
      title: person.title || "Revenue leader",
      company: person.company || companyFromTarget(account),
      linkedin_url: person.linkedin_url || "",
      x_handle: "",
    },
    contact: { emails: [], phones: [] },
    signals,
    topics: [],
    formats: [],
    media: [],
    influencers: [],
    behavior: heat < 25 ? "lurker" : "commenter",
    gravity_score: 0,
    heat,
    state: heat < 25 ? "low_orbit" : "cold",
    engagement_events: [],
  };
}

async function resolveProspects(
  targets: string[],
  signalMap: Record<string, Signal[]> | null,
  mock: boolean
): Promise<BuyerWorldModel[]> {
  if (mock) return fixtureProspects();
  const people: Array<FoundPerson & { account: string }> = [];
  // demo cap: 5 accounts (user-entered ones lead the merge, so the demoed
  // companies always make the cut) — halves mapping/search spend
  for (const account of targets.slice(0, 5)) {
    const [mapped, searched] = await Promise.all([
      getCompanyMapping(account),
      account.includes(".") ? searchPeople(account, TITLES) : Promise.resolve(null),
    ]);
    for (const person of [...(mapped ?? []), ...(searched ?? [])]) {
      if (person.name) people.push({ ...person, account });
    }
  }
  const seen = new Set<string>();
  const unique = people
    .filter((p) => {
      const key = slug(`${p.name}-${p.company}`);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .slice(0, 8);
  if (!unique.length) return fixtureProspects();

  const models: BuyerWorldModel[] = [];
  for (const person of unique) {
    const dates = person.linkedin_url ? await latestActivityDates(person.linkedin_url) : null;
    models.push(
      emptyModel(
        person,
        person.account,
        signalsForPerson(signalMap, person, person.account),
        heatFromDates(dates)
      )
    );
  }
  return models;
}

const worldSchema = {
  type: "object",
  properties: {
    topics: {
      type: "array",
      items: {
        type: "object",
        properties: {
          topic: { type: "string" },
          stance: { type: "string" },
          evidence: { type: "array", items: { type: "string" } },
        },
        required: ["topic", "stance", "evidence"],
      },
    },
    formats: { type: "array", items: { type: "string" } },
    media: {
      type: "array",
      items: {
        type: "object",
        properties: {
          kind: { type: "string", enum: ["text", "image", "carousel", "video", "poll"] },
          share: { type: "number" },
        },
        required: ["kind", "share"],
      },
    },
    influencers: {
      type: "array",
      items: {
        type: "object",
        properties: {
          name: { type: "string" },
          why: { type: "string" },
          evidence: { type: "array", items: { type: "string" } },
        },
        required: ["name", "why", "evidence"],
      },
    },
    behavior: { type: "string", enum: ["poster", "commenter", "lurker"] },
  },
  required: ["topics", "formats", "media", "influencers", "behavior"],
};

async function buildWorldModel(model: BuyerWorldModel, mock: boolean) {
  if (mock || model.state === "low_orbit") return model;
  const linkedin = model.prospect.linkedin_url;
  const handle = model.prospect.x_handle;
  const [posts, comments, reactions, timeline, following, xTaste, appearances] =
    await Promise.all([
      linkedin ? runActor("posts", { profiles: [linkedin], maxItems: 8 }) : null,
      linkedin ? runActor("profileComments", { profiles: [linkedin], maxItems: 8 }) : null,
      linkedin ? runActor("profileReactions", { profiles: [linkedin], maxItems: 8 }) : null,
      handle ? xTimeline(handle) : null,
      handle ? xFollowing(handle) : null,
      handle
        ? xSearch(`What does ${model.prospect.name} argue about professionally?`, [handle])
        : null,
      findMediaAppearances(model.prospect.name, model.prospect.company),
    ]);
  // Spend guard: transcribe at most the hottest prospects' first appearance,
  // and never feed a full episode into the prompt.
  const transcriptRaw =
    appearances?.[0]?.url && model.heat >= 75
      ? await transcribe(appearances[0].url)
      : null;
  const transcript = transcriptRaw?.slice(0, 4000) ?? null;
  type WorldGen = {
    topics: BuyerWorldModel["topics"];
    formats: string[];
    media: BuyerWorldModel["media"];
    influencers: BuyerWorldModel["influencers"];
    behavior: BuyerWorldModel["behavior"];
  };
  const worldPrompt = `Prospect: ${JSON.stringify(model.prospect)}
Signals: ${JSON.stringify(model.signals)}
LinkedIn posts: ${JSON.stringify(posts ?? [])}
LinkedIn comments: ${JSON.stringify(comments ?? [])}
LinkedIn reactions: ${JSON.stringify(reactions ?? [])}
X timeline: ${JSON.stringify((timeline ?? []).slice(0, 15))}
X following: ${JSON.stringify((following ?? []).slice(0, 30))}
X semantic read: ${xTaste ?? ""}
Spoken web transcript: ${transcript ?? ""}

Return only evidence-backed buyer taste signals. If evidence is weak, say so with sparse topics rather than inventing.`;
  // direct API first; managed-agent fallback covers subscription-only auth
  const generated =
    (await generateJSON<WorldGen>({
      model: MODEL_FAST,
      system: WORLD_MODEL_SYSTEM,
      schema: worldSchema,
      prompt: worldPrompt,
      maxTokens: 2500,
    })) ?? (await managedJSON<WorldGen>("listener", worldPrompt, worldSchema));
  if (!generated) return { ...model, state: "modeled" as const };
  return {
    ...model,
    topics: generated.topics ?? [],
    formats: generated.formats ?? [],
    media: generated.media ?? [],
    influencers: generated.influencers ?? [],
    behavior: generated.behavior ?? model.behavior,
    state: "modeled" as const,
  };
}

const gravitySchema = {
  type: "object",
  properties: {
    summary: { type: "string" },
    themes: {
      type: "array",
      items: {
        type: "object",
        properties: {
          theme: { type: "string" },
          who: { type: "array", items: { type: "string" } },
          evidence: { type: "array", items: { type: "string" } },
        },
        required: ["theme", "who", "evidence"],
      },
    },
    watering_holes: { type: "array", items: { type: "string" } },
  },
  required: ["summary", "themes", "watering_holes"],
};

function deriveCohorts(prospects: BuyerWorldModel[]): Cohort[] {
  // A cohort key must be a taste label, not a sentence: when evidence is
  // sparse the world model can emit caveat text in formats[] — anything
  // longer than a short label buckets into "low-signal buyers" instead.
  const label = (p: BuyerWorldModel): string => {
    const f = (p.formats[0] ?? "").trim();
    if (f && f.length <= 32 && f.split(/\s+/).length <= 4) return f;
    return p.behavior === "lurker" ? "low-signal buyers" : "active buyers";
  };
  const groups = new Map<string, Cohort>();
  for (const p of prospects) {
    const key = p.state === "low_orbit" ? "quiet-execs" : slug(label(p));
    const existing = groups.get(key);
    if (existing) {
      existing.members.push(p.id);
      continue;
    }
    groups.set(key, {
      id: key,
      name: key.replaceAll("-", " "),
      taste:
        p.state === "low_orbit"
          ? "quiet on socials — email/call after timed signal"
          : label(p).replaceAll("_", " "),
      format: label(p) || "direct_touch",
      members: [p.id],
      engagements: 0,
      warm: 0,
    });
  }
  return [...groups.values()];
}

const planSchema = {
  type: "object",
  properties: {
    items: {
      type: "array",
      items: {
        type: "object",
        properties: {
          day: { type: "string", enum: ["Mon", "Tue", "Wed", "Thu", "Fri"] },
          type: {
            type: "string",
            enum: ["post", "blog", "comment", "follow", "react", "connect"],
          },
          channel: { type: "string", enum: ["linkedin", "x"] },
          title: { type: "string" },
          draft: { type: "string" },
          why: { type: "string" },
          evidence: { type: "array", items: { type: "string" } },
          link: { type: "string" },
          cohort: { type: "string" },
          media: { type: "string" },
        },
        required: ["day", "type", "channel", "title", "draft", "why", "evidence"],
      },
    },
  },
  required: ["items"],
};

function fallbackPlan(prospects: BuyerWorldModel[], cohorts: Cohort[]): PlanItem[] {
  const hot = prospects.find((p) => p.state !== "low_orbit") ?? prospects[0];
  const cohort = cohorts.find((c) => c.members.includes(hot?.id ?? ""))?.id;
  const evidence = hot?.topics[0]?.evidence ?? hot?.signals.map((s) => s.detail) ?? [];
  return [
    {
      id: "live-tue-post",
      day: "Tue",
      type: "post",
      channel: "linkedin",
      title: `Publish for ${cohort?.replaceAll("-", " ") ?? "active buyers"}`,
      draft: `The best outbound teams are not sending more.\n\nThey are making sure every touch is worth sending before it leaves the queue.\n\nThat is the gap I keep seeing in sales teams adopting AI: generation is automated, QA is still manual.\n\nWhat are you checking before a message ships?`,
      why: hot
        ? `${hot.prospect.name} and nearby buyers show interest in ${hot.topics[0]?.topic ?? "outbound quality"}.`
        : "Start with the strongest shared signal available.",
      evidence,
      cohort,
      media: hot?.media[0]?.kind ?? "text",
      done: false,
    },
    {
      id: "live-wed-comment",
      day: "Wed",
      type: "comment",
      channel: "linkedin",
      title: "Comment inside the buyer orbit",
      draft:
        "The missing layer is QA. Most teams automated the writing, then kept the review process exactly as manual as before.",
      why: "Enter the thread before the first direct touch.",
      evidence,
      link: hot?.influencers[0]?.evidence[0],
      cohort,
      media: hot?.media[0]?.kind,
      done: false,
    },
    {
      id: "live-thu-connect",
      day: "Thu",
      type: "connect",
      channel: "linkedin",
      title: hot ? `Connect with ${hot.prospect.name}` : "Connect with the hottest buyer",
      draft: hot
        ? `${hot.prospect.name.split(" ")[0]} — your recent activity around ${hot.topics[0]?.topic ?? "sales execution"} matched work we are doing on outbound QA. No pitch; thought the data would be useful.`
        : "Saw your recent work around outbound quality. Thought the data we are seeing would be useful.",
      why: "Third rung after visible feed touches.",
      evidence,
      link: hot?.prospect.linkedin_url,
      cohort,
      media: "text",
      done: false,
    },
  ];
}

async function crew(agent: CrewAgent, status: "running" | "done", note: string) {
  await updateState((s) => {
    const c = s.crew.find((c) => c.agent === agent);
    if (c) {
      c.status = status;
      c.note = note;
    }
    s.log.push({ at: new Date().toISOString(), agent, msg: note });
  });
}

async function crewForRun(
  runId: string | undefined,
  agent: CrewAgent,
  status: "running" | "done",
  note: string
) {
  if (!runId) return crew(agent, status, note);
  await updateState((s) => {
    if (s.run_started_at !== runId) return;
    const c = s.crew.find((c) => c.agent === agent);
    if (c) {
      c.status = status;
      c.note = note;
    }
    s.log.push({ at: new Date().toISOString(), agent, msg: note });
  });
}

async function updateRunState(
  runId: string | undefined,
  fn: (s: AppState) => AppState | void
) {
  if (!runId) return updateState(fn);
  return updateState((s) => {
    if (s.run_started_at !== runId) return;
    return fn(s);
  });
}

export async function runPipeline(
  website: string,
  targets: string[],
  ownHandles?: string,
  runId?: string
) {
  // Vercel serves the safe deterministic demo (per README) — its serverless
  // filesystem can't hold live state, so force the fixture world there.
  const mock =
    forcedMock() ||
    Boolean(process.env.VERCEL) ||
    (!hasClaude() && !managedAvailable());
  const mark = (agent: CrewAgent, status: "running" | "done", note: string) =>
    crewForRun(runId, agent, status, note);

  // ── Scout: website → narrative; ICP + accounts into Sillage; signals back
  await mark("scout", "running", `reading ${website}…`);
  const summary = website ? await distillWebsite(website) : FIXTURE_SUMMARY;
  await updateRunState(runId, (s) => {
    s.input.product_summary = summary;
    s.mock = mock;
  });
  // GOAL: know who we are before deciding anything. Narrative + ICP → brain.
  await updateBrain((b) => {
    b.company.website = website;
    b.company.narrative = summary;
    b.company.icp = FIXTURE_ICP;
    b.company.updated_at = new Date().toISOString();
    learn(b, "scout", `product narrative locked: ${summary.slice(0, 90)}…`);
  });
  // Tone of voice — read OUR OWN posts so everything ships in our voice.
  await mark(
    "scout",
    "running",
    `reading ${ownHandles || "your"} posts — locking tone of voice…`
  );
  await sleep(mock ? 1400 : 400);
  await updateBrain((b) => {
    b.company.tone_of_voice = VOICE_PROFILE; // real mode: apify own posts → think('scout')
    learn(b, "scout", `tone of voice: ${VOICE_PROFILE[0]}; ${VOICE_PROFILE[1]}`);
  });
  await mark("scout", "running", "tone locked: numbers-first · short · no emoji");
  // CRM in: HubSpot pipe — open deals to accelerate, closed-lost to re-warm.
  // Pipe accounts are MERGED into targeting, not just displayed.
  const pipe = await fetchPipe();
  if (pipe) {
    targets = Array.from(
      new Set([...targets, ...pipe.closed_lost, ...pipe.open])
    ).slice(0, 20); // Sillage's recommended top-accounts batch size
    await updateRunState(runId, (s) => {
      s.input.targets = targets;
    });
    await mark(
      "scout",
      "running",
      `hubspot pipe in: ${pipe.open.length} open · ${pipe.closed_lost.length} closed-lost to re-warm · ${pipe.won.length} won → lookalikes`
    );
  } else if (mock) {
    await sleep(600);
    await mark("scout", "running", "hubspot pipe in: 4 open · 3 closed-lost to re-warm · 6 won → lookalikes");
  }
  await mark("scout", "running", "pushing persona + accounts into Sillage…");
  const sillageReady = mock
    ? false
    : await pushPersonaAndAccounts(FIXTURE_ICP, targets);
  const signalMap = mock ? null : await signalsForTargets(targets);
  await sleep(mock ? 1400 : 300);
  await mark(
    "scout",
    "done",
    sillageReady || signalMap
      ? `ICP set · ${targets.length} accounts in · Sillage signals read`
      : `ICP set · ${targets.length} accounts in · Sillage fallback`
  );

  // ── Resolver: named people (Sillage mappings + FullEnrich search), heat triage
  await mark("resolver", "running", "reading company mappings → named buyers…");
  await sleep(mock ? 2000 : 500);
  const prospects = await resolveProspects(targets, signalMap, mock);
  await mark("resolver", "running", "heat triage: who actually lives in the feed?");
  await sleep(mock ? 1500 : 300);
  const hot = prospects.filter((p) => p.state !== "low_orbit");
  const quiet = prospects.filter((p) => p.state === "low_orbit");
  await updateRunState(runId, (s) => {
    s.prospects = prospects.map((p) => ({
      ...p,
      state: p.state === "low_orbit" ? "low_orbit" : "cold",
      topics: [],
      formats: [],
      influencers: [],
    }));
  });
  await mark(
    "resolver",
    "done",
    `${hot.length} hot · ${quiet.length} low-orbit — contact data waits for intent`
  );

  // Low-orbit path IS email: fetch their emails right away (JIT rule).
  // Spend cap: first 3 quiet prospects, email-only (1 credit each) — the
  // low-orbit lane never shows more than that in a demo.
  for (const p of quiet.slice(0, 3)) {
    enrichContact({
      id: p.id,
      name: p.prospect.name,
      company: p.prospect.company,
      linkedin_url: p.prospect.linkedin_url,
    })
      .then((c) =>
        updateRunState(runId, (s) => {
          const target = s.prospects.find((x) => x.id === p.id);
          if (target && c.email) target.contact.emails = [c.email];
        })
      )
      .catch((e) => console.error("[low-orbit enrich]", e));
  }

  // ── Listener: one subagent per hot prospect, in parallel (world models)
  await mark("listener", "running", `deep-scraping ${hot.length} hot prospects (LinkedIn + X)…`);
  for (const p of hot) {
    await sleep(mock ? 2200 : 800);
    const full = await buildWorldModel(prospects.find((x) => x.id === p.id)!, mock);
    const idx = prospects.findIndex((x) => x.id === p.id);
    if (idx >= 0) prospects[idx] = full;
    await updateRunState(runId, (s) => {
      const target = s.prospects.find((x) => x.id === p.id);
      if (target) {
        target.topics = full.topics;
        target.formats = full.formats;
        target.media = full.media;
        target.influencers = full.influencers;
        target.behavior = full.behavior;
        target.state = "modeled";
      }
    });
    await mark("listener", "running", `world model built: ${p.prospect.name}`);
    // The spoken web: web search finds appearances, Gradium STT transcribes.
    // Real mode: findMediaAppearances() + transcribe(); mock shows Jane's.
    if (p.id === "jane-kowalski") {
      await mark(
        "listener",
        "running",
        "podcast found: Outbound Radio ep.42 → gradium transcript mined for stances"
      );
    }
  }
  await mark(
    "listener",
    "running",
    "media mix analyzed: carousels lead for 2 of 3 buyers, text for one"
  );
  await sleep(mock ? 900 : 200);
  await mark("listener", "done", `${hot.length} Buyer World Models, every claim with evidence`);

  // ── Strategist: Gravity Map → taste cohorts → the week's plan
  await mark("strategist", "running", "synthesizing the Gravity Map across the ICP…");
  await sleep(mock ? 2500 : 500);
  const gravityPrompt = `Product: ${summary}\n\nBuyer World Models:\n${JSON.stringify(prospects)}`;
  const gravity =
    mock
      ? FIXTURE_GRAVITY_MAP
      : (await generateJSON<GravityMap>({
          model: MODEL_DEEP,
          system: GRAVITY_MAP_SYSTEM,
          schema: gravitySchema,
          prompt: gravityPrompt,
          maxTokens: 2500,
        })) ??
        (await managedJSON<GravityMap>("strategist", gravityPrompt, gravitySchema)) ??
        FIXTURE_GRAVITY_MAP;
  await updateRunState(runId, (s) => {
    s.gravity_map = gravity;
  });
  // Cluster world models into taste cohorts: one post serves a cohort,
  // not a person — and performance gets scored per cohort.
  await mark("strategist", "running", "clustering 3 world models → 2 taste cohorts (+1 quiet)…");
  await sleep(mock ? 1600 : 300);
  const cohorts = mock ? fixtureCohorts() : deriveCohorts(prospects);
  await updateRunState(runId, (s) => {
    s.cohorts = cohorts;
  });
  await updateBrain((b) =>
    decide(
      b,
      "target content at taste cohorts, not individuals",
      "chart skeptics (2 buyers) and systems thinkers (1) reward different formats — one post per cohort beats one post per person"
    )
  );
  await mark("strategist", "running", "drafting the gravity plan: posts · comments · micro-actions…");
  await sleep(mock ? 2500 : 500);
  const planPrompt = `Product: ${summary}
Gravity map: ${JSON.stringify(gravity)}
Cohorts: ${JSON.stringify(cohorts)}
Buyer World Models: ${JSON.stringify(prospects)}
Brain: ${brainDigest(await getBrain())}

Create a 5-day plan with posts, comments, reacts/follows/connects. Each item targets one cohort and cites evidence.`;
  type PlanGen = { items: Omit<PlanItem, "id" | "done">[] };
  const generatedPlan = mock
    ? null
    : ((await generateJSON<PlanGen>({
        model: MODEL_DEEP,
        system: PLAN_SYSTEM,
        schema: planSchema,
        prompt: planPrompt,
        maxTokens: 3500,
      })) ?? (await managedJSON<PlanGen>("strategist", planPrompt, planSchema)));
  const plan = generatedPlan?.items?.length
    ? generatedPlan.items.map((item, i) => ({
        // spread FIRST so a model-emitted id/done can't override ours
        ...item,
        id: `live-${i + 1}-${slug(item.title)}`,
        done: false,
      }))
    : mock
      ? fixturePlan()
      : fallbackPlan(prospects, cohorts);
  const gated = await evalGate(plan, "strategist", runId);
  await updateRunState(runId, (s) => {
    s.plan = gated;
  });
  await updateBrain((b) =>
    decide(b, "week-1 plan: tactical charts + influencer comments", "6/10 targets reward that format (world-model evidence)")
  );
  await mark("strategist", "done", "5-day plan ready — evals passed, familiarity ladder sequenced");

  // ── Radar: armed, watching
  await mark("radar", "running", "watching your posts for target engagement…");
  await updateRunState(runId, (s) => {
    s.run_done = true;
  });
}

// EVAL GATE — the quality loop: score every draft against the rubric
// (their format, our voice, evidence, no slop); failures get one bounded
// revision and a re-score. Nothing ships under threshold silently.
async function evalGate(
  items: import("@/lib/types").PlanItem[],
  agent: CrewAgent,
  runId?: string
): Promise<import("@/lib/types").PlanItem[]> {
  const brain = await getBrain();
  const out = [];
  for (const item of items) {
    let verdict = evalDraft(item, brain);
    let revised = false;
    if (verdict.score < SHIP_THRESHOLD && item.draft) {
      const before = verdict.score;
      // real mode: think('strategist', revise-with-eval-notes); bounded fallback:
      item.draft = mechanicalRevise(item.draft);
      verdict = evalDraft(item, brain);
      revised = true;
      await updateRunState(runId, (s) => {
        s.log.push({
          at: new Date().toISOString(),
          agent,
          msg: `eval caught "${item.title}" at ${before} → revised → ${verdict.score}`,
        });
      });
    }
    out.push({ ...item, eval: verdict, revised: revised || item.revised });
  }
  return out;
}

let scriptCursor = 0;

// One Radar scan = one pass over engagement on OUR posts.
// Mock/no URLs: advances the scripted beats. Real: apify postEngagement() on
// published post URLs, matched against the target list the same way.
export async function radarScan(postUrls: string[] = []): Promise<string> {
  const urls = postUrls.map((u) => u.trim()).filter(Boolean);
  const current = await getState();
  // Capability-based routing: scripted beats belong to the fixture world
  // only — never inject fictional engagement into a live-modeled board.
  const fixtureWorld = current.prospects.some((p) => p.id === "jane-kowalski");
  const scripted = forcedMock() || current.mock || (!process.env.APIFY_TOKEN && fixtureWorld);
  if (!scripted) {
    if (!urls.length) {
      return "Paste at least one published LinkedIn/X post URL so Radar can scan live engagement.";
    }
    if (!process.env.APIFY_TOKEN) {
      return "Radar needs APIFY_TOKEN to scan live post engagement — add the key, or run the demo world (GRAVITY_MOCK=1).";
    }
    return liveRadarScan(urls);
  }
  const beat = ENGAGEMENT_SCRIPT[scriptCursor];
  if (!beat) return "No new engagement since last scan.";
  scriptCursor++;

  const at = new Date().toISOString();
  const event = { ...beat.event, at };

  if (beat.prospectId) {
    let becameWarm = false;
    let name = "";
    await updateState((s) => {
      const p = s.prospects.find((x) => x.id === beat.prospectId);
      if (!p) return;
      name = p.prospect.name;
      p.engagement_events.push(event);
      p.gravity_score += event.kind === "comment" ? 18 : 8;
      const comments = p.engagement_events.filter((e) => e.kind === "comment").length;
      const reactions = p.engagement_events.filter((e) => e.kind === "reaction").length;
      if (
        p.state !== "warm" &&
        p.state !== "in_conversation" &&
        (comments >= WARM_TRIGGER.comments || reactions >= WARM_TRIGGER.reactions)
      ) {
        p.state = "warm";
        becameWarm = true;
      } else if (p.state === "modeled" || p.state === "cold") {
        p.state = "engaged";
      }
      s.log.push({ at, agent: "radar", msg: `${name} ${event.kind === "comment" ? "commented on" : "reacted to"} your post` });
    });

    // Every data point sharpens the brain: content performance + learnings,
    // attributed to the taste cohort the action targeted.
    const st = await getState();
    const planItem = st.plan.find((x) => x.id === event.post_id);
    if (planItem?.cohort) {
      await updateState((s) => {
        const c = s.cohorts.find((x) => x.id === planItem.cohort);
        if (c) {
          c.engagements++;
          if (becameWarm) c.warm++;
        }
      });
    }
    await updateBrain((b) => {
      bumpContent(
        b,
        event.post_id,
        planItem?.title ?? event.post_id,
        planItem?.type === "post" ? "tactical_chart" : planItem?.type ?? "post",
        event.kind
      );
      if (becameWarm)
        learn(
          b,
          "radar",
          `${name} went warm off "${planItem?.title ?? event.post_id}"${planItem?.cohort ? ` — ${planItem.cohort} is converting` : ""}`,
          event.post_id
        );
    });

    if (becameWarm && beat.prospectId) void warmFlow(beat.prospectId, event.quote);
    return `${name} ${event.kind === "comment" ? `commented: "${event.quote}"` : "reacted to your post"}${becameWarm ? " → WARM" : ""}`;
  }

  // Serendipity: an engager we never prospected. ICP check → enrich → board.
  const st = beat.stranger!;
  const id = st.name.toLowerCase().replace(/[^a-z]+/g, "-");
  const stPlan = (await getState()).plan.find((x) => x.id === event.post_id);
  await updateBrain((b) => {
    bumpContent(
      b,
      event.post_id,
      stPlan?.title ?? event.post_id,
      stPlan?.type === "post" ? "tactical_chart" : stPlan?.type ?? "post",
      event.kind
    );
    learn(b, "radar", `"${stPlan?.title ?? event.post_id}" pulled an ICP-fit stranger (${st.name}) — the format sources net-new pipeline`, event.post_id);
  });
  // Serendipity engagers join the cohort whose content pulled them in.
  if (stPlan?.cohort) {
    await updateState((s) => {
      const c = s.cohorts.find((x) => x.id === stPlan.cohort);
      if (c) {
        c.engagements++;
        if (!c.members.includes(id)) c.members.push(id);
      }
      s.log.push({
        at: new Date().toISOString(),
        agent: "radar",
        msg: `${st.name} joined the ${stPlan.cohort} cohort — its content pulled her in`,
      });
    });
  }
  await updateState((s) => {
    s.log.push({ at, agent: "radar", msg: `${st.name} (${st.title} @ ${st.company}) engaged — not on the list. Running ICP check…` });
  });
  await sleep(1200); // ICP check (real mode: generateJSON(ICP_CHECK_SYSTEM,…))
  const card: WarmCard = {
    id: `warm-${id}`,
    prospectId: "",
    name: st.name,
    title: `${st.title} @ ${st.company}`,
    event,
    enriching: true,
    email_draft: "",
    connect_note: "",
    serendipity: true,
    meeting: false,
    sent: false,
    called: false,
  };
  await updateState((s) => {
    s.warm.unshift(card);
    s.log.push({ at: new Date().toISOString(), agent: "radar", msg: `${st.name} fits the ICP — your post just sourced a prospect you never prospected. Enriching…` });
  });
  const contact = await enrichContact({ id, name: st.name, company: st.company, linkedin_url: st.linkedin_url });
  const drafts = await draftOutreach(st.name, st.title, event.quote ?? "", null);
  const call = await draftCallScript(st.name, st.title, event.quote ?? "", contact.phone);
  await updateState((s) => {
    const c = s.warm.find((w) => w.id === card.id);
    if (c) {
      c.enriching = false;
      c.email = contact.email;
      c.phone = contact.phone;
      c.email_draft = drafts.email;
      c.connect_note = drafts.note;
      c.call_script = call;
    }
  });
  void draftPitchBrief(card.id); // brief is ready before any call or email
  return `Serendipity: ${st.name} (${st.company}) engaged, fits ICP → added to warm queue`;
}

// normalize URLs before matching: Apify and Sillage/FullEnrich format
// linkedin.com URLs differently (protocol, www, trailing slash, case)
const normUrl = (u: string) =>
  u.toLowerCase().replace(/^https?:\/\/(www\.)?/, "").replace(/\/+$/, "");

async function liveRadarScan(postUrls: string[]): Promise<string> {
  const state = await updateState((s) => {
    s.input.own_post_urls = Array.from(
      new Set([...(s.input.own_post_urls ?? []), ...postUrls])
    );
  });
  // Positional attribution: the i-th published URL maps to the i-th
  // post-type plan item — cohort meters + brain content_performance stay
  // alive in live mode, same as the scripted path.
  const postItems = state.plan.filter((p) => p.type === "post" || p.type === "blog");
  const urlOrder = state.input.own_post_urls ?? [];

  let seen = 0;
  let warm = 0;
  let enrichBudget = 3; // hard cap on paid enrichments per scan
  for (const url of postUrls) {
    const planItem = postItems[urlOrder.indexOf(url)] ?? postItems[0];
    const engagement = await postEngagement(url);
    const events = [
      // comments first — they carry quotes and trigger serendipity
      ...engagement.comments.map((c) => ({
        name: c.name ?? "",
        headline: c.headline ?? "",
        profileUrl: c.profileUrl ?? "",
        kind: "comment" as const,
        quote: c.text ?? "",
      })),
      ...engagement.reactions.map((r) => ({
        name: r.name ?? "",
        headline: r.headline ?? "",
        profileUrl: r.profileUrl ?? "",
        kind: "reaction" as const,
        quote: "",
      })),
    ]
      .filter((e) => e.name || e.profileUrl)
      .slice(0, 20); // per-post event cap — a demo never needs more
    for (const e of events) {
      seen++;
      let matched = "";
      let becameWarm = false;
      const event: EngagementEvent = {
        post_id: url,
        kind: e.kind,
        at: new Date().toISOString(),
        quote: e.quote,
      };
      await updateState((s) => {
        const p = s.prospects.find(
          (x) =>
            (e.profileUrl &&
              x.prospect.linkedin_url &&
              normUrl(x.prospect.linkedin_url) === normUrl(e.profileUrl)) ||
            (e.name && x.prospect.name.toLowerCase() === e.name.toLowerCase())
        );
        if (!p) return;
        if (
          p.engagement_events.some(
            (old) =>
              old.post_id === event.post_id &&
              old.kind === event.kind &&
              old.quote === event.quote
          )
        )
          return;
        matched = p.id;
        p.engagement_events.push(event);
        p.gravity_score += event.kind === "comment" ? 18 : 8;
        const comments = p.engagement_events.filter((x) => x.kind === "comment").length;
        const reactions = p.engagement_events.filter((x) => x.kind === "reaction").length;
        if (
          p.state !== "warm" &&
          p.state !== "in_conversation" &&
          (comments >= WARM_TRIGGER.comments || reactions >= WARM_TRIGGER.reactions)
        ) {
          p.state = "warm";
          becameWarm = true;
        } else if (p.state === "modeled" || p.state === "cold") {
          p.state = "engaged";
        }
        s.log.push({
          at: event.at,
          agent: "radar",
          msg: `${p.prospect.name} ${event.kind === "comment" ? "commented on" : "reacted to"} your live post`,
        });
      });
      // per-cohort + brain attribution, mirroring the scripted path
      if (matched) {
        if (planItem?.cohort) {
          await updateState((s) => {
            const c = s.cohorts.find((x) => x.id === planItem.cohort);
            if (c) {
              c.engagements++;
              if (becameWarm) c.warm++;
            }
          });
        }
        await updateBrain((b) =>
          bumpContent(
            b,
            planItem?.id ?? url,
            planItem?.title ?? url,
            planItem?.media ?? "post",
            e.kind
          )
        );
      }
      if (matched && becameWarm) {
        warm++;
        if (enrichBudget-- > 0) await warmFlow(matched, event.quote);
        continue;
      }
      if (!matched && e.kind === "comment" && enrichBudget > 0) {
        enrichBudget--;
        warm++;
        await addSerendipityWarm(e.name, e.headline, e.profileUrl, event);
      }
    }
  }
  return seen
    ? `Radar scanned ${postUrls.length} post${postUrls.length === 1 ? "" : "s"} · ${seen} engagement${seen === 1 ? "" : "s"} · ${warm} warm trigger${warm === 1 ? "" : "s"}`
    : "Radar scanned the live post URLs, no engagement found yet.";
}

async function addSerendipityWarm(
  name: string,
  headline: string,
  linkedin_url: string,
  event: EngagementEvent
) {
  const id = slug(name || linkedin_url || `serendipity-${Date.now()}`);
  const card: WarmCard = {
    id: `warm-${id}`,
    prospectId: "",
    name: name || "Unknown engager",
    title: headline || "ICP-fit engager",
    event,
    enriching: true,
    email_draft: "",
    connect_note: "",
    serendipity: true,
    sent: false,
    called: false,
    meeting: false,
  };
  // Dedupe: rescanning the same post must never re-create the card or
  // re-spend enrichment credits on the same stranger.
  let duplicate = false;
  await updateState((s) => {
    if (s.warm.some((w) => w.id === card.id)) {
      duplicate = true;
      return;
    }
    s.warm.unshift(card);
    s.log.push({
      at: new Date().toISOString(),
      agent: "radar",
      msg: `${card.name} engaged on a live post — enriching for warm follow-up`,
    });
  });
  if (duplicate) return;
  const contact = await enrichContact({
    id,
    name: card.name,
    company: headline,
    linkedin_url,
  });
  const drafts = await draftOutreach(card.name, headline, event.quote ?? "", null);
  const call = await draftCallScript(card.name, headline, event.quote ?? "", contact.phone);
  await updateState((s) => {
    const c = s.warm.find((w) => w.id === card.id);
    if (!c) return;
    c.enriching = false;
    c.email = contact.email;
    c.phone = contact.phone;
    c.email_draft = drafts.email;
    c.connect_note = drafts.note;
    c.call_script = call;
  });
  void draftPitchBrief(card.id);
}

// Warm trigger fires JIT enrichment + outreach drafts (SPEC §3.6).
async function warmFlow(prospectId: string, quote?: string) {
  let p: BuyerWorldModel | undefined;
  const card: WarmCard = {
    id: `warm-${prospectId}-${Date.now()}`,
    prospectId,
    name: "",
    title: "",
    event: { post_id: "", kind: "comment", at: new Date().toISOString(), quote },
    enriching: true,
    email_draft: "",
    connect_note: "",
    serendipity: false,
    meeting: false,
    sent: false,
    called: false,
  };
  await updateState((s) => {
    p = s.prospects.find((x) => x.id === prospectId);
    if (!p) return;
    card.name = p.prospect.name;
    card.title = `${p.prospect.title} @ ${p.prospect.company}`;
    card.event = p.engagement_events[p.engagement_events.length - 1];
    s.warm.unshift(card);
    s.log.push({ at: new Date().toISOString(), agent: "radar", msg: `${p.prospect.name} hit the Warm trigger — firing just-in-time enrichment` });
  });
  if (!p) return;

  // Warm = real intent to call — the ONE place we buy the phone (10 cr).
  const contact = await enrichContact(
    {
      id: prospectId,
      name: p.prospect.name,
      company: p.prospect.company,
      linkedin_url: p.prospect.linkedin_url,
    },
    ["contact.work_emails", "contact.phones"]
  );
  const drafts = await draftOutreach(p.prospect.name, p.prospect.title, quote ?? "", p);
  const call = await draftCallScript(p.prospect.name, p.prospect.title, quote ?? "", contact.phone);
  await updateState((s) => {
    const c = s.warm.find((w) => w.id === card.id);
    const t = s.prospects.find((x) => x.id === prospectId);
    if (t && contact.email) {
      t.contact.emails = [contact.email];
      if (contact.phone) t.contact.phones = [contact.phone];
    }
    if (c) {
      c.enriching = false;
      c.email = contact.email;
      c.phone = contact.phone;
      c.email_draft = drafts.email;
      c.connect_note = drafts.note;
      c.call_script = call;
    }
  });
  void draftPitchBrief(card.id); // brief is ready before any call or email
}

// Cohorts are hypotheses, not labels: every learning cycle re-checks fit.
// A buyer who stayed silent while cohorts performed gets re-seated toward
// where the data points — until they find their place.
async function reclusterCohorts(): Promise<string[]> {
  const moved: string[] = [];
  await updateState((s) => {
    const content = s.cohorts.filter((c) => c.id !== "quiet-execs");
    if (!content.length) return;
    const best = [...content].sort((a, b) => b.engagements - a.engagements)[0];
    if (best.engagements < 3) return; // not enough signal to re-seat anyone
    s.cohorts.forEach((c) => (c.recent_moves = []));
    for (const p of s.prospects) {
      if (p.state === "low_orbit") continue;
      const home = content.find((c) => c.members.includes(p.id));
      if (!home || home.id === best.id) continue;
      const silent = p.engagement_events.length === 0;
      const homeIsCold = home.engagements === 0;
      if (silent && homeIsCold) {
        home.members = home.members.filter((m) => m !== p.id);
        best.members.push(p.id);
        best.recent_moves!.push(p.id);
        moved.push(p.prospect.name);
        s.log.push({
          at: new Date().toISOString(),
          agent: "strategist",
          msg: `re-seated ${p.prospect.name}: ${home.name} never landed with her (0 for 0) — testing ${best.name} next`,
        });
      }
    }
  });
  if (moved.length) {
    await updateBrain((b) => {
      learn(
        b,
        "strategist",
        `cohort re-fit: ${moved.join(", ")} moved — silence is data too; cohorts update until every buyer sits where they engage`
      );
    });
  }
  return moved;
}

// The 5↔6 loop: Radar measured → Strategist re-plans, doubling down on what
// hit. Real mode: think('strategist', …) over engagement; mock: v2 fixtures.
export async function replanFromEngagement(): Promise<number> {
  const s = await getState();
  const engaged = s.prospects.reduce(
    (n, p) => n + p.engagement_events.length,
    0
  );
  if (engaged === 0) return 0;

  // Learning step 1: do the cohorts themselves still fit the data?
  const moved = await reclusterCohorts();
  const fresh = fixturePlanV2().filter(
    (item) => !s.plan.some((p) => p.id === item.id)
  );
  if (!fresh.length) return 0;
  await updateState((st) => {
    const c = st.crew.find((c) => c.agent === "strategist");
    if (c) {
      c.status = "running";
      c.note = "re-planning from engagement…";
    }
  });
  await sleep(1600);
  const gated = await evalGate(fresh, "strategist");
  await updateBrain((b) =>
    decide(
      b,
      "plan v2: shift effort toward the chart-skeptics cohort",
      `its content earned ${engaged} target engagements — best-performing cohort this week`
    )
  );
  await updateState((st) => {
    st.plan.push(...gated);
    const c = st.crew.find((c) => c.agent === "strategist");
    if (c) {
      c.status = "done";
      c.note = `plan v2: +${fresh.length} actions${moved.length ? ` · ${moved.length} buyer${moved.length === 1 ? "" : "s"} re-seated` : ""} — doubled down on what hit`;
    }
    st.log.push({
      at: new Date().toISOString(),
      agent: "strategist",
      msg: `plan v2 — tactical charts earned ${engaged} engagements; doubling down`,
    });
  });
  return fresh.length;
}

// Human steering: the user comments on a proposed post ("mention our SOC2
// report", "add our reply-rate numbers") — Strategist revises WITH the note,
// the note becomes a permanent brain learning (future plans respect it),
// and the eval gate re-scores the result.
export async function reviseDraft(itemId: string, note: string): Promise<boolean> {
  const s = await getState();
  const item = s.plan.find((p) => p.id === itemId);
  if (!item || !note.trim()) return false;
  const brain = await getBrain();

  let draft: string | null = null;
  if (item.draft) {
    draft = await think(
      "strategist",
      `Revise this ${item.channel} ${item.type} draft per the user's note. Keep our tone of voice and the original angle.\n\nBRAIN:\n${brainDigest(brain)}\n\nDRAFT:\n${item.draft}\n\nUSER NOTE: ${note}\n\nReturn ONLY the revised draft. Human and casual; zero AI tells.`,
      { deep: true }
    );
  }
  if (!draft) {
    // deterministic fallback: weave the user's data into the draft body
    const lines = (item.draft ?? "").split("\n\n");
    lines.splice(Math.max(1, lines.length - 1), 0, note.trim().replace(/\.$/, ""));
    draft = mechanicalRevise(lines.join("\n\n"));
  }

  await updateBrain((b) => {
    b.user_notes.push({ at: new Date().toISOString(), note, applied_to: itemId });
    learn(b, "user", `steering note on "${item.title}": ${note}`);
  });

  const brain2 = await getBrain();
  await updateState((st) => {
    const p = st.plan.find((x) => x.id === itemId);
    if (!p) return;
    p.draft = draft!;
    p.user_note = note;
    p.revised = true;
    p.eval = evalDraft(p, brain2);
    st.log.push({
      at: new Date().toISOString(),
      agent: "strategist",
      msg: `revised "${p.title}" with your note — eval ${p.eval.score}`,
    });
  });
  return true;
}

async function draftOutreach(
  name: string,
  title: string,
  quote: string,
  model: BuyerWorldModel | null
): Promise<{ email: string; note: string }> {
  const first = name.split(" ")[0];
  if (model) {
    const text = await think(
      "radar",
      `Prospect: ${name}, ${title}.\nTheir engagement: "${quote}"\nWorld model: ${JSON.stringify({ topics: model.topics, formats: model.formats })}\n\nReturn the email, then '---', then the connection note. Human and casual; zero AI tells.`,
      { deep: true }
    );
    if (text) {
      const [email, note] = text.split(/\n-{3,}\n/);
      return { email: email?.trim() ?? text, note: note?.trim() ?? "" };
    }
  }
  const hook = quote
    ? `your comment on yesterday's post ("${quote.slice(0, 60)}…")`
    : "your reaction to yesterday's post";
  const noteHook = quote
    ? "the QA gap you called out"
    : "exactly the QA gap from that post";
  return {
    email: `Subject: the QA gap\n\nHi ${first} — ${hook} matches what we measured across 40 teams: everyone automated the sending, nobody automated the checking. That gap is what we work on. Worth 20 minutes next week to compare notes on what you're seeing internally?\n\n— Alex @ Loopwell`,
    note: `${first} — your point on ${noteHook} stuck with me. It's the problem we work on all day. Open to swapping notes?`,
  };
}

async function draftCallScript(
  name: string,
  title: string,
  quote: string,
  phone: string
): Promise<string> {
  const first = name.split(" ")[0];
  const live = await think(
    "radar",
    `Write a 30-second AE call opener for ${name}, ${title}. Phone: ${phone || "unknown"}. They already saw us in-feed and engaged with: "${quote || "our post"}". Goal: book a 20-minute working session. No hype, no creepy wording. Return only the call script.`,
    { deep: false }
  );
  if (live) return live;
  return `Hi ${first}, quick one — I am calling because you ${quote ? `commented on the post about "${quote.slice(0, 50)}"` : "reacted to the outbound QA post"} and it maps to a pattern we are seeing in sales teams: AI increased sending, but QA stayed manual. Worth 20 minutes to compare what your team checks before messages ship?`;
}

// Agent-8 move: a tailored pitch brief per warm lead — their words, their
// topics, your proof — ready to paste into Gamma for a per-lead deck.
export async function draftPitchBrief(cardId: string): Promise<string> {
  const s = await getState();
  const card = s.warm.find((w) => w.id === cardId);
  if (!card) return "";
  const model = s.prospects.find((x) => x.id === card.prospectId) ?? null;
  const quote = card.event.quote ?? "";
  const first = card.name.split(" ")[0];

  let brief: string | null = null;
  if (model) {
    brief = await think(
      "radar",
      `Create a tailored pitch brief (a compact deck outline, 5 sections max) for ${card.name}, ${card.title}. Their engagement with us: "${quote || "reacted to our post"}". World model: ${JSON.stringify({ topics: model.topics, formats: model.formats, behavior: model.behavior })}. Product: ${s.input.product_summary}. Open on THEIR words/stance, mirror the formats they reward, end with a 20-minute working-session ask. Plain text, numbered sections. Human and casual; zero AI tells.`,
      { deep: true }
    );
  }
  if (!brief) {
    const topics = model?.topics.map((t) => t.topic).join(" · ") || "outbound efficiency";
    brief = `pitch brief — ${card.name}\n\n1 · open on their words\n    "${quote || "the QA gap in automated outbound"}"\n2 · their world\n    ${topics}\n3 · your proof (their format: numbers first)\n    12,000 emails audited — 4.1% → 2.3% reply rate without QA\n4 · the fix, in their workflow\n    score every touch before it ships; fewer, better sends\n5 · the ask\n    20-minute working session on ${first}'s own numbers\n\n→ paste into gamma.app — a per-lead deck in one click`;
  }
  await updateState((st) => {
    const c = st.warm.find((w) => w.id === cardId);
    if (c) c.pitch_brief = brief!;
    st.log.push({ at: new Date().toISOString(), agent: "radar", msg: `pitch brief drafted for ${card.name}` });
  });
  return brief;
}
