# pipeline/loader/postgres_loader.py

import os
import psycopg2

from pipeline.loader import queries

def get_connection():
    dsn = os.environ.get("DATABASE_URL", "postgresql:///lineup_shot_profile")
    return psycopg2.connect(dsn)

def upsert_team(conn, team_id, name, abbreviation):
    with conn.cursor() as cur:
        cur.execute(queries.UPSERT_TEAM, (team_id, name, abbreviation))

def upsert_player(conn, player_id, name, team_id):
    with conn.cursor() as cur:
        cur.execute(queries.UPSERT_PLAYER, (player_id, name, team_id))

def replace_player_shot_history(conn, player_id, shots):
    with conn.cursor() as cur:
        cur.execute(queries.DELETE_PLAYER_SHOT_HISTORY, (player_id,))
        cur.executemany(
            queries.INSERT_PLAYER_SHOT_HISTORY,
            [(s["player_id"], s["team_id"], s["loc_x"], s["loc_y"], s["made"], s["shot_value"]) for s in shots],
        )

def get_player_own_fga_for_team(conn, player_id, team_id):
    with conn.cursor() as cur:
        cur.execute(queries.SELECT_PLAYER_OWN_FGA_FOR_TEAM, (player_id, team_id))
        return cur.fetchone()[0]

def upsert_player_fga_share(conn, player_id, fga_share):
    with conn.cursor() as cur:
        cur.execute(queries.UPSERT_PLAYER_FGA_SHARE, (player_id, fga_share))

def upsert_lineup(conn, lineup_id, team_id, player_ids, total_minutes, total_fga):
    with conn.cursor() as cur:
        cur.execute(queries.UPSERT_LINEUP, (lineup_id, team_id, player_ids, total_minutes, total_fga))

def replace_lineup_actual_shots(conn, lineup_id, shots):
    with conn.cursor() as cur:
        cur.execute(queries.DELETE_LINEUP_ACTUAL_SHOTS, (lineup_id,))
        cur.executemany(
            queries.INSERT_LINEUP_ACTUAL_SHOTS,
            [(s["lineup_id"], s["loc_x"], s["loc_y"], s["made"], s["shot_value"]) for s in shots],
        )
