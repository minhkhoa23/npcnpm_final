export function renderStats(stats) {
    document.getElementById('content').innerHTML = `
        <h2>Statistics</h2>
        <p>Wins: ${stats.wins}, Losses: ${stats.losses}, Draws: ${stats.draws}</p>
    `;
}