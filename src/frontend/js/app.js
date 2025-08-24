// Main Application Controller
// This file coordinates all modules and provides a unified interface

import { authController } from './controllers/auth.js';
import { tournamentController } from './controllers/tournaments.js';
import { newsController } from './controllers/news.js';
import { apiCall, API_ENDPOINTS, TokenManager } from './api.js';
import { backendStarter } from './backend-starter.js';

class App {
    constructor() {
        this.controllers = {
            auth: authController,
            tournaments: tournamentController,
            news: newsController
        };
        
        this.currentPage = this.getCurrentPage();
        this.init();
    }

    // Initialize the application
    async init() {
        console.log('Initializing Tournament Management System...');
        
        // Wait for backend to be ready
        await this.waitForBackend();
        
        // Initialize authentication first
        await this.initAuth();
        
        // Initialize page-specific functionality
        await this.initPage();
        
        // Set up global event listeners
        this.setupGlobalEventListeners();
        
        console.log('Application initialized successfully');
    }

    // Wait for backend to be ready
    async waitForBackend() {
        return new Promise((resolve) => {
            // Check if backend is already ready
            if (backendStarter.getStatus().isRunning) {
                resolve();
                return;
            }

            // Listen for backend ready event
            const onBackendReady = () => {
                window.removeEventListener('backendReady', onBackendReady);
                window.removeEventListener('backendUnavailable', onBackendUnavailable);
                resolve();
            };

            const onBackendUnavailable = () => {
                window.removeEventListener('backendReady', onBackendReady);
                window.removeEventListener('backendUnavailable', onBackendUnavailable);
                console.warn('Backend not available, continuing with limited functionality');
                resolve();
            };

            window.addEventListener('backendReady', onBackendReady);
            window.addEventListener('backendUnavailable', onBackendUnavailable);

            // Timeout after 10 seconds
            setTimeout(() => {
                window.removeEventListener('backendReady', onBackendReady);
                window.removeEventListener('backendUnavailable', onBackendUnavailable);
                console.warn('Backend startup timeout, continuing anyway');
                resolve();
            }, 10000);
        });
    }

    // Initialize authentication
    async initAuth() {
        try {
            // Check if user is already authenticated
            if (TokenManager.isAuthenticated()) {
                await this.controllers.auth.loadUserProfile();
            }
            
            // Update UI based on authentication state
            this.updateNavigationUI();
        } catch (error) {
            console.error('Auth initialization failed:', error);
        }
    }

    // Initialize page-specific functionality
    async initPage() {
        const page = this.currentPage;
        
        try {
            switch (page) {
                case 'index':
                    await this.initHomePage();
                    break;
                case 'login':
                    this.initLoginPage();
                    break;
                case 'register':
                    this.initRegisterPage();
                    break;
                case 'tournament-detail':
                    await this.initTournamentDetailPage();
                    break;
                case 'tournament-management':
                    await this.initTournamentManagementPage();
                    break;
                case 'news-management':
                    await this.initNewsManagementPage();
                    break;
                case 'view-news':
                    await this.initNewsDetailPage();
                    break;
                case 'dashboard':
                    await this.initDashboardPage();
                    break;
                case 'organizer-dashboard':
                    await this.initOrganizerDashboardPage();
                    break;
                case 'user-profile':
                    await this.initUserProfilePage();
                    break;
                default:
                    console.log(`No specific initialization for page: ${page}`);
            }
        } catch (error) {
            console.error(`Failed to initialize page ${page}:`, error);
            this.showError('Không thể tải trang. Vui lòng thử lại.');
        }
    }

    // Initialize home page
    async initHomePage() {
        // Load featured tournaments and news
        try {
            const [upcomingTournaments, featuredNews] = await Promise.all([
                this.controllers.tournaments.getUpcomingTournaments(),
                this.controllers.news.getFeaturedNews()
            ]);
            
            this.renderFeaturedContent(upcomingTournaments, featuredNews);
        } catch (error) {
            console.error('Failed to load home page content:', error);
        }
    }

    // Initialize login page
    initLoginPage() {
        // Redirect if already authenticated
        if (this.controllers.auth.isAuthenticated()) {
            this.controllers.auth.redirectAfterAuth();
        }
    }

    // Initialize register page
    initRegisterPage() {
        // Redirect if already authenticated
        if (this.controllers.auth.isAuthenticated()) {
            this.controllers.auth.redirectAfterAuth();
        }
    }

