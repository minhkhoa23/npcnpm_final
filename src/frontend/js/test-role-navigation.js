// Test script for role-based navigation
// This script helps verify that role-based homepage navigation works correctly

export function testRoleBasedNavigation() {
    console.log('🧪 Testing Role-Based Navigation System...');
    
    // Test 1: Check if router is available
    if (!window.router) {
        console.error('❌ Router not available globally');
        return false;
    }
    console.log('✅ Router is available');
    
    // Test 2: Check if authController is available
    if (!window.authController) {
        console.error('❌ AuthController not available globally');
        return false;
    }
    console.log('✅ AuthController is available');
    
    // Test 3: Test navigation methods
    try {
        if (typeof window.router.navigateToHome === 'function') {
            console.log('✅ navigateToHome method exists');
        } else {
            console.error('❌ navigateToHome method missing');
            return false;
        }
        
        if (typeof window.router.getUserProfile === 'function') {
            console.log('✅ getUserProfile method exists');
        } else {
            console.error('❌ getUserProfile method missing');
            return false;
        }
    } catch (error) {
        console.error('❌ Error testing navigation methods:', error);
        return false;
    }
    
    // Test 4: Test home button elements
    const homeButtons = document.querySelectorAll('.home-button[data-home-nav], .nav-item[data-home-nav], .home-nav-item');
    if (homeButtons.length > 0) {
        console.log(`✅ Found ${homeButtons.length} home navigation elements`);
    } else {
        console.warn('⚠️ No home navigation elements found on current page');
    }
    
    // Test 5: Test user dropdown if present
    const userDropdown = document.getElementById('userDropdown');
    if (userDropdown) {
        console.log('✅ User dropdown found');
    } else {
        console.log('ℹ️ User dropdown not found (may be on guest page)');
    }
    
    console.log('🎉 Role-based navigation system test completed');
    return true;
}

// Function to simulate role-based navigation
export async function simulateRoleNavigation(role = 'user') {
    console.log(`🎭 Simulating navigation for role: ${role}`);
    
    try {
        // Mock user profile
        const mockUser = {
            id: 'test-user-' + Date.now(),
            email: 'test@example.com',
            fullName: 'Test User',
            role: role
        };
        
        // Temporarily set the user in authController
        if (window.authController) {
            window.authController.currentUser = mockUser;
            console.log('✅ Mock user set in authController');
        }
        
        // Test role-based homepage navigation
        if (window.router && typeof window.router.navigateToHome === 'function') {
            await window.router.navigateToHome();
            console.log(`✅ Navigation to ${role} homepage completed`);
        }
        
    } catch (error) {
        console.error('❌ Error during role navigation simulation:', error);
    }
}

// Function to test home button clicks
export function testHomeButtonClick() {
    console.log('🖱️ Testing home button click...');
    
    const homeButton = document.querySelector('.home-button[data-home-nav], .nav-item[data-home-nav], .home-nav-item');
    if (homeButton) {
        console.log('✅ Home button found, simulating click...');
        homeButton.click();
        console.log('✅ Home button click simulated');
    } else {
        console.warn('⚠️ No home button found on current page');
    }
}

// Auto-run tests when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        testRoleBasedNavigation();
    }, 2000); // Wait 2 seconds for everything to initialize
});

// Make functions available globally for manual testing
window.testRoleNavigation = {
    test: testRoleBasedNavigation,
    simulateRole: simulateRoleNavigation,
    testHomeClick: testHomeButtonClick
};

console.log('🧪 Role-based navigation test module loaded');
console.log('📝 Available commands:');
console.log('  - window.testRoleNavigation.test() - Run full test suite');
console.log('  - window.testRoleNavigation.simulateRole("user") - Simulate user role');
console.log('  - window.testRoleNavigation.simulateRole("organizer") - Simulate organizer role');
console.log('  - window.testRoleNavigation.testHomeClick() - Test home button click');
