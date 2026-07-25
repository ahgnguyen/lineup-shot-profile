# tests/test_pipeline.py

from pipeline.client.nba_api_client import NbaApiClient
from pipeline.transformer.shot_chart_transformer import transform_player_shot_chart
from pipeline.writer.json_writer import write_json

PLAYER_IDS = [1642856, 1629611, 1629008, 1641730, 1629651]
SEASON = '2025-26'

client = NbaApiClient()

for player_id in PLAYER_IDS:
    short_chart_detail = client.get_player_shot_chart_detail(player_id, SEASON)
    shot_history = transform_player_shot_chart(short_chart_detail, player_id)
    write_json(shot_history, subdir="player_shot_history", key=str(player_id))
