import { NextResponse } from "next/server";
import { updateState } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function PATCH(req: Request) {
  const { id, sent, meeting } = await req.json();
  await updateState((s) => {
    const card = s.warm.find((w) => w.id === id);
    if (!card) return;
    if (sent !== undefined) card.sent = Boolean(sent);
    if (meeting !== undefined) card.meeting = Boolean(meeting);
    if (card.prospectId && (sent || meeting)) {
      const p = s.prospects.find((x) => x.id === card.prospectId);
      if (p) p.state = "in_conversation";
    }
    if (meeting) {
      s.log.push({
        at: new Date().toISOString(),
        agent: "radar",
        msg: `meeting booked with ${card.name} — prospect → meeting`,
      });
    }
  });
  return NextResponse.json({ ok: true });
}
