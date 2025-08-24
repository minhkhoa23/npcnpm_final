import { apiCall, API_ENDPOINTS, TokenManager } from '../api.js';
import { authController } from './auth.js';

class NewsController {
    constructor() {
        this.news = [];
        this.currentNews = null;
        this.loading = false;
    }

    // Get all news
    async getAllNews(filters = {}) {
        try {
            this.setLoading(true);
            const queryParams = new URLSearchParams(filters).toString();
            const url = queryParams ? `${API_ENDPOINTS.NEWS.BASE}?${queryParams}` : API_ENDPOINTS.NEWS.BASE;
            
            const result = await apiCall(url, {}, 'GET');
            
            if (result.success) {
                this.news = result.data;
                this.renderNews(this.news);
                return result.data;
            }
        } catch (error) {
            this.showError('Không thể tải danh sách tin tức: ' + error.message);
            throw error;
        } finally {
            this.setLoading(false);
        }
    }

    // Get news by ID
    async getNewsById(newsId) {
        try {
            this.setLoading(true);
            const result = await apiCall(API_ENDPOINTS.NEWS.BY_ID(newsId), {}, 'GET');
            
            if (result.success) {
                this.currentNews = result.data;
                this.renderNewsDetail(result.data);
                return result.data;
            }
        } catch (error) {
            this.showError('Không thể tải thông tin tin tức: ' + error.message);
            throw error;
        } finally {
            this.setLoading(false);
        }
    }

    // Get featured news
    async getFeaturedNews() {
        try {
            this.setLoading(true);
            const result = await apiCall(API_ENDPOINTS.NEWS.FEATURED, {}, 'GET');
            
            if (result.success) {
                this.renderNews(result.data, 'featured');
                return result.data;
            }
        } catch (error) {
            this.showError('Không thể tải tin tức nổi bật: ' + error.message);
            throw error;
        } finally {
            this.setLoading(false);
        }
    }

    // Get news by category
    async getNewsByCategory(category) {
        try {
            this.setLoading(true);
            const result = await apiCall(API_ENDPOINTS.NEWS.BY_CATEGORY(category), {}, 'GET');
            
            if (result.success) {
                this.renderNews(result.data, 'by-category');
                return result.data;
            }
        } catch (error) {
            this.showError('Không thể tải tin tức theo danh mục: ' + error.message);
            throw error;
        } finally {
            this.setLoading(false);
        }
    }

    // Create news (requires admin/organizer role)
    async createNews(newsData) {
        try {
            if (!authController.isAuthenticated()) {
                throw new Error('Vui lòng đăng nhập để tạo tin tức');
            }

            if (!authController.isAdmin() && !authController.isOrganizer()) {
                throw new Error('Chỉ admin và organizer mới c�� thể tạo tin tức');
            }

            this.setLoading(true);
            const result = await apiCall(API_ENDPOINTS.NEWS.BASE, newsData, 'POST', true);
            
            if (result.success) {
                this.showSuccess('Tạo tin tức thành công!');
                
                // Redirect to news detail or management page
                if (result.data && result.data.id) {
                    window.location.href = `/view-news.html?id=${result.data.id}`;
                } else {
                    window.location.href = '/news-management.html';
                }
                
                return result.data;
            }
        } catch (error) {
            this.showError('Tạo tin tức thất bại: ' + error.message);
            throw error;
        } finally {
            this.setLoading(false);
        }
    }

    // Update news (requires admin/organizer role or ownership)
    async updateNews(newsId, updateData) {
        try {
            if (!authController.isAuthenticated()) {
                throw new Error('Vui lòng đăng nhập để cập nhật tin tức');
            }

            this.setLoading(true);
            const result = await apiCall(API_ENDPOINTS.NEWS.BY_ID(newsId), updateData, 'PUT', true);
            
            if (result.success) {
                this.showSuccess('Cập nhật tin tức thành công!');
                
                // Update current news if it's the same
                if (this.currentNews && this.currentNews.id === newsId) {
                    this.currentNews = { ...this.currentNews, ...result.data };
                    this.renderNewsDetail(this.currentNews);
                }
                
                return result.data;
            }
        } catch (error) {
            this.showError('Cập nhật tin tức thất bại: ' + error.message);
            throw error;
        } finally {
            this.setLoading(false);
        }
    }

