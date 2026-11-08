import { env } from "cloudflare:workers";

export const restaurantUsername = "lebosphore";
const cookieName = "bosphore_admin_session";
const encoder = new TextEncoder();

function secret() { return env.RESERVATION_ADMIN_CODE || ""; }
async function key() { return crypto.subtle.importKey("raw", encoder.encode(secret()), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]); }
function encode(bytes: Uint8Array) { return btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, ""); }
function decode(value: string) { const padded = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "="); return Uint8Array.from(atob(padded), char => char.charCodeAt(0)); }

export async function validCredentials(username: string, password: string) {
  return !!secret() && username === restaurantUsername && password === secret();
}

export async function sessionCookie(request: Request) {
  const expires = Date.now() + 7 * 24 * 60 * 60 * 1000;
  const payload = encode(encoder.encode(`${restaurantUsername}.${expires}`));
  const signature = encode(new Uint8Array(await crypto.subtle.sign("HMAC", await key(), encoder.encode(payload))));
  const secure = new URL(request.url).protocol === "https:" ? "; Secure" : "";
  return `${cookieName}=${payload}.${signature}; HttpOnly; SameSite=Strict; Path=/; Max-Age=604800${secure}`;
}

export async function isRestaurantSession(request: Request) {
  if (!secret()) return false;
  const cookie = request.headers.get("cookie")?.split(";").map(part => part.trim()).find(part => part.startsWith(`${cookieName}=`))?.slice(cookieName.length + 1);
  if (!cookie) return false;
  try {
    const [payload, signature] = cookie.split(".");
    if (!payload || !signature) return false;
    const valid = await crypto.subtle.verify("HMAC", await key(), decode(signature), encoder.encode(payload));
    if (!valid) return false;
    const [username, expires] = new TextDecoder().decode(decode(payload)).split(".");
    return username === restaurantUsername && Number(expires) > Date.now();
  } catch { return false; }
}

export function clearSessionCookie(request: Request) {
  const secure = new URL(request.url).protocol === "https:" ? "; Secure" : "";
  return `${cookieName}=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0${secure}`;
}
