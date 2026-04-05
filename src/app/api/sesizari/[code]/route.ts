import { NextResponse } from "next/server";
import { getSesizareByCode, getTimeline, getComments } from "@/lib/sesizari/repository";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    const sesizare = await getSesizareByCode(code);
    if (!sesizare) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    const [timeline, comments] = await Promise.all([
      getTimeline(sesizare.id),
      getComments(sesizare.id),
    ]);
    return NextResponse.json({ data: { sesizare, timeline, comments } });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
