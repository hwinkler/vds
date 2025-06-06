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
import {Link, useStaticQuery, graphql} from 'gatsby'

import Layout from '../components/layout'
import Seo from '../components/seo'
import {api} from '../lib/api-config.mjs'

const {console} = globalThis

const IndexPage = () => {
  const [rankings, setRankings] = useState([])
  const [loading, setLoading] = useState(true)
  const [year, setYear] = useState(2024)
  const [sex, setSex] = useState('m')
  const [sortBy, setSortBy] = useState('score')
  const [sortOrder, setSortOrder] = useState('desc')


  useEffect(() => {
    const fetchRankings = async () => {
      try {
        setLoading(true)
        const data = await api.get(`/api/teams/${year}/${sex}/rankings`)
        setRankings(data)
      } catch (error) {
        console.error('Error fetching rankings:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchRankings()
  }, [year, sex])

  const sortedRankings = [...rankings].sort((a, b) => {
    let aVal = a[sortBy]
    let bVal = b[sortBy]

    if (sortBy === 'total_score') {
      aVal = parseInt(aVal) || 0
      bVal = parseInt(bVal) || 0
    }

    if (sortOrder === 'desc') {
      return bVal > aVal ? 1 : -1
    }
    return aVal > bVal ? 1 : -1
  })

  const handleSort = column => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(column)
      setSortOrder(column === 'total_score' ? 'desc' : 'asc')
    }
  }

  return (
    <Layout>
      <div style={{padding: '20px'}}>
        <h1>VDS Fantasy Pro Cycling</h1>

        <nav style={{marginBottom: '20px', padding: '10px', backgroundColor: '#f5f5f5'}}>
          <Link to="/team-builder" style={{marginRight: '20px'}}>Team Builder</Link>
          <Link to="/all-riders" style={{marginRight: '20px'}}>All Riders</Link>
          <Link to="/races" style={{marginRight: '20px'}}>Races</Link>
          <Link to="/team-results" style={{marginRight: '20px'}}>My Team Results</Link>
        </nav>

        <div style={{marginBottom: '20px'}}>
          <label style={{marginRight: '10px'}}>
            Year:
            <select value={year}
              onChange={e => setYear(parseInt(e.target.value))} style={{marginLeft: '5px'}}>
              <option value={2024}>2024</option>
              <option value={2023}>2023</option>
            </select>
          </label>

          <label>
            Category:
            <select value={sex} onChange={e => setSex(e.target.value)} style={{marginLeft: '5px'}}>
              <option value="m">Men</option>
              <option value="f">Women</option>
            </select>
          </label>
        </div>

        <h2>Team Rankings - {sex === 'm' ? 'Men' : 'Women'} {year}</h2>

        {loading ? (
          <p>Loading rankings...</p>
        ) : (
          <table style={{width: '100%', borderCollapse: 'collapse', border: '1px solid #ddd'}}>
            <thead>
              <tr style={{backgroundColor: '#f5f5f5'}}>
                <th style={{padding: '10px', border: '1px solid #ddd', cursor: 'pointer'}}
                  onClick={() => handleSort('player_name')}>
                  Player Name {sortBy === 'player_name' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th style={{padding: '10px', border: '1px solid #ddd', cursor: 'pointer'}}
                  onClick={() => handleSort('team_name')}>
                  Team Name {sortBy === 'team_name' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
                <th style={{padding: '10px', border: '1px solid #ddd', cursor: 'pointer'}}
                  onClick={() => handleSort('total_score')}>
                  Total Score {sortBy === 'total_score' && (sortOrder === 'asc' ? '↑' : '↓')}
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedRankings.map((team, index) => (
                <tr key={team.team_id}
                  style={{backgroundColor: index % 2 === 0 ? '#f9f9f9' : 'white'}}>
                  <td style={{padding: '10px', border: '1px solid #ddd'}}>{team.player_name}</td>
                  <td style={{padding: '10px', border: '1px solid #ddd'}}>
                    <Link to={`/team-results?team_id=${team.team_id}`}>
                      {team.team_name}
                    </Link>
                  </td>
                  <td style={{padding: '10px', border: '1px solid #ddd', textAlign: 'right'}}>
                    {team.total_score || 0}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {!loading && rankings.length === 0 && (
          <p>No teams found for {sex === 'm' ? 'Men' : 'Women'} {year}.
            Teams will appear here once they are created and validated.
          </p>
        )}
      </div>
    </Layout>
  )
}

export const Head = () => <Seo title="VDS Fantasy Pro Cycling" />

export default IndexPage
