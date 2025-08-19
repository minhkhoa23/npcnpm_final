import { loadTranslations } from '../lang.js';
import { apiCall, API_ENDPOINTS } from '../api.js';

export async function renderOrganizerView() {
  document.body.innerHTML = `
    <!-- Header -->
    <header class="header">
        <div class="header-container">
            <div class="header-left">
                <button class="menu-button">
                    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                        <path d="M5 20H35M5 10H35M5 30H35" stroke="#F3F3F3" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </button>
                <button class="home-button" data-home-nav>
                    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                        <path d="M15 36.6667V20H25V36.6667M5 15L20 3.33333L35 15V33.3333C35 34.2174 34.6488 35.0652 34.0237 35.6904C33.3986 36.3155 32.5507 36.6667 31.6667 36.6667H8.33333C7.44928 36.6667 6.60143 36.3155 5.97631 35.6904C5.35119 35.0652 5 34.2174 5 33.3333V15Z" stroke="#F5F5F5" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </button>
                <span class="nav-text">Trang chủ</span>
            </div>
            
            <div class="header-center">
                <div class="search-container">
                    <input type="text" placeholder="Tìm kiếm" class="search-input">
                    <button class="search-clear">
                        <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                            <path d="M12 4L4 12M4 4L12 12" stroke="#1E1E1E" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </button>
                </div>
            </div>
            
            <div class="header-right">
                <button class="support-button">
                    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                        <path d="M15.1502 15C15.542 13.8863 16.3154 12.947 17.3334 12.3487C18.3514 11.7504 19.5483 11.5317 20.7121 11.7313C21.8759 11.931 22.9315 12.536 23.692 13.4394C24.4524 14.3427 24.8686 15.486 24.8668 16.6668C24.8668 20.0002 19.8668 21.6668 19.8668 21.6668M20.0002 28.3335H20.0168M36.6668 20.0002C36.6668 29.2049 29.2049 36.6668 20.0002 36.6668C10.7954 36.6668 3.3335 29.2049 3.3335 20.0002C3.3335 10.7954 10.7954 3.3335 20.0002 3.3335C29.2049 3.3335 36.6668 10.7954 36.6668 20.0002Z" stroke="#F3F3F3" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </button>
                <span class="nav-text">Hỗ trợ</span>
                
                <button class="info-button">
                    <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
                        <path d="M20.0002 26.6668V20.0002M20.0002 13.3335H20.0168M36.6668 20.0002C36.6668 29.2049 29.2049 36.6668 20.0002 36.6668C10.7954 36.6668 3.3335 29.2049 3.3335 20.0002C3.3335 10.7954 10.7954 3.3335 20.0002 3.3335C29.2049 3.3335 36.6668 10.7954 36.6668 20.0002Z" stroke="#F3F3F3" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </button>
                <span class="nav-text">Thông tin</span>
                
                <button class="notification-button">
                    <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                        <path d="M27.46 42C27.1084 42.6062 26.6037 43.1093 25.9965 43.4591C25.3892 43.8088 24.7008 43.9929 24 43.9929C23.2992 43.9929 22.6108 43.8088 22.0035 43.4591C21.3963 43.1093 20.8916 42.6062 20.54 42M36 16C36 12.8174 34.7357 9.76516 32.4853 7.51472C30.2348 5.26428 27.1826 4 24 4C20.8174 4 17.7652 5.26428 15.5147 7.51472C13.2643 9.76516 12 12.8174 12 16C12 30 6 34 6 34H42C42 34 36 30 36 16Z" stroke="#F3F3F3" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </button>
                
                <div class="user-avatar">
                    <img src="https://api.builder.io/api/v1/image/assets/TEMP/2791d338714d3870b4bb42ac5a5390446faac948?width=80" alt="User Avatar">
                    <div class="user-dropdown" id="userDropdown">
                      <a href="#" id="profileLink">Hồ sơ</a>
                      <a href="#" id="settingsLink">Cài đặt</a>
                      <a href="#" id="logoutBtn">Đăng xuất</a>
                    </div>
                </div>
            </div>
        </div>
    </header>

    <!-- Main Content -->
    <main class="main-content">
        <!-- Tournament Management Section -->
        <section class="tournaments-section">
            <div class="section-header">
                <h2>Các giải đấu của bạn</h2>
                <div class="section-controls">
                    <button class="view-list-btn">
                        Xem danh sách giải đấu của bạn
                    </button>
                    <button class="create-tournament-btn">
                        Khởi tạo giải đấu mới của bạn
                    </button>
                </div>
            </div>
            <div class="tournaments-carousel">
                <button class="carousel-btn prev" id="tournaments-prev">
                    <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                        <path d="M38 24H10M10 24L24 38M10 24L24 10" stroke="#F19EDC" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </button>
                <div class="tournaments-grid" id="tournaments-grid">
                    <div class="loading-placeholder">Đang tải giải đấu của bạn...</div>
                </div>
                <button class="carousel-btn next" id="tournaments-next">
                    <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                        <path d="M10 24H38M38 24L24 10M38 24L24 38" stroke="#F19EDC" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </button>
            </div>
        </section>

        <!-- News Management Section -->
        <section class="news-section">
            <div class="section-header">
                <h2>Cập nhật tin tức giải đấu của bạn</h2>
                <div class="section-controls">
                    <button class="manage-news-btn">Quản lý tin tức của bạn</button>
                    <button class="add-news-btn">Thêm tin tức mới</button>
                </div>
            </div>
            <div class="news-carousel">
                <button class="carousel-btn prev" id="news-prev">
                    <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                        <path d="M38 24H10M10 24L24 38M10 24L24 10" stroke="#F19EDC" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </button>
                <div class="news-grid" id="news-grid">
                    <div class="loading-placeholder">Đang tải tin tức của bạn...</div>
                </div>
                <button class="carousel-btn next" id="news-next">
                    <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                        <path d="M10 24H38M38 24L24 10M38 24L24 38" stroke="#F19EDC" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </button>
            </div>
        </section>

        <!-- Highlights Management Section -->
        <section class="highlights-section">
            <div class="section-header">
                <h2>Quản lý HIGHLIGHT</h2>
                <div class="section-controls">
                    <button class="manage-highlights-btn">Quản lý highlight của bạn</button>
                    <button class="create-highlights-btn">Tạo highlight mới của bạn</button>
                </div>
            </div>
            <div class="highlights-carousel">
                <button class="carousel-btn prev" id="highlights-prev">
                    <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                        <path d="M38 24H10M10 24L24 38M10 24L24 10" stroke="#F19EDC" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </button>
                <div class="highlights-grid" id="highlights-grid">
                    <div class="loading-placeholder">Đang tải highlights của bạn...</div>
                </div>
                <button class="carousel-btn next" id="highlights-next">
                    <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                        <path d="M10 24H38M38 24L24 10M38 24L24 38" stroke="#F19EDC" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </button>
            </div>
        </section>

        <!-- Organizers Following Section -->
        <section class="organizers-section">
            <div class="section-header">
                <h2>Theo dõi các giải đấu để nhận thông báo mới nhất từ các nhà tổ chức hàng đầu</h2>
            </div>
            <div class="organizers-grid">
                <div class="organizer-card">
                    <div class="organizer-image">
                        <img src="https://api.builder.io/api/v1/image/assets/TEMP/ddb1cc92770c71e345f46a5daa69ebcf884a6526?width=446" alt="Organizer 1">
                    </div>
                    <div class="organizer-info">
                        <h3>ESL Gaming</h3>
                        <p>Nhà tổ chức hàng đầu</p>
                    </div>
                    <button class="follow-btn">theo dõi</button>
                </div>
                <div class="organizer-card">
                    <div class="organizer-image">
                        <img src="https://api.builder.io/api/v1/image/assets/TEMP/ddb1cc92770c71e345f46a5daa69ebcf884a6526?width=446" alt="Organizer 2">
                    </div>
                    <div class="organizer-info">
                        <h3>Riot Games</h3>
                        <p>Chuyên nghiệp</p>
                    </div>
                    <button class="follow-btn">theo dõi</button>
                </div>
                <div class="organizer-card">
                    <div class="organizer-image">
                        <img src="https://api.builder.io/api/v1/image/assets/TEMP/ddb1cc92770c71e345f46a5daa69ebcf884a6526?width=446" alt="Organizer 3">
                    </div>
                    <div class="organizer-info">
                        <h3>DreamHack</h3>
                        <p>Sự kiện lớn</p>
                    </div>
                    <button class="follow-btn">theo dõi</button>
                </div>
                <div class="organizer-card">
                    <div class="organizer-image">
                        <img src="https://api.builder.io/api/v1/image/assets/TEMP/ddb1cc92770c71e345f46a5daa69ebcf884a6526?width=446" alt="Organizer 4">
                    </div>
                    <div class="organizer-info">
                        <h3>MLG Events</h3>
                        <p>Kinh nghiệm lâu năm</p>
                    </div>
                    <button class="follow-btn">theo dõi</button>
                </div>
            </div>
        </section>
    </main>

    <!-- Footer -->
    <footer class="footer">
        <div class="footer-container">
            <div class="footer-section">
                <h4>Liên hệ với chúng tôi:</h4>
                <div class="social-icons">
                    <a href="#" class="social-icon">
                        <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                            <path d="M45.0802 12.84C44.8426 11.8908 44.3587 11.0211 43.6775 10.3188C42.9962 9.61648 42.1417 9.10637 41.2002 8.84C37.7602 8 24.0002 8 24.0002 8C24.0002 8 10.2402 8 6.80017 8.92C5.85866 9.18637 5.00412 9.69648 4.32286 10.3988C3.6416 11.1011 3.15774 11.9708 2.92017 12.92C2.2906 16.4111 1.98264 19.9526 2.00017 23.5C1.97773 27.0741 2.2857 30.6426 2.92017 34.16C3.18209 35.0797 3.67678 35.9163 4.35645 36.589C5.03613 37.2616 5.87781 37.7476 6.80017 38C10.2402 38.92 24.0002 38.92 24.0002 38.92C24.0002 38.92 37.7602 38.92 41.2002 38C42.1417 37.7336 42.9962 37.2235 43.6775 36.5212C44.3587 35.8189 44.8426 34.9492 45.0802 34C45.7049 30.5352 46.0128 27.0207 46.0002 23.5C46.0226 19.9259 45.7146 16.3574 45.0802 12.84Z" stroke="#F5F5F5" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
                            <path d="M19.5002 30.04L31.0002 23.5L19.5002 16.96V30.04Z" stroke="#F5F5F5" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </a>
                    <a href="#" class="social-icon">
                        <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                            <path d="M35 13H35.02M14 4H34C39.5228 4 44 8.47715 44 14V34C44 39.5228 39.5228 44 34 44H14C8.47715 44 4 39.5228 4 34V14C4 8.47715 8.47715 4 14 4ZM32 22.74C32.2468 24.4045 31.9625 26.1044 31.1875 27.598C30.4125 29.0916 29.1863 30.3028 27.6833 31.0593C26.1802 31.8159 24.4769 32.0792 22.8156 31.8119C21.1543 31.5445 19.6195 30.7602 18.4297 29.5703C17.2398 28.3805 16.4555 26.8457 16.1881 25.1844C15.9208 23.5231 16.1841 21.8198 16.9407 20.3167C17.6972 18.8137 18.9084 17.5875 20.402 16.8125C21.8956 16.0375 23.5955 15.7532 25.26 16C26.9578 16.2518 28.5297 17.0429 29.7434 18.2566C30.9571 19.4703 31.7482 21.0422 32 22.74Z" stroke="#F3F3F3" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </a>
                    <a href="#" class="social-icon">
                        <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                            <path d="M36 4H30C27.3478 4 24.8043 5.05357 22.9289 6.92893C21.0536 8.8043 20 11.3478 20 14V20H14V28H20V44H28V28H34L36 20H28V14C28 13.4696 28.2107 12.9609 28.5858 12.5858C28.9609 12.2107 29.4696 12 30 12H36V4Z" stroke="#F5F5F5" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </a>
                    <a href="#" class="social-icon">
                        <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                            <path d="M22 22V14M32 22V14M42 4H6V36H16V44L24 36H34L42 28V4Z" stroke="#F3F3F3" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
                        </svg>
                    </a>
                </div>
                <p>xxxxx@gmail.com</p>
            </div>
            
            <div class="footer-section">
                <div class="footer-links">
                    <a href="#"><span class="icon">ℹ</span> Thông tin ứng dụng</a>
                    <a href="#"><span class="icon">🔒</span> Chính sách bảo mật</a>
                    <a href="#"><span class="icon">📋</span> Điều khoản sử dụng</a>
                </div>
            </div>
            
            <div class="footer-section">
                <div class="footer-image">
                    <img src="https://api.builder.io/api/v1/image/assets/TEMP/96f039df3e0ce9f4672f91e5a2c6829e29770051?width=560" alt="Footer Image">
                </div>
            </div>
        </div>
        
        <div class="footer-bottom">
            <p>2025 All rights reserved</p>
        </div>
    </footer>
  `;

  // Setup event listeners for organizer dashboard
  setupOrganizerViewEvents();
  
  // Load language and theme
  loadTranslations('vi');
  applyTheme();
  
  // Load dynamic content
  await loadOrganizerContent();
}

