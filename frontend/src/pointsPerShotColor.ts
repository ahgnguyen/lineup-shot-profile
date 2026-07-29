// frontend/src/pointsPerShotColor.ts
//
// Fixed points-per-shot domain, calibrated against real per-cell values
// league-wide (well-sampled cells run ~0.68-1.31) so colors mean the same
// thing across every lineup, not just relative to one composite's own range.

export const MIN_POINTS_PER_SHOT = 0.6
export const MAX_POINTS_PER_SHOT = 1.4

// 1.0 pts/shot is basketball's natural reference point (roughly league-average
// efficiency for most shot types - a 50% rim shot, a 33% three, etc.), so it's
// the white midpoint of a diverging scale rather than an arbitrary center.
export const NEUTRAL_POINTS_PER_SHOT = 1.0

// Sky blue (below 1.0) and orange (above 1.0), not pure blue/red: pure blue
// has very low perceptual luminance (close to black), so it nearly
// disappears against a dark background. Blue-orange is also one of the
// more reliably distinguishable diverging pairs across color vision
// deficiencies, unlike blue-red or red-green.
const COLD_COLOR: [number, number, number] = [56, 189, 248]
const HOT_COLOR: [number, number, number] = [249, 115, 22]

function mixFromWhite(target: [number, number, number], t: number): string {
  const [r, g, b] = target
  const mix = (channel: number) => Math.round(255 + (channel - 255) * t)
  return `rgb(${mix(r)}, ${mix(g)}, ${mix(b)})`
}

// Diverging scale: sky blue (below 1.0) -> white (at 1.0) -> orange (above 1.0).
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
