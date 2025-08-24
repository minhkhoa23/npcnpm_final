import { apiCall, API_ENDPOINTS, TokenManager } from '../static-api.js';

class AuthController {
    constructor() {
        this.currentUser = null;
        this.init();
    }

    init() {
        // Check if user is already authenticated on page load
        if (TokenManager.isAuthenticated()) {
            this.loadUserProfile();
        }
    }

    // Register new user
    async register(userData) {
        try {
            // Wait for localStorage API to be ready
            let attempts = 0;
            while (!window.localStorageAPI && attempts < 50) {
                await new Promise(resolve => setTimeout(resolve, 100));
                attempts++;
            }

            if (!window.localStorageAPI) {
                throw new Error('Hệ thống chưa sẵn sàng. Vui lòng thử lại sau.');
            }

            console.log('🔐 Attempting registration with data:', { ...userData, password: '[HIDDEN]' });

            const result = await apiCall(API_ENDPOINTS.AUTH.REGISTER, userData, 'POST');
            console.log('🔐 Registration result:', result);

            if (result.success) {
                // Auto login after successful registration
                if (result.data && result.data.token) {
                    TokenManager.setToken(result.data.token);
                    this.currentUser = result.data.user;
                } else if (result.token) {
                    TokenManager.setToken(result.token);
                    this.currentUser = result.user;
                }

                this.showSuccess('Đăng ký thành công!');

                // Small delay before redirect to let user see success message
                setTimeout(() => {
                    this.redirectAfterAuth();
                }, 1000);

                return result;
            } else {
                throw new Error(result.message || 'Registration failed');
            }
        } catch (error) {
            console.error('🔐 Registration error:', error);
            this.showError('Đăng ký thất bại: ' + (error.message || error));
            throw error;
        }
    }

    // User login
    async login(credentials) {
        try {
            const result = await apiCall(API_ENDPOINTS.AUTH.LOGIN, credentials, 'POST');

            if (result.success) {
                if (result.data && result.data.token) {
                    TokenManager.setToken(result.data.token);
                    this.currentUser = result.data.user;
                } else if (result.token) {
                    TokenManager.setToken(result.token);
                    this.currentUser = result.user;
                }

                this.showSuccess('Đăng nhập thành công!');
                this.redirectAfterAuth();
                return result;
            } else {
                throw new Error(result.message || 'Login failed');
            }
        } catch (error) {
            this.showError('Đăng nhập thất bại: ' + (error.message || error));
            throw error;
        }
    }

    // User logout
    async logout() {
        try {
            await apiCall(API_ENDPOINTS.AUTH.LOGOUT, {}, 'POST', true);
            
            TokenManager.removeToken();
            this.currentUser = null;
            
            this.showSuccess('Đăng xuất thành công!');
            window.location.href = '/login.html';
        } catch (error) {
            // Even if API call fails, clear local session
            TokenManager.removeToken();
            this.currentUser = null;
            window.location.href = '/login.html';
        }
    }

    // Load user profile
    async loadUserProfile() {
        try {
            const result = await apiCall(API_ENDPOINTS.AUTH.PROFILE, {}, 'GET', true);
            
            if (result.success) {
                this.currentUser = result.user;
                this.updateUIForAuthenticatedUser();
                return result.user;
            }
        } catch (error) {
            console.error('Failed to load user profile:', error);
            TokenManager.removeToken();
            this.currentUser = null;
        }
    }

    // Update user profile
    async updateProfile(profileData) {
        try {
            const result = await apiCall(API_ENDPOINTS.AUTH.PROFILE, profileData, 'PUT', true);
            
            if (result.success) {
                this.currentUser = { ...this.currentUser, ...result.user };
                this.showSuccess('Cập nhật thông tin thành công!');
                return result;
            }
        } catch (error) {
            this.showError('Cập nhật thông tin thất bại: ' + error.message);
            throw error;
        }
    }

    // Change password
    async changePassword(passwordData) {
        try {
            const result = await apiCall(API_ENDPOINTS.AUTH.CHANGE_PASSWORD, passwordData, 'PUT', true);
            
            if (result.success) {
                this.showSuccess('Đổi mật khẩu thành công!');
                return result;
            }
        } catch (error) {
            this.showError('Đổi mật khẩu th��t bại: ' + error.message);
            throw error;
        }
    }

    // Check if user is authenticated
    isAuthenticated() {
        return TokenManager.isAuthenticated() && this.currentUser;
    }

    // Check if user has specific role
    hasRole(role) {
        return this.currentUser && this.currentUser.role === role;
    }

    // Check if user is admin
    isAdmin() {
        return this.hasRole('admin');
    }

    // Check if user is organizer
    isOrganizer() {
        return this.hasRole('organizer');
    }

    // Get current user
    getCurrentUser() {
        return this.currentUser;
    }

