export const ADMIN_SESSION_KEY = "state_travels_admin_token";

export function getStoredAdminToken(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(ADMIN_SESSION_KEY);
}

export function storeAdminToken(token: string): void {
  sessionStorage.setItem(ADMIN_SESSION_KEY, token);
}

export function clearAdminToken(): void {
  sessionStorage.removeItem(ADMIN_SESSION_KEY);
}
