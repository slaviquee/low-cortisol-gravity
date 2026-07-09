// The 3 real-data worlds. All names, titles, LinkedIn URLs, topics, and
// post URLs are real public data (verified via research agents 2026-07-09).
// buildgravity is the hero: real GTM leaders at AI companies as the ICP,
// the CMO's real published post, and its real commenters in the warm queue.
// NOTE: we never fabricate a real person's private contact data — real
// engagers show email "—" (enrich live on stage); only the drafts are seeded.

import { CompanySpec } from "./demo-seeds";

// ── REAL 1 · buildgravity.co (us) — the hero world ──────────────────
const BUILDGRAVITY: CompanySpec = {
  website: "buildgravity.co",
  product_summary:
    "Gravity is a buyer-orbit GTM agent that learns each buyer's taste, earns their attention inside their feed, and reaches out only once they've engaged — so the first touch is never cold.",
  icp: "GTM leaders (Heads of Sales, CROs, founders) at AI-native and B2B-SaaS companies running relationship-led sales motions",
  tone: [
    "playful and human — \"I taught a computer to have a crush on your customers\"",
    "one bold claim, then the mechanism — no corporate throat-clearing",
    "first-person, casual, short lines, contractions",
    "ends with a clear ask (comment 'gravity' for access)",
  ],
  user_notes: [
    "always tag Anthropic, Sillage, FullEnrich and #agentic-gtm in launch posts",
    "keep the register playful — the crush framing is the hook, don't sand it off",
  ],
  decisions: [
    {
      decision: "anchor outbound on the CMO's launch post, not a cold sequence",
      because: "it organically pulled 10 real ICP commenters — that's warm inventory to work first",
    },
  ],
  targets: ["anthropic.com", "getsillage.com"],
  own_post_urls: [
    "https://www.linkedin.com/feed/update/urn:li:activity:7480977704746483712/",
  ],
  mock: false,
  prospects: [
    {
      name: "Lauren Schwartz",
      title: "Head of Strategic Sales, Claude Code",
      company: "Anthropic",
      linkedin: "https://www.linkedin.com/in/laurenhschwartz/",
      heat: 86,
      score: 24,
      state: "engaged",
      behavior: "poster",
      signals: [
        { type: "keyword", detail: "headline: \"building agentic momentum @ Anthropic\"" },
        { type: "keyword", detail: "publishes GTM hiring playbooks via 20SALES" },
      ],
      topics: [
        { topic: "agentic AI adoption in enterprise", stance: "building agentic momentum at Anthropic — bullish, pragmatic", evidence: ["https://www.linkedin.com/in/laurenhschwartz/"] },
        { topic: "sales hiring & interview design", stance: "writes playbooks on structuring the interview (20SALES)", evidence: ["https://www.linkedin.com/posts/laurenhschwartz_20-sales-how-to-structure-the-interview-activity-6988725643786031104-gE9I"] },
        { topic: "founder-led GTM", stance: "Founding Partner at 20SALES — coaches early GTM", evidence: ["https://www.linkedin.com/in/laurenhschwartz/"] },
      ],
      formats: ["playbooks", "tactical_threads", "hiring_frames"],
      media: [{ kind: "text", share: 0.55 }, { kind: "carousel", share: 0.3 }, { kind: "image", share: 0.15 }],
      influencers: [{ name: "20SALES community", why: "publishes GTM playbooks there", evidence: ["https://www.linkedin.com/in/laurenhschwartz/"] }],
      cohort: "gtm-builders",
    },
    {
      name: "Ryan O'Holleran",
      title: "Head of Sales, Enterprise & Startups — EMEA",
      company: "Anthropic",
      linkedin: "https://www.linkedin.com/in/ryanoholleran/",
      heat: 79,
      score: 12,
      state: "engaged",
      behavior: "poster",
      signals: [
        { type: "keyword", detail: "reacts publicly to Anthropic product launches" },
        { type: "keyword", detail: "posts on agentic AI in payments (ex-Stripe/Airwallex)" },
      ],
      topics: [
        { topic: "agentic AI & future of payments", stance: "ex-Stripe/Airwallex — sees agents reshaping fintech GTM", evidence: ["https://www.linkedin.com/posts/ryanoholleran_today-anthropic-launched-powerful-new-features-activity-7317968655126835202-XR6g"] },
        { topic: "scaling enterprise sales orgs", stance: "shares hard-won org-scaling lessons", evidence: ["https://www.linkedin.com/in/ryanoholleran/"] },
        { topic: "founder sales mentoring", stance: "mentors via First Round Fast Track", evidence: ["https://www.linkedin.com/in/ryanoholleran/"] },
      ],
      formats: ["launch_reactions", "org_scaling_lessons"],
      media: [{ kind: "text", share: 0.6 }, { kind: "image", share: 0.4 }],
      influencers: [{ name: "First Round", why: "mentors in their Fast Track program", evidence: ["https://www.linkedin.com/in/ryanoholleran/"] }],
      cohort: "gtm-builders",
    },
    {
      name: "Asjit Teja",
      title: "Head of Sales, UK",
      company: "Anthropic",
      linkedin: "https://www.linkedin.com/in/asjitteja/",
      heat: 64,
      score: 8,
      state: "modeled",
      behavior: "commenter",
      signals: [{ type: "keyword", detail: "active in UK sales-leadership networking (Essex)" }],
      topics: [
        { topic: "enterprise AI GTM in UK market", stance: "building the UK enterprise motion for Anthropic", evidence: ["https://www.linkedin.com/in/asjitteja/"] },
        { topic: "sales community & networking", stance: "active in UK sales-leadership circles", evidence: ["https://www.linkedin.com/posts/asjitteja_thankyou-networking-networkingessex-activity-6909540392346472448-Zmd7"] },
      ],
      formats: ["community_posts", "short_takes"],
      media: [{ kind: "text", share: 0.7 }, { kind: "image", share: 0.3 }],
      influencers: [{ name: "UK sales-leadership community", why: "networks and reshares there", evidence: ["https://www.linkedin.com/in/asjitteja/"] }],
      cohort: "gtm-builders",
    },
    {
      name: "Arthur Coudouy",
      title: "Co-founder & CEO",
      company: "Sillage",
      linkedin: "https://www.linkedin.com/in/arthurcoudouy/",
      x: "@arthurcoudouy",
      heat: 92,
      score: 30,
      state: "warm",
      behavior: "poster",
      signals: [
        { type: "funding", detail: "Sillage raised ~€1.7M pre-seed (Kima Ventures)" },
        { type: "keyword", detail: "\"agentic GTM\" — co-hosted the Station F hackathon" },
      ],
      topics: [
        { topic: "signal-driven prospecting", stance: "intent signals over spray-and-pray outbound", evidence: ["https://www.linkedin.com/posts/arthurcoudouy_big-news-im-launching-my-second-startup-activity-7371162864654381057-O3dP"] },
        { topic: "AI as sales copilot, not AI-SDR", stance: "strong take: augment reps, don't replace them", evidence: ["https://www.linkedin.com/posts/arthurcoudouy_big-news-im-launching-my-second-startup-activity-7371162864654381057-O3dP"] },
        { topic: "agentic GTM", stance: "co-hosted the Agentic GTM Hackathon at Station F", evidence: ["https://www.linkedin.com/posts/stationf_last-week-arnaud-weiss-and-arthur-coudouy-activity-7439950617915080704-Linb"] },
      ],
      formats: ["contrarian_takes", "founder_story", "tactical_threads"],
      media: [{ kind: "text", share: 0.6 }, { kind: "carousel", share: 0.25 }, { kind: "video", share: 0.15 }],
      influencers: [{ name: "Station F", why: "co-hosted the hackathon; reshares their content", evidence: ["https://www.linkedin.com/posts/stationf_last-week-arnaud-weiss-and-arthur-coudouy-activity-7439950617915080704-Linb"] }],
      cohort: "signal-believers",
    },
    {
      name: "Arnaud Weiss",
      title: "Co-founder & CTO",
      company: "Sillage",
      linkedin: "https://www.linkedin.com/in/arnaud-weiss-60b6758a/",
      heat: 81,
      score: 14,
      state: "engaged",
      behavior: "poster",
      signals: [
        { type: "funding", detail: "co-founded Sillage — ~€1.7M pre-seed (Kima Ventures)" },
        { type: "keyword", detail: "posts: inbound is dying to LLM search" },
      ],
      topics: [
        { topic: "intent signals & buyer behavior", stance: "job changes, competitor engagement, topic posts as the new inbound", evidence: ["https://www.linkedin.com/posts/arnaud-weiss-60b6758a_big-news-im-launching-my-third-startup-activity-7371162847550156800-0b90"] },
        { topic: "decline of inbound & outreach burnout", stance: "ex-VP Marketing (LumApps) — inbound is dying to LLM search", evidence: ["https://www.linkedin.com/posts/arnaud-weiss-60b6758a_big-news-im-launching-my-third-startup-activity-7371162847550156800-0b90"] },
      ],
      formats: ["contrarian_takes", "market_analysis"],
      media: [{ kind: "text", share: 0.7 }, { kind: "carousel", share: 0.3 }],
      influencers: [{ name: "Kima Ventures", why: "investor; reshares portfolio content", evidence: ["https://www.linkedin.com/posts/kima-ventures_sillage-announces-its-2m-pre-seed-to-activity-7453013629819486208-zuHG"] }],
      cohort: "signal-believers",
    },
  ],
  cohorts: [
    { name: "GTM builders", taste: "sales leaders building agentic GTM orgs — reward playbooks + tactical threads over hype", format: "playbooks", members: ["Lauren Schwartz", "Ryan O'Holleran", "Asjit Teja"], engagements: 4, warm: 0 },
    { name: "Signal believers", taste: "founders who preach intent-over-spray and augment-not-replace", format: "contrarian_takes", members: ["Arthur Coudouy", "Arnaud Weiss"], engagements: 3, warm: 1 },
  ],
  gravity_map: {
    summary:
      "Your ICP is GTM leadership at AI-native companies having one loud conversation: cold outreach is dead, and the winners are the ones who show up with signal and taste before the first touch. They reward tactical playbooks and contrarian founder takes, and they can smell automation instantly. The conversation lives in the Station F / agentic-GTM crowd and 20SALES-style operator communities.",
    themes: [
      { theme: "Intent & signal over spray-and-pray", who: ["Arthur Coudouy", "Arnaud Weiss"], evidence: ["https://www.linkedin.com/posts/arnaud-weiss-60b6758a_big-news-im-launching-my-third-startup-activity-7371162847550156800-0b90"] },
      { theme: "Augment the rep, don't replace them", who: ["Arthur Coudouy", "Lauren Schwartz"], evidence: ["https://www.linkedin.com/posts/arthurcoudouy_big-news-im-launching-my-second-startup-activity-7371162864654381057-O3dP"] },
    ],
    watering_holes: ["Station F / #agentic-gtm crowd", "20SALES operator community", "First Round Fast Track network"],
  },
  plan: [
    { day: "Mon", type: "comment", channel: "linkedin", title: "Comment on Arnaud's 'inbound is dying' post", draft: "The part everyone underrates: when inbound dies to LLM search, the replacement isn't more outbound — it's being *already familiar* by the time intent shows up. Signal tells you when. Taste tells you how not to sound like everyone else who bought the same signal.", why: "Arnaud is the hottest founder in-segment and posts this exact thesis; enter his thread before posting at him", evidence: ["https://www.linkedin.com/posts/arnaud-weiss-60b6758a_big-news-im-launching-my-third-startup-activity-7371162847550156800-0b90"], cohort: "Signal believers", link: "https://www.linkedin.com/posts/arnaud-weiss-60b6758a_big-news-im-launching-my-third-startup-activity-7371162847550156800-0b90" },
    { day: "Tue", type: "post", channel: "linkedin", title: "Publish: the buyer-orbit thesis", draft: "Everyone's automating the cold email.\n\nWe automated the five days before it.\n\nGravity learns what a buyer actually engages with, earns attention inside their feed, and only reaches out once they've engaged with you. By the time you say hi, you're not a stranger — you're the account that kept showing up with the right take.\n\nBuilt at Station F with Anthropic, Sillage, FullEnrich. Comment 'gravity' for access.", why: "GTM builders reward tactical, non-hype threads; this reframes the category the way Arthur & Arnaud already talk", evidence: ["https://www.linkedin.com/feed/update/urn:li:activity:7480977704746483712/"], cohort: "Signal believers", media: "text", eval: 100, variant: "A" },
    { day: "Wed", type: "comment", channel: "linkedin", title: "Comment on Lauren's interview-structure playbook", draft: "The interview signal nobody scores: can the rep find the buyer's world before the first call? The best hires already stalk the feed for taste, not just the org chart. That instinct is exactly what we tried to make software do.", why: "Lauren publishes hiring playbooks; GTM-builders cohort lives in that content", evidence: ["https://www.linkedin.com/posts/laurenhschwartz_20-sales-how-to-structure-the-interview-activity-6988725643786031104-gE9I"], cohort: "GTM builders", link: "https://www.linkedin.com/posts/laurenhschwartz_20-sales-how-to-structure-the-interview-activity-6988725643786031104-gE9I" },
    { day: "Thu", type: "connect", channel: "linkedin", title: "Connect with Arthur Coudouy (+ note)", draft: "Arthur — your 'augment the rep, don't replace them' line is basically our product thesis. We built the layer that runs *before* the SDR ever reaches out. No pitch; given you literally host the agentic-GTM crowd, I'd value your read.", why: "warm after the comment; leads with his own framing and the shared Station F world", evidence: ["https://www.linkedin.com/posts/arthurcoudouy_big-news-im-launching-my-second-startup-activity-7371162864654381057-O3dP"], cohort: "Signal believers", link: "https://www.linkedin.com/in/arthurcoudouy/" },
    { day: "Fri", type: "follow", channel: "x", title: "Follow @arthurcoudouy on X", draft: "", why: "second rung of the ladder before the connect lands", evidence: [], cohort: "Signal believers", link: "https://x.com/arthurcoudouy" },
  ],
  warm: [
    {
      name: "Arthur Coudouy",
      title: "Co-founder & CEO @ Sillage",
      quote: "This is exactly the layer I keep telling reps they're missing — signal tells you when, taste tells you how. Comment 'gravity'.",
      email: "",
      serendipity: false,
      email_draft: "Subject: the layer before the SDR\n\nArthur — you said it better than our deck does: signal tells you when, taste tells you how not to sound like everyone else who bought the same signal. That's the whole product. Given you host the agentic-GTM crowd, I'd genuinely value 20 minutes to show you what runs before the first touch — and hear where you'd break it.\n\n— the Gravity team",
      connect_note: "Arthur — your 'signal tells you when, taste tells you how' line is our product thesis. Would love your read on the layer before the SDR.",
      call_script: "Hi Arthur — calling because you literally described our product in your comment: signal for the when, taste for the how. You host the agentic-GTM crowd, so your read matters more than most. 20 minutes this week to pressure-test it?",
      pitch_brief: "pitch brief — Arthur Coudouy\n\n1 · open on his words\n    \"signal tells you when, taste tells you how\"\n2 · his world\n    intent-driven prospecting · augment-not-replace · agentic GTM\n3 · what we do\n    the buyer-orbit layer that runs before the first touch\n4 · the shared world\n    Station F, #agentic-gtm — you host the room we built in\n5 · the ask\n    20-minute pressure-test with the person who defines the category\n\n→ paste into gamma.app — a per-lead deck in one click",
    },
    {
      name: "Clara Hevia Aranguren",
      title: "commented on your launch post",
      quote: "gravity — love this, the 'oddly familiar before you say hi' framing is so good",
      serendipity: true,
      email: "",
      email_draft: "Subject: you commented 'gravity'\n\nHi Clara — you commented on the launch post (the 'oddly familiar before you say hi' line landed with you). That's the whole idea, so you're exactly who it's built for. Want early access? I'll set you up and show you what it built for your first three accounts.\n\n— the Gravity team",
      connect_note: "Clara — thanks for the comment on the launch. Setting you up with early access — the 'oddly familiar' part is the fun bit.",
      pitch_brief: "pitch brief — Clara Hevia Aranguren\n\n1 · open on her words\n    \"the 'oddly familiar before you say hi' framing is so good\"\n2 · context\n    engaged with the launch post — inbound-warm, self-selected\n3 · what we do\n    buyer-orbit GTM: become familiar before the first touch\n4 · the ask\n    early access + a live build for her first 3 accounts\n\n→ paste into gamma.app — a per-lead deck in one click",
    },
    {
      name: "Pierina Camarena",
      title: "commented on your launch post",
      quote: "gravity",
      serendipity: true,
      email: "",
      email_draft: "Subject: your 'gravity' comment\n\nHi Pierina — you commented 'gravity' on the launch, so here's your access. Quick question so I set it up right: what are the 3 accounts you'd most want to become familiar with before reaching out? I'll have it build their world live.\n\n— the Gravity team",
      connect_note: "Pierina — thanks for commenting on the launch. Here's early access — tell me your top 3 accounts and I'll build their world live.",
      pitch_brief: "pitch brief — Pierina Camarena\n\n1 · open on her words\n    commented 'gravity' — opted in for access\n2 · context\n    self-selected off the launch post\n3 · what we do\n    buyer-orbit GTM: familiar before the first touch\n4 · the ask\n    access + a live build for her top 3 accounts\n\n→ paste into gamma.app — a per-lead deck in one click",
    },
  ],
  logs: [
    { agent: "scout", msg: "read buildgravity.co → ICP: GTM leaders at AI-native companies" },
    { agent: "scout", msg: "tone of voice locked from our own posts: contrarian, tactical, no hype" },
    { agent: "resolver", msg: "5 named buyers: 3 Anthropic GTM leaders + 2 Sillage founders" },
    { agent: "listener", msg: "world model built: Arthur Coudouy (rewards contrarian takes, augment-not-replace)" },
    { agent: "strategist", msg: "clustering 5 world models → 2 taste cohorts" },
    { agent: "strategist", msg: "plan ready — evals passed, familiarity ladder sequenced" },
    { agent: "radar", msg: "scanned the CMO launch post — 10 real commenters" },
    { agent: "radar", msg: "Arthur Coudouy commented → WARM" },
    { agent: "radar", msg: "Clara Hevia Aranguren engaged — not on the list. Fits ICP → warm queue" },
    { agent: "radar", msg: "Pierina Camarena engaged — not on the list. Fits ICP → warm queue" },
  ],
};

