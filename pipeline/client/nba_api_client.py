# pipeline/client/nba_api_client.py

from nba_api.stats.endpoints import shotchartdetail, teamplayeronoffdetails

class NbaApiClient:

    def get_player_shot_chart_detail(self, player_id: str, season: str):
        response = shotchartdetail.ShotChartDetail(
            player_id=player_id,
            team_id=0,
            season_nullable=season,
            context_measure_simple="FGA",
        )
        return response.get_dict()

    def get_team_player_on_off_details(self, team_id: str, season: str):
        response = teamplayeronoffdetails.TeamPlayerOnOffDetails(
            team_id=team_id,
            season=season,
        )
        return response.get_dict()