function setupOrganizerViewEvents() {
  // Setup home navigation
  const homeButton = document.querySelector('.home-button[data-home-nav]');
  if (homeButton) {
    homeButton.addEventListener('click', () => {
      if (window.router) {
        window.router.navigateToHome();
      }
    });
  }

  // Setup user dropdown
  const userAvatar = document.querySelector('.user-avatar');
  const userDropdown = document.getElementById('userDropdown');
  
  if (userAvatar && userDropdown) {
    userAvatar.addEventListener('click', (e) => {
      e.stopPropagation();
      userDropdown.classList.toggle('active');
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', () => {
      userDropdown.classList.remove('active');
    });
  }

  // Setup logout
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      if (window.authController) {
        window.authController.logout();
      }
    });
  }

  // Tournament management buttons
  const createTournamentBtn = document.querySelector('.create-tournament-btn');
  if (createTournamentBtn) {
    createTournamentBtn.addEventListener('click', () => {
      if (window.router) {
        window.router.navigate('/create-tournament-1');
      } else {
        window.location.href = 'create-tournament-1.html';
      }
    });
  }

  const viewListBtn = document.querySelector('.view-list-btn');
  if (viewListBtn) {
    viewListBtn.addEventListener('click', () => {
      if (window.router) {
        window.router.navigate('/tournament-management');
      } else {
        window.location.href = 'tournament-management.html';
      }
    });
  }

  // News management buttons
  const manageNewsBtn = document.querySelector('.manage-news-btn');
  if (manageNewsBtn) {
    manageNewsBtn.addEventListener('click', () => {
      if (window.router) {
        window.router.navigate('/news-management');
      } else {
        window.location.href = 'news-management.html';
      }
    });
  }

  const addNewsBtn = document.querySelector('.add-news-btn');
  if (addNewsBtn) {
    addNewsBtn.addEventListener('click', () => {
      if (window.router) {
        window.router.navigate('/create-news');
      } else {
        window.location.href = 'create-news.html';
      }
    });
  }

  // Highlights management buttons
  const manageHighlightsBtn = document.querySelector('.manage-highlights-btn');
  if (manageHighlightsBtn) {
    manageHighlightsBtn.addEventListener('click', () => {
      if (window.router) {
        window.router.navigate('/highlight-management');
      } else {
        window.location.href = 'highlight-management.html';
      }
    });
  }

  const createHighlightsBtn = document.querySelector('.create-highlights-btn');
  if (createHighlightsBtn) {
    createHighlightsBtn.addEventListener('click', () => {
      if (window.router) {
        window.router.navigate('/create-highlight');
      } else {
        window.location.href = 'create-highlight.html';
      }
    });
  }

  // Follow button functionality
  document.querySelectorAll('.follow-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      if (this.textContent === 'theo dõi') {
        this.textContent = 'đã theo dõi';
        this.classList.add('following');
      } else {
        this.textContent = 'theo dõi';
        this.classList.remove('following');
      }
    });
  });

  // Initialize carousel functionality
  initializeCarousels();
}

