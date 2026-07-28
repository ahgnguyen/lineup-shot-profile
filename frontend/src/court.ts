// frontend/src/court.ts

export const COURT_WIDTH = 500
export const COURT_LENGTH = 470

export function toSvgX(locX: number) {
  return locX + COURT_WIDTH / 2
}

export function toSvgY(locY: number) {
  return 422.5 - locY
}