// ── REAL 2 · anthropic.com — a vendor selling into Anthropic's GTM org
const ANTHROPIC: CompanySpec = {
  website: "anthropic.com",
  product_summary:
    "Anthropic builds frontier AI (Claude) and a fast-scaling enterprise business — this world models Anthropic's own GTM leadership as the buyers a sales-tooling vendor would target.",
  icp: "senior commercial leaders at Anthropic — CCO, Head of Sales & Partnerships, regional heads of enterprise",
  tone: [
    "measured and enterprise-credible — outcomes over hype",
    "responsible adoption framed as a GTM accelerant, not a compliance checkbox",
    "exec-altitude narratives, not tool tactics",
  ],
  user_notes: [
    "never open with a tool pitch — lead with the buying-committee trust curve",
  ],
  targets: ["anthropic.com"],
  mock: false,
  prospects: [
    {
      name: "Paul Smith",
      title: "Chief Commercial Officer",
      company: "Anthropic",
      linkedin: "https://www.linkedin.com/in/paul-smith-anthropic/",
      heat: 74,
      score: 10,
      state: "modeled",
      behavior: "poster",
      signals: [{ type: "job_change", detail: "joined Anthropic as CCO from ServiceNow" }],
      topics: [
        { topic: "scaling global GTM orgs", stance: "ex-Microsoft/Salesforce/ServiceNow — builds enterprise commercial engines", evidence: ["https://www.anthropic.com/news/paul-smith-to-join-anthropic"] },
        { topic: "enterprise AI transformation", stance: "sells AI as the enterprise operating layer", evidence: ["https://www.anthropic.com/news/paul-smith-to-join-anthropic"] },
      ],
      formats: ["exec_narratives", "vision_posts"],
      media: [{ kind: "text", share: 0.6 }, { kind: "image", share: 0.4 }],
      influencers: [{ name: "Enterprise SaaS GTM circle", why: "ex-ServiceNow/Salesforce network", evidence: ["https://www.anthropic.com/news/paul-smith-to-join-anthropic"] }],
      cohort: "enterprise-gtm-execs",
    },
    {
      name: "Kate Earle Jensen",
      title: "Head of Sales & Partnerships",
      company: "Anthropic",
      linkedin: "https://www.linkedin.com/in/kateearle/",
      heat: 71,
      score: 8,
      state: "modeled",
      behavior: "poster",
      signals: [{ type: "keyword", detail: "leads Anthropic's enterprise agents program" }],
      topics: [
        { topic: "enterprise AI enablement", stance: "leads the enterprise agents program", evidence: ["https://www.operatorcollective.com/blog-posts/meet-anthropics-head-of-sales-partnerships-kate-earle-jensen"] },
        { topic: "cloud partnerships", stance: "Amazon/Google partnership motion", evidence: ["https://www.operatorcollective.com/blog-posts/meet-anthropics-head-of-sales-partnerships-kate-earle-jensen"] },
        { topic: "responsible enterprise adoption", stance: "Constitutional-AI-aligned selling", evidence: ["https://www.operatorcollective.com/blog-posts/meet-anthropics-head-of-sales-partnerships-kate-earle-jensen"] },
      ],
      formats: ["partnership_announcements", "thought_leadership"],
      media: [{ kind: "text", share: 0.5 }, { kind: "carousel", share: 0.3 }, { kind: "image", share: 0.2 }],
      influencers: [{ name: "Operator Collective", why: "featured member; reshares their content", evidence: ["https://www.operatorcollective.com/blog-posts/meet-anthropics-head-of-sales-partnerships-kate-earle-jensen"] }],
      cohort: "enterprise-gtm-execs",
    },
    {
      name: "Ryan O'Holleran",
      title: "Head of Sales, Enterprise & Startups — EMEA",
      company: "Anthropic",
      linkedin: "https://www.linkedin.com/in/ryanoholleran/",
      heat: 68,
      score: 6,
      state: "modeled",
      behavior: "poster",
      signals: [{ type: "keyword", detail: "\"agentic\" in product-launch reactions" }],
      topics: [
        { topic: "agentic AI in fintech GTM", stance: "ex-Stripe/Airwallex lens on payments + agents", evidence: ["https://www.linkedin.com/posts/ryanoholleran_today-anthropic-launched-powerful-new-features-activity-7317968655126835202-XR6g"] },
      ],
      formats: ["launch_reactions"],
      media: [{ kind: "text", share: 0.6 }, { kind: "image", share: 0.4 }],
      influencers: [{ name: "First Round", why: "mentor network", evidence: ["https://www.linkedin.com/in/ryanoholleran/"] }],
      cohort: "enterprise-gtm-execs",
    },
  ],
  cohorts: [
    { name: "Enterprise GTM execs", taste: "senior commercial leaders who reward exec narratives + partnership proof, not tool demos", format: "exec_narratives", members: ["Paul Smith", "Kate Earle Jensen", "Ryan O'Holleran"], engagements: 2, warm: 0 },
  ],
  gravity_map: {
    summary:
      "Anthropic's commercial leadership is scaling one of the fastest enterprise GTM engines in software. They reward exec-level narratives, partnership proof, and responsible-adoption framing — and they're inundated with vendor demos. Attention concentrates in Operator Collective and enterprise-SaaS GTM circles.",
    themes: [
      { theme: "Scaling enterprise AI GTM", who: ["Paul Smith", "Kate Earle Jensen"], evidence: ["https://www.anthropic.com/news/paul-smith-to-join-anthropic"] },
      { theme: "Responsible enterprise adoption", who: ["Kate Earle Jensen"], evidence: ["https://www.operatorcollective.com/blog-posts/meet-anthropics-head-of-sales-partnerships-kate-earle-jensen"] },
    ],
    watering_holes: ["Operator Collective", "Enterprise-SaaS GTM leadership circles", "Cloud-partnership announcements"],
  },
  plan: [
    { day: "Mon", type: "comment", channel: "linkedin", title: "Comment on Kate's enterprise-agents post", draft: "The under-discussed part of an enterprise agents program is the buying committee's trust curve — responsible-adoption framing isn't a compliance checkbox, it's the actual GTM accelerant. Lead with it and the security review stops being the bottleneck.", why: "Kate leads this exact program; enterprise-GTM-execs cohort rewards this altitude", evidence: ["https://www.operatorcollective.com/blog-posts/meet-anthropics-head-of-sales-partnerships-kate-earle-jensen"], cohort: "Enterprise GTM execs", link: "https://www.linkedin.com/in/kateearle/" },
    { day: "Wed", type: "post", channel: "linkedin", title: "Publish: exec narrative on GTM at AI speed", draft: "The hardest part of scaling an AI GTM org isn't pipeline — it's that the product ships faster than the sales narrative can keep up.\n\nThe teams winning it treat enablement as a weekly release, not a quarterly offsite. Here's the operating cadence we've seen work across three hypergrowth commercial orgs.", why: "Paul and Kate reward exec narratives over tactics; matches their altitude", evidence: ["https://www.anthropic.com/news/paul-smith-to-join-anthropic"], cohort: "Enterprise GTM execs", media: "text", eval: 90, variant: "A" },
    { day: "Fri", type: "connect", channel: "linkedin", title: "Connect with Kate Earle Jensen (+ note)", draft: "Kate — your framing of responsible adoption as a GTM accelerant (not a checkbox) is the sharpest version of that argument I've seen. No pitch; would value your read on how enterprise buying committees actually move through the trust curve.", why: "warm after the comment; leads with her own thesis", evidence: ["https://www.operatorcollective.com/blog-posts/meet-anthropics-head-of-sales-partnerships-kate-earle-jensen"], cohort: "Enterprise GTM execs", link: "https://www.linkedin.com/in/kateearle/" },
  ],
  warm: [],
  logs: [
    { agent: "scout", msg: "read anthropic.com → commercial leadership as buyers" },
    { agent: "resolver", msg: "3 GTM execs named — Paul Smith (CCO), Kate Earle Jensen, Ryan O'Holleran" },
    { agent: "listener", msg: "world model built: Kate Earle Jensen (rewards exec narratives + partnership proof)" },
    { agent: "strategist", msg: "1 taste cohort: enterprise GTM execs" },
    { agent: "strategist", msg: "plan ready — evals passed" },
    { agent: "radar", msg: "watching for engagement on the exec-narrative post…" },
  ],
};

