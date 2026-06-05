"use client";

import StateAdminRow from "@/components/StateAdminRow";
import type { AdminStateDraft } from "@/lib/admin-state";

type AdminClientRowsProps = {
  states: AdminStateDraft[];
  onStateChange: (stateCode: string, state: AdminStateDraft) => void;
};

export default function AdminClientRows({
  states,
  onStateChange,
}: AdminClientRowsProps) {
  if (states.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-8 text-center text-sm text-gray-500">
        No states match your search or filter. Try a different query or show all
        states.
      </p>
    );
  }

  return (
    <div className="grid gap-4">
      {states.map((state) => (
        <StateAdminRow
          key={state.state_code}
          state={state}
          onChange={(updated) => onStateChange(state.state_code, updated)}
        />
      ))}
    </div>
  );
}
