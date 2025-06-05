import * as React from "react"
import { useState, useEffect } from "react"
import { Link } from "gatsby"

import Layout from "../components/layout"
import Seo from "../components/seo"

const TeamResults = () => {
  const [team, setTeam] = useState(null)
  const [loading, setLoading] = useState(true)
  const [year, setYear] = useState(2024)
  const [sex, setSex] = useState('m')
  const [sortBy, setSortBy] = useState('total_score')
  const [sortOrder, setSortOrder] = useState('desc')

  // Mock player ID - in real app this would come from authentication
  const playerId = 1

  useEffect(() => {
    const fetchTeamResults = async () => {
      try {
        setLoading(true)
        const response = await fetch(`http://localhost:8001/api/team/${year}/${sex}`, {
          headers: { 'x-player-id': playerId.toString() }
        })

        if (response.ok) {
          const data = await response.json()
          setTeam(data)
        } else {
          setTeam(null)
        }
      } catch (error) {
        console.error('Error fetching team results:', error)
        setTeam(null)
      } finally {
        setLoading(false)
      }
    }

    fetchTeamResults()
  }, [year, sex])


  const handleSort = (column) => {
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
    // Calculate scores for each rider (mocked for now)
    const rosterWithScores = team.roster.map(rider => ({
      ...rider,
      total_score: Math.floor(Math.random() * 100) // Mock score - replace with actual scoring
    }))

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
      } else {
        return aVal > bVal ? 1 : -1
      }
    })
  }

  return (
    <Layout>
      <div style={{ padding: '20px' }}>
        <h1>My Team Results</h1>

        <nav style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#f5f5f5' }}>
          <Link to="/" style={{ marginRight: '20px' }}>Home</Link>
          <Link to="/team-builder" style={{ marginRight: '20px' }}>Team Builder</Link>
          <Link to="/all-riders" style={{ marginRight: '20px' }}>All Riders</Link>
          <Link to="/races" style={{ marginRight: '20px' }}>Races</Link>
        </nav>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ marginRight: '10px' }}>
            Year:
            <select value={year} onChange={(e) => setYear(parseInt(e.target.value))} style={{ marginLeft: '5px' }}>
              <option value={2024}>2024</option>
              <option value={2023}>2023</option>
            </select>
          </label>

          <label>
            Category:
            <select value={sex} onChange={(e) => setSex(e.target.value)} style={{ marginLeft: '5px' }}>
              <option value="m">Men</option>
              <option value="f">Women</option>
            </select>
          </label>
        </div>

        {loading ? (
          <p>Loading team results...</p>
        ) : team ? (
          <div>
            <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f5f5f5', border: '1px solid #ddd' }}>
              <h2>{team.team_name}</h2>
              <p><strong>Category:</strong> {sex === 'm' ? 'Men' : 'Women'} {year}</p>
              <p><strong>Team Status:</strong> {team.is_valid ? '✓ Valid' : '✗ Invalid'}</p>
              <p><strong>Total Team Score:</strong> {totalTeamScore} points</p>
              <p><strong>Riders:</strong> {team.roster ? team.roster.length : 0} / {sex === 'm' ? 25 : 15}</p>
              {team.roster && (
                <p><strong>Budget Used:</strong> {team.roster.reduce((sum, rider) => sum + (rider.price || 0), 0)} / 150 points</p>
              )}
            </div>

            {team.roster && team.roster.length > 0 ? (
              <div>
                <h3>Rider Scores</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ddd' }}>
                  <thead>
                    <tr style={{ backgroundColor: '#f5f5f5' }}>
                      <th style={{ padding: '10px', border: '1px solid #ddd', cursor: 'pointer' }} onClick={() => handleSort('rider_name')}>
                        Rider Name {sortBy === 'rider_name' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </th>
                      <th style={{ padding: '10px', border: '1px solid #ddd', cursor: 'pointer' }} onClick={() => handleSort('pro_team_name')}>
                        Team {sortBy === 'pro_team_name' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </th>
                      <th style={{ padding: '10px', border: '1px solid #ddd', cursor: 'pointer' }} onClick={() => handleSort('nationality')}>
                        Nationality {sortBy === 'nationality' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </th>
                      <th style={{ padding: '10px', border: '1px solid #ddd', cursor: 'pointer' }} onClick={() => handleSort('price')}>
                        Price {sortBy === 'price' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </th>
                      <th style={{ padding: '10px', border: '1px solid #ddd', cursor: 'pointer' }} onClick={() => handleSort('total_score')}>
                        Score {sortBy === 'total_score' && (sortOrder === 'asc' ? '↑' : '↓')}
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedRoster.map((rider, index) => (
                      <tr key={rider.rider_name} style={{ backgroundColor: index % 2 === 0 ? '#f9f9f9' : 'white' }}>
                        <td style={{ padding: '10px', border: '1px solid #ddd' }}>{rider.rider_name}</td>
                        <td style={{ padding: '10px', border: '1px solid #ddd' }}>{rider.team_acronym || rider.pro_team_name}</td>
                        <td style={{ padding: '10px', border: '1px solid #ddd' }}>{rider.nationality}</td>
                        <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'right' }}>{rider.price}</td>
                        <td style={{ padding: '10px', border: '1px solid #ddd', textAlign: 'right' }}>{rider.total_score}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p>No riders in team. <Link to="/team-builder">Build your team</Link> to get started.</p>
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

export const Head = () => <Seo title="My Team Results" />

export default TeamResults