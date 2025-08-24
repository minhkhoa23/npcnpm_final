/**
 * Navigation utility for role-based routing
 */
import { TokenManager } from './api.js';

export class NavigationManager {
    /**
     * Get the appropriate home URL based on user role
     */
    static getHomeUrl() {
        try {
            const currentUser = TokenManager.getCurrentUser();
            
            if (!currentUser || !TokenManager.isAuthenticated()) {
                return '/'; // Guest/index page
            }
            
            switch (currentUser.role) {
                case 'organizer':
                    return 'organizer-dashboard.html';
                case 'user':
                    return 'dashboard.html';
                case 'admin':
                    return 'admin-dashboard.html'; // In case admin dashboard exists
                default:
                    return 'dashboard.html'; // Default to user dashboard
            }
        } catch (error) {
            console.error('Error determining home URL:', error);
            return '/'; // Fallback to guest page
        }
    }

    /**
     * Navigate to home based on user role
     */
    static goHome() {
        window.location.href = this.getHomeUrl();
    }

    /**
     * Initialize home navigation for all home buttons on the page
     */
    static initializeHomeNavigation() {
        // Find all home navigation elements
        const homeButtons = document.querySelectorAll([
            '.home-button',
            '[onclick*="window.location.href=\'/\'"]',
            '[onclick*="window.location.href=\'dashboard.html\'"]',
            '[onclick*="window.location.href=\'organizer-dashboard.html\'"]',
            '.nav-item[onclick*="index.html"]',
            '.nav-item[onclick*="dashboard.html"]'
        ].join(','));

        homeButtons.forEach(button => {
            // Remove existing onclick handlers
            button.removeAttribute('onclick');
            
            // Add new role-based navigation
            button.addEventListener('click', (e) => {
                e.preventDefault();
                this.goHome();
            });
            
            // Make sure it's clickable
            button.style.cursor = 'pointer';
        });
    }

    /**
     * Update home navigation links to be role-aware
     */
    static updateHomeLinks() {
        const homeUrl = this.getHomeUrl();
        
        // Update href attributes for home links
        const homeLinks = document.querySelectorAll([
            'a[href="/"]',
            'a[href="index.html"]',
            'a[href="dashboard.html"]',
            'a[href="organizer-dashboard.html"]'
        ].join(','));

        homeLinks.forEach(link => {
            link.href = homeUrl;
        });
    }

    /**
     * Get the appropriate dashboard URL for navigation breadcrumbs
     */
    static getDashboardUrl() {
        return this.getHomeUrl();
    }

    /**
     * Redirect to appropriate dashboard after login
     */
    static redirectAfterLogin(userRole) {
        switch (userRole) {
            case 'organizer':
                window.location.href = 'organizer-dashboard.html';
                break;
            case 'user':
                window.location.href = 'dashboard.html';
                break;
            case 'admin':
                window.location.href = 'admin-dashboard.html';
                break;
            default:
                window.location.href = 'dashboard.html';
        }
    }

    /**
     * Check if current user has access to a page
     */
    static checkPageAccess(requiredRole) {
        const currentUser = TokenManager.getCurrentUser();
        
        if (!currentUser || !TokenManager.isAuthenticated()) {
            return false;
        }
        
        if (requiredRole === 'any') {
            return true;
        }
        
        if (Array.isArray(requiredRole)) {
            return requiredRole.includes(currentUser.role);
        }
        
        return currentUser.role === requiredRole;
    }

    /**
     * Redirect unauthorized users
     */
    static redirectUnauthorized() {
        const currentUser = TokenManager.getCurrentUser();
        
        if (!currentUser || !TokenManager.isAuthenticated()) {
            window.location.href = 'login.html';
        } else {
            this.goHome();
        }
    }
}

// Auto-initialize navigation when the script loads
document.addEventListener('DOMContentLoaded', function() {
    NavigationManager.initializeHomeNavigation();
    NavigationManager.updateHomeLinks();
});

// Also initialize when the page is fully loaded (for dynamic content)
window.addEventListener('load', function() {
    NavigationManager.initializeHomeNavigation();
    NavigationManager.updateHomeLinks();
});

// Export for global use
window.NavigationManager = NavigationManager;
