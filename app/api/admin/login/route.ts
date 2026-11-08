import { NextRequest, NextResponse } from "next/server";
import { sessionCookie, validCredentials } from "../../../admin-auth";

export const runtime = "edge";

export async function POST(request: NextRequest) {
  let body: { username?: string; password?: string };
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Données invalides" }, { status: 400 }); }
  if (!await validCredentials(String(body.username ?? ""), String(body.password ?? ""))) return NextResponse.json({ error: "Identifiant ou mot de passe incorrect." }, { status: 401 });
  return NextResponse.json({ ok: true }, { headers: { "Set-Cookie": await sessionCookie(request), "Cache-Control": "no-store" } });
}
