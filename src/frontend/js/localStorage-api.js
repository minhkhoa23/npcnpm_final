// localStorage-based API system for static hosting
// Simulates backend functionality without requiring a server

class LocalStorageAPI {
    constructor() {
        this.isInitialized = false;
        this.initializeData();
    }

    // Initialize data from JSON files or create default data
    async initializeData() {
        if (this.isInitialized) {
            console.log('✅ LocalStorage already initialized');
            return;
        }

        console.log('🔧 Initializing localStorage database...');
        
        // Load initial data if not exists
        if (!localStorage.getItem('tournament_users')) {
            try {
                // Try to load users from JSON file
                console.log('🔄 Attempting to load users from JSON file...');
                const response = await fetch('./src/backend/data/users.json');
                console.log('📡 JSON fetch response status:', response.status);

                if (!response.ok) {
                    throw new Error(`Failed to fetch users: ${response.status}`);
                }

                const users = await response.json();
                console.log(`📊 Loaded ${users.length} users from JSON file`);
                console.log('👥 Sample emails:', users.slice(0, 3).map(u => u.email));

                localStorage.setItem('tournament_users', JSON.stringify(users));
                console.log('💾 Users saved to localStorage');
            } catch (error) {
                console.error('❌ Failed to load users from JSON file:', error.message);
                console.log('🔧 Creating default users...');

                // Create default users if file doesn't exist
                const defaultUsers = [
                    {
                        "_id": "507f1f77bcf86cd799439021",
                        "email": "admin@esport.com",
                        "passwordHash": "$2a$10$E2rvKVx5sLG7DUyvlJU8TeT8Z7W1YYK3QRyiYBulX5TmgfUYUoTZq",
                        "role": "admin",
                        "fullName": "Nguyễn Văn Admin",
                        "avatarUrl": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
                    },
                    {
                        "_id": "507f1f77bcf86cd799439022",
                        "email": "organizer@esport.com",
                        "passwordHash": "$2a$10$mrKVDpEDabGMOCB8SWrTveBo9YF4cjtZj8XzzbJnhHhqPFGKVhfTC",
                        "role": "organizer",
                        "fullName": "Trần Thị Organizer",
                        "avatarUrl": "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face"
                    },
                    {
                        "_id": "507f1f77bcf86cd799439023",
                        "email": "player1@esport.com",
                        "passwordHash": "$2b$10$abc123def456ghi789jkl012mno345pqr678stu901vwx234yz",
                        "role": "user",
                        "fullName": "Lê Văn Player",
                        "avatarUrl": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face"
                    }
                ];
                localStorage.setItem('tournament_users', JSON.stringify(defaultUsers));
                console.log('👥 Created default users');
            }
        }

        if (!localStorage.getItem('tournament_tournaments')) {
            try {
                const response = await fetch('./src/backend/data/tournaments.json');
                const tournaments = await response.json();
                localStorage.setItem('tournament_tournaments', JSON.stringify(tournaments));
                console.log('🏆 Loaded tournaments from JSON file');
            } catch (error) {
                localStorage.setItem('tournament_tournaments', JSON.stringify([]));
                console.log('🏆 Created empty tournaments array');
            }
        }

        if (!localStorage.getItem('tournament_news')) {
            try {
                const response = await fetch('./src/backend/data/news.json');
                const news = await response.json();
                localStorage.setItem('tournament_news', JSON.stringify(news));
                console.log('📰 Loaded news from JSON file');
            } catch (error) {
                localStorage.setItem('tournament_news', JSON.stringify([]));
                console.log('📰 Created empty news array');
            }
        }

        if (!localStorage.getItem('tournament_competitors')) {
            try {
                const response = await fetch('./src/backend/data/competitors.json');
                const competitors = await response.json();
                localStorage.setItem('tournament_competitors', JSON.stringify(competitors));
                console.log('👥 Loaded competitors from JSON file');
            } catch (error) {
                localStorage.setItem('tournament_competitors', JSON.stringify([]));
                console.log('👥 Created empty competitors array');
            }
        }

        if (!localStorage.getItem('tournament_highlights')) {
            try {
                const response = await fetch('./src/backend/data/highlights.json');
                const highlights = await response.json();
                localStorage.setItem('tournament_highlights', JSON.stringify(highlights));
                console.log('🎬 Loaded highlights from JSON file');
            } catch (error) {
                localStorage.setItem('tournament_highlights', JSON.stringify([]));
                console.log('🎬 Created empty highlights array');
            }
        }

        console.log('✅ LocalStorage database initialized');
    }

