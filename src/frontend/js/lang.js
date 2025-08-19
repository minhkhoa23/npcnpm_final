let currentLang = 'en';
const translations = {
    en: null,
    vi: null
};

// ✅ EXPORT để dùng từ guestView.js
export async function loadTranslations(lang) {
    currentLang = lang;

    try {
        const response = await fetch(`./src/frontend/lang/${lang}.json`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        translations[lang] = await response.json();
        applyTranslations();
    } catch (error) {
        console.error(`Error loading ${lang} translations:`, error);
    }
}

// ✅ EXPORT cho apply từ nơi khác
export function applyTranslations() {
    const langData = translations[currentLang];
    if (!langData) {
        console.warn('No translation data for:', currentLang);
        return;
    }

    // ✅ Cập nhật các phần tử nếu tồn tại
    const guestTitle = document.getElementById('guestTitle');
    if (guestTitle) guestTitle.textContent = langData.title || 'Tournament Manager';

    const loginBtn = document.getElementById('loginGuestBtn');
    if (loginBtn) loginBtn.textContent = langData.loginButton || 'Log In';

    const registerBtn = document.getElementById('registerGuestBtn');
    if (registerBtn) registerBtn.textContent = langData.registerButton || 'Sign Up';

    const guestLoginBtn = document.getElementById('guestLoginBtn');
    if (guestLoginBtn) guestLoginBtn.textContent = langData.loginButton || 'Login';

    const searchInput = document.getElementById('searchGuestBar');
    if (searchInput) searchInput.placeholder = langData.searchPlaceholder || 'Search tournaments...';
}
