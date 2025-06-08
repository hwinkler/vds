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

/* eslint-disable no-nested-ternary */
import * as React from 'react'
import {useState, useEffect} from 'react'
import {Link} from 'gatsby'

import Layout from '../components/layout'
import Seo from '../components/seo'
import {api} from '../lib/api-config.mjs'

const {console} = globalThis

const Team = () => {
  const [team, setTeam] = useState(null)
  const [teams, setTeams] = useState([])
  const [loading, setLoading] = useState(true)
  const [teamsLoading, setTeamsLoading] = useState(true)
  const [year, setYear] = useState(2025)
  const [sex, setSex] = useState('m')
  const [selectedTeamId, setSelectedTeamId] = useState(null)
  const [user, setUser] = useState(null)
  const [sortBy, setSortBy] = useState('total_score')
  const [sortOrder, setSortOrder] = useState('desc')

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const authUser = await api.get('/auth/me')
        setUser(authUser)
      } catch (error) {
        // Not authenticated, that's okay for this page
        setUser(null)
      }
    }
    checkAuth()
  }, [])

  // Fetch all teams for the dropdown
  useEffect(() => {
    const fetchTeams = async () => {
      try {
        setTeamsLoading(true)
        const data = await api.get(`/api/teams/${year}/${sex}/rankings`)
        // sort teams by player_name
        data.sort((a, b) => a.player_name.localeCompare(b.player_name))
        setTeams(data)
        
        // Auto-select current user's team if logged in
        if (user && data.length > 0) {
          const userTeam = data.find(t => t.player_name === user.player_name)
          if (userTeam) {
            setSelectedTeamId(userTeam.team_id)
          } else if (!selectedTeamId) {
            setSelectedTeamId(data[0].team_id)
          }
        } else if (!selectedTeamId && data.length > 0) {
          setSelectedTeamId(data[0].team_id)
        }
      } catch (error) {
        console.error('Error fetching teams:', error)
      } finally {
        setTeamsLoading(false)
      }
    }

    fetchTeams()
  }, [year, sex, user])

  // Fetch selected team details
  useEffect(() => {
    const fetchTeam = async () => {
      if (!selectedTeamId) return
      
      try {
        setLoading(true)
        // Get team details by team_id - we'll need a new API endpoint for this
        const data = await api.get(`/api/team/details/${selectedTeamId}`)
        setTeam(data)
      } catch (error) {
        console.error('Error fetching team results:', error)
        setTeam(null)
      } finally {
        setLoading(false)
      }
    }

    fetchTeam()
  }, [selectedTeamId])


  const handleSort = column => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(column)
      setSortOrder(column === 'total_score' ? 'desc' : 'asc')
    }
  }

  let sortedRoster = []
  let totalTeamScore = 0

  if (team && team.roster) {
    const rosterWithScores = team.roster

    totalTeamScore = rosterWithScores.reduce((sum, rider) => sum + rider.total_score, 0)

    sortedRoster = [...rosterWithScores].sort((a, b) => {
      let aVal = a[sortBy]
      let bVal = b[sortBy]

      if (sortBy === 'total_score' || sortBy === 'price') {
        aVal = parseInt(aVal) || 0
        bVal = parseInt(bVal) || 0
      }

      if (sortOrder === 'desc') {
        return bVal > aVal ? 1 : -1
      }
      return aVal > bVal ? 1 : -1
    })
  }

  return (
    <Layout>
      <div style={{padding: '20px'}}>
        <h1>Team</h1>

        <nav style={{marginBottom: '20px', padding: '10px', backgroundColor: '#f5f5f5', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <div>
            <Link to="/" style={{marginRight: '20px'}}>Home</Link>
            <Link to="/team-builder" style={{marginRight: '20px'}}>Team Builder</Link>
            <Link to="/all-riders" style={{marginRight: '20px'}}>All Riders</Link>
            <Link to="/races" style={{marginRight: '20px'}}>Races</Link>
            <Link to="/team" style={{marginRight: '20px'}}>Teams</Link>
          </div>
          {user ? (
            <Link to="/profile" style={{fontSize: '16px', fontWeight: 'bold', color: '#7026b9', textDecoration: 'none'}}>
              Welcome, {user.player_name}!
            </Link>
          ) : (
            <a 
              href="/auth/reddit" 
              style={{fontSize: '16px', fontWeight: 'bold', color: '#2196f3', textDecoration: 'none'}}
            >
              Login
            </a>
          )}
        </nav>

        <div style={{marginBottom: '20px'}}>
          <label style={{marginRight: '10px'}}>
            Year:
            <select
              value={year}
              onChange={e => setYear(parseInt(e.target.value))}
              style={{marginLeft: '5px'}}>
              <option value={2025}>2025</option>
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
            Team:
            <select 
              value={selectedTeamId || ''} 
              onChange={e => setSelectedTeamId(parseInt(e.target.value))}
              style={{marginLeft: '5px', width: '30ch'}}
              disabled={teamsLoading}>
              {teamsLoading ? (
                <option>Loading teams...</option>
              ) : teams.length === 0 ? (
                <option>No teams found</option>
              ) : (
                teams.map(team => (
                  <option key={team.team_id} value={team.team_id}>
                    {team.player_name} - {team.team_name}
                  </option>
                ))
              )}
            </select>
          </label>
        </div>

        {/* // TODO re-enable no-nested-ternary */}

        {loading ? (
          <p>Loading team results...</p>
        ) : team ? (
          <div>
            <div style={{
              marginBottom: '20px',
              padding: '15px',
              backgroundColor: '#f5f5f5',
              border: '1px solid #ddd'
            }}>
              <h2>{team.team_name}</h2>
              <p><strong>Category:</strong> {sex === 'm' ? 'Men' : 'Women'} {year}</p>
              <p><strong>Team Status:</strong> {team.is_valid ? '✓ Valid' : '✗ Invalid'}</p>
              <p><strong>Total Team Score:</strong> {totalTeamScore} points</p>
              <p>
                <strong>Riders:</strong> {team.roster ? team.roster.length : 0} /
                {sex === 'm' ? 25 : 15}
              </p>
              {team.roster && (
                <p>
                  <strong>Budget Used:</strong>
                  {team.roster.reduce((sum, rider) => sum + (rider.price || 0), 0)} / 150 points
                </p>
              )}
            </div>

            {team.roster && team.roster.length > 0 ? (
              <div>
                <h3>Rider Scores</h3>
                <table style={{width: '100%', borderCollapse: 'collapse', border: '1px solid #ddd'}}>
                  <thead>
                    <tr style={{backgroundColor: '#f5f5f5'}}>
                      <th
                        style={{padding: '10px', border: '1px solid #ddd', cursor: 'pointer'}}
                        onClick={() => handleSort('rider_name')}>
                        Rider Name {sortBy === 'rider_name' && (sortOrder === 'asc' ? '↑' : '↓')}
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
                      <th
                        style={{padding: '10px', border: '1px solid #ddd', cursor: 'pointer'}}
                        onClick={() => handleSort('total_score')}>
                        Score {sortBy === 'total_score' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedRoster.map((rider, index) => (
                      <tr
                        key={rider.rider_name}
                        style={{backgroundColor: index % 2 === 0 ? '#f9f9f9' : 'white'}}>
                        <td style={{padding: '10px', border: '1px solid #ddd'}}>{rider.rider_name}</td>
                        <td style={{padding: '10px', border: '1px solid #ddd'}}>
                          {rider.team_acronym || rider.pro_team_name}
                        </td>
                        <td style={{padding: '10px', border: '1px solid #ddd'}}>{rider.nationality}</td>
                        <td
                          style={{padding: '10px', border: '1px solid #ddd', textAlign: 'right'}}>
                          {rider.price}
                        </td>
                        <td
                          style={{padding: '10px', border: '1px solid #ddd', textAlign: 'right'}}>
                          {rider.total_score}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p>
                No riders in team. <Link to="/team-builder">Build your team</Link> to get started.
              </p>
            )}
          </div>
        ) : (
          <div>
            <p>You don't have a team for {sex === 'm' ? 'Men' : 'Women'} {year} yet.</p>
            <p><Link to="/team-builder">Create your team</Link> to get started.</p>
          </div>
        )}
      </div>
    </Layout>
  )
}

export const Head = () => <Seo title="Team" />

export default Team
