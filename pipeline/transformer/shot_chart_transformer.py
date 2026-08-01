# pipeline/transformer/shot_chart_transformer.py

from pipeline.transformer.result_sets import find_result_set

def transform_to_player_shot_history(shot_chart_detail, player_id, team_id) -> list[dict]:
    result_set = find_result_set(shot_chart_detail, "Shot_Chart_Detail")

    headers = result_set["headers"]
    x_idx = headers.index("LOC_X")
    y_idx = headers.index("LOC_Y")
    made_idx = headers.index("SHOT_MADE_FLAG")
    shot_type_idx = headers.index("SHOT_TYPE")

    return [
        {
            "player_id": player_id,
            "team_id": team_id,
            "loc_x": row[x_idx],
            "loc_y": row[y_idx],
            "made": bool(row[made_idx]),
            "shot_value": 3 if row[shot_type_idx] == "3PT Field Goal" else 2,
        }
        for row in result_set["rowSet"]
    ]
