// Router for Single Page Application
import { apiCall, API_ENDPOINTS, TokenManager } from './hybrid-api.js';
import { renderGuestView } from './views/guestView.js';
import { authController } from './controllers/auth.js';
import { tournamentController } from './controllers/tournaments.js';
import { newsController } from './controllers/news.js';
import { EnhancedNewsController } from './controllers/EnhancedNewsController.js';
import { SearchComponent } from './components/SearchComponent.js';

class Router {
    constructor() {
        this.routes = {};
        this.currentRoute = '';
        this.enhancedNewsController = null;
        this.searchComponents = new Map();
        this.init();
    }

    // Initialize router
    init() {
        // Register routes
        this.addRoute('/', () => this.renderHomePage());
        this.addRoute('/home', () => this.renderHomePage());
        this.addRoute('/login', () => this.renderLoginPage());
        this.addRoute('/register', () => this.renderRegisterPage());
        this.addRoute('/dashboard', () => this.renderDashboardPage());
        this.addRoute('/tournaments', () => this.renderTournamentsPage());
        this.addRoute('/tournament/:id', (id) => this.renderTournamentDetailPage(id));
        this.addRoute('/news', () => this.renderEnhancedNewsPage());
        this.addRoute('/news/:id', (id) => this.renderNewsDetailPage(id));
        this.addRoute('/profile', () => this.renderProfilePage());
        this.addRoute('/support', () => this.renderSupportPage());

        // Listen for URL changes
        window.addEventListener('popstate', () => this.handleRoute());
        
        // Handle initial route
        this.handleRoute();
    }

    // Add a route
    addRoute(path, handler) {
        this.routes[path] = handler;
    }

    // Navigate to a route
    navigate(path) {
        history.pushState(null, null, path);
        this.handleRoute();
    }

    // Handle current route
    handleRoute() {
        const path = window.location.pathname || '/';
        this.currentRoute = path;

        // Check for parameterized routes
        const route = this.findMatchingRoute(path);
        if (route) {
            route.handler(...route.params);
        } else {
            // Default to home page
            this.renderHomePage();
        }
    }

    // Find matching route with parameters
    findMatchingRoute(path) {
        for (const routePath in this.routes) {
            const routeRegex = this.createRouteRegex(routePath);
            const match = path.match(routeRegex);
            
            if (match) {
                const params = match.slice(1); // Remove the full match
                return {
                    handler: this.routes[routePath],
                    params: params
                };
            }
        }
        return null;
    }

