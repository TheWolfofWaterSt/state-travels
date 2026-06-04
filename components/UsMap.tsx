"use client";

import { useCallback, useEffect, useRef } from "react";
import type { StateRecord } from "@/lib/states-data";

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

      path.classList.remove(
        "fill-[#3B82F6]",
        "fill-[#E5E7EB]",
        "hover:fill-[#2563EB]",
        "cursor-pointer",
        "cursor-default",
        "stroke-[#9CA3AF]",
        "stroke-[0.75]"
      );
      path.classList.add("stroke-[#9CA3AF]", "stroke-[0.75]");
      if (visited) {
        path.classList.add("fill-[#3B82F6]", "hover:fill-[#2563EB]", "cursor-pointer");
      } else {
        path.classList.add("fill-[#E5E7EB]", "cursor-default");
      }
    });
  }, []);

  useEffect(() => {
    applyStyles();
  }, [states, applyStyles]);

  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;

    const handleClick = (e: MouseEvent) => {
      const target = e.target as Element;
      const path = target.closest("path[data-state-code]");
      if (!path) return;
      const code = path.getAttribute("data-state-code");
      if (!code) return;
      const record = statesByCode.current.get(code);
      if (record?.visited) {
        onVisitedClick(record);
      }
    };

    root.addEventListener("click", handleClick);
    return () => root.removeEventListener("click", handleClick);
  }, [onVisitedClick]);

  return (
    <div
      ref={containerRef}
      className="mx-auto w-full max-w-6xl [&_svg]:h-auto [&_svg]:w-full"
      dangerouslySetInnerHTML={{ __html: svgContent }}
    />
  );
}
