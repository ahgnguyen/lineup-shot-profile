// frontend/src/components/ZoneBreakdownPanel.tsx

import type { ZoneBreakdown } from '../api/composite'
import type { ActualZoneSummary } from '../api/lineups'
import { ZONE_LABELS } from '../court/zones'

interface PlayerInfo {
  name: string
  teamAbbreviation: string
}

interface ZoneBreakdownPanelProps {
  predictedZone: ZoneBreakdown
  actualZone?: ActualZoneSummary
  clientX: number
  clientY: number
  playersById: Map<number, PlayerInfo>
  onClose: () => void
}

export function ZoneBreakdownPanel({ predictedZone, actualZone, clientX, clientY, playersById, onClose }: ZoneBreakdownPanelProps) {
  const sortedPlayers = [...predictedZone.players].sort((a, b) => b.freqShare - a.freqShare)

  return (
    <div className="zone-panel" style={{ left: clientX + 14, top: clientY + 14 }}>
      <div className="zone-panel-header">
        <div className="zone-panel-title">{ZONE_LABELS[predictedZone.zoneId]}</div>
        <button className="zone-panel-close" onClick={onClose} aria-label="Close">
          ×
        </button>
      </div>

      <div className="zone-panel-compare">
        <div className="zone-panel-compare-row">
          <span className="zone-panel-compare-label">Predicted</span>
          <span>
            {(predictedZone.frequency * 100).toFixed(1)}%
            {predictedZone.pointsPerShot !== null && <> · {predictedZone.pointsPerShot.toFixed(2)} pts/shot</>}
          </span>
        </div>
        {actualZone && (
          <div className="zone-panel-compare-row">
            <span className="zone-panel-compare-label">Actual</span>
            <span>
              {(actualZone.frequency * 100).toFixed(1)}%
              {actualZone.pointsPerShot !== null && <> · {actualZone.pointsPerShot.toFixed(2)} pts/shot</>}
              {' '}({actualZone.shots} shot{actualZone.shots === 1 ? '' : 's'})
            </span>
          </div>
        )}
      </div>

      <div className="zone-panel-players-label">Predicted breakdown</div>
      <ul className="zone-panel-players">
        {sortedPlayers.map((p) => {
          const info = playersById.get(p.playerId)
          return (
            <li key={p.playerId}>
              <span className="zone-panel-player-name">{info?.name ?? p.playerId}</span>
              <span className="zone-panel-player-stats">
                {(p.freqShare * 100).toFixed(0)}%
                {p.pointsPerShot !== null ? ` · ${p.pointsPerShot.toFixed(2)} pts/shot` : ' · no attempts'}
              </span>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
