/*
 * Simple test script to verify Worker endpoints
 * Run: node test-endpoints.js
 */

const BASE_URL = 'http://localhost:8787'

async function testEndpoint(path, description) {
  try {
    const response = await fetch(`${BASE_URL}${path}`)
    const data = await response.json()
    console.log(`✅ ${description}:`, data)
  } catch (error) {
    console.log(`❌ ${description}:`, error.message)
  }
}

async function runTests() {
  console.log('Testing VDS Worker API endpoints...\n')
  
  await testEndpoint('/health', 'Health Check')
  await testEndpoint('/api/teams', 'Teams Endpoint')
  await testEndpoint('/api/races', 'Races Endpoint')
  
  console.log('\n🎉 Test complete!')
}

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runTests()
}