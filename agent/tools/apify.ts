// Apify actor runner — LinkedIn behavioral layer (harvestapi family).
// Real sync run when APIFY_TOKEN is set; null otherwise (callers use fixtures).

const ACTORS = {
  profile: "harvestapi~linkedin-profile-scraper",
  posts: "harvestapi~linkedin-profile-posts",
  profileComments: "harvestapi~linkedin-profile-comments",
  profileReactions: "harvestapi~linkedin-profile-reactions",
  postReactions: "harvestapi~linkedin-post-reactions",
  postComments: "harvestapi~linkedin-post-comments",
  postSearch: "harvestapi~linkedin-post-search",
  companyEmployees: "harvestapi~linkedin-company-employees",
} as const;

export type ActorKey = keyof typeof ACTORS;

export async function runActor<T = unknown>(
  key: ActorKey,
  input: Record<string, unknown>,
  timeoutMs = 60_000
): Promise<T[] | null> {
  const token = process.env.APIFY_TOKEN;
  if (!token) return null;
  try {
    const res = await fetch(
      `https://api.apify.com/v2/acts/${ACTORS[key]}/run-sync-get-dataset-items?token=${token}`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(input),
        signal: AbortSignal.timeout(timeoutMs),
      }
    );
    if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
    return (await res.json()) as T[];
  } catch (err) {
    console.error(`[apify:${key}]`, err);
    return null;
  }
}

// Heat triage input: cheapest possible read — latest posts, small cap.
export async function latestActivityDates(profileUrl: string) {
  const items = await runActor<{ postedAt?: string }>("posts", {
    profiles: [profileUrl],
    maxItems: 5,
  });
  return items?.map((i) => i.postedAt).filter(Boolean) ?? null;
}

// Radar: who engaged with OUR post.
export async function postEngagement(postUrl: string) {
  const [reactions, comments] = await Promise.all([
    runActor<{ name?: string; headline?: string; profileUrl?: string; reactionType?: string }>(
      "postReactions",
      { posts: [postUrl], maxItems: 100 }
    ),
    runActor<{ name?: string; headline?: string; profileUrl?: string; text?: string }>(
      "postComments",
      { posts: [postUrl], maxItems: 100 }
    ),
  ]);
  return { reactions: reactions ?? [], comments: comments ?? [] };
}
