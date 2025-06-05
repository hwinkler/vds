const express = require('express');
const cors = require('cors');
const Models = require('../lib/models');

const app = express();
const models = new Models();

// Middleware
app.use(cors());
app.use(express.json());

// Initialize database connection
models.init().catch(console.error);

// Auth middleware (simplified for now)
const requireAuth = (req, res, next) => {
  // TODO: Implement proper OAuth2 authentication
  // For now, we'll use a simple player_id from headers
  const playerId = req.headers['x-player-id'];
  if (!playerId) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  req.playerId = parseInt(playerId);
  next();
};

// Routes

// Get all games
app.get('/api/games', async (req, res) => {
  try {
    const games = await models.getGames();
    res.json(games);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get riders for a specific year and sex
app.get('/api/riders/:year/:sex', async (req, res) => {
  try {
    const { year, sex } = req.params;
    const filters = {
      nationality: req.query.nationality,
      team: req.query.team,
      maxPrice: req.query.maxPrice ? parseInt(req.query.maxPrice) : null,
      minPrice: req.query.minPrice ? parseInt(req.query.minPrice) : null
    };
    
    const riders = await models.getRiders(parseInt(year), sex, filters);
    res.json(riders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get rider scores
app.get('/api/riders/:year/:sex/scores', async (req, res) => {
  try {
    const { year, sex } = req.params;
    const riderScores = await models.getRiderScores(parseInt(year), sex);
    res.json(riderScores);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get team rankings
app.get('/api/teams/:year/:sex/rankings', async (req, res) => {
  try {
    const { year, sex } = req.params;
    const rankings = await models.getPlayerTeamScores(parseInt(year), sex);
    res.json(rankings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get player's team
app.get('/api/team/:year/:sex', requireAuth, async (req, res) => {
  try {
    const { year, sex } = req.params;
    const team = await models.getPlayerTeam(req.playerId, parseInt(year), sex);
    
    if (!team) {
      return res.json(null);
    }

    const roster = await models.getPlayerTeamRoster(team.team_id);
    res.json({ ...team, roster });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create or update player's team
app.post('/api/team/:year/:sex', requireAuth, async (req, res) => {
  try {
    const { year, sex } = req.params;
    const { team_name, riders } = req.body;

    // Create or update team
    const teamId = await models.createPlayerTeam({
      player_id: req.playerId,
      sex,
      year: parseInt(year),
      team_name
    });

    // Update roster
    const isValid = await models.updatePlayerTeamRoster(teamId, riders, sex, parseInt(year));
    
    // Get updated team
    const team = await models.getPlayerTeam(req.playerId, parseInt(year), sex);
    const roster = await models.getPlayerTeamRoster(teamId);
    
    res.json({ ...team, roster, is_valid: isValid });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get races
app.get('/api/races/:year/:sex', async (req, res) => {
  try {
    const { year, sex } = req.params;
    const races = await models.getRaces(parseInt(year), sex);
    res.json(races);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get race results
app.get('/api/races/:raceId/results', async (req, res) => {
  try {
    const { raceId } = req.params;
    const [results, jerseys] = await Promise.all([
      models.getRaceResults(parseInt(raceId)),
      models.getJerseyHolders(parseInt(raceId))
    ]);
    res.json({ results, jerseys });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Team validation endpoint
app.post('/api/team/:year/:sex/validate', async (req, res) => {
  try {
    const { year, sex } = req.params;
    const { riders } = req.body;

    const riderData = await models.getRidersByNames(parseInt(year), sex, riders);
    
    const validation = {
      isValid: true,
      errors: [],
      warnings: []
    };

    if (sex === 'm') {
      // Men's validation
      if (riders.length !== 25) {
        validation.isValid = false;
        validation.errors.push(`Must have exactly 25 riders (currently ${riders.length})`);
      }

      const totalBudget = riderData.reduce((sum, rider) => sum + rider.price, 0);
      if (totalBudget > 150) {
        validation.isValid = false;
        validation.errors.push(`Budget exceeded: ${totalBudget}/150 points`);
      }

      const highValueRiders = riderData.filter(rider => rider.price >= 18);
      if (highValueRiders.length > 3) {
        validation.isValid = false;
        validation.errors.push(`Too many riders ≥18 points: ${highValueRiders.length}/3 max`);
      }

      const veryHighValueRiders = riderData.filter(rider => rider.price >= 24);
      if (veryHighValueRiders.length > 1) {
        validation.isValid = false;
        validation.errors.push(`Too many riders ≥24 points: ${veryHighValueRiders.length}/1 max`);
      }

    } else if (sex === 'f') {
      // Women's validation
      if (riders.length !== 15) {
        validation.isValid = false;
        validation.errors.push(`Must have exactly 15 riders (currently ${riders.length})`);
      }

      const totalBudget = riderData.reduce((sum, rider) => sum + rider.price, 0);
      if (totalBudget > 150) {
        validation.isValid = false;
        validation.errors.push(`Budget exceeded: ${totalBudget}/150 points`);
      }

      const highValueRiders = riderData.filter(rider => rider.price >= 20);
      const highValueBudget = highValueRiders.reduce((sum, rider) => sum + rider.price, 0);
      if (highValueBudget > 100) {
        validation.isValid = false;
        validation.errors.push(`High-value budget exceeded: ${highValueBudget}/100 points for riders ≥20 points`);
      }
    }

    res.json(validation);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`API server running on port ${PORT}`);
});

module.exports = app;