const Database = require('./database')

class Models {
  constructor() {
    this.db = new Database()
  }

  async init() {
    await this.db.connect()
  }

  async close() {
    await this.db.close()
  }

  // Player methods
  async createPlayer(playerData) {
    const {player_name, email, oauth_provider, oauth_id} = playerData
    const result = await this.db.run(
      'INSERT INTO player (player_name, email, oauth_provider, oauth_id) VALUES (?, ?, ?, ?)',
      [player_name, email, oauth_provider, oauth_id]
    )

    return result.id
  }

  async getPlayerByEmail(email) {
    return await this.db.get('SELECT * FROM player WHERE email = ?', [email])
  }

  async getPlayerById(playerId) {
    return await this.db.get('SELECT * FROM player WHERE player_id = ?', [playerId])
  }

  // Game methods
  async getGames() {
    return await this.db.all('SELECT * FROM game ORDER BY year DESC, sex')
  }

  async createGame(gameData) {
    const {sex, year, deadline} = gameData

    return await this.db.run(
      'INSERT OR REPLACE INTO game (sex, year, deadline) VALUES (?, ?, ?)',
      [sex, year, deadline]
    )
  }

  // Rider methods
  async getRiders(year, sex, filters = {}) {
    let sql = 'SELECT r.*, p.acronym as team_acronym FROM rider r JOIN pro_team p ON r.pro_team_name = p.pro_team_name AND r.year = p.year AND r.sex = p.sex WHERE r.year = ? AND r.sex = ?'
    const params = [year, sex]

    if (filters.nationality) {
      sql = `${sql} AND r.nationality = ?`
      params.push(filters.nationality)
    }

    if (filters.team) {
      sql = `${sql} AND r.pro_team_name = ?`
      params.push(filters.team)
    }

    if (filters.maxPrice) {
      sql = `${sql} AND r.price <= ?`
      params.push(filters.maxPrice)
    }

    if (filters.minPrice) {
      sql = `${sql} AND r.price >= ?`
      params.push(filters.minPrice)
    }

    sql = `${sql} ORDER BY r.rider_name`
    return await this.db.all(sql, params)
  }

  async getRidersByNames(year, sex, riderNames) {
    if (riderNames.length === 0) {
      return []
    }

    const placeholders = riderNames.map(() => '?').join(',')
    const sql = `SELECT r.*, p.acronym as team_acronym FROM rider r 
                 JOIN pro_team p ON r.pro_team_name = p.pro_team_name AND r.year = p.year AND r.sex = p.sex 
                 WHERE r.year = ? AND r.sex = ? AND r.rider_name IN (${placeholders})`

    return await this.db.all(sql, [year, sex, ...riderNames])
  }

  // Team methods
  async createPlayerTeam(teamData) {
    const {player_id, sex, year, team_name} = teamData
    const result = await this.db.run(
      'INSERT OR REPLACE INTO player_team (player_id, sex, year, team_name) VALUES (?, ?, ?, ?)',
      [player_id, sex, year, team_name]
    )

    return result.id || await this.getPlayerTeamId(player_id, sex, year)
  }

  async getPlayerTeamId(playerId, sex, year) {
    const result = await this.db.get(
      'SELECT team_id FROM player_team WHERE player_id = ? AND sex = ? AND year = ?',
      [playerId, sex, year]
    )

    return result ? result.team_id : null
  }

  async getPlayerTeam(playerId, sex, year) {
    return await this.db.get(
      'SELECT * FROM player_team WHERE player_id = ? AND sex = ? AND year = ?',
      [playerId, sex, year]
    )
  }

  async getPlayerTeams() {
    return await this.db.all(`
      SELECT pt.*, p.player_name 
      FROM player_team pt 
      JOIN player p ON pt.player_id = p.player_id 
      ORDER BY pt.year DESC, pt.sex, p.player_name
    `)
  }

  async updatePlayerTeamRoster(teamId, riderNames, sex, year) {
    // First, remove existing riders
    await this.db.run('DELETE FROM player_team_roster WHERE team_id = ?', [teamId])

    // Add new riders
    for (const riderName of riderNames) {
      await this.db.run(
        'INSERT INTO player_team_roster (team_id, rider_name, sex, year) VALUES (?, ?, ?, ?)',
        [teamId, riderName, sex, year]
      )
    }

    // Update team validity
    const isValid = await this.validateTeam(teamId, sex, year)

    await this.db.run(
      'UPDATE player_team SET is_valid = ?, updated_at = CURRENT_TIMESTAMP WHERE team_id = ?',
      [isValid, teamId]
    )

    return isValid
  }

