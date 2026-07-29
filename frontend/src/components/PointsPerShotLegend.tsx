// frontend/src/components/PointsPerShotLegend.tsx

import { MIN_POINTS_PER_SHOT, MAX_POINTS_PER_SHOT, NEUTRAL_POINTS_PER_SHOT, pointsPerShotColor } from '../pointsPerShotColor'

export function PointsPerShotLegend() {
  const gradient = `linear-gradient(to right, ${pointsPerShotColor(MIN_POINTS_PER_SHOT)}, ${pointsPerShotColor(NEUTRAL_POINTS_PER_SHOT)}, ${pointsPerShotColor(MAX_POINTS_PER_SHOT)})`

  return (
    <div className="pps-legend">
      <div className="pps-legend-title">Points per shot</div>
      <div className="pps-legend-bar" style={{ background: gradient }} />
      <div className="pps-legend-labels">
        <span>≤{MIN_POINTS_PER_SHOT.toFixed(1)}</span>
        <span>{NEUTRAL_POINTS_PER_SHOT.toFixed(1)}</span>
        <span>≥{MAX_POINTS_PER_SHOT.toFixed(1)}</span>
      </div>
    </div>
  )
}
