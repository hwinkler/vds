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

// API Configuration for different environments
const API_CONFIG = {
  development: {
    baseUrl: 'http://localhost:8787',
    timeout: 10000
  },
  production: {
    baseUrl: '', // Empty for same-origin relative requests via Cloudflare Routes
    timeout: 30000
  }
}

// Detect environment
function getEnvironment() {
  // In browser, check if we're on localhost
  if (typeof window !== 'undefined') {
    return window.location.hostname === 'localhost' ? 'development' : 'production'
  }
  
  // In SSR/build, use NODE_ENV or default to production
  return process.env.NODE_ENV === 'development' ? 'development' : 'production'
}

// Get current API configuration
export function getApiConfig() {
  const env = getEnvironment()
  return API_CONFIG[env]
}

// Build full API URL
export function getApiUrl(endpoint) {
  const config = getApiConfig()
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
  return `${config.baseUrl}${cleanEndpoint}`
}

// Enhanced fetch with automatic config
export async function apiRequest(endpoint, options = {}) {
  const config = getApiConfig()
  const url = getApiUrl(endpoint)
  
  const defaultOptions = {
    timeout: config.timeout,
    credentials: 'include', // Include cookies with requests
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    }
  }
  
  const mergedOptions = {
    ...defaultOptions,
    ...options,
    headers: {
      ...defaultOptions.headers,
      ...options.headers
    }
  }
  
  console.log(`API Request: ${mergedOptions.method || 'GET'} ${url}`)
  
  try {
    const response = await fetch(url, mergedOptions)
    
    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`)
    }
    
    return await response.json()
  } catch (error) {
    console.error(`API Request failed for ${url}:`, error)
    throw error
  }
}

// Convenience methods
export const api = {
  get: (endpoint, options = {}) => apiRequest(endpoint, { ...options, method: 'GET' }),
  post: (endpoint, data, options = {}) => apiRequest(endpoint, { 
    ...options, 
    method: 'POST', 
    body: JSON.stringify(data) 
  }),
  put: (endpoint, data, options = {}) => apiRequest(endpoint, { 
    ...options, 
    method: 'PUT', 
    body: JSON.stringify(data) 
  }),
  delete: (endpoint, options = {}) => apiRequest(endpoint, { ...options, method: 'DELETE' })
}