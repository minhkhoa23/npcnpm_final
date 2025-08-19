// Enhanced Search Component with Real-time Search, Debouncing, and Auto-complete
import { apiCall, API_ENDPOINTS } from '../api.js';

export class SearchComponent {
    constructor(options = {}) {
        this.container = options.container;
        this.searchType = options.searchType || 'tournaments'; // 'tournaments' or 'news'
        this.placeholder = options.placeholder || 'Tìm kiếm...';
        this.onSearchResult = options.onSearchResult || (() => {});
        this.onFiltersChange = options.onFiltersChange || (() => {});
        
        // Search state
        this.searchQuery = '';
        this.filters = {};
        this.debounceTimer = null;
        this.searchCache = new Map();
        
        // UI elements
        this.searchInput = null;
        this.searchSuggestions = null;
        this.filtersContainer = null;
        this.resultsContainer = null;
        
        this.init();
    }

    init() {
        this.createSearchUI();
        this.attachEventListeners();
    }

    createSearchUI() {
        if (!this.container) return;

        this.container.innerHTML = `
            <div class="enhanced-search-container">
                <!-- Search Input with Auto-complete -->
                <div class="search-input-container">
                    <div class="search-input-wrapper">
                        <svg class="search-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <path d="M19 19L14.65 14.65M17 9C17 13.4183 13.4183 17 9 17C4.58172 17 1 13.4183 1 9C1 4.58172 4.58172 1 9 1C13.4183 1 17 4.58172 17 9Z" stroke="#999" stroke-width="2" stroke-linecap="round"/>
                        </svg>
                        <input type="text" class="search-input" placeholder="${this.placeholder}" autocomplete="off">
                        <button class="search-clear" style="display: none;">
                            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                <path d="M12 4L4 12M4 4L12 12" stroke="#999" stroke-width="2" stroke-linecap="round"/>
                            </svg>
                        </button>
                    </div>
                    
                    <!-- Search Suggestions Dropdown -->
                    <div class="search-suggestions" style="display: none;"></div>
                </div>

                <!-- Advanced Filters -->
                <div class="search-filters">
                    ${this.createFiltersHTML()}
                </div>

                <!-- Search Results Info -->
                <div class="search-results-info" style="display: none;">
                    <span class="results-count">0 kết quả</span>
                    <span class="search-time"></span>
                    <button class="clear-search" style="display: none;">Xóa tìm kiếm</button>
                </div>

                <!-- Loading Indicator -->
                <div class="search-loading" style="display: none;">
                    <div class="loading-spinner"></div>
                    <span>Đang tìm kiếm...</span>
                </div>
            </div>
        `;

        // Cache UI elements
        this.searchInput = this.container.querySelector('.search-input');
        this.searchSuggestions = this.container.querySelector('.search-suggestions');
        this.filtersContainer = this.container.querySelector('.search-filters');
        this.resultsInfo = this.container.querySelector('.search-results-info');
        this.loadingIndicator = this.container.querySelector('.search-loading');
        this.clearButton = this.container.querySelector('.search-clear');
        this.clearSearchButton = this.container.querySelector('.clear-search');

        this.addSearchStyles();
    }

