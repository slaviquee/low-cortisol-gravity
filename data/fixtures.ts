// Demo fixtures: the cached public-demo world Gravity runs on when no API keys are set.
// Accounts are real public company targets represented in the room. Contact values use
// reserved .example addresses so the demo never implies private scraping.

import {
  BuyerWorldModel,
  Cohort,
  EngagementEvent,
  GravityMap,
  PlanItem,
} from "@/lib/types";

export const FIXTURE_WEBSITE = "gravity-demo.example";

export const FIXTURE_SUMMARY =
  "Gravity is a GTM agent that maps the public information bubble around target buyers, builds familiarity with content and micro-actions, then drafts outreach only after real engagement.";

// Tone of voice - learned from YOUR own posts (mock of the voice analysis).
export const VOICE_PROFILE = [
  "direct, operator-grade, no filler",
  "short sentences. no emoji, no hashtags",
  "evidence before claims; cite the source trail",
  "contrarian only when it changes the GTM decision",
];

export const FIXTURE_ICP =
  "AI-native GTM, marketing, and RevOps leaders selling into enterprise buyers who need trust before outreach";

export const FIXTURE_TARGETS = [
  "gamma.app",
  "nabla.com",
  "airtable.com",
  "foundever.com",
  "edenred.com",
];

const SOURCE = {
  gamma: "https://gamma.app/",
  gammaApi: "https://gamma.app/products/api",
  nabla: "https://www.nabla.com/",
  nablaNejm:
    "https://www.nabla.com/press-release/nejm-ai-trial-reports-efficiency-gains-for-physicians-using-nablas-ambient-ai-assistant",
  airtable: "https://www.airtable.com/",
  airtableAi:
    "https://www.airtable.com/newsroom/introducing-the-ai-native-airtable",
  airtableSuperagent:
    "https://www.airtable.com/newsroom/introducing-superagent",
  foundever: "https://foundever.com/",
  foundeverLeadership: "https://foundever.com/about/leadership/",
  edenred: "https://www.edenred.com/en/group/edenred-brief",
  sillage: "https://www.getsillage.com/",
  fullenrich: "https://fullenrich.com/",
};

