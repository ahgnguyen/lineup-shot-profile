// frontend/src/court/zones.ts
//
// Mirrors backend/src/model/zones.ts - same 10 named shot zones, same
// geometry constants (in loc_x/loc_y tenths-of-a-foot units, hoop at the
// origin). The frontend never classifies raw shots into zones itself (the
// backend does that and returns per-zone breakdowns); it only needs these
// constants to draw matching clickable regions on the court, so the visual
// boundaries line up with what the backend actually computed.

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
  | "three_right"

export const ZONE_LABELS: Record<ZoneId, string> = {
  restricted_area: "Restricted Area",
  paint: "Paint (Non-RA)",
  corner3_left: "Left Corner 3",
  corner3_right: "Right Corner 3",
  midrange_left: "Left Midrange",
  midrange_center: "Center Midrange",
  midrange_right: "Right Midrange",
  three_left: "Left Wing 3",
  three_center: "Top of the Key 3",
  three_right: "Right Wing 3",
}

export const RA_RADIUS = 40
export const PAINT_HALF_WIDTH = 80
export const PAINT_Y_MIN = -47.5
export const PAINT_Y_MAX = 142.5
export const CORNER_X = 220
export const CORNER_Y_MAX = 92.5
export const THREE_RADIUS = 237.5
export const WEDGE_ANGLE_DEG = 30
const FAR_RADIUS = 600 // safely beyond the visible court; clipped by the svg viewBox

// Polar point relative to the hoop, in loc-space, then converted to svg
// pixel space via toSvgX/toSvgY - angleDeg is 0 straight up-court, positive
// to the right, matching Math.atan2(x, y) in the backend classifier.
function polarToSvg(angleDeg: number, radius: number): [number, number] {
  const angleRad = (angleDeg * Math.PI) / 180
  const locX = radius * Math.sin(angleRad)
  const locY = radius * Math.cos(angleRad)
  return [locX + 250, 422.5 - locY]
}

// An annular sector (pie slice with an inner and outer radius) spanning
// startDeg to endDeg, as an svg path 'd' string.
function sectorPath(innerR: number, outerR: number, startDeg: number, endDeg: number): string {
  const [x1, y1] = polarToSvg(startDeg, outerR)
  const [x2, y2] = polarToSvg(endDeg, outerR)
  const [x3, y3] = polarToSvg(endDeg, innerR)
  const [x4, y4] = polarToSvg(startDeg, innerR)
  return [
    `M ${x1} ${y1}`,
    `A ${outerR} ${outerR} 0 0 1 ${x2} ${y2}`,
    `L ${x3} ${y3}`,
    `A ${innerR} ${innerR} 0 0 0 ${x4} ${y4}`,
    "Z",
  ].join(" ")
}

interface Rect {
  x: number
  y: number
  width: number
  height: number
}

const PAINT_RECT: Rect = {
  x: 250 - PAINT_HALF_WIDTH,
  y: 422.5 - PAINT_Y_MAX,
  width: PAINT_HALF_WIDTH * 2,
  height: PAINT_Y_MAX - PAINT_Y_MIN,
}
const CORNER_LEFT_RECT: Rect = { x: 0, y: 422.5 - CORNER_Y_MAX, width: 250 - CORNER_X, height: CORNER_Y_MAX + 47.5 }
const CORNER_RIGHT_RECT: Rect = { x: 250 + CORNER_X, y: 422.5 - CORNER_Y_MAX, width: 250 - CORNER_X, height: CORNER_Y_MAX + 47.5 }

function rectSubpath(rect: Rect): string {
  const { x, y, width, height } = rect
  return `M ${x} ${y} H ${x + width} V ${y + height} H ${x} Z`
}

// A single clip region shared by every wedge: the full court canvas minus
// the paint box and both corners. Evenodd correctly punches a hole here
// because the thing being punched (paint/corner rects) is always fully
// contained within the thing doing the punching (the whole canvas) - unlike
// subtracting those same rects directly from an individual wedge's own
// path, where a rect can extend past that wedge's own angular boundary
// (e.g. the paint box spans both sides of center, but the left wedge only
// ever covers the left side) and evenodd's parity counting then paints
// the part poking outside the wedge instead of excluding it.
export const WEDGE_CLIP_ID = "zone-wedge-clip"
export const WEDGE_CLIP_PATH = [
  `M 0 0 H 500 V 470 H 0 Z`,
  rectSubpath(PAINT_RECT),
  rectSubpath(CORNER_LEFT_RECT),
  rectSubpath(CORNER_RIGHT_RECT),
].join(" ")

interface ZoneShape {
  id: ZoneId
  kind: "path" | "rect" | "circle"
  d?: string
  clipped?: boolean
  rect?: Rect
  circle?: { cx: number; cy: number; r: number }
}

// Drawn in this order (later = on top = wins click priority for any
// residual overlap at a shared edge). The wedges are clipped (see
// WEDGE_CLIP_PATH) so their hit area already stops exactly at the
// paint/corner boundary; the z-order is a backstop for edge pixels, not the
// only thing preventing overlap.
export const ZONE_SHAPES: ZoneShape[] = [
  { id: "three_left", kind: "path", clipped: true, d: sectorPath(THREE_RADIUS, FAR_RADIUS, -179, -WEDGE_ANGLE_DEG) },
  { id: "three_center", kind: "path", clipped: true, d: sectorPath(THREE_RADIUS, FAR_RADIUS, -WEDGE_ANGLE_DEG, WEDGE_ANGLE_DEG) },
  { id: "three_right", kind: "path", clipped: true, d: sectorPath(THREE_RADIUS, FAR_RADIUS, WEDGE_ANGLE_DEG, 179) },
  { id: "midrange_left", kind: "path", clipped: true, d: sectorPath(RA_RADIUS, THREE_RADIUS, -179, -WEDGE_ANGLE_DEG) },
  { id: "midrange_center", kind: "path", clipped: true, d: sectorPath(RA_RADIUS, THREE_RADIUS, -WEDGE_ANGLE_DEG, WEDGE_ANGLE_DEG) },
  { id: "midrange_right", kind: "path", clipped: true, d: sectorPath(RA_RADIUS, THREE_RADIUS, WEDGE_ANGLE_DEG, 179) },
  { id: "paint", kind: "rect", rect: PAINT_RECT },
  { id: "corner3_left", kind: "rect", rect: CORNER_LEFT_RECT },
  { id: "corner3_right", kind: "rect", rect: CORNER_RIGHT_RECT },
  { id: "restricted_area", kind: "circle", circle: { cx: 250, cy: 422.5, r: RA_RADIUS } },
]
