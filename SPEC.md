# Gravity

**Build enough relevance that your buyers discover you before you discover them.**

Track 1: Acquisition · Side challenges: Most Creative GTM Angle, Most Viral on LinkedIn/X (dogfooded — see §9), Best use of Gamma (deck), Best use of Gradium (stretch — see §9)

---

## 1. Problem

Every AI GTM tool optimizes the same funnel: pick a lead → write a "personalized" cold email → send → hope. Reply rates keep collapsing because every inbox is now full of the same AI-generated personalization. The step nobody automates is the one that actually moves reply rates: **being a familiar name before you ever show up in the inbox.**

## 2. Insight

Every buyer sits inside an information bubble — the people they follow, the posts they engage with, the topics they argue about. Gravity maps that bubble from public signals, then helps you enter it naturally: publish and engage where your prospects will actually see you, and only reach out once they've engaged with *you*. We optimize **buyer familiarity**, not outbound volume.

The funnel we operate: **Attention → Familiarity → Trust → Conversation → Pipeline.** Everyone else starts at step 4.

> Everyone else automates cold outreach. We automate becoming a familiar name before the outreach ever happens.

And the economics flip: a cold email is one-to-one; one well-aimed post touches *every* prospect in the ICP at once.

## 3. The loop (what it does)

A six-stage pipeline run by a crew of five named Claude agents (meet them in §4). Each prospect moves through states: **Cold → Modeled → Engaged → Warm → In conversation**, with a visible **Gravity Score** that rises on every real interaction. (Quiet prospects sit in a parallel **Low-orbit** state: the email-first path.)

1. **Target** — Input: your **website URL** (Scout reads it and distills the product narrative + an ICP hypothesis you can edit before running) plus, optionally, a target-account list **or your HubSpot pipe** (sponsor — via API token): Scout mines it for open deals to accelerate, closed-lost to re-warm, and lookalikes of closed-won customers. Scout pushes both straight into Sillage over their MCP — `upsert_persona` (the ICP) + `add_top_accounts` (5–20 recommended: exactly our demo size) — spins up Champion/Competitor/Hiring agents on a watchlist, and launches a keyword signal run. The signals that come back do two jobs: **rank** who is worth building gravity around *right now* — person- and account-level, including *named* champions and job-changers — and **feed content angles** (an ICP-wide hiring wave → the plan speaks to scaling pains).
2. **Resolve** — identity now, contact data later. Sillage's company mappings hand over *matched people profiles* per account (`get_company_mapping`); FullEnrich **people search** (`POST /people/search`, synchronous, 0.25 credits) fills the gaps ("VP Sales at acme.com" → named people + LinkedIn URLs). X handles: xAI `x_search` on name + company → candidate handles → Claude keeps only bio-verified matches. A cheap **heat triage** (last-post / last-reaction dates, one actor call per prospect) then splits the list: socially active **hot** prospects get the full treatment; quiet ones drop to a **low-orbit** bucket (email-first, Sillage-timed) so no scrape credits or content effort are spent on empty feeds. **Full enrichment is deliberately just-in-time** (async, ~45–60s, poll it — success-only billing: 1 credit per work email, 10 per phone; the LinkedIn URL boosts hit rates): low-orbit prospects get emails immediately (their path *is* email), hot prospects only at the **Warm** trigger — we don't buy contact data until we intend to make contact. Cheaper, and a cleaner privacy story.
3. **Listen** — Scrape each **hot** prospect's public footprint:
   - **LinkedIn** via Apify (harvestapi actors): profile, their posts, and their activity feed — the comments + reactions they *leave* (public on LinkedIn; this is the "content they like" layer)
   - **the spoken web**: web search finds podcast / video / talk appearances → **Gradium speech-to-text** (sponsor) transcribes them → Listener mines the transcript for taste and stances the feed never shows (+ Sillage web signals: press, funding, events)
   - **X**, three reads — cheapest capable source first: **Apify X actors** pull raw timelines + following lists at scraper prices (`apidojo/tweet-scraper` ≈ $0.02/prospect; `xquik/x-follower-scraper` ≈ $0.15/1k follows); the **official X API** (pay-per-use since Feb 2026, instant signup) is the ToS-cleanest alternative (~$1 per 200 posts, ~$5 per 500 follows); **xAI `x_search`** (Agent Tools on `/v1/responses`, `allowed_x_handles` + date filters, ~$0.005/search) answers semantic questions with cited posts — "what does she argue about?". *(X likes went private in 2024 — we infer taste from replies/quotes/follows, and we say so if asked.)*
