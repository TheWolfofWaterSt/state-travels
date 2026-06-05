import { ensureSchema, getSql } from "@/lib/db";
import { US_STATES } from "@/lib/states-data";

export async function seedStates(): Promise<{ inserted: number }> {
  await ensureSchema();
  const sql = getSql();
  let inserted = 0;

  for (const state of US_STATES) {
    const result = await sql`
      INSERT INTO states (state_code, state_name, visited, places)
      VALUES (${state.state_code}, ${state.state_name}, false, '')
      ON CONFLICT (state_code) DO NOTHING
      RETURNING id
    `;
    if (result.length > 0) inserted++;
  }

  return { inserted };
}
