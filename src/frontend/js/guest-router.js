// Guest Router - Ensures consistent guest navigation with login/register buttons
import { renderGuestView } from './views/guestView.js';
import { TokenManager } from './hybrid-api.js';

class GuestRouter {
    constructor() {
        this.isInitialized = false;
        this.setupGlobalNavigation();
    }

    // Check if user is authenticated
    isAuthenticated() {
        return TokenManager.isAuthenticated();
    }

    // Always render guest view for clean initialization
    async ensureGuestView() {
        console.log('🏠 Rendering guest view with login/register buttons');
        await renderGuestView();
        this.setupAuthenticationButtons();
        this.isInitialized = true;
    }

    // Setup global navigation to handle home clicks
    setupGlobalNavigation() {
        // Listen for navigation events
        document.addEventListener('click', (e) => {
            const target = e.target.closest('a, button');
            if (!target) return;

            // Handle home navigation
            if (this.isHomeLink(target)) {
                e.preventDefault();
                this.navigateHome();
            }

            // Handle login navigation
            if (this.isLoginLink(target)) {
                e.preventDefault();
                this.navigateToLogin();
            }

            // Handle register navigation
            if (this.isRegisterLink(target)) {
                e.preventDefault();
                this.navigateToRegister();
            }
        });

        // Handle browser back/forward navigation
        window.addEventListener('popstate', () => {
            if (window.location.pathname === '/' || window.location.pathname === '/index.html') {
                this.navigateHome();
            }
        });
    }

    // Check if element is a home link
    isHomeLink(element) {
        const href = element.getAttribute('href');
        const text = element.textContent?.toLowerCase();
        
        return (
            href === '/' ||
            href === './index.html' ||
            href === 'index.html' ||
            text?.includes('trang chủ') ||
            text?.includes('home') ||
            element.classList.contains('nav-item')
        );
    }

    // Check if element is a login link
    isLoginLink(element) {
        const href = element.getAttribute('href');
        const id = element.id;
        
        return (
            href?.includes('login.html') ||
            id === 'loginGuestBtn' ||
            id === 'ctaLoginBtn' ||
            element.classList.contains('login-btn') ||
            element.textContent?.toLowerCase().includes('đăng nhập')
        );
    }

    // Check if element is a register link
    isRegisterLink(element) {
        const href = element.getAttribute('href');
        const id = element.id;
        
        return (
            href?.includes('register.html') ||
            id === 'registerGuestBtn' ||
            id === 'ctaRegisterBtn' ||
            element.classList.contains('register-btn') ||
            element.textContent?.toLowerCase().includes('đăng ký')
        );
    }

    // Navigate to home page
    async navigateHome() {
        console.log('🏠 Navigating to home page');
        
        // Always ensure we show the guest view when going home
        // This fixes the issue where login/register buttons disappear
        await this.ensureGuestView();
        
        // Update browser history if needed
        if (window.location.pathname !== '/') {
            history.pushState(null, null, '/');
        }
    }

    // Navigate to login page
    navigateToLogin() {
        console.log('🔑 Navigating to login page');
        window.location.href = './src/frontend/login.html';
    }

    // Navigate to register page
    navigateToRegister() {
        console.log('📝 Navigating to register page');
        window.location.href = './src/frontend/register.html';
    }

    // Setup authentication buttons with proper event handlers
    setupAuthenticationButtons() {
        // Main header buttons
        const loginBtn = document.getElementById('loginGuestBtn');
        const registerBtn = document.getElementById('registerGuestBtn');
        
        // CTA section buttons
        const ctaLoginBtn = document.getElementById('ctaLoginBtn');
        const ctaRegisterBtn = document.getElementById('ctaRegisterBtn');

        // Remove existing event listeners to avoid duplicates
        [loginBtn, registerBtn, ctaLoginBtn, ctaRegisterBtn].forEach(btn => {
            if (btn) {
                const newBtn = btn.cloneNode(true);
                btn.parentNode.replaceChild(newBtn, btn);
            }
        });

        // Add event listeners to the new buttons
        const newLoginBtn = document.getElementById('loginGuestBtn');
        const newRegisterBtn = document.getElementById('registerGuestBtn');
        const newCtaLoginBtn = document.getElementById('ctaLoginBtn');
        const newCtaRegisterBtn = document.getElementById('ctaRegisterBtn');

        if (newLoginBtn) {
            newLoginBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.navigateToLogin();
            });
        }

        if (newRegisterBtn) {
            newRegisterBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.navigateToRegister();
            });
        }

        if (newCtaLoginBtn) {
            newCtaLoginBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.navigateToLogin();
            });
        }

        if (newCtaRegisterBtn) {
            newCtaRegisterBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.navigateToRegister();
            });
        }

        console.log('✅ Authentication buttons setup complete');
    }

    // Force refresh guest view (useful for fixing navigation issues)
    async forceRefreshGuestView() {
        console.log('🔄 Force refreshing guest view');
        await this.ensureGuestView();
    }
}

// Create global instance
export const guestRouter = new GuestRouter();

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    // Only initialize if we're on the home page and not authenticated
    if ((window.location.pathname === '/' || window.location.pathname === '/index.html') && !guestRouter.isAuthenticated()) {
        guestRouter.ensureGuestView();
    }
});

export default GuestRouter;