function initializeCarousels() {
  // Tournament carousel
  setupCarousel('tournaments');
  // News carousel  
  setupCarousel('news');
  // Highlights carousel
  setupCarousel('highlights');
}

function setupCarousel(type) {
  const prevBtn = document.getElementById(`${type}-prev`);
  const nextBtn = document.getElementById(`${type}-next`);
  const grid = document.getElementById(`${type}-grid`);
  
  if (!grid) return;
  
  let currentIndex = 0;
  const itemsPerView = getItemsPerView();
  
  function updateCarousel() {
    const totalItems = grid.children.length;
    const maxIndex = Math.max(0, totalItems - itemsPerView);
    
    const translateX = -(currentIndex * (100 / itemsPerView));
    grid.style.transform = `translateX(${translateX}%)`;
    
    // Update button states
    if (prevBtn) prevBtn.disabled = currentIndex === 0;
    if (nextBtn) nextBtn.disabled = currentIndex >= maxIndex;
  }

  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      if (currentIndex > 0) {
        currentIndex--;
        updateCarousel();
      }
    });
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      const totalItems = grid.children.length;
      const itemsPerView = getItemsPerView();
      const maxIndex = Math.max(0, totalItems - itemsPerView);
      
      if (currentIndex < maxIndex) {
        currentIndex++;
        updateCarousel();
      }
    });
  }

  // Initial update
  updateCarousel();
  
  // Update on window resize
  window.addEventListener('resize', updateCarousel);
}

