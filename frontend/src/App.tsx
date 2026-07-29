import { useEffect, useState } from 'react'
import { getComposite, type CompositeResponse } from './api/composite'
import { CompositeHexbinChart } from './components/CompositeHexbinChart'
import { PointsPerShotLegend } from './components/PointsPerShotLegend'
import { FrequencyLegend } from './components/FrequencyLegend'
import { EMPTY_LINEUP, LineupSelector, type LineupSlots } from './components/LineupSelector'

function App() {
  const [slots, setSlots] = useState<LineupSlots>(EMPTY_LINEUP)
  const [composite, setComposite] = useState<CompositeResponse | null>(null)

  const filledPlayerIds = slots.filter((slot) => slot !== null).map((slot) => slot.id)
  const hasAnyPlayers = filledPlayerIds.length > 0

  useEffect(() => {
    if (!hasAnyPlayers) {
      setComposite(null)
      return
    }
    getComposite(filledPlayerIds).then(setComposite)
  }, [hasAnyPlayers, filledPlayerIds.join(',')])

  const weightsByPlayer = new Map(composite?.players.map((p) => [p.playerId, p.weight]) ?? [])

  return (
    <div className="page">
      <h2>Lineup Shot Profile</h2>
      <div className="app-layout">
        <LineupSelector slots={slots} onSlotsChange={setSlots} weightsByPlayer={weightsByPlayer} />

        <div className="chart-area">
          <CompositeHexbinChart cells={composite?.cells ?? []} />
          <div className="legends-row">
            <div className="legends-group">
              <PointsPerShotLegend />
              <FrequencyLegend />
            </div>
            {composite && (
              <div className="sample-size-note">
                Predicted from {composite.totalShots.toLocaleString()} shots across{' '}
                {composite.players.length} player{composite.players.length === 1 ? '' : 's'}
              </div>
            )}
          </div>
          {hasAnyPlayers && !composite && <div>Loading...</div>}
        </div>
      </div>
    </div>
  )
}

export default App
