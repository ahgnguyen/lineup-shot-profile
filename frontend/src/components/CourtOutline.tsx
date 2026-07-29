// frontend/src/components/CourtOutline.tsx
//
// Standard NBA half-court markings in stats.nba.com's own units (tenths of a
// foot, hoop at the origin) — the same real-world dimensions (16ft lane,
// 23.75ft arc at the top of the key, 22ft corner three, etc.) used by most
// public NBA shot-chart tools, converted here to the toSvgX/toSvgY pixel
// space defined in court.ts.

const LINE_COLOR = '#9a9a9a'
const COURT_SURFACE_COLOR = '#1e1e1e'

export function CourtOutline() {
  return (
    <g fill="none" stroke={LINE_COLOR} strokeWidth={2}>
      {/* Court surface */}
      <rect x={0} y={0} width={500} height={470} fill={COURT_SURFACE_COLOR} stroke="none" />

      {/* Half-court boundary */}
      <rect x={0} y={0} width={500} height={470} />

      {/* Free-throw lane */}
      <rect x={170} y={280} width={160} height={190} />

      {/* Backboard */}
      <line x1={220} y1={430} x2={280} y2={430} strokeWidth={3} />

      {/* Rim */}
      <circle cx={250} cy={422.5} r={7.5} stroke="orange" strokeWidth={2} />

      {/* Restricted area arc */}
      <path d="M 210,422.5 A 40,40 0 0,1 290,422.5" />

      {/* Free-throw circle: far half solid, near half (inside the lane) dashed */}
      <path d="M 190,280 A 60,60 0 0,1 310,280" />
      <path d="M 190,280 A 60,60 0 0,0 310,280" strokeDasharray="6,4" />

      {/* Corner three-point lines */}
      <line x1={30} y1={470} x2={30} y2={330} />
      <line x1={470} y1={470} x2={470} y2={330} />

      {/* Three-point arc */}
      <path d="M 29.8,333.5 A 237.5,237.5 0 0,1 470.2,333.5" />

      {/* Center circle (near half only, at the half-court line) */}
      <path d="M 190,0 A 60,60 0 0,0 310,0" />
      <path d="M 230,0 A 20,20 0 0,0 270,0" />
    </g>
  )
}