    // Create regex for route with parameters
    createRouteRegex(route) {
        const escaped = route.replace(/\//g, '\\/');
        const withParams = escaped.replace(/:([^\/]+)/g, '([^\/]+)');
        return new RegExp(`^${withParams}$`);
    }

    // Route handlers
    async renderHomePage() {
        this.showLoading();
        try {
            await renderGuestView();
            this.setupHomePageEvents();
        } catch (error) {
            console.error('Error rendering home page:', error);
            this.showError('Lỗi tải trang chủ');
        }
    }

    async renderLoginPage() {
        this.showLoading();
        try {
            await this.loadHTMLPage('login.html');
            this.setupLoginPageEvents();
        } catch (error) {
            console.error('Error rendering login page:', error);
            this.showError('Lỗi tải trang đăng nhập');
        }
    }

    async renderRegisterPage() {
        this.showLoading();
        try {
            await this.loadHTMLPage('register.html');
            this.setupRegisterPageEvents();
        } catch (error) {
            console.error('Error rendering register page:', error);
            this.showError('Lỗi tải trang đăng ký');
        }
    }

    async renderDashboardPage() {
        if (!TokenManager.isAuthenticated()) {
            this.navigate('/login');
            return;
        }

        this.showLoading();
        try {
            await this.loadHTMLPage('dashboard.html');
            this.setupDashboardEvents();
        } catch (error) {
            console.error('Error rendering dashboard:', error);
            this.showError('Lỗi tải dashboard');
        }
    }

    async renderTournamentsPage() {
        this.showLoading();
        try {
            // Create enhanced tournaments page with search
            const contentElement = document.getElementById('content');
            contentElement.innerHTML = `
                <div class="enhanced-tournaments-page">
                    <header class="page-header">
                        <div class="header-content">
                            <h1>🏆 Quản lý Giải đấu</h1>
                            <p>Tìm kiếm và quản lý các giải đấu</p>
                        </div>
                        
                        <div class="header-actions">
                            <button class="create-btn" onclick="window.navigateTo('/tournament/create')">
                                Tạo giải đấu mới
                            </button>
                        </div>
                    </header>
                    
                    <div id="tournamentsSearchContainer"></div>
                    <div id="tournamentsResults" class="tournaments-grid"></div>
                    <div id="tournamentsPagination"></div>
                </div>
            `;

            // Initialize search component for tournaments
            const searchContainer = document.getElementById('tournamentsSearchContainer');
            const searchComponent = new SearchComponent({
                container: searchContainer,
                searchType: 'tournaments',
                placeholder: 'Tìm kiếm giải đấu theo tên, game, tags...',
                onSearchResult: (result) => this.renderTournamentsResults(result),
                onFiltersChange: (filters) => console.log('Tournament filters:', filters)
            });

            this.searchComponents.set('tournaments', searchComponent);

        } catch (error) {
            console.error('Error rendering tournaments page:', error);
            this.showError('Lỗi tải trang giải đấu');
        }
    }

    async renderTournamentDetailPage(id) {
        this.showLoading();
        try {
            await this.loadHTMLPage('tournament-detail.html');
            await tournamentController.initDetailPage(id);
        } catch (error) {
            console.error('Error rendering tournament detail:', error);
            this.showError('Lỗi tải chi tiết giải đấu');
        }
    }

    async renderEnhancedNewsPage() {
        this.showLoading();
        try {
            // Initialize enhanced news controller
            if (this.enhancedNewsController) {
                this.enhancedNewsController = null; // Clean up previous instance
            }
            
            this.enhancedNewsController = new EnhancedNewsController();
            
        } catch (error) {
            console.error('Error rendering enhanced news page:', error);
            this.showError('Lỗi tải trang tin tức');
        }
    }

    async renderNewsDetailPage(id) {
        this.showLoading();
        try {
            // Load news detail with enhanced view
            const news = await apiCall(`${API_ENDPOINTS.NEWS.BASE}/${id}`);
            
            const contentElement = document.getElementById('content');
            contentElement.innerHTML = `
                <div class="news-detail-page">
                    <div class="news-detail-container">
                        <header class="news-detail-header">
                            <button class="back-btn" onclick="history.back()">
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                    <path d="M15 5L5 15M5 5L15 15" stroke="currentColor" stroke-width="2"/>
                                </svg>
                                Quay lại
                            </button>
                            
                            <div class="news-meta">
                                <span class="news-category">${this.getCategoryLabel(news.data.category)}</span>
                                <time class="news-date">${new Date(news.data.publishedAt).toLocaleDateString('vi-VN')}</time>
                                ${news.data.featured ? '<span class="featured-badge">⭐ Nổi bật</span>' : ''}
                            </div>
                        </header>
                        
                        <article class="news-article">
                            <h1 class="news-title">${news.data.title}</h1>
                            
                            <div class="news-author-info">
                                <span class="author">Tác giả: ${news.data.author}</span>
                                <span class="views">👁️ ${news.data.views || 0} lượt xem</span>
                            </div>
                            
                            <div class="news-image">
                                <img src="${news.data.imageUrl || 'https://via.placeholder.com/800x400'}" alt="${news.data.title}">
                            </div>
                            
                            <div class="news-content">
                                ${news.data.content.replace(/\n/g, '</p><p>')}
                            </div>
                            
                            <div class="news-tags">
                                ${(news.data.tags || []).map(tag => `<span class="tag">${tag}</span>`).join('')}
                            </div>
                        </article>
                        
                        <footer class="news-detail-footer">
                            <div class="news-actions">
                                <button class="share-btn">Chia sẻ</button>
                                <button class="bookmark-btn">Lưu</button>
                            </div>
                        </footer>
                    </div>
                </div>
            `;

            this.addNewsDetailStyles();
            
        } catch (error) {
            console.error('Error rendering news detail:', error);
            this.showError('Lỗi tải chi tiết tin tức');
        }
    }

    async renderProfilePage() {
        if (!TokenManager.isAuthenticated()) {
            this.navigate('/login');
            return;
        }

        this.showLoading();
        try {
            await this.loadHTMLPage('user-profile.html');
            this.setupProfileEvents();
        } catch (error) {
            console.error('Error rendering profile page:', error);
            this.showError('Lỗi tải trang hồ sơ');
        }
    }

    async renderSupportPage() {
        this.showLoading();
        try {
            await this.loadHTMLPage('support.html');
            this.setupSupportEvents();
        } catch (error) {
            console.error('Error rendering support page:', error);
            this.showError('Lỗi tải trang hỗ trợ');
        }
    }

    // Enhanced tournament results rendering
    renderTournamentsResults(result) {
        const resultsContainer = document.getElementById('tournamentsResults');
        
        if (!result.data || result.data.length === 0) {
            resultsContainer.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">🏆</div>
                    <h3>Không tìm thấy giải đấu nào</h3>
                    <p>Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc</p>
                </div>
            `;
            return;
        }

        resultsContainer.innerHTML = result.data.map(tournament => `
            <div class="tournament-card" onclick="window.navigateTo('/tournament/${tournament.id}')">
                <div class="tournament-header">
                    <h3 class="tournament-name">${tournament.name}</h3>
                    <span class="tournament-status status-${tournament.status}">
                        ${this.getStatusLabel(tournament.status)}
                    </span>
                </div>
                
                <div class="tournament-details">
                    <div class="detail-item">
                        <span class="detail-label">Game:</span>
                        <span class="detail-value">${tournament.game}</span>
                    </div>
                    
                    <div class="detail-item">
                        <span class="detail-label">Người tham gia:</span>
                        <span class="detail-value">${tournament.participants}/${tournament.maxParticipants}</span>
                    </div>
                    
                    <div class="detail-item">
                        <span class="detail-label">Giải thưởng:</span>
                        <span class="detail-value prize">${tournament.prize}</span>
                    </div>
                    
                    <div class="detail-item">
                        <span class="detail-label">Ngày bắt đầu:</span>
                        <span class="detail-value">${new Date(tournament.startDate).toLocaleDateString('vi-VN')}</span>
                    </div>
                </div>
                
                <div class="tournament-tags">
                    ${(tournament.tags || []).map(tag => `<span class="tag">${tag}</span>`).join('')}
                </div>
                
                <div class="tournament-footer">
                    <span class="organizer">Tổ chức bởi: ${tournament.organizer}</span>
                    <div class="tournament-actions">
                        <button class="btn-join" onclick="event.stopPropagation()">Tham gia</button>
                        <button class="btn-details">Chi tiết</button>
                    </div>
                </div>
            </div>
        `).join('');

        this.addTournamentCardStyles();
    }

    // Load HTML page content
    async loadHTMLPage(filename) {
        try {
            const response = await fetch(`./src/frontend/${filename}`);
            if (!response.ok) {
                throw new Error(`Failed to load ${filename}`);
            }
            const html = await response.text();
            
            // Extract body content (remove html, head, body tags)
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = html;
            const bodyContent = tempDiv.querySelector('body')?.innerHTML || html;
            
            const contentElement = document.getElementById('content');
            if (contentElement) {
                contentElement.innerHTML = bodyContent;
            }
        } catch (error) {
            console.error(`Error loading ${filename}:`, error);
            throw error;
        }
    }

    // Event setup methods
    setupHomePageEvents() {
        // Setup login/register buttons
        const loginBtn = document.getElementById('loginGuestBtn');
        const registerBtn = document.getElementById('registerGuestBtn');

        if (loginBtn) {
            loginBtn.addEventListener('click', () => this.navigate('/login'));
        }

        if (registerBtn) {
            registerBtn.addEventListener('click', () => this.navigate('/register'));
        }

        // Setup navigation events
        this.setupGlobalNavigation();
    }

    setupLoginPageEvents() {
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const formData = new FormData(loginForm);
                const credentials = {
                    email: formData.get('email'),
                    password: formData.get('password')
                };

                try {
                    await authController.login(credentials);
                    this.navigate('/dashboard');
                } catch (error) {
                    this.showError('Đăng nhập thất bại: ' + error.message);
                }
            });
        }
    }

    setupRegisterPageEvents() {
        const registerForm = document.getElementById('registerForm');
        if (registerForm) {
            registerForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const formData = new FormData(registerForm);
                const userData = {
                    username: formData.get('username'),
                    email: formData.get('email'),
                    password: formData.get('password'),
                    fullName: formData.get('fullName')
                };

                try {
                    await authController.register(userData);
                    this.navigate('/dashboard');
                } catch (error) {
                    this.showError('Đăng ký thất bại: ' + error.message);
                }
            });
        }
    }

    setupDashboardEvents() {
        // Setup dashboard-specific events
        this.setupGlobalNavigation();
    }

    setupProfileEvents() {
        // Setup profile-specific events
        this.setupGlobalNavigation();
    }

    setupSupportEvents() {
        // Setup support-specific events
        this.setupGlobalNavigation();
    }

    // Setup global navigation
    setupGlobalNavigation() {
        // Handle all navigation links
        document.addEventListener('click', (e) => {
            const link = e.target.closest('[data-route]');
            if (link) {
                e.preventDefault();
                const route = link.getAttribute('data-route');
                this.navigate(route);
            }
        });

        // Setup logout functionality
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', () => {
                authController.logout();
                this.navigate('/');
            });
        }
    }

    // Utility methods
    showLoading() {
        const contentElement = document.getElementById('content');
        if (contentElement) {
            contentElement.innerHTML = `
                <div class="loading-container">
                    <div class="loading-spinner"></div>
                    <p>Đang tải...</p>
                </div>
            `;
        }
    }

    showError(message) {
        const contentElement = document.getElementById('content');
        if (contentElement) {
            contentElement.innerHTML = `
                <div class="error-container">
                    <h2>Đã xảy ra lỗi</h2>
                    <p>${message}</p>
                    <button onclick="router.navigate('/')">Về trang chủ</button>
                </div>
            `;
        }
    }

    // Helper methods
    getCategoryLabel(category) {
        const labels = {
            'general': 'Chung',
            'announcement': 'Thông báo',
            'update': 'Cập nhật',
            'schedule': 'Lịch trình',
            'maintenance': 'Bảo trì'
        };
        return labels[category] || category;
    }

    getStatusLabel(status) {
        const labels = {
            'upcoming': 'Sắp diễn ra',
            'ongoing': 'Đang diễn ra',
            'completed': 'Đã kết thúc'
        };
        return labels[status] || status;
    }

    // Add styles for enhanced components
    addTournamentCardStyles() {
        if (document.getElementById('tournament-card-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'tournament-card-styles';
        styles.textContent = `
            .enhanced-tournaments-page {
                max-width: 1400px;
                margin: 0 auto;
                padding: 20px;
                background: #0a0a0a;
                min-height: 100vh;
            }

            .page-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 30px;
                padding: 20px 0;
                border-bottom: 1px solid #333;
            }

            .page-header h1 {
                color: #F5F5F5;
                font-size: 2.5rem;
                margin: 0;
                background: linear-gradient(135deg, #F19EDC, #E081C7);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
            }

            .tournaments-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
                gap: 20px;
                margin-bottom: 30px;
            }

            .tournament-card {
                background: linear-gradient(135deg, #1e1e1e, #2a2a2a);
                border: 1px solid #333;
                border-radius: 12px;
                padding: 20px;
                cursor: pointer;
                transition: transform 0.3s ease, box-shadow 0.3s ease;
            }

            .tournament-card:hover {
                transform: translateY(-5px);
                box-shadow: 0 10px 30px rgba(241, 158, 220, 0.2);
            }

            .tournament-header {
                display: flex;
                justify-content: space-between;
                align-items: flex-start;
                margin-bottom: 15px;
            }

            .tournament-name {
                color: #F5F5F5;
                margin: 0;
                font-size: 1.2rem;
                line-height: 1.4;
            }

            .tournament-status {
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 0.8rem;
                font-weight: 600;
            }

            .status-upcoming { background: #3498db; color: white; }
            .status-ongoing { background: #27ae60; color: white; }
            .status-completed { background: #95a5a6; color: white; }

            .tournament-details {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 10px;
                margin-bottom: 15px;
            }

            .detail-item {
                display: flex;
                flex-direction: column;
                gap: 2px;
            }

            .detail-label {
                color: #999;
                font-size: 0.8rem;
            }

            .detail-value {
                color: #F5F5F5;
                font-weight: 500;
            }

            .detail-value.prize {
                color: #F19EDC;
                font-weight: 700;
            }

            .tournament-tags {
                display: flex;
                flex-wrap: wrap;
                gap: 6px;
                margin-bottom: 15px;
            }

            .tag {
                background: #333;
                color: #F5F5F5;
                padding: 2px 8px;
                border-radius: 12px;
                font-size: 0.75rem;
            }

            .tournament-footer {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding-top: 15px;
                border-top: 1px solid #333;
            }

            .organizer {
                color: #999;
                font-size: 0.85rem;
            }

            .tournament-actions {
                display: flex;
                gap: 8px;
            }

            .btn-join,
            .btn-details {
                padding: 6px 12px;
                border: none;
                border-radius: 4px;
                font-size: 0.85rem;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s ease;
            }

            .btn-join {
                background: #F19EDC;
                color: #1E1E1E;
            }

            .btn-details {
                background: #333;
                color: #F5F5F5;
            }

            .btn-join:hover,
            .btn-details:hover {
                transform: scale(1.05);
            }
        `;
        
        document.head.appendChild(styles);
    }

    addNewsDetailStyles() {
        if (document.getElementById('news-detail-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'news-detail-styles';
        styles.textContent = `
            .news-detail-page {
                max-width: 800px;
                margin: 0 auto;
                padding: 20px;
                background: #0a0a0a;
                min-height: 100vh;
            }

            .news-detail-container {
                background: linear-gradient(135deg, #1e1e1e, #2a2a2a);
                border: 1px solid #333;
                border-radius: 12px;
                overflow: hidden;
            }

            .news-detail-header {
                padding: 20px;
                border-bottom: 1px solid #333;
            }

            .back-btn {
                background: #333;
                border: 1px solid #444;
                color: #F5F5F5;
                padding: 8px 12px;
                border-radius: 6px;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 8px;
                margin-bottom: 15px;
                transition: all 0.2s ease;
            }

            .back-btn:hover {
                background: #444;
            }

            .news-meta {
                display: flex;
                gap: 15px;
                align-items: center;
                flex-wrap: wrap;
            }

            .news-category {
                background: rgba(241, 158, 220, 0.2);
                color: #F19EDC;
                padding: 4px 12px;
                border-radius: 6px;
                font-weight: 600;
                font-size: 0.9rem;
            }

            .news-date {
                color: #999;
                font-size: 0.9rem;
            }

            .featured-badge {
                background: linear-gradient(135deg, #FFD700, #FFA500);
                color: #1E1E1E;
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 0.8rem;
                font-weight: 600;
            }

            .news-article {
                padding: 30px;
            }

            .news-title {
                color: #F5F5F5;
                font-size: 2.2rem;
                margin: 0 0 20px 0;
                line-height: 1.3;
            }

            .news-author-info {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 30px;
                padding-bottom: 15px;
                border-bottom: 1px solid #333;
                color: #999;
                font-size: 0.9rem;
            }

            .news-image {
                margin-bottom: 30px;
                border-radius: 8px;
                overflow: hidden;
            }

            .news-image img {
                width: 100%;
                height: auto;
                display: block;
            }

            .news-content {
                color: #CCC;
                font-size: 1.1rem;
                line-height: 1.7;
                margin-bottom: 30px;
            }

            .news-content p {
                margin-bottom: 15px;
            }

            .news-tags {
                display: flex;
                flex-wrap: wrap;
                gap: 8px;
                margin-bottom: 20px;
            }

            .news-detail-footer {
                padding: 20px;
                border-top: 1px solid #333;
            }

            .news-actions {
                display: flex;
                gap: 10px;
            }

            .share-btn,
            .bookmark-btn {
                background: #333;
                border: 1px solid #444;
                color: #F5F5F5;
                padding: 8px 16px;
                border-radius: 6px;
                cursor: pointer;
                transition: all 0.2s ease;
            }

            .share-btn:hover,
            .bookmark-btn:hover {
                background: #F19EDC;
                color: #1E1E1E;
                border-color: #F19EDC;
            }

            @media (max-width: 768px) {
                .news-detail-page {
                    padding: 10px;
                }

                .news-title {
                    font-size: 1.8rem;
                }

                .news-author-info {
                    flex-direction: column;
                    gap: 10px;
                    align-items: flex-start;
                }
            }
        `;
        
        document.head.appendChild(styles);
    }
}

// Create global router instance
export const router = new Router();
export default Router;
