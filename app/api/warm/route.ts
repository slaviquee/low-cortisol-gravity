import { NextResponse } from "next/server";
import { updateState } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function PATCH(req: Request) {
  const { id, sent } = await req.json();
  await updateState((s) => {
    const card = s.warm.find((w) => w.id === id);
    if (card) {
      card.sent = Boolean(sent);
      if (card.prospectId && sent) {
        const p = s.prospects.find((x) => x.id === card.prospectId);
        if (p) p.state = "in_conversation";
      }
    }
  });
  return NextResponse.json({ ok: true });
}
