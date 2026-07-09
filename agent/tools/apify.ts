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
  // X via Apify — often much cheaper than X API pay-per-use:
  // timelines ~$0.40/1k tweets vs $5/1k; follows ~$0.15/1k vs $10/1k.
  xTweets: "apidojo~tweet-scraper",
  xFollowing: "xquik~x-follower-scraper",
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
  return items?.flatMap((i) => (i.postedAt ? [i.postedAt] : [])) ?? null;
}

// X timeline via Apify (cheap path). Verified input schema: twitterHandles
// only — adding searchTerms too would bill a second query (50-tweet minimum
// applies per query).
export async function xTweetsViaApify(handle: string, max = 50) {
  const clean = handle.replace(/^@/, "");
  const items = await runActor<Record<string, unknown>>("xTweets", {
    twitterHandles: [clean],
    maxItems: Math.max(max, 50), // actor bills a 50-tweet minimum per query
    sort: "Latest",
  });
  return (
    items?.map((t) => ({
      text: (t.text ?? t.full_text ?? "") as string,
      created_at: (t.createdAt ?? t.created_at ?? "") as string,
      url: (t.url ?? t.twitterUrl ?? "") as string,
    })) ?? null
  );
}

// X following list via Apify (~100× cheaper than X API for follows).
// Verified input schema: twitterHandles + relation.
export async function xFollowingViaApify(handle: string, max = 50) {
  const clean = handle.replace(/^@/, "");
  const items = await runActor<Record<string, unknown>>("xFollowing", {
    twitterHandles: [clean],
    relation: "following",
    maxItems: max,
  });
  return (
    items?.map((u) => ({
      handle: (u.userName ?? u.username ?? u.screen_name ?? "") as string,
      name: (u.name ?? u.fullName ?? "") as string,
      bio: (u.description ?? u.bio ?? "") as string,
    })) ?? null
  );
}

// Radar: who engaged with OUR post.
export async function postEngagement(postUrl: string) {
  // demo caps: 30+30 covers any hackathon-day post at ~$0.12/scan
  const [reactions, comments] = await Promise.all([
    runActor<{ name?: string; headline?: string; profileUrl?: string; reactionType?: string }>(
      "postReactions",
      { posts: [postUrl], maxItems: 30 }
    ),
    runActor<{ name?: string; headline?: string; profileUrl?: string; text?: string }>(
      "postComments",
      { posts: [postUrl], maxItems: 30 }
    ),
  ]);
  return { reactions: reactions ?? [], comments: comments ?? [] };
}