    createFiltersHTML() {
        if (this.searchType === 'tournaments') {
            return `
                <div class="filter-group">
                    <label>Trò chơi:</label>
                    <select name="game" class="filter-select">
                        <option value="">Tất cả</option>
                        <option value="League of Legends">League of Legends</option>
                        <option value="CS:GO">CS:GO</option>
                        <option value="Valorant">Valorant</option>
                        <option value="Dota 2">Dota 2</option>
                    </select>
                </div>
                
                <div class="filter-group">
                    <label>Trạng thái:</label>
                    <select name="status" class="filter-select">
                        <option value="">Tất cả</option>
                        <option value="upcoming">Sắp diễn ra</option>
                        <option value="ongoing">Đang diễn ra</option>
                        <option value="completed">Đã kết thúc</option>
                    </select>
                </div>
                
                <div class="filter-group">
                    <label>Thể loại:</label>
                    <select name="category" class="filter-select">
                        <option value="">Tất cả</option>
                        <option value="MOBA">MOBA</option>
                        <option value="FPS">FPS</option>
                        <option value="RTS">RTS</option>
                    </select>
                </div>
                
                <div class="filter-group date-filter">
                    <label>Từ ngày:</label>
                    <input type="date" name="startDate" class="filter-input">
                </div>
                
                <div class="filter-group date-filter">
                    <label>Đến ngày:</label>
                    <input type="date" name="endDate" class="filter-input">
                </div>
            `;
        } else if (this.searchType === 'news') {
            return `
                <div class="filter-group">
                    <label>Danh mục:</label>
                    <select name="category" class="filter-select">
                        <option value="">Tất cả</option>
                        <option value="announcement">Thông báo</option>
                        <option value="update">Cập nhật</option>
                        <option value="schedule">Lịch trình</option>
                        <option value="maintenance">Bảo trì</option>
                    </select>
                </div>
                
                <div class="filter-group">
                    <label>Tác giả:</label>
                    <input type="text" name="author" class="filter-input" placeholder="Tên tác giả">
                </div>
                
                <div class="filter-group">
                    <label>Nổi bật:</label>
                    <select name="featured" class="filter-select">
                        <option value="">Tất cả</option>
                        <option value="true">Có</option>
                        <option value="false">Không</option>
                    </select>
                </div>
                
                <div class="filter-group date-filter">
                    <label>Từ ngày:</label>
                    <input type="date" name="startDate" class="filter-input">
                </div>
                
                <div class="filter-group date-filter">
                    <label>Đến ngày:</label>
                    <input type="date" name="endDate" class="filter-input">
                </div>
                
                <div class="filter-group">
                    <label>Sắp xếp:</label>
                    <select name="sortBy" class="filter-select">
                        <option value="publishedAt">Ngày đăng</option>
                        <option value="views">Lượt xem</option>
                        <option value="title">Tiêu đề</option>
                    </select>
                </div>
                
                <div class="filter-group">
                    <label>Thứ tự:</label>
                    <select name="sortOrder" class="filter-select">
                        <option value="desc">Giảm dần</option>
                        <option value="asc">Tăng dần</option>
                    </select>
                </div>
            `;
        }
        return '';
    }

    attachEventListeners() {
        // Search input with debouncing
        this.searchInput.addEventListener('input', (e) => {
            this.searchQuery = e.target.value.trim();
            this.toggleClearButton();
            this.debouncedSearch();
        });

        // Search input focus/blur for suggestions
        this.searchInput.addEventListener('focus', () => {
            if (this.searchQuery.length >= 2) {
                this.showSuggestions();
            }
        });

        this.searchInput.addEventListener('blur', () => {
            // Delay hiding to allow clicking on suggestions
            setTimeout(() => this.hideSuggestions(), 150);
        });

        // Clear search button
        this.clearButton.addEventListener('click', () => {
            this.clearSearch();
        });

        // Clear search results button
        this.clearSearchButton.addEventListener('click', () => {
            this.clearAllFilters();
        });

        // Filter changes
        this.filtersContainer.addEventListener('change', (e) => {
            this.handleFilterChange(e);
        });

        // Keyboard navigation for suggestions
        this.searchInput.addEventListener('keydown', (e) => {
            this.handleKeyNavigation(e);
        });
    }

    debouncedSearch() {
        if (this.debounceTimer) {
            clearTimeout(this.debounceTimer);
        }

        this.debounceTimer = setTimeout(() => {
            if (this.searchQuery.length >= 2) {
                this.performSearch();
                this.loadSuggestions();
            } else if (this.searchQuery.length === 0) {
                this.performSearch(); // Show all results
                this.hideSuggestions();
            }
        }, 300); // 300ms debounce
    }

    async performSearch() {
        const startTime = Date.now();
        this.showLoading();

        try {
            // Build search parameters
            const params = new URLSearchParams();
            
            if (this.searchQuery) {
                params.append('search', this.searchQuery);
            }

            // Add filters
            Object.entries(this.filters).forEach(([key, value]) => {
                if (value && value !== '') {
                    params.append(key, value);
                }
            });

            // Add pagination
            params.append('page', '1');
            params.append('limit', '20');

            // Check cache first
            const cacheKey = params.toString();
            if (this.searchCache.has(cacheKey)) {
                const cachedResult = this.searchCache.get(cacheKey);
                this.displayResults(cachedResult, Date.now() - startTime);
                return;
            }

            // Make API call
            const endpoint = this.searchType === 'tournaments' 
                ? API_ENDPOINTS.TOURNAMENTS.BASE 
                : API_ENDPOINTS.NEWS.BASE;
            
            const result = await apiCall(`${endpoint}?${params.toString()}`);
            
            // Cache result
            this.searchCache.set(cacheKey, result);
            
            this.displayResults(result, Date.now() - startTime);
        } catch (error) {
            console.error('Search error:', error);
            this.displayError(error.message);
        } finally {
            this.hideLoading();
        }
    }