export function fixtureProspects(): BuyerWorldModel[] {
  return [
    {
      id: "olivia-frenkel",
      prospect: {
        name: "Olivia Frenkel",
        title: "GTM",
        company: "Gamma",
        linkedin_url: SOURCE.gamma,
        x_handle: "",
      },
      contact: { emails: [], phones: [] },
      signals: [
        {
          type: "keyword",
          detail:
            "Sillage ranked Gamma high-fit: AI presentations, docs, websites, social content, and API creation all map to Gravity's content-to-outreach loop",
          source: "sillage",
        },
        {
          type: "champion",
          detail:
            "Gamma-style deck output is the natural pitch artifact once a buyer engages",
          source: "sillage",
        },
      ],
      topics: [
        {
          topic: "AI-native presentations and product storytelling",
          stance:
            "Rewards visual product stories that make the idea obvious fast, not long narrative setup.",
          evidence: [SOURCE.gamma, SOURCE.gammaApi],
        },
        {
          topic: "Content created at platform speed",
          stance:
            "The useful unit is not just a post; it can become a deck, document, website, API asset, or social creative.",
          evidence: [SOURCE.gamma],
        },
        {
          topic: "Product-led GTM artifacts",
          stance:
            "A warm pitch should become a compact artifact the buyer can inspect, share, and react to.",
          evidence: [SOURCE.gammaApi],
        },
      ],
      formats: ["visual_storytelling", "short_demo_posts", "mini_decks"],
      media: [
        { kind: "carousel", share: 0.48 },
        { kind: "image", share: 0.34 },
        { kind: "text", share: 0.18 },
      ],
      influencers: [
        {
          name: "Gamma product and creator community",
          why:
            "Gamma's public product surface rewards examples, templates, visual output, and fast creation loops.",
          evidence: [SOURCE.gamma],
        },
      ],
      behavior: "poster",
      gravity_score: 31,
      heat: 84,
      state: "modeled",
      engagement_events: [],
    },
    {
      id: "margaux-benoit",
      prospect: {
        name: "Margaux Benoit",
        title: "GTM Director",
        company: "Nabla",
        linkedin_url: SOURCE.nabla,
        x_handle: "",
      },
      contact: { emails: [], phones: [] },
      signals: [
        {
          type: "keyword",
          detail:
            "Sillage found healthcare AI fit: Nabla sells ambient AI into high-trust clinical workflows",
          source: "sillage",
        },
        {
          type: "competitor",
          detail:
            "Healthcare AI buyers need proof, workflow adoption, and trust before a direct pitch",
          source: "sillage",
        },
      ],
      topics: [
        {
          topic: "Workflow trust in healthcare AI",
          stance:
            "Healthcare AI adoption is won inside the clinician workflow, not by feature lists alone.",
          evidence: [SOURCE.nabla, SOURCE.nablaNejm],
        },
        {
          topic: "Clinical documentation burden",
          stance:
            "The strongest story is time returned to clinicians with quality and safety still visible.",
          evidence: [SOURCE.nabla, SOURCE.nablaNejm],
        },
        {
          topic: "Proof before persuasion",
          stance:
            "Trust-heavy categories reward studies, customer proof, and clear deployment facts before outreach.",
          evidence: [SOURCE.nablaNejm],
        },
      ],
      formats: ["evidence_backed_posts", "workflow_trust_threads", "customer_proof"],
      media: [
        { kind: "text", share: 0.44 },
        { kind: "carousel", share: 0.36 },
        { kind: "video", share: 0.2 },
      ],
      influencers: [
        {
          name: "Clinician proof and health-system evidence",
          why:
            "The public Nabla story centers on clinicians, deployment scale, efficiency, and research-backed outcomes.",
          evidence: [SOURCE.nabla, SOURCE.nablaNejm],
        },
      ],
      behavior: "commenter",
      gravity_score: 29,
      heat: 82,
      state: "modeled",
      engagement_events: [],
    },
    {
      id: "vincent-gonnot",
      prospect: {
        name: "Vincent Gonnot",
        title: "RVP EMEA",
        company: "Airtable",
        linkedin_url: SOURCE.airtableAi,
        x_handle: "",
      },
      contact: { emails: [], phones: [] },
      signals: [
        {
          type: "keyword",
          detail:
            "Sillage matched Airtable on enterprise AI workflows, app building, AI agents, and GTM execution",
          source: "sillage",
        },
        {
          type: "hiring",
          detail:
            "Enterprise GTM motion needs operational stories, not isolated AI content demos",
          source: "sillage",
        },
      ],
      topics: [
        {
          topic: "AI inside the operating system of work",
          stance:
            "AI is more credible when it lives inside workflows, data, permissions, and business apps.",
          evidence: [SOURCE.airtable, SOURCE.airtableAi],
        },
        {
          topic: "Enterprise reliability over vibe demos",
          stance:
            "Enterprise buyers reward proof that AI output connects to governed work, not just attractive prototypes.",
          evidence: [SOURCE.airtableAi],
        },
        {
          topic: "Agentic business workflows",
          stance:
            "The commercial story is AI executing repeated work across systems with humans still in control.",
          evidence: [SOURCE.airtableAi, SOURCE.airtableSuperagent],
        },
      ],
      formats: ["systems_diagrams", "enterprise_proof", "operator_narratives"],
      media: [
        { kind: "carousel", share: 0.42 },
        { kind: "text", share: 0.38 },
        { kind: "video", share: 0.2 },
      ],
      influencers: [
        {
          name: "Enterprise AI workflow builders",
          why:
            "Airtable's current public story ties AI agents, governed data, and operational systems together.",
          evidence: [SOURCE.airtableAi, SOURCE.airtableSuperagent],
        },
      ],
      behavior: "poster",
      gravity_score: 27,
      heat: 74,
      state: "modeled",
      engagement_events: [],
    },
    {
      id: "virginie-dupin",
      prospect: {
        name: "Virginie Dupin",
        title: "Chief Marketing Officer",
        company: "Foundever",
        linkedin_url: SOURCE.foundeverLeadership,
        x_handle: "",
      },
      contact: { emails: [], phones: [] },
      signals: [
        {
          type: "keyword",
          detail:
            "Sillage matched Foundever on global CX, multilingual support, customer care, and AI-enabled experience orchestration",
          source: "sillage",
        },
        {
          type: "champion",
          detail:
            "Global marketing leaders need brand-safe AI narratives that preserve human trust",
          source: "sillage",
        },
      ],
      topics: [
        {
          topic: "Human signal inside AI-powered CX",
          stance:
            "AI should reveal the human context earlier; it should not make customer communication feel anonymous.",
          evidence: [SOURCE.foundever, SOURCE.foundeverLeadership],
        },
        {
          topic: "Global brand consistency",
          stance:
            "Large CX brands reward messaging that can scale across markets while staying coherent and human.",
          evidence: [SOURCE.foundever],
        },
        {
          topic: "Trust across customer journeys",
          stance:
            "Customer-care markets care about credibility, privacy, empathy, and operational consistency.",
          evidence: [SOURCE.foundever],
        },
      ],
      formats: ["thought_leadership", "brand_trust_posts", "cx_examples"],
      media: [
        { kind: "text", share: 0.5 },
        { kind: "image", share: 0.28 },
        { kind: "video", share: 0.22 },
      ],
      influencers: [
        {
          name: "CX, brand, and AI transformation conversations",
          why:
            "Foundever's public pages put CX delivery, AI solutions, trust, and multilingual operations in the same buyer world.",
          evidence: [SOURCE.foundever, SOURCE.foundeverLeadership],
        },
      ],
      behavior: "commenter",
      gravity_score: 23,
      heat: 68,
      state: "modeled",
      engagement_events: [],
    },
    {
      id: "christa-dabilly",
      prospect: {
        name: "Christa Dabilly",
        title: "Head of Tech Stack for RevOps",
        company: "Edenred",
        linkedin_url: SOURCE.edenred,
        x_handle: "",
      },
      contact: { emails: [], phones: [] },
      signals: [
        {
          type: "keyword",
          detail:
            "Sillage matched Edenred on global platform scale, data and AI, benefits, mobility, payments, and complex stakeholder networks",
          source: "sillage",
        },
        {
          type: "champion",
          detail:
            "RevOps tech-stack ownership rewards source trails, CRM-ready state changes, and no enrichment before intent",
          source: "sillage",
        },
      ],
      topics: [
        {
          topic: "CRM hygiene and governance",
          stance:
            "The RevOps buyer needs every action to show source, score change, state, owner, and next step.",
          evidence: [SOURCE.edenred],
        },
        {
          topic: "Enterprise workflow orchestration",
          stance:
            "A platform-scale buyer will care less about one flashy post and more about repeatable data movement into CRM.",
          evidence: [SOURCE.edenred, SOURCE.sillage],
        },
        {
          topic: "Just-in-time enrichment",
          stance:
            "Contact data should be purchased only when there is a real reason to contact the buyer.",
          evidence: [SOURCE.fullenrich],
        },
      ],
      formats: ["source_trail_tables", "crm_ready_status", "governance_checklists"],
      media: [
        { kind: "text", share: 0.46 },
        { kind: "carousel", share: 0.34 },
        { kind: "image", share: 0.2 },
      ],
      influencers: [
        {
          name: "RevOps governance and CRM workflow operators",
          why:
            "Edenred scale makes attribution, data minimization, and CRM synchronization more persuasive than a cold-email demo.",
          evidence: [SOURCE.edenred, SOURCE.sillage, SOURCE.fullenrich],
        },
      ],
      behavior: "lurker",
      gravity_score: 18,
      heat: 52,
      state: "modeled",
      engagement_events: [],
    },
  ];
}

