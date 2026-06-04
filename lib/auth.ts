import { cookies } from "next/headers";

export const ADMIN_COOKIE = "admin_session";
export const ADMIN_COOKIE_VALUE = "authenticated";

export function isAdminAuthenticated(
  cookieValue: string | undefined
): boolean {
  return cookieValue === ADMIN_COOKIE_VALUE;
}

export async function getAdminSession(): Promise<boolean> {
  const cookieStore = await cookies();
  return isAdminAuthenticated(cookieStore.get(ADMIN_COOKIE)?.value);
}
