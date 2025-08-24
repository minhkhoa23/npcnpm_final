// Hybrid API wrapper that tries backend first, then falls back to localStorage
// This provides the best of both worlds for cloud and local environments

import LocalStorageAPI from './localStorage-api.js';

// Environment detection
const isLocalEnvironment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
const isCloudEnvironment = !isLocalEnvironment && (
    window.location.hostname.includes('.fly.dev') ||
    window.location.hostname.includes('.vercel.app') ||
    window.location.hostname.includes('.netlify.app') ||
    window.location.hostname.includes('.herokuapp.com') ||
    window.location.hostname.includes('github.io') ||
    window.location.port === '' // Production-like environment
);

// API Configuration - auto-detect environment
const API_BASE_URL = (() => {
    if (isLocalEnvironment) {
        return 'http://localhost:3000/api';
    }
    // Otherwise use relative URL (works in cloud environments)
    return '/api';
})();

// System state tracking
// Always start with null to allow backend checking, but prefer localStorage in cloud environments
let backendAvailable = null;
let localStorageReady = false;

// Initialize localStorage API
const initializeLocalStorage = async () => {
    if (localStorageReady) return true;
    
    try {
        if (!window.localStorageAPI) {
            // Try to import and initialize
            await import('./localStorage-api.js');
            
            // Wait for it to be ready
            let attempts = 0;
            while (!window.localStorageAPI && attempts < 30) {
                await new Promise(resolve => setTimeout(resolve, 100));
                attempts++;
            }
        }
        
        localStorageReady = !!window.localStorageAPI;
        return localStorageReady;
    } catch (error) {
        console.error('Failed to initialize localStorage API:', error);
        return false;
    }
};

// Check if backend is available
const checkBackendAvailability = async () => {
    if (backendAvailable !== null) return backendAvailable;
    
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000); // 3 second timeout
        
        const response = await fetch(`${API_BASE_URL}/health`, {
            method: 'GET',
            signal: controller.signal,
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        clearTimeout(timeoutId);
        backendAvailable = response.ok;
        
        if (backendAvailable) {
            console.log('✅ Backend server is available');
        } else {
            console.log('⚠️ Backend server responded but with error status');
        }
        
        return backendAvailable;
    } catch (error) {
        console.log('❌ Backend server is not available:', error.message);
        backendAvailable = false;
        return false;
    }
};

// Token management (unified)
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

// Backend API call
const callBackendAPI = async (endpoint, data = {}, method = 'GET', requireAuth = false) => {
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;

    // Add timeout controller for faster fallback
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    const options = {
        method,
        signal: controller.signal,
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
        clearTimeout(timeoutId);

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message || `HTTP ${response.status}: ${response.statusText}`);
        }

        return result;
    } catch (error) {
        clearTimeout(timeoutId);
        throw error;
    }
};

// LocalStorage API call
const callLocalStorageAPI = async (endpoint, data = {}, method = 'GET', requireAuth = false) => {
    // Make sure localStorage API is ready
    const isReady = await initializeLocalStorage();
    if (!isReady) {
        throw new Error('localStorage API not available');
    }

    const api = window.localStorageAPI;

    // Handle authentication
    if (requireAuth && !TokenManager.isAuthenticated()) {
        throw new Error('Authentication required but no token found');
    }

    // Route the call to appropriate localStorage method
    const endpointLower = endpoint.toLowerCase();
    
    if (endpointLower.includes('/tournaments')) {
        if (endpointLower.includes('/upcoming')) {
            return api.getUpcomingTournaments();
        } else if (endpointLower.includes('/ongoing') || endpointLower.includes('/published')) {
            return api.getTournaments({ status: 'ongoing' });
        } else if (method === 'POST') {
            return api.createTournament(data);
        } else if (method === 'PUT') {
            const id = endpoint.split('/').pop();
            return api.updateTournament(id, data);
        } else if (method === 'DELETE') {
            const id = endpoint.split('/').pop();
            return api.deleteTournament(id);
        } else {
            return api.getTournaments();
        }
    } else if (endpointLower.includes('/news')) {
        if (endpointLower.includes('/featured')) {
            return api.getFeaturedNews();
        } else if (endpointLower.includes('/published')) {
            return api.getNews();
        } else if (method === 'POST') {
            return api.createNews(data);
        } else if (method === 'PUT') {
            const id = endpoint.split('/').pop();
            return api.updateNews(id, data);
        } else if (method === 'DELETE') {
            const id = endpoint.split('/').pop();
            return api.deleteNews(id);
        } else {
            return api.getNews();
        }
    } else if (endpointLower.includes('/highlights')) {
        if (endpointLower.includes('/published') || endpointLower.includes('/featured')) {
            return api.getPublishedHighlights();
        } else if (method === 'POST') {
            return api.createHighlight(data);
        } else if (method === 'PUT') {
            const id = endpoint.split('/').pop();
            return api.updateHighlight(id, data);
        } else if (method === 'DELETE') {
            const id = endpoint.split('/').pop();
            return api.deleteHighlight(id);
        } else {
            return api.getPublishedHighlights();
        }
    } else if (endpointLower.includes('/auth')) {
        if (endpointLower.includes('/login')) {
            return api.login(data);
        } else if (endpointLower.includes('/register')) {
            return api.register(data);
        } else if (endpointLower.includes('/logout')) {
            return api.logout();
        } else if (endpointLower.includes('/profile')) {
            if (method === 'GET') {
                const token = TokenManager.getToken();
                return api.getUserProfile(token);
            } else if (method === 'PUT') {
                const token = TokenManager.getToken();
                const decoded = JSON.parse(atob(token));
                return api.updateUserProfile(decoded.userId, data, token);
            }
        }
    } else if (endpointLower.includes('/competitors')) {
        return api.getCompetitors();
    } else if (endpointLower.includes('/health')) {
        return api.health();
    }

    throw new Error(`Endpoint not supported in localStorage mode: ${endpoint}`);
};