    async loadSuggestions() {
        if (this.searchQuery.length < 2) return;

        try {
            const endpoint = this.searchType === 'tournaments' 
                ? API_ENDPOINTS.TOURNAMENTS.BASE + '/search'
                : API_ENDPOINTS.NEWS.BASE + '/search';
            
            const result = await apiCall(`${endpoint}?q=${encodeURIComponent(this.searchQuery)}`);
            this.displaySuggestions(result.suggestions || []);
        } catch (error) {
            console.error('Suggestions error:', error);
        }
    }

    displayResults(result, searchTime) {
        const count = result.pagination ? result.pagination.totalItems : result.count || 0;
        this.updateResultsInfo(count, searchTime);
        
        // Call the callback with results
        this.onSearchResult(result);
    }

    displaySuggestions(suggestions) {
        if (!suggestions.length) {
            this.hideSuggestions();
            return;
        }

        this.searchSuggestions.innerHTML = suggestions.map(suggestion => `
            <div class="suggestion-item" data-suggestion="${suggestion}">
                <svg class="suggestion-icon" width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M15 15L11.65 11.65M13 7C13 10.3137 10.3137 13 7 13C3.68629 13 1 10.3137 1 7C1 3.68629 3.68629 1 7 1C10.3137 1 13 3.68629 13 7Z" stroke="#999" stroke-width="1.5"/>
                </svg>
                <span>${suggestion}</span>
            </div>
        `).join('');

        // Add click listeners to suggestions
        this.searchSuggestions.querySelectorAll('.suggestion-item').forEach(item => {
            item.addEventListener('click', () => {
                this.selectSuggestion(item.dataset.suggestion);
            });
        });

        this.showSuggestions();
    }

    selectSuggestion(suggestion) {
        this.searchInput.value = suggestion;
        this.searchQuery = suggestion;
        this.hideSuggestions();
        this.debouncedSearch();
    }

    showSuggestions() {
        this.searchSuggestions.style.display = 'block';
    }

    hideSuggestions() {
        this.searchSuggestions.style.display = 'none';
    }

    handleFilterChange(e) {
        const { name, value } = e.target;
        this.filters[name] = value;
        this.debouncedSearch();
        this.onFiltersChange(this.filters);
    }

    handleKeyNavigation(e) {
        const suggestions = this.searchSuggestions.querySelectorAll('.suggestion-item');
        if (!suggestions.length) return;

        const currentActive = this.searchSuggestions.querySelector('.suggestion-item.active');
        let activeIndex = currentActive ? Array.from(suggestions).indexOf(currentActive) : -1;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                activeIndex = (activeIndex + 1) % suggestions.length;
                break;
            case 'ArrowUp':
                e.preventDefault();
                activeIndex = activeIndex <= 0 ? suggestions.length - 1 : activeIndex - 1;
                break;
            case 'Enter':
                e.preventDefault();
                if (currentActive) {
                    this.selectSuggestion(currentActive.dataset.suggestion);
                }
                return;
            case 'Escape':
                this.hideSuggestions();
                return;
            default:
                return;
        }

