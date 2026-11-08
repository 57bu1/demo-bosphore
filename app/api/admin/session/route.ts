import { NextRequest, NextResponse } from "next/server";
import { isRestaurantSession } from "../../../admin-auth";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  return NextResponse.json({ authenticated: await isRestaurantSession(request) }, { headers: { "Cache-Control": "no-store" } });
}
