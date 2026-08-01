# pipeline/loader/queries.py

UPSERT_TEAM = """
INSERT INTO teams (id, name, abbreviation)
VALUES (%s, %s, %s)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, abbreviation = EXCLUDED.abbreviation
"""

UPSERT_PLAYER = """
INSERT INTO players (id, name, team_id)
VALUES (%s, %s, %s)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, team_id = EXCLUDED.team_id
"""

DELETE_PLAYER_SHOT_HISTORY = "DELETE FROM player_shot_history WHERE player_id = %s"

INSERT_PLAYER_SHOT_HISTORY = """
INSERT INTO player_shot_history (player_id, team_id, loc_x, loc_y, made, shot_value)
VALUES (%s, %s, %s, %s, %s, %s)
"""

SELECT_PLAYER_OWN_FGA_FOR_TEAM = """
SELECT COUNT(*) FROM player_shot_history WHERE player_id = %s AND team_id = %s
"""

UPSERT_PLAYER_FGA_SHARE = """
INSERT INTO player_fga_shares (player_id, fga_share)
VALUES (%s, %s)
ON CONFLICT (player_id) DO UPDATE SET fga_share = EXCLUDED.fga_share
"""

UPSERT_LINEUP = """
INSERT INTO lineups (id, team_id, player_ids, total_minutes, total_fga)
VALUES (%s, %s, %s, %s, %s)
ON CONFLICT (id) DO UPDATE SET
    team_id = EXCLUDED.team_id,
    player_ids = EXCLUDED.player_ids,
    total_minutes = EXCLUDED.total_minutes,
    total_fga = EXCLUDED.total_fga
"""

DELETE_LINEUP_ACTUAL_SHOTS = "DELETE FROM lineup_actual_shots WHERE lineup_id = %s"

INSERT_LINEUP_ACTUAL_SHOTS = """
INSERT INTO lineup_actual_shots (lineup_id, loc_x, loc_y, made, shot_value)
VALUES (%s, %s, %s, %s, %s)
"""
