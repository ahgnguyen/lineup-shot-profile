// backend/src/routes/players.ts

import { Router } from "express";
import { pool } from "../db/pool";
import { SELECT_PLAYER_SHOTS } from "../db/queries";

const router = Router();

router.get("/:id/shots", async (req, res) => {
  const playerId = Number(req.params.id);
  const result = await pool.query(SELECT_PLAYER_SHOTS, [playerId]);
  res.json(result.rows);
});

export default router;
