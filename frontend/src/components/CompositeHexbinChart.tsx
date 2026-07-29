// frontend/src/components/CompositeHexbinChart.tsx

import { useState } from 'react'
import { hexbin as d3Hexbin } from 'd3-hexbin'
import type { CompositeCell } from '../api/composite'
import { COURT_WIDTH, COURT_LENGTH, toSvgX, toSvgY } from '../court'
import { CourtOutline } from './CourtOutline'
import { pointsPerShotColor } from '../pointsPerShotColor'

export const HEX_RADIUS = 20

interface CompositeHexbinChartProps {
  cells: CompositeCell[]
}

interface HoverState {
  cell: CompositeCell
  clientX: number
  clientY: number
}

export function CompositeHexbinChart({ cells }: CompositeHexbinChartProps) {
  const hexbin = d3Hexbin().radius(HEX_RADIUS)
  const maxFrequency = Math.max(...cells.map((cell) => cell.frequency))
  const [hover, setHover] = useState<HoverState | null>(null)

  return (
    <div className="court-chart-container">
      <svg className="court-svg" viewBox={`0 0 ${COURT_WIDTH} ${COURT_LENGTH}`}>
        <CourtOutline />

        {cells.map((cell, i) => {
          const radius = HEX_RADIUS * Math.sqrt(cell.frequency / maxFrequency)

          return (
            <path
              key={i}
              d={hexbin.hexagon(radius)}
              transform={`translate(${toSvgX(cell.x)},${toSvgY(cell.y)})`}
              fill={pointsPerShotColor(cell.pointsPerShot)}
              onMouseEnter={(e) => setHover({ cell, clientX: e.clientX, clientY: e.clientY })}
              onMouseMove={(e) => setHover({ cell, clientX: e.clientX, clientY: e.clientY })}
              onMouseLeave={() => setHover(null)}
            />
          )
        })}
      </svg>

      {hover && (
        <div className="hex-tooltip" style={{ left: hover.clientX + 14, top: hover.clientY + 14 }}>
          <div>{(hover.cell.frequency * 100).toFixed(1)}% of shots</div>
          <div>{hover.cell.pointsPerShot.toFixed(2)} pts/shot</div>
        </div>
      )}
    </div>
  )
}
