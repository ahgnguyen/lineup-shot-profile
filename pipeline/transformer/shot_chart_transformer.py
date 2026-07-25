# pipeline/transformer/shot_chart_transformer.py

def _find_result_set(data, name):
    for rs in data["resultSets"]:
        if rs["name"] == name:
            return rs
    raise ValueError(f'No "{name}" resultSet in response')


def transform_to_player_shot_history(shot_chart_detail, player_id) -> list[dict]:
    result_set = _find_result_set(shot_chart_detail, "Shot_Chart_Detail")

    headers = result_set["headers"]
    x_idx = headers.index("LOC_X")
    y_idx = headers.index("LOC_Y")
    made_idx = headers.index("SHOT_MADE_FLAG")

    return [
        {
            "player_id": player_id,
            "loc_x": row[x_idx],
            "loc_y": row[y_idx],
            "made": bool(row[made_idx]),
        }
        for row in result_set["rowSet"]
    ]

def transform_to_player_team(shot_chart_detail) -> dict:
    result_set = _find_result_set(shot_chart_detail, "Shot_Chart_Detail")

    headers = result_set["headers"]
    player_name_idx = headers.index("PLAYER_NAME")
    team_id_idx = headers.index("TEAM_ID")
    team_name_idx = headers.index("TEAM_NAME")
    game_date_idx = headers.index("GAME_DATE")

    rows = result_set["rowSet"]
    if not rows:
        raise ValueError("No shots to determine player/team info from")

    latest_row = max(rows, key=lambda row: row[game_date_idx])
    return {
        "player_name": latest_row[player_name_idx],
        "team_id": latest_row[team_id_idx],
        "team_name": latest_row[team_name_idx],
    }
