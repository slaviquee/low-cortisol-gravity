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
Strategist Gravity Map → 5-day plan: posts · comments · micro-actions
Radar      watches YOUR posts → warm trigger → just-in-time enrichment → the touch
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
party. Add keys in `.env` (see `.env.example`) and each layer switches to
live data independently:

| Key | Unlocks |
|---|---|
| `ANTHROPIC_API_KEY` | Claude: website distillation, world models, gravity map, content, outreach |
| `SILLAGE_API_KEY` | intent signals + company→people mappings (`sk_live_` REST; MCP uses OAuth) |
| `FULLENRICH_API_KEY` | people search + just-in-time email/phone enrichment |
| `APIFY_TOKEN` | LinkedIn behavioral layer (harvestapi actors) |
| `X_API_KEY` | X timelines + following lists (pay-per-use) |
| `XAI_API_KEY` | `x_search` — handle-filtered semantic search over X |

Demo flow: paste a website → **build gravity** → watch the crew on
`/board` → review `/plan` → hit **scan engagement** on `/warm` to close the
loop (warm trigger → enrichment → drafted touch, including a serendipitous
engager who was never on the target list).

## Stack

- **Claude** (`claude-sonnet-5` parallel prospect modelers, `claude-opus-4-8`
  synthesis + content) via `@anthropic-ai/sdk`; sponsor MCPs connect via the
  Claude Agent SDK / Claude Code (`api.getsillage.com/api/mcp/v2`,
  `mcp.fullenrich.com/mcp`)
- **Sillage** — Champion/Competitor/Hiring signal agents, keyword runs,
  named-people company mappings (their open-source skills pack drives setup:
  `npx skills add sillage-labs/skills`)
- **FullEnrich** — synchronous people search + async bulk enrichment,
  fired just-in-time: contact data is bought only at the moment of intent
- **Apify** — cookie-free LinkedIn actors by
  [HarvestAPI](https://apify.com/harvestapi): profile, posts, activity
  (comments/reactions), post engagement, post search
- **X API** (pay-per-use) + **xAI** Agent Tools `x_search`
- Next.js 15 · TypeScript · Tailwind v4 · IBM Plex Mono + Instrument Serif

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
Google Fonts (IBM Plex Mono, Instrument Serif). All fixture people and
companies are fictional.

Team: [@slaviquee](https://github.com/slaviquee) ·
[@gibouu](https://github.com/gibouu) ·
[@gderamchi](https://github.com/gderamchi) — built with
[Claude Code](https://claude.com/claude-code). #agentic-gtm
