import { apiCall, API_ENDPOINTS, TokenManager } from '../api.js';
import { authController } from './auth.js';

class TournamentController {
    constructor() {
        this.tournaments = [];
        this.currentTournament = null;
        this.loading = false;
    }

    // Get all tournaments
    async getAllTournaments(filters = {}) {
        try {
            this.setLoading(true);
            const queryParams = new URLSearchParams(filters).toString();
            const url = queryParams ? `${API_ENDPOINTS.TOURNAMENTS.BASE}?${queryParams}` : API_ENDPOINTS.TOURNAMENTS.BASE;
            
            const result = await apiCall(url, {}, 'GET');
            
            if (result.success) {
                this.tournaments = result.data;
                this.renderTournaments(this.tournaments);
                return result.data;
            }
        } catch (error) {
            this.showError('Không thể tải danh sách giải đấu: ' + error.message);
            throw error;
        } finally {
            this.setLoading(false);
        }
    }

    // Get upcoming tournaments
    async getUpcomingTournaments() {
        try {
            this.setLoading(true);
            const result = await apiCall(API_ENDPOINTS.TOURNAMENTS.UPCOMING, {}, 'GET');
            
            if (result.success) {
                this.renderTournaments(result.data, 'upcoming');
                return result.data;
            }
        } catch (error) {
            this.showError('Không thể tải giải đấu sắp tới: ' + error.message);
            throw error;
        } finally {
            this.setLoading(false);
        }
    }

    // Get ongoing tournaments
    async getOngoingTournaments() {
        try {
            this.setLoading(true);
            const result = await apiCall(API_ENDPOINTS.TOURNAMENTS.ONGOING, {}, 'GET');
            
            if (result.success) {
                this.renderTournaments(result.data, 'ongoing');
                return result.data;
            }
        } catch (error) {
            this.showError('Không thể tải giải đấu đang diễn ra: ' + error.message);
            throw error;
        } finally {
            this.setLoading(false);
        }
    }

    // Search tournaments
    async searchTournaments(searchQuery, filters = {}) {
        try {
            this.setLoading(true);
            const searchParams = { 
                q: searchQuery,
                ...filters 
            };
            const queryParams = new URLSearchParams(searchParams).toString();
            const url = `${API_ENDPOINTS.TOURNAMENTS.SEARCH}?${queryParams}`;
            
            const result = await apiCall(url, {}, 'GET');
            
            if (result.success) {
                this.renderTournaments(result.data, 'search');
                return result.data;
            }
        } catch (error) {
            this.showError('Tìm kiếm thất bại: ' + error.message);
            throw error;
        } finally {
            this.setLoading(false);
        }
    }

    // Get tournament by ID
    async getTournamentById(tournamentId) {
        try {
            this.setLoading(true);
            const result = await apiCall(API_ENDPOINTS.TOURNAMENTS.BY_ID(tournamentId), {}, 'GET');
            
            if (result.success) {
                this.currentTournament = result.data;
                this.renderTournamentDetail(result.data);
                return result.data;
            }
        } catch (error) {
            this.showError('Không thể tải thông tin giải đấu: ' + error.message);
            throw error;
        } finally {
            this.setLoading(false);
        }
    }

    // Get tournaments by game
    async getTournamentsByGame(game) {
        try {
            this.setLoading(true);
            const result = await apiCall(API_ENDPOINTS.TOURNAMENTS.BY_GAME(game), {}, 'GET');
            
            if (result.success) {
                this.renderTournaments(result.data, 'by-game');
                return result.data;
            }
        } catch (error) {
            this.showError('Không thể tải giải đấu theo game: ' + error.message);
            throw error;
        } finally {
            this.setLoading(false);
        }
    }

    // Get tournament participants
    async getTournamentParticipants(tournamentId) {
        try {
            const result = await apiCall(API_ENDPOINTS.TOURNAMENTS.PARTICIPANTS(tournamentId), {}, 'GET');
            
            if (result.success) {
                this.renderParticipants(result.data);
                return result.data;
            }
        } catch (error) {
            this.showError('Không thể tải danh sách thí sinh: ' + error.message);
            throw error;
        }
    }

