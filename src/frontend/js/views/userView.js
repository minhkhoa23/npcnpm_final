export function renderSearch(results) {
    document.getElementById('content').innerHTML = `
        <h2>Search Results</h2>
        <div id="searchResults">${results.map(t => `<p>${t.name}</p>`).join('')}</div>
    `;
}

export function renderTournamentDetails(tournament) {
    document.getElementById('content').innerHTML = `
        <h2>${tournament.name}</h2>
        <p>Format: ${tournament.format}</p>
        <p>Teams: ${tournament.teams.map(t => t.name).join(', ')}</p>
    `;
}