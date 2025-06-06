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
    const key = `${request.method}:${url.pathname}`
    const handler = this.routes.get(key)

    if (handler) {
      return await handler(request, env)
    }

    return new Response('Not Found', { status: 404 })
  }
}

// Create router instance
const router = new Router()

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
}

// Health check endpoint
router.get('/health', async () => {
  return Response.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'VDS API Worker'
  }, { headers: corsHeaders })
})

// Games endpoint - migrated from Express API
router.get('/api/games', async (request, env) => {
  try {
    const { results } = await env.DB.prepare('SELECT * FROM game ORDER BY year DESC, sex').all()
    return Response.json(results, { headers: corsHeaders })
  } catch (error) {
    console.error('Database error:', error)
    return Response.json({ error: error.message }, { 
      status: 500, 
      headers: corsHeaders 
    })
  }
})

// Teams endpoint (placeholder - will replace with real logic)
router.get('/api/teams', async () => {
  // TODO: Replace with actual database query
  const teams = [
    { id: 1, name: 'Sample Team 1', rider_count: 8 },
    { id: 2, name: 'Sample Team 2', rider_count: 6 }
  ]
  
  return Response.json({ teams }, { headers: corsHeaders })
})

// Races endpoint (placeholder)
router.get('/api/races', async () => {
  // TODO: Replace with actual database query
  const races = [
    { id: 1, name: 'Tour de France 2025', status: 'upcoming' },
    { id: 2, name: 'Giro d\'Italia 2025', status: 'planning' }
  ]
  
  return Response.json({ races }, { headers: corsHeaders })
})

// Main worker entry point
export default {
  async fetch(request, env, ctx) {
    // Handle CORS preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders })
    }

    try {
      return await router.handle(request, env)
    } catch (error) {
      console.error('Worker error:', error)
      return new Response('Internal Server Error', { 
        status: 500,
        headers: corsHeaders 
      })
    }
  }
}