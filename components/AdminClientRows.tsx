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
