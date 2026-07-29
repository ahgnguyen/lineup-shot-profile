// frontend/src/components/FrequencyLegend.tsx

import { hexbin as d3Hexbin } from 'd3-hexbin'

const LEGEND_HEX_RADIUS = 9
const SAMPLE_FRACTIONS = [0.15, 0.5, 1]
const GAP = 6

export function FrequencyLegend() {
  const hexbin = d3Hexbin()
  const radii = SAMPLE_FRACTIONS.map((fraction) => LEGEND_HEX_RADIUS * Math.sqrt(fraction))
  const maxRadius = radii[radii.length - 1]
  const height = maxRadius * 2

  let x = 0
  const hexes = radii.map((radius) => {
    x += radius
    const cx = x
    x += radius + GAP
    return { radius, cx }
  })
  const width = x - GAP

  return (
    <div className="freq-legend">
      <div className="freq-legend-title">Shot frequency (relative)</div>
      <div className="freq-legend-visual">
        <span className="freq-legend-label">Less</span>
        <svg className="freq-legend-svg" width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
          {hexes.map(({ radius, cx }) => (
            <path
              key={cx}
              d={hexbin.hexagon(radius)}
              transform={`translate(${cx}, ${height - radius})`}
              className="freq-legend-hex"
            />
          ))}
        </svg>
        <span className="freq-legend-label">More</span>
      </div>
    </div>
  )
}
