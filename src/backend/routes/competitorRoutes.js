const express = require('express');
const CompetitorController = require('../controllers/CompetitorController');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/', CompetitorController.getAllCompetitors);
router.get('/games', CompetitorController.getAvailableGames);
router.get('/by-game/:game', CompetitorController.getCompetitorsByGame);
router.get('/:id', CompetitorController.getCompetitorById);

module.exports = router;
