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
            [(s["player_id"], s["loc_x"], s["loc_y"], s["made"]) for s in shots],
        )

def get_player_own_fga(conn, player_id):
    with conn.cursor() as cur:
        cur.execute(queries.SELECT_PLAYER_OWN_FGA, (player_id,))
        return cur.fetchone()[0]

def upsert_player_fga_share(conn, player_id, fga_share):
    with conn.cursor() as cur:
        cur.execute(queries.UPSERT_PLAYER_FGA_SHARE, (player_id, fga_share))