function getItemsPerView() {
  if (window.innerWidth <= 768) return 1;
  if (window.innerWidth <= 1024) return 2;
  return 3;
}

async function loadOrganizerContent() {
  try {
    // Get current user
    const user = await getCurrentUser();
    if (!user) {
      console.error('No user found for organizer content');
      return;
    }

    // Load organizer-specific content
    await Promise.all([
      loadOrganizerTournaments(user.id),
      loadOrganizerNews(user.id),
      loadOrganizerHighlights(user.id)
    ]);
  } catch (error) {
    console.error('Error loading organizer content:', error);
    // Show fallback content if loading fails
    showFallbackContent();
  }
}

async function getCurrentUser() {
  try {
    // First try to get from auth controller
    if (window.authController && window.authController.getCurrentUser) {
      const user = window.authController.getCurrentUser();
      if (user) return user;
    }
    
    // If not available, fetch from API
    const result = await apiCall(API_ENDPOINTS.AUTH.PROFILE, {}, 'GET', true);
    if (result.success) {
      return result.user;
    }
  } catch (error) {
    console.error('Error getting current user:', error);
  }
  return null;
}

async function loadOrganizerTournaments(organizerId) {
  const container = document.getElementById('tournaments-grid');
  if (!container) return;

  try {
    const result = await apiCall(`${API_ENDPOINTS.TOURNAMENTS.BASE}/organizer/${organizerId}`, {}, 'GET', true);
    if (result.success && result.data) {
      renderOrganizerTournaments(result.data.tournaments || []);
    } else {
      throw new Error('Failed to load tournaments');
    }
  } catch (error) {
    console.error('Error loading organizer tournaments:', error);
    container.innerHTML = '<div class="error-placeholder">Lỗi tải giải đấu. <button onclick="window.location.reload()">Thử lại</button></div>';
  }
}

