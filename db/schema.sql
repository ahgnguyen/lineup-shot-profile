-- db/schema.sql

CREATE EXTENSION IF NOT EXISTS unaccent;

CREATE TABLE teams (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    abbreviation TEXT NOT NULL
);

CREATE TABLE players (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    team_id INTEGER NOT NULL REFERENCES teams(id)
);

CREATE TABLE player_shot_history (
    id SERIAL PRIMARY KEY,
    player_id INTEGER NOT NULL REFERENCES players(id),
    team_id INTEGER NOT NULL REFERENCES teams(id),
    loc_x INTEGER NOT NULL,
    loc_y INTEGER NOT NULL,
    made BOOLEAN NOT NULL,
    shot_value SMALLINT NOT NULL
);

CREATE INDEX idx_player_shot_history_player_id ON player_shot_history(player_id);

CREATE TABLE player_fga_shares (
    player_id INTEGER PRIMARY KEY REFERENCES players(id),
    fga_share NUMERIC NOT NULL
);

CREATE TABLE lineups (
    id TEXT PRIMARY KEY,
    team_id INTEGER NOT NULL REFERENCES teams(id),
    player_ids INTEGER[] NOT NULL CHECK (array_length(player_ids, 1) = 5),
    total_minutes NUMERIC NOT NULL,
    total_fga INTEGER NOT NULL
);

CREATE TABLE lineup_actual_shots (
    id SERIAL PRIMARY KEY,
    lineup_id TEXT NOT NULL REFERENCES lineups(id),
    loc_x INTEGER NOT NULL,
    loc_y INTEGER NOT NULL,
    made BOOLEAN NOT NULL,
    shot_value SMALLINT NOT NULL
);

CREATE INDEX idx_lineup_actual_shots_lineup_id ON lineup_actual_shots(lineup_id);
