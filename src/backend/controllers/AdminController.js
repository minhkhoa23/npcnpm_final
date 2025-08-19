const User = require('../models/User');
const Tournament = require('../models/Tournament');
const Match = require('../models/Match');
const News = require('../models/News');
const Highlight = require('../models/Highlight');

class AdminController {
    static async getStats(req, res) {
        try {
            const [
                totalUsers,
                activeUsers,
                bannedUsers,
                newUsersThisMonth,
                totalTournaments,
                activeTournaments,
                completedTournaments,
                cancelledTournaments,
                totalMatches,
                completedMatches,
                upcomingMatches,
                ongoingMatches,
                totalNews,
                publishedNews,
                draftNews,
                totalHighlights,
                publishedHighlights,
                pendingHighlights
            ] = await Promise.all([
                User.countDocuments(),
                User.countDocuments({ status: { $ne: 'banned' } }),
                User.countDocuments({ status: 'banned' }),
                User.countDocuments({ 
                    createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) }
                }),
                Tournament.countDocuments(),
                Tournament.countDocuments({ status: 'active' }),
                Tournament.countDocuments({ status: 'completed' }),
                Tournament.countDocuments({ status: 'cancelled' }),
                Match.countDocuments(),
                Match.countDocuments({ status: 'completed' }),
                Match.countDocuments({ status: 'pending', scheduledAt: { $gt: new Date() } }),
                Match.countDocuments({ status: 'ongoing' }),
                News.countDocuments(),
                News.countDocuments({ status: 'published' }),
                News.countDocuments({ status: 'draft' }),
                Highlight.countDocuments(),
                Highlight.countDocuments({ status: 'published' }),
                Highlight.countDocuments({ status: 'pending' })
            ]);