async function loadOrganizerNews(organizerId) {
  const container = document.getElementById('news-grid');
  if (!container) return;

  try {
    const result = await apiCall(`${API_ENDPOINTS.NEWS.BASE}/organizer/${organizerId}`, {}, 'GET', true);
    if (result.success && result.data) {
      renderOrganizerNews(result.data.news || []);
    } else {
      throw new Error('Failed to load news');
    }
  } catch (error) {
    console.error('Error loading organizer news:', error);
    container.innerHTML = '<div class="error-placeholder">Lỗi tải tin tức. <button onclick="window.location.reload()">Thử lại</button></div>';
  }
}

async function loadOrganizerHighlights(organizerId) {
  const container = document.getElementById('highlights-grid');
  if (!container) return;

  try {
    const result = await apiCall(`${API_ENDPOINTS.HIGHLIGHTS.BASE}/organizer/${organizerId}`, {}, 'GET', true);
    if (result.success && result.data) {
      renderOrganizerHighlights(result.data.highlights || []);
    } else {
      throw new Error('Failed to load highlights');
    }
  } catch (error) {
    console.error('Error loading organizer highlights:', error);
    container.innerHTML = '<div class="error-placeholder">Lỗi tải highlights. <button onclick="window.location.reload()">Thử lại</button></div>';
  }
}

