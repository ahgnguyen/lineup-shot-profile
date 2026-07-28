import { useEffect, useState } from 'react'
import { getPlayer, getPlayerShots, type Player, type Shot } from './api/players'
import { CourtHexbinChart } from './components/CourtHexbinChart'

const PLAYER_ID = 1629008

function App() {
  const [player, setPlayer] = useState<Player | null>(null)
  const [shots, setShots] = useState<Shot[] | null>(null)

  useEffect(() => {
    getPlayer(PLAYER_ID).then(setPlayer)
    getPlayerShots(PLAYER_ID).then(setShots)
  }, [])

  if (!player || !shots) {
    return <div>Loading...</div>
  }

  return (
    <div>
      <h1>{player.name} — {shots.length} shots</h1>
      <CourtHexbinChart shots={shots} />
    </div>
  )
}

export default App
