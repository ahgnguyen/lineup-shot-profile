// backend/src/routes/composite.ts

import { Router } from "express";
import { pool } from "../db/pool";
import { SELECT_PLAYERS_SHOTS, SELECT_PLAYERS_FGA_SHARES } from "../db/queries";
import { computeComposite, type PlayerShotData } from "../model/composite";
import type { ShotPoint } from "../model/hexbin";

const router = Router();

router.get("/", async (req, res) => {
  const playerIds = (req.query.playerIds as string).split(",").map(Number);

  const [shotsResult, sharesResult] = await Promise.all([
    pool.query(SELECT_PLAYERS_SHOTS, [playerIds]),
    pool.query(SELECT_PLAYERS_FGA_SHARES, [playerIds]),
  ]);

  const sharesByPlayer = new Map<number, number>(
    sharesResult.rows.map((r) => [r.player_id, Number(r.fga_share)]),
  );

  const shotsByPlayer = new Map<number, ShotPoint[]>();
  for (const row of shotsResult.rows) {
    const shots = shotsByPlayer.get(row.player_id) ?? [];
    shots.push({
      x: row.loc_x,
      y: row.loc_y,
      points: row.made ? row.shot_value : 0,
    });
    shotsByPlayer.set(row.player_id, shots);
  }

  const players: PlayerShotData[] = playerIds.map((playerId) => ({
    playerId,
    shots: shotsByPlayer.get(playerId) ?? [],
    fgaShare: sharesByPlayer.get(playerId) ?? 0,
  }));

  res.json(computeComposite(players));
});

export default router;
