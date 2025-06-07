/*
 * Copyright (C) 2025 Hugh Winkler
 * 
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as published
 * by the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 * 
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

// Simple router to handle different API endpoints
class Router {
  constructor() {
    this.routes = new Map()
  }

  get(path, handler) {
    this.routes.set(`GET:${path}`, handler)
  }

  post(path, handler) {
    this.routes.set(`POST:${path}`, handler)
  }

  async handle(request, env) {
    const url = new URL(request.url)
    const pathname = url.pathname
    const method = request.method

    console.log(`Router: ${method} ${pathname}`)

    // Find matching route (support path parameters)
    for (const [routeKey, handler] of this.routes.entries()) {
      const [routeMethod, ...routePathParts] = routeKey.split(':')
      const routePath = routePathParts.join(':')
      
      if (routeMethod !== method) continue

      const match = this.matchPath(routePath, pathname)
      
      if (match) {
        console.log(`Matched API route: ${routeMethod} ${routePath}`)
        return await handler(request, env, match.params, url.searchParams)
      }
    }

    console.log(`No API route matched for ${method} ${pathname}`)
    return null // No match, caller should handle static assets
  }

  matchPath(routePath, requestPath) {
    const routeParts = routePath.split('/')
    const requestParts = requestPath.split('/')
    
    if (routeParts.length !== requestParts.length) {
      return null
    }

    const params = {}
    for (let i = 0; i < routeParts.length; i++) {
      const routePart = routeParts[i]
      const requestPart = requestParts[i]
      
      if (routePart.startsWith(':')) {
        // Parameter
        params[routePart.slice(1)] = requestPart
      } else if (routePart !== requestPart) {
        // Exact match required
        return null
      }
    }

    return { params }
  }
}

// Create router instance
const router = new Router()

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-player-id',
  'Access-Control-Max-Age': '86400', // 24 hours
  'Access-Control-Allow-Credentials': 'false'
}

// Auth middleware helper
function requireAuth(request) {
  const sessionData = getSessionFromRequest(request)
  
  if (!sessionData) {
    throw new Error('Authentication required - no session')
  }

  try {
    const session = JSON.parse(decodeURIComponent(sessionData))
    
    // Check if session is valid (not expired)
    const maxAge = 30 * 24 * 60 * 60 * 1000 // 30 days in ms
    if (Date.now() - session.created_at > maxAge) {
      throw new Error('Authentication required - session expired')
    }
    
    if (!session.player_id || !session.authenticated) {
      throw new Error('Authentication required - invalid session')
    }
    
    return session.player_id // Return player_id for database operations
  } catch (error) {
    throw new Error('Authentication required - invalid session data')
  }
}

// Helper function to handle errors
function handleError(error) {
  console.error('API Error:', error)
  return Response.json({ error: error.message }, { 
    status: error.name === 'AuthError' ? 401 : 500,
    headers: corsHeaders 
  })
}

// Health check endpoint
router.get('/health', async () => {
  return Response.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'VDS Full-Stack Worker'
  }, { headers: corsHeaders })
})

// Get base URL based on environment
function getBaseUrl(request) {
  const url = new URL(request.url)
  
  // In development (localhost), use port 8000 (Gatsby dev server)
  if (url.hostname === 'localhost') {
    return 'http://localhost:8000'
  }
  
  // In production, use the actual origin
  return url.origin
}

// Get Reddit credentials based on environment
function getRedditCredentials(request, env) {
  const url = new URL(request.url)
  
  if (url.hostname === 'localhost') {
    // Development
    return {
      clientId: env.REDDIT_CLIENT_ID_DEV || env.REDDIT_CLIENT_ID,
      clientSecret: env.REDDIT_CLIENT_SECRET_DEV || env.REDDIT_CLIENT_SECRET
    }
  } else if (url.hostname === 'vds2.hughw.workers.dev') {
    // Staging
    return {
      clientId: env.REDDIT_CLIENT_ID_STAGING,
      clientSecret: env.REDDIT_CLIENT_SECRET_STAGING
    }
  } else {
    // Production (vds2.app)
    return {
      clientId: env.REDDIT_CLIENT_ID_PROD,
      clientSecret: env.REDDIT_CLIENT_SECRET_PROD
    }
  }
}

// Session management helpers
function getSessionFromRequest(request) {
  const cookies = request.headers.get('Cookie') || ''
  const sessionMatch = cookies.match(/reddit_session=([^;]+)/)
  return sessionMatch ? sessionMatch[1] : null
}

function setSessionCookie(response, sessionData) {
  const sessionValue = encodeURIComponent(JSON.stringify(sessionData))
  const cookieOptions = [
    `reddit_session=${sessionValue}`,
    'HttpOnly',
    'SameSite=Lax', 
    'Path=/',
    'Max-Age=2592000' // 30 days
  ]
  
  // Only add Secure in production
  if (typeof process !== 'undefined' && process.env.NODE_ENV === 'production') {
    cookieOptions.push('Secure')
  }
  
  response.headers.set('Set-Cookie', cookieOptions.join('; '))
  return response
}

// Reddit OAuth routes
router.get('/auth/reddit', async (request, env) => {
  const baseUrl = getBaseUrl(request)
  const credentials = getRedditCredentials(request, env)
  const state = crypto.randomUUID()
  const scope = 'identity'
  
  console.log('🚀 Starting Reddit OAuth flow...')
  console.log('📍 Base URL:', baseUrl)
  console.log('🔑 Client ID:', credentials.clientId)
  console.log('🎯 Redirect URI:', `${baseUrl}/auth/callback/reddit`)
  
  const authUrl = new URL('https://www.reddit.com/api/v1/authorize')
  authUrl.searchParams.set('client_id', credentials.clientId)
  authUrl.searchParams.set('response_type', 'code')
  authUrl.searchParams.set('state', state)
  authUrl.searchParams.set('redirect_uri', `${baseUrl}/auth/callback/reddit`)
  authUrl.searchParams.set('duration', 'temporary')
  authUrl.searchParams.set('scope', scope)

  console.log('↗️ Redirecting to Reddit OAuth:', authUrl.toString())
  
  return Response.redirect(authUrl.toString(), 302)
})

router.get('/auth/callback/reddit', async (request, env) => {
  const baseUrl = getBaseUrl(request)
  const credentials = getRedditCredentials(request, env)
  
  try {
    const url = new URL(request.url)
    const code = url.searchParams.get('code')
    const state = url.searchParams.get('state')
    
    console.log('🔄 Reddit OAuth callback received', { 
      hasCode: !!code, 
      state: state?.substring(0, 8) + '...', 
      baseUrl 
    })
    
    if (!code) {
      throw new Error('No authorization code received')
    }

    console.log('🔗 Exchanging code for access token...')
    
    console.log('🔑 Client ID:', credentials.clientId)
    console.log('🔑 Client Secret:', credentials.clientSecret?.substring(0, 8) + '... (length: ' + credentials.clientSecret?.length + ')')
    
    const requestBody = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: `${baseUrl}/auth/callback/reddit`
    })
    
    console.log('📤 Request body:', requestBody.toString())
    console.log('🎯 Redirect URI in request:', `${baseUrl}/auth/callback/reddit`)
    
    // Exchange code for access token
    const tokenResponse = await fetch('https://www.reddit.com/api/v1/access_token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${btoa(`${credentials.clientId}:${credentials.clientSecret}`)}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': 'VDS:v1.0 (by /u/yourusername)'
      },
      body: requestBody
    })

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text()
      console.error('❌ Token exchange failed:', tokenResponse.status, errorText)
      throw new Error('Failed to exchange code for token')
    }

    const tokenData = await tokenResponse.json()
    console.log('✅ Access token received, fetching user info...')
    
    // Get user info from Reddit
    const userResponse = await fetch('https://oauth.reddit.com/api/v1/me', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'User-Agent': 'VDS:v1.0 (by /u/yourusername)'
      }
    })

    if (!userResponse.ok) {
      const errorText = await userResponse.text()
      console.error('❌ User info fetch failed:', userResponse.status, errorText)
      throw new Error('Failed to get user info')
    }

    const userData = await userResponse.json()
    console.log('👤 Reddit user info received:', { 
      id: userData.id, 
      name: userData.name,
      verified: userData.verified 
    })
    
    console.log('🔍 Looking up player in database...')
    
    // Check if player exists, create if not
    let player = await env.DB.prepare(
      'SELECT * FROM player WHERE oauth_provider = ? AND oauth_id = ?'
    ).bind('reddit', userData.id).first() // Using userData.id (Reddit user ID) as oauth_id
    
    if (!player) {
      // Create new player
      console.log(`✨ Creating new player for Reddit user: ${userData.name} (ID: ${userData.id})`)
      const result = await env.DB.prepare(
        'INSERT INTO player (player_name, oauth_provider, oauth_id) VALUES (?, ?, ?)'
      ).bind(userData.name, 'reddit', userData.id).run()
      
      console.log(`📝 Player created with ID: ${result.meta.last_row_id}`)
      
      // Get the newly created player
      player = await env.DB.prepare(
        'SELECT * FROM player WHERE player_id = ?'
      ).bind(result.meta.last_row_id).first()
    } else {
      console.log(`🔄 Existing player found: ${player.player_name} (Player ID: ${player.player_id})`)
    }

    // Create session data with player info
    const sessionData = {
      player_id: player.player_id,
      reddit_id: userData.id,
      reddit_username: userData.name,
      player_name: player.player_name,
      authenticated: true,
      created_at: Date.now()
    }

    console.log('🍪 Setting session cookie and redirecting to team builder...')
    console.log('📊 Session data:', { 
      player_id: sessionData.player_id, 
      player_name: sessionData.player_name,
      reddit_username: sessionData.reddit_username 
    })

    // Create redirect response with session cookie
    const sessionValue = encodeURIComponent(JSON.stringify(sessionData))
    const cookieOptions = [
      `reddit_session=${sessionValue}`,
      'HttpOnly',
      'SameSite=Lax', 
      'Path=/',
      'Max-Age=2592000' // 30 days
    ]
    
    // Only add Secure in production
    if (typeof process !== 'undefined' && process.env.NODE_ENV === 'production') {
      cookieOptions.push('Secure')
    }
    
    // Create response with headers that can be modified
    const response = new Response(null, {
      status: 302,
      headers: {
        'Location': `${baseUrl}/team-builder`,
        'Set-Cookie': cookieOptions.join('; ')
      }
    })
    
    return response
  } catch (error) {
    console.error('Reddit OAuth error:', error)
    return Response.redirect(`${baseUrl}/?error=auth_failed`, 302)
  }
})

// Check authentication status
router.get('/auth/me', async (request, env) => {
  try {
    console.log('🔍 Checking authentication status...')
    const sessionData = getSessionFromRequest(request)
    
    if (!sessionData) {
      console.log('❌ No session found')
      return Response.json({ error: 'Not authenticated' }, { 
        status: 401, 
        headers: corsHeaders 
      })
    }

    const session = JSON.parse(decodeURIComponent(sessionData))
    console.log('🍪 Session found for player:', session.player_name)
    
    // Check if session is valid (not expired)
    const maxAge = 30 * 24 * 60 * 60 * 1000 // 30 days in ms
    const sessionAge = Date.now() - session.created_at
    
    if (sessionAge > maxAge) {
      console.log('⏰ Session expired:', { ageInDays: sessionAge / (24 * 60 * 60 * 1000) })
      return Response.json({ error: 'Session expired' }, { 
        status: 401, 
        headers: corsHeaders 
      })
    }
    
    console.log('✅ Valid session found:', { 
      player_id: session.player_id, 
      player_name: session.player_name 
    })
    
    return Response.json({
      player_id: session.player_id,
      player_name: session.player_name,
      reddit_id: session.reddit_id,
      reddit_username: session.reddit_username,
      oauth_provider: 'reddit',
      authenticated: true
    }, { headers: corsHeaders })
    
  } catch (error) {
    console.error('❌ Auth check error:', error)
    return Response.json({ error: 'Invalid session' }, { 
      status: 401, 
      headers: corsHeaders 
    })
  }
})

// Logout route
router.post('/auth/logout', async (request, env) => {
  let response = Response.json({ success: true }, { headers: corsHeaders })
  
  // Clear the session cookie
  response.headers.set('Set-Cookie', 'reddit_session=; HttpOnly; SameSite=Lax; Path=/; Max-Age=0')
  
  return response
})

// Get all games
router.get('/api/games', async (request, env) => {
  try {
    const { results } = await env.DB.prepare('SELECT * FROM game ORDER BY year DESC, sex').all()
    return Response.json(results, { headers: corsHeaders })
  } catch (error) {
    return handleError(error)
  }
})

// Get riders for a specific year and sex
router.get('/api/riders/:year/:sex', async (request, env, params, searchParams) => {
  try {
    const { year, sex } = params

    console.log(`Fetching riders for year: ${year}, sex: ${sex}`)
    
    let sql = `SELECT r.*, p.acronym as team_acronym FROM rider r 
               JOIN pro_team p ON r.pro_team_name = p.pro_team_name 
               AND r.year = p.year AND r.sex = p.sex 
               WHERE r.year = ? AND r.sex = ?`
    const queryParams = [parseInt(year), sex]

    // Apply filters
    if (searchParams.get('nationality')) {
      sql += ' AND r.nationality = ?'
      queryParams.push(searchParams.get('nationality'))
    }

    if (searchParams.get('team')) {
      sql += ' AND r.pro_team_name = ?'
      queryParams.push(searchParams.get('team'))
    }

    if (searchParams.get('maxPrice')) {
      sql += ' AND r.price <= ?'
      queryParams.push(parseInt(searchParams.get('maxPrice')))
    }

    if (searchParams.get('minPrice')) {
      sql += ' AND r.price >= ?'
      queryParams.push(parseInt(searchParams.get('minPrice')))
    }

    sql += ' ORDER BY r.rider_name'

    const { results } = await env.DB.prepare(sql).bind(...queryParams).all()
    return Response.json(results, { headers: corsHeaders })
  } catch (error) {
    return handleError(error)
  }
})

// Get rider scores
router.get('/api/riders/:year/:sex/scores', async (request, env, params) => {
  try {
    const { year, sex } = params
    
    const sql = `SELECT 
                   r.rider_name,
                   r.pro_team_name,
                   r.nationality,
                   SUM(COALESCE(f.points_awarded, 0) + COALESCE(j.points_awarded, 0)) as total_score
                 FROM rider r
                 LEFT JOIN finisher f ON r.rider_name = f.rider_name 
                                       AND r.sex = f.sex AND r.year = f.year
                 LEFT JOIN jersey_holder j ON r.rider_name = j.rider_name 
                                           AND r.sex = j.sex AND r.year = j.year
                 WHERE r.year = ? AND r.sex = ?
                 GROUP BY r.rider_name, r.pro_team_name, r.nationality
                 ORDER BY total_score DESC`

    const { results } = await env.DB.prepare(sql).bind(parseInt(year), sex).all()
    return Response.json(results, { headers: corsHeaders })
  } catch (error) {
    return handleError(error)
  }
})

// Get team rankings
router.get('/api/teams/:year/:sex/rankings', async (request, env, params) => {
  try {
    const { year, sex } = params
    console.log(`Fetching team rankings for year: ${year}, sex: ${sex}`)
    
    const sql = `SELECT 
                   pt.team_id,
                   pt.team_name,
                   p.player_name,
                   SUM(COALESCE(f.points_awarded, 0) + COALESCE(j.points_awarded, 0)) as total_score
                 FROM player_team pt
                 JOIN player p ON pt.player_id = p.player_id
                 LEFT JOIN player_team_roster ptr ON pt.team_id = ptr.team_id
                 LEFT JOIN finisher f ON ptr.rider_name = f.rider_name 
                                       AND ptr.sex = f.sex AND ptr.year = f.year
                 LEFT JOIN jersey_holder j ON ptr.rider_name = j.rider_name 
                                           AND ptr.sex = j.sex AND ptr.year = j.year
                 WHERE pt.year = ? AND pt.sex = ? AND pt.is_valid = 1
                 GROUP BY pt.team_id, pt.team_name, p.player_name
                 ORDER BY total_score DESC`

    const { results } = await env.DB.prepare(sql).bind(parseInt(year), sex).all()
    return Response.json(results, { headers: corsHeaders })
  } catch (error) {
    return handleError(error)
  }
})

// Get player's team
router.get('/api/team/:year/:sex', async (request, env, params) => {
  try {
    const playerId = requireAuth(request)
    const { year, sex } = params

    // Get player team
    const teamQuery = await env.DB.prepare(
      'SELECT * FROM player_team WHERE player_id = ? AND sex = ? AND year = ?'
    ).bind(playerId, sex, parseInt(year)).first()

    if (!teamQuery) {
      return Response.json(null, { headers: corsHeaders })
    }

    // Get team roster
    const rosterSql = `SELECT ptr.*, r.price, r.pro_team_name, r.nationality, 
                              p.acronym as team_acronym
                       FROM player_team_roster ptr 
                       JOIN rider r ON ptr.rider_name = r.rider_name 
                                    AND ptr.sex = r.sex AND ptr.year = r.year
                       JOIN pro_team p ON r.pro_team_name = p.pro_team_name 
                                       AND r.year = p.year AND r.sex = p.sex
                       WHERE ptr.team_id = ?
                       ORDER BY r.price DESC, r.rider_name`

    const { results: roster } = await env.DB.prepare(rosterSql).bind(teamQuery.team_id).all()

    return Response.json({ ...teamQuery, roster }, { headers: corsHeaders })
  } catch (error) {
    return handleError(error)
  }
})

// Create or update player's team
router.post('/api/team/:year/:sex', async (request, env, params) => {
  try {
    const playerId = requireAuth(request)
    const { year, sex } = params
    const { team_name, riders } = await request.json()

    // Create or update team
    const teamResult = await env.DB.prepare(
      'INSERT OR REPLACE INTO player_team (player_id, sex, year, team_name) VALUES (?, ?, ?, ?)'
    ).bind(playerId, sex, parseInt(year), team_name).run()

    // Get team ID
    let teamId = teamResult.meta.last_row_id
    if (!teamId) {
      const teamQuery = await env.DB.prepare(
        'SELECT team_id FROM player_team WHERE player_id = ? AND sex = ? AND year = ?'
      ).bind(playerId, sex, parseInt(year)).first()
      teamId = teamQuery.team_id
    }

    // Update roster - first delete existing
    await env.DB.prepare('DELETE FROM player_team_roster WHERE team_id = ?').bind(teamId).run()

    // Add new riders
    for (const riderName of riders) {
      await env.DB.prepare(
        'INSERT INTO player_team_roster (team_id, rider_name, sex, year) VALUES (?, ?, ?, ?)'
      ).bind(teamId, riderName, sex, parseInt(year)).run()
    }

    // Validate team and update validity
    const isValid = await validateTeam(env.DB, teamId, sex)
    await env.DB.prepare(
      'UPDATE player_team SET is_valid = ?, updated_at = CURRENT_TIMESTAMP WHERE team_id = ?'
    ).bind(isValid, teamId).run()

    // Get updated team and roster
    const team = await env.DB.prepare(
      'SELECT * FROM player_team WHERE team_id = ?'
    ).bind(teamId).first()

    const rosterSql = `SELECT ptr.*, r.price, r.pro_team_name, r.nationality, 
                              p.acronym as team_acronym
                       FROM player_team_roster ptr 
                       JOIN rider r ON ptr.rider_name = r.rider_name 
                                    AND ptr.sex = r.sex AND ptr.year = r.year
                       JOIN pro_team p ON r.pro_team_name = p.pro_team_name 
                                       AND r.year = p.year AND r.sex = p.sex
                       WHERE ptr.team_id = ?
                       ORDER BY r.price DESC, r.rider_name`

    const { results: roster } = await env.DB.prepare(rosterSql).bind(teamId).all()

    return Response.json({ ...team, roster, is_valid: isValid }, { headers: corsHeaders })
  } catch (error) {
    return handleError(error)
  }
})

// Get races
router.get('/api/races/:year/:sex', async (request, env, params) => {
  try {
    const { year, sex } = params
    
    const sql = `SELECT r.*, c.category
                 FROM race r
                 JOIN category c ON r.category = c.category
                 WHERE r.year = ? AND r.sex = ?
                 ORDER BY r.start_date, r.race_name`

    const { results } = await env.DB.prepare(sql).bind(parseInt(year), sex).all()
    return Response.json(results, { headers: corsHeaders })
  } catch (error) {
    return handleError(error)
  }
})

// Get race results
router.get('/api/races/:raceId/results', async (request, env, params) => {
  try {
    const { raceId } = params
    
    const resultsSql = `SELECT s.stage_number, s.stage_date, f.rider_name, f.finish_position, f.points_awarded
                        FROM stage s
                        LEFT JOIN finisher f ON s.stage_id = f.stage_id
                        WHERE s.race_id = ?
                        ORDER BY s.stage_number, f.finish_position`

    const jerseySql = `SELECT s.stage_number, s.stage_date, j.rider_name, j.jersey_type, j.is_final, j.points_awarded
                       FROM stage s
                       LEFT JOIN jersey_holder j ON s.stage_id = j.stage_id
                       WHERE s.race_id = ?
                       ORDER BY s.stage_number, j.jersey_type, j.is_final`

    const [resultsData, jerseyData] = await Promise.all([
      env.DB.prepare(resultsSql).bind(parseInt(raceId)).all(),
      env.DB.prepare(jerseySql).bind(parseInt(raceId)).all()
    ])

    return Response.json({
      results: resultsData.results,
      jerseys: jerseyData.results
    }, { headers: corsHeaders })
  } catch (error) {
    return handleError(error)
  }
})

// Team validation endpoint
router.post('/api/team/:year/:sex/validate', async (request, env, params) => {
  try {
    const { year, sex } = params
    const { riders } = await request.json()

    if (riders.length === 0) {
      return Response.json({
        isValid: false,
        errors: ['No riders selected'],
        warnings: []
      }, { headers: corsHeaders })
    }

    // Get rider data
    const placeholders = riders.map(() => '?').join(',')
    const sql = `SELECT r.*, p.acronym as team_acronym FROM rider r 
                 JOIN pro_team p ON r.pro_team_name = p.pro_team_name 
                 AND r.year = p.year AND r.sex = p.sex 
                 WHERE r.year = ? AND r.sex = ? 
                 AND r.rider_name IN (${placeholders})`

    const { results: riderData } = await env.DB.prepare(sql).bind(parseInt(year), sex, ...riders).all()

    const validation = {
      isValid: true,
      errors: [],
      warnings: []
    }

    if (sex === 'm') {
      // Men's validation
      if (riders.length !== 25) {
        validation.isValid = false
        validation.errors.push(`Must have exactly 25 riders (currently ${riders.length})`)
      }

      const totalBudget = riderData.reduce((sum, rider) => sum + rider.price, 0)
      if (totalBudget > 150) {
        validation.isValid = false
        validation.errors.push(`Budget exceeded: ${totalBudget}/150 points`)
      }

      const highValueRiders = riderData.filter(rider => rider.price >= 18)
      if (highValueRiders.length > 3) {
        validation.isValid = false
        validation.errors.push(`Too many riders ≥18 points: ${highValueRiders.length}/3 max`)
      }

      const veryHighValueRiders = riderData.filter(rider => rider.price >= 24)
      if (veryHighValueRiders.length > 1) {
        validation.isValid = false
        validation.errors.push(`Too many riders ≥24 points: ${veryHighValueRiders.length}/1 max`)
      }
    } else if (sex === 'f') {
      // Women's validation
      if (riders.length !== 15) {
        validation.isValid = false
        validation.errors.push(`Must have exactly 15 riders (currently ${riders.length})`)
      }

      const totalBudget = riderData.reduce((sum, rider) => sum + rider.price, 0)
      if (totalBudget > 150) {
        validation.isValid = false
        validation.errors.push(`Budget exceeded: ${totalBudget}/150 points`)
      }

      const highValueRiders = riderData.filter(rider => rider.price >= 20)
      const highValueBudget = highValueRiders.reduce((sum, rider) => sum + rider.price, 0)
      if (highValueBudget > 100) {
        validation.isValid = false
        validation.errors.push(
          `High-value budget exceeded: ${highValueBudget}/100 points for riders ≥20 points`
        )
      }
    }

    return Response.json(validation, { headers: corsHeaders })
  } catch (error) {
    return handleError(error)
  }
})

// Helper function for team validation
async function validateTeam(db, teamId, sex) {
  const rosterSql = `SELECT ptr.*, r.price, r.pro_team_name, r.nationality, 
                            p.acronym as team_acronym
                     FROM player_team_roster ptr 
                     JOIN rider r ON ptr.rider_name = r.rider_name 
                                  AND ptr.sex = r.sex AND ptr.year = r.year
                     JOIN pro_team p ON r.pro_team_name = p.pro_team_name 
                                     AND r.year = p.year AND r.sex = p.sex
                     WHERE ptr.team_id = ?
                     ORDER BY r.price DESC, r.rider_name`

  const { results: roster } = await db.prepare(rosterSql).bind(teamId).all()

  if (sex === 'm') {
    // Men's rules
    if (roster.length !== 25) return false

    const totalBudget = roster.reduce((sum, rider) => sum + rider.price, 0)
    if (totalBudget > 150) return false

    const highValueRiders = roster.filter(rider => rider.price >= 18)
    if (highValueRiders.length > 3) return false

    const veryHighValueRiders = roster.filter(rider => rider.price >= 24)
    if (veryHighValueRiders.length > 1) return false
  } else if (sex === 'f') {
    // Women's rules
    if (roster.length !== 15) return false

    const totalBudget = roster.reduce((sum, rider) => sum + rider.price, 0)
    if (totalBudget > 150) return false

    const highValueRiders = roster.filter(rider => rider.price >= 20)
    const highValueBudget = highValueRiders.reduce((sum, rider) => sum + rider.price, 0)
    if (highValueBudget > 100) return false
  }

  return true
}

// Main worker entry point
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url)
    
    // Handle CORS preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders })
    }

    try {
      // Try API and auth routes first
      if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/auth/') || url.pathname === '/health') {
        const apiResponse = await router.handle(request, env)
        if (apiResponse) {
          return apiResponse
        }
      }

      // Fall back to static assets (Gatsby app)
      console.log(`Serving static asset: ${url.pathname}`)
      return env.ASSETS.fetch(request)
      
    } catch (error) {
      console.error('Worker error:', error)
      return handleError(error)
    }
  }
}