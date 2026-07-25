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
INSERT INTO player_shot_history (player_id, loc_x, loc_y, made) VALUES (%s, %s, %s, %s)
"""
