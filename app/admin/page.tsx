import Link from "next/link";
import { redirect } from "next/navigation";
import StateAdminRow from "@/components/StateAdminRow";

export const dynamic = "force-dynamic";
import { getAdminSession } from "@/lib/auth";
import { ensureStatesTable, getSql } from "@/lib/db";
import { seedStates } from "@/lib/seed";
import type { StateRecord } from "@/lib/states-data";

export default async function AdminPage() {
  if (!(await getAdminSession())) {
    redirect("/login");
  }

  try {
    await seedStates();
    await ensureStatesTable();
    const sql = getSql();
    const states = (await sql`
      SELECT state_code, state_name, visited, places
      FROM states
      ORDER BY state_name ASC
    `) as StateRecord[];

    return (
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-2xl font-semibold text-gray-900">
            Admin — Edit Visited States
          </h1>
          <Link
            href="/logout"
            className="rounded-md bg-gray-200 px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-300"
          >
            Logout
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {states.map((state) => (
            <StateAdminRow key={state.state_code} state={state} />
          ))}
        </div>
      </main>
    );
  } catch (error) {
    console.error("Admin page:", error);
    return (
      <main className="mx-auto max-w-5xl px-4 py-8">
        <p className="text-red-600">
          Could not load states. Check NEON_DATABASE_URL and run{" "}
          <code className="rounded bg-gray-100 px-1">POST /api/seed</code>.
        </p>
      </main>
    );
  }
}
