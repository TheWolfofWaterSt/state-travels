"use client";

import { useCallback, useEffect, useLayoutEffect, useRef } from "react";
import { LABEL_OFFSETS } from "@/lib/map-label-offsets";
import {
  LABEL_FILL_UNVISITED,
  LABEL_FILL_VISITED,
  LABEL_STROKE,
  LABEL_STROKE_WIDTH,
  labelFontSize,
  MAP_STROKE,
  UNVISITED_FILL,
  VISITED_FILL,
  VISITED_HOVER_FILL,
} from "@/lib/map-styles";
import type { StateRecord } from "@/lib/states-data";

const SVG_NS = "http://www.w3.org/2000/svg";
const LABEL_LAYER_VERSION = "bbox-v3";

type UsMapProps = {
  svgContent: string;
  states: StateRecord[];
  onVisitedClick: (state: StateRecord) => void;
};

function getMapRegions(root: HTMLElement): SVGElement[] {
  return Array.from(root.querySelectorAll<SVGElement>("[data-state-code]"));
}

function getLabelsLayer(svg: SVGSVGElement): SVGGElement {
  let layer = svg.querySelector<SVGGElement>("#state-labels");
  if (!layer) {
    layer = document.createElementNS(SVG_NS, "g");
    layer.setAttribute("id", "state-labels");
    layer.setAttribute("pointer-events", "none");
    svg.appendChild(layer);
  }
  if (layer.dataset.version !== LABEL_LAYER_VERSION) {
    layer.replaceChildren();
    layer.dataset.version = LABEL_LAYER_VERSION;
  }
  return layer;
}

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

  const ensureLabels = useCallback((root: HTMLElement) => {
    const svg = root.querySelector("svg");
    if (!svg) return;

    const layer = getLabelsLayer(svg);
    getMapRegions(root).forEach((region) => {
      const code = region.getAttribute("data-state-code");
      if (!code) return;

      try {
        const bbox = (region as SVGGraphicsElement).getBBox();
        const offset = LABEL_OFFSETS[code];
        const x = bbox.x + bbox.width / 2 + (offset?.dx ?? 0);
        const y = bbox.y + bbox.height / 2 + (offset?.dy ?? 0);
        const size = labelFontSize(bbox.width, bbox.height);

        let text = layer.querySelector<SVGTextElement>(
          `[data-label-for="${code}"]`
        );
        if (!text) {
          text = document.createElementNS(SVG_NS, "text");
          text.setAttribute("data-label-for", code);
          text.setAttribute("text-anchor", "middle");
          text.setAttribute("dominant-baseline", "central");
          text.setAttribute("font-weight", "600");
          text.setAttribute(
            "font-family",
            "system-ui, -apple-system, sans-serif"
          );
          text.setAttribute("paint-order", "stroke fill");
          text.setAttribute("stroke", LABEL_STROKE);
          text.setAttribute("stroke-width", LABEL_STROKE_WIDTH);
          text.setAttribute("stroke-linejoin", "round");
          text.textContent = code;
          layer.appendChild(text);
        }

        text.setAttribute("x", String(x));
        text.setAttribute("y", String(y));
        text.setAttribute("font-size", String(size));
      } catch {
        /* getBBox unavailable until rendered */
      }
    });
  }, []);

  const applyStyles = useCallback(() => {
    const root = containerRef.current;
    if (!root) return;

    getMapRegions(root).forEach((region) => {
      const code = region.getAttribute("data-state-code");
      if (!code) return;
      const record = statesByCode.current.get(code);
      const visited = record?.visited ?? false;

      region.style.fill = visited ? VISITED_FILL : UNVISITED_FILL;
      region.style.stroke = MAP_STROKE;
      region.style.strokeWidth = "0.75px";
      region.style.cursor = visited ? "pointer" : "default";
      region.style.pointerEvents = "auto";
      region.dataset.visited = visited ? "true" : "false";

      const label = root.querySelector<SVGTextElement>(
        `[data-label-for="${code}"]`
      );
      if (label) {
        label.setAttribute(
          "fill",
          visited ? LABEL_FILL_VISITED : LABEL_FILL_UNVISITED
        );
        label.setAttribute(
          "stroke",
          visited ? "rgba(255,255,255,0.35)" : LABEL_STROKE
        );
      }
    });
  }, []);

  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;

    if (!svgMounted.current) {
      root.innerHTML = svgContent;
      svgMounted.current = true;

      getMapRegions(root).forEach((region) => {
        region.addEventListener("mouseenter", () => {
          if (region.dataset.visited === "true") {
            region.style.fill = VISITED_HOVER_FILL;
          }
        });
        region.addEventListener("mouseleave", () => {
          if (region.dataset.visited === "true") {
            region.style.fill = VISITED_FILL;
          }
        });
      });
    }

    const handleClick = (e: MouseEvent) => {
      const target = e.target as Element;
      const hit = target.closest("[data-state-code]");
      if (!hit) return;
      const code = hit.getAttribute("data-state-code");
      if (!code) return;
      const record = statesByCode.current.get(code);
      if (record?.visited) {
        onVisitedClickRef.current(record);
      }
    };

    root.addEventListener("click", handleClick);
    ensureLabels(root);
    applyStyles();

    return () => {
      root.removeEventListener("click", handleClick);
    };
  }, [svgContent, applyStyles, ensureLabels]);

  useLayoutEffect(() => {
    const root = containerRef.current;
    if (!root || !svgMounted.current) return;
    ensureLabels(root);
    applyStyles();
  }, [states, applyStyles, ensureLabels]);

  return (
    <div
      ref={containerRef}
      className="mx-auto w-full max-w-6xl [&_svg]:h-auto [&_svg]:w-full"
      aria-label="Map of US states visited"
    />
  );
}
