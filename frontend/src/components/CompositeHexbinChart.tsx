// frontend/src/components/CompositeHexbinChart.tsx

import { hexbin as d3Hexbin } from 'd3-hexbin'
import type { CompositeCell } from '../api/composite'
import { COURT_WIDTH, COURT_LENGTH, toSvgX, toSvgY } from '../court'
import { CourtOutline } from './CourtOutline'

const HEX_RADIUS = 20

// Blue (low points-per-shot) to red (high points-per-shot)
function pointsPerShotColor(t: number): string {
  const r = Math.round(255 * t)
  const b = Math.round(255 * (1 - t))
  return `rgb(${r}, 0, ${b})`
}

interface CompositeHexbinChartProps {
  cells: CompositeCell[]
}

export function CompositeHexbinChart({ cells }: CompositeHexbinChartProps) {
  const hexbin = d3Hexbin().radius(HEX_RADIUS)
  const maxFrequency = Math.max(...cells.map((cell) => cell.frequency))
  const minPointsPerShot = Math.min(...cells.map((cell) => cell.pointsPerShot))
  const maxPointsPerShot = Math.max(...cells.map((cell) => cell.pointsPerShot))

  return (
    <svg viewBox={`0 0 ${COURT_WIDTH} ${COURT_LENGTH}`} width={500} height={470}>
      <CourtOutline />

      {cells.map((cell, i) => {
        const radius = HEX_RADIUS * Math.sqrt(cell.frequency / maxFrequency)
        const t = (cell.pointsPerShot - minPointsPerShot) / (maxPointsPerShot - minPointsPerShot)

        return (
          <path
            key={i}
            d={hexbin.hexagon(radius)}
            transform={`translate(${toSvgX(cell.x)},${toSvgY(cell.y)})`}
            fill={pointsPerShotColor(t)}
          />
        )
      })}
    </svg>
  )
}
