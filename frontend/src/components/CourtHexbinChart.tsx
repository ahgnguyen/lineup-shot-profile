// frontend/src/components/CourtHexbinChart.tsx

import { hexbin as d3Hexbin } from 'd3-hexbin'
import type { Shot } from '../api/players'
import { COURT_WIDTH, COURT_LENGTH, toSvgX, toSvgY } from '../court'
import { CourtOutline } from './CourtOutline'

const HEX_RADIUS = 20

interface CourtHexbinChartProps {
  shots: Shot[]
}

export function CourtHexbinChart({ shots }: CourtHexbinChartProps) {
  const points: [number, number][] = shots.map((shot) => [
    toSvgX(shot.loc_x),
    toSvgY(shot.loc_y),
  ])

  const hexbin = d3Hexbin()
    .radius(HEX_RADIUS)
    .extent([[0, 0], [COURT_WIDTH, COURT_LENGTH]])

  const bins = hexbin(points)
  const maxCount = Math.max(...bins.map((bin) => bin.length))

  return (
    <svg viewBox={`0 0 ${COURT_WIDTH} ${COURT_LENGTH}`} width={500} height={470}>
      <CourtOutline />

      {bins.map((bin, i) => (
        <path
          key={i}
          d={hexbin.hexagon()}
          transform={`translate(${bin.x},${bin.y})`}
          fill="red"
          opacity={bin.length / maxCount}
        />
      ))}
    </svg>
  )
}
