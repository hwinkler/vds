// Simple test to debug the routing issue

const testUrl = 'http://localhost:8787/api/riders/2024/m'

async function testRouting() {
  try {
    console.log(`Testing: ${testUrl}`)
    
    const response = await fetch(testUrl)
    console.log(`Status: ${response.status}`)
    console.log(`Headers:`, Object.fromEntries(response.headers.entries()))
    
    const text = await response.text()
    console.log(`Response: ${text}`)
    
  } catch (error) {
    console.error('Error:', error.message)
  }
}

testRouting()