    // Delete news (requires admin/organizer role or ownership)
    async deleteNews(newsId) {
        try {
            if (!authController.isAuthenticated()) {
                throw new Error('Vui lòng đăng nhập để xóa tin tức');
            }

            if (!confirm('Bạn có chắc chắn muốn xóa tin tức này? Hành động này không thể hoàn tác.')) {
                return;
            }

            this.setLoading(true);
            const result = await apiCall(API_ENDPOINTS.NEWS.BY_ID(newsId), {}, 'DELETE', true);
            
            if (result.success) {
                this.showSuccess('Xóa tin tức thành công!');
                
                // Redirect to news management
                window.location.href = '/news-management.html';
                
                return result;
            }
        } catch (error) {
            this.showError('Xóa tin tức thất bại: ' + error.message);
            throw error;
        } finally {
            this.setLoading(false);
        }
    }

    // Search news
    async searchNews(searchQuery, filters = {}) {
        try {
            this.setLoading(true);
            const searchParams = { 
                q: searchQuery,
                ...filters 
            };
            const queryParams = new URLSearchParams(searchParams).toString();
            const url = `${API_ENDPOINTS.NEWS.BASE}/search?${queryParams}`;
            
            const result = await apiCall(url, {}, 'GET');
            
            if (result.success) {
                this.renderNews(result.data, 'search');
                return result.data;
            }
        } catch (error) {
            this.showError('Tìm kiếm tin tức thất bại: ' + error.message);
            throw error;
        } finally {
            this.setLoading(false);
        }
    }

    // Render news list
    renderNews(newsList, type = 'all') {
        const container = document.getElementById('newsContainer') || 
                         document.getElementById('newsList') ||
                         document.getElementById('newsGrid');
        
        if (!container) return;

        if (newsList.length === 0) {
            container.innerHTML = '<div class="no-data">Không có tin tức nào.</div>';
            return;
        }

        const newsHTML = newsList.map(news => `
            <div class="news-card" data-news-id="${news.id}">
                <div class="news-image">
                    <img src="${news.image || '/assets/default-news.jpg'}" alt="${news.title}">
                    ${news.featured ? '<div class="news-featured">Nổi bật</div>' : ''}
                    <div class="news-category">${news.category}</div>
                </div>
                <div class="news-content">
                    <h3 class="news-title">${news.title}</h3>
                    <p class="news-excerpt">${this.truncateText(news.content, 150)}</p>
                    <div class="news-meta">
                        <span class="news-author">
                            <i class="icon-user"></i>
                            ${news.author?.fullName || 'Admin'}
                        </span>
                        <span class="news-date">
                            <i class="icon-calendar"></i>
                            ${this.formatDate(news.createdAt)}
                        </span>
                    </div>
                </div>
                <div class="news-actions">
                    <button class="btn-primary view-news" data-news-id="${news.id}">
                        Đọc tiếp
                    </button>
                    ${this.renderNewsActionButtons(news)}
                </div>
            </div>
        `).join('');

        container.innerHTML = newsHTML;
        this.initNewsEventListeners();
    }