// Main hybrid API call function
export async function apiCall(endpoint, data = {}, method = 'GET', requireAuth = false) {
    console.log(`📡 Hybrid API call: ${method} ${endpoint} (Environment: ${isCloudEnvironment ? 'Cloud' : isLocalEnvironment ? 'Local' : 'Unknown'})`);

    // In cloud environments, skip backend and go directly to localStorage
    if (isCloudEnvironment) {
        console.log(`☁️ Cloud environment detected, using localStorage directly for: ${method} ${endpoint}`);
        try {
            const result = await callLocalStorageAPI(endpoint, data, method, requireAuth);
            console.log(`✅ Cloud localStorage API success: ${method} ${endpoint}`);
            return result;
        } catch (error) {
            console.error(`❌ Cloud localStorage API failed for: ${method} ${endpoint}`, error.message);
            return {
                success: false,
                data: {
                    tournaments: [],
                    news: [],
                    highlights: [],
                    users: []
                },
                message: `Cloud API temporarily unavailable: ${error.message}`
            };
        }
    }

    // For local environment, try backend first then fallback to localStorage
    if (backendAvailable !== false) {
        try {
            console.log(`🌐 Trying backend API for: ${method} ${endpoint}`);
            const result = await callBackendAPI(endpoint, data, method, requireAuth);
            console.log(`✅ Backend API success: ${method} ${endpoint}`);
            backendAvailable = true; // Mark as available since this call succeeded
            return result;
        } catch (error) {
            console.log(`❌ Backend API failed: ${method} ${endpoint}`, error.message);
            backendAvailable = false; // Mark as unavailable for future calls
            // Continue to localStorage fallback
        }
    } else {
        console.log(`⚠️ Backend marked as unavailable, skipping to localStorage for: ${method} ${endpoint}`);
    }

    // Fallback to localStorage API
    try {
        console.log(`💾 Using localStorage API for: ${method} ${endpoint}`);
        const result = await callLocalStorageAPI(endpoint, data, method, requireAuth);
        console.log(`✅ localStorage API success: ${method} ${endpoint}`);
        return result;
    } catch (error) {
        console.error(`❌ Both backend and localStorage APIs failed for: ${method} ${endpoint}`, error.message);

        // Return empty data structure to prevent crashes
        return {
            success: false,
            data: {
                tournaments: [],
                news: [],
                highlights: [],
                users: []
            },
            message: `API temporarily unavailable: ${error.message}`
        };
    }
}

// API Endpoints (same structure as before)
export const API_ENDPOINTS = {
    AUTH: {
        LOGIN: '/auth/login',
        REGISTER: '/auth/register',
        LOGOUT: '/auth/logout',
        PROFILE: '/auth/profile',
        REFRESH: '/auth/refresh'
    },
    TOURNAMENTS: {
        BASE: '/tournaments',
        PUBLISHED: '/tournaments/published',
        ONGOING: '/tournaments/ongoing',
        UPCOMING: '/tournaments/upcoming',
        COMPLETED: '/tournaments/completed',
        STATS: '/tournaments/stats'
    },
    NEWS: {
        BASE: '/news',
        PUBLISHED: '/news/published',
        FEATURED: '/news/featured'
    },
    HIGHLIGHTS: {
        BASE: '/highlights',
        PUBLISHED: '/highlights/published',
        FEATURED: '/highlights/featured'
    },
    ADMIN: {
        STATS: '/admin/stats',
        USERS: '/admin/users'
    }
};

// Export TokenManager
export { TokenManager };

// Initialize system on import
console.log(`🔧 Hybrid API system initialized`);
console.log(`🌍 Environment: ${isCloudEnvironment ? 'Cloud (localStorage-only mode)' : isLocalEnvironment ? 'Local (backend+localStorage mode)' : 'Unknown'}`);
console.log(`🎯 Backend availability: ${backendAvailable === false ? 'Disabled (cloud mode)' : backendAvailable === true ? 'Available' : 'Unknown'}`);

// Only check backend availability if not in cloud environment
if (!isCloudEnvironment) {
    checkBackendAvailability().then(() => {
        console.log(`🏥 Backend status: ${backendAvailable ? 'Available' : 'Not available'}`);
    });
} else {
    console.log(`☁️ Cloud environment detected - backend checks disabled`);
}

// Initialize localStorage (always needed)
initializeLocalStorage().then((ready) => {
    console.log(`💾 localStorage API status: ${ready ? 'Ready' : 'Not ready'}`);
});
