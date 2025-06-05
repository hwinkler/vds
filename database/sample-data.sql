-- Sample data for VDS Fantasy Pro Cycling

-- Create 2024 games
INSERT OR REPLACE INTO game (sex, year, deadline) VALUES 
('m', 2024, '2024-03-01 23:59:59'),
('f', 2024, '2024-03-01 23:59:59');

-- Create some pro teams
INSERT OR REPLACE INTO pro_team (sex, year, pro_team_name, acronym) VALUES 
('m', 2024, 'UAE Team Emirates', 'UAE'),
('m', 2024, 'Team Jumbo-Visma', 'TJV'),
('m', 2024, 'INEOS Grenadiers', 'IGD'),
('m', 2024, 'Team DSM', 'DSM'),
('m', 2024, 'Quick-Step Alpha Vinyl', 'QST'),
('f', 2024, 'SD Worx', 'SDW'),
('f', 2024, 'Trek-Segafredo', 'TFS'),
('f', 2024, 'Team DSM', 'DSM'),
('f', 2024, 'Movistar Team', 'MOV'),
('f', 2024, 'FDJ-SUEZ', 'FDJ');

-- Create sample riders (Men)
INSERT OR REPLACE INTO rider (sex, year, rider_name, pro_team_name, price, birth_date, nationality) VALUES 
('m', 2024, 'Tadej Pogačar', 'UAE Team Emirates', 28, '1998-09-21', 'SLO'),
('m', 2024, 'Jonas Vingegaard', 'Team Jumbo-Visma', 26, '1996-12-10', 'DEN'),
('m', 2024, 'Primož Roglič', 'Team Jumbo-Visma', 24, '1989-10-29', 'SLO'),
('m', 2024, 'Geraint Thomas', 'INEOS Grenadiers', 20, '1986-05-25', 'GBR'),
('m', 2024, 'Egan Bernal', 'INEOS Grenadiers', 22, '1997-01-13', 'COL'),
('m', 2024, 'Romain Bardet', 'Team DSM', 18, '1990-11-09', 'FRA'),
('m', 2024, 'Julian Alaphilippe', 'Quick-Step Alpha Vinyl', 19, '1992-06-11', 'FRA'),
('m', 2024, 'Mark Cavendish', 'Quick-Step Alpha Vinyl', 16, '1985-05-21', 'GBR'),
('m', 2024, 'Wout van Aert', 'Team Jumbo-Visma', 25, '1994-09-15', 'BEL'),
('m', 2024, 'Mathieu van der Poel', 'UAE Team Emirates', 23, '1995-01-19', 'NED'),
('m', 2024, 'Adam Yates', 'UAE Team Emirates', 17, '1992-08-07', 'GBR'),
('m', 2024, 'Carlos Rodríguez', 'INEOS Grenadiers', 15, '2001-01-02', 'ESP'),
('m', 2024, 'Filippo Ganna', 'INEOS Grenadiers', 14, '1996-07-25', 'ITA'),
('m', 2024, 'Remco Evenepoel', 'Quick-Step Alpha Vinyl', 21, '2000-01-25', 'BEL'),
('m', 2024, 'Mads Pedersen', 'Team DSM', 13, '1996-01-18', 'DEN'),
('m', 2024, 'Jasper Philipsen', 'UAE Team Emirates', 12, '1998-03-02', 'BEL'),
('m', 2024, 'Sepp Kuss', 'Team Jumbo-Visma', 11, '1994-09-13', 'USA'),
('m', 2024, 'Tiesj Benoot', 'Team Jumbo-Visma', 10, '1994-03-11', 'BEL'),
('m', 2024, 'Tom Pidcock', 'INEOS Grenadiers', 16, '1999-07-30', 'GBR'),
('m', 2024, 'Jai Hindley', 'Team DSM', 14, '1996-05-05', 'AUS'),
('m', 2024, 'Aleksandr Vlasov', 'Team DSM', 13, '1996-04-23', 'RUS'),
('m', 2024, 'Enric Mas', 'Quick-Step Alpha Vinyl', 15, '1995-01-07', 'ESP'),
('m', 2024, 'João Almeida', 'UAE Team Emirates', 14, '1998-08-05', 'POR'),
('m', 2024, 'Ben O''Connor', 'UAE Team Emirates', 12, '1995-11-25', 'AUS'),
('m', 2024, 'Michael Matthews', 'Team DSM', 11, '1990-09-26', 'AUS');

-- Create sample riders (Women)
INSERT OR REPLACE INTO rider (sex, year, rider_name, pro_team_name, price, birth_date, nationality) VALUES 
('f', 2024, 'Annemiek van Vleuten', 'Movistar Team', 26, '1982-10-08', 'NED'),
('f', 2024, 'Demi Vollering', 'SD Worx', 24, '1996-11-15', 'NED'),
('f', 2024, 'Lotte Kopecky', 'SD Worx', 22, '1995-11-10', 'BEL'),
('f', 2024, 'Elisa Longo Borghini', 'Trek-Segafredo', 20, '1991-12-10', 'ITA'),
('f', 2024, 'Katarzyna Niewiadoma', 'Trek-Segafredo', 18, '1994-09-29', 'POL'),
('f', 2024, 'Cecilie Uttrup Ludwig', 'FDJ-SUEZ', 16, '1995-12-13', 'DEN'),
('f', 2024, 'Marianne Vos', 'Team DSM', 25, '1987-05-13', 'NED'),
('f', 2024, 'Lorena Wiebes', 'SD Worx', 19, '1999-03-17', 'NED'),
('f', 2024, 'Ashleigh Moolman-Pasio', 'SD Worx', 15, '1985-12-09', 'RSA'),
('f', 2024, 'Grace Brown', 'FDJ-SUEZ', 14, '1992-04-08', 'AUS'),
('f', 2024, 'Marta Cavalli', 'FDJ-SUEZ', 17, '1998-01-02', 'ITA'),
('f', 2024, 'Kristen Faulkner', 'Trek-Segafredo', 13, '1992-12-18', 'USA'),
('f', 2024, 'Juliette Labous', 'Team DSM', 12, '1998-09-21', 'FRA'),
('f', 2024, 'Niamh Fisher-Black', 'SD Worx', 11, '2000-05-08', 'NZL'),
('f', 2024, 'Fem van Empel', 'Team DSM', 10, '2002-10-05', 'NED');

-- Create sample player
INSERT OR REPLACE INTO player (player_id, player_name, email) VALUES 
(1, 'Test Player', 'test@example.com');

-- Create sample races
INSERT OR REPLACE INTO race (race_name, category, sex, year, start_date, end_date) VALUES 
('Tour de France', 'Grand Tours', 'm', 2024, '2024-07-01', '2024-07-23'),
('Giro d''Italia', 'Grand Tours', 'm', 2024, '2024-05-04', '2024-05-26'),
('Vuelta a España', 'Grand Tours', 'm', 2024, '2024-08-19', '2024-09-10'),
('Tour de France Femmes', 'Grand Tours', 'f', 2024, '2024-08-12', '2024-08-18'),
('Giro d''Italia Women', 'Grand Tours', 'f', 2024, '2024-06-30', '2024-07-07'),
('Paris-Roubaix', 'Monuments and Worlds', 'm', 2024, '2024-04-07', '2024-04-07'),
('Tour of Flanders', 'Monuments and Worlds', 'm', 2024, '2024-03-31', '2024-03-31'),
('Liège-Bastogne-Liège', 'Monuments and Worlds', 'm', 2024, '2024-04-21', '2024-04-21');