    // Initialize tournament detail page
    async initTournamentDetailPage() {
        const tournamentId = this.getURLParameter('id');
        if (tournamentId) {
            await this.controllers.tournaments.getTournamentById(tournamentId);
        } else {
            this.showError('ID giải đấu không hợp lệ');
        }
    }

    // Initialize tournament management page
    async initTournamentManagementPage() {
        if (!this.requireAuth(['organizer', 'admin'])) return;
        
        const user = this.controllers.auth.getCurrentUser();
        if (user.role === 'organizer') {
            await this.controllers.tournaments.getTournamentsByOrganizer(user.id);
        } else {
            await this.controllers.tournaments.getAllTournaments();
        }
    }

    // Initialize news management page
    async initNewsManagementPage() {
        if (!this.requireAuth(['organizer', 'admin'])) return;
        
        await this.controllers.news.getAllNews();
    }

    // Initialize news detail page
    async initNewsDetailPage() {
        const newsId = this.getURLParameter('id');
        if (newsId) {
            await this.controllers.news.getNewsById(newsId);
        } else {
            this.showError('ID tin tức không hợp lệ');
        }
    }

    // Initialize dashboard page (admin)
    async initDashboardPage() {
        if (!this.requireAuth(['admin'])) return;
        
        try {
            // Load dashboard statistics
            const stats = await this.loadDashboardStats();
            this.renderDashboardStats(stats);
        } catch (error) {
            console.error('Failed to load dashboard stats:', error);
        }
    }

    // Initialize organizer dashboard page
    async initOrganizerDashboardPage() {
        if (!this.requireAuth(['organizer', 'admin'])) return;
        
        const user = this.controllers.auth.getCurrentUser();
        try {
            // Load organizer-specific data
            const tournaments = await this.controllers.tournaments.getTournamentsByOrganizer(user.id);
            this.renderOrganizerDashboard(tournaments);
        } catch (error) {
            console.error('Failed to load organizer dashboard:', error);
        }
    }

    // Initialize user profile page
    async initUserProfilePage() {
        if (!this.requireAuth()) return;
        
        // Profile form should already be populated by auth controller
        // Load additional user-specific data if needed
    }

    // Load dashboard statistics
    async loadDashboardStats() {
        try {
            const [tournamentStats, userStats] = await Promise.all([
                apiCall(API_ENDPOINTS.TOURNAMENTS.STATS),
                apiCall(API_ENDPOINTS.ADMIN.STATS, {}, 'GET', true)
            ]);
            
            return {
                tournaments: tournamentStats.data,
                users: userStats.data
            };
        } catch (error) {
            console.error('Failed to load dashboard stats:', error);
            throw error;
        }
    }

    // Render dashboard statistics
    renderDashboardStats(stats) {
        const statsContainer = document.getElementById('dashboardStats');
        if (!statsContainer || !stats) return;

        const statsHTML = `
            <div class="stats-grid">
                <div class="stat-card">
                    <h3>Tổng số giải đấu</h3>
                    <span class="stat-number">${stats.tournaments?.total || 0}</span>
                </div>
                <div class="stat-card">
                    <h3>Giải đấu đang diễn ra</h3>
                    <span class="stat-number">${stats.tournaments?.ongoing || 0}</span>
                </div>
                <div class="stat-card">
                    <h3>Tổng số người dùng</h3>
                    <span class="stat-number">${stats.users?.total || 0}</span>
                </div>
                <div class="stat-card">
                    <h3>Người dùng hoạt động</h3>
                    <span class="stat-number">${stats.users?.active || 0}</span>
                </div>
            </div>
        `;

        statsContainer.innerHTML = statsHTML;
    }

    // Render organizer dashboard
    renderOrganizerDashboard(tournaments) {
        const dashboardContainer = document.getElementById('organizerDashboard');
        if (!dashboardContainer) return;

        const dashboardHTML = `
            <div class="organizer-summary">
                <h2>Tổng quan</h2>
                <div class="summary-stats">
                    <div class="summary-item">
                        <span class="summary-number">${tournaments.length}</span>
                        <span class="summary-label">Giải đấu đã tạo</span>
                    </div>
                    <div class="summary-item">
                        <span class="summary-number">${tournaments.filter(t => t.status === 'ongoing').length}</span>
                        <span class="summary-label">Đang diễn ra</span>
                    </div>
                    <div class="summary-item">
                        <span class="summary-number">${tournaments.filter(t => t.status === 'completed').length}</span>
                        <span class="summary-label">Đã hoàn thành</span>
                    </div>
                </div>
            </div>
            
            <div class="quick-actions">
                <h3>Thao tác nhanh</h3>
                <div class="action-buttons">
                    <a href="/create-tournament-1.html" class="btn-primary">
                        <i class="icon-plus"></i> Tạo giải đấu mới
                    </a>
                    <a href="/tournament-management.html" class="btn-secondary">
                        <i class="icon-list"></i> Quản lý giải đấu
                    </a>
                    <a href="/create-news.html" class="btn-info">
                        <i class="icon-news"></i> Tạo tin tức
                    </a>
                </div>
            </div>
        `;

        dashboardContainer.innerHTML = dashboardHTML;
    }

