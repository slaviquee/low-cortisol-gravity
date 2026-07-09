# Gravity

**Build enough relevance that your buyers discover you before you discover them.**

Everyone else automates cold outreach. Gravity automates *becoming a familiar
name before the outreach ever happens* — it maps each buyer's information
bubble from public signals, generates the content and micro-actions that put
you inside it, and only fires outreach once the buyer has engaged with *you*.

Built in one day at the **Agentic GTM Hackathon** (Station F, Paris) with
Anthropic, Sillage, and FullEnrich. Full product spec: [SPEC.md](SPEC.md).

## The loop

```
your website + target accounts
        ▼
Scout      reads your site → ICP → pushes persona + accounts into Sillage
Resolver   names the buyers (Sillage mappings + FullEnrich search) · heat triage
Listener   scrapes each hot prospect's public footprint → Buyer World Models
Strategist Gravity Map → taste cohorts → 5-day plan, one cohort per action
Radar      watches YOUR posts → per-cohort attribution → warm trigger →
           just-in-time enrichment → the touch
```

The magic moment: *"This VP Sales commented on your Tuesday post. Here's her
verified email, a connection note, and a draft that mentions it. Send?"*

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
```

Works with **zero API keys** — the whole loop runs on a cached demo world
(fictional prospects, scripted engagement) so nothing ever blocks on a third
party. Set `GRAVITY_MOCK=1` to force this deterministic demo world even on a
machine with credentials (recommended on stage). Add keys in `.env` (see
`.env.example`) and each layer switches to live data independently:

| Key | Unlocks |
|---|---|
| `ANTHROPIC_API_KEY` | Claude: website distillation, world models, gravity map, content, outreach (optional if the machine has a Claude Code subscription login — the managed crew rides it) |
| `SILLAGE_API_KEY` | intent signals + company→people mappings (`sk_live_` REST; MCP uses OAuth) |
| `FULLENRICH_API_KEY` | people search + just-in-time email/phone enrichment |
| `APIFY_TOKEN` | LinkedIn behavioral layer (harvestapi actors) |
| `X_API_KEY` | X timelines + following lists (pay-per-use; optional — with `APIFY_TOKEN` set, the cheaper X actors run first) |
| `HUBSPOT_TOKEN` | the CRM pipe as input: open deals accelerated, closed-lost re-warmed, closed-won → lookalikes |
| `GRADIUM_API_KEY` | speech-to-text on podcast/video appearances → taste signals in the world model |
| `XAI_API_KEY` | `x_search` — handle-filtered semantic search over X |

The agent layer follows Anthropic's **goals → loops → evals** pattern: each
agent has an explicit goal + self-eval rubric in its prompt; create↔measure
is a standing loop (`↻ regenerate from engagement`); every draft passes an
eval gate (their format · our voice · evidence · zero slop) with bounded
auto-revision. Buyers cluster into **taste cohorts** (chart skeptics,
systems thinkers, quiet execs) — every action targets a cohort, not a
person, in the **medium** its members reward (text / image / carousel /
video — read from the post types they engage with on LinkedIn and X);
engagement is scored per cohort; and the cohorts themselves learn:
a buyer who never reacts gets re-seated each cycle until they sit where
they engage. Serendipitous engagers join the cohort whose content pulled
them in. The **Company Brain** (`/brain`) persists across runs —
narrative, ICP, tone of voice from your own posts, content performance,
your steering notes, decisions-with-reasons — and every generation reads it.

Managed-crew auth: the Agent SDK picks up `ANTHROPIC_API_KEY`, or a Claude
subscription via `claude setup-token` → put the token in
`CLAUDE_CODE_OAUTH_TOKEN`. On a 401 (stale login), re-run `claude setup-token`
— the app just falls back to fixtures in the meantime.

Demo flow: paste a website → **build gravity** → watch the crew on
`/board` → review `/plan` → paste your published post URLs on `/warm` and hit
**scan engagement** to close the loop. With `GRAVITY_MOCK=1`, Radar uses the
deterministic engagement script instead. The warm trigger now runs
FullEnrich just-in-time for email + phone, drafts the email/connection note,
and gives the AE a call script for the post-engaged buyer.

## Stack

- **Claude managed agents** — the crew (scout / listener / strategist /
  radar) is defined via the Agent SDK's `options.agents`: sonnet runs the
  parallel prospect modelers, **fable writes every human-facing word**
  (posts, comments, outreach, pitch briefs) under an explicit anti-slop
  contract baked into the prompts — casual, specific, zero AI tells, with
  a banned-phrase eval gate behind it; headless with schema-validated
  outputs;
  authenticates with an API key **or** the team's Claude subscription login
  (`claude setup-token`), with direct `@anthropic-ai/sdk` as fallback;
  sponsor MCPs connect through the same SDK
  (`api.getsillage.com/api/mcp/v2`, `mcp.fullenrich.com/mcp`)
- **Sillage** — wired per their docs: headless = the documented REST API
  (`sk_live_`, real paths: `PUT /api/v2/persona`,
  `POST /api/v2/top-account-list/accounts`, `GET /api/v2/company-mappings`);
  interactive = their MCP (`SILLAGE_MCP=1` attaches
  `api.getsillage.com/api/mcp/v2` to the managed crew — OAuth 2.1 login);
  their skills pack is installed in-repo (`npx skills add sillage-labs/skills`
  → `.claude/skills/`), incl. `sillage-api`, their designed headless pairing
- **Demo spend guards** — a full live demo run stays in pocket-change
  territory: 5 accounts resolved, 3 people per mapping, email-only
  enrichment (phones only at Warm), 3 enrichments + 20 events per scan,
  serendipity deduped across rescans, 50-cap follows, 30+30 post
  engagement, one 4k-char transcript for the hottest prospect only
- **FullEnrich** — synchronous people search + async bulk enrichment,
  fired just-in-time: contact data is bought only at the moment of intent
- **Apify** — cookie-free LinkedIn actors by
  [HarvestAPI](https://apify.com/harvestapi): profile, posts, activity
  (comments/reactions), post engagement, post search; plus X actors
  (apidojo tweet-scraper, xquik follower-scraper) as the cheap raw-X path
- **X API** (pay-per-use, ToS-cleanest X path) + **xAI** Agent Tools `x_search`
- **HubSpot** — the pipe as input (open / closed-lost / won deals) ·
  **Gradium** — STT on the spoken web (podcasts, talks) for taste signals
- Next.js 15 · TypeScript · Tailwind v4 · Geist + IBM Plex Mono +
  Instrument Serif accents

## Deploy

Production deploys are driven by `.github/workflows/deploy.yml`. Every push to
`main` runs two CLI jobs:

- **Vercel production** — `vercel pull`, `vercel build --prod`, then
  `vercel deploy --prebuilt --prod`.
- **Railway production** — `railway up` against the `gravity` service in
  Guillaume DERAMCHI's personal Railway workspace.

GitHub secrets required by the workflow:

- `VERCEL_TOKEN`
- `RAILWAY_API_TOKEN`

Runtime API keys stay in the hosting providers, not in git. Configure these in
both Vercel and Railway production environments as needed:

- `ANTHROPIC_API_KEY`
- `SILLAGE_API_KEY`
- `FULLENRICH_API_KEY`
- `APIFY_TOKEN`
- `HUBSPOT_TOKEN`
- `GRADIUM_API_KEY`

Railway is the full long-running host: file state, background pipeline work,
and the Agent SDK subprocess run normally. Vercel can run the same API path,
but state/brain writes use temporary storage on serverless; set
`GRAVITY_MOCK=1` when you want the deterministic public-demo flow. Use a
durable store such as Redis/KV before relying on Vercel state across cold
starts.

## Ethics

Public signals only (posts, public activity, follow lists) + licensed sponsor
data. X likes are private and never touched. No auto-actions on LinkedIn —
humans execute with one-click deep links. Contact data is purchased only at
intent-to-contact (data minimization). Relevance engine, never surveillance.

## Credits

Sponsor APIs: [Anthropic Claude](https://www.anthropic.com) ·
[Sillage](https://getsillage.com) · [FullEnrich](https://fullenrich.com).
Third-party: [Apify](https://apify.com) + HarvestAPI & apidojo actors ·
[xAI](https://x.ai) · [X API](https://docs.x.com) ·
[Next.js](https://nextjs.org) · [Tailwind CSS](https://tailwindcss.com) ·
Google Fonts (Geist, IBM Plex Mono, Instrument Serif). All fixture people
and companies are fictional.

Team: [@slaviquee](https://github.com/slaviquee) ·
[@gibouu](https://github.com/gibouu) ·
[@gderamchi](https://github.com/gderamchi) — built with
[Claude Code](https://claude.com/claude-code). #agentic-gtm
