/** Nudge labels off bbox center for states with irregular shapes. */
export type LabelOffset = { dx?: number; dy?: number };

export const LABEL_OFFSETS: Partial<Record<string, LabelOffset>> = {
  AK: { dx: 5, dy: -20 },
  AR: { dx: -5, dy: 0 },
  CA: { dx: -16, dy: 8 },
  CT: { dx: 0, dy: -4 },
  DE: { dx: 1, dy: 7 },
  FL: { dx: 40, dy: -10 },
  HI: { dx: 40, dy: 20 },
  ID: { dx: -5, dy: 25 },
  KY: { dx: 10, dy: 5 },
  LA: { dx: -18, dy: 0 },
  MA: { dx: -10, dy: 0 },
  MD: { dx: 2, dy: -10 },
  ME: { dx: -5, dy: -5 },
  MI: { dx: 28, dy: 32 },
  MN: { dx: -18, dy: 10 },
  NH: { dx: -3, dy: 10 },
  NJ: { dx: 5, dy: 0 },
  OK: { dx: 20, dy: 0 },
  OR: { dx: -5, dy: 4 },
  TX: { dx: 10, dy: -10 },
  VA: { dx: 15, dy: 5 },
  WA: { dx: 5, dy: 4 },
  WV: { dx: -15, dy: 14 },
};
