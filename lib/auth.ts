import { cookies } from "next/headers";
import type { NextRequest } from "next/server";

export const ADMIN_COOKIE = "admin_session";
export const ADMIN_COOKIE_VALUE = "authenticated";

export function isAdminAuthenticated(
  cookieValue: string | undefined
): boolean {
  return cookieValue === ADMIN_COOKIE_VALUE;
}

export function isAdminRequest(request: NextRequest): boolean {
  return isAdminAuthenticated(request.cookies.get(ADMIN_COOKIE)?.value);
}

export async function getAdminSession(): Promise<boolean> {
  const cookieStore = await cookies();
  return isAdminAuthenticated(cookieStore.get(ADMIN_COOKIE)?.value);
}