    // Get tournaments by organizer
    async getTournamentsByOrganizer(organizerId) {
        try {
            this.setLoading(true);
            const result = await apiCall(API_ENDPOINTS.TOURNAMENTS.BY_ORGANIZER(organizerId), {}, 'GET');
            
            if (result.success) {
                this.renderTournaments(result.data, 'by-organizer');
                return result.data;
            }
        } catch (error) {
            this.showError('Không thể tải giải đấu của organizer: ' + error.message);
            throw error;
        } finally {
            this.setLoading(false);
        }
    }

    // Create tournament (requires organizer/admin role)
    async createTournament(tournamentData) {
        try {
            if (!authController.isAuthenticated()) {
                throw new Error('Vui lòng đăng nhập để tạo giải đấu');
            }

            if (!authController.isOrganizer() && !authController.isAdmin()) {
                throw new Error('Chỉ organizer và admin mới có thể tạo giải đấu');
            }

            this.setLoading(true);
            const result = await apiCall(API_ENDPOINTS.TOURNAMENTS.BASE, tournamentData, 'POST', true);
            
            if (result.success) {
                this.showSuccess('Tạo giải đấu thành công!');
                
                // Redirect to tournament detail or organizer dashboard
                if (result.data && result.data.id) {
                    window.location.href = `/tournament-detail.html?id=${result.data.id}`;
                } else {
                    window.location.href = '/organizer-dashboard.html';
                }
                
                return result.data;
            }
        } catch (error) {
            this.showError('Tạo giải đấu thất bại: ' + error.message);
            throw error;
        } finally {
            this.setLoading(false);
        }
    }

    // Update tournament (requires ownership or admin role)
    async updateTournament(tournamentId, updateData) {
        try {
            if (!authController.isAuthenticated()) {
                throw new Error('Vui lòng đăng nhập để cập nhật giải đấu');
            }

            this.setLoading(true);
            const result = await apiCall(API_ENDPOINTS.TOURNAMENTS.BY_ID(tournamentId), updateData, 'PUT', true);
            
            if (result.success) {
                this.showSuccess('Cập nhật giải đấu thành công!');
                
                // Update current tournament if it's the same
                if (this.currentTournament && this.currentTournament.id === tournamentId) {
                    this.currentTournament = { ...this.currentTournament, ...result.data };
                    this.renderTournamentDetail(this.currentTournament);
                }
                
                return result.data;
            }
        } catch (error) {
            this.showError('Cập nhật giải đấu thất bại: ' + error.message);
            throw error;
        } finally {
            this.setLoading(false);
        }
    }

    // Delete tournament (requires ownership or admin role)
    async deleteTournament(tournamentId) {
        try {
            if (!authController.isAuthenticated()) {
                throw new Error('Vui lòng đăng nhập để xóa giải đấu');
            }

            if (!confirm('Bạn có chắc chắn muốn xóa giải đấu này? Hành động này không thể hoàn tác.')) {
                return;
            }

            this.setLoading(true);
            const result = await apiCall(API_ENDPOINTS.TOURNAMENTS.BY_ID(tournamentId), {}, 'DELETE', true);
            
            if (result.success) {
                this.showSuccess('Xóa giải đấu thành công!');
                
                // Redirect to organizer dashboard
                window.location.href = '/organizer-dashboard.html';
                
                return result;
            }
        } catch (error) {
            this.showError('Xóa giải đấu thất bại: ' + error.message);
            throw error;
        } finally {
            this.setLoading(false);
        }
    }

    // Register for tournament
    async registerForTournament(tournamentId) {
        try {
            if (!authController.isAuthenticated()) {
                throw new Error('Vui lòng đăng nhập để đăng ký tham gia');
            }

            this.setLoading(true);
            const result = await apiCall(API_ENDPOINTS.TOURNAMENTS.REGISTER(tournamentId), {}, 'POST', true);
            
            if (result.success) {
                this.showSuccess('Đăng ký tham gia thành công!');
                
                // Update UI to show registered status
                this.updateRegistrationUI(tournamentId, true);
                
                return result;
            }
        } catch (error) {
            this.showError('Đăng ký tham gia thất bại: ' + error.message);
            throw error;
        } finally {
            this.setLoading(false);
        }
    }

