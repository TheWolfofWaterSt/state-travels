import { neon } from "@neondatabase/serverless";

export function getSql() {
  const url = process.env.NEON_DATABASE_URL;
  if (!url) {
    throw new Error("NEON_DATABASE_URL is not set");
  }
  return neon(url);
}

export async function ensureStatesTable() {
  const sql = getSql();
  await sql`
    CREATE TABLE IF NOT EXISTS states (
      id SERIAL PRIMARY KEY,
      state_code VARCHAR(2) UNIQUE NOT NULL,
      state_name VARCHAR(50) NOT NULL,
      visited BOOLEAN DEFAULT FALSE,
      places TEXT DEFAULT ''
    )
  `;
}
