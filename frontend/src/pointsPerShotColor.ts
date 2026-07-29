// frontend/src/pointsPerShotColor.ts

export const MIN_POINTS_PER_SHOT = 0.6
export const MAX_POINTS_PER_SHOT = 1.4

export const NEUTRAL_POINTS_PER_SHOT = 1.0

const COLD_COLOR: [number, number, number] = [56, 189, 248]
const HOT_COLOR: [number, number, number] = [249, 115, 22]

function mixFromWhite(target: [number, number, number], t: number): string {
  const [r, g, b] = target
  const mix = (channel: number) => Math.round(255 + (channel - 255) * t)
  return `rgb(${mix(r)}, ${mix(g)}, ${mix(b)})`
}

export function pointsPerShotColor(pointsPerShot: number): string {
  if (pointsPerShot >= NEUTRAL_POINTS_PER_SHOT) {
    const t = Math.min(
      1,
      (pointsPerShot - NEUTRAL_POINTS_PER_SHOT) / (MAX_POINTS_PER_SHOT - NEUTRAL_POINTS_PER_SHOT),
    )
    return mixFromWhite(HOT_COLOR, t)
  }

  const t = Math.min(
    1,
    (NEUTRAL_POINTS_PER_SHOT - pointsPerShot) / (NEUTRAL_POINTS_PER_SHOT - MIN_POINTS_PER_SHOT),
  )
  return mixFromWhite(COLD_COLOR, t)
}