    // Withdraw from tournament
    async withdrawFromTournament(tournamentId) {
        try {
            if (!authController.isAuthenticated()) {
                throw new Error('Vui lòng đăng nhập để rút khỏi giải đấu');
            }

            if (!confirm('Bạn có chắc chắn muốn rút khỏi giải đấu này?')) {
                return;
            }

            this.setLoading(true);
            const result = await apiCall(API_ENDPOINTS.TOURNAMENTS.WITHDRAW(tournamentId), {}, 'DELETE', true);
            
            if (result.success) {
                this.showSuccess('Rút khỏi giải đấu thành công!');
                
                // Update UI to show unregistered status
                this.updateRegistrationUI(tournamentId, false);
                
                return result;
            }
        } catch (error) {
            this.showError('Rút khỏi giải đấu thất bại: ' + error.message);
            throw error;
        } finally {
            this.setLoading(false);
        }
    }

    // Update tournament status (requires ownership or admin role)
    async updateTournamentStatus(tournamentId, status) {
        try {
            if (!authController.isAuthenticated()) {
                throw new Error('Vui lòng đăng nhập để cập nhật trạng thái');
            }

            this.setLoading(true);
            const result = await apiCall(API_ENDPOINTS.TOURNAMENTS.STATUS(tournamentId), { status }, 'PUT', true);
            
            if (result.success) {
                this.showSuccess('Cập nhật trạng thái thành công!');
                
                // Update current tournament status
                if (this.currentTournament && this.currentTournament.id === tournamentId) {
                    this.currentTournament.status = status;
                    this.renderTournamentDetail(this.currentTournament);
                }
                
                return result;
            }
        } catch (error) {
            this.showError('Cập nhật trạng thái thất bại: ' + error.message);
            throw error;
        } finally {
            this.setLoading(false);
        }
    }

    // Get tournament statistics
    async getTournamentStats() {
        try {
            const result = await apiCall(API_ENDPOINTS.TOURNAMENTS.STATS, {}, 'GET');
            
            if (result.success) {
                this.renderStats(result.data);
                return result.data;
            }
        } catch (error) {
            this.showError('Không thể tải thống kê: ' + error.message);
            throw error;
        }
    }

    // Render tournaments list
    renderTournaments(tournaments, type = 'all') {
        const container = document.getElementById('tournamentsContainer') || 
                         document.getElementById('tournamentsList') ||
                         document.getElementById('tournamentsGrid');
        
        if (!container) return;

        if (tournaments.length === 0) {
            container.innerHTML = '<div class="no-data">Không có giải đấu nào.</div>';
            return;
        }

        const tournamentsHTML = tournaments.map(tournament => `
            <div class="tournament-card" data-tournament-id="${tournament.id}">
                <div class="tournament-image">
                    <img src="${tournament.image || '/assets/default-tournament.jpg'}" alt="${tournament.name}">
                    <div class="tournament-status ${tournament.status}">${this.getStatusText(tournament.status)}</div>
                </div>
                <div class="tournament-info">
                    <h3 class="tournament-name">${tournament.name}</h3>
                    <p class="tournament-game">${tournament.game}</p>
                    <p class="tournament-date">
                        <i class="icon-calendar"></i>
                        ${this.formatDate(tournament.startDate)}
                    </p>
                    <p class="tournament-participants">
                        <i class="icon-users"></i>
                        ${tournament.currentParticipants || 0}/${tournament.maxParticipants} thí sinh
                    </p>
                    <p class="tournament-prize">
                        <i class="icon-trophy"></i>
                        ${this.formatPrize(tournament.prizePool)}
                    </p>
                </div>
                <div class="tournament-actions">
                    <button class="btn-primary view-tournament" data-tournament-id="${tournament.id}">
                        Xem chi tiết
                    </button>
                    ${this.renderTournamentActionButtons(tournament)}
                </div>
            </div>
        `).join('');

        container.innerHTML = tournamentsHTML;
        this.initTournamentEventListeners();
    }

