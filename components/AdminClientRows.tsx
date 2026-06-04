"use client";

import StateAdminRow from "@/components/StateAdminRow";
import type { StateRecord } from "@/lib/states-data";

type AdminClientRowsProps = {
  states: StateRecord[];
  adminToken: string;
};

export default function AdminClientRows({
  states,
  adminToken,
}: AdminClientRowsProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {states.map((state) => (
        <StateAdminRow
          key={state.state_code}
          state={state}
          adminToken={adminToken}
        />
      ))}
    </div>
  );
}
