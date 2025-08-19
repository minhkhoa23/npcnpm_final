class Tournament {
    constructor({
        _id,
        name,
        format,
        description = '',
        organizerId = null,
        teams = [],
        avatarUrl = '',
        gameName = '',
        numberOfPlayers = 0,
        maxPlayers = 0,
        startDate = null,
        endDate = null,
        status = ''
    } = {}) {
        this._id = _id;
        this.name = name;
        this.format = format;
        this.description = description;
        this.organizerId = organizerId;
        this.teams = teams;
        this.avatarUrl = avatarUrl;
        this.gameName = gameName;
        this.numberOfPlayers = numberOfPlayers;
        this.maxPlayers = maxPlayers;
        this.startDate = startDate;
        this.endDate = endDate;
        this.status = status;
    }
}

export default Tournament;
