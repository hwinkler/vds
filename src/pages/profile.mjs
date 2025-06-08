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

import * as React from 'react'
import {useState, useEffect} from 'react'
import {Link, navigate} from 'gatsby'

import Layout from '../components/layout'
import Seo from '../components/seo'
import {api} from '../lib/api-config.mjs'

const {console, alert} = globalThis

const Profile = () => {
  const [user, setUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)
  const [displayName, setDisplayName] = useState('')
  const [saving, setSaving] = useState(false)

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const authUser = await api.get('/auth/me')
        setUser(authUser)
        setDisplayName(authUser.player_name) // Default to current player name
      } catch (error) {
        // Not authenticated, redirect to login
        if (typeof window !== 'undefined') {
          window.location.href = '/auth/reddit'
        }
        return
      } finally {
        setAuthLoading(false)
      }
    }

    checkAuth()
  }, [])

  const handleSave = async () => {
    if (!displayName.trim()) {
      alert('Display name cannot be empty')
      return
    }

    try {
      setSaving(true)
      // Mock API call for now
      console.log('Would update display name to:', displayName)
      alert('Display name updated successfully!')
    } catch (error) {
      console.error('Error updating display name:', error)
      alert('Error updating display name')
    } finally {
      setSaving(false)
    }
  }

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout')
      // Redirect to home page after logout
      if (typeof window !== 'undefined') {
        window.location.href = '/'
      }
    } catch (error) {
      console.error('Error logging out:', error)
      alert('Error logging out')
    }
  }

  if (authLoading) {
    return (
      <Layout>
        <div style={{padding: '20px', textAlign: 'center'}}>
          <h2>Loading...</h2>
        </div>
      </Layout>
    )
  }

  if (!user) {
    return (
      <Layout>
        <div style={{padding: '20px', textAlign: 'center'}}>
          <h2>Authentication Required</h2>
          <p>You need to be logged in to view your profile.</p>
          <a href="/auth/reddit" style={{
            padding: '10px 20px',
            backgroundColor: '#ff4500',
            color: 'white',
            textDecoration: 'none',
            borderRadius: '4px'
          }}>
            Login with Reddit
          </a>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div style={{padding: '20px'}}>
        <h1>Profile</h1>

        <nav style={{marginBottom: '20px', padding: '10px', backgroundColor: '#f5f5f5', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <div>
            <Link to="/" style={{marginRight: '20px'}}>Home</Link>
            <Link to="/team-builder" style={{marginRight: '20px'}}>Team Builder</Link>
            <Link to="/all-riders" style={{marginRight: '20px'}}>All Riders</Link>
            <Link to="/races" style={{marginRight: '20px'}}>Races</Link>
            <Link to="/team" style={{marginRight: '20px'}}>Teams</Link>
          </div>
          <Link to="/profile" style={{fontSize: '16px', fontWeight: 'bold', color: '#7026b9', textDecoration: 'none'}}>
            Welcome, {user.player_name}!
          </Link>
        </nav>

        <div style={{maxWidth: '500px', margin: '0 auto'}}>
          <div style={{
            padding: '20px',
            border: '1px solid #ddd',
            borderRadius: '8px',
            backgroundColor: '#f9f9f9'
          }}>
            <h2>Account Information</h2>
            
            <div style={{marginBottom: '20px'}}>
              <p><strong>Reddit Username:</strong> {user.reddit_username}</p>
              <p><strong>Account Created:</strong> {new Date(user.created_at || Date.now()).toLocaleDateString()}</p>
            </div>

            <div style={{marginBottom: '20px'}}>
              <label style={{display: 'block', marginBottom: '5px', fontWeight: 'bold'}}>
                Display Name:
              </label>
              <input
                type="text"
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  fontSize: '16px'
                }}
                placeholder="Enter your display name"
              />
              <small style={{color: '#666', display: 'block', marginTop: '5px'}}>
                This is how your name appears in team rankings and throughout the site.
              </small>
            </div>

            <div style={{display: 'flex', gap: '10px', justifyContent: 'space-between'}}>
              <button
                onClick={handleSave}
                disabled={saving}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#4caf50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '16px',
                  flex: 1
                }}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              
              <button
                onClick={handleLogout}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#f44336',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '16px'
                }}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export const Head = () => <Seo title="Profile" />

export default Profile