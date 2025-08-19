// Carousel functionality
export class Carousel {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    this.currentPage = 0;
    this.items = [];
    this.itemsPerPage = options.itemsPerPage || 3;
    this.onItemClick = options.onItemClick || null;
    
    if (!this.container) {
      console.error(`Container with id "${containerId}" not found`);
      return;
    }
  }

  setItems(items) {
    this.items = items;
    this.currentPage = 0;
    this.displayPage(0);
    this.updateNavigation();
  }

  displayPage(page) {
    if (!this.container) return;
    
    const startIndex = page * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    const itemsToShow = this.items.slice(startIndex, endIndex);

    if (itemsToShow.length === 0) return;

    // Fade out effect
    this.container.style.opacity = '0';
    
    setTimeout(() => {
      this.container.innerHTML = itemsToShow.map(item => this.renderItem(item)).join('');
      this.container.style.opacity = '1';
      this.updateNavigation();
    }, 150);
  }

  renderItem(item) {
    // This should be overridden by subclasses
    return `<div class="carousel-item">${JSON.stringify(item)}</div>`;
  }

  next() {
    const maxPage = Math.ceil(this.items.length / this.itemsPerPage) - 1;
    if (this.currentPage < maxPage) {
      this.currentPage++;
      this.displayPage(this.currentPage);
    }
  }

  prev() {
    if (this.currentPage > 0) {
      this.currentPage--;
      this.displayPage(this.currentPage);
    }
  }

  goToPage(page) {
    const maxPage = Math.ceil(this.items.length / this.itemsPerPage) - 1;
    if (page >= 0 && page <= maxPage) {
      this.currentPage = page;
      this.displayPage(this.currentPage);
    }
  }

  updateNavigation() {
    const maxPage = Math.ceil(this.items.length / this.itemsPerPage) - 1;
    
    // Update prev button
    const prevBtn = document.querySelector(`[data-carousel-prev="${this.container.id}"]`);
    if (prevBtn) {
      prevBtn.style.opacity = this.currentPage > 0 ? '1' : '0.5';
      prevBtn.style.pointerEvents = this.currentPage > 0 ? 'auto' : 'none';
    }

    // Update next button
    const nextBtn = document.querySelector(`[data-carousel-next="${this.container.id}"]`);
    if (nextBtn) {
      nextBtn.style.opacity = this.currentPage < maxPage ? '1' : '0.5';
      nextBtn.style.pointerEvents = this.currentPage < maxPage ? 'auto' : 'none';
    }

    // Update dots
    this.updateDots();
  }

  updateDots() {
    const dotsContainer = document.querySelector(`[data-carousel-dots="${this.container.id}"]`);
    if (!dotsContainer) return;

    const maxPage = Math.ceil(this.items.length / this.itemsPerPage) - 1;
    dotsContainer.innerHTML = '';
    
    for (let i = 0; i <= maxPage; i++) {
      const dot = document.createElement('div');
      dot.className = `dot ${i === this.currentPage ? 'active' : ''}`;
      dot.addEventListener('click', () => this.goToPage(i));
      dotsContainer.appendChild(dot);
    }
  }

  setupNavigation() {
    // Setup prev button
    const prevBtn = document.querySelector(`[data-carousel-prev="${this.container.id}"]`);
    if (prevBtn) {
      prevBtn.addEventListener('click', () => this.prev());
    }

    // Setup next button
    const nextBtn = document.querySelector(`[data-carousel-next="${this.container.id}"]`);
    if (nextBtn) {
      nextBtn.addEventListener('click', () => this.next());
    }
  }
}

// Tournament Carousel
export class TournamentCarousel extends Carousel {
  constructor(containerId, options = {}) {
    super(containerId, options);
  }

  renderItem(tournament) {
    return `
      <div class="tournament-card" data-tournament-id="${tournament._id}" onclick="window.location.href='/src/frontend/tournament-detail.html?id=${tournament._id}'">
        <div class="tournament-image" style="background-image: url('${tournament.avatarUrl || ''}')"></div>
        <div class="tournament-info">
          <h3 class="tournament-name">${tournament.name}</h3>
          <p class="tournament-description">${tournament.description || ''}</p>
          <div class="tournament-meta">
            <span class="tournament-status status-${tournament.status}">${tournament.status}</span>
            <span class="tournament-format">${tournament.format || ''}</span>
          </div>
        </div>
      </div>
    `;
  }
}

// News Carousel
export class NewsCarousel extends Carousel {
  constructor(containerId, options = {}) {
    super(containerId, options);
  }

  renderItem(news) {
    return `
      <div class="news-card" data-news-id="${news._id}" onclick="window.location.href='/src/frontend/view-news.html?id=${news._id}'">
        <div class="news-image" style="background-image: url('${(news.images && news.images[0]) || ''}')"></div>
        <div class="news-content">
          <h4 class="news-title">${news.title}</h4>
          <p class="news-excerpt">${(news.content || '').substring(0, 100)}...</p>
          <div class="news-meta">
            <span class="news-date">${news.publishedAt ? new Date(news.publishedAt).toLocaleDateString('vi-VN') : ''}</span>
          </div>
        </div>
      </div>
    `;
  }
}

// Highlight Carousel
export class HighlightCarousel extends Carousel {
  constructor(containerId, options = {}) {
    super(containerId, options);
  }

  renderItem(highlight) {
    return `
      <div class="highlight-card" data-highlight-id="${highlight._id}" onclick="window.location.href='/src/frontend/view-highlight.html?id=${highlight._id}'">
        <div class="highlight-thumbnail" style="background-image: url('${highlight.thumbnailUrl || ''}')"></div>
        <div class="highlight-info">
          <h5 class="highlight-title">${highlight.title}</h5>
          <p class="highlight-description">${highlight.description || ''}</p>
          ${highlight.videoUrl ? `<a href="${highlight.videoUrl}" target="_blank" class="watch-btn" onclick="event.stopPropagation()">Xem video</a>` : ''}
        </div>
      </div>
    `;
  }
}

// Utility function to create carousel instances
export function createCarousel(type, containerId, options = {}) {
  let carousel;
  
  switch (type) {
    case 'tournament':
      carousel = new TournamentCarousel(containerId, options);
      break;
    case 'news':
      carousel = new NewsCarousel(containerId, options);
      break;
    case 'highlight':
      carousel = new HighlightCarousel(containerId, options);
      break;
    default:
      carousel = new Carousel(containerId, options);
  }

  carousel.setupNavigation();
  return carousel;
}