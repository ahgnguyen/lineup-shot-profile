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
