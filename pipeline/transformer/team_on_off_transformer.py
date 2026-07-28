# pipeline/transformer/team_on_off_transformer.py

from pipeline.transformer.result_sets import find_result_set

def transform_team_on_court_fga(data) -> dict[int, int]:
    """player_id -> team's FGA while that player was on the court."""
    result_set = find_result_set(data, "PlayersOnCourtTeamPlayerOnOffDetails")

    headers = result_set["headers"]
    player_id_idx = headers.index("VS_PLAYER_ID")
    fga_idx = headers.index("FGA")

    return {
        row[player_id_idx]: row[fga_idx]
        for row in result_set["rowSet"]
    }
