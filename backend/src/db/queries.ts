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