// Taste cohorts: buyers who reward the same things. One post serves a cohort,
// not a person; performance is scored per cohort.
export function fixtureCohorts(): Cohort[] {
  return [
    {
      id: "product-led-storytellers",
      name: "product-led storytellers",
      taste: "visual demos, compact artifacts, and product-led GTM stories",
      format: "visual_storytelling",
      members: ["olivia-frenkel", "vincent-gonnot"],
      engagements: 0,
      warm: 0,
    },
    {
      id: "trust-led-enterprise-ai",
      name: "trust-led enterprise AI",
      taste: "evidence, customer proof, workflow trust, and brand-safe AI narratives",
      format: "evidence_backed_posts",
      members: ["margaux-benoit", "virginie-dupin"],
      engagements: 0,
      warm: 0,
    },
    {
      id: "revops-governance-buyers",
      name: "revops governance buyers",
      taste: "source trails, CRM status changes, attribution, and just-in-time enrichment",
      format: "source_trail_tables",
      members: ["christa-dabilly"],
      engagements: 0,
      warm: 0,
    },
  ];
}

export const FIXTURE_GRAVITY_MAP: GravityMap = {
  summary:
    "The shared conversation is not cold email. It is whether AI can create trust before the seller asks for time. Gamma and Airtable reward product-led artifacts; Nabla and Foundever reward proof and trust; Edenred rewards source trails, data hygiene, and CRM-ready state changes. Gravity enters those worlds before enrichment or outreach.",
  themes: [
    {
      theme: "Familiarity before outreach",
      who: ["Olivia Frenkel", "Margaux Benoit", "Vincent Gonnot"],
      evidence: [SOURCE.gamma, SOURCE.nabla, SOURCE.airtableAi],
    },
    {
      theme: "AI must live inside real workflows",
      who: ["Margaux Benoit", "Vincent Gonnot", "Christa Dabilly"],
      evidence: [SOURCE.nablaNejm, SOURCE.airtableAi, SOURCE.edenred],
    },
    {
      theme: "Human trust is the differentiator",
      who: ["Margaux Benoit", "Virginie Dupin", "Christa Dabilly"],
      evidence: [SOURCE.nabla, SOURCE.foundeverLeadership, SOURCE.fullenrich],
    },
  ],
  watering_holes: [
    "LinkedIn posts about AI-native GTM and product demos",
    "Healthcare AI proof, clinician workflow, and adoption conversations",
    "Enterprise workflow automation, RevOps, and CRM governance threads",
    "Brand, CX, and human-in-the-loop AI narratives",
  ],
};

