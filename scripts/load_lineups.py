# scripts/load_lineups.py

import time

from pipeline.client.nba_api_client import NbaApiClient
from pipeline.transformer.lineup_transformer import transform_lineups, transform_to_lineup_actual_shots
from pipeline.loader.postgres_loader import (
    get_connection,
    upsert_lineup,
    replace_lineup_actual_shots,
)

SEASON = '2025-26'
REQUEST_DELAY_SECONDS = 0.3
SUFFICIENT_FGA = 100

client = NbaApiClient()
conn = get_connection()

with conn.cursor() as cur:
    cur.execute("SELECT id FROM teams")
    all_team_ids = [row[0] for row in cur.fetchall()]
print(f"Found {len(all_team_ids)} teams")

qualifying_lineups = []
for i, team_id in enumerate(all_team_ids, start=1):
    try:
        data = client.get_league_dash_lineups(team_id, SEASON)
        lineups = transform_lineups(data, team_id)
        for lineup in lineups:
            upsert_lineup(
                conn, lineup["id"], lineup["team_id"], lineup["player_ids"],
                lineup["total_minutes"], lineup["total_fga"],
            )
        conn.commit()
        team_qualifying = [l for l in lineups if l["total_fga"] >= SUFFICIENT_FGA]
        qualifying_lineups.extend(team_qualifying)
        print(f"[{i}/{len(all_team_ids)}] team {team_id}: {len(lineups)} lineups, "
              f"{len(team_qualifying)} with {SUFFICIENT_FGA}+ FGA")
    except Exception as e:
        print(f"[{i}/{len(all_team_ids)}] team {team_id}: FAILED ({e})")
    time.sleep(REQUEST_DELAY_SECONDS)

print(f"{len(qualifying_lineups)} lineups league-wide clear the {SUFFICIENT_FGA}-FGA threshold")

for i, lineup in enumerate(qualifying_lineups, start=1):
    try:
        shot_data = client.get_shot_chart_lineup_detail(lineup["id"], lineup["team_id"], SEASON)
        shots = transform_to_lineup_actual_shots(shot_data, lineup["id"])
        replace_lineup_actual_shots(conn, lineup["id"], shots)
        conn.commit()
        print(f"[{i}/{len(qualifying_lineups)}] {lineup['id']}: {len(shots)} shots")
    except Exception as e:
        print(f"[{i}/{len(qualifying_lineups)}] {lineup['id']}: FAILED ({e})")
    time.sleep(REQUEST_DELAY_SECONDS)

conn.close()
