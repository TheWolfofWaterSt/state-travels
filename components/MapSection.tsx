"use client";

import { useCallback, useEffect, useState } from "react";
import UsMap from "@/components/UsMap";
import StateModal from "@/components/StateModal";
import TravelStats from "@/components/TravelStats";
import type { StateRecord } from "@/lib/states-data";

type MapSectionProps = {
  svgContent: string;
};

export default function MapSection({ svgContent }: MapSectionProps) {
  const [states, setStates] = useState<StateRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<StateRecord | null>(null);

  useEffect(() => {
    fetch("/api/states", { cache: "no-store" })
      .then((res) => res.json())
      .then((data: StateRecord[]) => {
        setStates(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleVisitedClick = useCallback((state: StateRecord) => {
    setModal(state);
  }, []);

  return (
    <>
      {loading ? (
        <p className="text-center text-gray-500">Loading map…</p>
      ) : (
        <>
          <TravelStats states={states} />
          <UsMap
            svgContent={svgContent}
            states={states}
            onVisitedClick={handleVisitedClick}
          />
        </>
      )}
      {modal && (
        <StateModal
          stateName={modal.state_name}
          cities={modal.cities}
          onClose={() => setModal(null)}
        />
      )}
    </>
  );
}
