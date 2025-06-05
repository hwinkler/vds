-- Fantasy Pro Cycling Database Schema

-- Game table for different game years and genders
CREATE TABLE IF NOT EXISTS game (
    sex CHAR(1) NOT NULL CHECK (sex IN ('m', 'f')),
    year INTEGER NOT NULL,
    deadline DATETIME NOT NULL,
    PRIMARY KEY (year, sex)
);

-- Pro cycling teams
CREATE TABLE IF NOT EXISTS pro_team (
    sex CHAR(1) NOT NULL CHECK (sex IN ('m', 'f')),
    year INTEGER NOT NULL,
    pro_team_name TEXT NOT NULL,
    acronym TEXT,
    icon BLOB,
    PRIMARY KEY (year, sex, pro_team_name),
    FOREIGN KEY (year, sex) REFERENCES game(year, sex)
);

-- Nationality reference table
CREATE TABLE IF NOT EXISTS nationality (
    nationality CHAR(3) NOT NULL PRIMARY KEY
);

-- Riders
CREATE TABLE IF NOT EXISTS rider (
    sex CHAR(1) NOT NULL CHECK (sex IN ('m', 'f')),
    year INTEGER NOT NULL,
    rider_name TEXT NOT NULL,
    pro_team_name TEXT NOT NULL,
    price INTEGER NOT NULL,
    birth_date DATE,
    nationality CHAR(3),
    PRIMARY KEY (year, sex, rider_name),
    FOREIGN KEY (year, sex, pro_team_name) REFERENCES pro_team(year, sex, pro_team_name),
    FOREIGN KEY (nationality) REFERENCES nationality(nationality)
);

-- Players
CREATE TABLE IF NOT EXISTS player (
    player_id INTEGER PRIMARY KEY AUTOINCREMENT,
    player_name TEXT NOT NULL UNIQUE,
    email TEXT UNIQUE,
    oauth_provider TEXT,
    oauth_id TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Player teams
CREATE TABLE IF NOT EXISTS player_team (
    team_id INTEGER PRIMARY KEY AUTOINCREMENT,
    player_id INTEGER NOT NULL,
    sex CHAR(1) NOT NULL CHECK (sex IN ('m', 'f')),
    year INTEGER NOT NULL,
    team_name TEXT NOT NULL,
    is_valid BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(player_id, sex, year),
    FOREIGN KEY (player_id) REFERENCES player(player_id),
    FOREIGN KEY (year, sex) REFERENCES game(year, sex)
);

-- Player team roster (which riders are on each player's team)
CREATE TABLE IF NOT EXISTS player_team_roster (
    team_id INTEGER NOT NULL,
    rider_name TEXT NOT NULL,
    sex CHAR(1) NOT NULL,
    year INTEGER NOT NULL,
    PRIMARY KEY (team_id, rider_name, sex, year),
    FOREIGN KEY (team_id) REFERENCES player_team(team_id),
    FOREIGN KEY (year, sex, rider_name) REFERENCES rider(year, sex, rider_name)
);

-- Race categories
CREATE TABLE IF NOT EXISTS category (
    category TEXT PRIMARY KEY
);

-- Races
CREATE TABLE IF NOT EXISTS race (
    race_id INTEGER PRIMARY KEY AUTOINCREMENT,
    race_name TEXT NOT NULL UNIQUE,
    category TEXT NOT NULL,
    sex CHAR(1) NOT NULL CHECK (sex IN ('m', 'f')),
    year INTEGER NOT NULL,
    start_date DATE,
    end_date DATE,
    FOREIGN KEY (category) REFERENCES category(category)
);

-- Race stages
CREATE TABLE IF NOT EXISTS stage (
    stage_id INTEGER PRIMARY KEY AUTOINCREMENT,
    race_id INTEGER NOT NULL,
    stage_number INTEGER NOT NULL,
    stage_date DATE NOT NULL,
    stage_type TEXT, -- 'stage' or 'one-day'
    UNIQUE(race_id, stage_number),
    FOREIGN KEY (race_id) REFERENCES race(race_id)
);

-- Stage finishers (race results)
CREATE TABLE IF NOT EXISTS finisher (
    finisher_id INTEGER PRIMARY KEY AUTOINCREMENT,
    stage_id INTEGER NOT NULL,
    rider_name TEXT NOT NULL,
    sex CHAR(1) NOT NULL,
    year INTEGER NOT NULL,
    finish_position INTEGER NOT NULL,
    points_awarded INTEGER DEFAULT 0,
    UNIQUE(stage_id, rider_name, sex, year),
    FOREIGN KEY (stage_id) REFERENCES stage(stage_id),
    FOREIGN KEY (year, sex, rider_name) REFERENCES rider(year, sex, rider_name)
);

-- Jersey holders (for stage races)
CREATE TABLE IF NOT EXISTS jersey_holder (
    jersey_id INTEGER PRIMARY KEY AUTOINCREMENT,
    stage_id INTEGER NOT NULL,
    rider_name TEXT NOT NULL,
    sex CHAR(1) NOT NULL,
    year INTEGER NOT NULL,
    jersey_type TEXT NOT NULL, -- 'leader', 'points', 'mountain', 'other'
    is_final BOOLEAN DEFAULT FALSE, -- true for final jersey, false for intermediate
    points_awarded INTEGER DEFAULT 0,
    UNIQUE(stage_id, rider_name, sex, year, jersey_type),
    FOREIGN KEY (stage_id) REFERENCES stage(stage_id),
    FOREIGN KEY (year, sex, rider_name) REFERENCES rider(year, sex, rider_name)
);

-- Insert default categories
INSERT OR IGNORE INTO category (category) VALUES 
    ('Grand Tours'),
    ('Monuments and Worlds'),
    ('Top Stage Races'),
    ('Top Classics'),
    ('Best of the Rest'),
    ('Minor Races'),
    ('National Champs'),
    ('Hour Record');

-- Insert some sample nationalities
INSERT OR IGNORE INTO nationality (nationality) VALUES 
    ('USA'), ('GBR'), ('FRA'), ('ITA'), ('ESP'), ('GER'), ('BEL'), ('NED'), 
    ('AUS'), ('COL'), ('SLO'), ('DEN'), ('NOR'), ('SWE'), ('SUI'), ('AUT'),
    ('POL'), ('CZE'), ('SVK'), ('POR'), ('IRL'), ('CAN'), ('RSA'), ('NZL');