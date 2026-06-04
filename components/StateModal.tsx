"use client";

import { useEffect } from "react";

type StateModalProps = {
  stateName: string;
  places: string[];
  onClose: () => void;
};

export default function StateModal({
  stateName,
  places,
  onClose,
}: StateModalProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="state-modal-title"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md rounded-lg bg-white p-6 shadow-xl"
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
        {places.length > 0 ? (
          <ul className="list-disc space-y-1 pl-5 text-gray-700">
            {places.map((place) => (
              <li key={place}>{place}</li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No places recorded yet.</p>
        )}
      </div>
    </div>
  );
}
