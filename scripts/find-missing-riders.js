#!/usr/bin/env node

const XLSX = require('xlsx');

// Helper function to clean rider names for matching
function cleanRiderName(name) {
  if (!name) return '';
  return name.trim().replace(/\s+/g, ' ');
}

console.log('Analyzing rider name mismatches...');

// Read Excel files
const ridersFile = '/Users/hughw/vds/database/xls/2025/FSA_DS_Men2025 FINAL.xlsx';
const teamsFile = '/Users/hughw/vds/database/xls/2025/VDS Teams and Riders.xlsx';

const ridersWorkbook = XLSX.readFile(ridersFile);
const teamsWorkbook = XLSX.readFile(teamsFile);

// Process riders data
console.log('Processing riders...');
const ridersSheet = ridersWorkbook.Sheets['FSA_DS_Men2025 v1'];
const ridersData = XLSX.utils.sheet_to_json(ridersSheet);

// Get all rider names (both active and inactive)
const allRiderNames = new Set();
const activeRiderNames = new Set();

ridersData.forEach(rider => {
  if (rider['Short Display Name']) {
    const cleanName = cleanRiderName(rider['Short Display Name']);
    allRiderNames.add(cleanName);
    
    // Track active riders (have price and team)
    if (rider['Price 2025'] && rider['Team 2025']) {
      activeRiderNames.add(cleanName);
    }
  }
});

console.log(`Total riders in master list: ${allRiderNames.size}`);
console.log(`Active riders (with price/team): ${activeRiderNames.size}`);

// Process teams data
console.log('Processing teams...');
const teamsSheet = teamsWorkbook.Sheets['Teams and Riders'];
const teamsData = XLSX.utils.sheet_to_json(teamsSheet);

// Get all rider names from team rosters
const teamRiderNames = new Set();
const teamRiderCounts = new Map();

teamsData.forEach(team => {
  if (team['Username'] && team['Team Name']) {
    for (let i = 1; i <= 25; i++) {
      const riderKey = `Rider ${i}`;
      const riderName = team[riderKey];
      
      if (riderName) {
        const cleanName = cleanRiderName(riderName);
        teamRiderNames.add(cleanName);
        
        // Count how many teams have this rider
        teamRiderCounts.set(cleanName, (teamRiderCounts.get(cleanName) || 0) + 1);
      }
    }
  }
});

console.log(`Unique riders selected in teams: ${teamRiderNames.size}`);

// Find mismatches
const missingFromMaster = [];
const missingFromActive = [];
const exactMatches = [];

teamRiderNames.forEach(teamRider => {
  if (!allRiderNames.has(teamRider)) {
    missingFromMaster.push({
      name: teamRider,
      teamCount: teamRiderCounts.get(teamRider)
    });
  } else if (!activeRiderNames.has(teamRider)) {
    missingFromActive.push({
      name: teamRider,
      teamCount: teamRiderCounts.get(teamRider)
    });
  } else {
    exactMatches.push({
      name: teamRider,
      teamCount: teamRiderCounts.get(teamRider)
    });
  }
});

// Sort by team count (most popular first)
missingFromMaster.sort((a, b) => b.teamCount - a.teamCount);
missingFromActive.sort((a, b) => b.teamCount - a.teamCount);

// Generate report
console.log('\n' + '='.repeat(80));
console.log('RIDER NAME MISMATCH ANALYSIS');
console.log('='.repeat(80));

console.log(`\n📊 SUMMARY:`);
console.log(`- Exact matches (in active rider list): ${exactMatches.length}`);
console.log(`- Missing from master list entirely: ${missingFromMaster.length}`);
console.log(`- In master list but not active (no price/team): ${missingFromActive.length}`);
console.log(`- Total unique riders in team rosters: ${teamRiderNames.size}`);

if (missingFromMaster.length > 0) {
  console.log(`\n❌ RIDERS MISSING FROM MASTER LIST (${missingFromMaster.length}):`);
  console.log('These riders are selected in teams but don\'t exist in the rider database at all:');
  console.log('Name'.padEnd(40) + 'Teams');
  console.log('-'.repeat(50));
  missingFromMaster.forEach(rider => {
    console.log(rider.name.padEnd(40) + rider.teamCount);
  });
}

if (missingFromActive.length > 0) {
  console.log(`\n⚠️  RIDERS NOT ACTIVE IN 2025 (${missingFromActive.length}):`);
  console.log('These riders exist in master list but have no price/team for 2025:');
  console.log('Name'.padEnd(40) + 'Teams');
  console.log('-'.repeat(50));
  missingFromActive.slice(0, 20).forEach(rider => { // Show first 20
    console.log(rider.name.padEnd(40) + rider.teamCount);
  });
  if (missingFromActive.length > 20) {
    console.log(`... and ${missingFromActive.length - 20} more`);
  }
}

// Try fuzzy matching for missing riders
console.log(`\n🔍 FUZZY MATCHING SUGGESTIONS:`);
if (missingFromMaster.length > 0) {
  console.log('For riders missing from master list, here are potential matches:');
  
  missingFromMaster.slice(0, 10).forEach(missingRider => {
    // Find similar names in the master list
    const candidates = [];
    allRiderNames.forEach(masterRider => {
      const similarity = calculateSimilarity(missingRider.name.toLowerCase(), masterRider.toLowerCase());
      if (similarity > 0.6) { // 60% similarity threshold
        candidates.push({ name: masterRider, similarity });
      }
    });
    
    candidates.sort((a, b) => b.similarity - a.similarity);
    
    if (candidates.length > 0) {
      console.log(`\n"${missingRider.name}" (${missingRider.teamCount} teams) might be:`);
      candidates.slice(0, 3).forEach(candidate => {
        console.log(`  - "${candidate.name}" (${(candidate.similarity * 100).toFixed(1)}% match)`);
      });
    }
  });
}

// Helper function for string similarity (Levenshtein distance based)
function calculateSimilarity(str1, str2) {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) return 1.0;
  
  const distance = levenshteinDistance(longer, shorter);
  return (longer.length - distance) / longer.length;
}

function levenshteinDistance(str1, str2) {
  const matrix = [];
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[str2.length][str1.length];
}

console.log(`\n💡 RECOMMENDATION:`);
console.log(`Total foreign key failures expected: ${missingFromMaster.length + missingFromActive.length}`);
console.log(`\nTo fix this, you can either:`);
console.log(`1. Use "INSERT OR IGNORE" and accept missing riders will be skipped`);
console.log(`2. Disable foreign key constraints during bulk load`);
console.log(`3. Update team rosters to use correct rider names`);
console.log(`4. Add missing riders to the master rider list`);