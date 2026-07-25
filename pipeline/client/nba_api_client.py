# pipeline/client/nba_api_client.py

from nba_api.stats.endpoints import (
    shotchartdetail,
    shotchartlineupdetail,
    leaguedashlineups,
)

class NbaApiClient:

    def get_player_shot_chart_detail(self, player_id: str, season: str):
        response = shotchartdetail.ShotChartDetail(
            player_id=player_id,
            team_id=0,
            season_nullable=season,
            context_measure_simple="FGA",
        )
        return response.get_dict()