#!/usr/bin/env node

const fs = require('fs');

// List of mismatched rider names from the analysis
const mismatchedNames = [
  'Lennert van Eetvelt',
  'Wout Van Aert',
  'Isaac del Toro',
  'Laurance Pithie',
  'Ivan Romeo',
  'Maxim van Gils',
  'Paul magnier',
  'Cian uijtdebroeks',
  'Arnaud de Lie',
  'António Morgado',
  'Matej Mohoric',
  'Tibor Del grosso',
  'VAlentin Paret-Peintre',
  'Steffen de Schuyteneer',
  'Frank Van den Broek',
  'Simon Hehairs',
  'Oscar onley',
  'Lukas nerurkar',
  'Jarno widar',
  'Jelte krijnsen',
  'Sam watson',
  'Albert withen Philipsen',
  'Jakob fuglsang',
  'Tim merlier',
  'Maxim van gils',
  'Lorenzo fortunato',
  'Mathieu Van Der Poel',
  'Mathew van der Poel',
  'Tom Pidcock',
  'Victor Campenearts',
  'Matteo Cattanneo',
  'Mikkel Honore',
  'Tobias Foss',
  'Riley Sheeran',
  'Soren Kragh Anderson',
  'Jorgen Nordhagen',
  'Byran Coquard',
  'Mathieu van der poel',
  'Jonathan milan',
  'Thomas pidcock',
  'Joao almeida',
  'Romain gregoire',
  'Isaac Del toro',
  'Kaden groves',
  'Jan christen',
  'Toon aerts',
  'Thibau nys',
  'Finn fisher-black',
  'Sam welsford',
  'Fred wright',
  'Warren barguil',
  'Kevin vauquelin',
  'Tobias halland johannessen',
  'Jon agirre',
  'Idar Anderson',
  'Mario aparicio',
  'Frank van den broek',
  'Mathieu Van der Poel',
  'Joao Almeida',
  'Romain Gregoire',
  'Nelson Powless',
  'Magnus Cort Nielson',
  'Victor Campanaerts',
  'Matteo Badilatt',
  'Sam Welsford',
  'Rui Oliviera',
  'Brandon Smith River',
  'Jefferson Alexander',
  'Søren Kragh Anderson',
  'Dylan Van Baarle',
  'Matthew brennan'
];

console.log('Fixing DDL file to comment out mismatched rider names...');

// Read the DDL file
const ddlPath = '/Users/hughw/vds/database/2025-men-data.sql';
let ddlContent = fs.readFileSync(ddlPath, 'utf8');

// Split into lines
const lines = ddlContent.split('\n');
const modifiedLines = [];
let commentsAdded = 0;

for (let line of lines) {
  // Check if this is a player_team_roster INSERT line
  if (line.trim().startsWith('INSERT OR IGNORE INTO player_team_roster')) {
    // Check if any mismatched name appears in this line
    let foundMismatch = false;
    for (const mismatchedName of mismatchedNames) {
      // Escape the name for regex (handle special characters)
      const escapedName = mismatchedName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      // Look for the name in quotes (exact match, case sensitive)
      const regex = new RegExp(`'${escapedName}'`);
      if (regex.test(line)) {
        foundMismatch = true;
        console.log(`Found mismatch: ${mismatchedName}`);
        break;
      }
    }
    
    if (foundMismatch) {
      // Comment out the line
      modifiedLines.push(`-- name mismatch -- ${line}`);
      commentsAdded++;
    } else {
      modifiedLines.push(line);
    }
  } else {
    modifiedLines.push(line);
  }
}

// Write the modified DDL back
const modifiedDdl = modifiedLines.join('\n');
fs.writeFileSync(ddlPath, modifiedDdl);

console.log(`\nDDL file modified successfully!`);
console.log(`- Total lines commented out: ${commentsAdded}`);
console.log(`- Modified file: ${ddlPath}`);
console.log(`\nThe DDL should now run without foreign key constraint errors.`);