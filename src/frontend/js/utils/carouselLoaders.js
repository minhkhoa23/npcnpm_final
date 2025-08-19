import { apiCall, API_ENDPOINTS } from '../api.js';
import { createCarousel } from '../carousel.js';

/**
 * Load tournaments into a carousel container with consistent behavior.
 * - Tries ONGOING first, then falls back to UPCOMING
 * - Renders placeholder when empty
 * - Creates a carousel with specified itemsPerPage
 *
 * @param {string} containerId - DOM id of the carousel container
 * @param {number} itemsPerPage - Number of items per slide/page
 */
export async function loadTournamentsCarousel(containerId, itemsPerPage = 3) {
  const container = document.getElementById(containerId);
  if (!container) return;

  try {
    let res = await apiCall(API_ENDPOINTS.TOURNAMENTS.ONGOING, {}, 'GET');
    let tournaments = res?.data?.tournaments || [];

    if (!tournaments.length) {
      res = await apiCall(API_ENDPOINTS.TOURNAMENTS.UPCOMING, {}, 'GET');
      tournaments = res?.data?.tournaments || [];
    }

    if (!tournaments.length) {
      container.innerHTML = '<div class="loading-placeholder">Chưa có giải đấu</div>';
      return;
    }

    const carousel = createCarousel('tournament', containerId, { itemsPerPage });
    carousel.setItems(tournaments);
  } catch (e) {
    console.error('Error loading tournaments:', e);
    container.innerHTML = '<div class="loading-placeholder">Lỗi tải giải đấu</div>';
  }
}

/**
 * Load published news into a carousel container with consistent behavior.
 * - Uses /news/published
 * - Renders placeholder when empty
 * - Creates a carousel with specified itemsPerPage
 *
 * @param {string} containerId - DOM id of the carousel container
 * @param {number} itemsPerPage - Number of items per slide/page
 */
export async function loadNewsCarousel(containerId, itemsPerPage = 3) {
  const container = document.getElementById(containerId);
  if (!container) return;

  try {
    const res = await apiCall(API_ENDPOINTS.NEWS.PUBLISHED, {}, 'GET');
    const news = res?.data?.news || [];

    if (!news.length) {
      container.innerHTML = '<div class="loading-placeholder">Chưa có tin tức</div>';
      return;
    }

    const carousel = createCarousel('news', containerId, { itemsPerPage });
    carousel.setItems(news);
  } catch (e) {
    console.error('Error loading news:', e);
    container.innerHTML = '<div class="loading-placeholder">Lỗi tải tin tức</div>';
  }
}
// Highlight loader (match dashboard behavior)
export async function loadHighlightsCarousel(containerId, itemsPerPage = 1) {
  const container = document.getElementById(containerId);
  if (!container) return;

  try {
    const res = await apiCall(API_ENDPOINTS.HIGHLIGHTS.PUBLISHED, {}, 'GET');
    const highlights = res?.data?.highlights || [];

    if (!highlights.length) {
      container.innerHTML = '<div class="loading-placeholder">Chưa có highlights</div>';
      return;
    }

    const carousel = createCarousel('highlight', containerId, { itemsPerPage });
    carousel.setItems(highlights);
  } catch (e) {
    console.error('Error loading highlights:', e);
    container.innerHTML = '<div class="loading-placeholder">Lỗi tải highlights</div>';
  }
}