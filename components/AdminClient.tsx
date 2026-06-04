"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import AdminClientRows from "@/components/AdminClientRows";
import LogoutButton from "@/components/LogoutButton";
import { getStoredAdminToken } from "@/lib/auth-client";
import type { StateRecord } from "@/lib/states-data";

export default function AdminClient() {
  const router = useRouter();
  const [adminToken, setAdminToken] = useState<string | null>(null);
  const [states, setStates] = useState<StateRecord[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);

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
        const res = await fetch("/api/states");
        if (!res.ok) {
          setLoadError("Could not load states from the database.");
          return;
        }
        const data = (await res.json()) as StateRecord[];
        setStates(data);
      } catch {
        setLoadError("Could not load states from the database.");
      }
    }

    load();
  }, [router]);

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

  if (!states) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <p className="text-gray-600">Loading states…</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold text-gray-900">
          Admin — Edit Visited States
        </h1>
        <LogoutButton />
      </div>
      <AdminClientRows states={states} adminToken={adminToken} />
    </main>
  );
}
