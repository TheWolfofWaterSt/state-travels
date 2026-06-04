import type { NextRequest } from "next/server";
import { verifyAdminToken } from "@/lib/admin-token";

export const ADMIN_COOKIE = "admin_session";
export const ADMIN_COOKIE_VALUE = "authenticated";
export const ADMIN_AUTH_HEADER = "authorization";

export function isAdminAuthenticated(
  cookieValue: string | undefined
): boolean {
  return cookieValue === ADMIN_COOKIE_VALUE;
}

function getBearerToken(request: NextRequest): string | undefined {
  const auth = request.headers.get(ADMIN_AUTH_HEADER);
  if (auth?.startsWith("Bearer ")) {
    return auth.slice(7).trim();
  }
  return request.headers.get("x-admin-session")?.trim() ?? undefined;
}

export function isAdminRequest(request: NextRequest): boolean {
  if (isAdminAuthenticated(request.cookies.get(ADMIN_COOKIE)?.value)) {
    return true;
  }
  return verifyAdminToken(getBearerToken(request));
}
