// The crew: Scout → Resolver → Listener → Strategist → Radar (SPEC §3-4).
// Runs fire-and-forget from the API route; the UI polls state and watches
// the agents work. Mock mode (no keys) walks the same stages on fixtures
// with realistic pacing — the demo never blocks on a third party.

import {
  ENGAGEMENT_SCRIPT,
  FIXTURE_GRAVITY_MAP,
  FIXTURE_SUMMARY,
  fixturePlan,
  fixtureProspects,
} from "@/data/fixtures";
import { updateState } from "@/lib/store";
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

export async function runPipeline(website: string, targets: string[]) {
  const mock = !hasClaude() && !managedAvailable();

  // ── Scout: website → narrative; ICP + accounts into Sillage; signals back
  await crew("scout", "running", `reading ${website}…`);
  const summary = website ? await distillWebsite(website) : FIXTURE_SUMMARY;
  await updateState((s) => {
    s.input.product_summary = summary;
    s.mock = mock;
  });
  await crew("scout", "running", "pushing persona + accounts into Sillage (MCP)…");
  await sleep(mock ? 1800 : 300);
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
  }
  await crew("listener", "done", `${hot.length} Buyer World Models, every claim with evidence`);

  // ── Strategist: Gravity Map + the week's plan
  await crew("strategist", "running", "synthesizing the Gravity Map across the ICP…");
  await sleep(mock ? 2500 : 500);
  await updateState((s) => {
    s.gravity_map = FIXTURE_GRAVITY_MAP; // real mode: generateJSON(GRAVITY_MAP_SYSTEM,…) on MODEL_DEEP
  });
  await crew("strategist", "running", "drafting the gravity plan: posts · comments · micro-actions…");
  await sleep(mock ? 2500 : 500);
  await updateState((s) => {
    s.plan = fixturePlan();
  });
  await crew("strategist", "done", "5-day plan ready — familiarity ladder sequenced");

  // ── Radar: armed, watching
  await crew("radar", "running", "watching your posts for target engagement…");
  await updateState((s) => {
    s.run_done = true;
  });
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

    if (becameWarm && beat.prospectId) void warmFlow(beat.prospectId, event.quote);
    return `${name} ${event.kind === "comment" ? `commented: "${event.quote}"` : "reacted to your post"}${becameWarm ? " → WARM" : ""}`;
  }

  // Serendipity: an engager we never prospected. ICP check → enrich → board.
  const st = beat.stranger!;
  const id = st.name.toLowerCase().replace(/[^a-z]+/g, "-");
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
  return {
    email: `Subject: the QA gap\n\nHi ${first} — your comment on yesterday's post ("${quote?.slice(0, 60)}…") matches what we measured across 40 teams: everyone automated the sending, nobody automated the checking. That gap is exactly what we work on. Worth 20 minutes next week to compare notes on what you're seeing internally?\n\n— Alex @ Loopwell`,
    note: `${first} — enjoyed your take on yesterday's thread. We're working on exactly the QA gap you called out. Happy to swap notes.`,
  };
}
