import type { StateRecord } from "@/lib/states-data";

export const US_STATE_TOTAL = 50;

export type TravelStats = {
  visitedCount: number;
  totalStates: number;
  percentCovered: number;
  totalCities: number;
};

export function getTravelStats(states: StateRecord[]): TravelStats {
  const usStates = states.filter((s) => s.state_code !== "DC");
  const visitedCount = usStates.filter((s) => s.visited).length;
  const percentCovered = Math.round((visitedCount / US_STATE_TOTAL) * 100);
  const totalCities = states.reduce((sum, s) => sum + s.cities.length, 0);

  return {
    visitedCount,
    totalStates: US_STATE_TOTAL,
    percentCovered,
    totalCities,
  };
}
