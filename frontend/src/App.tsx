import { useEffect, useState } from 'react'
import { getComposite, type CompositeCell } from './api/composite'
import { CompositeHexbinChart } from './components/CompositeHexbinChart'
import { EMPTY_LINEUP, LineupSelector, type LineupSlots } from './components/LineupSelector'

function App() {
  const [slots, setSlots] = useState<LineupSlots>(EMPTY_LINEUP)
  const [composite, setComposite] = useState<CompositeCell[] | null>(null)

  const filledPlayerIds = slots.filter((slot) => slot !== null).map((slot) => slot.id)
  const isLineupComplete = filledPlayerIds.length === 5

  useEffect(() => {
    if (!isLineupComplete) {
      setComposite(null)
      return
    }
    getComposite(filledPlayerIds).then(setComposite)
  }, [isLineupComplete, filledPlayerIds.join(',')])

  return (
    <div>
      <h2>Lineup Shot Profile</h2>
      <LineupSelector slots={slots} onSlotsChange={setSlots} />

      {isLineupComplete && !composite && <div>Loading...</div>}
      {composite && <CompositeHexbinChart cells={composite} />}
    </div>
  )
}

export default App
