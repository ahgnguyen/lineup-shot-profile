// backend/src/model/zones.ts

export type ZoneId =
  | "restricted_area"
  | "paint"
  | "corner3_left"
  | "corner3_right"
  | "midrange_left"
  | "midrange_center"
  | "midrange_right"
  | "three_left"
  | "three_center"
  | "three_right";

export const ZONE_IDS: ZoneId[] = [
  "restricted_area",
  "paint",
  "corner3_left",
  "corner3_right",
  "midrange_left",
  "midrange_center",
  "midrange_right",
  "three_left",
  "three_center",
  "three_right",
];

const RA_RADIUS = 40;
const PAINT_HALF_WIDTH = 80;
const PAINT_Y_MIN = -47.5;
const PAINT_Y_MAX = 142.5;
const CORNER_X = 220;
const CORNER_Y_MAX = 92.5;
const THREE_RADIUS = 237.5;
const WEDGE_ANGLE_DEG = 30;

export function classifyZone(x: number, y: number): ZoneId {
  const dist = Math.hypot(x, y);
  if (dist <= RA_RADIUS) return "restricted_area";
  if (Math.abs(x) <= PAINT_HALF_WIDTH && y >= PAINT_Y_MIN && y <= PAINT_Y_MAX) return "paint";
  if (Math.abs(x) >= CORNER_X && y <= CORNER_Y_MAX) return x < 0 ? "corner3_left" : "corner3_right";

  const angleDeg = (Math.atan2(x, y) * 180) / Math.PI;
  const isThree = dist >= THREE_RADIUS;
  if (angleDeg < -WEDGE_ANGLE_DEG) return isThree ? "three_left" : "midrange_left";
  if (angleDeg > WEDGE_ANGLE_DEG) return isThree ? "three_right" : "midrange_right";
  return isThree ? "three_center" : "midrange_center";
}
