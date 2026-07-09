// Gravity data model — mirrors SPEC.md §6. One shape, read by everything.

export type SignalType =
  | "job_change"
  | "champion"
  | "hiring"
  | "competitor"
  | "keyword"
  | "funding";

export type ProspectState =
  | "cold"
  | "low_orbit"
  | "modeled"
  | "engaged"
  | "warm"
  | "in_conversation";

export type Behavior = "poster" | "commenter" | "lurker";

export interface Signal {
  type: SignalType;
  detail: string;
  source: "sillage";
}

export interface Topic {
  topic: string;
  stance: string;
  evidence: string[]; // URLs — no claim without evidence (anti-slop rule)
}

export interface Influencer {
  name: string;
  why: string;
  evidence: string[];
}

// The MEDIUM a buyer rewards — LinkedIn exposes post types (text, image,
// document/carousel, video, poll); X exposes media entities. Analyzed from
// what they engage with, not what they claim.
export type MediaKind = "text" | "image" | "carousel" | "video" | "poll";

export interface MediaTaste {
  kind: MediaKind;
  share: number; // 0..1 of their engagements on this medium
}

export interface EngagementEvent {
  post_id: string;
  kind: "reaction" | "comment";
  at: string; // ISO
  quote?: string; // comment text, verbatim
}

export interface BuyerWorldModel {
  id: string;
  prospect: {
    name: string;
    title: string;
    company: string;
    linkedin_url: string;
    x_handle: string;
  };
  contact: { emails: string[]; phones: string[] }; // FullEnrich — filled just-in-time
  signals: Signal[];
  topics: Topic[];
  formats: string[]; // what they reward
  media: MediaTaste[]; // which media types they engage with
  influencers: Influencer[];
  behavior: Behavior;
  gravity_score: number; // rises per engagement event
  heat: number; // social activity: recency × frequency (0-100)
  state: ProspectState;
  engagement_events: EngagementEvent[];
}

export type PlanActionType =
  | "post"
  | "blog" // long-form — anchors the week's feed posts
  | "comment"
  | "follow"
  | "react"
  | "connect";

export interface PlanItem {
  id: string;
  day: "Mon" | "Tue" | "Wed" | "Thu" | "Fri";
  type: PlanActionType;
  channel: "linkedin" | "x";
  title: string;
  draft: string; // the content to copy — post text, comment, connect note
  why: string; // evidence-based rationale shown in UI
  evidence: string[];
  link?: string; // deep link the human clicks (profile, post)
  variant?: "A" | "B";
  cohort?: string; // which taste cohort this action targets
  media?: string; // the medium chosen for the cohort (carousel, text, …)
  done: boolean;
  eval?: { score: number; notes: string[] }; // the quality gate's verdict
  user_note?: string; // human steering — becomes a brain learning
  revised?: boolean;
}

// A taste cohort: buyers who reward the same formats and topics. Content
// targets a cohort, not a person — one post works many buyers at once —
// and performance is scored per cohort.
export interface Cohort {
  id: string;
  name: string;
  taste: string; // the shared taste signature, one line
  format: string; // what this cohort rewards
  members: string[]; // prospect ids (serendipity engagers join too)
  engagements: number;
  warm: number;
  recent_moves?: string[]; // members re-seated here in the last learning cycle
}

export interface GravityMapTheme {
  theme: string;
  who: string[]; // prospect names inside this conversation
  evidence: string[];
}

export interface GravityMap {
  summary: string;
  themes: GravityMapTheme[];
  watering_holes: string[]; // where the ICP's conversation happens
}

export type CrewAgent = "scout" | "resolver" | "listener" | "strategist" | "radar";

export interface CrewStatus {
  agent: CrewAgent;
  status: "idle" | "running" | "done";
  note: string;
}

export interface WarmCard {
  id: string;
  prospectId: string; // "" when serendipity engager not yet on the board
  name: string;
  title: string;
  event: EngagementEvent;
  enriching: boolean; // JIT FullEnrich in flight
  email?: string;
  phone?: string;
  email_draft: string;
  connect_note: string;
  call_script?: string; // Step 8 — call after in-feed familiarity exists
  serendipity: boolean; // engager we never prospected — ICP-fit stranger
  sent: boolean;
  called?: boolean;
  meeting: boolean; // booked — the success metric: prospect → meeting
  pitch_brief?: string; // tailored per-lead pitch outline (→ Gamma deck)
}

export interface LogLine {
  at: string;
  agent: CrewAgent | "system";
  msg: string;
}

export interface AppState {
  input: {
    website: string;
    product_summary: string;
    targets: string[];
    own_handles?: string; // your socials — tone-of-voice source
    own_post_urls?: string[]; // published posts Radar should scan
  };
  crew: CrewStatus[];
  prospects: BuyerWorldModel[];
  cohorts: Cohort[];
  gravity_map: GravityMap | null;
  plan: PlanItem[];
  warm: WarmCard[];
  log: LogLine[];
  run_started_at?: string;
  run_done: boolean;
  mock: boolean; // true when running on fixtures (no API keys)
}

export const WARM_TRIGGER = {
  comments: 1,
  reactions: 2,
} as const;

export function emptyCrew(): CrewStatus[] {
  return (["scout", "resolver", "listener", "strategist", "radar"] as const).map(
    (agent) => ({ agent, status: "idle", note: "" })
  );
}

export function emptyState(): AppState {
  return {
    input: { website: "", product_summary: "", targets: [] },
    crew: emptyCrew(),
    prospects: [],
    cohorts: [],
    gravity_map: null,
    plan: [],
    warm: [],
    log: [],
    run_done: false,
    mock: true,
  };
}
