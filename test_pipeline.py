# tests/test_pipeline.py

from pipeline.client.nba_api_client import NbaApiClient
from pipeline.writer.raw_game_json_writer import write_raw_game_json

GAME_ID = "0022500080"

client = NbaApiClient()
data = client.get_play_by_play(GAME_ID)

write_raw_game_json(
    data,
    GAME_ID
)