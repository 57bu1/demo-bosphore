import { NextRequest, NextResponse } from "next/server";
import { and, eq, ne } from "drizzle-orm";
import { getDb } from "../../../db";
import { reservations } from "../../../db/schema";
import { bookingSlots, parisNow, validDate } from "../../booking-slots";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const date = new URL(request.url).searchParams.get("date") ?? "";
  const now = parisNow();
  if (!validDate(date) || date < now.date) return NextResponse.json({ error: "Date invalide" }, { status: 400 });
  const rows = await getDb().select({ time: reservations.time }).from(reservations).where(and(eq(reservations.date, date), ne(reservations.status, "declined")));
  const taken = new Set(rows.map(row => row.time));
  const slots = bookingSlots.map(time => ({ time, available: !taken.has(time) && !(date === now.date && time <= now.time) }));
  return NextResponse.json({ date, slots }, { headers: { "Cache-Control": "no-store" } });
}
