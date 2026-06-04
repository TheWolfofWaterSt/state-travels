"use client";

import Link from "next/link";
import { useCallback, useRef, useState } from "react";
import type { StateRecord } from "@/lib/states-data";

type StateAdminRowProps = {
  state: StateRecord;
  adminToken: string;
};

type SaveStatus = "idle" | "saving" | "saved" | "error";

export default function StateAdminRow({
  state: initial,
  adminToken,
}: StateAdminRowProps) {
  const [saved, setSaved] = useState(initial);
  const [draft, setDraft] = useState(initial);
  const [status, setStatus] = useState<SaveStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isDirty =
    draft.visited !== saved.visited || draft.places !== saved.places;

  const clearStatusSoon = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setStatus("idle");
      setErrorMessage(null);
    }, 3000);
  }, []);

  const handleSave = async () => {
    if (!isDirty) return;

    setStatus("saving");
    setErrorMessage(null);

    const res = await fetch(`/api/states/${saved.state_code}`, {
      method: "PATCH",
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminToken}`,
      },
      body: JSON.stringify({
        visited: draft.visited,
        places: draft.places,
      }),
    });

    if (res.status === 401) {
      setStatus("error");
      setErrorMessage("Session expired.");
      clearStatusSoon();
      return;
    }

    if (!res.ok) {
      let message = "Could not save. Try again.";
      try {
        const data = (await res.json()) as { error?: string };
        if (data.error) message = data.error;
      } catch {
        /* use default */
      }
      setStatus("error");
      setErrorMessage(message);
      clearStatusSoon();
      return;
    }

    const updated = (await res.json()) as StateRecord;
    setSaved(updated);
    setDraft(updated);
    setStatus("saved");
    clearStatusSoon();
  };

  return (
    <div className="flex flex-col gap-2 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <span className="font-medium text-gray-900">{draft.state_name}</span>
        <label className="flex items-center gap-2 text-sm text-gray-600">
          <input
            type="checkbox"
            checked={draft.visited}
            onChange={(e) =>
              setDraft((s) => ({ ...s, visited: e.target.checked }))
            }
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          Visited
        </label>
      </div>
      <input
        type="text"
        value={draft.places}
        onChange={(e) => setDraft((s) => ({ ...s, places: e.target.value }))}
        placeholder="e.g. Denver, Rocky Mountain National Park"
        className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
      />
      <div className="flex flex-wrap items-center justify-between gap-2">
        <button
          type="button"
          onClick={handleSave}
          disabled={!isDirty || status === "saving"}
          className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500"
        >
          {status === "saving" ? "Saving…" : "Save"}
        </button>
        {status === "saved" && (
          <span className="text-xs text-green-600">Saved</span>
        )}
        {status === "error" && errorMessage && (
          <span className="text-xs text-red-600">
            {errorMessage}{" "}
            {errorMessage.includes("Session") && (
              <Link href="/login" className="underline">
                Log in again
              </Link>
            )}
          </span>
        )}
      </div>
    </div>
  );
}
