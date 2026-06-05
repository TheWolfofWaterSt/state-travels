"use client";

import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import UsMap from "@/components/UsMap";
import StateModal from "@/components/StateModal";
import TravelStats from "@/components/TravelStats";
import { fetchStatesFromApi } from "@/lib/states-api-client";
import type { StateRecord } from "@/lib/states-data";

type MapSectionProps = {
  svgContent: string;
};

export default function MapSection({ svgContent }: MapSectionProps) {
  const pathname = usePathname();
  const [states, setStates] = useState<StateRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<StateRecord | null>(null);

  const loadStates = useCallback(() => {
    setLoading(true);
    return fetchStatesFromApi()
      .then((data) => setStates(data))
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (pathname !== "/") return;
    loadStates();
  }, [pathname, loadStates]);

  useEffect(() => {
    const refreshIfVisible = () => {
      if (document.visibilityState === "visible" && pathname === "/") {
        loadStates();
      }
    };

    document.addEventListener("visibilitychange", refreshIfVisible);
    return () => document.removeEventListener("visibilitychange", refreshIfVisible);
  }, [pathname, loadStates]);

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