  async getPlayerTeamRoster(teamId) {
    return await this.db.all(`
      SELECT ptr.*, r.price, r.pro_team_name, r.nationality, p.acronym as team_acronym
      FROM player_team_roster ptr 
      JOIN rider r ON ptr.rider_name = r.rider_name AND ptr.sex = r.sex AND ptr.year = r.year
      JOIN pro_team p ON r.pro_team_name = p.pro_team_name AND r.year = p.year AND r.sex = p.sex
      WHERE ptr.team_id = ?
      ORDER BY r.price DESC, r.rider_name
    `, [teamId])
  }

  async validateTeam(teamId, sex, year) {
    const roster = await this.getPlayerTeamRoster(teamId)

    if (sex === 'm') {
      // Men's rules
      if (roster.length !== 25) {
        return false
      }

      const totalBudget = roster.reduce((sum, rider) => sum + rider.price, 0)

      if (totalBudget > 150) {
        return false
      }

      const highValueRiders = roster.filter(rider => rider.price >= 18)

      if (highValueRiders.length > 3) {
        return false
      }

      const veryHighValueRiders = roster.filter(rider => rider.price >= 24)

      if (veryHighValueRiders.length > 1) {
        return false
      }
    } else if (sex === 'f') {
      // Women's rules
      if (roster.length !== 15) {
        return false
      }

      const totalBudget = roster.reduce((sum, rider) => sum + rider.price, 0)

      if (totalBudget > 150) {
        return false
      }

      const highValueRiders = roster.filter(rider => rider.price >= 20)
      const highValueBudget = highValueRiders.reduce((sum, rider) => sum + rider.price, 0)

      if (highValueBudget > 100) {
        return false
      }
    }

    return true
  }

  // Race and scoring methods
  async getRaces(year, sex) {
    return await this.db.all(`
      SELECT r.*, c.category
      FROM race r
      JOIN category c ON r.category = c.category
      WHERE r.year = ? AND r.sex = ?
      ORDER BY r.start_date, r.race_name
    `, [year, sex])
  }

  async getRaceResults(raceId) {
    return await this.db.all(`
      SELECT s.stage_number, s.stage_date, f.rider_name, f.finish_position, f.points_awarded
      FROM stage s
      LEFT JOIN finisher f ON s.stage_id = f.stage_id
      WHERE s.race_id = ?
      ORDER BY s.stage_number, f.finish_position
    `, [raceId])
  }

  async getJerseyHolders(raceId) {
    return await this.db.all(`
      SELECT s.stage_number, s.stage_date, j.rider_name, j.jersey_type, j.is_final, j.points_awarded
      FROM stage s
      LEFT JOIN jersey_holder j ON s.stage_id = j.stage_id
      WHERE s.race_id = ?
      ORDER BY s.stage_number, j.jersey_type, j.is_final
    `, [raceId])
  }

  async getPlayerTeamScores(year, sex) {
    return await this.db.all(`
      SELECT 
        pt.team_id,
        pt.team_name,
        p.player_name,
        SUM(COALESCE(f.points_awarded, 0) + COALESCE(j.points_awarded, 0)) as total_score
      FROM player_team pt
      JOIN player p ON pt.player_id = p.player_id
      LEFT JOIN player_team_roster ptr ON pt.team_id = ptr.team_id
      LEFT JOIN finisher f ON ptr.rider_name = f.rider_name AND ptr.sex = f.sex AND ptr.year = f.year
      LEFT JOIN jersey_holder j ON ptr.rider_name = j.rider_name AND ptr.sex = j.sex AND ptr.year = j.year
      WHERE pt.year = ? AND pt.sex = ? AND pt.is_valid = 1
      GROUP BY pt.team_id, pt.team_name, p.player_name
      ORDER BY total_score DESC
    `, [year, sex])
  }

  async getRiderScores(year, sex) {
    return await this.db.all(`
      SELECT 
        r.rider_name,
        r.pro_team_name,
        r.nationality,
        SUM(COALESCE(f.points_awarded, 0) + COALESCE(j.points_awarded, 0)) as total_score
      FROM rider r
      LEFT JOIN finisher f ON r.rider_name = f.rider_name AND r.sex = f.sex AND r.year = f.year
      LEFT JOIN jersey_holder j ON r.rider_name = j.rider_name AND r.sex = j.sex AND r.year = j.year
      WHERE r.year = ? AND r.sex = ?
      GROUP BY r.rider_name, r.pro_team_name, r.nationality
      ORDER BY total_score DESC
    `, [year, sex])
  }
}

module.exports = Models
