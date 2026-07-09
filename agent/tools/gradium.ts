// Gradium (sponsor) — speech-to-text for the listening layer. Web search
// finds a prospect's podcast / video / talk appearances; Gradium transcribes;
// Listener mines the transcript for taste signals the feed never shows.

export interface MediaAppearance {
  title: string;
  url: string;
}

// Discovery via xAI web_search (same /v1/responses Agent Tools as x_search).
export async function findMediaAppearances(
  name: string,
  company: string
): Promise<MediaAppearance[] | null> {
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
        input: `Find podcast episodes, YouTube videos, or conference talks featuring ${name} (${company}). Return only real appearances as lines of "title | url". If none, return "none".`,
        tools: [{ type: "web_search" }],
      }),
      signal: AbortSignal.timeout(30_000),
    });
    if (!res.ok) throw new Error(`${res.status}`);
    const data = await res.json();
    const text: string =
      data.output
        ?.flatMap((o: { content?: { text?: string }[] }) => o.content ?? [])
        .map((c: { text?: string }) => c.text ?? "")
        .join("") ?? "";
    if (!text || /^none/i.test(text.trim())) return [];
    return text
      .split("\n")
      .map((l) => l.split("|").map((s) => s.trim()))
      .filter((p) => p.length === 2 && p[1].startsWith("http"))
      .map(([title, url]) => ({ title, url }));
  } catch (err) {
    console.error("[gradium:discover]", err);
    return null;
  }
}

// Transcription. Endpoint shape per Gradium docs — confirm exact route with
// their team at the venue; the seam is what matters here.
export async function transcribe(audioUrl: string): Promise<string | null> {
  const key = process.env.GRADIUM_API_KEY;
  if (!key) return null;
  try {
    const res = await fetch("https://api.gradium.ai/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({ url: audioUrl }),
      signal: AbortSignal.timeout(120_000),
    });
    if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
    const data = await res.json();
    return data.text ?? data.transcript ?? null;
  } catch (err) {
    console.error("[gradium:stt]", err);
    return null;
  }
}
