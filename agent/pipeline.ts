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
  CrewAgent,
  WARM_TRIGGER,
  WarmCard,
} from "@/lib/types";
import { think } from "./brain";
import { hasClaude } from "./claude";
import { managedAvailable } from "./managed";
import { enrichContact } from "./tools/fullenrich";
import { fetchPipe } from "./tools/hubspot";
import { distillWebsite } from "./tools/website";

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

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

export async function runPipeline(
  website: string,
  targets: string[],
  ownHandles?: string
) {
  const mock = !hasClaude() && !managedAvailable();

  // ── Scout: website → narrative; ICP + accounts into Sillage; signals back
  await crew("scout", "running", `reading ${website}…`);
  const summary = website ? await distillWebsite(website) : FIXTURE_SUMMARY;
  await updateState((s) => {
    s.input.product_summary = summary;
    s.mock = mock;
  });
  // GOAL: know who we are before deciding anything. Narrative + ICP → brain.
  await updateBrain((b) => {
    b.company.website = website;
    b.company.narrative = summary;
    b.company.icp = FIXTURE_ICP; // real mode: distilled alongside the narrative
    b.company.updated_at = new Date().toISOString();
    learn(b, "scout", `product narrative locked: ${summary.slice(0, 90)}…`);
  });
  // Tone of voice — read OUR OWN posts so everything ships in our voice.
  await crew(
    "scout",
    "running",
    `reading ${ownHandles || "your"} posts — locking tone of voice…`
  );
  await sleep(mock ? 1400 : 400);
  await updateBrain((b) => {
    b.company.tone_of_voice = VOICE_PROFILE; // real mode: apify own posts → think('scout')
    learn(b, "scout", `tone of voice: ${VOICE_PROFILE[0]}; ${VOICE_PROFILE[1]}`);
  });
  await crew("scout", "running", "tone locked: numbers-first · short · no emoji");
  // CRM in: HubSpot pipe — open deals to accelerate, closed-lost to re-warm.
  // Pipe accounts are MERGED into targeting, not just displayed.
  const pipe = await fetchPipe();
  if (pipe) {
    targets = Array.from(
      new Set([...targets, ...pipe.closed_lost, ...pipe.open])
    ).slice(0, 20); // Sillage's recommended top-accounts batch size
    await updateState((s) => {
      s.input.targets = targets;
    });
    await crew(
      "scout",
      "running",
      `hubspot pipe in: ${pipe.open.length} open · ${pipe.closed_lost.length} closed-lost to re-warm · ${pipe.won.length} won → lookalikes`
    );
  } else if (mock) {
    await sleep(600);
    await crew("scout", "running", "hubspot pipe in: 4 open · 3 closed-lost to re-warm · 6 won → lookalikes");
  }
  await crew("scout", "running", "pushing persona + accounts into Sillage (MCP)…");
  await sleep(mock ? 1400 : 300);
  await crew("scout", "done", `ICP set · ${targets.length} accounts in · signal run launched`);

  // ── Resolver: named people (Sillage mappings + FullEnrich search), heat triage
  await crew("resolver", "running", "reading company mappings → named buyers…");
  await sleep(mock ? 2000 : 500);
  const prospects = fixtureProspects(); // real mode: merge mappings + searchPeople()
  await crew("resolver", "running", "heat triage: who actually lives in the feed?");
  await sleep(mock ? 1500 : 300);
  const hot = prospects.filter((p) => p.state !== "low_orbit");
  const quiet = prospects.filter((p) => p.state === "low_orbit");
  await updateState((s) => {
    s.prospects = prospects.map((p) => ({
      ...p,
      state: p.state === "low_orbit" ? "low_orbit" : "cold",
      topics: [],
      formats: [],
      influencers: [],
    }));
  });
  await crew(
    "resolver",
    "done",
    `${hot.length} hot · ${quiet.length} low-orbit — contact data waits for intent`
  );

  // Low-orbit path IS email: fetch their emails right away (JIT rule).
  for (const p of quiet) {
    enrichContact({
      id: p.id,
      name: p.prospect.name,
      company: p.prospect.company,
      linkedin_url: p.prospect.linkedin_url,
    }).then((c) =>
      updateState((s) => {
        const target = s.prospects.find((x) => x.id === p.id);
        if (target && c.email) target.contact.emails = [c.email];
      })
    );
  }

  // ── Listener: one subagent per hot prospect, in parallel (world models)
  await crew("listener", "running", `deep-scraping ${hot.length} hot prospects (LinkedIn + X)…`);
  for (const p of hot) {
    await sleep(mock ? 2200 : 800);
    const full = prospects.find((x) => x.id === p.id)!;
    await updateState((s) => {
      const target = s.prospects.find((x) => x.id === p.id);
      if (target) {
        target.topics = full.topics;
        target.formats = full.formats;
        target.influencers = full.influencers;
        target.behavior = full.behavior;
        target.state = "modeled";
      }
    });
    await crew("listener", "running", `world model built: ${p.prospect.name}`);
    // The spoken web: web search finds appearances, Gradium STT transcribes.
    // Real mode: findMediaAppearances() + transcribe(); mock shows Jane's.
    if (p.id === "jane-kowalski") {
      await crew(
        "listener",
        "running",
        "podcast found: Outbound Radio ep.42 → gradium transcript mined for stances"
      );
    }
  }
  await crew(
    "listener",
    "running",
    "media mix analyzed: carousels lead for 2 of 3 buyers, text for one"
  );
  await sleep(mock ? 900 : 200);
  await crew("listener", "done", `${hot.length} Buyer World Models, every claim with evidence`);

  // ── Strategist: Gravity Map → taste cohorts → the week's plan
  await crew("strategist", "running", "synthesizing the Gravity Map across the ICP…");
  await sleep(mock ? 2500 : 500);
  await updateState((s) => {
    s.gravity_map = FIXTURE_GRAVITY_MAP; // real mode: generateJSON(GRAVITY_MAP_SYSTEM,…) on MODEL_DEEP
  });
  // Cluster world models into taste cohorts: one post serves a cohort,
  // not a person — and performance gets scored per cohort.
  await crew("strategist", "running", "clustering 3 world models → 2 taste cohorts (+1 quiet)…");
  await sleep(mock ? 1600 : 300);
  await updateState((s) => {
    s.cohorts = fixtureCohorts();
  });
  await updateBrain((b) =>
    decide(
      b,
      "target content at taste cohorts, not individuals",
      "chart skeptics (2 buyers) and systems thinkers (1) reward different formats — one post per cohort beats one post per person"
    )
  );
  await crew("strategist", "running", "drafting the gravity plan: posts · comments · micro-actions…");
  await sleep(mock ? 2500 : 500);
  const gated = await evalGate(fixturePlan(), "strategist");
  await updateState((s) => {
    s.plan = gated;
  });
  await updateBrain((b) =>
    decide(b, "week-1 plan: tactical charts + influencer comments", "6/10 targets reward that format (world-model evidence)")
  );
  await crew("strategist", "done", "5-day plan ready — evals passed, familiarity ladder sequenced");

  // ── Radar: armed, watching
  await crew("radar", "running", "watching your posts for target engagement…");
  await updateState((s) => {
    s.run_done = true;
  });
}

