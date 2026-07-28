-- db/schema.sql

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
