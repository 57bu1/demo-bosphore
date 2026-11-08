import { NextRequest, NextResponse } from "next/server";
import { and, desc, eq, ne } from "drizzle-orm";
import { getDb } from "../../../db";
import { reservations } from "../../../db/schema";
import { categories } from "../../menu-data";
import { bookingSlots, parisNow, validDate } from "../../booking-slots";
import { isRestaurantSession } from "../../admin-auth";

export const runtime = "edge";

function validPhone(value: string) { return /^[+0-9 () .-]{8,30}$/.test(value) && value.replace(/\D/g, "").length >= 8; }
const menuNames = new Set<string>(categories.flatMap(category => category.items.map(item => item.name)));

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Données invalides" }, { status: 400 }); }
  if (body.website) return NextResponse.json({ reference: "OK" });
  const name = String(body.name ?? "").trim();
  const phone = String(body.phone ?? "").trim();
  const date = String(body.date ?? "");
  const time = String(body.time ?? "");
  const guests = Number(body.guests);
  const note = String(body.note ?? "").trim();
  const items = Array.isArray(body.items) ? body.items : [];
  const now = parisNow();
  if (!name || name.length > 80 || !validPhone(phone) || !validDate(date) || date < now.date || !bookingSlots.includes(time) || (date === now.date && time <= now.time) || !Number.isInteger(guests) || guests < 1 || guests > 12 || note.length > 500 || items.length > 20 || items.some(item => !item || !menuNames.has(item.name) || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 20) || items.reduce((sum, item) => sum + item.quantity, 0) > 50) return NextResponse.json({ error: "Veuillez vérifier les informations saisies." }, { status: 400 });
  const id = crypto.randomUUID();
  try {
    await getDb().insert(reservations).values({ id, name, phone, date, time, guests, note, items: JSON.stringify(items) });
    return NextResponse.json({ reference: id.slice(0, 8).toUpperCase() }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (/UNIQUE constraint failed|SQLITE_CONSTRAINT_UNIQUE|reservations_active_slot_unique/i.test(message)) return NextResponse.json({ error: "Cette heure vient d’être réservée. Choisissez un autre créneau." }, { status: 409 });
    try {
      const taken = await getDb().select({ id: reservations.id }).from(reservations).where(and(eq(reservations.date, date), eq(reservations.time, time), ne(reservations.status, "declined"))).limit(1);
      if (taken.length) return NextResponse.json({ error: "Cette heure vient d’être réservée. Choisissez un autre créneau." }, { status: 409 });
    } catch { /* Keep the original service error. */ }
    return NextResponse.json({ error: "Service indisponible" }, { status: 503 });
  }
}

export async function GET(request: NextRequest) {
  if (!await isRestaurantSession(request)) return NextResponse.json({ error: "Accès refusé" }, { status: 401 });
  const rows = await getDb().select().from(reservations).orderBy(desc(reservations.createdAt)).limit(1000);
  return NextResponse.json({ reservations: rows }, { headers: { "Cache-Control": "no-store" } });
}

export async function PATCH(request: NextRequest) {
  if (!await isRestaurantSession(request)) return NextResponse.json({ error: "Accès refusé" }, { status: 401 });
  const body = await request.json() as { id?: string; status?: string };
  if (!body.id || !["pending", "confirmed", "declined"].includes(body.status ?? "")) return NextResponse.json({ error: "Données invalides" }, { status: 400 });
  try {
    await getDb().update(reservations).set({ status: body.status }).where(eq(reservations.id, body.id));
    return NextResponse.json({ ok: true });
  } catch (error) {
    if (/UNIQUE constraint failed|SQLITE_CONSTRAINT_UNIQUE|reservations_active_slot_unique/i.test(error instanceof Error ? error.message : String(error))) return NextResponse.json({ error: "Ce créneau est déjà réservé." }, { status: 409 });
    return NextResponse.json({ error: "Service indisponible" }, { status: 503 });
  }
}

export async function DELETE(request: NextRequest) {
  if (!await isRestaurantSession(request)) return NextResponse.json({ error: "Accès refusé" }, { status: 401 });
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Identifiant manquant" }, { status: 400 });
  await getDb().delete(reservations).where(eq(reservations.id, id));
  return NextResponse.json({ ok: true });
}
