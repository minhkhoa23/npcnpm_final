class Highlight {
    constructor({
        _id,
        tournamentId = null,
        matchId = null,
        title = '',
        videoUrl = '',
        description = '',
        status = 'public',
        createdAt = new Date()
    } = {}) {
        this._id = _id;
        this.tournamentId = tournamentId;
        this.matchId = matchId;
        this.title = title;
        this.videoUrl = videoUrl;
        this.description = description;
        this.status = status;
        this.createdAt = createdAt;
    }
}

export default Highlight;
