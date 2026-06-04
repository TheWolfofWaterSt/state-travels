"use client";

import { useCallback, useRef, useState } from "react";
import type { StateRecord } from "@/lib/states-data";

type StateAdminRowProps = {
  state: StateRecord;
};

export default function StateAdminRow({ state: initial }: StateAdminRowProps) {
  const [state, setState] = useState(initial);
  const [savedField, setSavedField] = useState<"visited" | "places" | null>(
    null
  );
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showSaved = useCallback((field: "visited" | "places") => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setSavedField(field);
    timeoutRef.current = setTimeout(() => setSavedField(null), 2000);
  }, []);

  const patch = useCallback(
    async (body: { visited?: boolean; places?: string }) => {
      const res = await fetch(`/api/states/${state.state_code}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) return;
      const updated = (await res.json()) as StateRecord;
      setState(updated);
    },
    [state.state_code]
  );

  const onVisitedChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const visited = e.target.checked;
    setState((s) => ({ ...s, visited }));
    await patch({ visited });
    showSaved("visited");
  };

  const onPlacesBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    const places = e.target.value;
    if (places === state.places) return;
    setState((s) => ({ ...s, places }));
    await patch({ places });
    showSaved("places");
  };

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <span className="font-medium text-gray-900">{state.state_name}</span>
        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={state.visited}
              onChange={onVisitedChange}
              className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            Visited
          </label>
          {savedField === "visited" && (
            <span className="text-xs text-green-600 transition-opacity">
              Saved
            </span>
          )}
        </div>
      </div>
      <div className="relative">
        <input
          type="text"
          value={state.places}
          onChange={(e) =>
            setState((s) => ({ ...s, places: e.target.value }))
          }
          onBlur={onPlacesBlur}
          placeholder="e.g. Denver, Rocky Mountain National Park"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        {savedField === "places" && (
          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-green-600">
            Saved
          </span>
        )}
      </div>
    </div>
  );
}
