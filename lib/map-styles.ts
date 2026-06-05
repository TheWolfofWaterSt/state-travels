export const VISITED_FILL = "#3B82F6";
export const VISITED_HOVER_FILL = "#2563EB";
export const MAP_STROKE = "#9CA3AF";

export const LABEL_FILL_VISITED = "#FFFFFF";
export const LABEL_FILL_UNVISITED = "#475569";
export const LABEL_STROKE = "#FFFFFF";
export const LABEL_STROKE_WIDTH = "2px";

/** Single neutral fill so unvisited states read as one group. */
export const UNVISITED_FILL = "#E2E8F0";

export function labelFontSize(width: number, height: number): number {
  const area = width * height;
  return Math.max(5.5, Math.min(10, Math.sqrt(area) * 0.18));
}