        // Update active suggestion
        suggestions.forEach((item, index) => {
            item.classList.toggle('active', index === activeIndex);
        });
    }

    updateResultsInfo(count, searchTime) {
        const resultsText = count === 1 ? '1 kết quả' : `${count.toLocaleString()} kết quả`;
        const timeText = `(${searchTime}ms)`;
        
        this.resultsInfo.querySelector('.results-count').textContent = resultsText;
        this.resultsInfo.querySelector('.search-time').textContent = timeText;
        this.resultsInfo.style.display = 'flex';
        
        this.clearSearchButton.style.display = 
            (this.searchQuery || Object.keys(this.filters).some(key => this.filters[key])) ? 'inline-block' : 'none';
    }

    toggleClearButton() {
        this.clearButton.style.display = this.searchQuery ? 'block' : 'none';
    }

    clearSearch() {
        this.searchInput.value = '';
        this.searchQuery = '';
        this.toggleClearButton();
        this.hideSuggestions();
        this.debouncedSearch();
    }

    clearAllFilters() {
        this.searchInput.value = '';
        this.searchQuery = '';
        this.filters = {};
        
        // Reset all filter inputs
        this.filtersContainer.querySelectorAll('input, select').forEach(input => {
            input.value = '';
        });

        this.toggleClearButton();
        this.hideSuggestions();
        this.resultsInfo.style.display = 'none';
        this.performSearch();
    }

    showLoading() {
        this.loadingIndicator.style.display = 'flex';
    }

    hideLoading() {
        this.loadingIndicator.style.display = 'none';
    }

    displayError(message) {
        this.resultsInfo.innerHTML = `
            <span class="error-message">❌ Lỗi: ${message}</span>
        `;
        this.resultsInfo.style.display = 'flex';
    }

    addSearchStyles() {
        if (document.getElementById('search-component-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'search-component-styles';
        styles.textContent = `
            .enhanced-search-container {
                background: linear-gradient(135deg, #1e1e1e 0%, #2a2a2a 100%);
                border-radius: 12px;
                padding: 20px;
                margin-bottom: 20px;
                border: 1px solid #333;
            }

            .search-input-container {
                position: relative;
                margin-bottom: 20px;
            }

            .search-input-wrapper {
                position: relative;
                display: flex;
                align-items: center;
                background: #333;
                border-radius: 8px;
                border: 2px solid transparent;
                transition: border-color 0.3s ease;
            }

            .search-input-wrapper:focus-within {
                border-color: #F19EDC;
            }

            .search-icon {
                position: absolute;
                left: 12px;
                z-index: 2;
            }

            .search-input {
                width: 100%;
                padding: 12px 16px 12px 44px;
                background: transparent;
                border: none;
                color: #F5F5F5;
                font-size: 16px;
                outline: none;
            }

            .search-input::placeholder {
                color: #999;
            }

            .search-clear {
                position: absolute;
                right: 12px;
                background: none;
                border: none;
                cursor: pointer;
                padding: 4px;
                border-radius: 4px;
                transition: background-color 0.2s ease;
            }

            .search-clear:hover {
                background: #444;
            }

            .search-suggestions {
                position: absolute;
                top: 100%;
                left: 0;
                right: 0;
                background: #333;
                border-radius: 8px;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
                z-index: 1000;
                max-height: 300px;
                overflow-y: auto;
                border: 1px solid #444;
            }

            .suggestion-item {
                display: flex;
                align-items: center;
                padding: 12px 16px;
                cursor: pointer;
                transition: background-color 0.2s ease;
                border-bottom: 1px solid #444;
            }

            .suggestion-item:last-child {
                border-bottom: none;
            }

            .suggestion-item:hover,
            .suggestion-item.active {
                background: #444;
            }

            .suggestion-icon {
                margin-right: 12px;
                flex-shrink: 0;
            }

            .search-filters {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 15px;
                margin-bottom: 20px;
            }

            .filter-group {
                display: flex;
                flex-direction: column;
                gap: 5px;
            }

            .filter-group label {
                color: #F5F5F5;
                font-size: 14px;
                font-weight: 500;
            }

            .filter-select,
            .filter-input {
                padding: 8px 12px;
                background: #333;
                border: 1px solid #444;
                border-radius: 6px;
                color: #F5F5F5;
                font-size: 14px;
                transition: border-color 0.3s ease;
            }

            .filter-select:focus,
            .filter-input:focus {
                outline: none;
                border-color: #F19EDC;
            }

            .search-results-info {
                display: flex;
                align-items: center;
                gap: 10px;
                margin-bottom: 20px;
                padding: 10px 0;
                color: #999;
                font-size: 14px;
            }

            .results-count {
                color: #F19EDC;
                font-weight: 600;
            }

            .clear-search {
                background: #444;
                border: 1px solid #666;
                color: #F5F5F5;
                padding: 4px 12px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 12px;
                transition: background-color 0.2s ease;
            }

            .clear-search:hover {
                background: #555;
            }

            .search-loading {
                display: flex;
                align-items: center;
                gap: 10px;
                color: #999;
                font-size: 14px;
                padding: 20px 0;
            }

            .loading-spinner {
                width: 20px;
                height: 20px;
                border: 2px solid #333;
                border-top: 2px solid #F19EDC;
                border-radius: 50%;
                animation: spin 1s linear infinite;
            }

            .error-message {
                color: #FF6B6B;
                font-weight: 500;
            }

            @media (max-width: 768px) {
                .search-filters {
                    grid-template-columns: 1fr;
                }
                
                .search-results-info {
                    flex-wrap: wrap;
                }
            }
        `;
        
        document.head.appendChild(styles);
    }

    // Public methods for external control
    setFilters(filters) {
        this.filters = { ...filters };
        Object.entries(filters).forEach(([key, value]) => {
            const input = this.filtersContainer.querySelector(`[name="${key}"]`);
            if (input) {
                input.value = value;
            }
        });
        this.performSearch();
    }

    getFilters() {
        return { ...this.filters };
    }

    setSearchQuery(query) {
        this.searchInput.value = query;
        this.searchQuery = query;
        this.toggleClearButton();
        this.performSearch();
    }

    getSearchQuery() {
        return this.searchQuery;
    }
}

export default SearchComponent;