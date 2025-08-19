const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { generateToken, generateRefreshToken } = require('../utils/jwt');
const fs = require('fs');
const path = require('path');

class AuthController {
    // Get mock users data
    static getMockUsers() {
        try {
            const mockDataPath = path.join(__dirname, '../data/users.json');
            const mockData = fs.readFileSync(mockDataPath, 'utf8');
            return JSON.parse(mockData);
        } catch (error) {
            console.error('Error reading mock users data:', error);
            return [];
        }
    }

    // Find mock user by email
    static findMockUser(email) {
        const mockUsers = this.getMockUsers();
        return mockUsers.find(user => user.email === email);
    }

    // Store mock users in memory for authentication middleware
    static storeMockUserInMemory(userId, userData) {
        if (!global.mockUsers) {
            global.mockUsers = new Map();
        }
        global.mockUsers.set(userId, userData);
    }

    // Register new user
    static async register(req, res) {
        try {
            const { email, fullName, password, role = 'user' } = req.body;

            // Validate required fields
            if (!email || !fullName || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'Email, full name, and password are required'
                });
            }

            // Validate email format
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid email format'
                });
            }

            // Validate password strength
            if (password.length < 6) {
                return res.status(400).json({
                    success: false,
                    message: 'Password must be at least 6 characters long'
                });
            }

            // Validate role
            const validRoles = ['user', 'organizer', 'admin'];
            if (!validRoles.includes(role)) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid role. Must be user, organizer, or admin'
                });
            }

            // Check if user already exists in database
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({
                    success: false,
                    message: 'User with this email already exists'
                });
            }

            // Hash password
            const passwordHash = await bcrypt.hash(password, 10);

            // Create new user in database
            const newUser = new User({
                email,
                fullName,
                passwordHash,
                role,
                avatarUrl: `https://images.unsplash.com/photo-${Math.floor(Math.random() * 1000000)}?w=150&h=150&fit=crop&crop=face`
            });

            await newUser.save();
            console.log('User created in database:', { email, fullName, role });

            // Generate tokens
            const token = generateToken(newUser._id);
            const refreshToken = generateRefreshToken(newUser._id);

            // Remove password from response
            const userResponse = { ...newUser };
            delete userResponse.passwordHash;

            res.status(201).json({
                success: true,
                message: 'User registered successfully',
                data: {
                    user: userResponse,
                    token,
                    refreshToken
                }
            });
        } catch (error) {
            console.error('Registration error:', error);
            res.status(500).json({
                success: false,
                message: 'Server error during registration'
            });
        }
    }

    // Login user
    static async login(req, res) {
        try {
            const { email, password } = req.body;

            // Validate required fields
            if (!email || !password) {
                return res.status(400).json({
                    success: false,
                    message: 'Email and password are required'
                });
            }

            // Find user in database
            const dbUser = await User.findOne({ email });
            
            if (!dbUser) {
                return res.status(401).json({
                    success: false,
                    message: 'Tài khoản không tồn tại. Vui lòng kiểm tra lại email hoặc đăng ký tài khoản mới.'
                });
            }

            // Verify password using bcrypt
            const isPasswordValid = await bcrypt.compare(password, dbUser.passwordHash);
            
            if (!isPasswordValid) {
                return res.status(401).json({
                    success: false,
                    message: 'Mật khẩu không đúng. Vui lòng nhập lại mật khẩu.'
                });
            }

            // Create user object for response
            const user = {
                _id: dbUser._id,
                email: dbUser.email,
                fullName: dbUser.fullName,
                role: dbUser.role,
                avatarUrl: dbUser.avatarUrl
            };

            // Generate tokens with role information
            const token = generateToken(user._id, user.role);
            const refreshToken = generateRefreshToken(user._id);

            return res.json({
                success: true,
                message: 'Login successful',
                data: {
                    user,
                    token,
                    refreshToken
                }
            });

        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({
                success: false,
                message: 'Server error during login'
            });
        }
    }

    // Get current user profile
    static async getProfile(req, res) {
        try {
            const user = await User.findById(req.user._id);

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            res.json({
                success: true,
                data: { user }
            });
        } catch (error) {
            console.error('Get profile error:', error);
            res.status(500).json({
                success: false,
                message: 'Server error while fetching profile'
            });
        }
    }

    // Update user profile
    static async updateProfile(req, res) {
        try {
            const { fullName, avatarUrl } = req.body;
            const updateData = {};

            if (fullName) updateData.fullName = fullName;
            if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl;

            const user = await User.findByIdAndUpdate(
                req.user._id,
                updateData,
                { new: true, runValidators: true }
            );

            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            res.json({
                success: true,
                message: 'Profile updated successfully',
                data: { user }
            });
        } catch (error) {
            console.error('Update profile error:', error);

            if (error.name === 'ValidationError') {
                const errors = Object.values(error.errors).map(err => err.message);
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors
                });
            }

            res.status(500).json({
                success: false,
                message: 'Server error while updating profile'
            });
        }
    }

    // Change password
    static async changePassword(req, res) {
        try {
            const { currentPassword, newPassword } = req.body;

            if (!currentPassword || !newPassword) {
                return res.status(400).json({
                    success: false,
                    message: 'Current password and new password are required'
                });
            }

            // Get user with password
            const user = await User.findById(req.user._id);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: 'User not found'
                });
            }

            // Verify current password
            const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
            if (!isCurrentPasswordValid) {
                return res.status(400).json({
                    success: false,
                    message: 'Current password is incorrect'
                });
            }

            // Update password
            user.passwordHash = await bcrypt.hash(newPassword, 10);
            await user.save();

            res.json({
                success: true,
                message: 'Password changed successfully'
            });
        } catch (error) {
            console.error('Change password error:', error);
            res.status(500).json({
                success: false,
                message: 'Server error while changing password'
            });
        }
    }

    // Logout (in a stateless JWT system, this is mainly for client-side)
    static async logout(req, res) {
        try {
            // In a more sophisticated system, you might want to blacklist the token
            res.json({
                success: true,
                message: 'Logged out successfully'
            });
        } catch (error) {
            console.error('Logout error:', error);
            res.status(500).json({
                success: false,
                message: 'Server error during logout'
            });
        }
    }
}

module.exports = AuthController;