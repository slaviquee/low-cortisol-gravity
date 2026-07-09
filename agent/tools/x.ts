// X layer — two complementary reads (SPEC §3.3):
// x_api  : official pay-per-use API — raw timeline + following list
// x_search: xAI Agent Tools on /v1/responses — handle-filtered semantic search

export async function xTimeline(handle: string): Promise<unknown[] | null> {
  const key = process.env.X_API_KEY;
  if (!key) return null;
  try {
    const clean = handle.replace(/^@/, "");
    const user = await fetch(
      `https://api.x.com/2/users/by/username/${clean}`,
      { headers: { authorization: `Bearer ${key}` }, signal: AbortSignal.timeout(10_000) }
    ).then((r) => r.json());
    const id = user?.data?.id;
    if (!id) return null;
    const tweets = await fetch(
      `https://api.x.com/2/users/${id}/tweets?max_results=50&tweet.fields=created_at,public_metrics`,
      { headers: { authorization: `Bearer ${key}` }, signal: AbortSignal.timeout(10_000) }
    ).then((r) => r.json());
    return tweets?.data ?? null;
  } catch (err) {
    console.error("[x_api:timeline]", err);
    return null;
  }
}

export async function xFollowing(handle: string): Promise<unknown[] | null> {
  const key = process.env.X_API_KEY;
  if (!key) return null;
  try {
    const clean = handle.replace(/^@/, "");
    const user = await fetch(`https://api.x.com/2/users/by/username/${clean}`, {
      headers: { authorization: `Bearer ${key}` },
      signal: AbortSignal.timeout(10_000),
    }).then((r) => r.json());
    const id = user?.data?.id;
    if (!id) return null;
    const following = await fetch(
      `https://api.x.com/2/users/${id}/following?max_results=200`,
      { headers: { authorization: `Bearer ${key}` }, signal: AbortSignal.timeout(15_000) }
    ).then((r) => r.json());
    return following?.data ?? null;
  } catch (err) {
    console.error("[x_api:following]", err);
    return null;
  }
}

// Semantic questions with cited posts: "what does she argue about?"
export async function xSearch(
  question: string,
  handles?: string[]
): Promise<string | null> {
  const key = process.env.XAI_API_KEY;
  if (!key) return null;
  try {
    const res = await fetch("https://api.x.ai/v1/responses", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({
        model: "grok-4.1-fast",
        input: question,
        tools: [
          {
            type: "x_search",
            ...(handles?.length
              ? { allowed_x_handles: handles.map((h) => h.replace(/^@/, "")).slice(0, 10) }
              : {}),
          },
        ],
      }),
      signal: AbortSignal.timeout(30_000),
    });
    if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
    const data = await res.json();
    // Responses API: concatenate output text blocks
    const text =
      data.output
        ?.flatMap((o: { content?: { text?: string }[] }) => o.content ?? [])
        .map((c: { text?: string }) => c.text ?? "")
        .join("") ?? null;
    return text || null;
  } catch (err) {
    console.error("[x_search]", err);
    return null;
  }
}
