// backend/src/routes/lineups.ts

import { Router } from "express";
import { pool } from "../db/pool";
import { SELECT_LINEUP_ACTUAL_SHOTS } from "../db/queries";
import { computeActual } from "../model/composite";
import type { ShotPoint } from "../model/hexbin";

const router = Router();

router.get("/:id/actual", async (req, res) => {
  const lineupId = req.params.id;
  const result = await pool.query(SELECT_LINEUP_ACTUAL_SHOTS, [lineupId]);

  const shots: ShotPoint[] = result.rows.map((row) => ({
    x: row.loc_x,
    y: row.loc_y,
    points: row.made ? row.shot_value : 0,
  }));

  const cells = computeActual(shots);
  res.json({ cells, totalShots: shots.length });
});

export default router;