    // Render news detail
    renderNewsDetail(news) {
        const container = document.getElementById('newsDetail');
        if (!container) return;

        const detailHTML = `
            <article class="news-article">
                <header class="news-header">
                    <div class="news-category-badge">${news.category}</div>
                    <h1 class="news-title">${news.title}</h1>
                    <div class="news-meta">
                        <div class="news-author">
                            <img src="${news.author?.avatar || '/assets/default-avatar.jpg'}" alt="${news.author?.fullName}">
                            <div class="author-info">
                                <span class="author-name">${news.author?.fullName || 'Admin'}</span>
                                <span class="author-role">${news.author?.role || 'Tác giả'}</span>
                            </div>
                        </div>
                        <div class="news-date">
                            <i class="icon-calendar"></i>
                            ${this.formatDateTime(news.createdAt)}
                        </div>
                        ${news.updatedAt !== news.createdAt ? `
                            <div class="news-updated">
                                <i class="icon-edit"></i>
                                Cập nhật: ${this.formatDateTime(news.updatedAt)}
                            </div>
                        ` : ''}
                    </div>
                </header>

                <div class="news-image-main">
                    <img src="${news.image || '/assets/default-news.jpg'}" alt="${news.title}">
                </div>

                <div class="news-content">
                    ${news.content}
                </div>

                <footer class="news-footer">
                    <div class="news-tags">
                        ${news.tags ? news.tags.map(tag => `<span class="tag">${tag}</span>`).join('') : ''}
                    </div>
                    
                    <div class="news-actions-main">
                        ${this.renderDetailActionButtons(news)}
                    </div>
                </footer>
            </article>

            <div class="related-news">
                <h3>Tin tức liên quan</h3>
                <div id="relatedNewsContainer">
                    <!-- Related news will be loaded here -->
                </div>
            </div>
        `;

        container.innerHTML = detailHTML;
        this.initDetailEventListeners();
        this.loadRelatedNews(news.category, news.id);
    }

    // Render news action buttons
    renderNewsActionButtons(news) {
        const user = authController.getCurrentUser();
        if (!user) return '';

        let buttons = '';

        // Edit/Delete buttons for admins, organizers, or authors
        if (user.role === 'admin' || 
            (user.role === 'organizer') || 
            (news.author && news.author.id === user.id)) {
            buttons += `
                <button class="btn-secondary edit-news" data-news-id="${news.id}">Chỉnh sửa</button>
                <button class="btn-danger delete-news" data-news-id="${news.id}">Xóa</button>
            `;
        }

        return buttons;
    }

    // Render detail action buttons
    renderDetailActionButtons(news) {
        const user = authController.getCurrentUser();
        if (!user) return '';

        let buttons = '';

        // Management buttons for admins, organizers, or authors
        if (user.role === 'admin' || 
            (user.role === 'organizer') || 
            (news.author && news.author.id === user.id)) {
            buttons += `
                <div class="management-buttons">
                    <button class="btn-secondary edit-news" data-news-id="${news.id}">
                        <i class="icon-edit"></i> Chỉnh sửa bài viết
                    </button>
                    <button class="btn-danger delete-news" data-news-id="${news.id}">
                        <i class="icon-trash"></i> Xóa bài viết
                    </button>
                    ${user.role === 'admin' ? `
                        <button class="btn-warning toggle-featured" data-news-id="${news.id}" data-featured="${news.featured}">
                            <i class="icon-star"></i> ${news.featured ? 'Bỏ nổi bật' : 'Đánh dấu nổi bật'}
                        </button>
                    ` : ''}
                </div>
            `;
        }

        return buttons;
    }

    // Load related news
    async loadRelatedNews(category, excludeId) {
        try {
            const result = await apiCall(`${API_ENDPOINTS.NEWS.BY_CATEGORY(category)}?limit=3&exclude=${excludeId}`, {}, 'GET');
            
            if (result.success && result.data.length > 0) {
                const relatedContainer = document.getElementById('relatedNewsContainer');
                if (relatedContainer) {
                    const relatedHTML = result.data.map(news => `
                        <div class="related-news-item">
                            <img src="${news.image || '/assets/default-news.jpg'}" alt="${news.title}">
                            <div class="related-news-content">
                                <h4><a href="/view-news.html?id=${news.id}">${news.title}</a></h4>
                                <span class="related-news-date">${this.formatDate(news.createdAt)}</span>
                            </div>
                        </div>
                    `).join('');
                    relatedContainer.innerHTML = relatedHTML;
                }
            }
        } catch (error) {
            console.error('Failed to load related news:', error);
        }
    }

