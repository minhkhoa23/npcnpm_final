class Match {
    constructor({
        _id,
        tournamentId = null,
        teamAId = null,
        teamBId = null,
        scheduledAt = null,
        result = '',
        score = ''
    } = {}) {
        this._id = _id;
        this.tournamentId = tournamentId;
        this.teamAId = teamAId;
        this.teamBId = teamBId;
        this.scheduledAt = scheduledAt;
        this.result = result;
        this.score = score;
    }
}

export default Match;
