# pipeline/transformer/lineup_transformer.py

from pipeline.transformer.result_sets import find_result_set

def parse_group_id(group_id: str) -> list[int]:
    return [int(p) for p in group_id.split("-") if p]

def transform_lineups(league_dash_lineups, team_id) -> list[dict]:
    result_set = find_result_set(league_dash_lineups, "Lineups")

    headers = result_set["headers"]
    group_id_idx = headers.index("GROUP_ID")
    min_idx = headers.index("MIN")
    fga_idx = headers.index("FGA")

    return [
        {
            "id": row[group_id_idx],
            "team_id": team_id,
            "player_ids": parse_group_id(row[group_id_idx]),
            "total_minutes": row[min_idx],
            "total_fga": row[fga_idx],
        }
        for row in result_set["rowSet"]
    ]

def transform_to_lineup_actual_shots(shot_chart_lineup_detail, lineup_id) -> list[dict]:
    result_set = find_result_set(shot_chart_lineup_detail, "ShotChartLineupDetail")

    headers = result_set["headers"]
    x_idx = headers.index("LOC_X")
    y_idx = headers.index("LOC_Y")
    made_idx = headers.index("SHOT_MADE_FLAG")
    shot_type_idx = headers.index("SHOT_TYPE")

    return [
        {
            "lineup_id": lineup_id,
            "loc_x": row[x_idx],
            "loc_y": row[y_idx],
            "made": bool(row[made_idx]),
            "shot_value": 3 if row[shot_type_idx] == "3PT Field Goal" else 2,
        }
        for row in result_set["rowSet"]
    ]
