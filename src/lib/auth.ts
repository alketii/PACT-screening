import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

const COOKIE = "pact_admin";
const MAX_AGE_SECONDS = 60 * 60 * 12;

function safeEqual(a: string, b: string) {
  const x = Buffer.from(a);
  const y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

/** Session token derived from the password, so changing the password signs everyone out. */
function sessionToken(): string | null {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) return null;
  return createHmac("sha256", password).update("pact-screening-admin-session-v1").digest("hex");
}

export function adminConfigured() {
  return Boolean(process.env.ADMIN_PASSWORD);
}

export async function isAdmin(): Promise<boolean> {
  const token = sessionToken();
  const value = (await cookies()).get(COOKIE)?.value;
  return Boolean(token && value && safeEqual(value, token));
}

export async function signIn(password: string): Promise<boolean> {
  const expected = process.env.ADMIN_PASSWORD;
  const token = sessionToken();
  if (!expected || !token || !safeEqual(password, expected)) return false;
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
  return true;
}

export async function signOut() {
  (await cookies()).delete(COOKIE);
}
