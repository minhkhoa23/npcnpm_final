// Enhanced News Controller with CRUD operations and Real-time interactions
import { apiCall, API_ENDPOINTS, TokenManager } from '../hybrid-api.js';
import { SearchComponent } from '../components/SearchComponent.js';

export class EnhancedNewsController {
    constructor() {
        this.searchComponent = null;
        this.currentNews = [];
        this.currentPage = 1;
        this.totalPages = 1;
        this.isLoading = false;
        
        // UI elements
        this.newsContainer = null;
        this.searchContainer = null;
        this.paginationContainer = null;
        this.createButton = null;
        
        this.init();
    }

    async init() {
        console.log('Initializing Enhanced News Controller...');
        await this.setupUI();
        await this.loadNews();
    }

    setupUI() {
        const contentElement = document.getElementById('content');
        if (!contentElement) return;

        contentElement.innerHTML = `
            <div class="enhanced-news-management">
                <!-- Header -->
                <header class="news-header">
                    <div class="header-content">
                        <h1 class="page-title">📰 Quản lý Tin tức</h1>
                        <p class="page-subtitle">Tạo, chỉnh sửa và quản lý tin tức của bạn</p>
                    </div>
                    
                    <div class="header-actions">
                        <button class="create-news-btn" id="createNewsBtn">
                            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                                <path d="M10 4V16M4 10H16" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                            </svg>
                            Tạo tin tức mới
                        </button>
                        
                        <div class="view-options">
                            <button class="view-btn active" data-view="grid">
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                    <rect x="1" y="1" width="6" height="6" stroke="currentColor" stroke-width="1.5"/>
                                    <rect x="9" y="1" width="6" height="6" stroke="currentColor" stroke-width="1.5"/>
                                    <rect x="1" y="9" width="6" height="6" stroke="currentColor" stroke-width="1.5"/>
                                    <rect x="9" y="9" width="6" height="6" stroke="currentColor" stroke-width="1.5"/>
                                </svg>
                            </button>
                            <button class="view-btn" data-view="list">
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                    <path d="M1 3H15M1 8H15M1 13H15" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                                </svg>
                            </button>
                        </div>
                    </div>
                </header>

                <!-- Search and Filters -->
                <div id="searchContainer" class="search-section"></div>

                <!-- News Statistics -->
                <div class="news-stats" id="newsStats">
                    <div class="stat-card">
                        <div class="stat-icon">📊</div>
                        <div class="stat-content">
                            <div class="stat-number" id="totalNews">-</div>
                            <div class="stat-label">Tổng tin tức</div>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon">👀</div>
                        <div class="stat-content">
                            <div class="stat-number" id="totalViews">-</div>
                            <div class="stat-label">Tổng lượt xem</div>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon">⭐</div>
                        <div class="stat-content">
                            <div class="stat-number" id="featuredNews">-</div>
                            <div class="stat-label">Tin nổi bật</div>
                        </div>
                    </div>
                    
                    <div class="stat-card">
                        <div class="stat-icon">📈</div>
                        <div class="stat-content">
                            <div class="stat-number" id="avgViews">-</div>
                            <div class="stat-label">TB lượt xem</div>
                        </div>
                    </div>
                </div>

                <!-- News Container -->
                <div class="news-container">
                    <div id="newsGrid" class="news-grid"></div>
                    
                    <!-- Loading State -->
                    <div id="loadingState" class="loading-state" style="display: none;">
                        <div class="loading-spinner"></div>
                        <p>Đang tải tin tức...</p>
                    </div>
                    
                    <!-- Empty State -->
                    <div id="emptyState" class="empty-state" style="display: none;">
                        <div class="empty-icon">📰</div>
                        <h3>Chưa có tin tức nào</h3>
                        <p>Tạo tin tức đầu tiên của bạn để bắt đầu</p>
                        <button class="create-news-btn">Tạo tin tức mới</button>
                    </div>
                </div>

                <!-- Pagination -->
                <div id="paginationContainer" class="pagination-container"></div>
            </div>

            <!-- News Creation/Edit Modal -->
            <div id="newsModal" class="modal" style="display: none;">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2 id="modalTitle">Tạo tin tức mới</h2>
                        <button class="modal-close" id="modalClose">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                                <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                            </svg>
                        </button>
                    </div>
                    
                    <form id="newsForm" class="news-form">
                        <div class="form-row">
                            <div class="form-group">
                                <label for="newsTitle">Tiêu đề *</label>
                                <input type="text" id="newsTitle" name="title" required maxlength="200">
                                <div class="char-count"><span id="titleCount">0</span>/200</div>
                            </div>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label for="newsExcerpt">Tóm tắt</label>
                                <textarea id="newsExcerpt" name="excerpt" rows="3" maxlength="300"></textarea>
                                <div class="char-count"><span id="excerptCount">0</span>/300</div>
                            </div>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label for="newsContent">Nội dung *</label>
                                <textarea id="newsContent" name="content" rows="10" required></textarea>
                            </div>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label for="newsCategory">Danh mục</label>
                                <select id="newsCategory" name="category">
                                    <option value="general">Chung</option>
                                    <option value="announcement">Thông báo</option>
                                    <option value="update">Cập nhật</option>
                                    <option value="schedule">Lịch trình</option>
                                    <option value="maintenance">Bảo trì</option>
                                </select>
                            </div>
                            
                            <div class="form-group">
                                <label for="newsTags">Tags (phân cách bằng dấu phẩy)</label>
                                <input type="text" id="newsTags" name="tags" placeholder="tournament, esports, gaming">
                            </div>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group checkbox-group">
                                <label class="checkbox-label">
                                    <input type="checkbox" id="newsFeatured" name="featured">
                                    <span class="checkmark"></span>
                                    Đánh dấu là tin nổi bật
                                </label>
                            </div>
                        </div>
                        
                        <div class="form-actions">
                            <button type="button" class="btn-cancel" id="cancelBtn">Hủy</button>
                            <button type="submit" class="btn-save" id="saveBtn">
                                <span class="btn-text">Lưu tin tức</span>
                                <div class="btn-loading" style="display: none;">
                                    <div class="loading-spinner small"></div>
                                </div>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        // Cache UI elements
        this.newsContainer = document.getElementById('newsGrid');
        this.searchContainer = document.getElementById('searchContainer');
        this.paginationContainer = document.getElementById('paginationContainer');
        
        this.setupEventListeners();
        this.initializeSearchComponent();
        this.addStyles();
    }

    setupEventListeners() {
        // Create news button
        document.addEventListener('click', (e) => {
            if (e.target.closest('.create-news-btn')) {
                this.openCreateModal();
            }
        });

        // View toggle
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
                e.target.closest('.view-btn').classList.add('active');
                this.toggleView(e.target.closest('.view-btn').dataset.view);
            });
        });

        // Modal events
        const modal = document.getElementById('newsModal');
        const modalClose = document.getElementById('modalClose');
        const cancelBtn = document.getElementById('cancelBtn');
        const newsForm = document.getElementById('newsForm');

        modalClose.addEventListener('click', () => this.closeModal());
        cancelBtn.addEventListener('click', () => this.closeModal());
        
        modal.addEventListener('click', (e) => {
            if (e.target === modal) this.closeModal();
        });

        newsForm.addEventListener('submit', (e) => this.handleFormSubmit(e));

        // Character counters
        this.setupCharacterCounters();
    }

    initializeSearchComponent() {
        this.searchComponent = new SearchComponent({
            container: this.searchContainer,
            searchType: 'news',
            placeholder: 'Tìm kiếm tin tức theo tiêu đề, nội dung, tags...',
            onSearchResult: (result) => this.handleSearchResults(result),
            onFiltersChange: (filters) => this.handleFiltersChange(filters)
        });
    }

    async loadNews(page = 1) {
        if (this.isLoading) return;
        
        this.isLoading = true;
        this.showLoading();

        try {
            const result = await apiCall(`${API_ENDPOINTS.NEWS.BASE}?page=${page}&limit=12`);
            
            this.currentNews = result.data || [];
            this.currentPage = result.pagination?.currentPage || 1;
            this.totalPages = result.pagination?.totalPages || 1;
            
            this.renderNews();
            this.renderPagination();
            await this.loadStatistics();
            
        } catch (error) {
            console.error('Error loading news:', error);
            this.showError('Không thể tải tin tức. Vui lòng thử lại.');
        } finally {
            this.isLoading = false;
            this.hideLoading();
        }
    }

    async loadStatistics() {
        try {
            const stats = await apiCall('/api/analytics/news');
            this.updateStatistics(stats.data);
        } catch (error) {
            console.error('Error loading statistics:', error);
        }
    }

    renderNews() {
        if (!this.currentNews.length) {
            this.showEmptyState();
            return;
        }

        this.hideEmptyState();
        
        this.newsContainer.innerHTML = this.currentNews.map(news => this.createNewsCard(news)).join('');
        
        // Add event listeners for news cards
        this.newsContainer.querySelectorAll('.news-card').forEach(card => {
            const newsId = card.dataset.newsId;
            
            card.querySelector('.news-title, .news-excerpt, .news-image').addEventListener('click', () => {
                this.viewNews(newsId);
            });
            
            card.querySelector('.edit-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                this.editNews(newsId);
            });
            
            card.querySelector('.delete-btn').addEventListener('click', (e) => {
                e.stopPropagation();
                this.deleteNews(newsId);
            });
        });
    }

    createNewsCard(news) {
        const publishedDate = new Date(news.publishedAt).toLocaleDateString('vi-VN');
        const featuredBadge = news.featured ? '<span class="featured-badge">⭐ Nổi bật</span>' : '';
        
        return `
            <div class="news-card" data-news-id="${news.id}">
                <div class="news-image">
                    <img src="${news.imageUrl || 'https://via.placeholder.com/400x200'}" alt="${news.title}">
                    ${featuredBadge}
                    <div class="news-overlay">
                        <button class="btn-view">Xem chi tiết</button>
                    </div>
                </div>
                
                <div class="news-content">
                    <div class="news-meta">
                        <span class="news-category">${this.getCategoryLabel(news.category)}</span>
                        <span class="news-date">${publishedDate}</span>
                    </div>
                    
                    <h3 class="news-title">${news.title}</h3>
                    <p class="news-excerpt">${news.excerpt || news.content.substring(0, 120) + '...'}</p>
                    
                    <div class="news-tags">
                        ${(news.tags || []).map(tag => `<span class="tag">${tag}</span>`).join('')}
                    </div>
                    
                    <div class="news-stats">
                        <span class="stat">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                <path d="M1 8C1 8 3 3 8 3C13 3 15 8 15 8C15 8 13 13 8 13C3 13 1 8 1 8Z" stroke="currentColor" fill="none"/>
                                <circle cx="8" cy="8" r="2" stroke="currentColor" fill="none"/>
                            </svg>
                            ${news.views || 0}
                        </span>
                        <span class="stat">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                <path d="M13 2L8 7L5 4L1 8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                            </svg>
                            ${news.author}
                        </span>
                    </div>
                </div>
                
                <div class="news-actions">
                    <button class="action-btn edit-btn" title="Chỉnh sửa">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M11.5 2.5L13.5 4.5L5 13H3V11L11.5 2.5Z" stroke="currentColor" fill="none"/>
                        </svg>
                    </button>
                    <button class="action-btn delete-btn" title="Xóa">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M10 6V12M6 6V12M2 4H14M12 4V14C12 14.5 11.5 15 11 15H5C4.5 15 4 14.5 4 14V4M7 4V2C7 1.5 7.5 1 8 1H8C8.5 1 9 1.5 9 2V4" stroke="currentColor" fill="none"/>
                        </svg>
                    </button>
                </div>
            </div>
        `;
    }

    handleSearchResults(result) {
        this.currentNews = result.data || [];
        this.renderNews();
        
        if (result.pagination) {
            this.currentPage = result.pagination.currentPage;
            this.totalPages = result.pagination.totalPages;
            this.renderPagination();
        }
    }

    handleFiltersChange(filters) {
        console.log('Filters changed:', filters);
    }

    async openCreateModal() {
        document.getElementById('modalTitle').textContent = 'Tạo tin tức mới';
        document.getElementById('newsForm').reset();
        document.getElementById('newsModal').style.display = 'flex';
        document.body.style.overflow = 'hidden';
        
        // Reset form state
        this.currentEditingId = null;
        this.updateCharacterCounters();
    }

    async editNews(newsId) {
        try {
            const news = this.currentNews.find(n => n.id === newsId);
            if (!news) throw new Error('News not found');
            
            // Populate form
            document.getElementById('newsTitle').value = news.title;
            document.getElementById('newsExcerpt').value = news.excerpt || '';
            document.getElementById('newsContent').value = news.content;
            document.getElementById('newsCategory').value = news.category;
            document.getElementById('newsTags').value = (news.tags || []).join(', ');
            document.getElementById('newsFeatured').checked = news.featured;
            
            this.currentEditingId = newsId;
            document.getElementById('modalTitle').textContent = 'Chỉnh sửa tin tức';
            document.getElementById('newsModal').style.display = 'flex';
            document.body.style.overflow = 'hidden';
            
            this.updateCharacterCounters();
            
        } catch (error) {
            console.error('Error loading news for edit:', error);
            window.showNotification('Không thể tải thông tin tin tức', 'error');
        }
    }

    async deleteNews(newsId) {
        const news = this.currentNews.find(n => n.id === newsId);
        if (!news) return;
        
        if (!confirm(`Bạn có chắc chắn muốn xóa tin tức "${news.title}"?`)) return;
        
        try {
            await apiCall(`${API_ENDPOINTS.NEWS.BASE}/${newsId}`, {}, 'DELETE', true);
            
            window.showNotification('Xóa tin tức thành công', 'success');
            await this.loadNews(this.currentPage);
            
        } catch (error) {
            console.error('Error deleting news:', error);
            window.showNotification('Không thể xóa tin tức', 'error');
        }
    }

    async handleFormSubmit(e) {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const newsData = {
            title: formData.get('title'),
            excerpt: formData.get('excerpt'),
            content: formData.get('content'),
            category: formData.get('category'),
            tags: formData.get('tags').split(',').map(tag => tag.trim()).filter(tag => tag),
            featured: formData.get('featured') === 'on'
        };
        
        try {
            this.setFormLoading(true);
            
            let result;
            if (this.currentEditingId) {
                result = await apiCall(`${API_ENDPOINTS.NEWS.BASE}/${this.currentEditingId}`, newsData, 'PUT', true);
                window.showNotification('Cập nhật tin tức thành công', 'success');
            } else {
                result = await apiCall(API_ENDPOINTS.NEWS.BASE, newsData, 'POST', true);
                window.showNotification('Tạo tin tức thành công', 'success');
            }
            
            this.closeModal();
            await this.loadNews(this.currentPage);
            
        } catch (error) {
            console.error('Error saving news:', error);
            window.showNotification('Không thể lưu tin tức', 'error');
        } finally {
            this.setFormLoading(false);
        }
    }

    viewNews(newsId) {
        // Navigate to news detail page
        if (window.router) {
            window.router.navigate(`/news/${newsId}`);
        } else {
            window.location.href = `src/frontend/view-news.html?id=${newsId}`;
        }
    }

    closeModal() {
        document.getElementById('newsModal').style.display = 'none';
        document.body.style.overflow = 'auto';
        this.currentEditingId = null;
    }

    setFormLoading(loading) {
        const saveBtn = document.getElementById('saveBtn');
        const btnText = saveBtn.querySelector('.btn-text');
        const btnLoading = saveBtn.querySelector('.btn-loading');
        
        if (loading) {
            btnText.style.display = 'none';
            btnLoading.style.display = 'flex';
            saveBtn.disabled = true;
        } else {
            btnText.style.display = 'block';
            btnLoading.style.display = 'none';
            saveBtn.disabled = false;
        }
    }

    setupCharacterCounters() {
        const titleInput = document.getElementById('newsTitle');
        const excerptInput = document.getElementById('newsExcerpt');
        
        titleInput.addEventListener('input', () => this.updateCharacterCounter('title'));
        excerptInput.addEventListener('input', () => this.updateCharacterCounter('excerpt'));
    }

    updateCharacterCounter(field) {
        const input = document.getElementById(`news${field.charAt(0).toUpperCase() + field.slice(1)}`);
        const counter = document.getElementById(`${field}Count`);
        counter.textContent = input.value.length;
    }

    updateCharacterCounters() {
        this.updateCharacterCounter('title');
        this.updateCharacterCounter('excerpt');
    }

    updateStatistics(stats) {
        document.getElementById('totalNews').textContent = stats.totalNews || 0;
        document.getElementById('totalViews').textContent = (stats.totalViews || 0).toLocaleString();
        document.getElementById('featuredNews').textContent = stats.featuredNews || 0;
        document.getElementById('avgViews').textContent = stats.averageViews || 0;
    }

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

    toggleView(view) {
        this.newsContainer.className = view === 'list' ? 'news-list' : 'news-grid';
    }

    renderPagination() {
        if (this.totalPages <= 1) {
            this.paginationContainer.innerHTML = '';
            return;
        }

        const pagination = [];
        const current = this.currentPage;
        const total = this.totalPages;

        // Previous button
        if (current > 1) {
            pagination.push(`<button class="page-btn" data-page="${current - 1}">‹</button>`);
        }

        // Page numbers
        for (let i = Math.max(1, current - 2); i <= Math.min(total, current + 2); i++) {
            const active = i === current ? 'active' : '';
            pagination.push(`<button class="page-btn ${active}" data-page="${i}">${i}</button>`);
        }

        // Next button
        if (current < total) {
            pagination.push(`<button class="page-btn" data-page="${current + 1}">›</button>`);
        }

        this.paginationContainer.innerHTML = `
            <div class="pagination">
                ${pagination.join('')}
            </div>
        `;

        // Add event listeners
        this.paginationContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('page-btn') && !e.target.classList.contains('active')) {
                const page = parseInt(e.target.dataset.page);
                this.loadNews(page);
            }
        });
    }

    showLoading() {
        document.getElementById('loadingState').style.display = 'flex';
        this.newsContainer.style.display = 'none';
    }

    hideLoading() {
        document.getElementById('loadingState').style.display = 'none';
        this.newsContainer.style.display = 'grid';
    }

    showEmptyState() {
        document.getElementById('emptyState').style.display = 'flex';
        this.newsContainer.style.display = 'none';
    }

    hideEmptyState() {
        document.getElementById('emptyState').style.display = 'none';
        this.newsContainer.style.display = 'grid';
    }

    showError(message) {
        window.showNotification(message, 'error');
    }

    addStyles() {
        if (document.getElementById('enhanced-news-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'enhanced-news-styles';
        styles.textContent = `
            .enhanced-news-management {
                max-width: 1400px;
                margin: 0 auto;
                padding: 20px;
                background: #0a0a0a;
                min-height: 100vh;
            }

            .news-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 30px;
                padding: 20px 0;
                border-bottom: 1px solid #333;
            }

