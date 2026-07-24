# pipeline/client/nba_api_client.py

from nba_api.stats.endpoints import playbyplayv3

class NbaApiClient:

    def get_play_by_play(self, game_id: str):
        response = playbyplayv3.PlayByPlayV3(
            game_id=game_id
        )

        return response.get_dict()