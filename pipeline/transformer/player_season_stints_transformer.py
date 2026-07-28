# pipeline/transformer/player_season_stints_transformer.py

from pipeline.transformer.result_sets import find_result_set

def transform_player_season_stints(player_profile, season: str) -> list[int]:
    result_set = find_result_set(player_profile, "SeasonTotalsRegularSeason")

    headers = result_set["headers"]
    season_idx = headers.index("SEASON_ID")
    team_id_idx = headers.index("TEAM_ID")

    return [
        row[team_id_idx]
        for row in result_set["rowSet"]
        if row[season_idx] == season and row[team_id_idx] != 0
    ]
