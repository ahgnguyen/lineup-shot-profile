# pipeline/client/nba_api_client.py

from nba_api.stats.endpoints import (
    shotchartdetail,
    teamplayeronoffdetails,
    leaguedashplayerstats,
    playerprofilev2,
)

class NbaApiClient:

    def get_player_shot_chart_detail(self, player_id: str, team_id: str, season: str):
        response = shotchartdetail.ShotChartDetail(
            player_id=player_id,
            team_id=team_id,
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

    def get_league_player_stats(self, season: str):
        response = leaguedashplayerstats.LeagueDashPlayerStats(season=season)
        return response.get_dict()

    def get_player_profile(self, player_id: str):
        response = playerprofilev2.PlayerProfileV2(player_id=player_id)
        return response.get_dict()