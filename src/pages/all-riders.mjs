import * as React from 'react'
import {useState, useEffect} from 'react'
import {Link} from 'gatsby'

import Layout from '../components/layout'
import Seo from '../components/seo'
import {api} from '../lib/api-config.mjs'
const {console} = globalThis

const AllRiders = () => {
  const [riderScores, setRiderScores] = useState([])
  const [loading, setLoading] = useState(true)
  const [year, setYear] = useState(2024)
  const [sex, setSex] = useState('m')
  const [sortBy, setSortBy] = useState('total_score')
  const [sortOrder, setSortOrder] = useState('desc')


  useEffect(() => {
    const fetchRiderScores = async () => {
      try {
        setLoading(true)
        const data = await api.get(`/api/riders/${year}/${sex}/scores`)

        setRiderScores(data)
      } catch (error) {
        console.error('Error fetching rider scores:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchRiderScores()
  }, [year, sex])

  const sortedRiders = [...riderScores].sort((a, b) => {
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
        <h1>All Riders</h1>

        <nav style={{marginBottom: '20px', padding: '10px', backgroundColor: '#f5f5f5'}}>
          <Link to="/" style={{marginRight: '20px'}}>Home</Link>
          <Link to="/team-builder" style={{marginRight: '20px'}}>Team Builder</Link>
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

          <label>
            Category:
            <select value={sex} onChange={e => setSex(e.target.value)} style={{marginLeft: '5px'}}>
              <option value="m">Men</option>
              <option value="f">Women</option>
            </select>
          </label>
        </div>

        <h2>Rider Scores - {sex === 'm' ? 'Men' : 'Women'} {year}</h2>

        {loading ? (
          <p>Loading rider scores...</p>
        ) : (
          <div style={{overflowX: 'auto'}}>
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
                    onClick={() => handleSort('total_score')}>
                    Total Score {sortBy === 'total_score' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedRiders.map((rider, index) => (
                  <tr
                    key={rider.rider_name}
                    style={{backgroundColor: index % 2 === 0 ? '#f9f9f9' : 'white'}}>
                    <td style={{padding: '10px', border: '1px solid #ddd'}}>
                      {rider.rider_name}
                    </td>
                    <td style={{padding: '10px', border: '1px solid #ddd'}}>{rider.pro_team_name}</td>
                    <td style={{padding: '10px', border: '1px solid #ddd'}}>{rider.nationality}</td>
                    <td style={{padding: '10px', border: '1px solid #ddd', textAlign: 'right'}}>
                      {rider.total_score || 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!loading && riderScores.length === 0 && (
          <p>
            No riders found for {sex === 'm' ? 'Men' : 'Women'} {year}.
            Riders will appear here once they are added to the system.
          </p>
        )}
      </div>
    </Layout>
  )
}

export const Head = () => <Seo title="All Riders" />

export default AllRiders
