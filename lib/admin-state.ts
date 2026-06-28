import type { CityRecord, StateRecord } from "@/lib/states-data";

export type AdminCityDraft = {
  name: string;
  placesText: string;
};

export type AdminStateDraft = {
  state_code: string;
  state_name: string;
  visited: boolean;
  activitiesText: string;
  cities: AdminCityDraft[];
};

export function parsePlacesText(text: string): string[] {
  if (!text.trim()) return [];
  return text
    .split(",")
    .map((p) => p.trim())
    .filter(Boolean);
}

export function placesToText(places: string[]): string {
  return places.join(", ");
}

export function stateRecordToAdminDraft(state: StateRecord): AdminStateDraft {
  return {
    state_code: state.state_code,
    state_name: state.state_name,
    visited: state.visited,
    activitiesText: placesToText(state.activities),
    cities: state.cities.map((city) => ({
      name: city.name,
      placesText: placesToText(city.places),
    })),
  };
}

export function adminDraftToStateRecord(draft: AdminStateDraft): StateRecord {
  return {
    state_code: draft.state_code,
    state_name: draft.state_name,
    visited: draft.visited,
    activities: parsePlacesText(draft.activitiesText),
    cities: draft.cities.map((city) => ({
      name: city.name,
      places: parsePlacesText(city.placesText),
    })),
  };
}

export function normalizeCitiesForSave(cities: CityRecord[]): CityRecord[] {
  return cities
    .map((city) => ({
      name: city.name.trim(),
      places: city.places.map((p) => p.trim()).filter(Boolean),
    }))
    .filter((city) => city.name.length > 0);
}

export function adminDraftsEqual(
  a: AdminStateDraft,
  b: AdminStateDraft
): boolean {
  if (a.visited !== b.visited) return false;
  if (a.activitiesText !== b.activitiesText) return false;
  if (a.cities.length !== b.cities.length) return false;
  return a.cities.every(
    (city, i) =>
      city.name === b.cities[i].name &&
      city.placesText === b.cities[i].placesText
  );
}

export function getDirtyAdminDrafts(
  draft: AdminStateDraft[],
  saved: AdminStateDraft[]
): AdminStateDraft[] {
  return draft.filter((d) => {
    const baseline = saved.find((s) => s.state_code === d.state_code);
    return baseline && !adminDraftsEqual(d, baseline);
  });
}
