import { getTravelStats } from "@/lib/travel-stats";
import type { StateRecord } from "@/lib/states-data";

type TravelStatsProps = {
  states: StateRecord[];
};

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-[9rem] rounded-lg border border-gray-200 bg-white px-5 py-3 text-center shadow-sm">
      <p className="text-2xl font-semibold tabular-nums text-gray-900">{value}</p>
      <p className="mt-1 text-sm text-gray-500">{label}</p>
    </div>
  );
}

export default function TravelStats({ states }: TravelStatsProps) {
  const { visitedCount, totalStates, percentCovered, totalCities } =
    getTravelStats(states);

  return (
    <div
      className="mb-6 flex flex-wrap justify-center gap-4"
      aria-label="Travel statistics"
    >
      <StatCard
        label="States visited"
        value={`${visitedCount}/${totalStates}`}
      />
      <StatCard label="US covered" value={`${percentCovered}%`} />
      <StatCard
        label="Cities recorded"
        value={totalCities.toLocaleString()}
      />
    </div>
  );
}
