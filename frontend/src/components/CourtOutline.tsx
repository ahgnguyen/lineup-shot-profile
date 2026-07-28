// frontend/src/components/CourtOutline.tsx

import { COURT_WIDTH, COURT_LENGTH } from '../court'

export function CourtOutline() {
  return (
    <>
      <rect x={0} y={0} width={COURT_WIDTH} height={COURT_LENGTH} fill="none" stroke="black" />
      <rect x={170} y={230} width={160} height={190} fill="none" stroke="black" />
      <line x1={220} y1={427.5} x2={280} y2={427.5} stroke="black" />
      <circle cx={250} cy={420} r={9} fill="none" stroke="orange" strokeWidth={2} />
    </>
  )
}
