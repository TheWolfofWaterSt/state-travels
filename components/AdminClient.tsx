"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import AdminClientRows from "@/components/AdminClientRows";
import LogoutButton from "@/components/LogoutButton";
import {
  adminDraftToStateRecord,
  getDirtyAdminDrafts,
  stateRecordToAdminDraft,
  type AdminStateDraft,
} from "@/lib/admin-state";
import { getStoredAdminToken } from "@/lib/auth-client";
import { fetchStatesFromApi } from "@/lib/states-api-client";
import type { StateRecord } from "@/lib/states-data";

type SaveStatus = "idle" | "saving" | "saved" | "error";
type VisitedFilter = "all" | "visited" | "not-visited";

function matchesSearch(state: AdminStateDraft, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  if (
    state.state_name.toLowerCase().includes(q) ||
    state.state_code.toLowerCase().includes(q)
  ) {
    return true;
  }
  if (state.state_code === "DC") {
    return (
      q.includes("district") ||
      q.includes("d.c") ||
      q.includes("d c") ||
      q === "dc"
    );
  }
  return false;
}

async function patchState(
  draft: AdminStateDraft,
  adminToken: string
): Promise<{ ok: true } | { ok: false; status: number; error: string }> {
  const state = adminDraftToStateRecord(draft);
  const res = await fetch(`/api/states/${state.state_code}`, {
    method: "PATCH",
    credentials: "same-origin",
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({
      visited: state.visited,
      cities: state.cities
        .map((city) => ({
          name: city.name.trim(),
          places: city.places,
        }))
        .filter((city) => city.name.length > 0),
    }),
  });

  if (res.status === 401) {
    return { ok: false, status: 401, error: "Session expired." };
  }

  if (!res.ok) {
    let message = "Could not save.";
    try {
      const data = (await res.json()) as { error?: string };
      if (data.error) message = data.error;
    } catch {
      /* use default */
    }
    return { ok: false, status: res.status, error: message };
  }

  return { ok: true };
}