// EVAL GATE — the quality loop: score every draft against the rubric
// (their format, our voice, evidence, no slop); failures get one bounded
// revision and a re-score. Nothing ships under threshold silently.
async function evalGate(
  items: import("@/lib/types").PlanItem[],
  agent: CrewAgent
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
      await updateState((s) => {
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
// Mock: advances the scripted beats. Real: apify postEngagement() on
// published post URLs, matched against the target list the same way.
export async function radarScan(): Promise<string> {
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
  };
  await updateState((s) => {
    s.warm.unshift(card);
    s.log.push({ at: new Date().toISOString(), agent: "radar", msg: `${st.name} fits the ICP — your post just sourced a prospect you never prospected. Enriching…` });
  });
  const contact = await enrichContact({ id, name: st.name, company: st.company, linkedin_url: st.linkedin_url });
  const drafts = await draftOutreach(st.name, st.title, event.quote ?? "", null);
  await updateState((s) => {
    const c = s.warm.find((w) => w.id === card.id);
    if (c) {
      c.enriching = false;
      c.email = contact.email;
      c.phone = contact.phone;
      c.email_draft = drafts.email;
      c.connect_note = drafts.note;
    }
  });
  void draftPitchBrief(card.id); // brief is ready before any call or email
  return `Serendipity: ${st.name} (${st.company}) engaged, fits ICP → added to warm queue`;
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

  const contact = await enrichContact({
    id: prospectId,
    name: p.prospect.name,
    company: p.prospect.company,
    linkedin_url: p.prospect.linkedin_url,
  });
  const drafts = await draftOutreach(p.prospect.name, p.prospect.title, quote ?? "", p);
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
      `Revise this ${item.channel} ${item.type} draft per the user's note. Keep our tone of voice and the original angle.\n\nBRAIN:\n${brainDigest(brain)}\n\nDRAFT:\n${item.draft}\n\nUSER NOTE: ${note}\n\nReturn ONLY the revised draft.`,
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
      `Prospect: ${name}, ${title}.\nTheir engagement: "${quote}"\nWorld model: ${JSON.stringify({ topics: model.topics, formats: model.formats })}\n\nReturn the email, then '---', then the connection note.`,
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
      `Create a tailored pitch brief (a compact deck outline, 5 sections max) for ${card.name}, ${card.title}. Their engagement with us: "${quote || "reacted to our post"}". World model: ${JSON.stringify({ topics: model.topics, formats: model.formats, behavior: model.behavior })}. Product: ${s.input.product_summary}. Open on THEIR words/stance, mirror the formats they reward, end with a 20-minute working-session ask. Plain text, numbered sections.`,
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