    // Render featured content on home page
    renderFeaturedContent(tournaments, news) {
        // Render featured tournaments
        const tournamentsContainer = document.getElementById('featuredTournaments');
        if (tournamentsContainer && tournaments) {
            const tournamentsHTML = tournaments.slice(0, 6).map(tournament => `
                <div class="featured-tournament-card">
                    <img src="${tournament.image || '/assets/default-tournament.jpg'}" alt="${tournament.name}">
                    <div class="tournament-info">
                        <h4>${tournament.name}</h4>
                        <p>${tournament.game}</p>
                        <span class="tournament-date">${this.formatDate(tournament.startDate)}</span>
                        <a href="/tournament-detail.html?id=${tournament.id}" class="btn-small">Xem chi tiết</a>
                    </div>
                </div>
            `).join('');
            tournamentsContainer.innerHTML = tournamentsHTML;
        }

        // Render featured news
        const newsContainer = document.getElementById('featuredNews');
        if (newsContainer && news) {
            const newsHTML = news.slice(0, 4).map(newsItem => `
                <div class="featured-news-card">
                    <img src="${newsItem.image || '/assets/default-news.jpg'}" alt="${newsItem.title}">
                    <div class="news-info">
                        <h4><a href="/view-news.html?id=${newsItem.id}">${newsItem.title}</a></h4>
                        <p>${this.truncateText(newsItem.content, 100)}</p>
                        <span class="news-date">${this.formatDate(newsItem.createdAt)}</span>
                    </div>
                </div>
            `).join('');
            newsContainer.innerHTML = newsHTML;
        }
    }

