# pipeline/transformer/league_player_transformer.py

from pipeline.transformer.result_sets import find_result_set

def transform_league_players(data) -> list[dict]:
    result_set = find_result_set(data, "LeagueDashPlayerStats")

    headers = result_set["headers"]
    player_id_idx = headers.index("PLAYER_ID")
    player_name_idx = headers.index("PLAYER_NAME")
    team_id_idx = headers.index("TEAM_ID")

    return [
        {
            "player_id": row[player_id_idx],
            "player_name": row[player_name_idx],
            "team_id": row[team_id_idx],
        }
        for row in result_set["rowSet"]
    ]
