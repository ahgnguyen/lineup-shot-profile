# scripts/load_player_fga_shares.py

from pipeline.client.nba_api_client import NbaApiClient
from pipeline.transformer.team_on_off_transformer import transform_team_on_court_fga
from pipeline.loader.postgres_loader import (
    get_connection,
    get_player_own_fga,
    upsert_player_fga_share,
)

TEAM_ID = 1610612751
PLAYER_IDS = [1642856, 1629611, 1629008, 1641730, 1629651]
SEASON = '2025-26'

client = NbaApiClient()
conn = get_connection()

data = client.get_team_player_on_off_details(TEAM_ID, SEASON)
team_fga_on_court = transform_team_on_court_fga(data)

for player_id in PLAYER_IDS:
    own_fga = get_player_own_fga(conn, player_id)
    team_fga = team_fga_on_court[player_id]
    fga_share = own_fga / team_fga

    upsert_player_fga_share(conn, player_id, fga_share)
    conn.commit()

    print(f"Player {player_id}: {own_fga} own FGA / {team_fga} team FGA on-court "
          f"= {fga_share:.3f} share")

conn.close()
