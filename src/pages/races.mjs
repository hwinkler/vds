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
const Races = () => {
  const [races, setRaces] = useState([])
  const [loading, setLoading] = useState(true)
  const [year, setYear] = useState(2025)
  const [sex, setSex] = useState('m')

  useEffect(() => {
    const fetchRaces = async () => {
      try {
        setLoading(true)
        const data = await api.get(`/api/races/${year}/${sex}`)

        setRaces(data)
      } catch (error) {
        console.error('Error fetching races:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchRaces()
  }, [year, sex])


  const groupedRaces = races.reduce((groups, race) => {
    const category = race.category

    if (!groups[category]) {
      groups[category] = []
    }
    groups[category].push(race)
    return groups
  }, {})

  return (
    <Layout>
      <div style={{padding: '20px'}}>
        <h1>Races</h1>

        <nav style={{marginBottom: '20px', padding: '10px', backgroundColor: '#f5f5f5'}}>
          <Link to="/" style={{marginRight: '20px'}}>Home</Link>
          <Link to="/team-builder" style={{marginRight: '20px'}}>Team Builder</Link>
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
              <option value={2025}>2025</option>
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

        <h2>Race Calendar - {sex === 'm' ? 'Men' : 'Women'} {year}</h2>

        {/* // TODO re-enable no-nested-ternary */}
        {loading ? (
          <p>Loading races...</p>
        ) : Object.keys(groupedRaces).length > 0 ? (
          <div>
            {Object.entries(groupedRaces).map(([category, categoryRaces]) => (
              <div key={category} style={{marginBottom: '30px'}}>
                <h3 style={{
                  backgroundColor: '#e3f2fd',
                  padding: '10px',
                  margin: '0 0 10px 0',
                  borderLeft: '4px solid #2196f3'
                }}>
                  {category}
                </h3>
                <table style={{
                  width: '100%',
                  borderCollapse: 'collapse',
                  border: '1px solid #ddd',
                  marginBottom: '20px'
                }}>
                  <thead>
                    <tr style={{backgroundColor: '#f5f5f5'}}>
                      <th
                        style={{padding: '10px', border: '1px solid #ddd', textAlign: 'left'}}>
                        Race Name
                      </th>
                      <th
                        style={{padding: '10px', border: '1px solid #ddd', textAlign: 'left'}}>
                        Start Date
                      </th>
                      <th
                        style={{padding: '10px', border: '1px solid #ddd', textAlign: 'center'}}>
                        Results
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {categoryRaces.map((race, index) => (
                      <tr
                        key={race.race_id}
                        style={{backgroundColor: index % 2 === 0 ? '#f9f9f9' : 'white'}}>
                        <td style={{padding: '10px', border: '1px solid #ddd'}}>
                          {race.race_name}
                        </td>
                        <td style={{padding: '10px', border: '1px solid #ddd'}}>
                          {race.start_date ? new Date(race.start_date).toLocaleDateString() : 'TBD'}
                        </td>
                        <td
                          style={{padding: '10px', border: '1px solid #ddd', textAlign: 'center'}}>
                          <Link
                            to={`/race-results?race_id=${race.race_id}`}
                            style={{
                              padding: '5px 10px',
                              backgroundColor: '#2196f3',
                              color: 'white',
                              textDecoration: 'none',
                              borderRadius: '3px',
                              fontSize: '12px'
                            }}>
                            View Results
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        ) : (
          <div>
            <p>No races found for {sex === 'm' ? 'Men' : 'Women'} {year}.</p>
            <p>Races will appear here once they are added to the system by administrators.</p>
          </div>
        )}
      </div>
    </Layout>
  )
}

export const Head = () => <Seo title="Races" />

export default Races
