// Demo fixtures — the cached world Gravity runs on when no API keys are set.
// All people and companies are fictional. Evidence URLs are illustrative.

import {
  BuyerWorldModel,
  EngagementEvent,
  GravityMap,
  PlanItem,
} from "@/lib/types";

export const FIXTURE_WEBSITE = "loopwell.io";

export const FIXTURE_SUMMARY =
  "Loopwell sells outbound-QA software that scores every SDR email and call against what actually gets replies, for B2B sales teams of 10–200 reps.";

export const FIXTURE_TARGETS = [
  "aquila-systems.com",
  "bluenote.io",
  "cordalabs.com",
  "veltis.fr",
  "nordwind.de",
];

const li = (slug: string) => `https://www.linkedin.com/in/${slug}`;
const post = (slug: string) => `https://www.linkedin.com/posts/${slug}`;

export function fixtureProspects(): BuyerWorldModel[] {
  return [
    {
      id: "jane-kowalski",
      prospect: {
        name: "Jane Kowalski",
        title: "VP Sales",
        company: "Aquila Systems",
        linkedin_url: li("janekowalski"),
        x_handle: "@janekowalski",
      },
      contact: { emails: [], phones: [] }, // JIT — bought only at Warm
      signals: [
        { type: "hiring", detail: "Aquila opened 12 SDR roles in 6 weeks", source: "sillage" },
        { type: "keyword", detail: "\"outbound efficiency\" matched on 3 exec posts", source: "sillage" },
      ],
      topics: [
        {
          topic: "SDR productivity",
          stance: "believes generic AI made outbound worse, not better",
          evidence: [post("janekowalski_sdr-productivity-7318"), post("janekowalski_ai-outbound-7302")],
        },
        {
          topic: "reply-rate collapse",
          stance: "publicly shares her team's falling reply metrics",
          evidence: [post("janekowalski_replyrates-7290")],
        },
        {
          topic: "spammy automation",
          stance: "openly hostile — comments against bulk AI sequencers",
          evidence: [post("outboundwire_spam-debate-7255?commentUrn=jane")],
        },
      ],
      formats: ["tactical_charts", "numbered_lists", "contrarian_takes"],
      influencers: [
        {
          name: "J. Founder (OutboundWire)",
          why: "she commented on 4 of his last 6 posts",
          evidence: [post("outboundwire_spam-debate-7255?commentUrn=jane")],
        },
        {
          name: "Mara Vidal (RevOps Weekly)",
          why: "reacts to nearly every RevOps benchmark she publishes",
          evidence: [li("janekowalski") + "/recent-activity/reactions/"],
        },
      ],
      behavior: "commenter",
      gravity_score: 0,
      heat: 89,
      state: "modeled",
      engagement_events: [],
    },
    {
      id: "tom-reyes",
      prospect: {
        name: "Tom Reyes",
        title: "CRO",
        company: "Bluenote",
        linkedin_url: li("tomreyes"),
        x_handle: "@treyes_gtm",
      },
      contact: { emails: [], phones: [] },
      signals: [
        { type: "job_change", detail: "joined Bluenote as CRO 5 weeks ago", source: "sillage" },
        { type: "competitor", detail: "engaged with SalesForge content twice this month", source: "sillage" },
      ],
      topics: [
        {
          topic: "rebuilding outbound from scratch",
          stance: "new CRO auditing everything his team sends",
          evidence: [post("tomreyes_new-playbook-8811")],
        },
        {
          topic: "pipeline quality over volume",
          stance: "argues for fewer, better-researched touches",
          evidence: ["https://x.com/treyes_gtm/status/2211", "https://x.com/treyes_gtm/status/2189"],
        },
      ],
      formats: ["short_contrarian_posts", "before_after_numbers"],
      influencers: [
        {
          name: "J. Founder (OutboundWire)",
          why: "follows him on X, quote-posted him twice",
          evidence: ["https://x.com/treyes_gtm/status/2201"],
        },
      ],
      behavior: "poster",
      gravity_score: 0,
      heat: 71,
      state: "modeled",
      engagement_events: [],
    },
    {
      id: "priya-nair",
      prospect: {
        name: "Priya Nair",
        title: "Head of RevOps",
        company: "Corda Labs",
        linkedin_url: li("priyanair-revops"),
        x_handle: "@priya_rev",
      },
      contact: { emails: [], phones: [] },
      signals: [
        { type: "hiring", detail: "Corda hiring first dedicated RevOps analyst", source: "sillage" },
      ],
      topics: [
        {
          topic: "AI workflow automation",
          stance: "shares agent-workflow breakdowns weekly",
          evidence: [post("priyanair_ai-workflows-5521")],
        },
        {
          topic: "CRM hygiene",
          stance: "complains about rep-entered data quality",
          evidence: [post("priyanair_crm-hygiene-5490")],
        },
      ],
      formats: ["diagrams", "step_by_step_threads"],
      influencers: [
        {
          name: "Mara Vidal (RevOps Weekly)",
          why: "reposts her benchmarks with commentary",
          evidence: [li("priyanair-revops") + "/recent-activity/"],
        },
      ],
      behavior: "poster",
      gravity_score: 0,
      heat: 64,
      state: "modeled",
      engagement_events: [],
    },
    {
      id: "marc-delacroix",
      prospect: {
        name: "Marc Delacroix",
        title: "VP Sales",
        company: "Veltis",
        linkedin_url: li("marcdelacroix"),
        x_handle: "",
      },
      contact: { emails: [], phones: [] }, // low-orbit: email fetched immediately by pipeline
      signals: [
        { type: "champion", detail: "past champion of yours moved into his org", source: "sillage" },
      ],
      topics: [],
      formats: [],
      influencers: [],
      behavior: "lurker",
      gravity_score: 0,
      heat: 12,
      state: "low_orbit",
      engagement_events: [],
    },
    {
      id: "hana-sato",
      prospect: {
        name: "Hana Sato",
        title: "CRO",
        company: "Nordwind",
        linkedin_url: li("hanasato"),
        x_handle: "",
      },
      contact: { emails: [], phones: [] },
      signals: [],
      topics: [],
      formats: [],
      influencers: [],
      behavior: "lurker",
      gravity_score: 0,
      heat: 8,
      state: "low_orbit",
      engagement_events: [],
    },
  ];
}

