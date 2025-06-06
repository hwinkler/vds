// Test CORS from different origins
async function testCors() {
  const workerUrl = 'http://localhost:8787'
  
  try {
    console.log('Testing CORS preflight...')
    
    // Test OPTIONS request (preflight)
    const optionsResponse = await fetch(`${workerUrl}/api/games`, {
      method: 'OPTIONS',
      headers: {
        'Origin': 'http://localhost:8000',
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'Content-Type'
      }
    })
    
    console.log('OPTIONS Response Status:', optionsResponse.status)
    console.log('CORS Headers:')
    for (const [key, value] of optionsResponse.headers.entries()) {
      if (key.includes('access-control')) {
        console.log(`  ${key}: ${value}`)
      }
    }
    
    // Test actual GET request
    console.log('\nTesting actual GET request...')
    const getResponse = await fetch(`${workerUrl}/api/games`, {
      headers: {
        'Origin': 'http://localhost:8000'
      }
    })
    
    console.log('GET Response Status:', getResponse.status)
    console.log('Response CORS Headers:')
    for (const [key, value] of getResponse.headers.entries()) {
      if (key.includes('access-control')) {
        console.log(`  ${key}: ${value}`)
      }
    }
    
    const data = await getResponse.json()
    console.log('Response Data:', data)
    
  } catch (error) {
    console.error('CORS Test Error:', error)
  }
}

testCors()