import { ensureSchema, getSql } from "@/lib/db";
import type { CityRecord, StateRecord, StateUpdatePayload } from "@/lib/states-data";

type StateRow = {
  id: number;
  state_code: string;
  state_name: string;
  visited: boolean;
  places: string | null;
};

type JoinRow = {
  state_code: string;
  state_name: string;
  visited: boolean;
  city_name: string | null;
  city_sort: number | null;
  place_name: string | null;
  place_sort: number | null;
};

function parseLegacyPlaces(places: string | null): string[] {
  if (!places?.trim()) return [];
  return places
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);
}

function normalizeCities(cities: CityRecord[]): CityRecord[] {
  return cities
    .map((city) => ({
      name: city.name.trim(),
      places: city.places.map((p) => p.trim()).filter(Boolean),
    }))
    .filter((city) => city.name.length > 0);
}

function normalizeActivities(activities: string[]): string[] {
  return activities.map((a) => a.trim()).filter(Boolean);
}

function buildStateRecordsFromJoin(rows: JoinRow[]): StateRecord[] {
  const byCode = new Map<
    string,
    {
      state_name: string;
      visited: boolean;
      cities: Map<string, { sort: number; places: Map<string, number> }>;
    }
  >();

  for (const row of rows) {
    let state = byCode.get(row.state_code);
    if (!state) {
      state = {
        state_name: row.state_name,
        visited: row.visited,
        cities: new Map(),
      };
      byCode.set(row.state_code, state);
    }

    if (!row.city_name) continue;

    let city = state.cities.get(row.city_name);
    if (!city) {
      city = { sort: row.city_sort ?? 0, places: new Map() };
      state.cities.set(row.city_name, city);
    }

    if (row.place_name) {
      city.places.set(row.place_name, row.place_sort ?? 0);
    }
  }

  return Array.from(byCode.entries())
    .sort((a, b) => a[1].state_name.localeCompare(b[1].state_name))
    .map(([state_code, state]) => ({
      state_code,
      state_name: state.state_name,
      visited: state.visited,
      activities: [] as string[],
      cities: Array.from(state.cities.entries())
        .sort((a, b) => a[1].sort - b[1].sort)
        .map(([name, city]) => ({
          name,
          places: Array.from(city.places.entries())
            .sort((a, b) => a[1] - b[1])
            .map(([placeName]) => placeName),
        })),
    }));
}

type ActivityRow = {
  state_code: string;
  activity_name: string | null;
  activity_sort: number | null;
};

function attachActivitiesToStates(
  states: StateRecord[],
  activityRows: ActivityRow[]
): StateRecord[] {
  const byCode = new Map<string, Map<string, number>>();

  for (const row of activityRows) {
    if (!row.activity_name) continue;
    let activities = byCode.get(row.state_code);
    if (!activities) {
      activities = new Map();
      byCode.set(row.state_code, activities);
    }
    activities.set(row.activity_name, row.activity_sort ?? 0);
  }

  return states.map((state) => {
    const activities = byCode.get(state.state_code);
    if (!activities) return state;
    return {
      ...state,
      activities: Array.from(activities.entries())
        .sort((a, b) => a[1] - b[1])
        .map(([name]) => name),
    };
  });
}

export async function migrateLegacyPlacesIfNeeded() {
  const sql = getSql();
  const states = (await sql`
    SELECT id, places
    FROM states
    WHERE places IS NOT NULL AND TRIM(places) <> ''
  `) as Pick<StateRow, "id" | "places">[];

  for (const state of states) {
    const existing = await sql`
      SELECT 1 FROM cities WHERE state_id = ${state.id} LIMIT 1
    `;
    if (existing.length > 0) continue;

    const segments = parseLegacyPlaces(state.places);
    for (let i = 0; i < segments.length; i++) {
      await sql`
        INSERT INTO cities (state_id, name, sort_order)
        VALUES (${state.id}, ${segments[i]}, ${i})
      `;
    }
    await sql`UPDATE states SET places = '' WHERE id = ${state.id}`;
  }
}

export async function fetchAllStates(): Promise<StateRecord[]> {
  await ensureSchema();
  await migrateLegacyPlacesIfNeeded();

  const sql = getSql();
  const rows = (await sql`
    SELECT
      s.state_code,
      s.state_name,
      s.visited,
      c.name AS city_name,
      c.sort_order AS city_sort,
      cp.name AS place_name,
      cp.sort_order AS place_sort
    FROM states s
    LEFT JOIN cities c ON c.state_id = s.id
    LEFT JOIN city_places cp ON cp.city_id = c.id
    ORDER BY s.state_name ASC, c.sort_order ASC, c.id ASC, cp.sort_order ASC, cp.id ASC
  `) as JoinRow[];

  const activityRows = (await sql`
    SELECT
      s.state_code,
      sa.name AS activity_name,
      sa.sort_order AS activity_sort
    FROM states s
    LEFT JOIN state_activities sa ON sa.state_id = s.id
    ORDER BY s.state_name ASC, sa.sort_order ASC, sa.id ASC
  `) as ActivityRow[];

  return attachActivitiesToStates(buildStateRecordsFromJoin(rows), activityRows);
}

async function replaceStateCities(stateId: number, cities: CityRecord[]) {
  const sql = getSql();
  const normalized = normalizeCities(cities);

  await sql`DELETE FROM cities WHERE state_id = ${stateId}`;
  await sql`UPDATE states SET places = '' WHERE id = ${stateId}`;

  for (let cityIndex = 0; cityIndex < normalized.length; cityIndex++) {
    const city = normalized[cityIndex];
    const inserted = (await sql`
      INSERT INTO cities (state_id, name, sort_order)
      VALUES (${stateId}, ${city.name}, ${cityIndex})
      RETURNING id
    `) as { id: number }[];

    const cityId = inserted[0]?.id;
    if (!cityId) continue;

    for (let placeIndex = 0; placeIndex < city.places.length; placeIndex++) {
      await sql`
        INSERT INTO city_places (city_id, name, sort_order)
        VALUES (${cityId}, ${city.places[placeIndex]}, ${placeIndex})
      `;
    }
  }
}

async function replaceStateActivities(stateId: number, activities: string[]) {
  const sql = getSql();
  const normalized = normalizeActivities(activities);

  await sql`DELETE FROM state_activities WHERE state_id = ${stateId}`;

  for (let i = 0; i < normalized.length; i++) {
    await sql`
      INSERT INTO state_activities (state_id, name, sort_order)
      VALUES (${stateId}, ${normalized[i]}, ${i})
    `;
  }
}

export async function updateState(
  stateCode: string,
  payload: StateUpdatePayload
): Promise<StateRecord | null> {
  await ensureSchema();

  const sql = getSql();
  const hasVisited = typeof payload.visited === "boolean";
  const hasCities = Array.isArray(payload.cities);
  const hasActivities = Array.isArray(payload.activities);

  if (!hasVisited && !hasCities && !hasActivities) {
    return null;
  }

  const existing = (await sql`
    SELECT id FROM states WHERE state_code = ${stateCode}
  `) as { id: number }[];

  if (existing.length === 0) return null;

  const stateId = existing[0].id;

  if (hasVisited) {
    await sql`
      UPDATE states SET visited = ${payload.visited} WHERE state_code = ${stateCode}
    `;
  }

  if (hasCities) {
    await replaceStateCities(stateId, payload.cities!);
  }

  if (hasActivities) {
    await replaceStateActivities(stateId, payload.activities!);
  }

  const all = await fetchAllStates();
  return all.find((s) => s.state_code === stateCode) ?? null;
}
