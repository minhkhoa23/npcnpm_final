import { loadTranslations } from '../lang.js';
import { apiCall, API_ENDPOINTS, TokenManager } from '../api.js';
import { createCarousel } from '../carousel.js';
import { loadTournamentsCarousel, loadNewsCarousel, loadHighlightsCarousel } from '../utils/carouselLoaders.js';

export async function renderGuestView() {
  // Check if user is authenticated
  const isAuthenticated = TokenManager.isAuthenticated();
  const currentUser = isAuthenticated ? TokenManager.getCurrentUser() : null;

  // Generate appropriate header content based on authentication status
  const headerRightContent = isAuthenticated ? `
    <div class="user-menu">
      <button class="user-menu-btn">
        <svg class="user-icon" width="35" height="35" viewBox="0 0 35 35" fill="none">
          <path d="M29.1667 30.625V27.7083C29.1667 26.1612 28.5521 24.6775 27.458 23.5835C26.364 22.4896 24.8803 21.875 23.3333 21.875H11.6667C10.1196 21.875 8.63591 22.4896 7.54195 23.5835C6.44798 24.6775 5.83334 26.1612 5.83334 27.7083V30.625M23.3333 10.2083C23.3333 13.4299 20.7216 16.0417 17.5 16.0417C14.2784 16.0417 11.6667 13.4299 11.6667 10.2083C11.6667 6.98674 14.2784 4.375 17.5 4.375C20.7216 4.375 23.3333 6.98674 23.3333 10.2083Z" stroke="#F5F5F5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <span class="user-name">${currentUser?.fullName || currentUser?.email || 'User'}</span>
        <svg class="dropdown-icon" width="20" height="20" viewBox="0 0 20 20" fill="none">
          <path d="M15 7.5L10 12.5L5 7.5" stroke="#F5F5F5" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </button>
      <div class="user-dropdown">
        <a href="./src/frontend/dashboard.html" class="dropdown-item">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M7.5 10H12.5M7.5 13.3333H12.5M10 1.66667L2.5 6.66667V16.6667C2.5 17.1087 2.67559 17.5326 2.98816 17.8452C3.30072 18.1577 3.72464 18.3333 4.16667 18.3333H15.8333C16.2754 18.3333 16.6993 18.1577 17.0118 17.8452C17.3244 17.5326 17.5 17.1087 17.5 16.6667V6.66667L10 1.66667Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Dashboard
        </a>
        <a href="./src/frontend/user-profile.html" class="dropdown-item">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M16.6667 17.5V15.8333C16.6667 14.9493 16.3155 14.1014 15.6904 13.4763C15.0652 12.8512 14.2174 12.5 13.3333 12.5H6.66667C5.78261 12.5 4.93476 12.8512 4.30964 13.4763C3.68452 14.1014 3.33333 14.9493 3.33333 15.8333V17.5M13.3333 6.66667C13.3333 8.50762 11.841 10 10 10C8.15905 10 6.66667 8.50762 6.66667 6.66667C6.66667 4.82571 8.15905 3.33333 10 3.33333C11.841 3.33333 13.3333 4.82571 13.3333 6.66667Z" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Hồ sơ
        </a>
        ${currentUser?.role === 'organizer' || currentUser?.role === 'admin' ? `
        <a href="./src/frontend/create-tournament-1.html" class="dropdown-item">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M10 4.16667V15.8333M4.16667 10H15.8333" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Tạo giải đấu
        </a>
        ` : ''}
        <div class="dropdown-divider"></div>
        <button class="dropdown-item logout-btn" onclick="globalLogout()">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M7.5 17.5H4.16667C3.72464 17.5 3.30072 17.3244 2.98816 17.0118C2.67559 16.6993 2.5 16.2754 2.5 15.8333V4.16667C2.5 3.72464 2.67559 3.30072 2.98816 2.98816C3.30072 2.67559 3.72464 2.5 4.16667 2.5H7.5M13.3333 14.1667L17.5 10M17.5 10L13.3333 5.83333M17.5 10H7.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Đăng xuất
        </button>
      </div>
    </div>
  ` : `
    <button id="loginGuestBtn" class="auth-btn login-btn" data-route="/login">
      <svg class="auth-icon" width="35" height="35" viewBox="0 0 35 35" fill="none">
        <path d="M21.875 4.375H27.7083C28.4819 4.375 29.2237 4.68229 29.7707 5.22927C30.3177 5.77625 30.625 6.51812 30.625 7.29167V27.7083C30.625 28.4819 30.3177 29.2237 29.7707 29.7707C29.2237 30.3177 28.4819 30.625 27.7083 30.625H21.875M14.5833 24.7917L21.875 17.5M21.875 17.5L14.5833 10.2083M21.875 17.5H4.375" stroke="#303030" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      Đăng nhập
    </button>
    <button id="registerGuestBtn" class="auth-btn register-btn" data-route="/register">
      <svg class="auth-icon" width="35" height="35" viewBox="0 0 35 35" fill="none">
        <path d="M17.5 10.2083C17.5 8.66124 16.8854 7.17751 15.7914 6.08354C14.6975 4.98958 13.2138 4.375 11.6667 4.375H2.91666V26.25H13.125C14.2853 26.25 15.3981 26.7109 16.2186 27.5314C17.0391 28.3519 17.5 29.4647 17.5 30.625M17.5 10.2083V30.625M17.5 10.2083C17.5 8.66124 18.1146 7.17751 19.2085 6.08354C20.3025 4.98958 21.7862 4.375 23.3333 4.375H32.0833V26.25H21.875C20.7147 26.25 19.6019 26.7109 18.7814 27.5314C17.9609 28.3519 17.5 29.4647 17.5 30.625" stroke="#2C2C2C" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      Đăng ký
    </button>
  `;

  // Generate CTA section content based on authentication status
  const ctaContent = isAuthenticated ? `
    <div class="cta-content">
      <div class="cta-left">
        <h2 class="cta-title">CHÀO MỪNG TRỞ LẠI, ${currentUser?.fullName || 'BẠN'}!</h2>
        <p class="cta-description">Khám phá các giải đấu mới hoặc tạo giải đấu của riêng bạn</p>
        <div class="cta-buttons">
          ${currentUser?.role === 'organizer' || currentUser?.role === 'admin' ? `
          <a href="./src/frontend/create-tournament-1.html" class="cta-btn primary">
            Tạo giải đấu mới
          </a>
          ` : ''}
          <a href="./src/frontend/dashboard.html" class="cta-btn secondary">
            Vào Dashboard
          </a>
        </div>
      </div>
      <div class="cta-right">
        <div class="cta-thumbnails">
          <div class="thumbnail-item"></div>
          <div class="thumbnail-item"></div>
          <div class="thumbnail-item"></div>
          <div class="thumbnail-item"></div>
        </div>
      </div>
    </div>
  ` : `
    <div class="cta-content">
      <div class="cta-left">
        <h2 class="cta-title">MUỐN TỔ CHỨC GIẢI ĐẤU, HÃY THAM GIA VỚI CHÚNG TÔI</h2>
        <p class="cta-description">Tổ chức giải đấu, chọn thể lệ, quản lý giải đấu và nhiều hơn thế nữa ...</p>
        <div class="cta-buttons">
          <button id="ctaLoginBtn" class="cta-btn login">
            Đăng nhập
          </button>
          <button id="ctaRegisterBtn" class="cta-btn register">
            Đăng ký
          </button>
        </div>
      </div>
      <div class="cta-right">
        <div class="cta-thumbnails">
          <div class="thumbnail-item"></div>
          <div class="thumbnail-item"></div>
          <div class="thumbnail-item"></div>
          <div class="thumbnail-item"></div>
        </div>
      </div>
    </div>
  `;

  document.body.innerHTML = `
    <!-- Header Navigation -->
    <header class="main-header">
      <div class="header-container">
        <div class="header-left">
        <div class="nav-item" onclick="window.location.href='/'" style="cursor: pointer;">
          <svg class="nav-icon" width="40" height="40" viewBox="0 0 40 40" fill="none">
            <path d="M15 36.6667V20H25V36.6667M5 15L20 3.33334L35 15V33.3333C35 34.2174 34.6488 35.0652 34.0237 35.6904C33.3986 36.3155 32.5507 36.6667 31.6667 36.6667H8.33333C7.44928 36.6667 6.60143 36.3155 5.97631 35.6904C5.35119 35.0652 5 34.2174 5 33.3333V15Z" stroke="#F5F5F5" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <span class="nav-text">Trang chủ</span>
        </div>
          <div class="search-container">
            <input type="text" id="searchGuestBar" placeholder="Tìm kiếm giải đấu..." class="search-input">
            <svg class="search-close" width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M12 4L4 12M4 4L12 12" stroke="#1E1E1E" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
        </div>
        <div class="header-center">
          <div class="nav-item">
            <svg class="nav-icon" width="40" height="40" viewBox="0 0 40 40" fill="none">
              <path d="M15.15 15C15.5419 13.8861 16.3153 12.9469 17.3333 12.3486C18.3513 11.7503 19.5482 11.5316 20.712 11.7312C21.8758 11.9308 22.9314 12.5359 23.6918 13.4392C24.4522 14.3426 24.8684 15.4859 24.8667 16.6667C24.8667 20 19.8667 21.6667 19.8667 21.6667M20 28.3333H20.0167M36.6667 20C36.6667 29.2048 29.2048 36.6667 20 36.6667C10.7953 36.6667 3.33334 29.2048 3.33334 20C3.33334 10.7953 10.7953 3.33334 20 3.33334C29.2048 3.33334 36.6667 10.7953 36.6667 20Z" stroke="#F3F3F3" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span class="nav-text">Hỗ trợ</span>
          </div>
          <div class="nav-item">
            <svg class="nav-icon" width="40" height="40" viewBox="0 0 40 40" fill="none">
              <path d="M20 26.6667V20M20 13.3333H20.0167M36.6667 20C36.6667 29.2048 29.2047 36.6667 20 36.6667C10.7952 36.6667 3.33333 29.2048 3.33333 20C3.33333 10.7953 10.7952 3.33334 20 3.33334C29.2047 3.33334 36.6667 10.7953 36.6667 20Z" stroke="#F3F3F3" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span class="nav-text">Thông tin</span>
          </div>
        </div>
        <div class="header-right">
          ${headerRightContent}
        </div>
      </div>
    </header>

    <main class="main-content">
      <!-- Tournament Section (match dashboard.html) -->
      <section class="tournament-section">
        <div class="section-header">
          <h2 class="section-title">Các giải đấu đang diễn ra</h2>
        </div>
        <div class="tournament-carousel">
          <button class="carousel-btn prev-btn" data-carousel-prev="tournamentContainer">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <path d="M38 24H10M10 24L24 38M10 24L24 10" stroke="#F19EDC" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
          <div class="tournament-container" id="tournamentContainer">
            <div class="loading-placeholder">Đang tải giải đấu...</div>
          </div>
          <button class="carousel-btn next-btn" data-carousel-next="tournamentContainer">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <path d="M10 24H38M38 24L24 10M38 24L24 38" stroke="#F19EDC" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
        <div class="carousel-indicator">
          <div class="indicator-dots" data-carousel-dots="tournamentContainer">
            <div class="dot active"></div>
          </div>
        </div>
      </section>

      <!-- News Section (match dashboard.html) -->
      <section class="news-section">
        <div class="section-container">
          <div class="section-header">
            <h2 class="section-title">TIN TỨC MỚI NHẤT</h2>
          </div>
          <div class="news-carousel">
            <button class="carousel-btn prev-btn" data-carousel-prev="newsContainer">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <path d="M38 24H10M10 24L24 38M10 24L24 10" stroke="#F19EDC" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
            <div class="news-container" id="newsContainer">
              <div class="loading-placeholder">Đang tải tin tức...</div>
            </div>
            <button class="carousel-btn next-btn" data-carousel-next="newsContainer">
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <path d="M10 24H38M38 24L24 10M38 24L24 38" stroke="#F19EDC" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>
          <div class="carousel-indicator">
            <div class="indicator-dots" data-carousel-dots="newsContainer">
              <div class="dot active"></div>
            </div>
          </div>
        </div>
      </section>

      <!-- Highlights Section -->
      <section class="highlights-section">
        <div class="section-header">
          <h2 class="section-title">HIGHLIGHT NỔI BẬT</h2>
        </div>
        
        <div class="highlights-carousel">
          <button class="carousel-btn prev-btn" data-carousel-prev="highlightsContainer">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <path d="M38 24H10M10 24L24 38M10 24L24 10" stroke="#F19EDC" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
          <div class="highlights-container" id="highlightsContainer">
            <div class="loading-placeholder">Đang tải highlights...</div>
          </div>
          <button class="carousel-btn next-btn" data-carousel-next="highlightsContainer">
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
              <path d="M10 24H38M38 24L24 10M38 24L24 38" stroke="#F19EDC" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
        
        <div class="carousel-indicator">
          <div class="indicator-dots" data-carousel-dots="highlightsContainer">
            <div class="dot active"></div>
          </div>
        </div>
      </section>

      <!-- Call to Action Section -->
      <section class="cta-section">
        <div class="section-container">
          ${ctaContent}
        </div>
      </section>
    </main>

    <!-- Footer -->
    <footer class="main-footer">
      <div class="footer-container">
        <div class="footer-content">
          <div class="footer-section contact">
            <h3>Liên hệ với chúng tôi:</h3>
            <div class="social-links">
              <a href="#" class="social-link">
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                  <g clip-path="url(#clip0_14_1455)">
                    <path d="M45.08 12.84C44.8424 11.8908 44.3586 11.0211 43.6773 10.3188C42.996 9.61648 42.1415 9.10637 41.2 8.84C37.76 8 24 8 24 8C24 8 10.24 8 6.79998 8.92C5.85848 9.18637 5.00394 9.69648 4.32268 10.3988C3.64142 11.1011 3.15756 11.9708 2.91998 12.92C2.29041 16.4111 1.98246 19.9526 1.99998 23.5C1.97754 27.0741 2.28552 30.6426 2.91998 34.16C3.1819 35.0797 3.6766 35.9163 4.35627 36.589C5.03595 37.2616 5.87762 37.7476 6.79998 38C10.24 38.92 24 38.92 24 38.92C24 38.92 37.76 38.92 41.2 38C42.1415 37.7336 42.996 37.2235 43.6773 36.5212C44.3586 35.8189 44.8424 34.9492 45.08 34C45.7047 30.5352 46.0126 27.0207 46 23.5C46.0224 19.9259 45.7145 16.3574 45.08 12.84Z" stroke="#F5F5F5" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M19.5 30.04L31 23.5L19.5 16.96V30.04Z" stroke="#F5F5F5" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
                  </g>
                </svg>
              </a>
              <a href="#" class="social-link">
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                  <path d="M35 13H35.02M14 4H34C39.5228 4 44 8.47715 44 14V34C44 39.5228 39.5228 44 34 44H14C8.47715 44 4 39.5228 4 34V14C4 8.47715 8.47715 4 14 4ZM32 22.74C32.2468 24.4045 31.9625 26.1044 31.1875 27.598C30.4125 29.0916 29.1863 30.3028 27.6833 31.0593C26.1802 31.8159 24.4769 32.0792 22.8156 31.8119C21.1543 31.5445 19.6195 30.7602 18.4297 29.5703C17.2398 28.3805 16.4555 26.8457 16.1881 25.1844C15.9208 23.5231 16.1841 21.8198 16.9407 20.3167C17.6972 18.8137 18.9084 17.5875 20.402 16.8125C21.8956 16.0375 23.5955 15.7532 25.26 16C26.9578 16.2518 28.5297 17.0429 29.7434 18.2566C30.9571 19.4703 31.7482 21.0422 32 22.74Z" stroke="#F3F3F3" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </a>
              <a href="#" class="social-link">
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                  <path d="M36 4H30C27.3478 4 24.8043 5.05357 22.9289 6.92893C21.0536 8.8043 20 11.3478 20 14V20H14V28H20V44H28V28H34L36 20H28V14C28 13.4696 28.2107 12.9609 28.5858 12.5858C28.9609 12.2107 29.4696 12 30 12H36V4Z" stroke="#F5F5F5" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </a>
              <a href="#" class="social-link">
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                  <path d="M22 22V14M32 22V14M42 4H6V36H16V44L24 36H34L42 28V4Z" stroke="#F3F3F3" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </a>
            </div>
            <p class="contact-email">xxxxx@gmail.com</p>
          </div>
          <div class="footer-section info">
            <div class="info-item">
              <svg class="info-icon" width="40" height="40" viewBox="0 0 40 40" fill="none">
                <path d="M20 26.6667V20M20 13.3334H20.0167M36.6667 20C36.6667 29.2048 29.2047 36.6667 20 36.6667C10.7952 36.6667 3.33333 29.2048 3.33333 20C3.33333 10.7953 10.7952 3.33337 20 3.33337C29.2047 3.33337 36.6667 10.7953 36.6667 20Z" stroke="#F3F3F3" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <span>Thông tin sử dụng</span>
            </div>
            <div class="info-item">
              <svg class="info-icon" width="40" height="40" viewBox="0 0 40 40" fill="none">
                <path d="M20 26.6667V20M20 13.3334H20.0167M36.6667 20C36.6667 29.2048 29.2047 36.6667 20 36.6667C10.7952 36.6667 3.33333 29.2048 3.33333 20C3.33333 10.7953 10.7952 3.33337 20 3.33337C29.2047 3.33337 36.6667 10.7953 36.6667 20Z" stroke="#F3F3F3" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <span>Chính sách bảo mật</span>
            </div>
            <div class="info-item">
              <svg class="info-icon" width="40" height="40" viewBox="0 0 40 40" fill="none">
                <path d="M20 26.6667V20M20 13.3334H20.0167M36.6667 20C36.6667 29.2048 29.2047 36.6667 20 36.6667C10.7952 36.6667 3.33333 29.2048 3.33333 20C3.33333 10.7953 10.7952 3.33337 20 3.33337C29.2047 3.33337 36.6667 10.7953 36.6667 20Z" stroke="#F3F3F3" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <span>Điều khoản sử dụng</span>
            </div>
          </div>
          <div class="footer-section preview">
            <div class="footer-thumbnail"></div>
            <div class="footer-controls">
              <button class="footer-control-btn">
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                  <path d="M42 42L33.3 33.3M22 16V28M16 22H28M38 22C38 30.8366 30.8366 38 22 38C13.1634 38 6 30.8366 6 22C6 13.1634 13.1634 6 22 6C30.8366 6 38 13.1634 38 22Z" stroke="#F3F3F3" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
              <button class="footer-control-btn">
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                  <path d="M42 42L33.3 33.3M16 22H28M38 22C38 30.8366 30.8366 38 22 38C13.1634 38 6 30.8366 6 22C6 13.1634 13.1634 6 22 6C30.8366 6 38 13.1634 38 22Z" stroke="#F3F3F3" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
        <div class="footer-bottom">
          <p class="copyright">2025 All rights reserved</p>
        </div>
      </div>
    </footer>
  `;

  const guestController = window.guestController;

  // Gắn sự kiện nút login/register
  if (guestController) {
    document.getElementById('loginGuestBtn')?.addEventListener('click', () => guestController.navigateToLogin());
    document.getElementById('registerGuestBtn')?.addEventListener('click', () => guestController.navigateToRegister());
    document.getElementById('ctaLoginBtn')?.addEventListener('click', () => guestController.navigateToLogin());
    document.getElementById('ctaRegisterBtn')?.addEventListener('click', () => guestController.navigateToRegister());
  }

  // Giữ nguyên giao diện guest (không chuyển trang) để luôn hiển thị Login/Register

  loadTranslations('vi'); // Default to Vietnamese

  // Áp dụng lại dark mode nếu đang bật
  if (localStorage.getItem('darkMode') === 'true') {
    document.body.classList.add('dark-mode');
  } else {
    document.body.classList.remove('dark-mode');
  }

  // Load dynamic content
  await loadTournaments();
  await loadNews();
  await loadHighlights();
}

// Tournament carousel functionality
let currentTournamentPage = 0;
let tournaments = [];
const tournamentsPerPage = 3;

// Tải giải đấu từ backend (đang diễn ra, fallback sang sắp diễn ra)
async function loadTournaments() {
  await loadTournamentsCarousel('tournamentContainer', 3);
}

// News carousel functionality

// Tải tin tức từ backend
async function loadNews() {
  await loadNewsCarousel('newsContainer', 3);
}





// Tải highlight từ backend
async function loadHighlights() {
  await loadHighlightsCarousel('highlightsContainer', 1);
}
