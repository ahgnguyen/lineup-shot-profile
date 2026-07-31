import { useEffect, useRef, useState } from 'react'
import { getComposite, type CompositeResponse } from './api/composite'
import { getTeamLineups, getLineupActual, type TeamLineup, type LineupActualResponse } from './api/lineups'
import { CompositeHexbinChart } from './components/CompositeHexbinChart'
import { PointsPerShotLegend } from './components/PointsPerShotLegend'
import { FrequencyLegend } from './components/FrequencyLegend'
import { EMPTY_LINEUP, LineupSlotsPanel, LineupPicker, useLineupController, type LineupSlots } from './components/LineupSelector'
import { ZoneBreakdownPanel } from './components/ZoneBreakdownPanel'
import { COURT_RATIO } from './court'
import type { ZoneId } from './court/zones'

type Mode = 'predicted' | 'actual'

function useCourtSize(
  chartAreaRef: React.RefObject<HTMLDivElement | null>,
  legendsRef: React.RefObject<HTMLDivElement | null>,
) {
  const [size, setSize] = useState<{ width: number; height: number } | null>(null)

  useEffect(() => {
    const chartArea = chartAreaRef.current
    if (!chartArea) return

    function measure() {
      if (!chartArea || !window.matchMedia('(min-width: 641px)').matches) {
        setSize(null)
        return
      }
      const chartAreaRect = chartArea.getBoundingClientRect()
      const legends = legendsRef.current
      const legendsSpace = legends
        ? legends.getBoundingClientRect().height + parseFloat(getComputedStyle(legends).marginTop || '0')
        : 0
      const availableWidth = chartAreaRect.width
      const availableHeight = chartAreaRect.height - legendsSpace
      if (availableWidth <= 0 || availableHeight <= 0) return
      const fittedWidth = Math.min(availableWidth, availableHeight * COURT_RATIO)
      setSize({ width: fittedWidth, height: fittedWidth / COURT_RATIO })
    }

    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(chartArea)
    window.addEventListener('resize', measure)
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [chartAreaRef, legendsRef])

  return size
}

function App() {
  const [slots, setSlots] = useState<LineupSlots>(EMPTY_LINEUP)
  const [composite, setComposite] = useState<CompositeResponse | null>(null)
  const [compositeError, setCompositeError] = useState(false)
  const [mode, setMode] = useState<Mode>('predicted')
  const [matchedLineup, setMatchedLineup] = useState<TeamLineup | null>(null)
  const [actualData, setActualData] = useState<LineupActualResponse | null>(null)
  const lineupController = useLineupController(slots, setSlots)
  const chartAreaRef = useRef<HTMLDivElement>(null)
  const legendsRef = useRef<HTMLDivElement>(null)
  const courtSize = useCourtSize(chartAreaRef, legendsRef)
  const [showActualReason, setShowActualReason] = useState(false)
  const [selectedZone, setSelectedZone] = useState<{ zoneId: ZoneId; clientX: number; clientY: number } | null>(null)

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
    setSelectedZone(null)
  }, [filledPlayerIds.join(',')])

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
    if (!matchedLineup?.sufficientSample) {
      setActualData(null)
      return
    }
    let cancelled = false
    getLineupActual(matchedLineup.id).then((data) => {
      if (!cancelled) setActualData(data)
    })
    return () => {
      cancelled = true
    }
  }, [matchedLineup?.id, matchedLineup?.sufficientSample])

  const weightsByPlayer = new Map(composite?.players.map((p) => [p.playerId, p.weight]) ?? [])
  const playersById = new Map(
    slots.filter((s): s is NonNullable<typeof s> => s !== null).map((s) => [s.id, { name: s.name, teamAbbreviation: s.teamAbbreviation }]),
  )
  const selectedPredictedZone = selectedZone ? composite?.zones.find((z) => z.zoneId === selectedZone.zoneId) : undefined
  const selectedActualZone = selectedZone ? actualData?.zones.find((z) => z.zoneId === selectedZone.zoneId) : undefined
  const handleZoneClick = (zoneId: ZoneId, clientX: number, clientY: number) =>
    setSelectedZone((current) => (current?.zoneId === zoneId ? null : { zoneId, clientX, clientY }))
  const canShowActual = matchedLineup !== null && matchedLineup.sufficientSample
  const allSlotsFilled = slots.every((s) => s !== null)

  // Keep showing Predicted until Actual can be showed
  const displayCells = mode === 'actual' && actualData ? actualData.cells : composite?.cells ?? []

  const actualDisabledReason = !allSlotsFilled
    ? `Pick 5 players to check for real lineup data`
    : matchedLineup === null
      ? "This lineup doesn't have any shot attempts together"
      : !matchedLineup.sufficientSample
        ? `This lineup has only ${matchedLineup.totalFga} FGA together (100+ needed)`
        : undefined

  return (
    <div className="page">
      <h2>Lineup Shot Profile</h2>
      <div className="app-layout">
        <div className="chart-row">
          <div className="chart-area" ref={chartAreaRef}>
            <CompositeHexbinChart
              cells={displayCells}
              size={courtSize}
              selectedZone={selectedZone?.zoneId ?? null}
              onZoneClick={composite ? handleZoneClick : undefined}
            >
              <div className="mode-toggle">
                <button className={mode === 'predicted' ? 'active' : ''} onClick={() => setMode('predicted')}>
                  Predicted
                </button>
                <span
                  className="actual-tooltip-anchor"
                  onMouseEnter={() => setShowActualReason(true)}
                  onMouseLeave={() => setShowActualReason(false)}
                >
                  <button
                    className={mode === 'actual' ? 'active' : ''}
                    disabled={!canShowActual}
                    onClick={() => setMode('actual')}
                  >
                    Actual
                  </button>
                  {showActualReason && actualDisabledReason && (
                    <div className="actual-tooltip">{actualDisabledReason}</div>
                  )}
                </span>
              </div>
            </CompositeHexbinChart>

            {selectedPredictedZone && selectedZone && (
              <ZoneBreakdownPanel
                predictedZone={selectedPredictedZone}
                actualZone={selectedActualZone}
                clientX={selectedZone.clientX}
                clientY={selectedZone.clientY}
                playersById={playersById}
                onClose={() => setSelectedZone(null)}
              />
            )}

            <div className="legends-row" ref={legendsRef}>
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
