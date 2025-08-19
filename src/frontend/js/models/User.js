class User {
    constructor({
        _id,
        email,
        fullName = '',
        avatarUrl = '',
        role = 'user'
    } = {}) {
        this._id = _id;
        this.email = email;
        this.fullName = fullName;
        this.avatarUrl = avatarUrl;
        this.role = role;
        this.favorites = [];
    }

    addFavorite(tournamentId) {
        this.favorites.push(tournamentId);
    }
}

export default User;
