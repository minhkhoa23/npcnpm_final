const Competitor = require('../models/Competitor');
const fs = require('fs');
const path = require('path');

class CompetitorController {
    // Get mock competitors data
    static getMockCompetitors() {
        try {
            const mockDataPath = path.join(__dirname, '../data/competitors.json');
            const mockData = fs.readFileSync(mockDataPath, 'utf8');
            return JSON.parse(mockData);
        } catch (error) {
            console.error('Error reading mock competitors data:', error);
            return [];
        }
    }

    // Get all competitors
    static async getAllCompetitors(req, res) {
        try {
            if (global.mockMode) {
                console.log('Getting competitors from mock data...');
                const competitors = CompetitorController.getMockCompetitors();

                return res.json({
                    success: true,
                    data: { competitors }
                });
            }

            // Database mode
            const competitors = await Competitor.find();
            
            res.json({
                success: true,
                data: { competitors }
            });
        } catch (error) {
            console.error('Get competitors error:', error);
            res.status(500).json({
                success: false,
                message: 'Server error while fetching competitors'
            });
        }
    }

    // Get competitors by game
    static async getCompetitorsByGame(req, res) {
        try {
            const { game } = req.params;
            
            if (!game) {
                return res.status(400).json({
                    success: false,
                    message: 'Game parameter is required'
                });
            }

            if (global.mockMode) {
                console.log(`Getting competitors for game: ${game} from mock data...`);
                const allCompetitors = CompetitorController.getMockCompetitors();
                
                // Filter competitors by game
                const competitors = allCompetitors.filter(competitor => 
                    competitor.games && competitor.games.includes(game)
                );

                return res.json({
                    success: true,
                    data: { competitors },
                    message: `Found ${competitors.length} teams for ${game}`
                });
            }

            // Database mode - filter by game field
            const competitors = await Competitor.find({
                games: { $in: [game] }
            });
            
            res.json({
                success: true,
                data: { competitors },
                message: `Found ${competitors.length} teams for ${game}`
            });
        } catch (error) {
            console.error('Get competitors by game error:', error);
            res.status(500).json({
                success: false,
                message: 'Server error while fetching competitors by game'
            });
        }
    }

    // Get competitor by ID
    static async getCompetitorById(req, res) {
        try {
            const { id } = req.params;

            if (global.mockMode) {
                console.log(`Getting competitor by ID: ${id} from mock data...`);
                const competitors = CompetitorController.getMockCompetitors();
                const competitor = competitors.find(c => c._id === id);

                if (!competitor) {
                    return res.status(404).json({
                        success: false,
                        message: 'Competitor not found'
                    });
                }

                return res.json({
                    success: true,
                    data: { competitor }
                });
            }

            // Database mode
            const competitor = await Competitor.findById(id);
            
            if (!competitor) {
                return res.status(404).json({
                    success: false,
                    message: 'Competitor not found'
                });
            }

            res.json({
                success: true,
                data: { competitor }
            });
        } catch (error) {
            console.error('Get competitor by ID error:', error);
            res.status(500).json({
                success: false,
                message: 'Server error while fetching competitor'
            });
        }
    }

    // Get available games from competitors
    static async getAvailableGames(req, res) {
        try {
            if (global.mockMode) {
                console.log('Getting available games from mock data...');
                const competitors = CompetitorController.getMockCompetitors();
                
                // Extract unique games
                const gamesSet = new Set();
                competitors.forEach(competitor => {
                    if (competitor.games && Array.isArray(competitor.games)) {
                        competitor.games.forEach(game => gamesSet.add(game));
                    }
                });
                
                const games = Array.from(gamesSet).sort();

                return res.json({
                    success: true,
                    data: { games }
                });
            }

            // Database mode - aggregate unique games
            const gamesAggregation = await Competitor.aggregate([
                { $unwind: '$games' },
                { $group: { _id: '$games' } },
                { $sort: { _id: 1 } }
            ]);
            
            const games = gamesAggregation.map(item => item._id);

            res.json({
                success: true,
                data: { games }
            });
        } catch (error) {
            console.error('Get available games error:', error);
            res.status(500).json({
                success: false,
                message: 'Server error while fetching available games'
            });
        }
    }
}

module.exports = CompetitorController;
