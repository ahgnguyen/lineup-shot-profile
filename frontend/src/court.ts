// frontend/src/court.ts

export const COURT_WIDTH = 500
export const COURT_LENGTH = 470

// loc_x/loc_y come from stats.nba.com in tenths of a foot, origin at the
// hoop. SVG's y-axis increases downward, so y is flipped here to put the
// hoop at the bottom of the chart, matching the usual shot chart look.
export function toSvgX(locX: number) {
  return locX + COURT_WIDTH / 2
}

export function toSvgY(locY: number) {
  return 420 - locY
}
