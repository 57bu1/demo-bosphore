import { NextRequest, NextResponse } from "next/server";
import { clearSessionCookie } from "../../../admin-auth";

export const runtime = "edge";

export async function POST(request: NextRequest) {
  return NextResponse.json({ ok: true }, { headers: { "Set-Cookie": clearSessionCookie(request), "Cache-Control": "no-store" } });
}