// ── REAL 3 · getsillage.com — a vendor selling into Sillage ─────────
const SILLAGE: CompanySpec = {
  website: "getsillage.com",
  product_summary:
    "Sillage is a GTM signal engine (job changes, champion tracking, competitor & hiring intent) for enterprise sales teams — this world models its two founders as the buyers a vendor would target.",
  icp: "technical GTM founders and early operators in the intent-signal / agentic-GTM space",
  tone: [
    "contrarian, data-backed market takes",
    "short, direct, French-founder candor",
    "\"inbound is dying / spray-and-pray is dead\" provocations",
  ],
  user_notes: [
    "match their contrarian register — never use generic outbound language",
  ],
  targets: ["getsillage.com"],
  mock: false,
  prospects: [
    {
      name: "Arthur Coudouy",
      title: "Co-founder & CEO",
      company: "Sillage",
      linkedin: "https://www.linkedin.com/in/arthurcoudouy/",
      x: "@arthurcoudouy",
      heat: 90,
      score: 18,
      state: "engaged",
      behavior: "poster",
      signals: [
        { type: "funding", detail: "raised ~€1.7M pre-seed (Kima Ventures, Apr 2026)" },
        { type: "keyword", detail: "\"agentic GTM\" — co-hosted Station F hackathon" },
      ],
      topics: [
        { topic: "signal-driven prospecting", stance: "intent over spray-and-pray", evidence: ["https://www.linkedin.com/posts/arthurcoudouy_big-news-im-launching-my-second-startup-activity-7371162864654381057-O3dP"] },
        { topic: "AI as sales copilot", stance: "augment reps, don't replace them", evidence: ["https://www.linkedin.com/posts/arthurcoudouy_big-news-im-launching-my-second-startup-activity-7371162864654381057-O3dP"] },
        { topic: "agentic GTM movement", stance: "co-hosted the Station F hackathon", evidence: ["https://www.linkedin.com/posts/stationf_last-week-arnaud-weiss-and-arthur-coudouy-activity-7439950617915080704-Linb"] },
      ],
      formats: ["contrarian_takes", "founder_story"],
      media: [{ kind: "text", share: 0.6 }, { kind: "carousel", share: 0.25 }, { kind: "video", share: 0.15 }],
      influencers: [{ name: "Station F", why: "co-hosted the hackathon", evidence: ["https://www.linkedin.com/posts/stationf_last-week-arnaud-weiss-and-arthur-coudouy-activity-7439950617915080704-Linb"] }],
      cohort: "founder-operators",
    },
    {
      name: "Arnaud Weiss",
      title: "Co-founder & CTO",
      company: "Sillage",
      linkedin: "https://www.linkedin.com/in/arnaud-weiss-60b6758a/",
      heat: 82,
      score: 12,
      state: "engaged",
      behavior: "poster",
      signals: [{ type: "competitor", detail: "posts on the death of inbound to LLM search" }],
      topics: [
        { topic: "intent signals & buyer behavior", stance: "the new inbound is behavioral, not form-fills", evidence: ["https://www.linkedin.com/posts/arnaud-weiss-60b6758a_big-news-im-launching-my-third-startup-activity-7371162847550156800-0b90"] },
        { topic: "outreach burnout", stance: "ex-VP Marketing LumApps — automation fatigue is real", evidence: ["https://www.linkedin.com/posts/arnaud-weiss-60b6758a_big-news-im-launching-my-third-startup-activity-7371162847550156800-0b90"] },
      ],
      formats: ["market_analysis", "contrarian_takes"],
      media: [{ kind: "text", share: 0.75 }, { kind: "carousel", share: 0.25 }],
      influencers: [{ name: "Kima Ventures", why: "investor", evidence: ["https://www.linkedin.com/posts/kima-ventures_sillage-announces-its-2m-pre-seed-to-activity-7453013629819486208-zuHG"] }],
      cohort: "founder-operators",
    },
  ],
  cohorts: [
    { name: "Founder operators", taste: "technical GTM founders who reward contrarian market takes and refuse anything that smells like generic outbound", format: "contrarian_takes", members: ["Arthur Coudouy", "Arnaud Weiss"], engagements: 3, warm: 0 },
  ],
  gravity_map: {
    summary:
      "Sillage's founders are the sharpest voices in the intent-signal category: their whole thesis is that inbound is dying and spray-and-pray outbound is dead, so the only move left is signal + relevance. They reward contrarian, data-backed takes and will instantly reject anything that reads as automated. Their world is the Station F / agentic-GTM crowd.",
    themes: [
      { theme: "Signal over spray-and-pray", who: ["Arthur Coudouy", "Arnaud Weiss"], evidence: ["https://www.linkedin.com/posts/arnaud-weiss-60b6758a_big-news-im-launching-my-third-startup-activity-7371162847550156800-0b90"] },
    ],
    watering_holes: ["Station F / #agentic-gtm", "Kima Ventures portfolio network", "French B2B-SaaS founder circles"],
  },
  plan: [
    { day: "Mon", type: "comment", channel: "linkedin", title: "Comment on Arnaud's inbound post", draft: "The uncomfortable corollary: if inbound dies to LLM search and outbound is already exhausted, the only durable moat is being *pre-familiar* to the buyer before the signal even fires. Signal is necessary; familiarity is what makes it convert instead of annoy.", why: "Arnaud posts this thesis constantly; founder-operators cohort lives in his comments", evidence: ["https://www.linkedin.com/posts/arnaud-weiss-60b6758a_big-news-im-launching-my-third-startup-activity-7371162847550156800-0b90"], cohort: "Founder operators", link: "https://www.linkedin.com/posts/arnaud-weiss-60b6758a_big-news-im-launching-my-third-startup-activity-7371162847550156800-0b90" },
    { day: "Wed", type: "post", channel: "linkedin", title: "Publish: contrarian take on signal fatigue", draft: "Hot take for the intent-data crowd: everyone's about to buy the same signals.\n\nWhen every rep gets the same 'they just raised / they're hiring SDRs' alert on the same day, the signal stops being an edge — it's noise with better targeting. The edge moves to whoever the buyer already recognizes. Signal is table stakes now. Familiarity is the moat.", why: "Arthur & Arnaud reward contrarian, category-shaping takes; this extends their own thesis one step", evidence: ["https://www.linkedin.com/posts/arthurcoudouy_big-news-im-launching-my-second-startup-activity-7371162864654381057-O3dP"], cohort: "Founder operators", media: "text", eval: 100, variant: "A" },
    { day: "Fri", type: "connect", channel: "linkedin", title: "Connect with Arnaud Weiss (+ note)", draft: "Arnaud — your 'inbound is dying' thesis is the cleanest articulation of why we built what we built. No pitch; genuinely want your read on the 'everyone buys the same signal' problem, because you'll have the sharpest counter.", why: "warm after the comment; leads with his thesis and invites his expertise", evidence: ["https://www.linkedin.com/posts/arnaud-weiss-60b6758a_big-news-im-launching-my-third-startup-activity-7371162847550156800-0b90"], cohort: "Founder operators", link: "https://www.linkedin.com/in/arnaud-weiss-60b6758a/" },
  ],
  warm: [],
  logs: [
    { agent: "scout", msg: "read getsillage.com → founders as buyers, intent-signal category" },
    { agent: "resolver", msg: "2 founders named: Arthur Coudouy (CEO), Arnaud Weiss (CTO)" },
    { agent: "listener", msg: "world model built: Arnaud Weiss (rewards contrarian market analysis)" },
    { agent: "strategist", msg: "1 taste cohort: founder operators" },
    { agent: "strategist", msg: "plan ready — evals passed, contrarian angle" },
    { agent: "radar", msg: "watching for engagement on the signal-fatigue post…" },
  ],
};

export const REAL_COMPANIES: CompanySpec[] = [BUILDGRAVITY, ANTHROPIC, SILLAGE];
