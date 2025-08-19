const fs = require('fs');
const path = require('path');

class FallbackDataService {
  constructor() {
    this.dataDir = path.join(__dirname, '../data');
  }

  loadJSON(fileName) {
    try {
      const filePath = path.join(this.dataDir, fileName);
      const raw = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(raw);
    } catch (error) {
      console.error(`Error loading ${fileName}:`, error.message);
      return [];
    }
  }

  getTournaments() {
    return this.loadJSON('tournaments.json');
  }

  getNews() {
    return this.loadJSON('news.json');
  }

  getHighlights() {
    return this.loadJSON('highlights.json');
  }

  getCompetitors() {
    return this.loadJSON('competitors.json');
  }

  getUsers() {
    return this.loadJSON('users.json');
  }
}

module.exports = new FallbackDataService();