export default function AdminClient() {
  const router = useRouter();
  const [adminToken, setAdminToken] = useState<string | null>(null);
  const [saved, setSaved] = useState<AdminStateDraft[] | null>(null);
  const [draft, setDraft] = useState<AdminStateDraft[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [status, setStatus] = useState<SaveStatus>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [visitedFilter, setVisitedFilter] = useState<VisitedFilter>("all");
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const filteredDraft = useMemo(() => {
    if (!draft) return [];
    return draft.filter((state) => {
      if (visitedFilter === "visited" && !state.visited) return false;
      if (visitedFilter === "not-visited" && state.visited) return false;
      return matchesSearch(state, searchQuery);
    });
  }, [draft, searchQuery, visitedFilter]);

  const listSummary = useMemo(() => {
    const isState = (state: AdminStateDraft) => state.state_code !== "DC";
    const totalStates = draft?.filter(isState).length ?? 0;
    const shownStates = filteredDraft.filter(isState).length;
    const includesDc = filteredDraft.some((state) => state.state_code === "DC");
    const dcSuffix = includesDc ? ", plus D.C." : "";

    return `Showing ${shownStates} of ${totalStates} states${dcSuffix}`;
  }, [draft, filteredDraft]);

  const dirtyStates = useMemo(() => {
    if (!draft || !saved) return [];
    return getDirtyAdminDrafts(draft, saved);
  }, [draft, saved]);

  const isDirty = dirtyStates.length > 0;

  const clearStatusSoon = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setStatus("idle");
      setErrorMessage(null);
    }, 4000);
  }, []);

  const applyFreshStates = useCallback((records: StateRecord[]) => {
    const adminDrafts = records.map(stateRecordToAdminDraft);
    setSaved(adminDrafts);
    setDraft(adminDrafts);
  }, []);

  useEffect(() => {
    const token = getStoredAdminToken();
    if (!token) {
      router.replace("/login");
      return;
    }
    setAdminToken(token);

    async function load() {
      try {
        await fetch("/api/seed", { method: "POST" });
        const data = await fetchStatesFromApi();
        applyFreshStates(data);
      } catch {
        setLoadError("Could not load states from the database.");
      }
    }

    load();
  }, [router, applyFreshStates]);

  const handleStateChange = (stateCode: string, state: AdminStateDraft) => {
    setDraft((current) =>
      current?.map((s) => (s.state_code === stateCode ? state : s)) ?? null
    );
  };

  const handleSaveAll = async () => {
    if (!adminToken || !draft || !saved || !isDirty) return;

    setStatus("saving");
    setErrorMessage(null);

    const results = await Promise.all(
      dirtyStates.map(async (state) => ({
        stateCode: state.state_code,
        stateName: state.state_name,
        result: await patchState(state, adminToken),
      }))
    );

    const unauthorized = results.find((r) => !r.result.ok && r.result.status === 401);
    if (unauthorized && !unauthorized.result.ok) {
      setStatus("error");
      setErrorMessage(unauthorized.result.error);
      clearStatusSoon();
      return;
    }

    const failed = results.filter((r) => !r.result.ok);

    if (failed.length > 0) {
      const names = failed.map((f) => f.stateName).join(", ");
      setStatus("error");
      setErrorMessage(`Could not save: ${names}.`);
      clearStatusSoon();
      return;
    }

    try {
      const fresh = await fetchStatesFromApi();
      applyFreshStates(fresh);
      router.refresh();
      setStatus("saved");
      clearStatusSoon();
    } catch {
      setStatus("error");
      setErrorMessage("Saved to the database, but could not reload. Refresh the page.");
      clearStatusSoon();
    }
  };

  if (!adminToken) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <p className="text-gray-600">Checking session…</p>
      </main>
    );
  }

  if (loadError) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-8">
        <p className="text-red-600">{loadError}</p>
      </main>
    );
  }

  if (!draft || !saved) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <p className="text-gray-600">Loading states…</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl">
      <div className="sticky top-0 z-20 border-b border-gray-200 bg-white/95 px-4 py-4 shadow-sm backdrop-blur sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-xl font-semibold text-gray-900 sm:text-2xl">
            Admin — States, Cities & Places
          </h1>
          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleSaveAll}
              disabled={!isDirty || status === "saving"}
              className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500"
            >
              {status === "saving"
                ? "Saving…"
                : isDirty
                  ? `Save all (${dirtyStates.length})`
                  : "Save all"}
            </button>
            <LogoutButton />
          </div>
        </div>
        {(status === "saved" || (status === "error" && errorMessage)) && (
          <p
            className={`mt-2 text-sm ${status === "saved" ? "text-green-600" : "text-red-600"}`}
          >
            {status === "saved" ? "All changes saved." : errorMessage}
            {status === "error" && errorMessage?.includes("Session") && (
              <>
                {" "}
                <Link href="/login" className="underline">
                  Log in again
                </Link>
              </>
            )}
          </p>
        )}

        <div className="mt-4 space-y-3">
          <label className="block">
            <span className="sr-only">Search states</span>
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name or code (e.g. Wisconsin, WI)"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </label>
          <div className="flex flex-wrap items-center gap-3">
            <div
              className="inline-flex rounded-md border border-gray-300 bg-gray-50 p-0.5"
              role="group"
              aria-label="Filter by visited status"
            >
              {(
                [
                  ["all", "All"],
                  ["visited", "Visited"],
                  ["not-visited", "Not visited"],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setVisitedFilter(value)}
                  className={`rounded px-3 py-1.5 text-sm font-medium transition-colors ${
                    visitedFilter === value
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                  aria-pressed={visitedFilter === value}
                >
                  {label}
                </button>
              ))}
            </div>
            <p className="text-sm text-gray-500">{listSummary}</p>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 sm:px-6">
        <AdminClientRows
          states={filteredDraft}
          onStateChange={handleStateChange}
        />
      </div>
    </main>
  );
}
