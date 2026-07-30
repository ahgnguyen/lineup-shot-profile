import { useEffect, useState } from 'react'
import { getComposite, type CompositeResponse } from './api/composite'
import { getTeamLineups, getLineupActual, type TeamLineup, type LineupActualResponse } from './api/lineups'
import { CompositeHexbinChart } from './components/CompositeHexbinChart'
import { PointsPerShotLegend } from './components/PointsPerShotLegend'
import { FrequencyLegend } from './components/FrequencyLegend'
import { EMPTY_LINEUP, LineupSlotsPanel, LineupPicker, useLineupController, type LineupSlots } from './components/LineupSelector'

type Mode = 'predicted' | 'actual'

function App() {
  const [slots, setSlots] = useState<LineupSlots>(EMPTY_LINEUP)
  const [composite, setComposite] = useState<CompositeResponse | null>(null)
  const [compositeError, setCompositeError] = useState(false)
  const [mode, setMode] = useState<Mode>('predicted')
  const [matchedLineup, setMatchedLineup] = useState<TeamLineup | null>(null)
  const [actualData, setActualData] = useState<LineupActualResponse | null>(null)
  const lineupController = useLineupController(slots, setSlots)

  const filledPlayerIds = slots.filter((slot) => slot !== null).map((slot) => slot.id)
  const hasAnyPlayers = filledPlayerIds.length > 0

  useEffect(() => {
    if (!hasAnyPlayers) {
      setComposite(null)
      setCompositeError(false)
      return
    }
    setCompositeError(false)
    getComposite(filledPlayerIds)
      .then(setComposite)
      .catch(() => setCompositeError(true))
  }, [hasAnyPlayers, filledPlayerIds.join(',')])

  useEffect(() => {
    const filled = slots.filter((s) => s !== null)
    if (filled.length !== 5) {
      setMatchedLineup(null)
      return
    }
    const selectedIdSet = new Set(filled.map((s) => s.id))
    const candidateTeamIds = [...new Set(filled.map((s) => s.teamId))]

    let cancelled = false
    Promise.all(candidateTeamIds.map((teamId) => getTeamLineups(teamId))).then((results) => {
      if (cancelled) return
      const match = results
        .flat()
        .find((l) => l.playerIds.length === selectedIdSet.size && l.playerIds.every((id) => selectedIdSet.has(id)));
      setMatchedLineup(match ?? null)
    })
    return () => {
      cancelled = true
    }
  }, [slots.map((s) => (s ? s.id : 'x')).join(',')])

  // Reset to Predicted whenever the match disappears, so the toggle never
  // gets stuck on an Actual mode that's no longer available.
  useEffect(() => {
    if (!matchedLineup && mode !== 'predicted') {
      setMode('predicted')
    }
  }, [matchedLineup, mode])

  useEffect(() => {
    if (mode === 'predicted' || !matchedLineup?.sufficientSample) {
      setActualData(null)
      return
    }
    getLineupActual(matchedLineup.id).then(setActualData)
  }, [mode, matchedLineup?.id, matchedLineup?.sufficientSample])

  const weightsByPlayer = new Map(composite?.players.map((p) => [p.playerId, p.weight]) ?? [])
  const canShowActual = matchedLineup !== null && matchedLineup.sufficientSample
  const allSlotsFilled = slots.every((s) => s !== null)

  // Keep showing Predicted until Actual can be showed
  const displayCells = mode === 'actual' && actualData ? actualData.cells : composite?.cells ?? []

  const modeNote = allSlotsFilled && matchedLineup === null
    ? "This isn't a real lineup that has shared the floor together — only Predicted is available."
    : matchedLineup && !matchedLineup.sufficientSample
      ? `This lineup has only ${matchedLineup.totalFga} FGA together (100+ needed) — not enough real data yet for Actual.`
      : ''

  return (
    <div className="page">
      <h2>Lineup Shot Profile</h2>
      <div className="app-layout">
        <div className="chart-row">
          <div className="chart-area">
            <div className="mode-toggle">
              <button className={mode === 'predicted' ? 'active' : ''} onClick={() => setMode('predicted')}>
                Predicted
              </button>
              <button className={mode === 'actual' ? 'active' : ''} disabled={!canShowActual} onClick={() => setMode('actual')}>
                Actual
              </button>
            </div>

            <div className="mode-note">{modeNote}</div>

            <CompositeHexbinChart cells={displayCells} />

            <div className="legends-row">
              <div className="legends-group">
                <PointsPerShotLegend />
                <FrequencyLegend />
              </div>
              {mode === 'actual' && actualData ? (
                <div className="sample-size-note">Actual: {actualData.totalShots.toLocaleString()} shots</div>
              ) : (
                composite && (
                  <div className="sample-size-note">
                    Predicted from {composite.totalShots.toLocaleString()} shots across{' '}
                    {composite.players.length} player{composite.players.length === 1 ? '' : 's'}
                  </div>
                )
              )}
            </div>

            {compositeError && (
              <div className="fetch-error">Couldn't load this lineup's shot data. Try again in a moment.</div>
            )}
            {hasAnyPlayers && !composite && !compositeError && <div>Loading...</div>}
          </div>

          <LineupSlotsPanel slots={slots} controller={lineupController} weightsByPlayer={weightsByPlayer} />
        </div>

        <LineupPicker controller={lineupController} />
      </div>
    </div>
  )
}

export default App
