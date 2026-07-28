import { useEffect, useState } from 'react'
import { getComposite, type CompositeCell } from './api/composite'
import { CompositeHexbinChart } from './components/CompositeHexbinChart'

const LINEUP_PLAYER_IDS = [1642856, 1629611, 1629008, 1641730, 1629651]

function App() {
  const [composite, setComposite] = useState<CompositeCell[] | null>(null)

  useEffect(() => {
    getComposite(LINEUP_PLAYER_IDS).then(setComposite)
  }, [])

  if (!composite) {
    return <div>Loading...</div>
  }

  return (
    <div>
      <h2>Predicted composite ({LINEUP_PLAYER_IDS.length} players)</h2>
      <CompositeHexbinChart cells={composite} />
    </div>
  )
}

export default App