    // Setup global event listeners
    setupGlobalEventListeners() {
        // Search functionality
        const searchForm = document.getElementById('globalSearchForm');
        if (searchForm) {
            searchForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const query = new FormData(searchForm).get('query');
                await this.performGlobalSearch(query);
            });
        }

        // Navigation menu toggles
        document.addEventListener('click', (e) => {
            // Mobile menu toggle
            if (e.target.classList.contains('mobile-menu-toggle')) {
                this.toggleMobileMenu();
            }
            
            // User menu toggle
            if (e.target.classList.contains('user-menu-toggle')) {
                this.toggleUserMenu();
            }
        });

        // Auto-save functionality for forms
        this.setupAutoSave();
    }

    // Perform global search
    async performGlobalSearch(query) {
        if (!query) return;

        try {
            const [tournaments, news] = await Promise.all([
                this.controllers.tournaments.searchTournaments(query),
                this.controllers.news.searchNews(query)
            ]);

            this.renderSearchResults({ tournaments, news, query });
        } catch (error) {
            this.showError('Tìm kiếm thất bại: ' + error.message);
        }
    }

    // Render search results
    renderSearchResults(results) {
        const resultsContainer = document.getElementById('searchResults');
        if (!resultsContainer) return;

        const resultsHTML = `
            <div class="search-results">
                <h2>Kết quả tìm kiếm cho: "${results.query}"</h2>
                
                <div class="search-section">
                    <h3>Giải đấu (${results.tournaments.length})</h3>
                    <div class="search-tournaments">
                        ${results.tournaments.map(tournament => `
                            <div class="search-result-item">
                                <img src="${tournament.image || '/assets/default-tournament.jpg'}" alt="${tournament.name}">
                                <div class="result-info">
                                    <h4><a href="/tournament-detail.html?id=${tournament.id}">${tournament.name}</a></h4>
                                    <p>${tournament.game} • ${this.formatDate(tournament.startDate)}</p>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div class="search-section">
                    <h3>Tin tức (${results.news.length})</h3>
                    <div class="search-news">
                        ${results.news.map(newsItem => `
                            <div class="search-result-item">
                                <img src="${newsItem.image || '/assets/default-news.jpg'}" alt="${newsItem.title}">
                                <div class="result-info">
                                    <h4><a href="/view-news.html?id=${newsItem.id}">${newsItem.title}</a></h4>
                                    <p>${this.formatDate(newsItem.createdAt)}</p>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </div>
        `;

        resultsContainer.innerHTML = resultsHTML;
    }

    // Setup auto-save functionality
    setupAutoSave() {
        const autoSaveForms = document.querySelectorAll('[data-autosave]');
        autoSaveForms.forEach(form => {
            const formId = form.id;
            if (!formId) return;

            // Load saved data
            this.loadFormData(form);

            // Save on input
            form.addEventListener('input', this.debounce(() => {
                this.saveFormData(form);
            }, 1000));
        });
    }

    // Load form data from localStorage
    loadFormData(form) {
        const formId = form.id;
        const savedData = localStorage.getItem(`form_${formId}`);
        
        if (savedData) {
            try {
                const data = JSON.parse(savedData);
                Object.keys(data).forEach(name => {
                    const field = form.querySelector(`[name="${name}"]`);
                    if (field) {
                        field.value = data[name];
                    }
                });
            } catch (error) {
                console.error('Failed to load form data:', error);
            }
        }
    }

    // Save form data to localStorage
    saveFormData(form) {
        const formId = form.id;
        const formData = new FormData(form);
        const data = {};
        
        for (let [name, value] of formData) {
            data[name] = value;
        }
        
        localStorage.setItem(`form_${formId}`, JSON.stringify(data));
    }

    // Clear saved form data
    clearFormData(formId) {
        localStorage.removeItem(`form_${formId}`);
    }

    // Update navigation UI based on authentication state
    updateNavigationUI() {
        const user = this.controllers.auth.getCurrentUser();
        
        // Update user menu
        const userMenu = document.getElementById('userMenu');
        const guestMenu = document.getElementById('guestMenu');
        
        if (user) {
            if (userMenu) userMenu.style.display = 'block';
            if (guestMenu) guestMenu.style.display = 'none';
            
            // Update user name display
            const userNameElements = document.querySelectorAll('.user-name');
            userNameElements.forEach(element => {
                element.textContent = user.fullName || user.email;
            });
            
            // Show/hide role-specific menu items
            this.updateRoleBasedUI(user.role);
        } else {
            if (userMenu) userMenu.style.display = 'none';
            if (guestMenu) guestMenu.style.display = 'block';
        }
    }

    // Update UI based on user role
    updateRoleBasedUI(role) {
        // Show/hide admin menu items
        const adminElements = document.querySelectorAll('.admin-only');
        adminElements.forEach(element => {
            element.style.display = role === 'admin' ? 'block' : 'none';
        });

        // Show/hide organizer menu items
        const organizerElements = document.querySelectorAll('.organizer-only');
        organizerElements.forEach(element => {
            element.style.display = ['organizer', 'admin'].includes(role) ? 'block' : 'none';
        });
    }

    // Utility methods
    getCurrentPage() {
        const path = window.location.pathname;
        const filename = path.split('/').pop().replace('.html', '');
        return filename || 'index';
    }

    getURLParameter(name) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(name);
    }

    requireAuth(roles = []) {
        if (!this.controllers.auth.isAuthenticated()) {
            const currentUrl = encodeURIComponent(window.location.href);
            window.location.href = `/login.html?redirect=${currentUrl}`;
            return false;
        }

        if (roles.length > 0) {
            const user = this.controllers.auth.getCurrentUser();
            if (!roles.includes(user.role)) {
                this.showError('Bạn không có quyền truy cập trang này');
                window.history.back();
                return false;
            }
        }

        return true;
    }

    toggleMobileMenu() {
        const mobileMenu = document.getElementById('mobileMenu');
        if (mobileMenu) {
            mobileMenu.classList.toggle('active');
        }
    }

    toggleUserMenu() {
        const userDropdown = document.getElementById('userDropdown');
        if (userDropdown) {
            userDropdown.classList.toggle('active');
        }
    }

    // Helper methods
    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('vi-VN');
    }

    truncateText(text, maxLength) {
        if (!text || text.length <= maxLength) return text;
        return text.substring(0, maxLength).trim() + '...';
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    showError(message) {
        this.controllers.auth.showError(message);
    }

    showSuccess(message) {
        this.controllers.auth.showSuccess(message);
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});

// Export for use in other modules
export default App;
