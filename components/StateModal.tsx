"use client";

import { useEffect } from "react";
import type { CityRecord } from "@/lib/states-data";

type StateModalProps = {
  stateName: string;
  cities: CityRecord[];
  onClose: () => void;
};

export default function StateModal({
  stateName,
  cities,
  onClose,
}: StateModalProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const hasCities = cities.length > 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="state-modal-title"
      onClick={onClose}
    >
      <div
        className="relative max-h-[85vh] w-full max-w-md overflow-y-auto rounded-lg bg-white p-6 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600"
          aria-label="Close"
        >
          <span className="text-2xl leading-none">&times;</span>
        </button>
        <h2
          id="state-modal-title"
          className="mb-4 pr-8 text-xl font-semibold text-gray-900"
        >
          {stateName}
        </h2>
        {hasCities ? (
          <div className="space-y-4">
            {cities.map((city) => (
              <div key={city.name}>
                <h3 className="font-medium text-gray-900">{city.name}</h3>
                {city.places.length > 0 ? (
                  <ul className="mt-1 list-disc space-y-1 pl-5 text-gray-700">
                    {city.places.map((place) => (
                      <li key={place}>{place}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-1 text-sm text-gray-500">No places listed.</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500">No cities recorded yet.</p>
        )}
      </div>
    </div>
  );
}
