class Competitor {
    constructor({
        _id,
        name,
        logoUrl = '',
        tournamentId = null
    } = {}) {
        this._id = _id;
        this.name = name;
        this.logoUrl = logoUrl;
        this.tournamentId = tournamentId;
    }
}

export default Competitor;
