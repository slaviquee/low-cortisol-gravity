// FullEnrich — identity early, contact data just-in-time (SPEC §3.2).
// search: synchronous people discovery (0.25 cr) — identity only.
// enrich: fired ONLY at the moment of intent (Warm trigger / low-orbit email).
// Real REST when FULLENRICH_API_KEY is set; fixture contacts otherwise.

import { FIXTURE_CONTACTS } from "@/data/fixtures";

const BASE = "https://app.fullenrich.com/api/v2";

function headers() {
  return {
    "content-type": "application/json",
    authorization: `Bearer ${process.env.FULLENRICH_API_KEY}`,
  };
}

export interface FoundPerson {
  name: string;
  title: string;
  company: string;
  linkedin_url: string;
}

export async function searchPeople(
  companyDomain: string,
  titles: string[]
): Promise<FoundPerson[] | null> {
  if (!process.env.FULLENRICH_API_KEY) return null;
  try {
    // Documented shape (docs.fullenrich.com/api/v2/people/search): filters
    // are TOP-LEVEL arrays of { value, exact_match, exclude } objects.
    const res = await fetch(`${BASE}/people/search`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({
        limit: 3,
        current_company_domains: [
          { value: companyDomain, exact_match: true, exclude: false },
        ],
        current_position_titles: titles.map((t) => ({
          value: t,
          exact_match: false,
          exclude: false,
        })),
      }),
      signal: AbortSignal.timeout(20_000),
    });
    if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
    const data = await res.json();
    const rows = data.data ?? data.people ?? data.results ?? data.items ?? [];
    return rows.map((p: Record<string, string>) => ({
      name:
        p.full_name ??
        p.name ??
        [p.first_name, p.last_name].filter(Boolean).join(" "),
      title: p.current_position_title ?? p.job_title ?? p.title ?? "",
      company: p.current_company_name ?? p.company_name ?? companyDomain,
      linkedin_url: p.linkedin_url ?? "",
    }));
  } catch (err) {
    console.error("[fullenrich:search]", err);
    return null;
  }
}

// Just-in-time enrichment. Real mode: bulk endpoint + poll (the
// hackathon-localhost choice — no webhook tunnel). Mock: fixture contacts
// after a short delay so the UI shows the "verifying contact…" beat.
// Spend rule: emails are 1 credit, phones are 10. Default to email-only;
// only the Warm flow (real intent to call) asks for the phone.
export async function enrichContact(
  person: {
    id: string;
    name: string;
    company: string;
    linkedin_url: string;
  },
  enrichFields: string[] = ["contact.work_emails"]
): Promise<{ email: string; phone: string }> {
  if (!process.env.FULLENRICH_API_KEY) {
    await new Promise((r) => setTimeout(r, 1500));
    return FIXTURE_CONTACTS[person.id] ?? { email: "", phone: "" };
  }
  try {
    // Documented shape (docs.fullenrich.com/api/v2/contact/enrich/bulk):
    // top-level "data" array; snake_case first_name/last_name; each contact
    // needs first+last + (domain OR company_name), or a linkedin_url.
    const [first, ...rest] = person.name.split(" ");
    const start = await fetch(`${BASE}/contact/enrich/bulk`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({
        name: `gravity-${person.id}`,
        data: [
          {
            first_name: first,
            last_name: rest.join(" ") || first,
            company_name: person.company,
            linkedin_url: person.linkedin_url || undefined,
            enrich_fields: enrichFields,
          },
        ],
      }),
      signal: AbortSignal.timeout(20_000),
    });
    if (!start.ok) throw new Error(`${start.status} ${await start.text()}`);
    const { enrichment_id } = await start.json();
    if (!enrichment_id) return { email: "", phone: "" };
    for (let i = 0; i < 12; i++) {
      await new Promise((r) => setTimeout(r, 5000));
      const poll = await fetch(`${BASE}/contact/enrich/bulk/${enrichment_id}`, {
        headers: headers(),
        signal: AbortSignal.timeout(15_000),
      });
      if (poll.status === 400) continue; // "try again in 30 seconds"
      const data = await poll.json();
      // results live in data[] records under contact_info
      const ci = data.data?.[0]?.contact_info ?? {};
      const email =
        ci.most_probable_work_email?.email ?? ci.work_emails?.[0]?.email ?? "";
      const phone =
        ci.most_probable_phone?.number ?? ci.phones?.[0]?.number ?? "";
      if (data.status === "FINISHED" || email) {
        return { email, phone };
      }
      if (["CANCELED", "CREDITS_INSUFFICIENT", "RATE_LIMIT"].includes(data.status)) {
        console.error("[fullenrich:enrich] terminal status:", data.status);
        return { email: "", phone: "" };
      }
    }
    return { email: "", phone: "" };
  } catch (err) {
    console.error("[fullenrich:enrich]", err);
    return { email: "", phone: "" };
  }
}
