# pipeline/transformer/shot_chart_transformer.py

def transform_player_shot_chart(shot_chart_detail, player_id) -> list[dict]:
    result_set = None
    for rs in shot_chart_detail["resultSets"]:
        if rs["name"] == "Shot_Chart_Detail":
            result_set = rs
            break

    if result_set is None:
        raise ValueError('No "Shot_Chart_Detail" resultSet in shot chart response')

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