export const FIXTURE_GRAVITY_MAP: GravityMap = {
  summary:
    "Your ICP is mid-market sales leadership having one shared conversation: outbound volume stopped working and generic AI made it worse. They reward tactical, numbers-first content and punish anything that smells like automation. The conversation happens in the comment sections of two people: J. Founder (OutboundWire) and Mara Vidal (RevOps Weekly).",
  themes: [
    {
      theme: "Generic AI broke outbound",
      who: ["Jane Kowalski", "Tom Reyes"],
      evidence: [post("janekowalski_ai-outbound-7302"), "https://x.com/treyes_gtm/status/2211"],
    },
    {
      theme: "Quality-per-touch over volume",
      who: ["Tom Reyes", "Priya Nair"],
      evidence: [post("tomreyes_new-playbook-8811"), post("priyanair_ai-workflows-5521")],
    },
    {
      theme: "Ops hygiene as revenue lever",
      who: ["Priya Nair", "Jane Kowalski"],
      evidence: [post("priyanair_crm-hygiene-5490")],
    },
  ],
  watering_holes: [
    "J. Founder's comment section (OutboundWire)",
    "Mara Vidal's RevOps benchmarks",
    "#outbound on X, Tuesday mornings",
  ],
};

export function fixturePlan(): PlanItem[] {
  return [
    {
      id: "p-mon-react",
      day: "Mon",
      type: "react",
      channel: "linkedin",
      title: "React to Mara Vidal's benchmark post",
      draft: "",
      why: "Jane and Priya both engage with Mara weekly — first rung of the familiarity ladder.",
      evidence: [li("janekowalski") + "/recent-activity/reactions/"],
      link: post("maravidal_benchmarks-3301"),
      done: false,
    },
    {
      id: "p-tue-post",
      day: "Tue",
      type: "post",
      channel: "linkedin",
      title: "Publish: the SDR productivity chart",
      draft:
        "3 reasons SDR productivity collapsed after everyone adopted generic AI:\n\n1. Reply rates fell 40% — every inbox reads identical now\n2. Reps spend saved time on MORE volume, not better research\n3. QA disappeared: nobody scores what the AI actually sends\n\nWe measured this across 40 teams. Chart below. What are you seeing?",
      why: "6/10 of your targets engaged with tactical charts about SDR productivity this month — this is that format, on that topic, tied to your product narrative.",
      evidence: [post("janekowalski_sdr-productivity-7318"), "https://x.com/treyes_gtm/status/2211"],
      variant: "A",
      done: false,
    },
    {
      id: "p-tue-comment",
      day: "Tue",
      type: "comment",
      channel: "linkedin",
      title: "Comment on J. Founder's spam-debate post",
      draft:
        "The hidden cost here is QA. Teams automated the sending but nobody automated the checking — so bad messaging now ships at 10x speed. The teams still getting replies are the ones scoring every touch before it goes out.",
      why: "Jane and Tom both engage with him; you appear inside their feed before you ever post at them.",
      evidence: [post("outboundwire_spam-debate-7255")],
      link: post("outboundwire_spam-debate-7255"),
      done: false,
    },
    {
      id: "p-wed-follow",
      day: "Wed",
      type: "follow",
      channel: "x",
      title: "Follow @treyes_gtm and @priya_rev on X",
      draft: "",
      why: "Second rung: they see your name before your content. Both check follower notifications (recent-follower engagement pattern).",
      evidence: ["https://x.com/treyes_gtm/status/2189"],
      link: "https://x.com/treyes_gtm",
      done: false,
    },
    {
      id: "p-wed-post-x",
      day: "Wed",
      type: "post",
      channel: "x",
      title: "Publish: before/after numbers thread",
      draft:
        "We audited 12,000 SDR emails.\n\nBefore AI tools: 4.1% reply rate\nAfter: 2.3%\n\nThe tools aren't the problem. Shipping without QA is. Fewer, scored, researched touches beat volume every time. Numbers in thread 🧵",
      why: "Tom's format exactly — short, contrarian, before/after numbers. He posts and engages on X Wednesday mornings.",
      evidence: ["https://x.com/treyes_gtm/status/2211"],
      variant: "B",
      done: false,
    },
    {
      id: "p-thu-connect",
      day: "Thu",
      type: "connect",
      channel: "linkedin",
      title: "Connect with Tom Reyes (+ note)",
      draft:
        "Tom — your point about auditing everything the team sends before scaling volume matched what we measured across 40 teams almost word for word. No pitch; just think you'd find the data interesting.",
      why: "He's new in seat (5 weeks), rebuilding the playbook, and has now seen you twice this week. Third rung of the ladder.",
      evidence: [post("tomreyes_new-playbook-8811")],
      link: li("tomreyes"),
      done: false,
    },
    {
      id: "p-fri-comment",
      day: "Fri",
      type: "comment",
      channel: "linkedin",
      title: "Comment on Priya's workflow diagram",
      draft:
        "This maps. One addition from our data: the QA step is where most agent workflows quietly fail — everyone automates generation, almost nobody automates checking. Your step 4 is the whole game.",
      why: "Priya reposts diagram commentary; RevOps is your economic buyer's right hand.",
      evidence: [post("priyanair_ai-workflows-5521")],
      link: post("priyanair_ai-workflows-5521"),
      done: false,
    },
  ];
}