export function fixturePlan(): PlanItem[] {
  return [
    {
      id: "p-mon-sillage-map",
      cohort: "revops-governance-buyers",
      day: "Mon",
      type: "react",
      channel: "linkedin",
      title: "Seed the RevOps orbit from Sillage signals",
      draft: "",
      why:
        "Sillage shows which accounts have relevant timing and which stakeholders belong in the power map before we buy contact data.",
      evidence: [SOURCE.sillage, SOURCE.edenred],
      link: SOURCE.sillage,
      done: false,
    },
    {
      id: "p-tue-post-familiarity",
      cohort: "product-led-storytellers",
      media: "carousel / mini-deck",
      day: "Tue",
      type: "post",
      channel: "linkedin",
      title: "Publish: the new GTM funnel starts before outreach",
      draft:
        "5 accounts. 0 cold emails to start.\n\nThe old GTM loop:\nfind lead -> enrich -> write a fake-personal email.\n\nThe better loop:\nmap the buyer's public world -> create something they would already care about -> enrich only when they engage.\n\nThat changes the AE brief from \"I found you\" to \"you already saw us.\"\n\nWhich step is your team still skipping?",
      why:
        "Gamma and Airtable both reward fast, visual, product-led stories about AI changing work. This is a deck-shaped post, not a cold pitch.",
      evidence: [SOURCE.gamma, SOURCE.gammaApi, SOURCE.airtableAi],
      variant: "A",
      done: false,
    },
    {
      id: "p-tue-comment-healthcare-trust",
      cohort: "trust-led-enterprise-ai",
      day: "Tue",
      type: "comment",
      channel: "linkedin",
      title: "Comment inside the healthcare AI trust conversation",
      draft:
        "The hard part is not proving the model can write. It is proving the workflow can be trusted by clinicians on a busy day. Adoption lives in that gap.",
      why:
        "Nabla's public story is clinician workflow, documentation quality, adoption, and evidence. Enter that conversation before any direct ask.",
      evidence: [SOURCE.nabla, SOURCE.nablaNejm],
      link: SOURCE.nablaNejm,
      done: false,
    },
    {
      id: "p-wed-post-operating-system",
      cohort: "revops-governance-buyers",
      media: "source-trail table",
      day: "Wed",
      type: "post",
      channel: "linkedin",
      title: "Publish: AI GTM needs an operating system",
      draft:
        "2 failure modes I keep seeing in AI GTM:\n\n1. The AI creates words, but the CRM never knows why.\n2. The team enriches everyone, even when nobody engaged.\n\nThe fix is boring and valuable:\nsource -> score change -> state -> next step -> CRM field.\n\nThat is how warm outreach stays warm.",
      why:
        "Airtable and Edenred both make the operational layer credible: systems, fields, governance, and repeatable workflow beat one-off automation.",
      evidence: [SOURCE.airtableAi, SOURCE.edenred, SOURCE.sillage, SOURCE.fullenrich],
      variant: "B",
      done: false,
    },
    {
      id: "p-thu-connect-gamma",
      cohort: "product-led-storytellers",
      day: "Thu",
      type: "connect",
      channel: "linkedin",
      title: "Connect with Olivia after visible feed touches",
      draft:
        "Olivia - your work sits exactly where we think GTM is moving: product stories buyers can recognize before any ask. No pitch; thought the Gravity loop would be relevant to Gamma-style evangelism.",
      why:
        "Third rung of the ladder after a visual post and a source-backed comment. The note references the topic, not private data.",
      evidence: [SOURCE.gamma, SOURCE.gammaApi],
      link: SOURCE.gamma,
      done: false,
    },
    {
      id: "p-fri-post-human-signal",
      cohort: "trust-led-enterprise-ai",
      media: "text post",
      day: "Fri",
      type: "post",
      channel: "linkedin",
      title: "Publish: AI GTM should reveal the human signal earlier",
      draft:
        "3 human signals matter before outreach:\n\n1. What the buyer already rewards publicly.\n2. Which proof format their cohort trusts.\n3. Whether they engaged before we enriched.\n\nAI should not make outreach feel less human. It should help the seller earn recognition before the ask.",
      why:
        "Foundever's world is brand, trust, and customer connection; Nabla's world is workflow trust. This bridges both without sounding like cold-email software.",
      evidence: [SOURCE.foundeverLeadership, SOURCE.foundever, SOURCE.nabla],
      done: false,
    },
  ];
}

