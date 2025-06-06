// Test the migrated /api/games endpoint
fetch('http://localhost:8787/api/games')
  .then(response => response.json())
  .then(data => {
    console.log('✅ Games endpoint response:', JSON.stringify(data, null, 2))
  })
  .catch(error => {
    console.log('❌ Error:', error.message)
  })