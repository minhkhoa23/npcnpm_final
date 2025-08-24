// Static API wrapper that uses localStorage instead of HTTP requests
// This allows the app to work with just VS Code Live Server

import LocalStorageAPI from './localStorage-api.js';

// Wait for localStorage API to be ready
const waitForAPI = () => {
    return new Promise((resolve) => {
        if (window.localStorageAPI) {
            resolve(window.localStorageAPI);
        } else {
            setTimeout(() => waitForAPI().then(resolve), 100);
        }
    });
};

// Token management (same as before)
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
        const token = this.getToken();
        if (!token) return null;
        
        try {
            return JSON.parse(atob(token));
        } catch (error) {
            console.error('Invalid token:', error);
            this.removeToken();
            return null;
        }
    }
}

// Static API call function that uses localStorage instead of fetch
export async function apiCall(endpoint, data = {}, method = 'GET', requireAuth = false) {
    console.log(`📡 Static API call: ${method} ${endpoint}`);
    
    // Wait for localStorage API to be ready
    const api = await waitForAPI();
    
    try {
        // Handle authentication
        if (requireAuth && !TokenManager.isAuthenticated()) {
            throw new Error('Authentication required but no token found');
        }

        // Route the API call to the appropriate localStorage method
        let result;
        
        if (endpoint === '/health') {
            result = await api.health();
        }
        // Auth endpoints
        else if (endpoint === '/auth/register') {
            result = await api.register(data);
        }
        else if (endpoint === '/auth/login') {
            result = await api.login(data);
        }
        else if (endpoint === '/auth/logout') {
            TokenManager.removeToken();
            result = { success: true, message: 'Logged out successfully' };
        }
        // Tournament endpoints
        else if (endpoint === '/tournaments' && method === 'POST') {
            result = await api.createTournament(data);
        }
        else if (endpoint === '/tournaments') {
            result = await api.getTournaments();
        }
        else if (endpoint === '/tournaments/upcoming') {
            result = await api.getUpcomingTournaments();
        }
        else if (endpoint === '/tournaments/ongoing') {
            const tournaments = await api.getTournaments({ status: 'ongoing' });
            result = tournaments;
        }
        // News endpoints
        else if (endpoint === '/news' && method === 'POST') {
            result = await api.createNews(data);
        }
        else if (endpoint === '/news/featured') {
            result = await api.getFeaturedNews();
        }
        else if (endpoint === '/news/published') {
            result = await api.getFeaturedNews(); // Use same logic as featured news
        }
        // Highlight endpoints
        else if (endpoint === '/highlights' && method === 'POST') {
            result = await api.createHighlight(data);
        }
        else if (endpoint === '/highlights/published') {
            result = await api.getPublishedHighlights();
        }
        // Competitor endpoints
        else if (endpoint === '/competitors') {
            result = await api.getCompetitors();
        }
        else if (endpoint.startsWith('/competitors/by-game/')) {
            const game = decodeURIComponent(endpoint.split('/competitors/by-game/')[1]);
            result = await api.getCompetitorsByGame(game);
        }
        else {
            throw new Error(`Endpoint not implemented: ${endpoint}`);
        }

        // Handle authentication token from response
        if (result.data && result.data.token) {
            TokenManager.setToken(result.data.token);
        }

        console.log(`✅ Static API success: ${method} ${endpoint}`, result);
        return result;

    } catch (error) {
        console.error(`❌ Static API error: ${method} ${endpoint}`, error);

        // Handle authentication errors
        if (error.message.includes('unauthorized') || error.message.includes('Authentication required')) {
            TokenManager.removeToken();
            // Redirect to login if on a protected page
            if (requireAuth && window.location.pathname !== '/login.html') {
                window.location.href = '/login.html';
            }
        }

        // Return error in consistent format
        return {
            success: false,
            message: error.message || 'Unknown error occurred'
        };
    }
}

// API endpoints configuration (same as before)
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

    // Competitors
    COMPETITORS: {
        BASE: '/competitors',
        BY_GAME: (game) => `/competitors/by-game/${game}`,
        BY_ID: (id) => `/competitors/${id}`,
        GAMES: '/competitors/games'
    },

    // Health
    HEALTH: '/health'
};

// Export token manager for use in other modules
export { TokenManager };

// Initialize the localStorage API when this module is loaded
console.log('🚀 Static API system initialized - no backend server required!');
