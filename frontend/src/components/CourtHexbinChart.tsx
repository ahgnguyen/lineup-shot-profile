// frontend/src/components/CourtHexbinChart.tsx

import { hexbin as d3Hexbin } from 'd3-hexbin'
import type { Shot } from '../api/players'

const COURT_WIDTH = 500
const COURT_LENGTH = 470
const HEX_RADIUS = 10


function toSvgX(locX: number) {
  return locX + COURT_WIDTH / 2
}

function toSvgY(locY: number) {
  return 420 - locY
}

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
      <rect x={0} y={0} width={COURT_WIDTH} height={COURT_LENGTH} fill="none" stroke="black" />
      <rect x={170} y={230} width={160} height={190} fill="none" stroke="black" />
      <line x1={220} y1={427.5} x2={280} y2={427.5} stroke="black" />
      <circle cx={250} cy={420} r={9} fill="none" stroke="orange" strokeWidth={2} />

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