    // Render tournament detail
    renderTournamentDetail(tournament) {
        const container = document.getElementById('tournamentDetail');
        if (!container) return;

        const detailHTML = `
            <div class="tournament-header">
                <div class="tournament-banner">
                    <img src="${tournament.image || '/assets/default-tournament.jpg'}" alt="${tournament.name}">
                    <div class="tournament-overlay">
                        <h1 class="tournament-title">${tournament.name}</h1>
                        <div class="tournament-meta">
                            <span class="tournament-game">${tournament.game}</span>
                            <span class="tournament-status ${tournament.status}">${this.getStatusText(tournament.status)}</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="tournament-content">
                <div class="tournament-main">
                    <div class="tournament-description">
                        <h2>Mô tả giải đấu</h2>
                        <p>${tournament.description || 'Chưa có mô tả.'}</p>
                    </div>
                    
                    <div class="tournament-rules">
                        <h2>Luật chơi</h2>
                        <div>${tournament.rules || 'Chưa có luật chơi.'}</div>
                    </div>
                </div>
                
                <div class="tournament-sidebar">
                    <div class="tournament-info-card">
                        <h3>Thông tin giải đấu</h3>
                        <div class="info-item">
                            <label>Thời gian bắt đầu:</label>
                            <span>${this.formatDateTime(tournament.startDate)}</span>
                        </div>
                        <div class="info-item">
                            <label>Thời gian kết thúc:</label>
                            <span>${this.formatDateTime(tournament.endDate)}</span>
                        </div>
                        <div class="info-item">
                            <label>Số thí sinh:</label>
                            <span>${tournament.currentParticipants || 0}/${tournament.maxParticipants}</span>
                        </div>
                        <div class="info-item">
                            <label>Giải thưởng:</label>
                            <span>${this.formatPrize(tournament.prizePool)}</span>
                        </div>
                        <div class="info-item">
                            <label>Organizer:</label>
                            <span>${tournament.organizer?.fullName || 'N/A'}</span>
                        </div>
                    </div>
                    
                    <div class="tournament-actions-card">
                        ${this.renderDetailActionButtons(tournament)}
                    </div>
                </div>
            </div>
        `;

        container.innerHTML = detailHTML;
        this.initDetailEventListeners();
    }

    // Render tournament action buttons
    renderTournamentActionButtons(tournament) {
        const user = authController.getCurrentUser();
        if (!user) return '';

        let buttons = '';

        // Registration button for users
        if (user.role === 'user') {
            if (tournament.status === 'registration' && !tournament.isRegistered) {
                buttons += `<button class="btn-success register-tournament" data-tournament-id="${tournament.id}">Đăng ký</button>`;
            } else if (tournament.isRegistered) {
                buttons += `<button class="btn-warning withdraw-tournament" data-tournament-id="${tournament.id}">Rút khỏi</button>`;
            }
        }

        // Edit/Delete buttons for organizers and admins
        if ((user.role === 'organizer' && tournament.organizer?.id === user.id) || user.role === 'admin') {
            buttons += `
                <button class="btn-secondary edit-tournament" data-tournament-id="${tournament.id}">Chỉnh sửa</button>
                <button class="btn-danger delete-tournament" data-tournament-id="${tournament.id}">Xóa</button>
            `;
        }

        return buttons;
    }

    // Render detail action buttons
    renderDetailActionButtons(tournament) {
        const user = authController.getCurrentUser();
        if (!user) {
            return '<a href="/login.html" class="btn-primary">Đăng nhập để tham gia</a>';
        }

        let buttons = '';

        // Registration button for users
        if (user.role === 'user') {
            if (tournament.status === 'registration' && !tournament.isRegistered) {
                buttons += `<button class="btn-success btn-large register-tournament" data-tournament-id="${tournament.id}">Đăng ký tham gia</button>`;
            } else if (tournament.isRegistered) {
                buttons += `<button class="btn-warning btn-large withdraw-tournament" data-tournament-id="${tournament.id}">Rút khỏi giải đấu</button>`;
            }
        }

        // Management buttons for organizers and admins
        if ((user.role === 'organizer' && tournament.organizer?.id === user.id) || user.role === 'admin') {
            buttons += `
                <div class="management-buttons">
                    <button class="btn-secondary edit-tournament" data-tournament-id="${tournament.id}">
                        <i class="icon-edit"></i> Chỉnh sửa
                    </button>
                    <button class="btn-info view-participants" data-tournament-id="${tournament.id}">
                        <i class="icon-users"></i> Xem thí sinh
                    </button>
                    <button class="btn-warning change-status" data-tournament-id="${tournament.id}">
                        <i class="icon-settings"></i> Đổi trạng thái
                    </button>
                    <button class="btn-danger delete-tournament" data-tournament-id="${tournament.id}">
                        <i class="icon-trash"></i> Xóa
                    </button>
                </div>
            `;
        }

        return buttons;
    }

