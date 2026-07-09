import { NextResponse } from "next/server";
import { updateState } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function PATCH(req: Request) {
  const { id, sent, called, meeting } = await req.json();
  await updateState((s) => {
    const card = s.warm.find((w) => w.id === id);
    if (!card) return;
    if (sent !== undefined) card.sent = Boolean(sent);
    if (called !== undefined) card.called = Boolean(called);
    if (meeting !== undefined) card.meeting = Boolean(meeting);
    if (card.prospectId && (sent || called || meeting)) {
      const p = s.prospects.find((x) => x.id === card.prospectId);
      if (p) p.state = "in_conversation";
    }
    if (called) {
      s.log.push({
        at: new Date().toISOString(),
        agent: "radar",
        msg: `AE called ${card.name} after warm feed engagement`,
      });
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
