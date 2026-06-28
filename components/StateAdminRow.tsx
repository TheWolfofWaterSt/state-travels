"use client";

import type { AdminCityDraft, AdminStateDraft } from "@/lib/admin-state";

type StateAdminRowProps = {
  state: AdminStateDraft;
  onChange: (state: AdminStateDraft) => void;
};

function emptyCity(): AdminCityDraft {
  return { name: "", placesText: "" };
}

export default function StateAdminRow({ state, onChange }: StateAdminRowProps) {
  const updateCity = (index: number, city: AdminCityDraft) => {
    onChange({
      ...state,
      cities: state.cities.map((c, i) => (i === index ? city : c)),
    });
  };

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <span className="font-medium text-gray-900">{state.state_name}</span>
        <label className="flex items-center gap-2 text-sm text-gray-600">
          <input
            type="checkbox"
            checked={state.visited}
            onChange={(e) =>
              onChange({ ...state, visited: e.target.checked })
            }
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          Visited
        </label>
      </div>

      <div className="space-y-2">
        <label className="block text-xs font-medium uppercase tracking-wide text-gray-500">
          Activities (comma-separated)
        </label>
        <input
          type="text"
          value={state.activitiesText}
          onChange={(e) =>
            onChange({ ...state, activitiesText: e.target.value })
          }
          placeholder="e.g. Drove through, Yellowstone National Park"
          className="w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
      </div>

      <div className="space-y-3">
        <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
          Cities & places
        </p>
        {state.cities.map((city, cityIndex) => (
          <div
            key={cityIndex}
            className="rounded-md border border-gray-100 bg-gray-50 p-3"
          >
            <div className="mb-2 flex gap-2">
              <input
                type="text"
                value={city.name}
                onChange={(e) =>
                  updateCity(cityIndex, { ...city, name: e.target.value })
                }
                placeholder="City name (required to save)"
                className="min-w-0 flex-1 rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={() =>
                  onChange({
                    ...state,
                    cities: state.cities.filter((_, i) => i !== cityIndex),
                  })
                }
                className="shrink-0 rounded-md px-2 py-1.5 text-xs text-red-600 hover:bg-red-50"
              >
                Remove city
              </button>
            </div>
            <label className="block text-xs text-gray-500">
              Places (comma-separated)
            </label>
            <input
              type="text"
              value={city.placesText}
              onChange={(e) =>
                updateCity(cityIndex, { ...city, placesText: e.target.value })
              }
              placeholder="e.g. Half Moon Lake, Carson Park"
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-1.5 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
        ))}
        <button
          type="button"
          onClick={() =>
            onChange({
              ...state,
              cities: [...state.cities, emptyCity()],
            })
          }
          className="text-sm text-blue-600 hover:text-blue-800"
        >
          + Add city
        </button>
      </div>
    </div>
  );
}