// Scripted engagement for mock Radar scans — one beat per scan click.
export interface EngagementBeat {
  prospectId: string | null; // null → serendipity stranger
  stranger?: { name: string; title: string; company: string; linkedin_url: string };
  event: EngagementEvent;
}

export const ENGAGEMENT_SCRIPT: EngagementBeat[] = [
  {
    prospectId: "tom-reyes",
    event: { post_id: "p-tue-post", kind: "reaction", at: "", quote: "" },
  },
  {
    prospectId: null,
    stranger: {
      name: "Lena Fischer",
      title: "Head of Sales",
      company: "Skylark Data",
      linkedin_url: li("lenafischer-sales"),
    },
    event: {
      post_id: "p-tue-post",
      kind: "comment",
      at: "",
      quote: "Number 3 is painfully accurate. Sharing this with my team.",
    },
  },
  {
    prospectId: "tom-reyes",
    event: { post_id: "p-wed-post-x", kind: "reaction", at: "", quote: "" },
  },
  {
    prospectId: "jane-kowalski",
    event: {
      post_id: "p-tue-post",
      kind: "comment",
      at: "",
      quote: "This. Exactly this. The QA gap is exactly what we're fighting internally.",
    },
  },
];

// JIT enrichment results (what FullEnrich returns at the Warm trigger)
export const FIXTURE_CONTACTS: Record<string, { email: string; phone: string }> = {
  "jane-kowalski": { email: "jane.kowalski@aquila-systems.com", phone: "+33 6 12 34 56 78" },
  "tom-reyes": { email: "t.reyes@bluenote.io", phone: "+1 (415) 555-0182" },
  "priya-nair": { email: "priya@cordalabs.com", phone: "+44 7700 900123" },
  "marc-delacroix": { email: "m.delacroix@veltis.fr", phone: "" },
  "hana-sato": { email: "h.sato@nordwind.de", phone: "" },
  "lena-fischer": { email: "lena.fischer@skylarkdata.com", phone: "+49 151 12345678" },
};