function renderOrganizerTournaments(tournaments) {
  const container = document.getElementById('tournaments-grid');
  if (!container) return;

  if (tournaments.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <h3>Bạn chưa tạo giải đấu nào</h3>
        <p>Hãy bắt đầu tạo giải đấu đầu tiên của bạn!</p>
        <button class="empty-action-btn" onclick="window.location.href='create-tournament-1.html'">
          Tạo giải đấu ngay
        </button>
      </div>
    `;
    return;
  }

  container.innerHTML = tournaments.map(tournament => `
    <div class="tournament-card" onclick="window.location.href='tournament-detail.html?id=${tournament.id}'">
      <div class="tournament-image">
        <img src="${tournament.image || 'https://via.placeholder.com/364x200'}" alt="${tournament.name}">
      </div>
      <div class="tournament-info">
        <h3>${tournament.name}</h3>
        <p>${getStatusLabel(tournament.status)}</p>
      </div>
    </div>
  `).join('');
}

function renderOrganizerNews(news) {
  const container = document.getElementById('news-grid');
  if (!container) return;

  if (news.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <h3>Bạn chưa tạo tin tức nào</h3>
        <p>Chia sẻ tin tức về giải đấu của bạn!</p>
        <button class="empty-action-btn" onclick="window.location.href='create-news.html'">
          Tạo tin tức ngay
        </button>
      </div>
    `;
    return;
  }

  container.innerHTML = news.map(newsItem => `
    <div class="news-card" onclick="window.location.href='view-news.html?id=${newsItem.id}'">
      <div class="news-image">
        <img src="${newsItem.image || 'https://via.placeholder.com/446x200'}" alt="${newsItem.title}">
      </div>
      <div class="news-info">
        <h3>${newsItem.title}</h3>
        <p>${new Date(newsItem.publishedAt || newsItem.createdAt).toLocaleDateString('vi-VN')}</p>
      </div>
    </div>
  `).join('');
}

function renderOrganizerHighlights(highlights) {
  const container = document.getElementById('highlights-grid');
  if (!container) return;

  if (highlights.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <h3>Bạn chưa tạo highlight nào</h3>
        <p>Tạo những khoảnh khắc đặc biệt từ giải đấu!</p>
        <button class="empty-action-btn" onclick="window.location.href='create-highlight.html'">
          Tạo highlight ngay
        </button>
      </div>
    `;
    return;
  }

  container.innerHTML = highlights.map(highlight => `
    <div class="highlight-card">
      <div class="highlight-image">
        <img src="${highlight.thumbnail || 'https://via.placeholder.com/446x200'}" alt="${highlight.title}">
        <div class="play-button">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M8 5v14l11-7z" fill="#fff"/>
          </svg>
        </div>
      </div>
      <div class="highlight-info">
        <h3>${highlight.title}</h3>
        <p>${highlight.duration || '0:00'}</p>
      </div>
    </div>
  `).join('');
}

function getStatusLabel(status) {
  const labels = {
    'upcoming': 'Sắp diễn ra',
    'ongoing': 'Đang diễn ra',
    'completed': 'Đã kết thúc',
    'cancelled': 'Đã hủy'
  };
  return labels[status] || status;
}

function showFallbackContent() {
  // Show static content as fallback
  const tournamentsGrid = document.getElementById('tournaments-grid');
  const newsGrid = document.getElementById('news-grid');
  const highlightsGrid = document.getElementById('highlights-grid');

  if (tournamentsGrid) {
    tournamentsGrid.innerHTML = `
      <div class="fallback-message">
        <p>Không thể tải dữ liệu. Vui lòng thử lại sau.</p>
        <button onclick="window.location.reload()">Tải lại</button>
      </div>
    `;
  }

  if (newsGrid) {
    newsGrid.innerHTML = `
      <div class="fallback-message">
        <p>Không thể tải tin tức. Vui lòng thử lại sau.</p>
        <button onclick="window.location.reload()">Tải lại</button>
      </div>
    `;
  }

  if (highlightsGrid) {
    highlightsGrid.innerHTML = `
      <div class="fallback-message">
        <p>Không thể tải highlights. Vui lòng thử lại sau.</p>
        <button onclick="window.location.reload()">Tải lại</button>
      </div>
    `;
  }
}

function applyTheme() {
  // Apply dark mode if saved
  if (localStorage.getItem('darkMode') === 'true') {
    document.body.classList.add('dark-mode');
  } else {
    document.body.classList.remove('dark-mode');
  }
}