    // Initialize tournament event listeners
    initTournamentEventListeners() {
        // View tournament detail
        document.querySelectorAll('.view-tournament').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tournamentId = e.target.dataset.tournamentId;
                window.location.href = `/tournament-detail.html?id=${tournamentId}`;
            });
        });

        // Register for tournament
        document.querySelectorAll('.register-tournament').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const tournamentId = e.target.dataset.tournamentId;
                await this.registerForTournament(tournamentId);
            });
        });

        // Withdraw from tournament
        document.querySelectorAll('.withdraw-tournament').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const tournamentId = e.target.dataset.tournamentId;
                await this.withdrawFromTournament(tournamentId);
            });
        });

        // Edit tournament
        document.querySelectorAll('.edit-tournament').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tournamentId = e.target.dataset.tournamentId;
                window.location.href = `/edit-tournament.html?id=${tournamentId}`;
            });
        });

        // Delete tournament
        document.querySelectorAll('.delete-tournament').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const tournamentId = e.target.dataset.tournamentId;
                await this.deleteTournament(tournamentId);
            });
        });
    }

    // Initialize detail event listeners
    initDetailEventListeners() {
        this.initTournamentEventListeners();

        // View participants
        document.querySelectorAll('.view-participants').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const tournamentId = e.target.dataset.tournamentId;
                await this.getTournamentParticipants(tournamentId);
            });
        });

        // Change status
        document.querySelectorAll('.change-status').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tournamentId = e.target.dataset.tournamentId;
                this.showStatusChangeModal(tournamentId);
            });
        });
    }

    // Helper methods
    getStatusText(status) {
        const statusMap = {
            'draft': 'Nháp',
            'registration': 'Đang mở đăng ký',
            'ongoing': 'Đang diễn ra',
            'completed': 'Đã kết thúc',
            'cancelled': 'Đã hủy'
        };
        return statusMap[status] || status;
    }

    formatDate(dateString) {
        return new Date(dateString).toLocaleDateString('vi-VN');
    }

    formatDateTime(dateString) {
        return new Date(dateString).toLocaleString('vi-VN');
    }

    formatPrize(amount) {
        if (!amount) return 'Chưa có thông tin';
        return new Intl.NumberFormat('vi-VN', { 
            style: 'currency', 
            currency: 'VND' 
        }).format(amount);
    }

    updateRegistrationUI(tournamentId, isRegistered) {
        const buttons = document.querySelectorAll(`[data-tournament-id="${tournamentId}"]`);
        buttons.forEach(btn => {
            if (btn.classList.contains('register-tournament') || btn.classList.contains('withdraw-tournament')) {
                if (isRegistered) {
                    btn.textContent = 'Rút khỏi';
                    btn.className = 'btn-warning withdraw-tournament';
                } else {
                    btn.textContent = 'Đăng ký';
                    btn.className = 'btn-success register-tournament';
                }
            }
        });
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
        // Tournament creation form
        const createForm = document.getElementById('createTournamentForm');
        if (createForm) {
            createForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const formData = new FormData(createForm);
                const tournamentData = {
                    name: formData.get('name'),
                    description: formData.get('description'),
                    game: formData.get('game'),
                    startDate: formData.get('startDate'),
                    endDate: formData.get('endDate'),
                    maxParticipants: parseInt(formData.get('maxParticipants')),
                    prizePool: parseFloat(formData.get('prizePool')),
                    rules: formData.get('rules'),
                    registrationDeadline: formData.get('registrationDeadline')
                };
                await this.createTournament(tournamentData);
            });
        }

        // Tournament edit form
        const editForm = document.getElementById('editTournamentForm');
        if (editForm) {
            editForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const tournamentId = editForm.dataset.tournamentId;
                const formData = new FormData(editForm);
                const updateData = {
                    name: formData.get('name'),
                    description: formData.get('description'),
                    game: formData.get('game'),
                    startDate: formData.get('startDate'),
                    endDate: formData.get('endDate'),
                    maxParticipants: parseInt(formData.get('maxParticipants')),
                    prizePool: parseFloat(formData.get('prizePool')),
                    rules: formData.get('rules')
                };
                await this.updateTournament(tournamentId, updateData);
            });
        }

        // Search form
        const searchForm = document.getElementById('searchForm');
        if (searchForm) {
            searchForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const formData = new FormData(searchForm);
                const query = formData.get('query');
                const filters = {
                    game: formData.get('game'),
                    status: formData.get('status')
                };
                await this.searchTournaments(query, filters);
            });
        }
    }
}

// Create global instance
export const tournamentController = new TournamentController();

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    tournamentController.initFormHandlers();
});