# scripts/load_players.py

from nba_api.stats.static import teams as static_teams

from pipeline.client.nba_api_client import NbaApiClient
from pipeline.transformer.shot_chart_transformer import (
    transform_to_player_shot_history,
    transform_to_player_team,
)
from pipeline.loader.postgres_loader import (
    get_connection,
    upsert_team,
    upsert_player,
    replace_player_shot_history,
)

PLAYER_IDS = [1642856, 1629611, 1629008, 1641730, 1629651]
SEASON = '2025-26'

nba_client = NbaApiClient()
conn = get_connection()

for player_id in PLAYER_IDS:
    shot_chart_detail = nba_client.get_player_shot_chart_detail(player_id, 0, SEASON)

    team_info = transform_to_player_team(shot_chart_detail)
    team_abbreviation = static_teams.find_team_name_by_id(team_info["team_id"])["abbreviation"]
    shot_history = transform_to_player_shot_history(shot_chart_detail, player_id, team_info["team_id"])

    upsert_team(conn, team_info["team_id"], team_info["team_name"], team_abbreviation)
    upsert_player(conn, player_id, team_info["player_name"], team_info["team_id"])
    replace_player_shot_history(conn, player_id, shot_history)
    conn.commit()

    print(f"Loaded {len(shot_history)} shots for {team_info['player_name']} "
          f"({team_info['team_name']}) into the database")

conn.close()
