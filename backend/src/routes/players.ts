// backend/src/routes/players.ts

import { Router } from "express";
import { pool } from "../db/pool";
import { SELECT_PLAYER_SHOTS, SELECT_PLAYER } from "../db/queries";

const router = Router();

router.get("/:id", async (req, res) => {
  const playerId = Number(req.params.id);
  const result = await pool.query(SELECT_PLAYER, [playerId]);
  res.json(result.rows[0]);
});

router.get("/:id/shots", async (req, res) => {
  const playerId = Number(req.params.id);
  const result = await pool.query(SELECT_PLAYER_SHOTS, [playerId]);
  res.json(result.rows);
});

export default router;
