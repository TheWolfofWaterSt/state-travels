import type { StateRecord } from "@/lib/states-data";

export async function fetchStatesFromApi(): Promise<StateRecord[]> {
  const res = await fetch(`/api/states?_=${Date.now()}`, {
    cache: "no-store",
    headers: {
      "Cache-Control": "no-cache, no-store",
      Pragma: "no-cache",
    },
  });
  if (!res.ok) throw new Error("Failed to load states");
  return res.json() as Promise<StateRecord[]>;
}
