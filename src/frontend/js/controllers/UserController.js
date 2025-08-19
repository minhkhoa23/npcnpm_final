import User from '../models/User.js';
import { renderSearch, renderTournamentDetails } from '../views/userView.js';
import { apiCall, API_ENDPOINTS } from '../api.js';

class UserController {
    constructor() {
        this.currentUser = null;
    }

    async searchTournaments(query) {
        const data = await apiCall(API_ENDPOINTS.TOURNAMENTS.SEARCH + `?q=${encodeURIComponent(query)}`, {}, 'GET');
        renderSearch(data);
    }

    async login(email) {
        const data = await apiCall(API_ENDPOINTS.AUTH.LOGIN, { email }, 'POST');
        this.currentUser = new User({
            _id: data.id,
            email,
            fullName: data.name,
            role: data.role
        });
        // Redirect to index.html after login
        window.location.href = 'index.html';
        renderTournamentDetails(await apiCall(API_ENDPOINTS.TOURNAMENTS.BY_ID('1'), {}, 'GET'));
    }
}

export const userController = new UserController();