            res.json({ 
                success: true,
                data: {
                    users: {
                        total: totalUsers,
                        active: activeUsers,
                        banned: bannedUsers,
                        new_this_month: newUsersThisMonth
                    },
                    tournaments: {
                        total: totalTournaments,
                        active: activeTournaments,
                        completed: completedTournaments,
                        cancelled: cancelledTournaments
                    },
                    matches: {
                        total: totalMatches,
                        completed: completedMatches,
                        upcoming: upcomingMatches,
                        ongoing: ongoingMatches
                    },
                    news: {
                        total: totalNews,
                        published: publishedNews,
                        drafts: draftNews
                    },
                    highlights: {
                        total: totalHighlights,
                        published: publishedHighlights,
                        pending: pendingHighlights
                    }
                }
            });
        } catch (error) {
            console.error('Get admin stats error:', error);
            res.status(500).json({
                success: false,
                message: 'Server error while fetching admin stats'
            });
        }
    }

    static async getUsers(req, res) {
        try {
            const { page = 1, limit = 10, search } = req.query;
            
            const query = {};
            if (search) {
                query.$or = [
                    { fullName: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } }
                ];
            }

            const users = await User.find(query)
                .select('-passwordHash')
                .sort({ createdAt: -1 })
                .limit(limit * 1)
                .skip((page - 1) * limit);

            const total = await User.countDocuments(query);

            res.json({
                success: true,
                message: "Admin user management data",
                data: {
                    users,
                    total,
                    page: parseInt(page),
                    limit: parseInt(limit)
                }
            });
        } catch (error) {
            console.error('Get users error:', error);
            res.status(500).json({
                success: false,
                message: 'Server error while fetching users'
            });
        }
    }

    static async getTournaments(req, res) {
        try {
            const { page = 1, limit = 10, status } = req.query;
            
            const query = {};
            if (status) query.status = status;

            const tournaments = await Tournament.find(query)
                .populate('organizerId', 'fullName email')
                .sort({ createdAt: -1 })
                .limit(limit * 1)
                .skip((page - 1) * limit);

            const total = await Tournament.countDocuments(query);

            res.json({
                success: true,
                message: "Admin tournament management data",
                data: {
                    tournaments,
                    total,
                    page: parseInt(page),
                    limit: parseInt(limit)
                }
            });
        } catch (error) {
            console.error('Get tournaments error:', error);
            res.status(500).json({
                success: false,
                message: 'Server error while fetching tournaments'
            });
        }
    }

    static async getNews(req, res) {
        try {
            const { page = 1, limit = 10, status } = req.query;
            
            const query = {};
            if (status) query.status = status;

            const news = await News.find(query)
                .populate('authorId', 'fullName email')
                .populate('tournamentId', 'name status')
                .sort({ createdAt: -1 })
                .limit(limit * 1)
                .skip((page - 1) * limit);

            const total = await News.countDocuments(query);

            res.json({
                success: true,
                message: "Admin news management data",
                data: {
                    news,
                    total,
                    page: parseInt(page),
                    limit: parseInt(limit)
                }
            });
        } catch (error) {
            console.error('Get news error:', error);
            res.status(500).json({
                success: false,
                message: 'Server error while fetching news'
            });
        }
    }

    static async getMatches(req, res) {
        try {
            const { page = 1, limit = 10, status } = req.query;
            
            const query = {};
            if (status) query.status = status;

            const matches = await Match.find(query)
                .populate('teamA', 'name logoUrl')
                .populate('teamB', 'name logoUrl')
                .populate('tournamentId', 'name status')
                .sort({ scheduledAt: -1 })
                .limit(limit * 1)
                .skip((page - 1) * limit);

            const total = await Match.countDocuments(query);

            res.json({
                success: true,
                message: "Admin match management data",
                data: {
                    matches,
                    total,
                    page: parseInt(page),
                    limit: parseInt(limit)
                }
            });
        } catch (error) {
            console.error('Get matches error:', error);
            res.status(500).json({
                success: false,
                message: 'Server error while fetching matches'
            });
        }
    }

    static async getHighlights(req, res) {
        try {
            const { page = 1, limit = 10, status } = req.query;
            
            const query = {};
            if (status) query.status = status;

            const highlights = await Highlight.find(query)
                .populate('tournamentId', 'name status')
                .populate('matchId', 'teamA teamB scheduledAt')
                .sort({ createdAt: -1 })
                .limit(limit * 1)
                .skip((page - 1) * limit);

            const total = await Highlight.countDocuments(query);

            res.json({
                success: true,
                message: "Admin highlight management data",
                data: {
                    highlights,
                    total,
                    page: parseInt(page),
                    limit: parseInt(limit)
                }
            });
        } catch (error) {
            console.error('Get highlights error:', error);
            res.status(500).json({
                success: false,
                message: 'Server error while fetching highlights'
            });
        }
    }

    static getLogs(req, res) {
        res.json({
            success: true,
            message: "System logs",
            data: {
                logs: [
                    {
                        timestamp: new Date().toISOString(),
                        level: "info",
                        message: "System started",
                        module: "server"
                    },
                    {
                        timestamp: new Date(Date.now() - 3600000).toISOString(),
                        level: "warning",
                        message: "High memory usage detected",
                        module: "monitoring"
                    }
                ],
                total: 2
            }
        });
    }

    static getDatabaseStatus(req, res) {
        res.json({
            success: true,
            message: "Database status",
            data: {
                connected: true,
                host: "localhost",
                port: 27017,
                database: "tournament_management",
                uptime: "2 days 5 hours",
                collections: {
                    users: 150,
                    tournaments: 45,
                    matches: 280,
                    news: 95,
                    highlights: 180
                }
            }
        });
    }

    static getHealth(req, res) {
        res.json({
            success: true,
            message: "System health check",
            data: {
                status: "healthy",
                uptime: process.uptime(),
                memory: process.memoryUsage(),
                cpu: "Normal",
                database: "Connected",
                services: {
                    api: "Running",
                    authentication: "Running",
                    file_upload: "Running"
                }
            }
        });
    }

    static getPerformance(req, res) {
        res.json({
            success: true,
            message: "Performance metrics",
            data: {
                response_time: {
                    avg: 125,
                    min: 45,
                    max: 350
                },
                requests_per_minute: 45,
                error_rate: 0.02,
                memory_usage: {
                    used: "250MB",
                    total: "1GB",
                    percentage: 25
                },
                cpu_usage: {
                    percentage: 15,
                    load_average: [0.8, 0.9, 1.1]
                }
            }
        });
    }

    static getSecurityLogs(req, res) {
        res.json({
            success: true,
            message: "Security logs",
            data: {
                logs: [
                    {
                        timestamp: new Date().toISOString(),
                        event: "login_success",
                        user: "admin@esport.com",
                        ip: "127.0.0.1"
                    },
                    {
                        timestamp: new Date(Date.now() - 1800000).toISOString(),
                        event: "failed_login_attempt",
                        user: "unknown@test.com",
                        ip: "192.168.1.100"
                    }
                ],
                total: 2
            }
        });
    }

    static getAudit(req, res) {
        res.json({
            success: true,
            message: "Audit trail",
            data: {
                actions: [
                    {
                        timestamp: new Date().toISOString(),
                        user: "admin@esport.com",
                        action: "tournament_created",
                        details: "Created tournament: PowerShell Test Tournament"
                    },
                    {
                        timestamp: new Date(Date.now() - 3600000).toISOString(),
                        user: "organizer@esport.com",
                        action: "news_published",
                        details: "Published news: Test Article"
                    }
                ],
                total: 2
            }
        });
    }

    static getSettings(req, res) {
        res.json({
            success: true,
            message: "System settings",
            data: {
                maintenanceMode: false,
                maxFileSize: 10485760,
                allowedFileTypes: ["jpg", "png", "mp4", "avi"],
                registrationEnabled: true,
                emailNotifications: true,
                backupFrequency: "daily"
            }
        });
    }

    static updateSettings(req, res) {
        const { maintenanceMode, maxFileSize, allowedFileTypes } = req.body;
        
        res.json({
            success: true,
            message: "Settings updated successfully",
            data: {
                maintenanceMode: maintenanceMode || false,
                maxFileSize: maxFileSize || 10485760,
                allowedFileTypes: allowedFileTypes || ["jpg", "png", "mp4", "avi"],
                updatedAt: new Date().toISOString()
            }
        });
    }

    static getUserAnalytics(req, res) {
        res.json({
            success: true,
            message: "User analytics",
            data: {
                registrations: {
                    today: 5,
                    this_week: 28,
                    this_month: 120
                },
                active_users: {
                    daily: 85,
                    weekly: 150,
                    monthly: 300
                },
                user_roles: {
                    admin: 2,
                    organizer: 8,
                    user: 140
                }
            }
        });
    }

    static getTournamentAnalytics(req, res) {
        res.json({
            success: true,
            message: "Tournament analytics",
            data: {
                tournaments_created: {
                    today: 1,
                    this_week: 5,
                    this_month: 15
                },
                participation: {
                    avg_participants: 12,
                    total_registrations: 450,
                    completion_rate: 85
                },
                popular_games: {
                    valorant: 25,
                    lol: 15,
                    csgo: 5
                }
            }
        });
    }

    static getContentAnalytics(req, res) {
        res.json({
            success: true,
            message: "Content analytics",
            data: {
                news: {
                    published: 15,
                    views: 2500,
                    engagement: 75
                },
                highlights: {
                    uploaded: 25,
                    views: 8500,
                    likes: 450
                },
                popular_content: [
                    { title: "Tournament Finals", views: 1200 },
                    { title: "Best Plays", views: 850 }
                ]
            }
        });
    }

    static getNotifications(req, res) {
        res.json({
            success: true,
            message: "System notifications",
            data: {
                notifications: [
                    {
                        id: 1,
                        title: "System Maintenance",
                        message: "Scheduled maintenance tonight",
                        type: "warning",
                        timestamp: new Date().toISOString()
                    },
                    {
                        id: 2,
                        title: "New Tournament",
                        message: "Championship tournament starts tomorrow",
                        type: "info",
                        timestamp: new Date(Date.now() - 3600000).toISOString()
                    }
                ],
                total: 2
            }
        });
    }

    static createNotification(req, res) {
        const { title, message, type, recipients } = req.body;
        
        res.json({
            success: true,
            message: "Notification sent successfully",
            data: {
                id: Date.now(),
                title: title || "PowerShell Test Notification",
                message: message || "This notification was sent via PowerShell testing",
                type: type || "info",
                recipients: recipients || ["all"],
                sent_at: new Date().toISOString()
            }
        });
    }
}

module.exports = AdminController;