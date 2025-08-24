import { renderStats } from '../views/adminView.js';
import { apiCall, API_ENDPOINTS } from '../hybrid-api.js';

class AdminController {
    async getStats() {
        const stats = await apiCall(API_ENDPOINTS.ADMIN.STATS, {}, 'GET', true);
        renderStats(stats);
    }
}

export const adminController = new AdminController();
