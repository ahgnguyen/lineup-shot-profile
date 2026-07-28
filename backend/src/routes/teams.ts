// backend/src/routes/teams.ts

import { Router } from "express";
import { pool } from "../db/pool";
import { SELECT_TEAMS, SELECT_TEAM_PLAYERS } from "../db/queries";

const router = Router();

router.get("/", async (_req, res) => {
  const result = await pool.query(SELECT_TEAMS);
  res.json(result.rows);
});

router.get("/:id/players", async (req, res) => {
  const teamId = Number(req.params.id);
  const result = await pool.query(SELECT_TEAM_PLAYERS, [teamId]);
  res.json(result.rows);
});

export default router;