    // Initialize news event listeners
    initNewsEventListeners() {
        // View news detail
        document.querySelectorAll('.view-news').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const newsId = e.target.dataset.newsId;
                window.location.href = `/view-news.html?id=${newsId}`;
            });
        });

        // Edit news
        document.querySelectorAll('.edit-news').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const newsId = e.target.dataset.newsId;
                window.location.href = `/edit-news.html?id=${newsId}`;
            });
        });

        // Delete news
        document.querySelectorAll('.delete-news').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const newsId = e.target.dataset.newsId;
                await this.deleteNews(newsId);
            });
        });
    }

    // Initialize detail event listeners
    initDetailEventListeners() {
        this.initNewsEventListeners();

        // Toggle featured
        document.querySelectorAll('.toggle-featured').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const newsId = e.target.dataset.newsId;
                const isFeatured = e.target.dataset.featured === 'true';
                await this.toggleFeatured(newsId, !isFeatured);
            });
        });
    }

    // Toggle featured status
    async toggleFeatured(newsId, featured) {
        try {
            const result = await apiCall(`${API_ENDPOINTS.NEWS.BY_ID(newsId)}/featured`, { featured }, 'PUT', true);
            
            if (result.success) {
                this.showSuccess(featured ? 'Đã đánh dấu nổi bật' : 'Đã bỏ đánh dấu nổi bật');
                
                // Update current news if it's the same
                if (this.currentNews && this.currentNews.id === newsId) {
                    this.currentNews.featured = featured;
                    this.renderNewsDetail(this.currentNews);
                }
            }
        } catch (error) {
            this.showError('Cập nhật trạng thái nổi bật thất bại: ' + error.message);
        }
    }

    // Helper methods
    truncateText(text, maxLength) {
        if (!text) return '';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength).trim() + '...';
    }

    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('vi-VN');
    }

    formatDateTime(dateString) {
        return new Date(dateString).toLocaleString('vi-VN');
    }

    setLoading(isLoading) {
        this.loading = isLoading;
        const loadingElements = document.querySelectorAll('.loading');
        loadingElements.forEach(element => {
            element.style.display = isLoading ? 'block' : 'none';
        });
    }

    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    showError(message) {
        this.showNotification(message, 'error');
    }

    showNotification(message, type) {
        // Use the same notification system as auth controller
        if (window.authController && window.authController.showNotification) {
            window.authController.showNotification(message, type);
        } else {
            alert(message); // Fallback
        }
    }

    // Initialize form handlers
    initFormHandlers() {
        // News creation form
        const createForm = document.getElementById('createNewsForm');
        if (createForm) {
            createForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const formData = new FormData(createForm);
                const newsData = {
                    title: formData.get('title'),
                    content: formData.get('content'),
                    category: formData.get('category'),
                    image: formData.get('image'),
                    tags: formData.get('tags') ? formData.get('tags').split(',').map(tag => tag.trim()) : [],
                    featured: formData.get('featured') === 'on'
                };
                await this.createNews(newsData);
            });
        }

        // News edit form
        const editForm = document.getElementById('editNewsForm');
        if (editForm) {
            editForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const newsId = editForm.dataset.newsId;
                const formData = new FormData(editForm);
                const updateData = {
                    title: formData.get('title'),
                    content: formData.get('content'),
                    category: formData.get('category'),
                    image: formData.get('image'),
                    tags: formData.get('tags') ? formData.get('tags').split(',').map(tag => tag.trim()) : [],
                    featured: formData.get('featured') === 'on'
                };
                await this.updateNews(newsId, updateData);
            });
        }

        // Search form
        const searchForm = document.getElementById('newsSearchForm');
        if (searchForm) {
            searchForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const formData = new FormData(searchForm);
                const query = formData.get('query');
                const filters = {
                    category: formData.get('category'),
                    author: formData.get('author')
                };
                await this.searchNews(query, filters);
            });
        }
    }
}

// Create global instance
export const newsController = new NewsController();

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    newsController.initFormHandlers();
});
