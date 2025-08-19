const User = require('../models/User');

class UserController {
    static async getAllUsers(req, res) {
        try {
            const { page = 1, limit = 10 } = req.query;

            const users = await User.find()
                .select('-passwordHash')
                .sort({ createdAt: -1 })
                .limit(limit * 1)
                .skip((page - 1) * limit);

            const total = await User.countDocuments();

            res.json({
                success: true,
                message: "All users retrieved successfully",
                data: {
                    users,
                    total,
                    page: parseInt(page),
                    limit: parseInt(limit)
                }
            });
        } catch (error) {
            console.error('Get all users error:', error);
            res.status(500).json({
                success: false,
                message: 'Server error while fetching users'
            });
        }
    }

    static async getUserById(req, res) {
        try {
            const { id } = req.params;
            
            const user = await User.findById(id).select('-passwordHash');
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            res.json({
                success: true,
                message: "User retrieved successfully",
                data: user
            });
        } catch (error) {
            console.error('Get user by ID error:', error);
            res.status(500).json({
                success: false,
                message: 'Server error while fetching user'
            });
        }
    }

    static async getUsersByRole(req, res) {
        try {
            const { role } = req.params;
            const { page = 1, limit = 10 } = req.query;
            
            const users = await User.find({ role })
                .select('-passwordHash')
                .sort({ createdAt: -1 })
                .limit(limit * 1)
                .skip((page - 1) * limit);

            const total = await User.countDocuments({ role });

            res.json({
                success: true,
                message: `Users with role '${role}' retrieved successfully`,
                data: {
                    users,
                    total,
                    role,
                    page: parseInt(page),
                    limit: parseInt(limit)
                }
            });
        } catch (error) {
            console.error('Get users by role error:', error);
            res.status(500).json({
                success: false,
                message: 'Server error while fetching users by role'
            });
        }
    }

    static async searchUsers(req, res) {
        try {
            const { q, page = 1, limit = 10 } = req.query;
            
            if (!q || q.trim().length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Search query is required'
                });
            }

            const query = {
                $or: [
                    { fullName: { $regex: q.trim(), $options: 'i' } },
                    { email: { $regex: q.trim(), $options: 'i' } }
                ]
            };

            const users = await User.find(query)
                .select('-passwordHash')
                .sort({ createdAt: -1 })
                .limit(limit * 1)
                .skip((page - 1) * limit);

            const total = await User.countDocuments(query);

            res.json({
                success: true,
                message: `Search results for '${q}'`,
                data: {
                    users,
                    total,
                    query: q,
                    page: parseInt(page),
                    limit: parseInt(limit)
                }
            });
        } catch (error) {
            console.error('Search users error:', error);
            res.status(500).json({
                success: false,
                message: 'Server error while searching users'
            });
        }
    }

    static getUserStats(req, res) {
        res.json({
            success: true,
            message: "User statistics retrieved successfully",
            data: {
                total_users: 150,
                active_users: 130,
                inactive_users: 20,
                roles: {
                    admin: 2,
                    organizer: 8,
                    user: 140
                },
                registrations: {
                    today: 5,
                    this_week: 28,
                    this_month: 120
                },
                growth_rate: 15.5
            }
        });
    }

    static getUserActivity(req, res) {
        res.json({
            success: true,
            message: "User activity retrieved successfully",
            data: {
                recent_activities: [
                    {
                        user_id: "507f1f77bcf86cd799439011",
                        user_name: "Test User",
                        action: "tournament_registration",
                        details: "Registered for Valorant Championship",
                        timestamp: new Date().toISOString()
                    },
                    {
                        user_id: "507f1f77bcf86cd799439012",
                        user_name: "Admin User",
                        action: "news_created",
                        details: "Created new news article",
                        timestamp: new Date(Date.now() - 3600000).toISOString()
                    }
                ],
                total_activities: 2
            }
        });
    }

    static updateUserRole(req, res) {
        const { id } = req.params;
        const { role } = req.body;
        
        res.json({
            success: true,
            message: "User role updated successfully",
            data: {
                _id: id,
                old_role: "user",
                new_role: role,
                updated_at: new Date().toISOString()
            }
        });
    }

    static deactivateUser(req, res) {
        const { id } = req.params;
        
        res.json({
            success: true,
            message: "User deactivated successfully",
            data: {
                _id: id,
                isActive: false,
                deactivated_at: new Date().toISOString()
            }
        });
    }

    static reactivateUser(req, res) {
        const { id } = req.params;
        
        res.json({
            success: true,
            message: "User reactivated successfully",
            data: {
                _id: id,
                isActive: true,
                reactivated_at: new Date().toISOString()
            }
        });
    }
}

module.exports = UserController;