import * as React from "react"
import { useState, useEffect } from "react"
import { Link } from "gatsby"

import Layout from "../components/layout"
import Seo from "../components/seo"

const RaceResults = () => {
  const [raceResults, setRaceResults] = useState({ results: [], jerseys: [] })
  const [raceInfo, setRaceInfo] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const raceId = urlParams.get('race_id')
    
    if (raceId) {
      fetchRaceResults(raceId)
    }
  }, [])

  const fetchRaceResults = async (raceId) => {
    try {
      setLoading(true)
      const response = await fetch(`http://localhost:8001/api/races/${raceId}/results`)
      const data = await response.json()
      setRaceResults(data)
      
      // Mock race info - in real app this would come from the API
      setRaceInfo({
        race_name: "Tour de France",
        category: "Grand Tours",
        start_date: "2024-07-01",
        end_date: "2024-07-23"
      })
    } catch (error) {
      console.error('Error fetching race results:', error)
    } finally {
      setLoading(false)
    }
  }

  const groupResultsByStage = (results) => {
    return results.reduce((groups, result) => {
      const stage = result.stage_number
      if (!groups[stage]) {
        groups[stage] = []
      }
      groups[stage].push(result)
      return groups
    }, {})
  }

  const groupJerseysByStage = (jerseys) => {
    return jerseys.reduce((groups, jersey) => {
      const stage = jersey.stage_number
      if (!groups[stage]) {
        groups[stage] = { intermediate: [], final: [] }
      }
      if (jersey.is_final) {
        groups[stage].final.push(jersey)
      } else {
        groups[stage].intermediate.push(jersey)
      }
      return groups
    }, {})
  }

  const stageResults = groupResultsByStage(raceResults.results)
  const stageJerseys = groupJerseysByStage(raceResults.jerseys)
  const stages = [...new Set([
    ...Object.keys(stageResults).map(Number),
    ...Object.keys(stageJerseys).map(Number)
  ])].sort((a, b) => a - b)

  return (
    <Layout>
      <div style={{ padding: '20px' }}>
        <nav style={{ marginBottom: '20px', padding: '10px', backgroundColor: '#f5f5f5' }}>
          <Link to="/" style={{ marginRight: '20px' }}>Home</Link>
          <Link to="/team-builder" style={{ marginRight: '20px' }}>Team Builder</Link>
          <Link to="/all-riders" style={{ marginRight: '20px' }}>All Riders</Link>
          <Link to="/races" style={{ marginRight: '20px' }}>Races</Link>
          <Link to="/team-results" style={{ marginRight: '20px' }}>My Team Results</Link>
        </nav>

        {loading ? (
          <p>Loading race results...</p>
        ) : (
          <div>
            {raceInfo && (
              <div style={{ marginBottom: '30px' }}>
                <h1>{raceInfo.race_name}</h1>
                <p><strong>Category:</strong> {raceInfo.category}</p>
                <p><strong>Date:</strong> {new Date(raceInfo.start_date).toLocaleDateString()} - {new Date(raceInfo.end_date).toLocaleDateString()}</p>
              </div>
            )}

            {stages.length > 0 ? (
              stages.map(stageNumber => (
                <div key={stageNumber} style={{ marginBottom: '40px', border: '1px solid #ddd', padding: '15px' }}>
                  <h2 style={{ borderBottom: '2px solid #2196f3', paddingBottom: '10px' }}>
                    Stage {stageNumber}
                  </h2>

                  {stageResults[stageNumber] && stageResults[stageNumber].length > 0 && (
                    <div style={{ marginBottom: '20px' }}>
                      <h3>Stage Finishers</h3>
                      <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ddd' }}>
                        <thead>
                          <tr style={{ backgroundColor: '#f5f5f5' }}>
                            <th style={{ padding: '8px', border: '1px solid #ddd' }}>Position</th>
                            <th style={{ padding: '8px', border: '1px solid #ddd' }}>Rider</th>
                            <th style={{ padding: '8px', border: '1px solid #ddd' }}>Points Awarded</th>
                          </tr>
                        </thead>
                        <tbody>
                          {stageResults[stageNumber]
                            .sort((a, b) => a.finish_position - b.finish_position)
                            .map((result, index) => (
                            <tr key={index} style={{ backgroundColor: index % 2 === 0 ? '#f9f9f9' : 'white' }}>
                              <td style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'center' }}>
                                {result.finish_position}
                              </td>
                              <td style={{ padding: '8px', border: '1px solid #ddd' }}>{result.rider_name}</td>
                              <td style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'center' }}>
                                {result.points_awarded}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {stageJerseys[stageNumber] && (
                    <div>
                      {stageJerseys[stageNumber].intermediate.length > 0 && (
                        <div style={{ marginBottom: '15px' }}>
                          <h4>Intermediate Jersey Holders</h4>
                          <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ddd' }}>
                            <thead>
                              <tr style={{ backgroundColor: '#fff3e0' }}>
                                <th style={{ padding: '8px', border: '1px solid #ddd' }}>Jersey Type</th>
                                <th style={{ padding: '8px', border: '1px solid #ddd' }}>Rider</th>
                                <th style={{ padding: '8px', border: '1px solid #ddd' }}>Points Awarded</th>
                              </tr>
                            </thead>
                            <tbody>
                              {stageJerseys[stageNumber].intermediate.map((jersey, index) => (
                                <tr key={index} style={{ backgroundColor: index % 2 === 0 ? '#fffbf0' : 'white' }}>
                                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>
                                    {jersey.jersey_type.charAt(0).toUpperCase() + jersey.jersey_type.slice(1)}
                                  </td>
                                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>{jersey.rider_name}</td>
                                  <td style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'center' }}>
                                    {jersey.points_awarded}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}

                      {stageJerseys[stageNumber].final.length > 0 && (
                        <div>
                          <h4>Final Jersey Winners</h4>
                          <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ddd' }}>
                            <thead>
                              <tr style={{ backgroundColor: '#e8f5e8' }}>
                                <th style={{ padding: '8px', border: '1px solid #ddd' }}>Jersey Type</th>
                                <th style={{ padding: '8px', border: '1px solid #ddd' }}>Rider</th>
                                <th style={{ padding: '8px', border: '1px solid #ddd' }}>Points Awarded</th>
                              </tr>
                            </thead>
                            <tbody>
                              {stageJerseys[stageNumber].final.map((jersey, index) => (
                                <tr key={index} style={{ backgroundColor: index % 2 === 0 ? '#f0f8f0' : 'white' }}>
                                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>
                                    <strong>{jersey.jersey_type.charAt(0).toUpperCase() + jersey.jersey_type.slice(1)}</strong>
                                  </td>
                                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>
                                    <strong>{jersey.rider_name}</strong>
                                  </td>
                                  <td style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'center' }}>
                                    <strong>{jersey.points_awarded}</strong>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div>
                <p>No results available for this race yet.</p>
                <p>Results will appear here once the race stages are completed and results are entered.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  )
}

export const Head = () => <Seo title="Race Results" />

export default RaceResults