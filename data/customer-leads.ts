// Customer-side lead packs for the Gravity demo.
// These are public lead targets that the represented companies could sell to.
// Do not infer current vendor usage from this file.

export type CustomerLead = {
  name: string;
  target_type: "account" | "public_person";
  country: string;
  buyer_persona: string;
  source_url: string;
  why_plausible: string;
  gravity_action: string;
  warm_trigger: string;
};

export type CustomerLeadPack = {
  company: string;
  represented_by: string[];
  website: string;
  sells_to: string;
  demo_priority: 1 | 2 | 3 | 4 | 5;
  leads: CustomerLead[];
};

export const CUSTOMER_LEAD_PACKS: CustomerLeadPack[] = [
  {
    company: "Nabla",
    represented_by: ["Margaux Benoit - GTM Director, event roster"],
    website: "https://www.nabla.com/",
    sells_to: "Health systems, hospitals, clinical operations, and clinician AI leaders",
    demo_priority: 5,
    leads: [
      {
        name: "Mayo Clinic Platform / Mayo Clinic",
        target_type: "account",
        country: "US",
        buyer_persona: "CMIO, AI governance, clinical transformation",
        source_url: "https://www.mayoclinicplatform.org/",
        why_plausible:
          "Large clinical AI platform with a mandate around real-world data, AI deployment, validation, and clinical translation.",
        gravity_action:
          "Create an evidence post on ambient AI validation, governance, and clinician workflow fit.",
        warm_trigger:
          "A Mayo AI leader engages with validation or clinical workflow governance content.",
      },
      {
        name: "Cedars-Sinai",
        target_type: "account",
        country: "US",
        buyer_persona: "Chief medical officer, digital health, virtual care",
        source_url: "https://www.cedars-sinai.org/",
        why_plausible:
          "Major health system with public digital-health and AI-enabled care activity.",
        gravity_action:
          "Draft a virtual-care workflow brief: visit audio to patient-ready summary.",
        warm_trigger:
          "A digital health stakeholder comments on reducing documentation burden.",
      },
      {
        name: "Mass General Brigham",
        target_type: "account",
        country: "US",
        buyer_persona: "Clinical AI implementation, CMIO, operations",
        source_url: "https://www.massgeneralbrigham.org/en/research-and-innovation/artificial-intelligence",
        why_plausible:
          "Sophisticated AI implementation buyer that will care about ROI, safety, drift, and clinician adoption.",
        gravity_action:
          "Publish an ROI checklist for clinician-facing AI: adoption, note quality, safety, and time saved.",
        warm_trigger:
          "Engagement on clinical AI evaluation or ambient documentation ROI content.",
      },
      {
        name: "AP-HP",
        target_type: "account",
        country: "France",
        buyer_persona: "DSI, innovation, hospital executive, clinical data lead",
        source_url: "https://www.aphp.fr/",
        why_plausible:
          "Largest French public hospital system; French-language workflow, sovereignty, and hospital adoption matter.",
        gravity_action:
          "Create a French-language page: assistant de consultation conforme aux workflows hospitaliers.",
        warm_trigger:
          "A French hospital innovation lead reacts to clinical workflow sovereignty content.",
      },
      {
        name: "CHU de Nantes",
        target_type: "account",
        country: "France",
        buyer_persona: "CMIO, research innovation, clinical NLP lead",
        source_url: "https://www.chu-nantes.fr/",
        why_plausible:
          "Academic hospital profile is credible for French clinical-note NLP and operational AI workflows.",
        gravity_action:
          "Demo French visit notes, structured summaries, and social determinants capture.",
        warm_trigger:
          "Engagement on French clinical-note AI or hospital workflow automation.",
      },
      {
        name: "Eric Topol, MD / Scripps",
        target_type: "public_person",
        country: "US",
        buyer_persona: "Clinical AI influencer and health-system advisor",
        source_url: "https://www.scripps.edu/about/leadership/eric-topol-biography/",
        why_plausible:
          "Public voice on AI, digital medicine, and making healthcare more human.",
        gravity_action:
          "Ask for critique of a short evidence deck: ambient AI restores clinician eye contact.",
        warm_trigger:
          "Engagement on a post about AI making medicine more human.",
      },
      {
        name: "Robert Wachter, MD / UCSF",
        target_type: "public_person",
        country: "US",
        buyer_persona: "Hospital medicine and clinical AI adoption KOL",
        source_url: "https://profiles.ucsf.edu/robert.wachter",
        why_plausible:
          "Known public voice on EHR burden, patient safety, and clinical AI adoption.",
        gravity_action:
          "Send a concise safety and ROI framework, not a sales pitch.",
        warm_trigger:
          "Engagement on clinical AI ROI, safety, or EHR burden content.",
      },
    ],
  },
  {
    company: "FullEnrich",
    represented_by: ["Benjamin Douablin - CEO, event roster", "Bakari Sumaila - VP Engineering, event roster"],
    website: "https://fullenrich.com/",
    sells_to: "GTM teams, RevOps, AI-agent builders, recruiting and marketplace operators",
    demo_priority: 5,
    leads: [
      {
        name: "Lovable",
        target_type: "account",
        country: "Sweden / global",
        buyer_persona: "Head of GTM, RevOps, founder",
        source_url: "https://lovable.dev/careers",
        why_plausible:
          "Fast-growing AI devtool with hiring and likely outbound, recruiting, agency, and startup-market motions.",
        gravity_action:
          "Build a signal-to-enrichment campaign for startup/founder prospect lists.",
        warm_trigger:
          "Public hiring or GTM scaling signal.",
      },
      {
        name: "Mistral AI",
        target_type: "account",
        country: "France / global",
        buyer_persona: "Enterprise sales, partnerships, GTM ops",
        source_url: "https://mistral.ai/careers/",
        why_plausible:
          "Enterprise AI vendor with international expansion and large-account selling needs.",
        gravity_action:
          "Build CIO, CTO, and AI-lead account lists with just-in-time enrichment.",
        warm_trigger:
          "International enterprise expansion or partner-launch signal.",
      },
      {
        name: "Mercor",
        target_type: "account",
        country: "US / global",
        buyer_persona: "Growth, marketplace operations, recruiting ops",
        source_url: "https://www.mercor.com/careers/",
        why_plausible:
          "AI talent marketplace depends on high-quality company and person data.",
        gravity_action:
          "Enrich target-company and expert-sourcing lists after intent signals.",
        warm_trigger:
          "Hiring, customer expansion, or expert-marketplace demand signal.",
      },
    ],
  },
  {
    company: "Sillage",
    represented_by: ["Arnaud Weiss - CEO, event roster"],
    website: "https://www.getsillage.com/",
    sells_to: "Enterprise sales teams that need signal-based account timing",
    demo_priority: 5,
    leads: [
      {
        name: "Hager Group",
        target_type: "account",
        country: "France / Germany",
        buyer_persona: "Innovation, operations, sales leadership",
        source_url: "https://hagergroup.com/en",
        why_plausible:
          "Industrial group with complex B2B buying committees and account timing signals.",
        gravity_action:
          "Map account triggers and stakeholder power maps for French/German industrial sales.",
        warm_trigger:
          "Leadership, expansion, product-line, or transformation announcement.",
      },
      {
        name: "Soprema",
        target_type: "account",
        country: "France / global",
        buyer_persona: "COO, digital transformation, sales leadership",
        source_url: "https://www.soprema.com/en/",
        why_plausible:
          "Industrial construction-materials company with distributed operations and enterprise accounts.",
        gravity_action:
          "Create triggered account briefs for mature industrial sales cycles.",
        warm_trigger:
          "New market, plant, sustainability, or construction-sector signal.",
      },
      {
        name: "Schmidt Groupe",
        target_type: "account",
        country: "France",
        buyer_persona: "Retail operations, IT, network enablement",
        source_url: "https://www.groupe.schmidt/",
        why_plausible:
          "Distributed retail/manufacturing network where timing and local stakeholder mapping matter.",
        gravity_action:
          "Build store-network account signals and expansion playbooks.",
        warm_trigger:
          "Store-network growth, training, or digital enablement signal.",
      },
    ],
  },
  {
    company: "Gamma",
    represented_by: ["Deeni Fatiha - Head of Product AI, event roster", "Olivia Frenkel - GTM, event roster", "Kristin Fracchia - Marketing, event roster"],
    website: "https://gamma.app/",
    sells_to: "Teams that create decks, docs, microsites, education, sales collateral, and launch content",
    demo_priority: 4,
    leads: [
      {
        name: "HubSpot Academy",
        target_type: "account",
        country: "US / global",
        buyer_persona: "Customer education, content operations",
        source_url: "https://academy.hubspot.com/",
        why_plausible:
          "High-volume education content can become decks, docs, courses, and microsites.",
        gravity_action:
          "Turn public course topics into Gamma-style decks and enablement assets.",
        warm_trigger:
          "New certification, webinar, or course-launch signal.",
      },
      {
        name: "Y Combinator Startup School",
        target_type: "account",
        country: "US / global",
        buyer_persona: "Program operations, founder education",
        source_url: "https://www.startupschool.org/",
        why_plausible:
          "Founders constantly create pitches, updates, demo docs, and launch material.",
        gravity_action:
          "Generate pitch-deck templates and founder-update assets from startup profiles.",
        warm_trigger:
          "New cohort, program content, or demo-prep cycle.",
      },
      {
        name: "Vercel",
        target_type: "account",
        country: "US / global",
        buyer_persona: "Developer relations, sales enablement, partnerships",
        source_url: "https://vercel.com/customers",
        why_plausible:
          "Frequent launches and customer stories are deck-ready and partner-ready.",
        gravity_action:
          "Convert customer stories into sales, partner, and launch decks.",
        warm_trigger:
          "Customer story, product launch, or partner announcement.",
      },
    ],
  },
  {
    company: "Anthropic",
    represented_by: ["Mathieu Fabing - GTM, event roster", "Lamis Mukta - Member of technical staff, event roster"],
    website: "https://www.anthropic.com/",
    sells_to: "Enterprise AI builders, agentic product teams, support, coding, and knowledge-work platforms",
    demo_priority: 5,
    leads: [
      {
        name: "Replit",
        target_type: "account",
        country: "US / global",
        buyer_persona: "AI product, platform, developer tools",
        source_url: "https://replit.com/ai",
        why_plausible:
          "Coding-agent product surface maps to Claude, tool use, and enterprise AI workflows.",
        gravity_action:
          "Create a Claude integration and eval brief for agentic coding workflows.",
        warm_trigger:
          "New AI coding feature, enterprise plan, or model-eval content.",
      },
      {
        name: "Intercom",
        target_type: "account",
        country: "US / Ireland / global",
        buyer_persona: "AI support product lead, customer ops AI",
        source_url: "https://www.intercom.com/fin",
        why_plausible:
          "Complex customer-support automation maps to Claude reasoning and tool-use workflows.",
        gravity_action:
          "Draft a high-complexity support workflow demo with safety and escalation logic.",
        warm_trigger:
          "AI support, Fin, or customer-service automation launch content.",
      },
      {
        name: "Notion",
        target_type: "account",
        country: "US / global",
        buyer_persona: "AI product, enterprise productivity",
        source_url: "https://www.notion.com/product/ai",
        why_plausible:
          "Knowledge-work AI assistant category fits Claude Enterprise and API positioning.",
        gravity_action:
          "Create enterprise knowledge-work workflow briefs by department.",
        warm_trigger:
          "New workspace AI feature, enterprise story, or knowledge-work content.",
      },
    ],
  },
  {
    company: "Gradium",
    represented_by: ["Constance Grisoni - Chief Growth Officer, event roster"],
    website: "https://gradium.ai/",
    sells_to: "Voice AI products, call platforms, language learning, conversational agents",
    demo_priority: 3,
    leads: [
      {
        name: "Duolingo",
        target_type: "account",
        country: "US / global",
        buyer_persona: "Voice learning product, AI tutoring",
        source_url: "https://www.duolingo.com/max",
        why_plausible:
          "Language learning benefits from low-latency STT/TTS and voice practice.",
        gravity_action:
          "Create a voice-practice demo with latency, expression, and multilingual proof points.",
        warm_trigger:
          "AI tutoring, speaking-practice, or language-learning product update.",
      },
      {
        name: "Aircall",
        target_type: "account",
        country: "France / global",
        buyer_persona: "Product, AI calls, call intelligence",
        source_url: "https://aircall.io/features/ai/",
        why_plausible:
          "Call platforms need transcription, summaries, and voice automation.",
        gravity_action:
          "Build an STT/TTS bakeoff brief for live call workflows.",
        warm_trigger:
          "AI call feature, transcription, or sales-call automation content.",
      },
      {
        name: "Character.AI",
        target_type: "account",
        country: "US / global",
        buyer_persona: "Voice, consumer AI product",
        source_url: "https://character.ai/",
        why_plausible:
          "Conversational characters benefit from expressive, scalable voice.",
        gravity_action:
          "Generate a sample voice-character experience and launch narrative.",
        warm_trigger:
          "Voice mode, character engagement, or creator-tool announcement.",
      },
    ],
  },
  {
    company: "Photoroom",
    represented_by: ["Elizabeth Coleon - VP GTM, event roster"],
    website: "https://www.photoroom.com/",
    sells_to: "Marketplaces, ecommerce platforms, retail brands, catalog teams",
    demo_priority: 5,
    leads: [
      {
        name: "Shopify",
        target_type: "account",
        country: "Canada / global",
        buyer_persona: "Merchant platform, app ecosystem, seller tooling",
        source_url: "https://www.shopify.com/",
        why_plausible:
          "Millions of merchants need product-image cleanup, listings, and campaign creative.",
        gravity_action:
          "Build a merchant photo-optimization API demo for product listings.",
        warm_trigger:
          "Seller tooling, app ecosystem, or merchant conversion content.",
      },
      {
        name: "Etsy",
        target_type: "account",
        country: "US / global",
        buyer_persona: "Marketplace seller success",
        source_url: "https://www.etsy.com/seller-handbook",
        why_plausible:
          "Marketplace listings rely on clear, consistent, high-converting product photos.",
        gravity_action:
          "Create a seller before/after photo campaign and API workflow.",
        warm_trigger:
          "Seller education, listing-quality, or holiday-prep content.",
      },
      {
        name: "Faire",
        target_type: "account",
        country: "US / global",
        buyer_persona: "Marketplace growth, brand success, seller tools",
        source_url: "https://www.faire.com/",
        why_plausible:
          "Wholesale brands need clean catalog imagery at scale.",
        gravity_action:
          "Build a batch product-image enhancement workflow for brand catalogs.",
        warm_trigger:
          "Catalog quality, brand onboarding, or marketplace-growth content.",
      },
    ],
  },
  {
    company: "Deel",
    represented_by: ["Ido Kissos - AI, event roster"],
    website: "https://www.deel.com/",
    sells_to: "Global employers, distributed teams, HR, finance, payroll, compliance",
    demo_priority: 4,
    leads: [
      {
        name: "Hugging Face",
        target_type: "account",
        country: "France / US / global",
        buyer_persona: "People ops, finance, global hiring",
        source_url: "https://huggingface.co/careers",
        why_plausible:
          "Global AI company with distributed hiring and international talent needs.",
        gravity_action:
          "Create a country-by-country hiring and payroll expansion brief.",
        warm_trigger:
          "New global roles, entity expansion, or hiring announcement.",
      },
      {
        name: "Lovable",
        target_type: "account",
        country: "Sweden / global",
        buyer_persona: "Founder, people ops, finance",
        source_url: "https://lovable.dev/careers",
        why_plausible:
          "Scaling startup likely faces international hiring and compliance complexity.",
        gravity_action:
          "Draft a 'hire globally without entities' sequence for scaling founders.",
        warm_trigger:
          "Hiring growth or new-country role signals.",
      },
      {
        name: "Mistral AI",
        target_type: "account",
        country: "France / global",
        buyer_persona: "People ops, finance, global mobility",
        source_url: "https://mistral.ai/careers/",
        why_plausible:
          "Multi-country AI expansion creates payroll, mobility, and compliance complexity.",
        gravity_action:
          "Generate a global hiring compliance one-pager by target country.",
        warm_trigger:
          "International office, hiring, or expansion signal.",
      },
    ],
  },
  {
    company: "Airtable",
    represented_by: ["Vincent Gonnot - RVP EMEA, event roster"],
    website: "https://www.airtable.com/",
    sells_to: "Enterprise operations, product, marketing, RevOps, and workflow teams",
    demo_priority: 5,
    leads: [
      {
        name: "Decathlon",
        target_type: "account",
        country: "France / global",
        buyer_persona: "Retail operations, product operations, merchandising",
        source_url: "https://www.decathlon.com/",
        why_plausible:
          "Large retail/product organization with complex catalog, launch, store, and operational workflows.",
        gravity_action:
          "Create an AI workflow-board demo for product launch and retail operations.",
        warm_trigger:
          "New market, product launch, store ops, or digital transformation content.",
      },
      {
        name: "BlaBlaCar",
        target_type: "account",
        country: "France / global",
        buyer_persona: "Product ops, marketplace ops, customer operations",
        source_url: "https://www.blablacar.com/",
        why_plausible:
          "Marketplace operations require cross-functional workflows and data visibility.",
        gravity_action:
          "Build a marketplace ops command center with AI actions and ownership.",
        warm_trigger:
          "Marketplace expansion, trust/safety, or product operations content.",
      },
      {
        name: "Back Market",
        target_type: "account",
        country: "France / global",
        buyer_persona: "Operations, seller success, quality, RevOps",
        source_url: "https://www.backmarket.com/",
        why_plausible:
          "Refurbished electronics marketplace has quality, seller, inventory, and support workflows.",
        gravity_action:
          "Create a governed workflow app for seller quality and customer operations.",
        warm_trigger:
          "Marketplace quality, seller enablement, or expansion announcement.",
      },
    ],
  },
  {
    company: "Foundever",
    represented_by: ["Virginie Dupin - Chief Marketing Officer, event roster"],
    website: "https://foundever.com/",
    sells_to: "Brands with large customer-support, CX, BPO, and multilingual service operations",
    demo_priority: 4,
    leads: [
      {
        name: "Air France-KLM",
        target_type: "account",
        country: "France / Netherlands / global",
        buyer_persona: "Customer experience, service operations, digital support",
        source_url: "https://www.airfranceklm.com/",
        why_plausible:
          "Airline customer service is multilingual, high-volume, and disruption-sensitive.",
        gravity_action:
          "Create a CX transformation brief around disruption handling and multilingual support.",
        warm_trigger:
          "Service disruption, digital support, or CX investment content.",
      },
      {
        name: "SNCF Connect",
        target_type: "account",
        country: "France",
        buyer_persona: "Customer operations, digital support, product CX",
        source_url: "https://www.sncf-connect.com/",
        why_plausible:
          "Travel platform with high-volume customer support and digital journey complexity.",
        gravity_action:
          "Build an AI-assisted customer-service workflow for travel changes and support routing.",
        warm_trigger:
          "New travel feature, disruption handling, or customer-support content.",
      },
      {
        name: "Carrefour",
        target_type: "account",
        country: "France / global",
        buyer_persona: "Retail CX, ecommerce support, store operations",
        source_url: "https://www.carrefour.com/",
        why_plausible:
          "Large retail organization with omnichannel customer support and multilingual markets.",
        gravity_action:
          "Create a CX brief on store, ecommerce, and loyalty-support orchestration.",
        warm_trigger:
          "Retail digital, loyalty, or ecommerce support announcement.",
      },
    ],
  },
  {
    company: "Edenred",
    represented_by: ["Christa Dabilly - Head of Tech Stack for RevOps, event roster"],
    website: "https://www.edenred.com/en",
    sells_to: "Employers, HR leaders, finance teams, mobility/fleet managers, merchants",
    demo_priority: 4,
    leads: [
      {
        name: "Capgemini",
        target_type: "account",
        country: "France / global",
        buyer_persona: "HR benefits, finance, employee experience",
        source_url: "https://www.capgemini.com/",
        why_plausible:
          "Large distributed workforce creates benefits, mobility, and employee-experience complexity.",
        gravity_action:
          "Create an HR benefits modernization brief by country and employee segment.",
        warm_trigger:
          "Hiring, employee experience, or workplace benefits content.",
      },
      {
        name: "Renault Group",
        target_type: "account",
        country: "France / global",
        buyer_persona: "Fleet, mobility, HR, finance",
        source_url: "https://www.renaultgroup.com/",
        why_plausible:
          "Large workforce and mobility context map to benefits, fleet, and payment programs.",
        gravity_action:
          "Generate a mobility and employee-benefits account brief.",
        warm_trigger:
          "Mobility, employee benefit, or fleet transformation signal.",
      },
      {
        name: "Sodexo",
        target_type: "account",
        country: "France / global",
        buyer_persona: "Partnerships, employee benefits, merchant ecosystem",
        source_url: "https://www.sodexo.com/",
        why_plausible:
          "Adjacent employee-benefits and services ecosystem makes partnership and competitive intelligence relevant.",
        gravity_action:
          "Build a partner/merchant ecosystem map with warm account paths.",
        warm_trigger:
          "Benefits, merchant, workplace, or partnership announcement.",
      },
    ],
  },
  {
    company: "Dataiku",
    represented_by: ["Carole Offredo - former CMO, event roster"],
    website: "https://www.dataiku.com/",
    sells_to: "Enterprise AI, data science, analytics, governance, and business teams",
    demo_priority: 5,
    leads: [
      {
        name: "Sanofi",
        target_type: "account",
        country: "France / global",
        buyer_persona: "Enterprise AI, data science, clinical operations",
        source_url: "https://www.sanofi.com/",
        why_plausible:
          "Global life-sciences company with high-value analytics, AI, governance, and research workflows.",
        gravity_action:
          "Create a regulated AI governance and use-case prioritization brief.",
        warm_trigger:
          "AI, R&D, clinical operations, or data-platform announcement.",
      },
      {
        name: "Societe Generale",
        target_type: "account",
        country: "France / global",
        buyer_persona: "Risk analytics, AI governance, data platform",
        source_url: "https://www.societegenerale.com/",
        why_plausible:
          "Banking AI requires governance, model risk, explainability, and enterprise adoption.",
        gravity_action:
          "Draft a financial-services AI governance account brief.",
        warm_trigger:
          "Risk, AI, data, or regulatory transformation content.",
      },
      {
        name: "Airbus",
        target_type: "account",
        country: "France / Europe / global",
        buyer_persona: "Manufacturing analytics, supply chain, enterprise AI",
        source_url: "https://www.airbus.com/",
        why_plausible:
          "Aerospace operations create complex AI, analytics, supply-chain, and governance use cases.",
        gravity_action:
          "Generate an aerospace AI use-case map by function and governance need.",
        warm_trigger:
          "Supply-chain, manufacturing, data, or AI program signal.",
      },
    ],
  },
  {
    company: "Fabriq",
    represented_by: ["Elise Rostaing - Global VP Marketing, event roster"],
    website: "https://fabriq.tech/",
    sells_to: "Industrial operations, factories, operational excellence, QHSE, digital transformation",
    demo_priority: 4,
    leads: [
      {
        name: "Michelin",
        target_type: "account",
        country: "France / global",
        buyer_persona: "Operational excellence, plant operations, QHSE",
        source_url: "https://www.michelin.com/",
        why_plausible:
          "Global manufacturing footprint with continuous improvement, quality, and plant-performance needs.",
        gravity_action:
          "Create a multi-site operational-excellence trigger map.",
        warm_trigger:
          "Plant modernization, quality, sustainability, or operations content.",
      },
      {
        name: "Schneider Electric",
        target_type: "account",
        country: "France / global",
        buyer_persona: "Industrial ops, digital transformation, continuous improvement",
        source_url: "https://www.se.com/",
        why_plausible:
          "Large industrial operations and digital transformation profile fit continuous-improvement workflows.",
        gravity_action:
          "Generate a Lean/digital shop-floor workflow brief.",
        warm_trigger:
          "Smart factory, operations, or digital transformation content.",
      },
      {
        name: "Saint-Gobain",
        target_type: "account",
        country: "France / global",
        buyer_persona: "Plant operations, OpEx, EHS, transformation",
        source_url: "https://www.saint-gobain.com/",
        why_plausible:
          "Industrial multi-site organization with manufacturing, quality, and operational-improvement needs.",
        gravity_action:
          "Build a plant-level improvement and action-tracking demo narrative.",
        warm_trigger:
          "Operations, industrial performance, or plant investment announcement.",
      },
    ],
  },
  {
    company: "Lenses.io",
    represented_by: ["Tun Shwe - AI Lead, event roster"],
    website: "https://lenses.io/",
    sells_to: "Kafka, data streaming, platform engineering, DevEx, and governance teams",
    demo_priority: 5,
    leads: [
      {
        name: "Doctolib",
        target_type: "account",
        country: "France / Europe",
        buyer_persona: "Platform engineering, data engineering, security",
        source_url: "https://www.doctolib.fr/",
        why_plausible:
          "Healthcare marketplace has high-throughput operational data, compliance, and platform reliability needs.",
        gravity_action:
          "Create a governed streaming-data access brief for platform teams.",
        warm_trigger:
          "Platform, data, reliability, or security engineering content.",
      },
      {
        name: "Back Market",
        target_type: "account",
        country: "France / global",
        buyer_persona: "Data platform, marketplace operations, DevEx",
        source_url: "https://www.backmarket.com/",
        why_plausible:
          "Marketplace operations depend on event streams, seller quality, inventory, and customer operations.",
        gravity_action:
          "Build a Kafka governance and self-service data workflow demo.",
        warm_trigger:
          "Data platform, marketplace operations, or engineering scale signal.",
      },
      {
        name: "BlaBlaCar",
        target_type: "account",
        country: "France / global",
        buyer_persona: "Platform engineering, trust and safety, data engineering",
        source_url: "https://www.blablacar.com/",
        why_plausible:
          "Large marketplace and mobility platform with real-time trust, matching, and operational data flows.",
        gravity_action:
          "Generate a streaming governance account brief for platform and data teams.",
        warm_trigger:
          "Trust/safety, marketplace, or data platform engineering content.",
      },
    ],
  },
  {
    company: "Accenture",
    represented_by: ["Krish Jhaveri - Product Lead AI, event roster"],
    website: "https://www.accenture.com/us-en",
    sells_to: "Large enterprises buying AI, data, cloud, operations, cybersecurity, and transformation services",
    demo_priority: 5,
    leads: [
      {
        name: "LVMH",
        target_type: "account",
        country: "France / global",
        buyer_persona: "AI transformation, customer experience, luxury retail operations",
        source_url: "https://www.lvmh.com/",
        why_plausible:
          "Luxury group with complex retail, customer experience, supply chain, and data transformation needs.",
        gravity_action:
          "Create a C-suite AI transformation and client-experience opportunity map.",
        warm_trigger:
          "Retail AI, customer experience, or digital transformation announcement.",
      },
      {
        name: "TotalEnergies",
        target_type: "account",
        country: "France / global",
        buyer_persona: "Energy transformation, data/AI, operations",
        source_url: "https://totalenergies.com/",
        why_plausible:
          "Energy enterprise with complex operations, transition, data, and risk-management programs.",
        gravity_action:
          "Generate an industry account brief on AI, operations, and transformation.",
        warm_trigger:
          "Energy transition, AI, data platform, or operations transformation signal.",
      },
      {
        name: "BNP Paribas",
        target_type: "account",
        country: "France / global",
        buyer_persona: "Banking transformation, AI/data, risk, operations",
        source_url: "https://group.bnpparibas/",
        why_plausible:
          "Large financial institution with regulated AI, data, cloud, and operations-transformation needs.",
        gravity_action:
          "Create a regulated AI and operational resilience account narrative.",
        warm_trigger:
          "AI governance, risk, cloud, or transformation content.",
      },
    ],
  },
  {
    company: "Goldman Sachs",
    represented_by: ["Efrat Ravid - Advisor, event roster"],
    website: "https://www.goldmansachs.com/",
    sells_to: "Late-stage companies, institutional clients, platforms, investors, and corporate finance leaders",
    demo_priority: 4,
    leads: [
      {
        name: "Mistral AI",
        target_type: "account",
        country: "France / global",
        buyer_persona: "CFO, corporate development, financing, strategic partnerships",
        source_url: "https://mistral.ai/",
        why_plausible:
          "High-growth AI company with potential financing, strategic partnership, and market-expansion needs.",
        gravity_action:
          "Create a capital-markets and strategic-partnership account brief.",
        warm_trigger:
          "Funding, partnership, enterprise expansion, or infrastructure announcement.",
      },
      {
        name: "Hugging Face",
        target_type: "account",
        country: "France / US / global",
        buyer_persona: "CFO, corporate development, ecosystem partnerships",
        source_url: "https://huggingface.co/",
        why_plausible:
          "Major AI platform with strategic ecosystem, partnership, and financing angles.",
        gravity_action:
          "Generate an AI infrastructure and ecosystem strategic brief.",
        warm_trigger:
          "Funding, enterprise platform, partnership, or open-source ecosystem signal.",
      },
      {
        name: "Back Market",
        target_type: "account",
        country: "France / global",
        buyer_persona: "CFO, corporate development, marketplaces, financing",
        source_url: "https://www.backmarket.com/",
        why_plausible:
          "Large marketplace business with financing, expansion, and strategic advisory relevance.",
        gravity_action:
          "Build a marketplace capital-markets trigger brief.",
        warm_trigger:
          "Expansion, profitability, funding, M&A, or market-entry announcement.",
      },
    ],
  },
];
