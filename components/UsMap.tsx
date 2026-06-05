"use client";

import { useCallback, useEffect, useLayoutEffect, useRef } from "react";
import type { StateRecord } from "@/lib/states-data";

const VISITED_FILL = "#3B82F6";
const VISITED_HOVER_FILL = "#2563EB";
const UNVISITED_FILL = "#E5E7EB";
const STROKE = "#9CA3AF";

type UsMapProps = {
  svgContent: string;
  states: StateRecord[];
  onVisitedClick: (state: StateRecord) => void;
};

export default function UsMap({
  svgContent,
  states,
  onVisitedClick,
}: UsMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const statesByCode = useRef(new Map<string, StateRecord>());
  const svgMounted = useRef(false);
  const onVisitedClickRef = useRef(onVisitedClick);

  useEffect(() => {
    onVisitedClickRef.current = onVisitedClick;
  }, [onVisitedClick]);

  useEffect(() => {
    const map = new Map<string, StateRecord>();
    for (const s of states) {
      map.set(s.state_code, s);
    }
    statesByCode.current = map;
  }, [states]);

  const applyStyles = useCallback(() => {
    const root = containerRef.current;
    if (!root) return;

    const paths = root.querySelectorAll<SVGPathElement>("path[data-state-code]");
    paths.forEach((path) => {
      const code = path.getAttribute("data-state-code");
      if (!code) return;
      const record = statesByCode.current.get(code);
      const visited = record?.visited ?? false;

      path.style.fill = visited ? VISITED_FILL : UNVISITED_FILL;
      path.style.stroke = STROKE;
      path.style.strokeWidth = "0.75px";
      path.style.cursor = visited ? "pointer" : "default";
      path.style.pointerEvents = "auto";
      path.dataset.visited = visited ? "true" : "false";
    });
  }, []);

  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;

    if (!svgMounted.current) {
      root.innerHTML = svgContent;
      svgMounted.current = true;

      const paths = root.querySelectorAll<SVGPathElement>(
        "path[data-state-code]"
      );
      paths.forEach((path) => {
        path.addEventListener("mouseenter", () => {
          if (path.dataset.visited === "true") {
            path.style.fill = VISITED_HOVER_FILL;
          }
        });
        path.addEventListener("mouseleave", () => {
          if (path.dataset.visited === "true") {
            path.style.fill = VISITED_FILL;
          }
        });
      });
    }

    const handleClick = (e: MouseEvent) => {
      const target = e.target as Element;
      const hit = target.closest("path[data-state-code]");
      if (!hit) return;
      const code = hit.getAttribute("data-state-code");
      if (!code) return;
      const record = statesByCode.current.get(code);
      if (record?.visited) {
        onVisitedClickRef.current(record);
      }
    };

    root.addEventListener("click", handleClick);
    applyStyles();

    return () => {
      root.removeEventListener("click", handleClick);
    };
  }, [svgContent, applyStyles]);

  useLayoutEffect(() => {
    if (svgMounted.current) {
      applyStyles();
    }
  }, [states, applyStyles]);

  return (
    <div
      ref={containerRef}
      className="mx-auto w-full max-w-6xl [&_svg]:h-auto [&_svg]:w-full"
      aria-label="Map of US states visited"
    />
  );
}
