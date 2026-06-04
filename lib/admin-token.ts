import { createHmac, timingSafeEqual } from "crypto";

const TOKEN_SALT = "state-travels-admin-v1";

export function createAdminToken(): string {
  const secret = process.env.ADMIN_PASSWORD;
  if (!secret) {
    throw new Error("ADMIN_PASSWORD is not set");
  }
  return createHmac("sha256", secret).update(TOKEN_SALT).digest("hex");
}

export function verifyAdminToken(token: string | undefined | null): boolean {
  if (!token) return false;
  try {
    const expected = createAdminToken();
    if (token.length !== expected.length) return false;
    return timingSafeEqual(Buffer.from(token), Buffer.from(expected));
  } catch {
    return false;
  }
}
