// API Configuration - auto-detect environment
const API_BASE_URL = (() => {
    // If running on localhost, use localhost:3000
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        return 'http://localhost:3000/api';
    }
    // Otherwise use relative URL (works in cloud environments)
    return '/api';
})();

// Token management
class TokenManager {
    static getToken() {
        return localStorage.getItem('authToken');
    }

    static setToken(token) {
        localStorage.setItem('authToken', token);
    }

    static removeToken() {
        localStorage.removeItem('authToken');
    }

    static isAuthenticated() {
        return !!this.getToken();
    }

    static getCurrentUser() {
        try {
            const token = this.getToken();
            if (!token) {
                return null;
            }

            // Decode JWT token to get user info
            // JWT tokens have 3 parts separated by dots: header.payload.signature
            const tokenParts = token.split('.');
            if (tokenParts.length !== 3) {
                console.warn('Invalid token format');
                return null;
            }

            // Decode the payload (second part)
            const payload = JSON.parse(atob(tokenParts[1]));

            // Check if token is expired
            if (payload.exp && Date.now() >= payload.exp * 1000) {
                console.warn('Token has expired');
                this.removeToken();
                return null;
            }

            return {
                id: payload.userId || payload.id,
                email: payload.email,
                role: payload.role || 'user',
                username: payload.username,
                ...payload
            };
        } catch (error) {
            console.error('Error decoding token:', error);
            return null;
        }
    }

    static getUserRole() {
        const user = this.getCurrentUser();
        return user ? user.role : null;
    }
}

// Enhanced API call function with comprehensive error handling and authentication
export async function apiCall(endpoint, data = {}, method = 'GET', requireAuth = false) {
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;

    const options = {
        method,
        headers: {
            'Content-Type': 'application/json'
        }
    };

    // Add authentication header if required or token is available
    if (requireAuth || TokenManager.isAuthenticated()) {
        const token = TokenManager.getToken();
        if (token) {
            options.headers.Authorization = `Bearer ${token}`;
        } else if (requireAuth) {
            throw new Error('Authentication required but no token found');
        }
    }

    // Add body for non-GET requests
    if (method !== 'GET' && Object.keys(data).length > 0) {
        options.body = JSON.stringify(data);
    }

    try {
        const response = await fetch(url, options);
        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || `HTTP error! status: ${response.status}`);
        }

        // Handle authentication token from response
        if (result.token) {
            TokenManager.setToken(result.token);
        }

        return result;
    } catch (error) {
        console.error(`API call failed: ${method} ${url}`, error);

        // Handle authentication errors
        if (error.message.includes('401') || error.message.includes('unauthorized')) {
            TokenManager.removeToken();
            // Redirect to login if on a protected page
            if (requireAuth && window.location.pathname !== '/login.html') {
                window.location.href = '/login.html';
            }
        }

        throw error;
    }
}



// API endpoints configuration
export const API_ENDPOINTS = {
    // Authentication
    AUTH: {
        REGISTER: '/auth/register',
        LOGIN: '/auth/login',
        LOGOUT: '/auth/logout',
        PROFILE: '/auth/profile',
        CHANGE_PASSWORD: '/auth/change-password'
    },

    // Tournaments
    TOURNAMENTS: {
        BASE: '/tournaments',
        UPCOMING: '/tournaments/upcoming',
        ONGOING: '/tournaments/ongoing',
        SEARCH: '/tournaments/search',
        BY_GAME: (game) => `/tournaments/game/${game}`,
        BY_ID: (id) => `/tournaments/${id}`,
        PARTICIPANTS: (id) => `/tournaments/${id}/participants`,
        BY_ORGANIZER: (organizerId) => `/tournaments/organizer/${organizerId}`,
        REGISTER: (id) => `/tournaments/${id}/register`,
        WITHDRAW: (id) => `/tournaments/${id}/withdraw`,
        STATUS: (id) => `/tournaments/${id}/status`,
        STATS: '/tournaments/stats'
    },

    // News
    NEWS: {
        BASE: '/news',
        BY_ID: (id) => `/news/${id}`,
        FEATURED: '/news/featured',
        PUBLISHED: '/news/published',
        BY_CATEGORY: (category) => `/news/category/${category}`
    },

    // Matches
    MATCHES: {
        BASE: '/matches',
        BY_ID: (id) => `/matches/${id}`,
        BY_TOURNAMENT: (tournamentId) => `/matches/tournament/${tournamentId}`,
        UPCOMING: '/matches/upcoming',
        LIVE: '/matches/live',
        RESULTS: '/matches/results'
    },

    // Highlights
    HIGHLIGHTS: {
        BASE: '/highlights',
        BY_ID: (id) => `/highlights/${id}`,
        FEATURED: '/highlights/featured',
        PUBLISHED: '/highlights/published',
        BY_MATCH: (matchId) => `/highlights/match/${matchId}`
    },

    // Users
    USERS: {
        BASE: '/users',
        BY_ID: (id) => `/users/${id}`,
        PROFILE: '/users/profile',
        STATS: (id) => `/users/${id}/stats`
    },

    // Admin
    ADMIN: {
        USERS: '/admin/users',
        STATS: '/admin/stats',
        MODERATE: '/admin/moderate'
    },

    // Health
    HEALTH: '/health'
};

// Export token manager for use in other modules
export { TokenManager };