            .header-content h1 {
                color: #F5F5F5;
                font-size: 2.5rem;
                margin: 0 0 5px 0;
                background: linear-gradient(135deg, #F19EDC, #E081C7);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
            }

            .header-content p {
                color: #999;
                margin: 0;
                font-size: 1.1rem;
            }

            .header-actions {
                display: flex;
                align-items: center;
                gap: 15px;
            }

            .create-news-btn {
                display: flex;
                align-items: center;
                gap: 8px;
                background: linear-gradient(135deg, #F19EDC, #E081C7);
                color: #1E1E1E;
                border: none;
                padding: 12px 20px;
                border-radius: 8px;
                font-weight: 600;
                cursor: pointer;
                transition: transform 0.2s ease;
            }

            .create-news-btn:hover {
                transform: translateY(-2px);
            }

            .view-options {
                display: flex;
                background: #333;
                border-radius: 6px;
                padding: 2px;
            }

            .view-btn {
                background: none;
                border: none;
                color: #999;
                padding: 8px 12px;
                border-radius: 4px;
                cursor: pointer;
                transition: all 0.2s ease;
            }

            .view-btn.active {
                background: #F19EDC;
                color: #1E1E1E;
            }

            .news-stats {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 20px;
                margin-bottom: 30px;
            }

            .stat-card {
                background: linear-gradient(135deg, #1e1e1e, #2a2a2a);
                border: 1px solid #333;
                border-radius: 12px;
                padding: 20px;
                display: flex;
                align-items: center;
                gap: 15px;
            }

            .stat-icon {
                font-size: 2rem;
                width: 50px;
                height: 50px;
                display: flex;
                align-items: center;
                justify-content: center;
                background: rgba(241, 158, 220, 0.1);
                border-radius: 10px;
            }

            .stat-number {
                font-size: 1.8rem;
                font-weight: 700;
                color: #F19EDC;
                margin-bottom: 5px;
            }

            .stat-label {
                color: #999;
                font-size: 0.9rem;
            }

            .news-grid {
                display: grid;
                grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
                gap: 20px;
                margin-bottom: 30px;
            }

            .news-list {
                display: flex;
                flex-direction: column;
                gap: 15px;
                margin-bottom: 30px;
            }

            .news-card {
                background: linear-gradient(135deg, #1e1e1e, #2a2a2a);
                border: 1px solid #333;
                border-radius: 12px;
                overflow: hidden;
                transition: transform 0.3s ease, box-shadow 0.3s ease;
                cursor: pointer;
            }

            .news-card:hover {
                transform: translateY(-5px);
                box-shadow: 0 10px 30px rgba(241, 158, 220, 0.2);
            }

            .news-image {
                position: relative;
                height: 200px;
                overflow: hidden;
            }

            .news-image img {
                width: 100%;
                height: 100%;
                object-fit: cover;
                transition: transform 0.3s ease;
            }

            .news-card:hover .news-image img {
                transform: scale(1.05);
            }

            .featured-badge {
                position: absolute;
                top: 10px;
                right: 10px;
                background: linear-gradient(135deg, #FFD700, #FFA500);
                color: #1E1E1E;
                padding: 4px 8px;
                border-radius: 4px;
                font-size: 0.8rem;
                font-weight: 600;
            }

            .news-overlay {
                position: absolute;
                bottom: 0;
                left: 0;
                right: 0;
                background: linear-gradient(transparent, rgba(0,0,0,0.8));
                padding: 20px;
                transform: translateY(100%);
                transition: transform 0.3s ease;
            }

            .news-card:hover .news-overlay {
                transform: translateY(0);
            }

            .btn-view {
                background: #F19EDC;
                color: #1E1E1E;
                border: none;
                padding: 8px 16px;
                border-radius: 6px;
                font-weight: 600;
                cursor: pointer;
            }

            .news-content {
                padding: 20px;
            }

            .news-meta {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 10px;
                font-size: 0.85rem;
            }

            .news-category {
                background: rgba(241, 158, 220, 0.2);
                color: #F19EDC;
                padding: 4px 8px;
                border-radius: 4px;
                font-weight: 600;
            }

            .news-date {
                color: #999;
            }

            .news-title {
                color: #F5F5F5;
                font-size: 1.1rem;
                margin: 0 0 10px 0;
                line-height: 1.4;
            }

            .news-excerpt {
                color: #CCC;
                margin: 0 0 15px 0;
                line-height: 1.5;
            }

            .news-tags {
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

            .news-stats {
                display: flex;
                justify-content: space-between;
                color: #999;
                font-size: 0.85rem;
            }

            .stat {
                display: flex;
                align-items: center;
                gap: 4px;
            }

            .news-actions {
                position: absolute;
                top: 10px;
                right: 10px;
                display: flex;
                gap: 5px;
                opacity: 0;
                transition: opacity 0.3s ease;
            }

            .news-card:hover .news-actions {
                opacity: 1;
            }

            .action-btn {
                background: rgba(0, 0, 0, 0.8);
                border: none;
                color: #F5F5F5;
                padding: 8px;
                border-radius: 4px;
                cursor: pointer;
                transition: background-color 0.2s ease;
            }

            .action-btn:hover {
                background: rgba(0, 0, 0, 0.9);
            }

            .delete-btn:hover {
                background: #FF6B6B;
            }

            /* Modal Styles */
            .modal {
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.8);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
            }

            .modal-content {
                background: #1e1e1e;
                border-radius: 12px;
                width: 90%;
                max-width: 600px;
                max-height: 90vh;
                overflow-y: auto;
                border: 1px solid #333;
            }

            .modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 20px;
                border-bottom: 1px solid #333;
            }

            .modal-header h2 {
                color: #F5F5F5;
                margin: 0;
            }

            .modal-close {
                background: none;
                border: none;
                color: #999;
                cursor: pointer;
                padding: 5px;
            }

            .news-form {
                padding: 20px;
            }

            .form-row {
                display: grid;
                grid-template-columns: 1fr;
                gap: 15px;
                margin-bottom: 20px;
            }

            .form-group {
                display: flex;
                flex-direction: column;
                gap: 5px;
            }

            .form-group label {
                color: #F5F5F5;
                font-weight: 500;
            }

            .form-group input,
            .form-group textarea,
            .form-group select {
                background: #333;
                border: 1px solid #444;
                border-radius: 6px;
                padding: 10px;
                color: #F5F5F5;
                font-size: 14px;
            }

            .form-group input:focus,
            .form-group textarea:focus,
            .form-group select:focus {
                outline: none;
                border-color: #F19EDC;
            }

            .char-count {
                align-self: flex-end;
                color: #999;
                font-size: 0.8rem;
            }

            .checkbox-group {
                flex-direction: row;
                align-items: center;
            }

            .checkbox-label {
                display: flex;
                align-items: center;
                gap: 10px;
                cursor: pointer;
            }

            .form-actions {
                display: flex;
                gap: 10px;
                justify-content: flex-end;
                margin-top: 30px;
            }

            .btn-cancel,
            .btn-save {
                padding: 10px 20px;
                border-radius: 6px;
                border: none;
                font-weight: 600;
                cursor: pointer;
                transition: all 0.2s ease;
            }

            .btn-cancel {
                background: #444;
                color: #F5F5F5;
            }

            .btn-save {
                background: #F19EDC;
                color: #1E1E1E;
                display: flex;
                align-items: center;
                gap: 8px;
            }

            .btn-save:disabled {
                opacity: 0.6;
                cursor: not-allowed;
            }

            /* Loading and Empty States */
            .loading-state,
            .empty-state {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                padding: 60px 20px;
                text-align: center;
                color: #999;
            }

            .empty-icon {
                font-size: 4rem;
                margin-bottom: 20px;
            }

            .empty-state h3 {
                color: #F5F5F5;
                margin-bottom: 10px;
            }

            /* Pagination */
            .pagination {
                display: flex;
                justify-content: center;
                gap: 5px;
            }

            .page-btn {
                background: #333;
                border: 1px solid #444;
                color: #F5F5F5;
                padding: 8px 12px;
                border-radius: 4px;
                cursor: pointer;
                transition: all 0.2s ease;
            }

            .page-btn:hover,
            .page-btn.active {
                background: #F19EDC;
                color: #1E1E1E;
                border-color: #F19EDC;
            }

            @media (max-width: 768px) {
                .news-header {
                    flex-direction: column;
                    gap: 20px;
                    align-items: flex-start;
                }

                .news-grid {
                    grid-template-columns: 1fr;
                }

                .news-stats {
                    grid-template-columns: repeat(2, 1fr);
                }

                .form-row {
                    grid-template-columns: 1fr;
                }
            }
        `;
        
        document.head.appendChild(styles);
    }
}

export default EnhancedNewsController;
