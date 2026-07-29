// backend/src/routes/teams.ts

import { Router } from "express";
import { pool } from "../db/pool";
import { SELECT_TEAMS, SELECT_TEAM_PLAYERS, SELECT_TEAM_LINEUPS } from "../db/queries";

const SUFFICIENT_FGA = 100;

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

router.get("/:id/lineups", async (req, res) => {
  const teamId = Number(req.params.id);
  const result = await pool.query(SELECT_TEAM_LINEUPS, [teamId]);
  res.json(
    result.rows.map((row) => ({
      id: row.id,
      playerIds: row.player_ids,
      playerNames: row.player_names,
      playerTeamIds: row.player_team_ids,
      playerTeamAbbreviations: row.player_team_abbreviations,
      totalMinutes: Number(row.total_minutes),
      totalFga: row.total_fga,
      sufficientSample: row.total_fga >= SUFFICIENT_FGA,
    })),
  );
});

export default router;
