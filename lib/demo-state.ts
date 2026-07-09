import {
  ENGAGEMENT_SCRIPT,
  FIXTURE_CONTACTS,
  FIXTURE_GRAVITY_MAP,
  FIXTURE_SUMMARY,
  FIXTURE_TARGETS,
  FIXTURE_WEBSITE,
  fixturePlan,
  fixtureProspects,
} from "@/data/fixtures";
import {
  AppState,
  BuyerWorldModel,
  EngagementEvent,
  PlanItem,
  WARM_TRIGGER,
  WarmCard,
  emptyCrew,
  emptyState,
} from "@/lib/types";

export const DEMO_RADAR_COOKIE = "gravity_radar_scans";

function demoPlan(): PlanItem[] {
  return fixturePlan().map((item) => ({
    ...item,
    eval: item.draft
      ? { score: 100, notes: ["their format", "our voice", "evidence-backed"] }
      : { score: 100, notes: ["action item"] },
  }));
}

function outreach(name: string, quote = "") {
  const first = name.split(" ")[0];
  const hook = quote
    ? `your comment on yesterday's post ("${quote.slice(0, 60)}...")`
    : "your reaction to yesterday's post";
  return {
    email: `Subject: the QA gap\n\nHi ${first} - ${hook} matches what we measured across 40 teams: everyone automated the sending, nobody automated the checking. Worth 20 minutes next week to compare notes?\n\n- Alex @ Loopwell`,
    note: `${first} - enjoyed your take on yesterday's thread. We're working on that QA gap. Happy to swap notes.`,
  };
}

function warmCard(
  p: BuyerWorldModel,
  event: EngagementEvent,
  serendipity = false
): WarmCard {
  const contact = FIXTURE_CONTACTS[p.id] ?? { email: "", phone: "" };
  const draft = outreach(p.prospect.name, event.quote);
  return {
    id: `warm-${p.id}`,
    prospectId: serendipity ? "" : p.id,
    name: p.prospect.name,
    title: `${p.prospect.title} @ ${p.prospect.company}`,
    event,
    enriching: false,
    email: contact.email,
    phone: contact.phone,
    email_draft: draft.email,
    connect_note: draft.note,
    serendipity,
    sent: false,
    meeting: false,
  };
}

function applyRadarScans(state: AppState, scans: number) {
  for (const beat of ENGAGEMENT_SCRIPT.slice(0, scans)) {
    const at = new Date().toISOString();
    const event = { ...beat.event, at };

    if (!beat.prospectId) {
      const stranger = beat.stranger!;
      const id = stranger.name.toLowerCase().replace(/[^a-z]+/g, "-");
      const p: BuyerWorldModel = {
        id,
        prospect: {
          name: stranger.name,
          title: stranger.title,
          company: stranger.company,
          linkedin_url: stranger.linkedin_url,
          x_handle: "",
        },
        contact: { emails: [], phones: [] },
        signals: [],
        topics: [],
        formats: ["tactical_charts"],
        media: [{ kind: "carousel", share: 0.6 }, { kind: "image", share: 0.4 }],
        influencers: [],
        behavior: "commenter",
        gravity_score: 18,
        heat: 62,
        state: "warm",
        engagement_events: [event],
      };
      state.warm.unshift(warmCard(p, event, true));
      state.log.push({
        at,
        agent: "radar",
        msg: `${stranger.name} engaged - not on the list. ICP fit -> warm queue`,
      });
      continue;
    }

    const p = state.prospects.find((x) => x.id === beat.prospectId);
    if (!p) continue;
    p.engagement_events.push(event);
    p.gravity_score += event.kind === "comment" ? 18 : 8;
    const comments = p.engagement_events.filter((e) => e.kind === "comment").length;
    const reactions = p.engagement_events.filter((e) => e.kind === "reaction").length;
    const becameWarm =
      p.state !== "warm" &&
      (comments >= WARM_TRIGGER.comments || reactions >= WARM_TRIGGER.reactions);
    p.state = becameWarm ? "warm" : "engaged";
    state.log.push({
      at,
      agent: "radar",
      msg: `${p.prospect.name} ${event.kind === "comment" ? "commented on" : "reacted to"} your post`,
    });
    if (becameWarm) state.warm.unshift(warmCard(p, event));
  }
}

export function demoState(scans = 0): AppState {
  const state = emptyState();
  const prospects = fixtureProspects();
  for (const p of prospects) {
    const contact = FIXTURE_CONTACTS[p.id];
    if (p.state === "low_orbit" && contact?.email) p.contact.emails = [contact.email];
  }

  state.input = {
    website: FIXTURE_WEBSITE,
    product_summary: FIXTURE_SUMMARY,
    targets: FIXTURE_TARGETS,
  };
  state.crew = emptyCrew().map((c) => ({
    ...c,
    status: "done",
    note:
      c.agent === "radar"
        ? "watching engagement"
        : c.agent === "strategist"
          ? "5-day plan ready"
          : "demo fixtures ready",
  }));
  state.prospects = prospects;
  state.gravity_map = FIXTURE_GRAVITY_MAP;
  state.plan = demoPlan();
  state.run_started_at = new Date().toISOString();
  state.run_done = true;
  state.mock = true;
  state.log = [
    { at: new Date().toISOString(), agent: "scout", msg: "product narrative locked" },
    { at: new Date().toISOString(), agent: "resolver", msg: "5 buyers mapped" },
    { at: new Date().toISOString(), agent: "strategist", msg: "5-day plan ready" },
  ];
  applyRadarScans(state, Math.max(0, Math.min(scans, ENGAGEMENT_SCRIPT.length)));
  return state;
}

export function demoRadarResult(scans: number): string {
  const beat = ENGAGEMENT_SCRIPT[scans];
  if (!beat) return "No new engagement since last scan.";
  if (!beat.prospectId) {
    return `Serendipity: ${beat.stranger!.name} (${beat.stranger!.company}) engaged, fits ICP -> added to warm queue`;
  }
  const name = fixtureProspects().find((p) => p.id === beat.prospectId)?.prospect.name;
  return `${name ?? "A target"} ${
    beat.event.kind === "comment" ? `commented: "${beat.event.quote}"` : "reacted to your post"
  }`;
}
