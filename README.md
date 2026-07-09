# Gravity

> Build enough relevance that your buyers discover you before you discover them.

Gravity is an agentic GTM system that maps the public information bubble around
target buyers, creates content and micro-actions that make your company familiar
to them, and only triggers outreach after real engagement.

**Final thesis:** outbound is not dead. Cold outbound is dead. Gravity makes
outreach warm before it is sent.

## The Problem

Cold outbound is collapsing because every inbox is filled with the same
AI-generated personalization. Most GTM AI tools start too late: they pick a lead,
enrich the contact, generate a fake-personal email, and send it into a crowded
inbox.

The missing step is familiarity: being recognized before you ask for a meeting.

## The Insight

Every buyer lives inside an information bubble: topics they reward, formats they
trust, people they follow, proof they need, and posts they engage with. Gravity
maps that bubble and helps you enter it before outreach.

Cold email tools personalize the message.
Gravity personalizes the path before the message.

## The Loop

```text
Website + target accounts
-> Scout: product narrative + ICP
-> Resolver: buyer identification
-> Listener: public Buyer World Models
-> Strategist: Gravity Map + taste cohorts + content plan
-> Radar: engagement detection
-> FullEnrich: just-in-time enrichment
-> Warm outreach draft
```

The magic moment: a buyer comments on your post, the Gravity Score jumps, the
state flips from `modeled` to `warm`, contact enrichment runs only then, and the
AE gets a brief grounded in the real engagement.

## What Is Built

| Surface | Status |
|---|---|
| Website-to-ICP Scout | Built |
| Prospect board | Built |
| Buyer World Model schema | Built |
| Cached demo accounts | Built |
| Evidence links per claim | Built |
| Gravity plan generator | Built |
| Warm queue | Built |
| Radar scripted demo scans | Built |
| Just-in-time enrichment flow | Built / mocked depending on keys |
| Pitch brief for warm lead | Built |
| Live LinkedIn auto-actions | Not built, intentionally human-in-the-loop |

## Demo Accounts

The cached demo uses five public company accounts represented in the room. Person
names and roles come from the hackathon roster provided to the team; company
claims come from public company sources. Placeholder contacts use reserved
`.example` emails so the demo does not imply private scraping.

| Account | Website | Demo buyer | Why it matters | Gravity action |
|---|---|---|---|---|
| Gamma | `https://gamma.app/` | Olivia Frenkel, GTM | AI-native creation, product storytelling, decks, docs, social content, API output | Mini-deck post: "The new GTM funnel starts before outreach" |
| Nabla | `https://www.nabla.com/` | Margaux Benoit, GTM Director | Healthcare AI needs workflow trust, clinician proof, and adoption evidence | Comment/post: "Healthcare AI adoption is won by workflow trust" |
| Airtable | `https://www.airtable.com/` | Vincent Gonnot, RVP EMEA | Enterprise AI must live inside workflows, data, permissions, and systems of record | Carousel/post: "AI GTM fails outside the revenue operating system" |
| Foundever | `https://foundever.com/` | Virginie Dupin, CMO | Global CX buyers care about brand trust, human connection, multilingual consistency | Thought-leadership post: "AI should reveal the human signal earlier" |
| Edenred | `https://www.edenred.com/` | Christa Dabilly, Head of Tech Stack for RevOps | RevOps buyers reward CRM hygiene, source trails, governance, and data minimization | RevOps view: source, score change, state, next step, CRM-ready fields |

Deep fixture data lives in [`data/fixtures.ts`](data/fixtures.ts). The five
default target domains are:

```ts
["gamma.app", "nabla.com", "airtable.com", "foundever.com", "edenred.com"]
```

Customer-side lead research for the judge/mentor companies lives in
[`docs/customer-lead-research.md`](docs/customer-lead-research.md), with a
code-ready export in [`data/customer-leads.ts`](data/customer-leads.ts). These
are potential customers for those companies, not internal stakeholders.

## Architecture

```text
Website / CRM / target list
-> Scout
-> Sillage signals + account mapping
-> FullEnrich people search
-> heat triage
-> public LinkedIn / X / web signals
-> Claude Buyer World Models
-> Gravity Map
-> content + micro-actions
-> Radar engagement scan
-> warm trigger
-> FullEnrich just-in-time enrichment
-> outreach draft + pitch brief
```

Sponsor APIs are part of the core loop:

- **Anthropic** powers the agent crew and content reasoning.
- **Sillage** supplies account signals, stakeholder mapping, and timing.
- **FullEnrich** runs only at the warm trigger for contact enrichment.

## Demo

1. Paste the website.
2. Load five target accounts: Gamma, Nabla, Airtable, Foundever, Edenred.
3. Watch Scout, Resolver, Listener, Strategist, and Radar run.
4. Open the board and inspect Buyer World Models with evidence links.
5. Approve the 5-day gravity plan.
6. Click `scan engagement`.
7. See a buyer flip Warm and receive a non-cold email draft.

Recommended stage mode:

```bash
GRAVITY_MOCK=1 npm run dev
```

This uses the deterministic cached workspace. Live APIs are optional proof, not
the stage path.

## Two-Minute Script

**0:00-0:20 - Input**

"Every GTM AI tool starts too late. They pick a lead, generate a fake-personal
cold email, and send it into an inbox full of other AI emails. Gravity starts
earlier. Here I paste our website and five target accounts: Gamma, Nabla,
Airtable, Foundever, and Edenred."

**0:20-0:45 - Agent Board**

"Scout reads our site and turns it into an ICP. Resolver finds the right buyers.
Listener builds a public Buyer World Model. Strategist clusters buyers into
taste cohorts. Radar watches for engagement. The important part: we do not buy
contact data yet."

**0:45-1:10 - World Model**

"Here is Gamma: product-led demos and visual storytelling. Here is Nabla:
workflow trust and healthcare adoption. Here is Airtable: operational AI inside
workflows. Every claim has an evidence link, so this is not hallucinated
personalization."

**1:10-1:35 - Gravity Plan**

"Instead of saying 'send five cold emails,' Gravity gives us a 5-day familiarity
plan: a LinkedIn post, comments inside the buyer's information bubble, and a
connection step. Each action explains which cohort it targets and why it should
land."

**1:35-1:55 - Magic Moment**

"Now Radar scans engagement. Margaux comments that workflow trust is the real
bottleneck. The score jumps, the state flips from Modeled to Warm, FullEnrich
runs just-in-time, and now we get a verified-contact slot plus a draft that
references the actual engagement."

**1:55-2:00 - Close**

"We did not automate spam. We automated becoming familiar before outreach."

## Run It

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

Useful checks:

```bash
npm run test:mock
npm run build
```

## Ethics

Public signals only. No LinkedIn auto-actions. No private likes. Contact
enrichment happens only when there is intent to contact. Humans approve all
posts, comments, connection notes, and emails.

## Credits

Sponsor APIs: [Anthropic Claude](https://www.anthropic.com) ·
[Sillage](https://www.getsillage.com/) · [FullEnrich](https://fullenrich.com/).

Team: [@slaviquee](https://github.com/slaviquee) ·
[@gibouu](https://github.com/gibouu) ·
[@gderamchi](https://github.com/gderamchi).
