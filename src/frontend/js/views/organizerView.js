export function renderCreateTournament() {
    document.getElementById('content').innerHTML = `
        <h2>Create Tournament</h2>
        <input type="text" id="tournamentName" placeholder="Tournament Name">
        <select id="tournamentFormat">
            <option value="single">Single Elimination</option>
            <option value="double">Double Elimination</option>
            <option value="round-robin">Round Robin</option>
        </select>
        <button onclick="organizerController.createTournament()">Create</button>
    `;
}