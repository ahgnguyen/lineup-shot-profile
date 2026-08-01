// backend/src/db/queries.ts

export const SELECT_PLAYERS_SHOTS = `
  SELECT player_id, loc_x, loc_y, made, shot_value
  FROM player_shot_history
  WHERE player_id = ANY($1)
`;

export const SELECT_PLAYERS_FGA_SHARES = `
  SELECT player_id, fga_share
  FROM player_fga_shares
  WHERE player_id = ANY($1)
`;

export const SELECT_TEAMS = `
  SELECT id, name, abbreviation
  FROM teams
  ORDER BY name
`;

export const SELECT_TEAM_PLAYERS = `
  SELECT id, name
  FROM players
  WHERE team_id = $1
  ORDER BY name
`;

export const SELECT_TEAM_LINEUPS = `
  SELECT
    l.id,
    l.player_ids,
    roster.player_names,
    roster.player_team_ids,
    roster.player_team_abbreviations,
    l.total_minutes,
    l.total_fga
  FROM lineups l
  CROSS JOIN LATERAL (
    SELECT
      array_agg(p.name ORDER BY ord) AS player_names,
      array_agg(p.team_id ORDER BY ord) AS player_team_ids,
      array_agg(t.abbreviation ORDER BY ord) AS player_team_abbreviations
    FROM unnest(l.player_ids) WITH ORDINALITY AS u(player_id, ord)
    JOIN players p ON p.id = u.player_id
    JOIN teams t ON t.id = p.team_id
  ) roster
  WHERE l.team_id = $1
  ORDER BY l.total_fga DESC
`;

export const SELECT_LINEUP_ACTUAL_SHOTS = `
  SELECT loc_x, loc_y, made, shot_value
  FROM lineup_actual_shots
  WHERE lineup_id = $1
`;
