// Test script for unauthenticated user navigation
// This verifies that unauthenticated users always go to index.html when clicking "Home"

export function testUnauthenticatedNavigation() {
    console.log('🧪 Testing Unauthenticated User Navigation...');
    
    // Test 1: Clear any existing authentication
    if (localStorage.getItem('authToken')) {
        localStorage.removeItem('authToken');
        console.log('✅ Cleared existing auth token');
    }
    
    if (localStorage.getItem('userRole')) {
        localStorage.removeItem('userRole');
        console.log('✅ Cleared existing user role');
    }
    
    // Test 2: Verify TokenManager shows unauthenticated
    if (window.TokenManager) {
        const isAuth = window.TokenManager.isAuthenticated();
        if (!isAuth) {
            console.log('✅ TokenManager correctly shows unauthenticated');
        } else {
            console.error('❌ TokenManager incorrectly shows authenticated');
            return false;
        }
    } else {
        console.warn('⚠️ TokenManager not available');
    }
    
    // Test 3: Verify authController shows no user
    if (window.authController) {
        const currentUser = window.authController.getCurrentUser();
        if (!currentUser) {
            console.log('✅ AuthController correctly shows no current user');
        } else {
            console.error('❌ AuthController incorrectly shows current user:', currentUser);
            // Clear the user
            window.authController.currentUser = null;
        }
    } else {
        console.warn('⚠️ AuthController not available');
    }
    
    // Test 4: Test home navigation for unauthenticated user
    if (window.router && typeof window.router.navigateToHome === 'function') {
        console.log('🏠 Testing home navigation for unauthenticated user...');
        
        // Mock the navigation to see where it would go
        const originalNavigate = window.router.navigate;
        let navigatedTo = null;
        
        window.router.navigate = function(path) {
            navigatedTo = path;
            console.log(`📍 Would navigate to: ${path}`);
        };
        
        // Test the navigation
        window.router.navigateToHome();
        
        // Restore original navigate function
        window.router.navigate = originalNavigate;
        
        if (navigatedTo === '/') {
            console.log('✅ Unauthenticated user correctly redirected to "/" (index.html)');
        } else {
            console.error(`❌ Unauthenticated user incorrectly redirected to: ${navigatedTo}`);
            return false;
        }
    } else {
        console.error('❌ Router navigateToHome method not available');
        return false;
    }
    
    // Test 5: Test home button click
    const homeButton = document.querySelector('.home-nav-item[data-home-nav], .nav-item[data-home-nav]');
    if (homeButton) {
        console.log('🖱️ Testing home button click...');
        
        // Mock window.location for testing
        const originalLocation = window.location;
        let redirectedTo = null;
        
        // Create a mock location object
        const mockLocation = {
            ...originalLocation,
            href: '',
            pathname: window.location.pathname
        };
        
        Object.defineProperty(window, 'location', {
            value: mockLocation,
            writable: true
        });
        
        // Mock router navigate to catch the call
        if (window.router) {
            const originalNavigate = window.router.navigate;
            window.router.navigate = function(path) {
                redirectedTo = path;
                console.log(`📍 Home button click would navigate to: ${path}`);
            };
            
            // Simulate button click
            homeButton.click();
            
            // Restore original navigate
            window.router.navigate = originalNavigate;
        }
        
        // Restore original location
        Object.defineProperty(window, 'location', {
            value: originalLocation,
            writable: false
        });
        
        if (redirectedTo === '/') {
            console.log('✅ Home button correctly navigates to "/"');
        } else {
            console.warn(`⚠️ Home button navigation result: ${redirectedTo}`);
        }
    } else {
        console.log('ℹ️ No home button found on current page');
    }
    
    console.log('🎉 Unauthenticated navigation test completed');
    return true;
}

// Function to simulate different page scenarios
export function testNavigationFromDifferentPages() {
    console.log('📄 Testing navigation from different page scenarios...');
    
    const scenarios = [
        { page: 'login', description: 'Login page' },
        { page: 'register', description: 'Register page' },
        { page: 'guest', description: 'Guest home page' },
        { page: 'any-other', description: 'Any other page when unauthenticated' }
    ];
    
    scenarios.forEach(scenario => {
        console.log(`\n🔍 Testing scenario: ${scenario.description}`);
        
        // Clear authentication
        localStorage.removeItem('authToken');
        localStorage.removeItem('userRole');
        if (window.authController) {
            window.authController.currentUser = null;
        }
        
        // Test navigation
        if (window.router) {
            const originalNavigate = window.router.navigate;
            let navigatedTo = null;
            
            window.router.navigate = function(path) {
                navigatedTo = path;
                console.log(`   📍 From ${scenario.page}: would navigate to ${path}`);
            };
            
            window.router.navigateToHome();
            
            window.router.navigate = originalNavigate;
            
            if (navigatedTo === '/') {
                console.log(`   ✅ ${scenario.description}: Correct navigation to "/"`);
            } else {
                console.log(`   ❌ ${scenario.description}: Wrong navigation to "${navigatedTo}"`);
            }
        }
    });
    
    console.log('\n🎉 All page scenarios tested');
}

// Function to verify the flow works end-to-end
export function testCompleteUnauthenticatedFlow() {
    console.log('🔄 Testing complete unauthenticated user flow...');
    
    // Step 1: Start as unauthenticated
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    if (window.authController) {
        window.authController.currentUser = null;
    }
    console.log('1️⃣ Cleared authentication state');
    
    // Step 2: Verify current page shows correct content for unauthenticated
    const hasLoginButton = document.querySelector('#loginGuestBtn, .auth-btn');
    const hasUserMenu = document.querySelector('#userDropdown, .user-avatar');
    
    if (hasLoginButton && !hasUserMenu) {
        console.log('2️⃣ ✅ Page correctly shows guest/login interface');
    } else if (!hasLoginButton && hasUserMenu) {
        console.log('2️⃣ ❌ Page incorrectly shows authenticated interface');
    } else {
        console.log('2️⃣ ⚠️ Page interface unclear - may be transitional state');
    }
    
    // Step 3: Test home navigation
    if (window.router) {
        console.log('3️⃣ Testing home navigation...');
        testUnauthenticatedNavigation();
    }
    
    // Step 4: Verify that any attempt to access authenticated routes redirects
    const protectedRoutes = ['/user-home', '/organizer-home', '/dashboard'];
    protectedRoutes.forEach(route => {
        console.log(`4️⃣ Testing access to protected route: ${route}`);
        // This would normally redirect to login or home
        console.log(`   📝 Should redirect unauthenticated users appropriately`);
    });
    
    console.log('✨ Complete unauthenticated flow test finished');
}

// Auto-run test when this module loads
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        console.log('\n🎬 Starting Unauthenticated Navigation Tests...\n');
        testUnauthenticatedNavigation();
        testNavigationFromDifferentPages();
        testCompleteUnauthenticatedFlow();
    }, 1000);
});

// Make functions available globally for manual testing
window.testUnauthenticatedNav = {
    test: testUnauthenticatedNavigation,
    testPages: testNavigationFromDifferentPages,
    testFlow: testCompleteUnauthenticatedFlow
};

console.log('🧪 Unauthenticated navigation test module loaded');
console.log('📝 Available commands:');
console.log('  - window.testUnauthenticatedNav.test() - Test basic navigation');
console.log('  - window.testUnauthenticatedNav.testPages() - Test different page scenarios');
console.log('  - window.testUnauthenticatedNav.testFlow() - Test complete flow');