    // Generate unique ID
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // Get data from localStorage
    getData(key) {
        const data = localStorage.getItem(`tournament_${key}`);
        return data ? JSON.parse(data) : [];
    }

    // Save data to localStorage
    saveData(key, data) {
        localStorage.setItem(`tournament_${key}`, JSON.stringify(data));
        console.log(`💾 Saved ${key} data to localStorage`);
    }

    // Hash password (simple hash for demo - in production use proper bcrypt)
    async hashPassword(password) {
        // Simple hash simulation - in real app use bcrypt
        const encoder = new TextEncoder();
        const data = encoder.encode(password + 'tournament_salt');
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    // Verify password
    async verifyPassword(password, hash) {
        const inputHash = await this.hashPassword(password);
        return inputHash === hash;
    }

    // Auth endpoints
    async register(userData) {
        const { email, fullName, password, role = 'user' } = userData;
        
        // Validate required fields
        if (!email || !fullName || !password) {
            throw new Error('Email, full name, and password are required');
        }

        // Validate role
        const validRoles = ['user', 'organizer', 'admin'];
        if (!validRoles.includes(role)) {
            throw new Error('Invalid role. Must be user, organizer, or admin');
        }

        const users = this.getData('users');
        
        // Check if user already exists
        if (users.find(user => user.email === email)) {
            throw new Error('User with this email already exists');
        }

        // Hash password
        const passwordHash = await this.hashPassword(password);

        // Create new user
        const newUser = {
            _id: this.generateId(),
            email,
            fullName,
            passwordHash,
            role,
            avatarUrl: `https://images.unsplash.com/photo-${Math.floor(Math.random() * 1000000)}?w=150&h=150&fit=crop&crop=face`,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        users.push(newUser);
        this.saveData('users', users);

        // Generate token
        const token = btoa(JSON.stringify({ userId: newUser._id, role: newUser.role }));

        return {
            success: true,
            message: 'User registered successfully',
            data: {
                user: { ...newUser, passwordHash: undefined },
                token
            }
        };
    }

    async login(credentials) {
        const { email, password } = credentials;

        if (!email || !password) {
            throw new Error('Email and password are required');
        }

        // Make sure data is initialized
        await this.initializeData();

        const users = this.getData('users');
        console.log(`🔍 Login attempt for: ${email}`);
        console.log(`📊 Total users in database: ${users.length}`);
        console.log(`👥 Available emails:`, users.map(u => u.email));

        const user = users.find(u => u.email === email);

        if (!user) {
            console.error(`❌ User not found: ${email}`);
            throw new Error('Tài khoản không tồn tại. Vui lòng kiểm tra lại email hoặc đăng ký tài khoản mới.');
        }

        console.log(`✅ User found: ${user.fullName} (${user.role})`);

        // Verify password
        const isValid = await this.verifyPassword(password, user.passwordHash);
        if (!isValid) {
            console.error(`❌ Password verification failed for: ${email}`);
            throw new Error('Mật khẩu không đúng. Vui lòng nhập lại mật khẩu.');
        }

        console.log(`🎉 Login successful for: ${email}`);

        // Generate token
        const token = btoa(JSON.stringify({ userId: user._id, role: user.role }));

        return {
            success: true,
            message: 'Login successful',
            data: {
                user: { ...user, passwordHash: undefined },
                token
            }
        };
    }

    // Get user profile by token
    async getUserProfile(token) {
        if (!token) {
            throw new Error('Authentication token is required');
        }

        try {
            // Decode token
            const decoded = JSON.parse(atob(token));
            const userId = decoded.userId;

            const users = this.getData('users');
            const user = users.find(u => u._id === userId);

            if (!user) {
                throw new Error('User not found');
            }

            return {
                success: true,
                data: {
                    user: { ...user, passwordHash: undefined }
                }
            };
        } catch (error) {
            throw new Error('Invalid token');
        }
    }

    // Update user profile
    async updateUserProfile(userId, updateData, token) {
        if (!token) {
            throw new Error('Authentication token is required');
        }

        try {
            // Verify token
            const decoded = JSON.parse(atob(token));
            if (decoded.userId !== userId) {
                throw new Error('Unauthorized: Cannot update other user profile');
            }

            const users = this.getData('users');
            const userIndex = users.findIndex(u => u._id === userId);

            if (userIndex === -1) {
                throw new Error('User not found');
            }

            // Update user data
            users[userIndex] = {
                ...users[userIndex],
                ...updateData,
                _id: userId, // Ensure ID doesn't change
                updatedAt: new Date().toISOString()
            };

            this.saveData('users', users);

            return {
                success: true,
                message: 'Profile updated successfully',
                data: {
                    user: { ...users[userIndex], passwordHash: undefined }
                }
            };
        } catch (error) {
            throw new Error('Failed to update profile: ' + error.message);
        }
    }

    // Tournament endpoints
    async createTournament(tournamentData) {
        const tournaments = this.getData('tournaments');
        
        const newTournament = {
            _id: this.generateId(),
            ...tournamentData,
            numberOfPlayers: 0,
            status: 'upcoming',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            participants: []
        };

        tournaments.push(newTournament);
        this.saveData('tournaments', tournaments);

        return {
            success: true,
            message: 'Tournament created successfully',
            data: { tournament: newTournament }
        };
    }

    async getTournaments(filters = {}) {
        const tournaments = this.getData('tournaments');
        let filtered = [...tournaments];

        if (filters.status) {
            filtered = filtered.filter(t => t.status === filters.status);
        }

        if (filters.game) {
            filtered = filtered.filter(t => t.gameName === filters.game);
        }

        return {
            success: true,
            data: { tournaments: filtered }
        };
    }

    async getUpcomingTournaments() {
        const tournaments = this.getData('tournaments');
        const now = new Date();
        
        const upcoming = tournaments.filter(tournament => {
            const startDate = tournament.startDate ? new Date(tournament.startDate) : new Date(Date.now() + 24 * 60 * 60 * 1000);
            return tournament.status === 'upcoming' && startDate >= now;
        });

        return {
            success: true,
            data: { tournaments: upcoming }
        };
    }

    // Logout (clear token)
    async logout() {
        return {
            success: true,
            message: 'Logged out successfully'
        };
    }

    // Get all news
    async getNews() {
        const news = this.getData('news');
        const published = news
            .filter(article => article.status === 'public' || article.isPublished || article.status === 'published')
            .sort((a, b) => new Date(b.createdAt || b.publishedAt) - new Date(a.createdAt || a.publishedAt));

        return {
            success: true,
            data: { news: published }
        };
    }

    // Tournament methods
    async updateTournament(id, updateData) {
        const tournaments = this.getData('tournaments');
        const index = tournaments.findIndex(t => t._id === id);

        if (index === -1) {
            throw new Error('Tournament not found');
        }

        tournaments[index] = {
            ...tournaments[index],
            ...updateData,
            updatedAt: new Date().toISOString()
        };

        this.saveData('tournaments', tournaments);

        return {
            success: true,
            message: 'Tournament updated successfully',
            data: { tournament: tournaments[index] }
        };
    }

    async deleteTournament(id) {
        const tournaments = this.getData('tournaments');
        const index = tournaments.findIndex(t => t._id === id);

        if (index === -1) {
            throw new Error('Tournament not found');
        }

        tournaments.splice(index, 1);
        this.saveData('tournaments', tournaments);

        return {
            success: true,
            message: 'Tournament deleted successfully'
        };
    }

    // News endpoints
    async createNews(newsData) {
        const news = this.getData('news');

        const newNews = {
            _id: this.generateId(),
            ...newsData,
            status: 'public',
            publishedAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            views: 0,
            likes: 0,
            comments: []
        };

        news.push(newNews);
        this.saveData('news', news);

        return {
            success: true,
            message: 'News article created successfully',
            data: { news: newNews }
        };
    }

    async updateNews(id, updateData) {
        const news = this.getData('news');
        const index = news.findIndex(n => n._id === id);

        if (index === -1) {
            throw new Error('News article not found');
        }

        news[index] = {
            ...news[index],
            ...updateData,
            updatedAt: new Date().toISOString()
        };

        this.saveData('news', news);

        return {
            success: true,
            message: 'News article updated successfully',
            data: { news: news[index] }
        };
    }

    async deleteNews(id) {
        const news = this.getData('news');
        const index = news.findIndex(n => n._id === id);

        if (index === -1) {
            throw new Error('News article not found');
        }

        news.splice(index, 1);
        this.saveData('news', news);

        return {
            success: true,
            message: 'News article deleted successfully'
        };
    }

    async getFeaturedNews() {
        const news = this.getData('news');
        
        const featured = news
            .filter(article => article.status === 'public' || article.isPublished)
            .sort((a, b) => new Date(b.createdAt || b.publishedAt) - new Date(a.createdAt || a.publishedAt))
            .slice(0, 5);

        return {
            success: true,
            data: { news: featured }
        };
    }

    // Highlights endpoints
    async createHighlight(highlightData) {
        const highlights = this.getData('highlights');

        const newHighlight = {
            _id: this.generateId(),
            ...highlightData,
            status: 'published',
            featured: false,
            views: 0,
            likes: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        highlights.push(newHighlight);
        this.saveData('highlights', highlights);

        return {
            success: true,
            message: 'Highlight created successfully',
            data: { highlight: newHighlight }
        };
    }

    async getPublishedHighlights() {
        const highlights = this.getData('highlights');

        // Filter for both 'published' and 'public' status (handle different data formats)
        const published = highlights
            .filter(highlight => highlight.status === 'published' || highlight.status === 'public')
            .sort((a, b) => {
                const dateA = new Date(a.createdAt || a.publishedAt || '2024-01-01');
                const dateB = new Date(b.createdAt || b.publishedAt || '2024-01-01');
                return dateB - dateA;
            })
            .slice(0, 10)
            .map(highlight => ({
                ...highlight,
                // Ensure consistent format
                status: 'published',
                createdAt: highlight.createdAt || highlight.publishedAt || new Date().toISOString(),
                views: highlight.views || Math.floor(Math.random() * 10000),
                likes: highlight.likes || Math.floor(Math.random() * 1000)
            }));

        console.log(`📺 Found ${published.length} published highlights`);

        return {
            success: true,
            data: { highlights: published }
        };
    }

    // Get all highlights (alias for getPublishedHighlights)
    async getHighlights() {
        return await this.getPublishedHighlights();
    }

    // Get featured highlights
    async getFeaturedHighlights() {
        const highlights = this.getData('highlights');

        const featured = highlights
            .filter(highlight =>
                (highlight.status === 'published' || highlight.status === 'public') &&
                (highlight.featured === true || highlight.isFeatured === true)
            )
            .sort((a, b) => new Date(b.createdAt || b.publishedAt) - new Date(a.createdAt || a.publishedAt))
            .slice(0, 5)
            .map(highlight => ({
                ...highlight,
                status: 'published',
                featured: true,
                views: highlight.views || Math.floor(Math.random() * 15000),
                likes: highlight.likes || Math.floor(Math.random() * 2000)
            }));

        return {
            success: true,
            data: { highlights: featured }
        };
    }

    // Highlight CRUD methods
    async updateHighlight(id, updateData) {
        const highlights = this.getData('highlights');
        const index = highlights.findIndex(h => h._id === id);

        if (index === -1) {
            throw new Error('Highlight not found');
        }

        highlights[index] = {
            ...highlights[index],
            ...updateData,
            updatedAt: new Date().toISOString()
        };

        this.saveData('highlights', highlights);

        return {
            success: true,
            message: 'Highlight updated successfully',
            data: { highlight: highlights[index] }
        };
    }

    async deleteHighlight(id) {
        const highlights = this.getData('highlights');
        const index = highlights.findIndex(h => h._id === id);

        if (index === -1) {
            throw new Error('Highlight not found');
        }

        highlights.splice(index, 1);
        this.saveData('highlights', highlights);

        return {
            success: true,
            message: 'Highlight deleted successfully'
        };
    }

    // Competitors endpoints
    async getCompetitors() {
        const competitors = this.getData('competitors');
        return {
            success: true,
            data: { competitors }
        };
    }

    async getCompetitorsByGame(game) {
        const competitors = this.getData('competitors');
        const filtered = competitors.filter(competitor => 
            competitor.games && competitor.games.includes(game)
        );

        return {
            success: true,
            data: { competitors: filtered },
            message: `Found ${filtered.length} teams for ${game}`
        };
    }

    // Health check
    async health() {
        return {
            success: true,
            message: 'Tournament Management System API is running',
            timestamp: new Date().toISOString(),
            environment: 'localStorage'
        };
    }
}

// Create global instance
window.localStorageAPI = new LocalStorageAPI();

export default LocalStorageAPI;
