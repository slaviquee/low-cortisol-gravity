import { NextResponse } from "next/server";
import { updateState } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function PATCH(req: Request) {
  const { id, done } = await req.json();
  const s = await updateState((s) => {
    const item = s.plan.find((p) => p.id === id);
    if (item) item.done = Boolean(done);
  });
  return NextResponse.json({ ok: true, plan: s.plan });
}
