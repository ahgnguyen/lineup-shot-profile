# pipeline/client/nba_api_client.py

from nba_api.stats.endpoints import (
    shotchartdetail,
    teamplayeronoffdetails,
    leaguedashplayerstats,
    playerprofilev2,
    leaguedashlineups,
    shotchartlineupdetail,
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

    def get_league_dash_lineups(self, team_id: str, season: str):
        response = leaguedashlineups.LeagueDashLineups(
            team_id_nullable=team_id,
            season=season,
            group_quantity=5,
        )
        return response.get_dict()

    def get_shot_chart_lineup_detail(self, group_id: str, team_id: str, season: str):
        response = shotchartlineupdetail.ShotChartLineupDetail(
            group_id=group_id,
            team_id_nullable=team_id,
            season=season,
            context_measure_detailed="FGA",
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