# scripts/load_all_players.py

import time

from nba_api.stats.static import teams as static_teams

from pipeline.client.nba_api_client import NbaApiClient
from pipeline.transformer.league_player_transformer import transform_league_players
from pipeline.transformer.player_season_stints_transformer import transform_player_season_stints
from pipeline.transformer.shot_chart_transformer import transform_to_player_shot_history
from pipeline.transformer.team_on_off_transformer import transform_team_on_court_fga
from pipeline.loader.postgres_loader import (
    get_connection,
    upsert_team,
    upsert_player,
    replace_player_shot_history,
    get_player_own_fga_for_team,
    upsert_player_fga_share,
)

SEASON = '2025-26'
REQUEST_DELAY_SECONDS = 0.3

client = NbaApiClient()
conn = get_connection()

league_players = transform_league_players(client.get_league_player_stats(SEASON))
player_names = {p["player_id"]: p["player_name"] for p in league_players}
current_team_by_player = {p["player_id"]: p["team_id"] for p in league_players}
print(f"Found {len(league_players)} players league-wide")

player_stints = {}
for i, p in enumerate(league_players, start=1):
    player_id = p["player_id"]
    try:
        profile = client.get_player_profile(player_id)
        stints = transform_player_season_stints(profile, SEASON)
        if not stints:
            print(f"[{i}/{len(league_players)}] {p['player_name']}: no {SEASON} stint data, skipping")
        else:
            player_stints[player_id] = stints
            print(f"[{i}/{len(league_players)}] {p['player_name']}: {len(stints)} stint(s)")
    except Exception as e:
        print(f"[{i}/{len(league_players)}] {p['player_name']}: FAILED ({e})")
    time.sleep(REQUEST_DELAY_SECONDS)

all_team_ids = set(current_team_by_player.values()) | {
    team_id for stints in player_stints.values() for team_id in stints
}
for team_id in all_team_ids:
    info = static_teams.find_team_name_by_id(team_id)
    upsert_team(conn, team_id, info["full_name"], info["abbreviation"])
conn.commit()
print(f"Loaded {len(all_team_ids)} teams")

for player_id, name in player_names.items():
    upsert_player(conn, player_id, name, current_team_by_player[player_id])
conn.commit()
print(f"Loaded {len(player_names)} players")

for i, (player_id, stints) in enumerate(player_stints.items(), start=1):
    try:
        all_shots = []
        for team_id in stints:
            shot_chart_detail = client.get_player_shot_chart_detail(player_id, team_id, SEASON)
            all_shots.extend(transform_to_player_shot_history(shot_chart_detail, player_id, team_id))
            time.sleep(REQUEST_DELAY_SECONDS)
        replace_player_shot_history(conn, player_id, all_shots)
        conn.commit()
        print(f"[{i}/{len(player_stints)}] {player_names[player_id]}: "
              f"{len(all_shots)} shots across {len(stints)} stint(s)")
    except Exception as e:
        print(f"[{i}/{len(player_stints)}] {player_names[player_id]}: FAILED ({e})")

player_fga_numerator = {}
player_fga_denominator = {}
for i, team_id in enumerate(all_team_ids, start=1):
    try:
        team_fga_on_court = transform_team_on_court_fga(client.get_team_player_on_off_details(team_id, SEASON))

        for player_id, stints in player_stints.items():
            if team_id not in stints:
                continue
            team_fga = team_fga_on_court.get(player_id)
            if not team_fga:
                continue
            own_fga = get_player_own_fga_for_team(conn, player_id, team_id)
            player_fga_numerator[player_id] = player_fga_numerator.get(player_id, 0) + own_fga
            player_fga_denominator[player_id] = player_fga_denominator.get(player_id, 0) + team_fga
        print(f"[{i}/{len(all_team_ids)}] team {team_id}: processed")
    except Exception as e:
        print(f"[{i}/{len(all_team_ids)}] team {team_id}: FAILED ({e})")
    time.sleep(REQUEST_DELAY_SECONDS)

for player_id, numerator in player_fga_numerator.items():
    upsert_player_fga_share(conn, player_id, numerator / player_fga_denominator[player_id])
conn.commit()
print(f"Loaded FGA shares for {len(player_fga_numerator)} players")

conn.close()