    // Redirect after authentication based on user role
    redirectAfterAuth() {
        if (!this.currentUser) {
            console.log('❌ No current user found for redirect');
            return;
        }

        console.log('🔄 Redirecting user:', this.currentUser.role, this.currentUser.fullName);

        const urlParams = new URLSearchParams(window.location.search);
        const redirectUrl = urlParams.get('redirect');

        if (redirectUrl) {
            console.log('🔗 Using redirect URL:', redirectUrl);
            window.location.href = redirectUrl;
        } else {
            switch (this.currentUser.role) {
                case 'admin':
                    console.log('👑 Redirecting admin to dashboard.html');
                    window.location.href = './dashboard.html';
                    break;
                case 'organizer':
                    console.log('🎯 Redirecting organizer to organizer-dashboard.html');
                    window.location.href = './organizer-dashboard.html';
                    break;
                case 'user':
                    console.log('👤 Redirecting user to dashboard.html');
                    window.location.href = './dashboard.html';
                    break;
                default:
                    console.log('🏠 Default redirect to index.html');
                    window.location.href = './index.html';
            }
        }
    }

    // Update UI for authenticated user
    updateUIForAuthenticatedUser() {
        // Update navigation menu
        const loginBtn = document.getElementById('loginBtn');
        const registerBtn = document.getElementById('registerBtn');
        const userMenu = document.getElementById('userMenu');
        const userNameSpan = document.getElementById('userName');

        if (loginBtn) loginBtn.style.display = 'none';
        if (registerBtn) registerBtn.style.display = 'none';
        
        if (userMenu) {
            userMenu.style.display = 'block';
            if (userNameSpan && this.currentUser) {
                userNameSpan.textContent = this.currentUser.fullName || this.currentUser.email;
            }
        }

        // Show role-specific elements
        if (this.isAdmin()) {
            this.showAdminElements();
        } else if (this.isOrganizer()) {
            this.showOrganizerElements();
        }
    }

    // Show admin-specific UI elements
    showAdminElements() {
        const adminElements = document.querySelectorAll('.admin-only');
        adminElements.forEach(element => {
            element.style.display = 'block';
        });
    }

    // Show organizer-specific UI elements
    showOrganizerElements() {
        const organizerElements = document.querySelectorAll('.organizer-only');
        organizerElements.forEach(element => {
            element.style.display = 'block';
        });
    }

    // Show success message
    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    // Show error message
    showError(message) {
        this.showNotification(message, 'error');
    }

    // Show notification
    showNotification(message, type = 'info') {
        // Create notification element if not exists
        let notification = document.getElementById('notification');
        if (!notification) {
            notification = document.createElement('div');
            notification.id = 'notification';
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 15px 20px;
                border-radius: 4px;
                color: white;
                font-weight: bold;
                z-index: 10000;
                display: none;
            `;
            document.body.appendChild(notification);
        }

        // Set message and style based on type
        notification.textContent = message;
        notification.className = type;
        
        switch (type) {
            case 'success':
                notification.style.backgroundColor = '#4CAF50';
                break;
            case 'error':
                notification.style.backgroundColor = '#f44336';
                break;
            default:
                notification.style.backgroundColor = '#2196F3';
        }

        // Show notification
        notification.style.display = 'block';

        // Hide after 3 seconds
        setTimeout(() => {
            notification.style.display = 'none';
        }, 3000);
    }

    // Initialize form handlers
    initFormHandlers() {
        // Login form
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const formData = new FormData(loginForm);
                const credentials = {
                    email: formData.get('email'),
                    password: formData.get('password')
                };
                await this.login(credentials);
            });
        }

        // Register form
        const registerForm = document.getElementById('registerForm');
        if (registerForm) {
            registerForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const formData = new FormData(registerForm);
                const userData = {
                    email: formData.get('email'),
                    password: formData.get('password'),
                    fullName: formData.get('fullName'),
                    role: formData.get('role') || 'user'
                };
                await this.register(userData);
            });
        }

        // Logout button
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.logout();
            });
        }

        // Profile form
        const profileForm = document.getElementById('profileForm');
        if (profileForm) {
            profileForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const formData = new FormData(profileForm);
                const profileData = {
                    fullName: formData.get('fullName'),
                    email: formData.get('email'),
                    phone: formData.get('phone'),
                    bio: formData.get('bio')
                };
                await this.updateProfile(profileData);
            });
        }

        // Change password form
        const changePasswordForm = document.getElementById('changePasswordForm');
        if (changePasswordForm) {
            changePasswordForm.addEventListener('submit', async (e) => {
                e.preventDefault();
                const formData = new FormData(changePasswordForm);
                const passwordData = {
                    currentPassword: formData.get('currentPassword'),
                    newPassword: formData.get('newPassword'),
                    confirmPassword: formData.get('confirmPassword')
                };

                if (passwordData.newPassword !== passwordData.confirmPassword) {
                    this.showError('Mật khẩu xác nhận không khớp!');
                    return;
                }

                await this.changePassword(passwordData);
            });
        }
    }
}

// Create global instance
export const authController = new AuthController();

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    authController.initFormHandlers();
});
