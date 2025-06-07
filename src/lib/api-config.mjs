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

// Simplified API Configuration - using relative URLs with proxy in development
const API_CONFIG = {
  timeout: typeof window !== 'undefined' && window.location.hostname === 'localhost' ? 10000 : 30000
}

// Get current API configuration
export function getApiConfig() {
  return API_CONFIG
}

// Build API URL - always relative for same-origin requests
export function getApiUrl(endpoint) {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`
  return cleanEndpoint // Always relative - proxy handles dev routing
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