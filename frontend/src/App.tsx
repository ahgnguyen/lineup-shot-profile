import { useEffect, useState } from 'react'
import { getComposite, type CompositeResponse } from './api/composite'
import { getTeamLineups, getLineupActual, type TeamLineup, type LineupActualResponse } from './api/lineups'
import { CompositeHexbinChart } from './components/CompositeHexbinChart'
import { PointsPerShotLegend } from './components/PointsPerShotLegend'
import { FrequencyLegend } from './components/FrequencyLegend'
import { EMPTY_LINEUP, LineupSelector, type LineupSlots } from './components/LineupSelector'

type Mode = 'predicted' | 'actual'

function App() {
  const [slots, setSlots] = useState<LineupSlots>(EMPTY_LINEUP)
  const [composite, setComposite] = useState<CompositeResponse | null>(null)
  const [mode, setMode] = useState<Mode>('predicted')
  const [matchedLineup, setMatchedLineup] = useState<TeamLineup | null>(null)
  const [actualData, setActualData] = useState<LineupActualResponse | null>(null)

  const filledPlayerIds = slots.filter((slot) => slot !== null).map((slot) => slot.id)
  const hasAnyPlayers = filledPlayerIds.length > 0

  useEffect(() => {
    if (!hasAnyPlayers) {
      setComposite(null)
      return
    }
    getComposite(filledPlayerIds).then(setComposite)
  }, [hasAnyPlayers, filledPlayerIds.join(',')])

  // Detect whether the current 5 selected players match a known real lineup,
  // regardless of how they were picked (manual build, search, or the
  // real-lineup shortcut) - a manually-assembled set that happens to match
  // still unlocks Actual. A lineup's real historical team can differ from a
  // player's current team_id (e.g. traded since), so this checks every
  // distinct current team among the 5 as a candidate rather than requiring
  // them all to currently share one team.
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

  const displayCells = mode === 'actual' ? actualData?.cells ?? [] : composite?.cells ?? []
  const isLoadingActual = mode === 'actual' && canShowActual && !actualData

  const modeNote = allSlotsFilled && matchedLineup === null
    ? "This isn't a real lineup that has shared the floor together — only Predicted is available."
    : matchedLineup && !matchedLineup.sufficientSample
      ? `This lineup has only ${matchedLineup.totalFga} FGA together (100+ needed) — not enough real data yet for Actual.`
      : ''

  return (
    <div className="page">
      <h2>Lineup Shot Profile</h2>
      <div className="app-layout">
        <LineupSelector slots={slots} onSlotsChange={setSlots} weightsByPlayer={weightsByPlayer} />

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

          {isLoadingActual && <div>Loading actual data...</div>}
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

          {hasAnyPlayers && !composite && <div>Loading...</div>}
        </div>
      </div>
    </div>
  )
}

export default App
