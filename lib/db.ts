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

export async function ensureCitiesTables() {
  const sql = getSql();
  await sql`
    CREATE TABLE IF NOT EXISTS cities (
      id SERIAL PRIMARY KEY,
      state_id INTEGER NOT NULL REFERENCES states(id) ON DELETE CASCADE,
      name VARCHAR(255) NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS city_places (
      id SERIAL PRIMARY KEY,
      city_id INTEGER NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
      name VARCHAR(255) NOT NULL,
      sort_order INTEGER NOT NULL DEFAULT 0
    )
  `;
}

export async function ensureSchema() {
  await ensureStatesTable();
  await ensureCitiesTables();
}
