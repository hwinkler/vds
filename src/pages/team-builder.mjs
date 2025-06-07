
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

const {fetch, console, URLSearchParams, alert, confirm, window} = globalThis
const TeamBuilder = () => {
  const [riders, setRiders] = useState([])
  const [selectedRiders, setSelectedRiders] = useState([])
  const [loading, setLoading] = useState(true)
  const [year, setYear] = useState(2024)
  const [sex, setSex] = useState('m')
  const [teamName, setTeamName] = useState('')
  const [filters, setFilters] = useState({
    nationality: '',
    team: '',
    maxPrice: '',
    minPrice: ''
  })
  const [sortBy, setSortBy] = useState('rider_name')
  const [sortOrder, setSortOrder] = useState('asc')
  const [validation, setValidation] = useState({isValid: false, errors: [], warnings: []})
  const [saving, setSaving] = useState(false)
  const [user, setUser] = useState(null)
  const [authLoading, setAuthLoading] = useState(true)

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const authUser = await api.get('/auth/me')
        setUser(authUser)
      } catch (error) {
        // Not authenticated, redirect to login
        if (typeof window !== 'undefined') {
          const apiUrl = process.env.NODE_ENV === 'development' 
            ? 'http://localhost:8787' 
            : ''
          window.location.href = `${apiUrl}/auth/reddit`
        }
        return
      } finally {
        setAuthLoading(false)
      }
    }

    checkAuth()
  }, [])

  // Don't render anything until auth check is complete
  if (authLoading) {
    return (
      <Layout>
        <div style={{padding: '20px', textAlign: 'center'}}>
          <h2>Checking authentication...</h2>
        </div>
      </Layout>
    )
  }

  // If no user, show login prompt (shouldn't reach here due to redirect)
  if (!user) {
    return (
      <Layout>
        <div style={{padding: '20px', textAlign: 'center'}}>
          <h2>Authentication Required</h2>
          <p>You need to be logged in to build a team.</p>
          <a href={`${process.env.NODE_ENV === 'development' ? 'http://localhost:8787' : ''}/auth/reddit`} style={{
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

  const fetchRiders = React.useCallback(async () => {
    try {
      setLoading(true)
      const queryParams = new URLSearchParams()

      Object.entries(filters).forEach(([key, value]) => {
        if (value) {
          queryParams.append(key, value)
        }
      })

      const data = await api.get(`/api/riders/${year}/${sex}?${queryParams}`)

      setRiders(data)
    } catch (error) {
      console.error('Error fetching riders:', error)
    } finally {
      setLoading(false)
    }
  }, [filters, year, sex])

  const loadExistingTeam = React.useCallback(async () => {
    if (!user) return
    
    try {
      const team = await api.get(`/api/team/${year}/${sex}`)

      if (team && team.roster) {
        setTeamName(team.team_name || '')
        setSelectedRiders(team.roster.map(r => r.rider_name))
      } else {
        setTeamName('')
        setSelectedRiders([])
      }
    } catch (error) {
      console.error('Error loading existing team:', error)
    }
  }, [year, sex, user])

  useEffect(() => {
    fetchRiders()
    loadExistingTeam()
  }, [year, sex, fetchRiders, loadExistingTeam])

  useEffect(() => {
    if (selectedRiders.length > 0) {
      const validateTeam = async () => {
        if (selectedRiders.length === 0) {
          setValidation({isValid: false, errors: [], warnings: []})
          return
        }

        try {
          const result = await api.post(`/api/team/${year}/${sex}/validate`, {riders: selectedRiders})
          setValidation(result)
        } catch (error) {
          console.error('Error validating team:', error)
        }
      }

      validateTeam()
    }
  }, [selectedRiders, sex, year])


  const sortedRiders = [...riders].sort((a, b) => {
    let aVal = a[sortBy]
    let bVal = b[sortBy]

    if (sortBy === 'price') {
      aVal = parseInt(aVal) || 0
      bVal = parseInt(bVal) || 0
    }

    if (sortOrder === 'desc') {
      return bVal > aVal ? 1 : -1
    }
    return aVal > bVal ? 1 : -1
  })

  const selectedRiderDetails = riders.filter(rider => selectedRiders.includes(rider.rider_name))
  const totalBudget = selectedRiderDetails.reduce((sum, rider) => sum + (rider.price || 0), 0)
  const requiredRiders = sex === 'm' ? 25 : 15
  const maxBudget = 150

  const handleRiderToggle = riderName => {
    if (selectedRiders.includes(riderName)) {
      setSelectedRiders(selectedRiders.filter(name => name !== riderName))
    } else {
      setSelectedRiders([...selectedRiders, riderName])
    }
  }

  const handleSort = column => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(column)
      setSortOrder(column === 'price' ? 'desc' : 'asc')
    }
  }

  const handleSave = async () => {
    if (!teamName.trim()) {
      alert('Please enter a team name')
      return
    }

    try {
      setSaving(true)
      const result = await api.post(`/api/team/${year}/${sex}`, {
        team_name: teamName,
        riders: selectedRiders
      })

      alert('Team saved successfully!')
      if (validation.isValid) {
        navigate('/team-results')
      }
    } catch (error) {
      console.error('Error saving team:', error)
      alert('Error saving team')
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    if (confirm('Are you sure you want to reset your team? This will discard all changes.')) {
      loadExistingTeam()
    }
  }

  return (
    <Layout>
      <div style={{padding: '20px'}}>
        <h1>Team Builder</h1>

        <nav style={{marginBottom: '20px', padding: '10px', backgroundColor: '#f5f5f5'}}>
          <Link to="/" style={{marginRight: '20px'}}>Home</Link>
          <Link to="/all-riders" style={{marginRight: '20px'}}>All Riders</Link>
          <Link to="/races" style={{marginRight: '20px'}}>Races</Link>
          <Link to="/team-results" style={{marginRight: '20px'}}>My Team Results</Link>
        </nav>

        <div style={{marginBottom: '20px'}}>
          <label style={{marginRight: '10px'}}>
            Year:
            <select
              value={year}
              onChange={e => setYear(parseInt(e.target.value))}
              style={{marginLeft: '5px'}}>
              <option value={2024}>2024</option>
              <option value={2023}>2023</option>
            </select>
          </label>

          <label style={{marginRight: '20px'}}>
            Category:
            <select value={sex} onChange={e => setSex(e.target.value)} style={{marginLeft: '5px'}}>
              <option value="m">Men</option>
              <option value="f">Women</option>
            </select>
          </label>

          <label>
            Team Name:
            <input
              type="text"
              value={teamName}
              onChange={e => setTeamName(e.target.value)}
              placeholder="Enter team name"
              style={{marginLeft: '5px', padding: '5px'}} />
          </label>
        </div>

        <div style={{display: 'flex', gap: '20px'}}>
          <div style={{flex: '2'}}>
            <h3>Available Riders ({riders.length})</h3>

            <div style={{marginBottom: '15px', padding: '10px', border: '1px solid #ddd'}}>
              <h4>Filters</h4>
              <div style={{display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px'}}>
                <input
                  placeholder="Nationality (e.g., USA)"
                  value={filters.nationality}
                  onChange={e => setFilters({...filters, nationality: e.target.value})} />
                <input
                  placeholder="Team"
                  value={filters.team}
                  onChange={e => setFilters({...filters, team: e.target.value})} />
                <input
                  placeholder="Min Price"
                  type="number"
                  value={filters.minPrice}
                  onChange={e => setFilters({...filters, minPrice: e.target.value})} />
                <input
                  placeholder="Max Price"
                  type="number"
                  value={filters.maxPrice}
                  onChange={e => setFilters({...filters, maxPrice: e.target.value})} />
              </div>
              <button onClick={fetchRiders} style={{marginTop: '10px'}}>Apply Filters</button>
            </div>

            {loading ? (
              <p>Loading riders...</p>
            ) : (
              <div style={{maxHeight: '600px', overflowY: 'scroll', border: '1px solid #ddd'}}>
                <table style={{width: '100%', borderCollapse: 'collapse'}}>
                  <thead style={{position: 'sticky', top: '0', backgroundColor: '#f5f5f5'}}>
                    <tr>
                      <th style={{padding: '10px', border: '1px solid #ddd'}}>Select</th>
                      <th
                        style={{padding: '10px', border: '1px solid #ddd', cursor: 'pointer'}}
                        onClick={() => handleSort('rider_name')}>
                        Name {sortBy === 'rider_name' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </th>
                      <th
                        style={{padding: '10px', border: '1px solid #ddd', cursor: 'pointer'}}
                        onClick={() => handleSort('pro_team_name')}>
                        Team {sortBy === 'pro_team_name' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </th>
                      <th
                        style={{padding: '10px', border: '1px solid #ddd', cursor: 'pointer'}}
                        onClick={() => handleSort('nationality')}>
                        Nationality {sortBy === 'nationality' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </th>
                      <th
                        style={{padding: '10px', border: '1px solid #ddd', cursor: 'pointer'}}
                        onClick={() => handleSort('price')}>
                        Price {sortBy === 'price' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedRiders.map((rider, index) => (
                      <tr
                        key={rider.rider_name}
                        style={{backgroundColor: index % 2 === 0 ? '#f9f9f9' : 'white'}}>
                        <td
                          style={{padding: '10px', border: '1px solid #ddd', textAlign: 'center'}}>
                          <input
                            type="checkbox"
                            checked={selectedRiders.includes(rider.rider_name)}
                            onChange={() => handleRiderToggle(rider.rider_name)} />
                        </td>
                        <td style={{padding: '10px', border: '1px solid #ddd'}}>{rider.rider_name}</td>
                        <td style={{padding: '10px', border: '1px solid #ddd'}}>
                          {rider.team_acronym || rider.pro_team_name}
                        </td>
                        <td style={{padding: '10px', border: '1px solid #ddd'}}>{rider.nationality}</td>
                        <td style={{padding: '10px', border: '1px solid #ddd', textAlign: 'right'}}>{rider.price}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div style={{flex: '1'}}>
            <h3>Selected Team ({selectedRiders.length}/{requiredRiders})</h3>
            <p><strong>Budget:</strong> {totalBudget}/{maxBudget} points</p>

            {validation.errors.length > 0 && (
              <div style={{backgroundColor: '#ffebee', padding: '10px', marginBottom: '10px'}}>
                <h4 style={{color: 'red'}}>Validation Errors:</h4>
                <ul>
                  {validation.errors.map((error, index) => (
                    <li key={index} style={{color: 'red'}}>{error}</li>
                  ))}
                </ul>
              </div>
            )}

            {validation.warnings.length > 0 && (
              <div style={{backgroundColor: '#fff3e0', padding: '10px', marginBottom: '10px'}}>
                <h4 style={{color: 'orange'}}>Warnings:</h4>
                <ul>
                  {validation.warnings.map((warning, index) => (
                    <li key={index} style={{color: 'orange'}}>{warning}</li>
                  ))}
                </ul>
              </div>
            )}

            {validation.isValid && (
              <div style={{backgroundColor: '#e8f5e8', padding: '10px', marginBottom: '10px'}}>
                <p style={{color: 'green'}}>✓ Team is valid!</p>
              </div>
            )}

            <div style={{
              maxHeight: '400px',
              overflowY: 'scroll',
              border: '1px solid #ddd',
              marginBottom: '10px'
            }}>
              {selectedRiderDetails.map(rider => (
                <div
                  key={rider.rider_name}
                  style={{
                    padding: '5px',
                    borderBottom: '1px solid #eee',
                    display: 'flex',
                    justifyContent: 'space-between'
                  }}>
                  <div>
                    <strong>{rider.rider_name}</strong><br />
                    <small>{rider.team_acronym || rider.pro_team_name} ({rider.nationality})</small>
                  </div>
                  <div style={{textAlign: 'right'}}>
                    {rider.price}
                    <button
                      onClick={() => handleRiderToggle(rider.rider_name)}
                      style={{marginLeft: '5px', fontSize: '12px'}}>
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div style={{display: 'flex', gap: '10px'}}>
              <button
                onClick={handleSave}
                disabled={saving || !teamName.trim()}
                style={{
                  padding: '10px 20px',
                  backgroundColor: validation.isValid ? '#4caf50' : '#2196f3',
                  color: 'white',
                  border: 'none',
                  cursor: 'pointer'
                }}>
                {saving ? 'Saving...' : 'Save Team'}
              </button>
              <button
                onClick={handleReset}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#f44336',
                  color: 'white',
                  border: 'none',
                  cursor: 'pointer'
                }}>
                Reset
              </button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export const Head = () => <Seo title="Team Builder" />

export default TeamBuilder
