import { NextRequest, NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";
import { env } from "cloudflare:workers";
import { getDb } from "../../../db";
import { reservations } from "../../../db/schema";

export const runtime = "edge";

function validPhone(value: string) { return /^[+0-9 () .-]{8,30}$/.test(value) && value.replace(/\D/g, "").length >= 8; }

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
  const today = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Paris", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
  if (!name || name.length > 80 || !validPhone(phone) || !/^\d{4}-\d{2}-\d{2}$/.test(date) || date < today || !/^\d{2}:\d{2}$/.test(time) || time < "10:00" || time > "23:00" || !Number.isInteger(guests) || guests < 1 || guests > 12 || note.length > 500) return NextResponse.json({ error: "Veuillez vérifier les informations saisies." }, { status: 400 });
  const id = crypto.randomUUID();
  try {
    await getDb().insert(reservations).values({ id, name, phone, date, time, guests, note });
    return NextResponse.json({ reference: id.slice(0, 8).toUpperCase() }, { status: 201 });
  } catch { return NextResponse.json({ error: "Service indisponible" }, { status: 503 }); }
}

function authorized(request: NextRequest) {
  const code = env.RESERVATION_ADMIN_CODE;
  return !!code && request.headers.get("x-admin-code") === code;
}

export async function GET(request: NextRequest) {
  if (!authorized(request)) return NextResponse.json({ error: "Accès refusé" }, { status: 401 });
  const rows = await getDb().select().from(reservations).orderBy(desc(reservations.createdAt)).limit(200);
  return NextResponse.json({ reservations: rows });
}

export async function PATCH(request: NextRequest) {
  if (!authorized(request)) return NextResponse.json({ error: "Accès refusé" }, { status: 401 });
  const body = await request.json() as { id?: string; status?: string };
  if (!body.id || !["pending", "confirmed", "declined"].includes(body.status ?? "")) return NextResponse.json({ error: "Données invalides" }, { status: 400 });
  await getDb().update(reservations).set({ status: body.status }).where(eq(reservations.id, body.id));
  return NextResponse.json({ ok: true });
}

export async function DELETE(request: NextRequest) {
  if (!authorized(request)) return NextResponse.json({ error: "Accès refusé" }, { status: 401 });
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Identifiant manquant" }, { status: 400 });
  await getDb().delete(reservations).where(eq(reservations.id, id));
  return NextResponse.json({ ok: true });
}
