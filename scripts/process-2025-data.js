#!/usr/bin/env node

const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// Helper function to convert Excel date serial to JavaScript Date
function excelDateToJSDate(serial) {
  if (!serial || isNaN(serial)) return null;
  // Excel date serial starts from 1900-01-01 (but Excel treats 1900 as a leap year incorrectly)
  const excelEpoch = new Date(1899, 11, 30); // December 30, 1899
  const jsDate = new Date(excelEpoch.getTime() + (serial * 24 * 60 * 60 * 1000));
  return jsDate.toISOString().split('T')[0]; // Return YYYY-MM-DD format
}

// Helper function to clean rider names for matching
function cleanRiderName(name) {
  if (!name) return '';
  return name.trim().replace(/\s+/g, ' ');
}

// Helper function to escape SQL strings
function escapeSql(str) {
  if (!str) return 'NULL';
  return "'" + str.toString().replace(/'/g, "''") + "'";
}

console.log('Processing 2025 Excel files...');

// Read all three Excel files
const ridersFile = '/Users/hughw/vds/database/xls/2025/FSA_DS_Men2025 FINAL.xlsx';
const calendarFile = '/Users/hughw/vds/database/xls/2025/VDS Calendar.xlsx';
const teamsFile = '/Users/hughw/vds/database/xls/2025/VDS Teams and Riders.xlsx';

const ridersWorkbook = XLSX.readFile(ridersFile);
const calendarWorkbook = XLSX.readFile(calendarFile);
const teamsWorkbook = XLSX.readFile(teamsFile);

// Process riders data
console.log('Processing riders...');
const ridersSheet = ridersWorkbook.Sheets['FSA_DS_Men2025 v1'];
const ridersData = XLSX.utils.sheet_to_json(ridersSheet);

// Filter to only active riders (have price and team)
const activeRiders = ridersData.filter(rider => 
  rider['Price 2025'] && 
  rider['Team 2025'] && 
  rider['Short Display Name']
);

console.log(`Found ${activeRiders.length} active riders out of ${ridersData.length} total`);

// Process calendar data
console.log('Processing calendar...');
const calendarSheet = calendarWorkbook.Sheets['2025 calendar'];
const calendarData = XLSX.utils.sheet_to_json(calendarSheet);

// Clean up calendar data - filter out invalid entries and fix categories
const validRaces = calendarData.filter(race => 
  race['Race'] && 
  race['Start date'] && 
  race['Rank'] && 
  race['Rank'] >= 1 && 
  race['Rank'] <= 6
);

console.log(`Found ${validRaces.length} valid races out of ${calendarData.length} total`);

// Process teams data
console.log('Processing teams...');
const teamsSheet = teamsWorkbook.Sheets['Teams and Riders'];
const teamsData = XLSX.utils.sheet_to_json(teamsSheet);

// Filter out incomplete teams
const completeTeams = teamsData.filter(team => 
  team['Username'] && 
  team['Team Name'] && 
  team['Rider 1']
);

console.log(`Found ${completeTeams.length} complete teams`);

// Generate DDL file
console.log('Generating DDL...');

let ddl = `-- VDS 2025 Men's Season Data
-- Generated on ${new Date().toISOString()}
-- Source: Excel files in database/xls/2025/

BEGIN TRANSACTION;

-- Clear existing 2025 data
DELETE FROM player_team_roster WHERE year = 2025;
DELETE FROM player_team WHERE year = 2025;
DELETE FROM stage WHERE race_id IN (SELECT race_id FROM race WHERE year = 2025);
DELETE FROM race WHERE year = 2025;
DELETE FROM rider WHERE year = 2025;
DELETE FROM pro_team WHERE year = 2025;
DELETE FROM player WHERE oauth_provider IS NULL; -- Clear non-oauth players to reload from Excel

-- Insert 2025 game
INSERT OR IGNORE INTO game (year, sex, deadline) VALUES (2025, 'm', '2025-03-01 00:00:00');

-- Insert missing nationalities from Excel data
`;

// Get unique nationalities from the Excel data
const nationalities = [...new Set(activeRiders.map(r => r['Country']).filter(Boolean))];
nationalities.sort();

for (const nationality of nationalities) {
  ddl += `INSERT OR IGNORE INTO nationality (nationality) VALUES (${escapeSql(nationality)});\n`;
}

ddl += '\n-- Insert pro teams for 2025\n';

// Get unique teams from riders
const teams = [...new Set(activeRiders.map(r => r['Team 2025']).filter(Boolean))];
teams.sort();

for (const team of teams) {
  ddl += `INSERT INTO pro_team (pro_team_name, acronym, year, sex) VALUES (${escapeSql(team)}, ${escapeSql(team)}, 2025, 'm');\n`;
}

ddl += '\n-- Insert riders for 2025\n';

// Insert riders with error handling
for (const rider of activeRiders) {
  const riderName = cleanRiderName(rider['Short Display Name']);
  const teamName = rider['Team 2025'];
  const price = rider['Price 2025'] || 0;
  const nationality = rider['Country'] || '';
  
  ddl += `INSERT OR IGNORE INTO rider (rider_name, pro_team_name, year, sex, price, nationality) VALUES (${escapeSql(riderName)}, ${escapeSql(teamName)}, 2025, 'm', ${price}, ${escapeSql(nationality)});\n`;
}

ddl += '\n-- Insert races for 2025\n';

// Insert races
let raceId = 1;
for (const race of validRaces) {
  const raceName = race['Race'];
  const startDate = excelDateToJSDate(race['Start date']);
  const category = race['Rank'];
  const stages = race['Stages'] === 'N/A' ? 1 : (parseInt(race['Stages']) || 1);
  
  if (startDate) {
    ddl += `INSERT INTO race (race_id, race_name, year, sex, start_date, category) VALUES (${raceId}, ${escapeSql(raceName)}, 2025, 'm', '${startDate}', ${category});\n`;
    
    // Add stages for this race
    for (let stageNum = 1; stageNum <= stages; stageNum++) {
      const stageDate = new Date(startDate);
      stageDate.setDate(stageDate.getDate() + (stageNum - 1));
      const stageDateStr = stageDate.toISOString().split('T')[0];
      
      ddl += `INSERT INTO stage (race_id, stage_number, stage_date) VALUES (${raceId}, ${stageNum}, '${stageDateStr}');\n`;
    }
    
    raceId++;
  }
}

ddl += '\n-- Insert players and teams for 2025\n';

// Insert players and their teams
let playerId = 1;
let teamId = 1;

for (const team of completeTeams) {
  const username = team['Username'];
  const teamName = team['Team Name'];
  
  // Insert player (without oauth info - will be filled when they log in)
  ddl += `INSERT OR IGNORE INTO player (player_id, player_name) VALUES (${playerId}, ${escapeSql(username)});\n`;
  
  // Insert player team
  ddl += `INSERT INTO player_team (team_id, player_id, sex, year, team_name, is_valid) VALUES (${teamId}, ${playerId}, 'm', 2025, ${escapeSql(teamName)}, 1);\n`;
  
  // Insert team roster
  for (let i = 1; i <= 25; i++) {
    const riderKey = `Rider ${i}`;
    const riderName = team[riderKey];
    
    if (riderName) {
      const cleanedName = cleanRiderName(riderName);
      ddl += `INSERT INTO player_team_roster (team_id, rider_name, sex, year) VALUES (${teamId}, ${escapeSql(cleanedName)}, 'm', 2025);\n`;
    }
  }
  
  playerId++;
  teamId++;
}

ddl += '\nCOMMIT;\n';

// Write DDL file
const outputPath = '/Users/hughw/vds/database/2025-men-data.sql';
fs.writeFileSync(outputPath, ddl);

console.log(`\nDDL file generated: ${outputPath}`);
console.log(`\nSummary:`);
console.log(`- Teams: ${teams.length}`);
console.log(`- Riders: ${activeRiders.length}`);
console.log(`- Races: ${validRaces.length}`);
console.log(`- Player Teams: ${completeTeams.length}`);
console.log(`\nTo load into D1:`);
console.log(`wrangler d1 execute vds-db --file=database/2025-men-data.sql`);