4. **Model** — One Claude subagent per prospect, in parallel, each emitting a structured **Buyer World Model** (schema in §6): topics, formats they reward, influencers in their orbit, stances, what they post vs. only consume — every claim tied to evidence URLs. A synthesis pass merges them into the **Gravity Map**: the shared conversation your ICP is already having, and where it happens.
5. **Create** — Claude generates a 5-day **gravity plan** from the world models, the Gravity Map, and Sillage's signal matches + generated briefs (`get_contents`) — three action types:
   - **Posts** (LinkedIn + X, format-tuned, 2 variants each to A/B): *"6 of your 10 targets engaged with tactical charts about SDR productivity this month — this post is that format, on that topic, tied to your product narrative."*
   - **Comments**: drafted replies on specific influencer posts where your prospects are active (found via `harvestapi/linkedin-post-search` on the world models' influencers) — you show up inside their feed *before* you ever post at them. (This is the "enter the bubble" move; posts alone are shouting from outside it.)
   - **Micro-gravity actions**: who to follow, whose posts to react to, and when each connection request goes out (note pre-drafted) — sequenced up a **familiarity ladder**: react → comment → follow → connect → outreach. These are recommendations with one-click deep links; the human executes (auto-actions on LinkedIn are a ban risk we don't need).
6. **Orbit → Outreach** — You publish (copy-paste, human-in-the-loop). Apify scrapes reactions/comments on *your* posts on a schedule. Engagers are matched against the target list; each match bumps the Gravity Score. Engagers who *aren't* on the list get a quick Claude ICP check — fits are enriched (FullEnrich) and added to the board + pushed into Sillage (`add_top_accounts`): **your post just sourced a prospect you never prospected.** **Trigger rule: 1 comment or 2+ reactions from a target → Warm.** The trigger fires the just-in-time FullEnrich enrichment (verified email + mobile land on the card in ~60s) and Claude drafts the touch: email + LinkedIn connection note referencing the actual engagement (phone there for the AE who wants it). **Stages 5–6 run as a standing loop**: propose posts + actions → human executes → Radar measures who engaged → one click **regenerates the plan** weighted by what actually hit (the cadence A/B tests itself). For every Warm prospect Radar also drafts a **tailored pitch brief** — their words, their topics, your proof — one click from a per-lead **Gamma deck**; and when the meeting is booked, it's tracked: **prospect → meeting conversion is the success metric**, alongside warm rate.

**The magic moment:** *"This VP Sales liked your Tuesday post. Here's her verified email, a connection note, and a draft that mentions it. Send?"* The email is no longer cold.

## 4. User journey — the crew & the screens

**The crew.** The §3 stages run as five named agents the user watches work — also the demo narrative:

| Agent | Stage | Job |
|---|---|---|
| **Scout** | 1 | reads your website → product narrative + ICP; sets up Sillage (persona, accounts, agents); reads signals; ranks |
| **Resolver** | 2 | names the buyers (Sillage mappings + FullEnrich search), finds X handles, heat-triages — contact data waits for intent |
| **Listener** | 3–4 | deep-scrapes the hot prospects; builds one Buyer World Model each, in parallel |
| **Strategist** | 5 | Gravity Map → the week's plan: posts, comments, micro-actions |
| **Radar** | 6 | watches your posts, matches engagers to targets, catches ICP-fit strangers, fills the warm queue, drafts per-lead pitch briefs (→ Gamma), retunes next week |

**The flow:**

```
paste your website ▸ crew runs (~2 min)
  ▸ prospect board, hottest first
  ▸ approve this week's gravity plan
  ▸ 15-min daily ritual: copy, click, done
  ▸ Radar fills the warm queue
  ▸ send the drafted warm email
  ▸ next week's plan tunes itself
```

**Screens (4):**

```
┌─ 1 · START ────────────────────────────┐
│ your website  [ acme.com             ] │
│ targets (opt) [ paste list / CSV     ] │
│                                        │
│ Scout: "Acme sells outbound-QA         │
│ software to B2B sales teams"  [edit]   │
│                                        │
│           [ ⚡ build gravity ]          │
└────────────────────────────────────────┘

┌─ 2 · PROSPECT BOARD ───────────────────┐
│ sort: heat ▾      9 hot · 3 low-orbit  │
│────────────────────────────────────────│
│ Jane K. — VP Sales @ Acme              │
│ heat 89 · score 34 · ENGAGED           │
│ rewards tactical charts · hates spam   │
│ [world model] [evidence]               │
│────────────────────────────────────────│
│ Tom R. — CRO @ Beta    ⚡ job change    │
│ heat 71 · score 8 · MODELED            │
└────────────────────────────────────────┘

┌─ 3 · GRAVITY PLAN — Tuesday ───────────┐
│ ○ POST · LinkedIn · 09:00       [copy] │
│   "3 reasons SDR productivity          │
│    collapsed after generic AI"         │
│   why: 6/10 targets reward charts      │
│ ○ COMMENT on J. Founder's post  [open] │
│   why: Jane + Tom engage with him      │
│ ○ FOLLOW 2 accounts on X        [open] │
│ ○ CONNECT Tom R. + note         [copy] │
│   ladder: react→comment→follow→connect │
└────────────────────────────────────────┘

┌─ 4 · WARM QUEUE ───────────────────────┐
│ ● Jane K. commented on your Tue post   │
│   "This. Exactly this."                │
│   state → WARM · score 34 → 52         │
│   ✉ email draft cites her comment      │
│   ⊕ connect note · ☎ verified mobile   │
│   [copy email] [open profile] [done]   │
└────────────────────────────────────────┘
```

**A week with Gravity** — the customer journey the 2:00 demo compresses:

| Day | You (≤15 min) | Gravity |
|---|---|---|
| Mon | paste site · skim hot list · approve plan | crew builds world models + the week's plan |
| Tue–Thu | daily ritual: 1 post, 2–3 comments, a few follows/reacts, 1 connect | Radar matches engagers, scores climb |
| Fri | Jane commented your chart → send the drafted email that cites it | flipped her Warm, drafted the touch |
| Mon +1 | approve plan v2 | doubled down on what hit |

**Reality-check on this journey** (each ask, verified):

| Ask | Verdict |
|---|---|
| Paste website → product understanding | ✅ Claude fetches + distills; you edit before the run |
| Find my best prospects + their socials | ✅ Sillage mappings + signals, FullEnrich search/enrich (§5) |
| Spot the ACTIVE ones (just changed job / posted / reacted) | ✅ activity dates from harvestapi actors + Sillage job-change signals → heat score |
| Content tailored to what they follow/write/react to + my product | ✅ the core loop (§3) |
| Post performance + who engaged, prospect or not | ✅ post-reactions/comments actors + target-list matching |
| Tell me who to follow / react to / connect with | ✅ generated from world models, sequenced on the familiarity ladder |
| Auto-execute those follows/connects/reactions | ❌ LinkedIn — no official API for member actions; cookie-bot automation risks the account → one-click deep links + drafted notes instead. ⚠️ X — official write endpoints exist (follow/like, pay-per-use), feasible later; manual on day 1 (automation-policy risk, zero demo value) |

## 5. Stack & sponsor usage

| Layer | Tool | Role |
|---|---|---|
| Reasoning & orchestration | **Claude managed agents** (Agent SDK `options.agents`) | the crew runs as named managed subagents (headless, schema-validated outputs); world models, gravity-map synthesis, content + outreach with cited evidence; auths via API key **or** a Claude subscription login |
| Intent signals | **Sillage** | via their **MCP** (OAuth, no key), driven by their open-source **skills pack**: Champion/Competitor/Hiring agents, keyword signal runs, company mappings with *named people* (stages 1–2), content angles (stage 5); REST (`sk_live_`) fallback |
| People data | **FullEnrich** | people **search** resolves identity (stage 2); **enrichment** is just-in-time — emails for the low-orbit path, email+phone at the Warm trigger and for ICP-fit engagers (stage 6); MCP server available |
| CRM | **HubSpot** | the pipe as input: open deals accelerated, closed-lost re-warmed, closed-won cloned as lookalikes (stage 1) |
| Voice data | **Gradium** | speech-to-text on podcast/video/talk appearances → taste signals for the world model (stage 3); TTS warm-brief as stretch |
| LinkedIn data | Apify | verified actors below |
| X data | Apify actors + X API + xAI `x_search` | raw timelines/follows via actors (often 10–100× cheaper), official pay-per-use API as ToS-cleanest path, handle-filtered semantic search on grok-4.1-fast; flat-rate demo alt: Hermes Agent (SuperGrok OAuth) |

**Apify actors** (all verified live 2026-07-08, all cookie-free; `harvestapi` runs ~2.5× cheaper than the `apimaestro` equivalents — keep those as fallback):

- Profile detail: `harvestapi/linkedin-profile-scraper` — $4/1k
- Their posts: `harvestapi/linkedin-profile-posts` — $1.50/1k
- Their activity (the "content they like" layer): `harvestapi/linkedin-profile-comments` + `harvestapi/linkedin-profile-reactions` — $2/1k
- Engagement on **our** posts (stage 6): `harvestapi/linkedin-post-reactions` + `harvestapi/linkedin-post-comments` — $2/1k, returns reactor name/headline/profile URL
- Influencer-post discovery for the comment plan (stage 5): `harvestapi/linkedin-post-search` — $1.50/1k
- People-search backup if FullEnrich search misses someone: `harvestapi/linkedin-company-employees` — title-filtered employees of a given company
- X timeline, cheap primary: `apidojo/tweet-scraper` — $0.40/1k, 50-tweet min; X following list: `xquik/x-follower-scraper` — $0.10–0.15/1k (the official X API stays the ToS-cleanest fallback for both)

Run each actor **once per prospect and cache** — the whole day's data for ~50 prospects costs under $20, and the demo must never depend on a live third party.

**App:** Next.js dashboard — onboard (paste your site) → prospect board (heat + Gravity Score ring + state) → world model view → gravity plan → warm queue. Backend: TypeScript; the crew is defined as **Claude managed agents** (Agent SDK `options.agents`, headless: `settingSources: []`, `permissionMode: "dontAsk"`, structured outputs via `outputFormat: json_schema`), with **both sponsor MCPs** — Sillage (`api.getsillage.com/api/mcp/v2`, OAuth workspace login, ~35 tools) and FullEnrich (`mcp.fullenrich.com/mcp`) — plus 6 custom tools (`read_website`, `hubspot_pipe`, `apify_run`, `x_api`, `x_search`, `gradium_stt`). Install Sillage's own playbooks (`npx skills add sillage-labs/skills`) so the agent drives the workspace their way: persona → accounts → coverage → agents → runs. Drop to REST (FullEnrich webhooks, Sillage `sk_live_`) only where a flow needs it. Models: `claude-sonnet-5` for the parallel prospect modelers, `claude-opus-4-8` (extended thinking) for gravity-map synthesis and content. Storage: SQLite/JSON — hackathon-grade.

```
repo: /app     next.js dashboard
      /agent   pipeline, tools, prompts
      /data    cached JSON
      /.skills sillage playbooks (committed)
      README.md · SPEC.md

.env: ANTHROPIC_API_KEY · APIFY_TOKEN
      FULLENRICH_API_KEY
      XAI_API_KEY · X_API_KEY (pay-per-use)
      SILLAGE: OAuth MCP (sk_live_ for REST)
```

## 6. Data model (build against this from hour one)

```jsonc
// BuyerWorldModel — one per prospect,
// produced by Claude as structured output
{
  "prospect": {
    "name": "", "title": "", "company": "",
    "linkedin_url": "", "x_handle": ""
  },
  "contact": { "emails": [], "phones": [] }, // FullEnrich
  "signals": [{
    "type": "job_change|champion|hiring|competitor|keyword",
    "detail": "", "source": "sillage"
  }],
  "topics": [
    { "topic": "", "stance": "", "evidence": ["url"] }
  ],
  "formats": [           // what they reward
    "tactical_lists", "charts", "contrarian_takes"
  ],
  "influencers": [
    { "name": "", "why": "", "evidence": ["url"] }
  ],
  "behavior": "poster|commenter|lurker",
  "gravity_score": 0,    // rises per engagement event
  "heat": 0,             // social activity: recency × freq
  "state": "cold|low_orbit|modeled|engaged|warm|in_conversation",
  "engagement_events": [{
    "post_id": "", "kind": "reaction|comment",
    "at": "", "quote": ""
  }]
}
```

Everything downstream (gravity map, content plan, warm queue, UI) reads this one shape. No claim without an `evidence` URL — that's the anti-slop rule and the demo's credibility.

## 7. Architecture

```
your website + target accounts
   │
   ▼
Scout ── product narrative + ICP hypothesis
   │
   ▼
Sillage MCP ── signals · named people · angles
   │
   ▼
FullEnrich ── name the people (search only)
   │
   ▼
heat triage ── hot → deep listen · quiet →
               low-orbit (email-first path)
   │
   ├───────────────────────┐
   ▼                       ▼
LinkedIn via Apify:     X via actors/API + search:
profile · posts ·       timeline · replies ·
activity feed           following
   │                       │
   └───────────┬───────────┘
               ▼
Claude ── Buyer World Models (parallel)
          + Gravity Map (across the ICP)
               ▼
Claude ── gravity plan: posts ·
          comments · micro-actions
               ▼
          human publishes
               ▼
Apify ── engagement on OUR posts
               ▼
match vs targets ── Gravity Score++
               ▼   (comment or 2 reactions → Warm)
FullEnrich ── JIT enrich: email + mobile
               ▼
Claude ── warm email + connect note

engagement results feed the next gravity
plan — the cadence tunes itself
```

## 8. Demo script (2:00 video · 1:30 live)

- **0:00** — Paste your website URL + 5 target companies. Scout reads the site and pitches your product back in one sentence. Hit **"Build gravity."**
- **0:20** — Sillage signals rank the accounts; FullEnrich people-search *names* ~8 buyers. Cards appear hottest-first, all **Cold** — no contact data bought yet.
- **0:45** — World model cards fill in: *"VP Sales @ X — rewards tactical charts, follows [founders], posts about outbound efficiency, publicly hates spam."* Every claim has a source link.
- **1:10** — Gravity Map + the week's plan: posts with *why-this-will-land* evidence, drafted comments on the influencers her feed is made of, and the follow/connect micro-actions on the familiarity ladder.
- **1:30** — The loop closes on a **real** post we published this morning: engagement scrape → a target's name lights up → score ticks, state flips to **Warm** → FullEnrich fires and her verified email + mobile pop onto the card → drafted email citing her comment. Send.
- **1:55** — *"We didn't automate cold outreach. We automated familiarity."*

The 2:00 cut is the **submitted video**. Live rounds (both!) allow only **1:30 of demo**: open on the pre-run pipeline at the 0:45 beat (filled world-model cards), then the plan, then the loop close. The strongest 90 seconds survive; the input-to-cards run lives in the video. The video time-lapses the real minutes of Sillage mapping + FullEnrich enrichment; the live demo opens on a pre-run workspace — never wait on an API on stage.

## 9. Build plan (9:30 → 17:30)

**At kickoff:** create the repo fresh at the event (rules: no prior commits — this spec becomes the first commit), connect the **Sillage MCP** (`claude mcp add --transport http sillage https://api.getsillage.com/api/mcp/v2` — OAuth login, no key) and install their skills pack (`npx skills add sillage-labs/skills`; check quota via `get_rate_limit`), confirm sponsor credit grants, buy a few dollars of X API pay-per-use credits (instant, no approval), and **publish the dogfood post by ~10:30** so it has all day to collect the engagement stage 6 will demo. (The content stage isn't built by 10:30 — run the product's content prompt v0 by hand; still honestly "written by the product." Dev tip: build the FullEnrich wrapper against their free test contact — zero credits burned.)

| Time | Milestone |
|---|---|
| 9:30–11:00 | Repo + keys wired, both sponsor MCPs connected + Sillage skills installed, 4 custom tool wrappers returning real data for 2–3 hand-picked prospects; dashboard skeleton; dogfood post published |
| 11:00–13:00 | Heat triage + Listen + Model end-to-end: world model cards rendering with evidence links |
| 13:00–15:00 | Gravity Map + plan generation (posts / comments / micro-actions) + Gravity Score & states in UI |
| 15:00–16:30 | Orbit loop: scrape dogfood-post engagement → warm queue → outreach drafts |
| 16:30–17:30 | Demo hardening on cached data, **record backup demo video**, README (description + sponsor/API credits — required by rules), Gamma pitch deck, submit |

**Team split (parallel from 9:30):** ① data plumbing (sponsor MCPs + 4 custom wrappers + caching) ② agent + prompts (world model, gravity map, content) ③ dashboard UI against the §6 schema ④ dogfood post, Gamma deck, pitch + demo video.

**Deliberate scope cuts:**

- **No auto-publishing** — humans copy-paste posts and comments (ToS-safe, and judges trust human-in-the-loop); monitoring is automated.
- **2–3 fully-modeled prospects** is enough for magic. Don't scale, deepen.
- **Cache every API response** to `/data` — the live demo never depends on a third-party API being up. Canned engagement JSON as fallback if the dogfood post underperforms.
- **Dogfood the viral side challenge:** the LinkedIn/X post about our project is generated *by the product*, tagging Anthropic, Sillage, FullEnrich, #agentic-gtm. Its engagement feeds the stage-6 demo — one artifact, three judging wins.
- **Gamma, in-product:** every warm lead's pitch brief is one click from a per-lead Gamma deck — the side challenge scored with product usage, not just our own pitch deck.
- **Stretch — Best use of Gradium** (their low-latency voice API): a 30-second Gradium-voiced **warm brief** the AE hears before calling a warm prospect. One TTS call on top of data we already have; add only if hours remain, skip without guilt.

## 10. Ethics & compliance

Behavioral models are built **only** from publicly available signals (public posts, public activity, follow lists) and licensed sponsor data (Sillage, FullEnrich). No private data, nothing behind auth walls — LinkedIn reads are public pages via established Apify actors, X reads go through the official paid API or xAI's sanctioned `x_search`, and sponsor APIs run per their ToS. GDPR posture: legitimate-interest B2B data, evidence shown transparently in-product, trivially deletable. Framing: *relevance engine*, never surveillance.

## 11. Judging map (100 pts)

- **Business impact (25):** cold reply rates are collapsing industry-wide; we shift the optimization target from response rate to familiarity. North-star metric: **warm rate** — % of targets who engage with you *before* first touch — plus warm-touch → meeting conversion. And content is one-to-many: one post works the whole ICP at once.
- **AI & workflow depth (25):** multi-stage Claude agent — parallel per-prospect subagents, structured outputs, both sponsor MCPs wired into the Agent SDK (Sillage driven by its own open-source skills pack), cross-prospect synthesis, evidence-cited generation, a feedback loop that retunes the plan. Reasoning over noisy social data, not just copywriting.
- **External data depth (25):** Sillage names the *who/when* (company mappings with people profiles, Champion/Competitor/Hiring agents, keyword signal runs); FullEnrich works twice — search finds the buyer, enrichment verifies targets in and engagers out; Apify + the X API + xAI `x_search` form the behavioral layer.
- **Presentation (25):** a live closed loop — company name → world model → published post → real engagement → warm email — plus a viral post written by the product itself and a Gamma deck.

## 12. Q&A prep (round 1 has 2:00 of questions)

- **"Isn't this creepy / legal?"** — Public signals only; X likes are private and we don't touch them; every claim in the UI links its public source; GDPR legitimate interest with data minimization — contact data is bought only at the moment of intent to contact — and one-click delete.
- **"How is this different from Clay / AI SDRs?"** — They optimize the *message*. We optimize the weeks *before* the message, and only fire when the buyer has already engaged with us. Different metric: familiarity, not reply rate.
- **"Does content-first actually convert?"** — Buyers reply to names they recognize; social sellers have known this for a decade — we make it operational and *measurable* per account (warm rate). The demo shows the mechanics closing end-to-end.
- **"What if the prospect never posts?"** — Lurkers still have a bubble: follows, their company's noise, their market's influencers. The world model degrades gracefully to company + market layers, and Sillage still times the approach. In-product, heat triage catches this upfront: quiet prospects route to the low-orbit email path instead of the content plan.
