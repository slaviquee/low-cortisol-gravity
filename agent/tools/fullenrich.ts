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
    const res = await fetch(`${BASE}/people/search`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({
        filters: { company_domains: [companyDomain], job_titles: titles },
        limit: 3,
      }),
      signal: AbortSignal.timeout(20_000),
    });
    if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
    const data = await res.json();
    return (data.people ?? data.results ?? []).map(
      (p: Record<string, string>) => ({
        name: p.full_name ?? p.name ?? "",
        title: p.job_title ?? p.title ?? "",
        company: p.company_name ?? companyDomain,
        linkedin_url: p.linkedin_url ?? "",
      })
    );
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
    const [first, ...rest] = person.name.split(" ");
    const start = await fetch(`${BASE}/contact/enrich/bulk`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify({
        name: `gravity-${person.id}`,
        datas: [
          {
            firstname: first,
            lastname: rest.join(" ") || first,
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
      const c = data.datas?.[0]?.contact ?? {};
      if (data.status === "FINISHED" || c.most_probable_email) {
        return {
          email: c.most_probable_email ?? c.work_emails?.[0]?.email ?? "",
          phone: c.phones?.[0]?.number ?? "",
        };
      }
    }
    return { email: "", phone: "" };
  } catch (err) {
    console.error("[fullenrich:enrich]", err);
    return { email: "", phone: "" };
  }
}
