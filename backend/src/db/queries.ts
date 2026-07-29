// backend/src/db/queries.ts

export const SELECT_PLAYER_SHOTS = `
  SELECT loc_x, loc_y, made
  FROM player_shot_history
  WHERE player_id = $1
`;

export const SELECT_PLAYER = `
  SELECT id, name
  FROM players
  WHERE id = $1
`;

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

export const SEARCH_PLAYERS = `
  SELECT p.id, p.name, t.abbreviation AS team_abbreviation
  FROM players p
  JOIN teams t ON t.id = p.team_id
  WHERE unaccent(p.name) ILIKE '%' || unaccent($1) || '%'
  ORDER BY p.name
  LIMIT 25
`;