// Plan v2: what Strategist proposes after Radar measures engagement.
export function fixturePlanV2(): PlanItem[] {
  return [
    {
      id: "p2-post-healthcare-trust",
      cohort: "trust-led-enterprise-ai",
      media: "carousel",
      day: "Mon",
      type: "post",
      channel: "linkedin",
      title: "v2 - Publish: workflow trust before healthcare AI adoption",
      draft:
        "2 comments changed the route.\n\nThe question is not \"can AI write the note?\"\nIt is \"will the clinician trust the workflow when the clinic is full?\"\n\nThat is the real GTM problem in healthcare AI:\nproof -> workflow fit -> adoption -> expansion.\n\nFeature demos skip step 2.",
      why:
        "Margaux went warm on workflow trust. Double down on the exact theme that created real engagement.",
      evidence: ["p-tue-comment-healthcare-trust - target comment", SOURCE.nablaNejm],
      variant: "A",
      done: false,
    },
    {
      id: "p2-reply-margaux",
      cohort: "trust-led-enterprise-ai",
      day: "Mon",
      type: "comment",
      channel: "linkedin",
      title: "v2 - Reply in Margaux's workflow-trust thread",
      draft:
        "Exactly. The model demo gets attention, but the workflow proof earns adoption. That is the point where GTM and product have to meet.",
      why:
        "She is warm. Keep the public thread useful; the direct touch can now reference real engagement.",
      evidence: ["p-tue-comment-healthcare-trust - her comment"],
      done: false,
    },
    {
      id: "p2-gamma-mini-deck",
      cohort: "product-led-storytellers",
      media: "mini-deck",
      day: "Tue",
      type: "post",
      channel: "linkedin",
      title: "v2 - Publish: 5-slide Gamma-style teardown",
      draft:
        "5 slides I would show any GTM team still starting with cold email:\n\n1. The buyer's public world.\n2. The topics they reward.\n3. The cohort they belong to.\n4. The first useful post.\n5. The warm trigger that makes outreach honest.\n\nThat is the funnel before the funnel.",
      why:
        "Olivia reacted twice to the familiarity post. Turn the concept into the artifact her cohort rewards.",
      evidence: ["p-tue-post-familiarity - 2 target reactions", SOURCE.gammaApi],
      done: false,
    },
  ];
}

// Scripted engagement for mock Radar scans - one beat per scan click.
export interface EngagementBeat {
  prospectId: string | null; // null means serendipity stranger
  stranger?: { name: string; title: string; company: string; linkedin_url: string };
  event: EngagementEvent;
}

export const ENGAGEMENT_SCRIPT: EngagementBeat[] = [
  {
    prospectId: "margaux-benoit",
    event: {
      post_id: "p-tue-comment-healthcare-trust",
      kind: "comment",
      at: "",
      quote: "Workflow trust is the real bottleneck.",
    },
  },
  {
    prospectId: "olivia-frenkel",
    event: { post_id: "p-tue-post-familiarity", kind: "reaction", at: "", quote: "" },
  },
  {
    prospectId: "olivia-frenkel",
    event: { post_id: "p-tue-post-familiarity", kind: "reaction", at: "", quote: "" },
  },
  {
    prospectId: "christa-dabilly",
    event: {
      post_id: "p-wed-post-operating-system",
      kind: "comment",
      at: "",
      quote: "The source trail matters more than the score.",
    },
  },
];

// JIT enrichment results (what FullEnrich returns at the Warm trigger).
export const FIXTURE_CONTACTS: Record<string, { email: string; phone: string }> = {
  "olivia-frenkel": { email: "olivia.frenkel@gamma.example", phone: "" },
  "margaux-benoit": { email: "margaux.benoit@nabla.example", phone: "" },
  "vincent-gonnot": { email: "vincent.gonnot@airtable.example", phone: "" },
  "virginie-dupin": { email: "virginie.dupin@foundever.example", phone: "" },
  "christa-dabilly": { email: "christa.dabilly@edenred.example", phone: "" },
};
